import { FC } from 'react';
import { InitiazlizedTokenData, TokenMetadataIPFS } from '../../types/types';
import { TokenImage } from '../mintTokens/TokenImage';
import { AddressDisplay } from '../common/AddressDisplay';
import { useNavigate } from 'react-router-dom';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { formatTimestamp } from '../../utils/format';

type MyDeploymentCardProps = {
    token: InitiazlizedTokenData;
    metadata: TokenMetadataIPFS | undefined;
    setSelectedToken: (token: InitiazlizedTokenData) => void;
    setIsCloseModalOpen: (isOpen: boolean) => void;
    setIsUpdateModalOpen: (isOpen: boolean) => void;
}

export const MyDeploymentCard: FC<MyDeploymentCardProps> = ({
    token,
    metadata,
    setSelectedToken,
    setIsCloseModalOpen,
    setIsUpdateModalOpen,
}) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/token/${token.mint}`);
    };

    const handleButtonClick = (e: React.MouseEvent, callback: () => void) => {
        e.stopPropagation();
        callback();
    };

    const handleCloseToken = (e: React.MouseEvent) => {
        handleButtonClick(e, () => {
            setSelectedToken(token);
            setIsCloseModalOpen(true);
        });
    };

    const handleUpdateMetadata = (e: React.MouseEvent) => {
        handleButtonClick(e, () => {
            setSelectedToken(token);
            setIsUpdateModalOpen(true);
        });
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
                <div className="flex items-center gap-4">
                    {metadata?.image &&
                    <TokenImage 
                        imageUrl={metadata?.image} 
                        name={metadata?.name || token.tokenSymbol} 
                        launchTimestamp={Number(token.metadataTimestamp)}
                        size={48}
                        className="rounded-lg"
                    />}
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <h3 className="text-lg font-semibold truncate">
                                {metadata?.name || token.tokenSymbol}
                            </h3>
                            <span className="text-sm text-base-content/60 mt-1">
                                {formatTimestamp(Number(token.timestamp))}
                            </span>
                        </div>
                        <div className="mt-1">
                            <AddressDisplay address={token.mint} />
                        </div>
                        <div className="mt-1">
                            Supply: {(Number(token.supply) / LAMPORTS_PER_SOL).toLocaleString(undefined, { maximumFractionDigits: 2 })} {token.tokenSymbol}
                        </div>
                        <div className="flex gap-2 justify-end mt-2">
                            {token.supply === "0" && (
                                <button 
                                    className="btn btn-sm btn-error"
                                    onClick={handleCloseToken}
                                >
                                    Close Mint
                                </button>
                            )}
                            <button 
                                className="btn btn-sm btn-primary"
                                onClick={handleUpdateMetadata}
                            >
                                Update Metadata
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};