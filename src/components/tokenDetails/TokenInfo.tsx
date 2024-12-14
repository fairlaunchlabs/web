import React, { FC, useEffect, useMemo, useState } from 'react';
import { DataBlockProps, TokenInfoProps, TokenMetadataIPFS } from '../../types/types';
import { 
    BN_HUNDRED,
    BN_LAMPORTS_PER_SOL,
    calculateMaxSupply, 
    calculateMinTotalFee,
    calculateTotalSupplyToTargetEras,
    formatSeconds,
    numberStringToBN
} from '../../utils/format';
import { AddressDisplay } from '../common/AddressDisplay';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { RenderSocialIcons } from '../mintTokens/RenderSocialIcons';
import { fetchMetadata } from '../../utils/web3';
import { TokenImage } from '../mintTokens/TokenImage';
import MintModal from '../mintTokens/MintModal';
import { ReferralCodeModal } from '../myAccount/ReferralCodeModal';
import { ARSEEDING_GATEWAY_URL, ARWEAVE_GATEWAY_URL } from '../../config/constants';

const tooltip = {
    currentEra: "The current era number in the token's lifecycle",
    currentEpoch: "The current epoch number within the current era",
    mintFee: "Fee required to mint tokens",
    currentMintSize: "Current amount of tokens that can be minted in this epoch",
    currentMinted: "Total amount of tokens that have been minted so far",
    targetSupply: "Target token supply to be reached by the specified era",
    mintSpeed: "Rate at which tokens are minted per epoch",
    deployAt: "Timestamp when the token was deployed",
    deployingTx: "Transaction hash of the deployment transaction",
    deployer: "Address of the token deployer",
    tokenAddress: "The token's contract address on Solana",
    liquidityVaultSOL: "Vault address holding SOL liquidity",
    liquidityVaultToken: "Vault address holding token liquidity",
    targetEras: "Number of eras to reach the target supply",
    startTimeOfCurrentEpoch: "When the current epoch started",
    liquidityTokensRatio: "Percentage of tokens allocated for liquidity",
    maxSupply: "Maximum possible token supply",
    targetMintTime: "Target time duration for minting tokens",
    reduceRatioPerEra: "Percentage by which the mint size reduces each era",
    targetMinimumFee: "Minimum total fee required to reach target supply",
    epochesPerEra: "Number of epochs in each era",
    currentMintFee: "Current mint fee",
    currentReferralFee: "Current referral fee",
    difficultyOfCurrentEpoch: "Difficulty of current epoch",
    difficultyOfLastEpoch: "Difficulty of last epoch"
}

