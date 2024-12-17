import { FC } from 'react';
import { InitiazlizedTokenData, TokenMetadataIPFS } from '../../types/types';
import { TokenImage } from '../mintTokens/TokenImage';
import { AddressDisplay } from '../common/AddressDisplay';
import { useNavigate } from 'react-router-dom';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useDeviceType } from '../../utils/contexts';

interface MyUniqueReferralCodeCardProps {
    token: InitiazlizedTokenData;
    metadata: TokenMetadataIPFS | undefined;
    bonus: number;
    onGetURC: (token: InitiazlizedTokenData) => void;
    onBonusDetail: (mint: string, bonus: number) => void;
}

export const MyUniqueReferralCodeCard: FC<MyUniqueReferralCodeCardProps> = ({
    token,
    metadata,
    bonus,
    onGetURC,
    onBonusDetail,
}) => {
    const navigate = useNavigate();
    const { isMobile } = useDeviceType();

    const handleClick = () => {
        navigate(`/token/${token.mint}`);
    };

    const handleButtonClick = (e: React.MouseEvent, callback: () => void) => {
        e.stopPropagation();
        callback();
    };

    const handleGetURC = (e: React.MouseEvent) => {
        handleButtonClick(e, () => onGetURC(token));
    };

    const handleBonusDetail = (e: React.MouseEvent) => {
        handleButtonClick(e, () => onBonusDetail(token.mint, bonus));
    };

    return (
        <div className="pixel-box mb-4 p-4 cursor-pointer overflow-hidden relative" onClick={handleClick}>
            {metadata?.header && (
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-30" 
                    style={{ 
                        backgroundImage: `url(${metadata.header})`,
                        filter: 'blur(2px)'
                    }}
                />
            )}
            <div className="relative z-10">
                <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                        {metadata?.image && 
                        <TokenImage 
                            imageUrl={metadata?.image} 
                            name={metadata?.name || token.tokenSymbol} 
                            launchTimestamp={Number(token.metadataTimestamp)}
                            size={48}
                            className="rounded-lg"
                        />}
                        <div className="mt-1 text-sm opacity-70">Bonus</div>
                        <div className="font-semibold">{bonus.toFixed(4)} SOL</div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="badge badge-md badge-secondary">{token.tokenSymbol}</h3>
                                    <span className="text-sm">{metadata?.name}</span>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex gap-2">
                                        <div className="text-sm mt-0.5 opacity-70">Mint:</div>
                                        <AddressDisplay address={token.mint} showCharacters={isMobile ? 5 : 10} />
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="text-sm mt-0.5 opacity-70">Dev:</div>
                                        <AddressDisplay address={token.admin} showCharacters={isMobile ? 5 : 10} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end mt-4">
                            <button 
                                className="btn btn-sm btn-primary"
                                onClick={handleGetURC}
                            >
                                Code Detail
                            </button>
                            <button 
                                className="btn btn-sm btn-secondary"
                                onClick={handleBonusDetail}
                            >
                                Bonus Detail
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};