import React, { useState, useRef } from 'react';
import axios from 'axios';
import { createTokenOnChain, connectWallet } from '../utils/web3';
import { TokenMetadata } from '../utils/types';
import { useAnchorWallet } from '@solana/wallet-adapter-react';

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
                decimals: 9, // 使用默认的 9 位小数
                uri: `https://gateway.pinata.cloud/ipfs/${metadataResponse.data.IpfsHash}`,
            };

            // 调用合约创建代币
            if (!wallet) {
                throw new Error('Please connect your wallet first');
            }
            const result = await createTokenOnChain(tokenMetadata, wallet);
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

    const handleSubmit = async (e: React.FormEvent) => {
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
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                />
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                    Description
                </label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                />
            </div>

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
