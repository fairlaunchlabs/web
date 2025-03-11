import React, { useState, FC, useEffect } from 'react';
import { initializeToken, uploadToStorage } from '../utils/web3';
import { LaunchTokenFormProps, TokenMetadata } from '../types/types';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { Metrics } from '../components/launchToken/Metrics';
import { SocialInformation } from '../components/launchToken/SocialInformation';
import { ToggleSwitch } from '../components/common/ToggleSwitch';
import { TokenImageUpload } from '../components/launchToken/TokenImageUpload';
import toast from 'react-hot-toast';
import { DEFAULT_PARAMS, MAX_AVATAR_FILE_SIZE, NETWORK, SCANURL, VALID_IMAGE_TYPES } from '../config/constants';
import { ToastBox } from '../components/common/ToastBox';
import { BN_LAMPORTS_PER_SOL, numberStringToBN } from '../utils/format';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { PageHeader } from '../components/common/PageHeader';

export const LaunchTokenForm: FC<LaunchTokenFormProps> = ({ expanded }) => {
  const wallet = useAnchorWallet();
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [decimals, setDecimals] = useState(9);

  const [showSocial, setShowSocial] = useState(false);
  const [website, setWebsite] = useState('');
  const [twitter, setTwitter] = useState('');
  const [discord, setDiscord] = useState('');
  const [telegram, setTelegram] = useState('');
  const [github, setGithub] = useState('');
  const [medium, setMedium] = useState('');

  const [mode, setMode] = useState('standard');
  const [targetEras, setTargetEras] = useState(DEFAULT_PARAMS[mode].targetEras);
  const [epochesPerEra, setEpochesPerEra] = useState(DEFAULT_PARAMS[mode].epochesPerEra);
  const [targetSecondsPerEpoch, setTargetSecondsPerEpoch] = useState(DEFAULT_PARAMS[mode].targetSecondsPerEpoch);
  const [reduceRatio, setReduceRatio] = useState(DEFAULT_PARAMS[mode].reduceRatio);
  const [displayInitialMintSize, setDisplayInitialMintSize] = useState(
    (new BN(DEFAULT_PARAMS[mode].initialMintSize)).div(BN_LAMPORTS_PER_SOL).toString()
  );
  const [displayInitialTargetMintSizePerEpoch, setDisplayInitialTargetMintSizePerEpoch] = useState(
    (new BN(DEFAULT_PARAMS[mode].initialTargetMintSizePerEpoch)).div(BN_LAMPORTS_PER_SOL).toString()
  );
  const [displayFeeRate, setDisplayFeeRate] = useState((Number(DEFAULT_PARAMS[mode].feeRate) / LAMPORTS_PER_SOL).toString());
  const [liquidityTokensRatio, setLiquidityTokensRatio] = useState(DEFAULT_PARAMS[mode].liquidityTokensRatio);

  const [startImmediately, setStartImmediately] = useState(true);
  const [startTime, setStartTime] = useState<string>('');

  const { connection } = useConnection();

  useEffect(() => {
    setTargetEras(DEFAULT_PARAMS[mode].targetEras);
    setEpochesPerEra(DEFAULT_PARAMS[mode].epochesPerEra);
    setTargetSecondsPerEpoch(DEFAULT_PARAMS[mode].targetSecondsPerEpoch);
    setReduceRatio(DEFAULT_PARAMS[mode].reduceRatio);
    setDisplayInitialMintSize((new BN(DEFAULT_PARAMS[mode].initialMintSize)).div(BN_LAMPORTS_PER_SOL).toString());
    setDisplayInitialTargetMintSizePerEpoch((new BN(DEFAULT_PARAMS[mode].initialTargetMintSizePerEpoch)).div(BN_LAMPORTS_PER_SOL).toString());
    setDisplayFeeRate((Number(DEFAULT_PARAMS[mode].feeRate) / LAMPORTS_PER_SOL).toString());
    setLiquidityTokensRatio(DEFAULT_PARAMS[mode].liquidityTokensRatio);
  }, [mode])

  useEffect(() => {
    if (startImmediately) {
      setStartTime('');
    }
  }, [startImmediately]);

  const validateImageFile = (file: File): boolean => {
    // Check file type
    if (!VALID_IMAGE_TYPES.includes(file.type)) {
      setError('Only JPEG, JPG, PNG, GIF, WEBP and AVIF files are allowed');
      return false;
    }

    // Check file size (4MB = 4 * 1024 * 1024 bytes)
    if (file.size > MAX_AVATAR_FILE_SIZE) {
      setError(`Image size must be less than ${MAX_AVATAR_FILE_SIZE / 1024}K`);
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
      const imageUrl = await uploadToStorage(file, 'avatar');
      // const arweaveUrl = "https://arweave.net/zYjcUg1xkcKIryig0nuhJbpUSRHwIjXuqyuWY6kglm4"; // pic
      console.log('Image uploaded to Storage:', imageUrl);
      setImageUrl(imageUrl);
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

      const metadataUrl = await uploadToStorage(metadataFile, 'metadata');
      // const metadataUrl = "https://arweave.net/UEuuJkHW3rgw4tcmlL_9loURN3Hc3YVYs_m7e5rngww"; // metadata
      console.log('Metadata uploaded to Storage:', metadataUrl);

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
        initialMintSize: numberStringToBN(displayInitialMintSize).mul(BN_LAMPORTS_PER_SOL),
        initialTargetMintSizePerEpoch: numberStringToBN(displayInitialTargetMintSizePerEpoch).mul(BN_LAMPORTS_PER_SOL),
        feeRate: numberStringToBN((Number(displayFeeRate) * LAMPORTS_PER_SOL).toString()),
        liquidityTokensRatio: numberStringToBN(liquidityTokensRatio),
        startTimestamp: numberStringToBN(startTimestamp.toString()),
      };

      console.log('initConfigData', Object.fromEntries(
        Object.entries(initConfigData).map(([key, value]) => [key, value.toString()])
      ));
    
      const result = await initializeToken(tokenMetadata, wallet, connection, initConfigData);

      if (!result.success) {
        toast.error(result.message as string, {
          id: toastId,
        });
        setIsCreating(false);
        return;
      }
      setIsCreating(false);
      setSuccess(true);

      const explorerUrl = `${SCANURL}/tx/${result.data?.tx}?cluster=${NETWORK}`;
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
      return { isValid: false, error: 'Checkpoints per milestone must be greater than 0' };
    }

    if (targetErasNum <= 0) {
      return { isValid: false, error: 'Target milestones must be greater than 0' };
    }

    if (targetSecondsPerEpochNum <= 0) {
      return { isValid: false, error: 'Target seconds per checkpoint must be greater than 0' };
    }

    if (initialMintSizeNum <= 0) {
      return { isValid: false, error: 'Initial mint size must be greater than 0' };
    }

    if (initialTargetMintSizePerEpochNum <= 0) {
      return { isValid: false, error: 'Initial target mint size per checkpoint must be greater than 0' };
    }

    if (initialTargetMintSizePerEpochNum < initialMintSizeNum * 10) {
      return { isValid: false, error: 'Initial target mint size per checkpoint must be at least 10 times the initial mint size' };
    }

    return { isValid: true, error: '' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateFormData();
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }
    setError('');

    await createToken(e);
  };

  return (
    <div className={`space-y-0 md:p-4 md:mb-20 ${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
      <PageHeader title="Launch Token" bgImage='/bg/group1/2.jpg' />
      <div className="flex flex-col lg:flex-row lg:justify-center lg:items-start lg:gap-8">
        <form onSubmit={handleSubmit} className="w-full lg:w-[480px] space-y-4 md:p-4">
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
              className="input w-full"
              // className={`input w-full px-3 py-2 border-2 border-dashed rounded-lg hover:border-primary transition-colors focus:outline-none focus:border-primary focus:border-2 bg-base-100 ${name ? 'border-base-content' : ''}`}
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
              className='input w-full'
              // className={`w-full px-3 py-2 border-2 border-dashed rounded-lg hover:border-primary transition-colors focus:outline-none focus:border-primary focus:border-2 bg-base-100 ${symbol ? 'border-base-content' : ''}`}
              required
            />
          </div>

          <TokenImageUpload
            onImageChange={handleImageChange}
          />

          {/* Launch time */}
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

          {/* Select Tier */}
          <div className='flex justify-between gap-3 mt-6'>
            <div className={`py-4 w-full text-center cursor-pointer bg-primary ${mode === 'standard' ? 'pixel-box-primary' : 'pixel-box'}`} onClick={() => setMode('standard')}>
              <div className='text-lg font-bold mb-2'>Standard Launch</div>
              <div className='text-xs'>Hard cap 100 million</div>
              <div className='text-xs'>mint fee 0.2 SOL</div>
            </div>
            <div className={`py-4 w-full text-center cursor-pointer bg-primary ${mode === 'meme' ? 'pixel-box-primary' : 'pixel-box'}`} onClick={() => setMode('meme')}>
              <div className='text-lg font-bold mb-2'>Meme Launch</div>
              <div className='text-xs'>Hard cap 1 billion</div>
              <div className='text-xs'>mint fee 0.01 SOL</div>
            </div>
          </div>
          {/* <div className="mt-6">
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
          </div> */}
          {error && (
            <div className="text-error text-sm mt-1">{error}</div>
          )}

          <button
            type="submit"
            className={`btn btn-primary w-full py-4 px-4 font-medium ${isCreating || isUploading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-primary hover:bg-primary'
              }`}
            disabled={isCreating || isUploading || !name || !symbol || !imageUrl}
          >
            {isCreating ? 'Creating Token...' : 'Create Token'}
          </button>
          <div className='h-8'></div>
        </form>

        <div className="md:mt-6">
          <Metrics
            mode={mode}
            targetEras={targetEras}
            epochesPerEra={epochesPerEra}
            targetSecondsPerEpoch={targetSecondsPerEpoch}
            reduceRatio={reduceRatio}
            initialTargetMintSizePerEpoch={displayInitialTargetMintSizePerEpoch}
            initialMintSize={(new BN(displayInitialMintSize)).mul(BN_LAMPORTS_PER_SOL).toString()}
            feeRate={(Number(displayFeeRate) * LAMPORTS_PER_SOL).toString()}
            liquidityTokensRatio={liquidityTokensRatio}
            symbol={symbol}
          />
        </div>
      </div>
    </div>
  );
};
