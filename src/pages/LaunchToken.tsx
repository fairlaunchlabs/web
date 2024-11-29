import React, { useState, useRef, useEffect, FC } from 'react';
import { createTokenOnChain, pinata } from '../utils/web3';
import { TokenMetadata } from '../types/types';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { BN } from '@coral-xyz/anchor';
import { Metrics } from '../components/launchToken/Metrics';
import { SocialInformation } from '../components/launchToken/SocialInformation';
import { AdvancedSettings } from '../components/launchToken/AdvancedSettings';
import { ToggleSwitch } from '../components/common/ToggleSwitch';
import { TokenImageUpload } from '../components/launchToken/TokenImageUpload';
import toast from 'react-hot-toast';
import { NETWORK, SCANURL } from '../config/constants';

interface LaunchTokenFormProps {
    expanded: boolean;
}
export const LaunchTokenForm:FC<LaunchTokenFormProps> = ({expanded}) => {
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
    
    // 社交信息状态
    const [showSocial, setShowSocial] = useState(false);
    const [website, setWebsite] = useState('');
    const [twitter, setTwitter] = useState('');
    const [discord, setDiscord] = useState('');
    const [telegram, setTelegram] = useState('');
    const [github, setGithub] = useState('');
    const [medium, setMedium] = useState('');

    // 高级设置状态
    const [targetEras, setTargetEras] = useState('1');
    const [epochesPerEra, setEpochesPerEra] = useState('250');
    const [targetSecondsPerEpoch, setTargetSecondsPerEpoch] = useState('10000');
    const [reduceRatio, setReduceRatio] = useState('75');
    const [displayInitialMintSize, setDisplayInitialMintSize] = useState('10000');
    const [initialMintSize, setInitialMintSize] = useState('10000000000000');
    const [displayInitialTargetMintSizePerEpoch, setDisplayInitialTargetMintSizePerEpoch] = useState('1000000');
    const [initialTargetMintSizePerEpoch, setInitialTargetMintSizePerEpoch] = useState('1000000000000000');
    const [displayFeeRate, setDisplayFeeRate] = useState('0.005');
    const [feeRate, setFeeRate] = useState('5000000');
    const [liquidityTokensRatio, setLiquidityTokensRatio] = useState('10');

    /// TEST 
    // const { loading, error: queryError, data } = useQuery(queryInitializeTokenEvent);
    // useEffect(() => {
    //     if (loading) console.log('Loading token events...');
    //     if (queryError) console.error('Error loading token events:', queryError);
    //     if (data) console.log('Token events data:', data);
    // }, [loading, queryError, data]);

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
        try {
            return (await pinata.upload.file(file)).IpfsHash;
        } catch (error) {
            throw error;
        }
    };

    const handleImageChange = async (file: File | null) => {
        // If no file, reset image-related states
        if (!file) {
            setImageCid('');
            setImageUrl('');
            return;
        }

        // Reset error and set uploading state
        setError('');
        setIsUploading(true);

        // Validate file
        if (!validateImageFile(file)) {
            setIsUploading(false);
            return;
        }

        try {
            // Upload to Pinata
            const hash = await uploadToPinata(file);
            setImageCid(hash);
            setImageUrl(`ipfs://${hash}`);
        } catch (err) {
            setError('Failed to upload image: ' + (err instanceof Error ? err.message : String(err)));
        } finally {
            setIsUploading(false);
        }
    };

    const createToken = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        setError('');
        setSuccess(false);

        const toastId = toast.loading('Creating token...', {
            style: {
                background: 'var(--fallback-b1,oklch(var(--b1)))',
                color: 'var(--fallback-bc,oklch(var(--bc)))',
            },
        });

        try {
            // 调用合约创建代币
            if (!wallet) {
                throw new Error('Please connect your wallet first');
            }

            // 准备元数据
            const metadataForIpfs = {
                name,
                symbol,
                description,
                image: imageUrl,
                extensions: {
                    website,
                    twitter,
                    discord,
                    telegram,
                    github,
                    medium,
                },
            };

            // 上传元数据到 IPFS
            const metadataResponse = await pinata.upload.json(metadataForIpfs);

            // 准备创建代币所需的元数据
            const tokenMetadata: TokenMetadata = {
                name,
                symbol,
                decimals,
                uri: `ipfs://${metadataResponse.IpfsHash}`,
            };
            console.log('Token metadata:', tokenMetadata);

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

            setIsCreating(false);
            setSuccess(true);

            // 显示成功提示，包含交易链接
            const explorerUrl = `${SCANURL}/tx/${result.signature}?cluster=${NETWORK}`;
            toast.success(
                <div>
                    Token created successfully!
                    <br />
                    <a
                        href={explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                    >
                        View transaction
                    </a>
                </div>,
                {
                    id: toastId,
                }
            );
        } catch (err: any) {
            console.error('Error creating token:', err);
            setError(err.message || 'Failed to create token');
            setIsCreating(false);
            toast.error(err.message || 'Failed to create token', {
                id: toastId,
            });
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
        <div className={`max-w-7xl mx-auto ${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
            <div className="flex flex-col lg:flex-row lg:justify-center lg:items-start lg:gap-8">
                <form onSubmit={handleSubmit} className="w-full lg:w-[480px] space-y-4 p-4">
                    <div className="">
                        <label htmlFor="name" className="block text-sm font-medium mb-1">
                            Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={`w-full px-3 py-2 border-2 border-dashed rounded-lg hover:border-primary transition-colors focus:outline-none focus:border-primary focus:border-2 bg-base-100 ${name ? 'border-base-content' : ''}`}
                            required
                        />
                    </div>

                    <div className="">
                        <label htmlFor="symbol" className="block text-sm font-medium mb-1">
                            Symbol
                        </label>
                        <input
                            id="symbol"
                            type="text"
                            value={symbol}
                            onChange={(e) => setSymbol(e.target.value)}
                            className={`w-full px-3 py-2 border-2 border-dashed rounded-lg hover:border-primary transition-colors focus:outline-none focus:border-primary focus:border-2 bg-base-100 ${symbol ? 'border-base-content' : ''}`}
                            required
                        />
                    </div>

                    <TokenImageUpload
                        onImageChange={handleImageChange}
                    />

                    <div className="mb-4">
                        <ToggleSwitch
                            id="toggleSocial"
                            label="Social information(Optional)"
                            checked={showSocial}
                            onChange={() => setShowSocial(!showSocial)}
                        />
                        
                        {showSocial && (
                            <SocialInformation
                                description={description}
                                onDescriptionChange={setDescription}
                                website={website}
                                onWebsiteChange={setWebsite}
                                twitter={twitter}
                                onTwitterChange={setTwitter}
                                discord={discord}
                                onDiscordChange={setDiscord}
                                telegram={telegram}
                                onTelegramChange={setTelegram}
                                github={github}
                                onGithubChange={setGithub}
                                medium={medium}
                                onMediumChange={setMedium}
                            />
                        )}
                    </div>

                    {/* 高级设置按钮 */}
                    <div className="mt-6">
                        <ToggleSwitch
                            id="toggleAdvanced"
                            label="Advanced Settings(Optional)"
                            checked={showAdvanced}
                            onChange={() => setShowAdvanced(!showAdvanced)}
                        />

                        {showAdvanced && (
                            <AdvancedSettings
                                targetEras={targetEras}
                                epochesPerEra={epochesPerEra}
                                targetSecondsPerEpoch={targetSecondsPerEpoch}
                                reduceRatio={reduceRatio}
                                displayInitialMintSize={displayInitialMintSize}
                                displayInitialTargetMintSizePerEpoch={displayInitialTargetMintSizePerEpoch}
                                displayFeeRate={displayFeeRate}
                                liquidityTokensRatio={liquidityTokensRatio}
                                onTargetErasChange={setTargetEras}
                                onEpochesPerEraChange={setEpochesPerEra}
                                onTargetSecondsPerEpochChange={setTargetSecondsPerEpoch}
                                onReduceRatioChange={setReduceRatio}
                                onDisplayInitialMintSizeChange={setDisplayInitialMintSize}
                                onDisplayInitialTargetMintSizePerEpochChange={setDisplayInitialTargetMintSizePerEpoch}
                                onDisplayFeeRateChange={setDisplayFeeRate}
                                onLiquidityTokensRatioChange={setLiquidityTokensRatio}
                            />
                        )}
                    </div>

                    <button
                        type="submit"
                        className={`w-full py-4 px-4 rounded-lg text-white font-medium ${
                            isCreating || isUploading
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-primary hover:bg-primary'
                        }`}
                        disabled={isCreating || isUploading || !name || !symbol || !imageCid}
                    >
                        {isCreating ? 'Creating Token...' : 'Create Token'}
                    </button>
                    <div className='h-8'></div>
                </form>

                {/* 计算结果显示框 */}
                <div className="w-full lg:w-[480px] p-6 border-2 border-dashed rounded-lg mt-4 lg:mt-[40px] lg:sticky lg:top-4">
                    <Metrics
                        targetEras={targetEras}
                        epochesPerEra={epochesPerEra}
                        targetSecondsPerEpoch={targetSecondsPerEpoch}
                        reduceRatio={reduceRatio}
                        displayInitialTargetMintSizePerEpoch={displayInitialTargetMintSizePerEpoch}
                        initialMintSize={initialMintSize}
                        feeRate={feeRate}
                        liquidityTokensRatio={liquidityTokensRatio}
                        symbol={symbol}
                    />
                </div>
            </div>
        </div>
    );
};
