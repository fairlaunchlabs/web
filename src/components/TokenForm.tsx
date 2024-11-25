import React, { useState, useRef } from 'react';
import axios from 'axios';
import { createTokenOnChain, connectWallet } from '../utils/web3';
import { TokenMetadata } from '../types/types';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { BN } from '@coral-xyz/anchor';

interface TokenFormProps {
    onSubmit?: (data: TokenFormData) => void;
}

export interface TokenFormData {
    name: string;
    symbol: string;
    imageUrl: string;
    imageCid: string;
    description: string;
}

// Pinata API configuration
const PINATA_API_KEY = process.env.REACT_APP_PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.REACT_APP_PINATA_API_SECRET;
const PINATA_API_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

export const TokenForm: React.FC<TokenFormProps> = ({ onSubmit }) => {
    const wallet = useAnchorWallet();
    const [name, setName] = useState('');
    const [symbol, setSymbol] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [imageCid, setImageCid] = useState('');
    const [description, setDescription] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [decimals, setDecimals] = useState(9);

    // 高级设置状态
    const [targetEras, setTargetEras] = useState('1');
    const [epochesPerEra, setEpochesPerEra] = useState('10');
    const [targetSecondsPerEpoch, setTargetSecondsPerEpoch] = useState('100');
    const [reduceRatio, setReduceRatio] = useState('75');
    const [displayInitialMintSize, setDisplayInitialMintSize] = useState('10');
    const [initialMintSize, setInitialMintSize] = useState('10000000000');
    const [displayInitialTargetMintSizePerEpoch, setDisplayInitialTargetMintSizePerEpoch] = useState('100');
    const [initialTargetMintSizePerEpoch, setInitialTargetMintSizePerEpoch] = useState('100000000000');
    const [displayFeeRate, setDisplayFeeRate] = useState('0.01');
    const [feeRate, setFeeRate] = useState('10000000');
    const [liquidityTokensRatio, setLiquidityTokensRatio] = useState('10');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const validateImageFile = (file: File): boolean => {
        // Check file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            setError('Only JPEG, JPG and PNG files are allowed');
            return false;
        }

        // Check file size (4MB = 4 * 1024 * 1024 bytes)
        if (file.size > 4 * 1024 * 1024) {
            setError('Image size must be less than 4MB');
            return false;
        }

        return true;
    };

    const uploadToPinata = async (file: File): Promise<string> => {
        if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
            throw new Error('Pinata API keys are not configured');
        }

        const formData = new FormData();
        formData.append('file', file);

        const options = {
            headers: {
                'Content-Type': 'multipart/form-data',
                pinata_api_key: PINATA_API_KEY,
                pinata_secret_api_key: PINATA_SECRET_KEY
            }
        };

        try {
            const res = await axios.post(PINATA_API_URL, formData, options);
            return res.data.IpfsHash;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to upload to Pinata');
            }
            throw error;
        }
    };

    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Reset error and set uploading state
        setError('');
        setIsUploading(true);

        // Validate file
        if (!validateImageFile(file)) {
            setIsUploading(false);
            return;
        }

        // Check if image is square
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = async () => {
            if (img.width !== img.height) {
                setError('Image must be square');
                URL.revokeObjectURL(img.src);
                setIsUploading(false);
                return;
            }

            try {
                // Upload to Pinata
                const hash = await uploadToPinata(file);
                setImageCid(hash);
                setImageUrl(`https://gateway.pinata.cloud/ipfs/${hash}`);
                setImageFile(file);
            } catch (err) {
                setError('Failed to upload image: ' + (err instanceof Error ? err.message : String(err)));
            } finally {
                setIsUploading(false);
                URL.revokeObjectURL(img.src);
            }
        };

        img.onerror = () => {
            setError('Invalid image file');
            URL.revokeObjectURL(img.src);
            setIsUploading(false);
        };
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (!file) return;

        // Reset error
        setError('');

        // Validate file
        if (!validateImageFile(file)) {
            return;
        }

        if (fileInputRef.current) {
            fileInputRef.current.files = e.dataTransfer.files;
            handleImageChange({ target: { files: e.dataTransfer.files } } as any);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const createToken = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        setError('');
        setSuccess(false);

        try {
            // 准备元数据
            const metadataForIpfs = {
                name,
                symbol,
                description,
                image: imageUrl,
                attributes: []
            };

            // 上传元数据到 IPFS
            const metadataResponse = await axios.post(
                'https://api.pinata.cloud/pinning/pinJSONToIPFS',
                metadataForIpfs,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        pinata_api_key: PINATA_API_KEY,
                        pinata_secret_api_key: PINATA_SECRET_KEY,
                    },
                }
            );

            // 准备创建代币所需的元数据
            const tokenMetadata: TokenMetadata = {
                name,
                symbol,
                decimals,
                uri: `https://gateway.pinata.cloud/ipfs/${metadataResponse.data.IpfsHash}`,
            };

            // 调用合约创建代币
            if (!wallet) {
                throw new Error('Please connect your wallet first');
            }

            const initConfigData = {
                targetEras: new BN(targetEras),
                epochesPerEra: new BN(epochesPerEra),
                targetSecondsPerEpoch: new BN(targetSecondsPerEpoch),
                reduceRatio: new BN(reduceRatio),
                initialMintSize: new BN(initialMintSize),
                initialTargetMintSizePerEpoch: new BN(initialTargetMintSizePerEpoch),
                feeRate: new BN(feeRate),
                liquidityTokensRatio: new BN(liquidityTokensRatio),
            };

            const result = await createTokenOnChain(tokenMetadata, wallet, initConfigData);
            console.log('Token created:', result);

            if (onSubmit) {
                onSubmit({ name, symbol, imageUrl, imageCid, description });
            }

            setIsCreating(false);
            setSuccess(true);
        } catch (err: any) {
            console.error('Error creating token:', err);
            setError(err.message || 'Failed to create token');
            setIsCreating(false);
        }
    };

    const validateFormData = (): { isValid: boolean; error: string } => {
        // 转换为数字进行比较
        const liquidityRatio = parseFloat(liquidityTokensRatio);
        const reduceRatioNum = parseFloat(reduceRatio);
        const epochesPerEraNum = parseFloat(epochesPerEra);
        const targetErasNum = parseFloat(targetEras);
        const targetSecondsPerEpochNum = parseFloat(targetSecondsPerEpoch);
        const initialMintSizeNum = parseFloat(displayInitialMintSize);
        const initialTargetMintSizePerEpochNum = parseFloat(displayInitialTargetMintSizePerEpoch);

        if (liquidityRatio <= 0 || liquidityRatio > 50) {
            return { isValid: false, error: 'Liquidity tokens ratio must be between 0 and 50' };
        }

        if (reduceRatioNum < 50 || reduceRatioNum >= 100) {
            return { isValid: false, error: 'Reduce ratio must be between 50 and 100' };
        }

        if (epochesPerEraNum <= 0) {
            return { isValid: false, error: 'Epoches per era must be greater than 0' };
        }

        if (targetErasNum <= 0) {
            return { isValid: false, error: 'Target eras must be greater than 0' };
        }

        if (targetSecondsPerEpochNum <= 0) {
            return { isValid: false, error: 'Target seconds per epoch must be greater than 0' };
        }

        if (initialMintSizeNum <= 0) {
            return { isValid: false, error: 'Initial mint size must be greater than 0' };
        }

        if (initialTargetMintSizePerEpochNum <= 0) {
            return { isValid: false, error: 'Initial target mint size per epoch must be greater than 0' };
        }

        if (initialTargetMintSizePerEpochNum < initialMintSizeNum * 10) {
            return { isValid: false, error: 'Initial target mint size per epoch must be at least 10 times the initial mint size' };
        }

        return { isValid: true, error: '' };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // 验证表单数据
        const validation = validateFormData();
        if (!validation.isValid) {
            setError(validation.error);
            return;
        }
        setError('');

        await createToken(e);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                    Name
                </label>
                <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
            </div>

            <div>
                <label htmlFor="symbol" className="block text-sm font-medium mb-1">
                    Symbol
                </label>
                <input
                    id="symbol"
                    type="text"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                    Description(Optional)
                </label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                />
            </div>

            {/* 高级设置按钮 */}
            <div className="mt-6">
                <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center text-sm font-medium focus:outline-none"
                >
                    <svg
                        className={`w-4 h-4 mr-2 transition-transform duration-200 ${showAdvanced ? 'rotate-90' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                        />
                    </svg>
                    Advanced Settings(If you are not sure, leave it default)
                </button>
            </div>

            {/* 高级设置区域 */}
            {showAdvanced && (
                <div className="space-y-6 mt-4">
                    {/* <div>
                        <label htmlFor="decimals" className="block text-sm font-medium mb-1">
                            Decimals
                        </label>
                        <input
                            type="number"
                            id="decimals"
                            value={decimals}
                            onChange={(e) => setDecimals(Math.max(0, Math.min(9, parseInt(e.target.value) || 0)))}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                            max="9"
                        />
                    </div> */}

                    <div>
                        <label htmlFor="targetEras" className="block text-sm font-medium mb-1">
                            Target Eras
                        </label>
                        <input
                            type="text"
                            id="targetEras"
                            value={targetEras}
                            onChange={(e) => setTargetEras(e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter target eras"
                        />
                    </div>

                    <div>
                        <label htmlFor="epochesPerEra" className="block text-sm font-medium mb-1">
                            Epoches Per Era
                        </label>
                        <input
                            type="text"
                            id="epochesPerEra"
                            value={epochesPerEra}
                            onChange={(e) => setEpochesPerEra(e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter epochs per era"
                        />
                    </div>

                    <div>
                        <label htmlFor="targetSecondsPerEpoch" className="block text-sm font-medium mb-1">
                            Target Seconds Per Epoch
                        </label>
                        <input
                            type="text"
                            id="targetSecondsPerEpoch"
                            value={targetSecondsPerEpoch}
                            onChange={(e) => setTargetSecondsPerEpoch(e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter target seconds"
                        />
                    </div>

                    <div>
                        <label htmlFor="reduceRatio" className="block text-sm font-medium mb-1">
                            Reduce Ratio
                        </label>
                        <input
                            type="text"
                            id="reduceRatio"
                            value={reduceRatio}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                const num = parseInt(value);
                                if (!isNaN(num) && num <= 100) {
                                    setReduceRatio(value);
                                }
                            }}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter reduce ratio (0-100)"
                        />
                    </div>

                    <div>
                        <label htmlFor="initialMintSize" className="block text-sm font-medium mb-1">
                            Initial Mint Size
                        </label>
                        <input
                            type="text"
                            id="initialMintSize"
                            value={displayInitialMintSize}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9.]/g, '');
                                setDisplayInitialMintSize(value);
                                setInitialMintSize((parseFloat(value) * 1000000000).toString());
                            }}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter initial mint size"
                        />
                    </div>

                    <div>
                        <label htmlFor="initialTargetMintSizePerEpoch" className="block text-sm font-medium mb-1">
                            Initial Target Mint Size Per Epoch
                        </label>
                        <input
                            type="text"
                            id="initialTargetMintSizePerEpoch"
                            value={displayInitialTargetMintSizePerEpoch}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9.]/g, '');
                                setDisplayInitialTargetMintSizePerEpoch(value);
                                setInitialTargetMintSizePerEpoch((parseFloat(value) * 1000000000).toString());
                            }}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter target mint size per epoch"
                        />
                    </div>

                    <div>
                        <label htmlFor="feeRate" className="block text-sm font-medium mb-1">
                            Fee Rate(SOL)
                        </label>
                        <input
                            type="text"
                            id="feeRate"
                            value={displayFeeRate}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9.]/g, '');
                                setDisplayFeeRate(value);
                                setFeeRate((parseFloat(value) * 1000000000).toString());
                            }}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter fee rate"
                        />
                    </div>

                    <div>
                        <label htmlFor="liquidityTokensRatio" className="block text-sm font-medium mb-1">
                            Liquidity Tokens Ratio(%)
                        </label>
                        <input
                            type="text"
                            id="liquidityTokensRatio"
                            value={liquidityTokensRatio}
                            onChange={(e) => setLiquidityTokensRatio(e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter liquidity tokens ratio"
                        />
                    </div>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium mb-1">
                    Token Image
                </label>
                <div
                    className={`border-2 border-dashed rounded-lg p-4 text-center ${
                        isUploading ? 'opacity-50' : ''
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                    />
                    {imageUrl && !isUploading ? (
                        <div className="relative">
                            <img
                                src={imageUrl}
                                alt="Token"
                                className="mx-auto w-48 h-48 object-cover rounded-lg"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="mt-2 px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                                disabled={isUploading}
                            >
                                {isUploading ? 'Uploading...' : 'Change Image'}
                            </button>
                        </div>
                    ) : isUploading ? (
                        <div className="relative">
                            <div className="w-48 h-48 mx-auto flex items-center justify-center bg-gray-100 rounded-lg">
                                <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                            <button
                                type="button"
                                className="mt-2 px-3 py-1 text-sm bg-gray-400 text-white rounded-md cursor-not-allowed"
                                disabled
                            >
                                Uploading...
                            </button>
                        </div>
                    ) : (
                        <label
                            htmlFor="image-upload"
                            className="cursor-pointer flex flex-col items-center justify-center w-48 h-48 mx-auto"
                        >
                            <svg
                                className="w-12 h-12 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                            </svg>
                            <span className="mt-2 text-sm text-gray-500">
                                Click or drag to upload
                            </span>
                        </label>
                    )}
                </div>
                {error && (
                    <p className="text-red-500 text-sm mt-1">{error}</p>
                )}
                {success && (
                    <div className="mt-2 text-green-500 text-sm">
                        Token created successfully!
                    </div>
                )}
            </div>

            <button
                type="submit"
                className={`w-full py-2 px-4 rounded-lg text-white font-medium ${
                    isCreating || isUploading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600'
                }`}
                disabled={isCreating || isUploading || !name || !symbol || !imageCid}
            >
                {isCreating ? 'Creating Token...' : 'Create Token'}
            </button>
            <div className='h-8'></div>
        </form>
    );
};
