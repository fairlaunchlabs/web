import React, { useState, FC, useEffect } from 'react';
import { createTokenOnChain, uploadToArweave } from '../utils/web3';
import { LaunchTokenFormProps, TokenMetadata } from '../types/types';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { Metrics } from '../components/launchToken/Metrics';
import { SocialInformation } from '../components/launchToken/SocialInformation';
import { AdvancedSettings } from '../components/launchToken/AdvancedSettings';
import { ToggleSwitch } from '../components/common/ToggleSwitch';
import { TokenImageUpload } from '../components/launchToken/TokenImageUpload';
import toast from 'react-hot-toast';
import { ARWEAVE_API_URL, ARWEAVE_GATEWAY_URL, NETWORK, SCANURL } from '../config/constants';
import { ToastBox } from '../components/common/ToastBox';
import { numberStringToBN } from '../utils/format';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import axios from 'axios';

export const LaunchTokenForm: FC<LaunchTokenFormProps> = ({ expanded }) => {
    const wallet = useAnchorWallet();
    const [name, setName] = useState('');
    const [symbol, setSymbol] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    // const [imageCid, setImageCid] = useState('');
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

    const [startImmediately, setStartImmediately] = useState(true);
    const [startTime, setStartTime] = useState<string>('');

    const { connection } = useConnection();

    useEffect(() => {
        if (startImmediately) {
            setStartTime('');
        }
    }, [startImmediately]);

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

    const handleImageChange = async (file: File | null) => {
        // If no file, reset image-related states
        if (!file) {
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
            // const arweaveUrl = await uploadToArweave(file); // ######
            const arweaveUrl = "https://arweave.net/zYjcUg1xkcKIryig0nuhJbpUSRHwIjXuqyuWY6kglm4"; // pic
            setImageUrl(arweaveUrl);
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

            const metadataForArweave = {
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
            
            const metadataBlob = new Blob([JSON.stringify(metadataForArweave)], {
                type: 'application/json'
            });
            const metadataFile = new File([metadataBlob], 'metadata.json', {
                type: 'application/json'
            });

            // const metadataUrl = await uploadToArweave(metadataFile); // ######
            const metadataUrl = "https://arweave.net/UEuuJkHW3rgw4tcmlL_9loURN3Hc3YVYs_m7e5rngww"; // metadata
            console.log('Metadata uploaded to Arweave:', metadataUrl);

            const tokenMetadata: TokenMetadata = {
                name,
                symbol,
                decimals,
                uri: metadataUrl,
            };

            const startTimestamp = startImmediately 
                ? Math.floor(Date.now() / 1000)
                : Math.floor(new Date(startTime).getTime() / 1000);

            const initConfigData = {
                targetEras: numberStringToBN(targetEras),
                epochesPerEra: numberStringToBN(epochesPerEra),
                targetSecondsPerEpoch: numberStringToBN(targetSecondsPerEpoch),
                reduceRatio: numberStringToBN(reduceRatio),
                initialMintSize: numberStringToBN(displayInitialMintSize + "000000000"),
                initialTargetMintSizePerEpoch: numberStringToBN(displayInitialTargetMintSizePerEpoch + "000000000"),
                feeRate: numberStringToBN((Number(displayFeeRate) * LAMPORTS_PER_SOL).toString()),
                liquidityTokensRatio: numberStringToBN(liquidityTokensRatio),
                startTimestamp: numberStringToBN(startTimestamp.toString()),
            };

            // console.log('Token metadata:', tokenMetadata);
            // console.log('Init config data:', 
            //     initConfigData.targetEras.toString(),
            //     initConfigData.epochesPerEra.toString(),
            //     initConfigData.targetSecondsPerEpoch.toString(),
            //     initConfigData.reduceRatio.toString(),
            //     initConfigData.initialMintSize.toString(), // ??
            //     initConfigData.initialTargetMintSizePerEpoch.toString(), // ??
            //     initConfigData.feeRate.toString(), // ??
            //     initConfigData.liquidityTokensRatio.toString(),
            //     initConfigData.startTimestamp.toString(),
            // );

            const result = await createTokenOnChain(tokenMetadata, wallet, connection, initConfigData);
            console.log('Token created:', result);

            setIsCreating(false);
            setSuccess(true);

            const explorerUrl = `${SCANURL}/tx/${result.signature}?cluster=${NETWORK}`;
            toast.success(
                <ToastBox url={explorerUrl} urlText="View transaction" title="Token created successfully!" />,
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
        <div className={`mx-auto mb-20 ${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
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
                            placeholder='Max 20 chars, alphanumeric and punctuation'
                            onChange={(e) => {
                                const value = e.target.value;
                                // Validate name: max 20 chars, alphanumeric and punctuation, no consecutive spaces
                                const consecutiveSpacesRegex = /  +/;
                                if (value.length <= 20 && !consecutiveSpacesRegex.test(value)) {
                                    setName(value);
                                }
                            }}
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
                            placeholder="Max 8 chars, alphanumeric, max 1 emoji"
                            onChange={(e) => {
                                const value = e.target.value;
                                // Validate symbol: max 8 chars, alphanumeric, max 1 emoji, no spaces/special chars
                                const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1F1E6}-\u{1F1FF}]/u;
                                const alphanumericRegex = /^[a-zA-Z0-9]*$/;
                                const emojiCount = (value.match(emojiRegex) || []).length;
                                if (value.length <= 8 && alphanumericRegex.test(value.replace(emojiRegex, '')) && emojiCount <= 1) {
                                    setSymbol(value);
                                }
                            }}
                            className={`w-full px-3 py-2 border-2 border-dashed rounded-lg hover:border-primary transition-colors focus:outline-none focus:border-primary focus:border-2 bg-base-100 ${symbol ? 'border-base-content' : ''}`}
                            required
                        />
                    </div>

                    <TokenImageUpload
                        onImageChange={handleImageChange}
                    />

                    {/* 启动时间选择 */}
                    <div className="">
                        <ToggleSwitch
                            id="toggleStartTime"
                            label="Start mint immediately"
                            checked={startImmediately}
                            onChange={() => setStartImmediately(!startImmediately)}
                        />
                    </div>

                    {!startImmediately && (
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Start Time</span>
                            </label>
                            <input 
                                type="datetime-local" 
                                className="input input-bordered" 
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                min={new Date().toISOString().slice(0, 16)}
                            />
                        </div>
                    )}

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
                                onLiquidityTokensRatioChange={setLiquidityTokensRatio}
                                onDisplayFeeRateChange={setDisplayFeeRate}
                                onDisplayInitialMintSizeChange={setDisplayInitialMintSize}
                                onDisplayInitialTargetMintSizePerEpochChange={setDisplayInitialTargetMintSizePerEpoch}
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
                        disabled={isCreating || isUploading || !name || !symbol || !imageUrl}
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
