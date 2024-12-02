import React, { FC, useEffect, useMemo, useState } from 'react';
import { DataBlockProps, TokenInfoProps, TokenMetadataIPFS } from '../../types/types';
import { 
    BN_HUNDRED,
    BN_LAMPORTS_PER_SOL,
    calculateMaxSupply, 
    calculateMinTotalFee,
    calculateTotalSupplyToTargetEras,
    extractIPFSHash,
    formatDays,
    getTimeRemaining,
    numberStringToBN
} from '../../utils/format';
import { AddressDisplay } from '../common/AddressDisplay';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { RenderSocialIcons } from '../mintTokens/RenderSocialIcons';
import { pinata } from '../../utils/web3';
import { TokenImage } from '../mintTokens/TokenImage';
import MintModal from '../mintTokens/MintModal';
import { ReferralCodeModal } from '../myAccount/ReferralCodeModal';

const tooltip = {
    currentEra: "The current era number in the token's lifecycle",
    currentEpoch: "The current epoch number within the current era",
    mintFee: "Fee required to mint tokens",
    currentMintSize: "Current amount of tokens that can be minted in this epoch",
    currentMinted: "Total amount of tokens that have been minted so far",
    targetSupply: "Target token supply to be reached by the specified era",
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
        const fetchMetadata = async () => {
            try {
                const response = await pinata.gateways.get(extractIPFSHash(token.tokenUri as string) as string);
                const data = response.data as TokenMetadataIPFS;
                setMetadata(data);
            } catch (error) {
                console.error('Error fetching token metadata:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMetadata();
    }, [token.tokenUri]);
    
    const totalSupplyToTargetEras = useMemo(() => {
        return calculateTotalSupplyToTargetEras(
            token.targetEras,
            token.initialTargetMintSizePerEpoch,
            token.reduceRatio,
            token.epochesPerEra
        );
    }, [token.targetEras, token.initialTargetMintSizePerEpoch, token.reduceRatio, token.epochesPerEra]);

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
        <div className="bg-base-200 rounded-lg shadow-lg p-6">
            <div className="flex items-start gap-6">
                <div className="w-24 h-24 overflow-hidden">
                    <TokenImage imageUrl={metadata?.image as string} name={token.tokenName} size={84} className='rounded-full' />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-base-content">{token.tokenName}</h1>
                            <p className="text-base-content">{token.tokenSymbol}</p>
                        </div>
                    </div>
                    <div className='mt-2'><RenderSocialIcons metadata={metadata as TokenMetadataIPFS} /></div>
                    <p className="mt-4 text-base-content">{metadata?.description}</p>

                    {!hasStarted && (
                    <div className="mt-8">
                        <div className="badge badge-secondary badge-lg gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-4 h-4 stroke-current">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                            </svg>
                            {getTimeRemaining(token.startTimestamp)}
                        </div>
                    </div>)}

                    {/* 显示详细内容 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
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
                            value={numberStringToBN(token.mintSizeEpoch).div(BN_LAMPORTS_PER_SOL).toNumber().toLocaleString(undefined, { maximumFractionDigits: 2 }) + " " + token.tokenSymbol}
                            tooltip={tooltip.currentMintSize}
                        />
                        <DataBlock 
                            label="Current minted" 
                            value={(mintedSupply).toLocaleString(undefined, { maximumFractionDigits: 2 }) + " " + token.tokenSymbol}
                            tooltip={tooltip.currentMinted}
                        />
                        <DataBlock 
                            label={`Target Supply (Era:${token.targetEras})`} 
                            value={totalSupplyToTargetEras.toLocaleString(undefined, { maximumFractionDigits: 2 }) + " " + token.tokenSymbol}
                            tooltip={tooltip.targetSupply}
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
                            label="Deployer" 
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
                            label={`Liquidity Vault (${token.tokenSymbol})`} 
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
                            value={calculateMaxSupply(token.epochesPerEra, token.initialTargetMintSizePerEpoch, token.reduceRatio).toLocaleString(undefined, { maximumFractionDigits: 2 }) + " " + token.tokenSymbol}
                            tooltip={tooltip.maxSupply}
                        />
                        <DataBlock 
                            label="Target Mint Time" 
                            value={formatDays(Number(token.targetSecondsPerEpoch) * Number(token.epochesPerEra))}
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
                            value={token.difficultyCoefficientEpoch}
                            tooltip={tooltip.difficultyOfCurrentEpoch}
                        />
                        <DataBlock 
                            label="Difficulty of Last epoch" 
                            value={token.lastDifficultyCoefficientEpoch}
                            tooltip={tooltip.difficultyOfLastEpoch}
                        />
                    </div>
                    
                    {hasStarted &&
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
                            {numberStringToBN(token.quantityMintedEpoch).div(BN_LAMPORTS_PER_SOL).toNumber().toLocaleString(undefined, { maximumFractionDigits: 2 })} / {numberStringToBN(token.targetMintSizeEpoch).div(BN_LAMPORTS_PER_SOL).toNumber().toLocaleString(undefined, { maximumFractionDigits: 2 })} ({progressPercentageOfEpoch.toFixed(2)}%)
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
                    )}
                </div>
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