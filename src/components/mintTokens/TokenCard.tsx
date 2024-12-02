import React, { useEffect, useState, useMemo, FC } from 'react';
import { 
    calculateMaxSupply, 
    calculateTargetMintTime,
    calculateMinTotalFee,
    extractIPFSHash,
    formatDays,
    getTimeRemaining
} from '../../utils/format';
import { TokenCardProps, TokenMetadataIPFS } from '../../types/types';
import { AddressDisplay } from '../common/AddressDisplay';
import { TokenImage } from './TokenImage';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useNavigate } from 'react-router-dom';
import { RenderSocialIcons } from './RenderSocialIcons';
import { pinata } from '../../utils/web3';

export const TokenCard: React.FC<TokenCardProps> = ({ token }) => {
    const navigate = useNavigate();
    const [metadata, setMetadata] = useState<TokenMetadataIPFS | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const handleCardClick = () => {
        navigate(`/token/${token.mint}`);
    };

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
        const percentToTargetEras = 1 - Math.pow(Number(token.reduceRatio) / 100, Number(token.targetEras));
        const maxSupply = calculateMaxSupply(
            token.epochesPerEra,
            token.initialTargetMintSizePerEpoch,
            token.reduceRatio
        );
        return percentToTargetEras * Number(maxSupply);
    }, [token.targetEras, token.initialTargetMintSizePerEpoch, token.reduceRatio, token.epochesPerEra]);

    const mintedSupply = useMemo(() => {
        return Number(token.supply) * (1 - Number(token.liquidityTokensRatio) / 100) / LAMPORTS_PER_SOL;
    }, [token.supply, token.liquidityTokensRatio]);

    const progressPercentage = useMemo(() => {
        // 注意这个supply包括了TokenVault的数量，需要转成用户铸造数量
        return (mintedSupply * 100) / totalSupplyToTargetEras;
    }, [mintedSupply, totalSupplyToTargetEras]);

    const targetMintTime = calculateTargetMintTime(
        token.targetSecondsPerEpoch,
        token.epochesPerEra,
        token.targetEras
    );

    const minTotalFee = calculateMinTotalFee(
        token.initialTargetMintSizePerEpoch,
        token.feeRate,
        token.targetEras,
        token.epochesPerEra,
        token.initialMintSize
    );

    const feeRateInSol = useMemo(() => {
        return Number(token.feeRate) / LAMPORTS_PER_SOL;
    }, [token.feeRate]);

    const hasStarted = !token.startTimestamp || Number(token.startTimestamp) <= Math.floor(Date.now() / 1000);

    return (
        <div 
            className="bg-base-200 rounded-lg shadow-lg p-4 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
            onClick={handleCardClick}
        >
            <div className="card-body p-4 relative">
                <div className='absolute top-2 right-2 flex gap-1.5'>
                    <RenderSocialIcons metadata={metadata as TokenMetadataIPFS} />
                </div>
                <div className="absolute -top-6 -left-6 w-16 h-16 border-4 border-base-100 rounded-full shadow-lg overflow-hidden bg-base-200">
                    <TokenImage
                        imageUrl={metadata?.image as string}
                        name={token.tokenName}
                        className="w-full h-full rounded-full"
                    />
                </div>
                <div className="ml-2 mt-5">
                    <h3 className="card-title text-base mb-2 ml-2 text-base-content">
                        {token.tokenSymbol} <span className="text-sm opacity-70 text-base-content">({token.tokenName})</span>
                    </h3>
                    <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                            <span className="text-base-content/70">Mint Fee: </span>
                            <span className="text-base-content">{feeRateInSol} SOL</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-base-content/70">Current Mint Size: </span>
                            <span className="text-base-content">{(Number(token.mintSizeEpoch) / LAMPORTS_PER_SOL).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                        </div>
                        <p className="flex justify-between">
                            <span className="text-base-content/70">Max Supply:</span>
                            <span className="text-base-content">{calculateMaxSupply(token.epochesPerEra, token.initialTargetMintSizePerEpoch, token.reduceRatio).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                        </p>
                        <p className="flex justify-between">
                            <span className="text-base-content/70">Target Supply (Era:{token.targetEras}):</span>
                            <span className="text-base-content">{totalSupplyToTargetEras.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                        </p>
                        <p className="flex justify-between">
                            <span className="text-base-content/70">Target Mint Time:</span>
                            <span className="text-base-content">{formatDays(targetMintTime)}</span>
                        </p>
                        <p className="flex justify-between">
                            <span className="text-base-content/70">Target Minimum Fee:</span>
                            <span className="text-base-content">{minTotalFee.toLocaleString(undefined, { maximumFractionDigits: 2 })} SOL</span>
                        </p>
                        <p className="flex justify-between">
                            <span className="text-base-content/70">Liquidity Percentage:</span>
                            <span className="text-base-content">{token.liquidityTokensRatio}%</span>
                        </p>
                        <div className="flex justify-between items-center">
                            <span className="text-base-content/70">Token Address:</span>
                            <AddressDisplay address={token.mint} />
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-base-content/70">Vault#1(SOL):</span>
                            <AddressDisplay address={token.configAccount} />
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-base-content/70">Vault#2({token.tokenSymbol.substring(0,3)}):</span>
                            <AddressDisplay address={token.tokenVault} />
                        </div>
                    </div>
                </div>
                {hasStarted ? (
                    <div className="mt-4">
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
                ): (
                    <div className="mt-4">
                        <div className="badge badge-secondary gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-4 h-4 stroke-current">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                            </svg>
                            {getTimeRemaining(token.startTimestamp)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
