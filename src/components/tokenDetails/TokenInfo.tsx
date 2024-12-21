import React, { FC, useEffect, useMemo, useState, useRef } from 'react';
import { DataBlockProps, TokenInfoProps, TokenMetadataIPFS } from '../../types/types';
import { fetchMetadata } from '../../utils/web3';
import MintModal from '../mintTokens/MintModal';
import { ReferralCodeModal } from '../myAccount/ReferralCodeModal';
import { TokenHero } from './TokenHero';
import { useDeviceType } from '../../utils/contexts';
import { TokenHeroMobile } from './TokenHeroMobile';
import { TokenInfoData } from './TokenInfoData';
import { TokenInfoDataMobile } from './TokenInfoDataMobile';

export const TokenInfo: React.FC<TokenInfoProps> = ({ token, referrerCode }) => {
    const [metadata, setMetadata] = useState<TokenMetadataIPFS | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
    const { isMobile } = useDeviceType();

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
    
    const hasStarted = !token.startTimestamp || Number(token.startTimestamp) <= Math.floor(Date.now() / 1000);

    return (
        <div className="w-full space-y-0">
            <div className='mb-4'>
            {isMobile ? 
                <TokenHeroMobile token={token} metadata={metadata as TokenMetadataIPFS} /> 
              : <TokenHero token={token} metadata={metadata as TokenMetadataIPFS} />}
            </div>
            <div className="pixel-box">
                {isMobile ? 
                    <TokenInfoDataMobile token={token} metadata={metadata as TokenMetadataIPFS} hasStarted={hasStarted} />
                  : <TokenInfoData token={token} metadata={metadata as TokenMetadataIPFS} hasStarted={hasStarted} />}
                
                {hasStarted ?
                (
                <div>
                    <div className="flex justify-between mt-3 md:mt-8">
                        <div className='w-1/2 px-3'>
                            <button className="btn w-full btn-primary" onClick={() => setIsModalOpen(true)}>
                                Mint
                            </button>
                        </div>
                        <div className='w-1/2 px-3'>
                            <button className="btn w-full btn-secondary" onClick={() => setIsReferralModalOpen(true)}>
                                Unique Referral Code
                            </button>
                        </div>
                    </div>
                </div>
                ):(
                <div className="mt-8">
                    <button className="btn w-full btn-secondary" onClick={() => setIsReferralModalOpen(true)}>
                        Unique Referral Code
                    </button>
                </div>)}
            </div>

            <MintModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                token={token}
                referrerCode={referrerCode}
            />
            <ReferralCodeModal
                isOpen={isReferralModalOpen}
                onClose={() => {
                    setIsReferralModalOpen(false);
                }}
                token={{
                    mint: token.mint,
                    amount: '',
                    tokenData: token
                }}
            />
        </div>
    );
};

export const DataBlock:FC<DataBlockProps> = ({label, value, tooltip}) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const iconRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (tooltipRef.current && 
                !tooltipRef.current.contains(event.target as Node) &&
                iconRef.current &&
                !iconRef.current.contains(event.target as Node)) {
                setShowTooltip(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="space-y-0">
            <div className="relative">
                <h3 className="text-base-content inline-flex items-center gap-1">
                    {label}
                    {tooltip && (
                        <>
                            <span 
                                ref={iconRef}
                                className="cursor-pointer"
                                onClick={() => setShowTooltip(!showTooltip)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-4 h-4 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </span>
                            <div 
                                ref={tooltipRef}
                                className={`absolute left-0 top-full mt-2 px-3 py-2 bg-base-300 text-base-content text-sm rounded-lg shadow-lg transition-all duration-200 w-full break-words z-10 ${
                                    showTooltip ? 'opacity-100 visible' : 'opacity-0 invisible'
                                }`}
                            >
                                {tooltip}
                                <div className="absolute bottom-full left-4 transform -translate-x-1/2">
                                    <div className="border-8 border-transparent border-b-base-300"></div>
                                </div>
                            </div>
                        </>
                    )}
                </h3>
                <div className="text-base-content break-all">
                    {value}
                </div>
            </div>
        </div>
    )
}