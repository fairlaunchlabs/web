import React, { useEffect, useState } from 'react';
import { InitiazlizedTokenData, TokenMetadataIPFS } from '../../types/types';
import { 
    calculateMaxSupply, 
    calculateTargetMintTime,
    calculateMinTotalFee,
    extractIPFSHash,
    formatDays
} from '../../utils/format';
import { AddressDisplay } from '../common/AddressDisplay';
import { TokenImage } from '../mintTokens/TokenImage';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { PinataSDK } from 'pinata-web3';
import { RenderSocialIcons } from '../mintTokens/RenderSocialIcons';

interface TokenInfoProps {
    token: InitiazlizedTokenData;
}

const pinata = new PinataSDK({
    pinataJwt: process.env.REACT_APP_PINATA_JWT,
    pinataGateway: process.env.REACT_APP_PINATA_GATEWAY
});

export const TokenInfo: React.FC<TokenInfoProps> = ({ token }) => {
    const [metadata, setMetadata] = useState<TokenMetadataIPFS | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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
    
    return (
        <div className="bg-base-200 rounded-lg shadow-lg p-6">
            <div className="flex items-start gap-6">
                <div className="w-24 h-24 overflow-hidden">
                    <TokenImage imageUrl={metadata?.image as string} name={token.tokenName} size={84} className='rounded-2xl' />
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                        <div className="space-y-2">
                            <h3 className="font-semibold text-base-content">Token Address</h3>
                            <AddressDisplay address={token.mint} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold text-base-content">Total Supply</h3>
                            <p className="text-base-content">{Number(token.supply) / LAMPORTS_PER_SOL} {token.tokenSymbol}</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold text-base-content">Max Supply</h3>
                            <p className="text-base-content">{calculateMaxSupply(
                                token.epochesPerEra,
                                token.initialTargetMintSizePerEpoch,
                                token.reduceRatio
                            )} {token.tokenSymbol}</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold text-base-content">Target Mint Time</h3>
                            <p className="text-base-content">{formatDays(Number(token.targetSecondsPerEpoch) * Number(token.epochesPerEra))}</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold text-base-content">Reduce Ratio</h3>
                            <p className="text-base-content">{token.reduceRatio}%</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold text-base-content">Min Total Fee</h3>
                            <p className="text-base-content">{calculateMinTotalFee(
                                token.initialTargetMintSizePerEpoch,
                                token.feeRate,
                                token.targetEras,
                                token.epochesPerEra,
                                token.initialMintSize
                            )} SOL</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
