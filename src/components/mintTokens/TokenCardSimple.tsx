import React, { useEffect, useState, useMemo } from 'react';
import { TokenCardMobileProps, TokenMetadataIPFS } from '../../types/types';
import { TokenImage } from './TokenImage';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useNavigate } from 'react-router-dom';
import { fetchMetadata } from '../../utils/web3';
import { 
    calculateMaxSupply, 
} from '../../utils/format';
import { TokenBackgroundImage } from '../common/TokenBackgroundImage';

export const TokenCardSimple: React.FC<TokenCardMobileProps> = ({ token }) => {
    const navigate = useNavigate();
    const [metadata, setMetadata] = useState<TokenMetadataIPFS | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const handleCardClick = () => {
        navigate(`/token/${token.mint}`);
    };

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
        return (mintedSupply * 100) / totalSupplyToTargetEras;
    }, [mintedSupply, totalSupplyToTargetEras]);

    const feeRateInSol = useMemo(() => {
        return Number(token.feeRate) / LAMPORTS_PER_SOL;
    }, [token.feeRate]);

    const currentCost = useMemo(() => {
        const currentMintSize = Number(token.mintSizeEpoch) / LAMPORTS_PER_SOL;
        return currentMintSize > 0 ? feeRateInSol / currentMintSize : 0;
    }, [token.mintSizeEpoch, feeRateInSol]);

    const originalCost = useMemo(() => {
        const initialMintSize = Number(token.initialMintSize) / LAMPORTS_PER_SOL;
        return initialMintSize > 0 ? feeRateInSol / initialMintSize : 0;
    }, [token.initialMintSize, feeRateInSol]);
    return (
        <div 
            className="pixel-box p-4 cursor-pointer relative overflow-hidden w-32"
            onClick={handleCardClick}
        >
            <div className="flex flex-col items-center gap-2">
                <TokenImage
                    imageUrl={metadata?.image as string}
                    name={token.tokenName}
                    metadataTimestamp={Number(token.metadataTimestamp)}
                    className="w-12 h-12"
                />
                <div className="flex items-center gap-2">
                    <div className="badge badge-md badge-secondary">{token.tokenSymbol}</div>
                    <div className="badge badge-md badge-accent">+{(originalCost / currentCost - 1) * 100}%</div>
                </div>
                <div className="flex justify-between w-full">
                    <progress 
                        className="pixel-progress w-full" 
                        style={{height: '16px'}}
                        value={Math.min(progressPercentage, 100)} 
                        max="100"
                    ></progress>
                    <div className="text-sm ml-2">{progressPercentage.toFixed(1)}%</div>
                </div>
            </div>
        </div>
    );
};