export const TokenInfo: React.FC<TokenInfoProps> = ({ token, referrerCode }) => {
    const [metadata, setMetadata] = useState<TokenMetadataIPFS | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        fetchMetadata(token).then((data) => {
            setMetadata(data);
            setIsLoading(false);
        }).catch((error) => {
            console.error('Error fetching token metadata:', error);
            setIsLoading(false);
        }); 
    }, [token.tokenUri]);
    
    const totalSupplyToTargetEras = useMemo(() => {
        return calculateTotalSupplyToTargetEras(
            token.epochesPerEra,
            token.initialTargetMintSizePerEpoch,
            token.reduceRatio,
            token.targetEras
        );
    }, [token.targetEras, token.initialTargetMintSizePerEpoch, token.reduceRatio, token.epochesPerEra]);

    const mintSpeed = useMemo(() => {
        return Number(token.targetSecondsPerEpoch) / Number(token.initialTargetMintSizePerEpoch) * Number(token.initialMintSize);
    }, [token.targetSecondsPerEpoch, token.initialTargetMintSizePerEpoch, token.initialMintSize]);

    const mintedSupply = useMemo(() => {
        return numberStringToBN(token.supply).sub(numberStringToBN(token.supply).mul(numberStringToBN(token.liquidityTokensRatio)).div(BN_HUNDRED)).div(BN_LAMPORTS_PER_SOL).toNumber();
    }, [token.supply, token.liquidityTokensRatio]);

    const progressPercentage = useMemo(() => {
        // 注意这个supply包括了TokenVault的数量，需要转成用户铸造数量
        return (mintedSupply * 100) / totalSupplyToTargetEras;
    }, [mintedSupply, totalSupplyToTargetEras]);

    const progressPercentageOfEpoch = useMemo(() => {
        return (Number(token.quantityMintedEpoch) * 100) / Number(token.targetMintSizeEpoch);
    }, [token.quantityMintedEpoch, token.targetMintSizeEpoch]);

    const hasStarted = !token.startTimestamp || Number(token.startTimestamp) <= Math.floor(Date.now() / 1000);

    return (
        <div className="w-full space-y-6">
            {/* Header Section with Background */}
            <div className="w-full relative">
                {/* Background Image */}
                {metadata && metadata?.header !== ARWEAVE_GATEWAY_URL + "/" && metadata?.header !== ARSEEDING_GATEWAY_URL + "/" ? (
                    <img
                        src={metadata.header}
                        alt="Token Header"
                        className="w-full h-auto aspect-[3/1] object-cover rounded-t-lg"
                    />
                ) : (
                    <div className="w-full aspect-[3/1] rounded-t-lg" />
                )}
                
                {/* Double Gradient Overlay for better text contrast */}
                {/* <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60 rounded-t-lg" />
                <div className="absolute inset-0 bg-gradient-to-t from-base-200/80 via-base-200/20 to-transparent rounded-t-lg" /> */}

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 flex gap-6 items-end">
                    {/* Token Image */}
                    <div className="w-24 h-24 relative z-10">
                        <TokenImage
                            imageUrl={metadata?.image as string} 
                            name={metadata?.name as string} 
                            launchTimestamp={Number(token.metadataTimestamp)}
                            size={96} 
                            className="rounded-full ring-4 ring-white shadow-xl" />
                    </div>

                    {/* Token Info with enhanced text shadows */}
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold text-white [text-shadow:0_2px_4px_rgba(0,0,0,0.8),0_4px_12px_rgba(0,0,0,0.4)]">
                                    {metadata?.name}
                                </h1>
                                <p className="text-xl text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.6),0_3px_6px_rgba(0,0,0,0.3)]">
                                    {metadata?.symbol}
                                </p>
                            </div>
                        </div>
                        <div className="mt-2 [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]">
                            <RenderSocialIcons metadata={metadata as TokenMetadataIPFS} />
                        </div>
                        <p className="mt-3 text-white line-clamp-2 [text-shadow:0_1px_3px_rgba(0,0,0,0.6),0_2px_4px_rgba(0,0,0,0.3)]">
                            {metadata?.description}
                        </p>
                    </div>
                </div>
            </div>

            {/* Rest of the content */}
            <div className="bg-base-200 rounded-lg shadow-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <DataBlock 
                        label="Current Era" 
                        value={token.currentEra} 
                        tooltip={tooltip.currentEra}
                    />
                    <DataBlock 
                        label="Current Epoch" 
                        value={token.currentEpoch}
                        tooltip={tooltip.currentEpoch}
                    />
                    <DataBlock 
                        label="Mint Fee" 
                        value={(Number(token.feeRate) / LAMPORTS_PER_SOL) + " SOL/Mint"}
                        tooltip={tooltip.mintFee}
                    />
                    <DataBlock 
                        label="Current Mint Size"
                        value={(numberStringToBN(token.mintSizeEpoch).mul(BN_HUNDRED).div(BN_LAMPORTS_PER_SOL).toNumber() / 100).toLocaleString(undefined, { maximumFractionDigits: 2 }) + " " + metadata?.symbol}
                        tooltip={tooltip.currentMintSize}
                    />
                    <DataBlock 
                        label="Current minted" 
                        value={(mintedSupply).toLocaleString(undefined, { maximumFractionDigits: 2 }) + " " + metadata?.symbol}
                        tooltip={tooltip.currentMinted}
                    />
                    <DataBlock 
                        label={`Target Supply (Era:${token.targetEras})`} 
                        value={totalSupplyToTargetEras.toLocaleString(undefined, { maximumFractionDigits: 2 }) + " " + metadata?.symbol}
                        tooltip={tooltip.targetSupply}
                    />
                    <DataBlock 
                        label="Target speed" 
                        value={formatSeconds(mintSpeed) + "/mint"}
                        tooltip={tooltip.mintSpeed}
                    />
                    <DataBlock 
                        label="Deploy at" 
                        value={new Date(Number(token.timestamp) * 1000).toLocaleString()}
                        tooltip={tooltip.deployAt}
                    />
                    <DataBlock 
                        label='Deploying Tx' 
                        value={<AddressDisplay address={token.txId} type='tx' />}
                        tooltip={tooltip.deployingTx}
                    />
                    <DataBlock 
                        label="Developer" 
                        value={<AddressDisplay address={token.admin} />}
                        tooltip={tooltip.deployer}
                    />
                    <DataBlock 
                        label="Token Address" 
                        value={<AddressDisplay address={token.mint} />}
                        tooltip={tooltip.tokenAddress}
                    />
                    <DataBlock 
                        label="Liquidity Vault (SOL)" 
                        value={<AddressDisplay address={token.configAccount} />}
                        tooltip={tooltip.liquidityVaultSOL}
                    />
                    <DataBlock 
                        label={`Liquidity Vault (${metadata?.symbol})`} 
                        value={<AddressDisplay address={token.tokenVault} />}
                        tooltip={tooltip.liquidityVaultToken}
                    />
                    <DataBlock 
                        label="Taget Eras" 
                        value={token.targetEras}
                        tooltip={tooltip.targetEras}
                    />
                    <DataBlock 
                        label="Start time of current epoch" 
                        value={new Date(Number(token.startTimestampEpoch) * 1000).toLocaleString()}
                        tooltip={tooltip.startTimeOfCurrentEpoch}
                    />
                    <DataBlock 
                        label="Liquidity Tokens Ratio" 
                        value={token.liquidityTokensRatio + "%"}
                        tooltip={tooltip.liquidityTokensRatio}
                    />
                    <DataBlock 
                        label="Max Supply" 
                        value={calculateMaxSupply(token.epochesPerEra, token.initialTargetMintSizePerEpoch, token.reduceRatio).toLocaleString(undefined, { maximumFractionDigits: 2 }) + " " + metadata?.symbol}
                        tooltip={tooltip.maxSupply}
                    />
                    <DataBlock 
                        label="Target Mint Time" 
                        value={formatSeconds(Number(token.targetSecondsPerEpoch) * Number(token.epochesPerEra))}
                        tooltip={tooltip.targetMintTime}
                    />
                    <DataBlock 
                        label="Reduce Ratio per Era" 
                        value={token.reduceRatio + "%"}
                        tooltip={tooltip.reduceRatioPerEra}
                    />
                    <DataBlock 
                        label="Target Minimum Fee" 
                        value={(calculateMinTotalFee(
                            token.initialTargetMintSizePerEpoch,
                            token.feeRate,
                            token.targetEras,
                            token.epochesPerEra,
                            token.initialMintSize
                        )).toLocaleString(undefined, { maximumFractionDigits: 2 }) + " SOL"}
                        tooltip={tooltip.targetMinimumFee}
                    />
                    <DataBlock 
                        label="Epoches per Era" 
                        value={token.epochesPerEra}
                        tooltip={tooltip.epochesPerEra}
                    />
                    <DataBlock 
                        label="Current mint fee" 
                        value={(Number(token.totalMintFee) / LAMPORTS_PER_SOL).toLocaleString(undefined, { maximumFractionDigits: 2 }) + " SOL"}
                        tooltip={tooltip.currentMintFee}
                    />
                    <DataBlock 
                        label="Current referral fee" 
                        value={(Number(token.totalReferrerFee) / LAMPORTS_PER_SOL).toLocaleString(undefined, { maximumFractionDigits: 2 }) + " SOL"}
                        tooltip={tooltip.currentReferralFee}
                    />
                    <DataBlock 
                        label="Difficulty of current epoch" 
                        value={parseFloat(token.difficultyCoefficientEpoch).toFixed(4)}
                        tooltip={tooltip.difficultyOfCurrentEpoch}
                    />
                    <DataBlock 
                        label="Difficulty of Last epoch" 
                        value={parseFloat(token.lastDifficultyCoefficientEpoch).toFixed(4)}
                        tooltip={tooltip.difficultyOfLastEpoch}
                    />
                </div>
                
                {hasStarted ?
                (
                <div>
                    {/* 进度条 */}
                    <div className="mt-8">
                        <h3 className="text-xl font-semibold mb-4 text-base-content">Progress for minted to target supply</h3>
                        <div className="text-sm font-medium mb-1 text-base-content">
                        {mintedSupply.toLocaleString(undefined, { maximumFractionDigits: 2 })} / {totalSupplyToTargetEras.toLocaleString(undefined, { maximumFractionDigits: 2 })} ({progressPercentage.toFixed(2)}%)
                        </div>
                        <div className="w-full bg-base-300 rounded-full h-2.5">
                            <div 
                                className="bg-secondary h-2.5 rounded-full" 
                                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <h3 className="text-xl font-semibold mb-4 text-base-content">Progress for minted to target mint size of current epoch</h3>
                        <div className="text-sm font-medium mb-1 text-base-content">
                        {(numberStringToBN(token.quantityMintedEpoch).mul(BN_HUNDRED).div(BN_LAMPORTS_PER_SOL).toNumber() / 100).toLocaleString(undefined, { maximumFractionDigits: 2 })} / {(numberStringToBN(token.targetMintSizeEpoch).mul(BN_HUNDRED).div(BN_LAMPORTS_PER_SOL).toNumber() / 100).toLocaleString(undefined, { maximumFractionDigits: 2 })} ({progressPercentageOfEpoch.toFixed(2)}%)
                        </div>
                        <div className="w-full bg-base-300 rounded-full h-2.5">
                            <div 
                                className="bg-secondary h-2.5 rounded-full" 
                                style={{ width: `${Math.min(progressPercentageOfEpoch, 100)}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* 铸造于获取URC按钮 */}
                    <div className="flex justify-between mt-8">
                        <div className='w-1/2 px-3'>
                            <button className="btn w-full btn-primary" onClick={() => setIsModalOpen(true)}>
                                Mint
                            </button>
                        </div>
                        <div className='w-1/2 px-3'>
                            <button className="btn w-full btn-secondary" onClick={() => setIsReferralModalOpen(true)}>
                                Unique Referral Code
                            </button>
                        </div>
                    </div>
                </div>
                ):(
                <div className="mt-8">
                    <button className="btn w-full btn-secondary" onClick={() => setIsReferralModalOpen(true)}>
                        Unique Referral Code
                    </button>
                </div>)}
            </div>
            <MintModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                token={token}
                referrerCode={referrerCode}
            />
            <ReferralCodeModal
                isOpen={isReferralModalOpen}
                onClose={() => {
                    setIsReferralModalOpen(false);
                }}
                token={{
                    mint: token.mint,
                    amount: '',
                    tokenData: token
                }}
            />
        </div>
    );
};

export const DataBlock:FC<DataBlockProps> = ({label, value, tooltip}) => {
    return (
        <div className="space-y-2">
            <div className="relative group">
                <h3 className="font-semibold text-base-content inline-flex items-center gap-1">
                    {label}
                    {tooltip && (
                        <>
                            <span className="cursor-help">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-4 h-4 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </span>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-base-300 text-base-content text-sm rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-10">
                                {tooltip}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                                    <div className="border-8 border-transparent border-t-base-300"></div>
                                </div>
                            </div>
                        </>
                    )}
                </h3>
            </div>
            <div className="text-base-content">
                {value}
            </div>
        </div>
    )
}