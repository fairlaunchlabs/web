import React, { FC, useEffect, useMemo, useState } from 'react';
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
                    
                    {/* 显示详细内容 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                        <DataBlock label="Current Era" value={token.currentEra} />
                        <DataBlock label="Current Epoch" value={token.currentEpoch} />
                        <DataBlock label="Mint Fee" value={(Number(token.feeRate) / LAMPORTS_PER_SOL) + " SOL/Mint"} />
                        <DataBlock label="Current Mint Size" value={(Number(token.mintSizeEpoch) / LAMPORTS_PER_SOL).toLocaleString(undefined, { maximumFractionDigits: 2 }) + " " + token.tokenSymbol} />
                        <DataBlock label="Current minted" value={(mintedSupply).toLocaleString(undefined, { maximumFractionDigits: 2 }) + " " + token.tokenSymbol} />
                        <DataBlock label={`Target Supply (Era:${token.targetEras})`} value={totalSupplyToTargetEras.toLocaleString(undefined, { maximumFractionDigits: 2 }) + " " + token.tokenSymbol} />
                        <DataBlock label="Deploy at" value={new Date(Number(token.timestamp) * 1000).toLocaleString()} />
                        <DataBlock label='Deploying Tx' value={<AddressDisplay address={token.txId} type='tx' />} />
                        <DataBlock label="Start time of current epoch" value={new Date(Number(token.startTimestampEpoch) * 1000).toLocaleString()} />
                        <DataBlock label="Token Address" value={<AddressDisplay address={token.mint} />} />
                        <DataBlock label="Liquidity Vault (SOL)" value={<AddressDisplay address={token.configAccount} />} />
                        <DataBlock label={`Liquidity Vault (${token.tokenSymbol})`} value={<AddressDisplay address={token.tokenVault} />} />
                        <DataBlock label="Taget Eras" value={token.targetEras} />
                        <DataBlock label="Deployer" value={<AddressDisplay address={token.admin} />} />
                        <DataBlock label="Liquidity Tokens Ratio" value={token.liquidityTokensRatio + "%"} />
                        <DataBlock label="Max Supply" value={calculateMaxSupply(token.epochesPerEra, token.initialTargetMintSizePerEpoch, token.reduceRatio).toLocaleString(undefined, { maximumFractionDigits: 2 }) + " " + token.tokenSymbol} />
                        <DataBlock label="Target Mint Time" value={formatDays(Number(token.targetSecondsPerEpoch) * Number(token.epochesPerEra))} />
                        <DataBlock label="Reduce Ratio per Era" value={token.reduceRatio + "%"} />
                        <DataBlock label="Target Minimum Fee" value={calculateMinTotalFee(
                            token.initialTargetMintSizePerEpoch,
                            token.feeRate,
                            token.targetEras,
                            token.epochesPerEra,
                            token.initialMintSize
                        ) + " SOL"} />
                        <DataBlock label="Epoches per Era" value={token.epochesPerEra} />
                        <DataBlock label="Current mint fee" value={(Number(token.totalMintFee) / LAMPORTS_PER_SOL).toLocaleString(undefined, { maximumFractionDigits: 2 }) + " SOL"} />
                        <DataBlock label="Current referral fee" value={(Number(token.totalReferrerFee) / LAMPORTS_PER_SOL).toLocaleString(undefined, { maximumFractionDigits: 2 }) + " SOL"} />
                        <DataBlock label="Difficulty of current epoch" value={token.difficultyCoefficientEpoch} />
                        <DataBlock label="Difficulty of Last epoch" value={token.lastDifficultyCoefficientEpoch} />
                    </div>
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
                        {(Number(token.quantityMintedEpoch) / LAMPORTS_PER_SOL).toLocaleString(undefined, { maximumFractionDigits: 2 })} / {(Number(token.targetMintSizeEpoch) / LAMPORTS_PER_SOL).toLocaleString(undefined, { maximumFractionDigits: 2 })} ({progressPercentage.toFixed(2)}%)
                        </div>
                        <div className="w-full bg-base-300 rounded-full h-2.5">
                            <div 
                                className="bg-secondary h-2.5 rounded-full" 
                                style={{ width: `${Math.min(Number(token.quantityMintedEpoch) * 100 / Number(token.targetMintSizeEpoch), 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

type DataBlockProps = {
    label: string;
    value: any;
}
export const DataBlock:FC<DataBlockProps> = ({label, value}) => {
    return (
        <div className="space-y-2">
        <h3 className="font-semibold text-base-content">{label}</h3>
        {value}
    </div>
    )
}