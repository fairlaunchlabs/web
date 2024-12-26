import { FC } from 'react';
import { TokenListItem } from '../../types/types';
import { TokenImage } from '../mintTokens/TokenImage';
import { AddressDisplay } from '../common/AddressDisplay';
import { useNavigate } from 'react-router-dom';
import { useDeviceType } from '../../utils/contexts';
import { BN_LAMPORTS_PER_SOL, numberStringToBN } from '../../utils/format';
import { TokenBackgroundImage } from '../common/TokenBackgroundImage';

interface MyMintedTokenCardProps {
    token: TokenListItem;
    onRefund?: (token: TokenListItem) => void;
    onCode?: (token: TokenListItem) => void;
    onThaw?: (token: TokenListItem) => void;
    isFrozen?: boolean
}

export const MyMintedTokenCard: FC<MyMintedTokenCardProps> = ({
    token,
    onRefund,
    onCode,
    onThaw,
    isFrozen
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

    const handleGetMore = (e: React.MouseEvent) => {
        handleButtonClick(e, () => navigate(`/token/${token.mint}`));
    };

    const handleRefund = (e: React.MouseEvent) => {
        if (onRefund) {
            handleButtonClick(e, () => onRefund(token));
        }
    };

    const handleCode = (e: React.MouseEvent) => {
        if (onCode) {
            handleButtonClick(e, () => onCode(token));
        }
    };

    const handleThaw = (e: React.MouseEvent) => {
        if (onThaw) {
            handleButtonClick(e, () => onThaw(token));
        }
    };

    return (
        <div className="pixel-box mb-4 p-4 cursor-pointer overflow-hidden relative">
            {token.metadata?.header && <TokenBackgroundImage imageUrl={token.metadata.header} metadataTimestamp={Number(token.tokenData?.metadataTimestamp) || 0} />}
            <div className="relative z-10 flex items-start gap-4">
                <div className="flex flex-col items-center">
                    {token.metadata?.image && 
                    <TokenImage 
                        imageUrl={token.metadata?.image}
                        name={token.tokenData?.tokenName || 'Unknown'}
                        metadataTimestamp={Number(token.tokenData?.metadataTimestamp) || 0}
                        className="w-12 h-12"
                    />}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="badge badge-md badge-secondary">{token.tokenData?.tokenSymbol || 'Unknown'}</h3>
                                <span className="text-sm">{token.tokenData?.tokenName || 'Unknown'}</span>
                                {isFrozen ? 
                                <svg fill="none" className='w-5 h-5 text-error' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M15 2H9v2H7v2h2V4h6v4H4v14h16V8h-3V4h-2V2zm0 8h3v10H6V10h9zm-2 3h-2v4h2v-4z" fill="currentColor"/> </svg>
                                :
                                <svg fill="none" className='w-5 h-5 text-success' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M15 2H9v2H7v2h2V4h6v4H4v14h16V8h-3V4h-2V2zm0 8h3v10H6V10h9zm-2 3h-2v4h2v-4z" fill="currentColor"/> </svg>}
                            </div>
                            <div className="space-y-1">
                                <div className="flex gap-2">
                                    <div className="text-sm mt-0.5 opacity-70">Mint:</div>
                                    <AddressDisplay address={token.mint} showCharacters={isMobile ? 5 : 10} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex gap-2">
                                    <div className="text-sm mt-0.5 opacity-70">Balance:</div>
                                        {(numberStringToBN(token.amount).div(BN_LAMPORTS_PER_SOL)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {token.tokenData?.tokenSymbol}
                                    </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 justify-end mt-4">
                        <button 
                            className="btn btn-sm btn-error"
                            onClick={handleRefund}
                        >
                            Refund
                        </button>
                        <button 
                            className="btn btn-sm btn-primary"
                            onClick={handleCode}
                        >
                            Code
                        </button>

                        {Number(token.tokenData?.currentEra) > Number(token.tokenData?.targetEras) && isFrozen && (
                        <button 
                            className="btn btn-sm btn-info"
                            onClick={handleThaw}
                        >
                            Thaw
                        </button>)}

                        <button 
                            className="btn btn-sm btn-success"
                            onClick={handleGetMore}
                        >
                            View
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};