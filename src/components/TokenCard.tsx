import React, { useEffect, useState } from 'react';
import { 
    formatAddress, 
    formatSeconds, 
    calculateMaxSupply, 
    calculateTotalSupplyToTargetEras,
    calculateTargetMintTime,
    calculateMinTotalFee,
    extractIPFSHash
} from '../utils/format';
import { InitiazlizedTokenData, TokenCardProps, TokenMetadata, TokenMetadataIPFS } from '../types/types';
import { AddressDisplay } from './AddressDisplay';
import { TokenImage } from './TokenImage';
import { PinataSDK } from 'pinata-web3';
import { Token } from 'graphql';

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
                console.log('Metadata response:', response.data);
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

    return (
        <div className="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow max-w-sm">
            <div className="card-body p-4 relative">
                <div className="absolute -top-6 -left-6 w-16 h-16 border-4 border-base-200 rounded-full shadow-lg overflow-hidden">
                    <TokenImage
                        uri={token.tokenUri}
                        name={token.tokenName}
                        className="w-full h-full"
                    />
                </div>
                <div className="ml-8 mt-2">
                    <h3 className="card-title text-base mb-2">
                        {token.tokenName} <span className="text-sm opacity-70">({token.tokenSymbol})</span>
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
