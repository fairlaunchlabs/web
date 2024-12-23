import React, { useState } from 'react';
import { TwitterShareButton } from 'react-share';
import toast from 'react-hot-toast';
import { InitiazlizedTokenData, ShareButtonProps, TokenMetadataIPFS } from '../../types/types';
import { APP_NAME } from '../../config/constants';
import { drawShareImage } from '../../utils/shareimage';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { getMintDiscount } from '../../utils/web3';
import { ModalTopBar } from './ModalTopBar';

export const ShareButton: React.FC<ShareButtonProps> = ({ token, metadata, inputCode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const currentUrl = window.location.href;
    const wallet = useAnchorWallet();
    const { connection } = useConnection();
    const [showURCModal, setShowURCModal] = useState(false);
    const [urcCode, setUrcCode] = useState(inputCode || '');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(currentUrl);
            toast.success('Link copied to clipboard!');
        } catch (err) {
            toast.error('Failed to copy link');
        }
    };

    const handleURCSubmit = async () => {
        if (!urcCode.trim()) {
            toast.error('Please enter a URC code');
            return;
        }
        setIsProcessing(true);
        try {
            await handleDownloadImageWithCode(urcCode);
        } finally {
            setIsProcessing(false);
            setShowURCModal(false);
            setUrcCode('');
        }
    };

    const handleDownloadImageWithCode = async (code: string) => {
        try {
            const discount = await getMintDiscount(wallet, connection, token, code);
            if (!discount.success) {
                toast.error(discount.message as string);
                return;
            }

            setIsGenerating(true);
            setIsOpen(false);
            
            // Create canvas
            const canvas = await drawShareImage(
                token as InitiazlizedTokenData, 
                metadata as TokenMetadataIPFS,
                discount.data as string,
                urcCode,
                currentUrl, 
            );
            // Download image
            const link = document.createElement('a');
            link.download = `${token.tokenSymbol}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();

            setIsGenerating(false);
            toast.success('Image downloaded successfully!');
        } catch (error) {
            console.error('Failed to generate image:', error);
            toast.error('Failed to generate image');
            setIsGenerating(false);
        }
    };

    const handleDownloadImage = async () => {
        if (isGenerating) return;

        if (urcCode === null || urcCode === undefined || urcCode === '') {
            setShowURCModal(true);
            return;
        }

        await handleDownloadImageWithCode(urcCode);
    };

    return (
        <>
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="btn btn-primary btn-sm flex items-center gap-2"
                    disabled={isGenerating}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                        <polyline points="16 6 12 2 8 6"></polyline>
                        <line x1="12" y1="2" x2="12" y2="15"></line>
                    </svg>
                    Share
                </button>

                {isOpen && (
                    <div className='absolute right-0 mt-2 w-48 pixel-box z-50' style={{ padding: 0 }}>
                        <div className="py-1" role="menu">
                            <button
                                className="w-full px-4 py-2 text-sm text-left hover:bg-base-200 flex items-center gap-2"
                                onClick={handleCopyLink}
                            >
                                <svg className='w-5 h-5' fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M4 6h7v2H4v8h7v2H2V6h2zm16 0h-7v2h7v8h-7v2h9V6h-2zm-3 5H7v2h10v-2z" fill="currentColor"/> </svg>
                                Copy Link
                            </button>
                            
                            <div className="w-full px-4 py-2 text-sm text-left hover:bg-base-200">
                                <TwitterShareButton
                                    url={currentUrl}
                                    title={`Hey buddy, joint me to mint ${token.tokenSymbol} on ${APP_NAME}!`}
                                    className="flex items-center gap-2"
                                >
                                    <svg className='w-5 h-5' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                                    </svg>
                                    X(Twitter)
                                </TwitterShareButton>
                            </div>

                            <button
                                className="w-full px-4 py-2 text-sm text-left hover:bg-base-200 flex items-center gap-2"
                                onClick={handleDownloadImage}
                                disabled={isGenerating}
                            >
                                <svg className='w-5 h-5' fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M13 17V3h-2v10H9v-2H7v2h2v2h2v2h2zm8 2v-4h-2v4H5v-4H3v6h18v-2zm-8-6v2h2v-2h2v-2h-2v2h-2z" fill="currentColor"/> </svg>
                                Share Image
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* URC Code Input Modal */}
            {showURCModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="modal-box pixel-box p-6 max-w-md w-full mx-4">
                        <ModalTopBar title="Enter URC Code" onClose={() => {setShowURCModal(false); setUrcCode('');}} />
                        <input
                            type="text"
                            value={urcCode}
                            onChange={(e) => setUrcCode(e.target.value)}
                            placeholder="Enter your URC code"
                            className="input w-full mb-4"
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={handleURCSubmit}
                                className="btn btn-primary btn-sm"
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'Processing...' : 'Submit'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
