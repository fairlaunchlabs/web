import { FC } from 'react';
import { InitiazlizedTokenData, TokenMetadataIPFS } from '../../types/types';
import { TokenImage } from '../mintTokens/TokenImage';
import { AddressDisplay } from '../common/AddressDisplay';
import { useNavigate } from 'react-router-dom';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { formatTimestamp } from '../../utils/format';
import { TokenBackgroundImage } from '../common/TokenBackgroundImage';

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
        <div className="pixel-box mb-4 p-4 cursor-pointer overflow-hidden relative">
            {metadata?.header && <TokenBackgroundImage imageUrl={metadata.header} metadataTimestamp={Number(token.metadataTimestamp)} />}
            <div className="relative z-10 flex items-start gap-4">
                <div className='flex flex-col items-center'>
                    {metadata?.image &&
                    <TokenImage 
                        imageUrl={metadata?.image} 
                        name={metadata?.name || token.tokenSymbol} 
                        metadataTimestamp={Number(token.metadataTimestamp)}
                        className="w-12 h-12"
                    />}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="badge badge-md badge-secondary">{metadata?.symbol || token.tokenSymbol}</h3>
                        <span className="text-sm">{token?.tokenName || metadata?.name}</span>
                    </div>

                    <div className="flex gap-2">
                        <div className="text-sm mt-0.5 opacity-70">Mint:</div>
                        <AddressDisplay address={token.mint} showCharacters={5} />
                    </div>
                    <div className="space-y-1">
                        <div className="flex gap-2">
                            <div className="text-sm mt-0.5 opacity-70">Supply:</div>
                            {(Number(token.supply) / LAMPORTS_PER_SOL).toLocaleString(undefined, { maximumFractionDigits: 2 })} {token.tokenSymbol}                            </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex gap-2">
                            <div className="text-sm mt-0.5 opacity-70">At:</div>
                            {formatTimestamp(Number(token.metadataTimestamp))}                            </div>
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
                            Metadata
                        </button>
                        <button 
                            className="btn btn-sm btn-success"
                            onClick={handleClick}
                        >
                            View
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};