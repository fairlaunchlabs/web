import React, { useEffect, useState } from 'react';
import { 
    calculateMaxSupply, 
    calculateTotalSupplyToTargetEras,
    calculateTargetMintTime,
    calculateMinTotalFee,
    extractIPFSHash
} from '../../utils/format';
import { TokenCardProps, TokenMetadataIPFS } from '../../types/types';
import { AddressDisplay } from '../common/AddressDisplay';
import { TokenImage } from './TokenImage';
import { PinataSDK } from 'pinata-web3';
import { FaTwitter, FaDiscord, FaGithub, FaMedium, FaTelegram, FaGlobe } from 'react-icons/fa';

const pinata = new PinataSDK({
    pinataJwt: process.env.REACT_APP_PINATA_JWT,
    pinataGateway: process.env.REACT_APP_PINATA_GATEWAY
});

export const TokenCard: React.FC<TokenCardProps> = ({ token }) => {
    const [metadata, setMetadata] = useState<TokenMetadataIPFS | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const response = await pinata.gateways.get(extractIPFSHash(token.tokenUri) as string);
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

    const maxSupply = calculateMaxSupply(
        token.epochesPerEra,
        token.initialTargetMintSizePerEpoch,
        token.reduceRatio
    );

    const totalSupplyToTargetEras = calculateTotalSupplyToTargetEras(
        token.epochesPerEra,
        token.initialTargetMintSizePerEpoch,
        token.reduceRatio,
        token.targetEras
    );

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
        <div className="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow max-w-sm">
            <div className="card-body p-4 relative">
                {renderSocialIcons()}
                <div className="absolute -top-6 -left-6 w-16 h-16 border-4 border-base-200 rounded-full shadow-lg overflow-hidden">
                    <TokenImage
                        uri={token.tokenUri}
                        name={token.tokenName}
                        className="w-full h-full"
                    />
                </div>
                <div className="ml-8 mt-5">
                    <h3 className="card-title text-base mb-2">
                        {token.tokenSymbol} <span className="text-sm opacity-70">({token.tokenName})</span>
                    </h3>
                    <div className="space-y-1 text-xs">
                        <p className="flex justify-between">
                            <span className="text-base-content/70">Max Supply:</span>
                            <span>{maxSupply}</span>
                        </p>
                        <p className="flex justify-between">
                            <span className="text-base-content/70">Target Supply:</span>
                            <span>{totalSupplyToTargetEras}</span>
                        </p>
                        <p className="flex justify-between">
                            <span className="text-base-content/70">Target Mint Time:</span>
                            <span>{targetMintTime}</span>
                        </p>
                        <p className="flex justify-between">
                            <span className="text-base-content/70">Target Minimum Fee:</span>
                            <span>{minTotalFee} SOL</span>
                        </p>
                        <div className="flex justify-between items-center">
                            <span className="text-base-content/70">Deployer:</span>
                            <AddressDisplay address={token.admin} />
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-base-content/70">Token Mint:</span>
                            <AddressDisplay address={token.mint} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
