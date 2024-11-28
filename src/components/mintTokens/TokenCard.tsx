import React, { useEffect, useState, useMemo } from 'react';
import { 
    calculateMaxSupply, 
    calculateTargetMintTime,
    calculateMinTotalFee,
    extractIPFSHash
} from '../../utils/format';
import { TokenCardProps, TokenMetadataIPFS } from '../../types/types';
import { AddressDisplay } from '../common/AddressDisplay';
import { TokenImage } from './TokenImage';
import { PinataSDK } from 'pinata-web3';
import { FaTwitter, FaDiscord, FaGithub, FaMedium, FaTelegram, FaGlobe } from 'react-icons/fa';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useNavigate } from 'react-router-dom';

const pinata = new PinataSDK({
    pinataJwt: process.env.REACT_APP_PINATA_JWT,
    pinataGateway: process.env.REACT_APP_PINATA_GATEWAY
});

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

    const renderSocialIcons = () => {
        if (!metadata?.extensions) return null;

        const socialLinks = [
            { icon: FaTwitter, link: metadata.extensions.twitter },
            { icon: FaDiscord, link: metadata.extensions.discord },
            { icon: FaGithub, link: metadata.extensions.github },
            { icon: FaMedium, link: metadata.extensions.medium },
            { icon: FaTelegram, link: metadata.extensions.telegram },
            { icon: FaGlobe, link: metadata.extensions.website }
        ];

        return (
            <div className="absolute top-2 right-2 flex gap-1.5">
                {socialLinks.map((social, index) => (
                    social.link && (
                        <a
                            key={index}
                            href={social.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-6 h-6 flex items-center justify-center rounded-full bg-base-content/10 hover:bg-base-content/20 transition-colors"
                        >
                            <social.icon className="w-3 h-3 text-base-content" />
                        </a>
                    )
                ))}
            </div>
        );
    };

    return (
        <div 
            className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
            onClick={handleCardClick}
        >
            <div className="card-body p-4 relative">
                {renderSocialIcons()}
                <div className="absolute -top-6 -left-6 w-16 h-16 border-4 border-base-100 rounded-full shadow-lg overflow-hidden bg-white">
                    <TokenImage
                        uri={token.tokenUri}
                        name={token.tokenName}
                        className="w-full h-full"
                    />
                </div>
                <div className="ml-2 mt-5">
                    <h3 className="card-title text-base mb-2 ml-2">
                        {token.tokenSymbol} <span className="text-sm opacity-70">({token.tokenName})</span>
                    </h3>
                    <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                            <span className="text-base-content/70">Mint Fee: </span>
                            <span>{feeRateInSol} SOL</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-base-content/70">Current Mint Size: </span>
                            <span>{(Number(token.mintSizeEpoch) / LAMPORTS_PER_SOL).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                        </div>
                        <p className="flex justify-between">
                            <span className="text-base-content/70">Max Supply:</span>
                            <span>{calculateMaxSupply(token.epochesPerEra, token.initialTargetMintSizePerEpoch, token.reduceRatio).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                        </p>
                        <p className="flex justify-between">
                            <span className="text-base-content/70">Target Supply (Era:{token.targetEras}):</span>
                            <span>{totalSupplyToTargetEras.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                        </p>
                        <p className="flex justify-between">
                            <span className="text-base-content/70">Target Mint Time:</span>
                            <span>{targetMintTime}</span>
                        </p>
                        <p className="flex justify-between">
                            <span className="text-base-content/70">Target Minimum Fee:</span>
                            <span>{minTotalFee} SOL</span>
                        </p>
                        <p className="flex justify-between">
                            <span className="text-base-content/70">Liquidity Percentage:</span>
                            <span>{token.liquidityTokensRatio}%</span>
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
                <div className="mt-4">
                    <div className="text-sm font-medium mb-1">
                    {mintedSupply.toLocaleString(undefined, { maximumFractionDigits: 2 })} / {totalSupplyToTargetEras.toLocaleString(undefined, { maximumFractionDigits: 2 })} ({progressPercentage.toFixed(2)}%)
                    </div>
                    <div className="w-full bg-base-300 rounded-full h-2.5">
                        <div 
                            className="bg-secondary h-2.5 rounded-full" 
                            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
