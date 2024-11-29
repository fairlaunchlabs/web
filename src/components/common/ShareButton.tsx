import React, { useRef, useState } from 'react';
import { TwitterShareButton } from 'react-share';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';
import ReactDOM from 'react-dom';
import { InitiazlizedTokenData } from '../../types/types';
import { APP_NAME } from '../../config/constants';

interface ShareButtonProps {
    token: InitiazlizedTokenData;
}

export const ShareButton: React.FC<ShareButtonProps> = ({ token }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const qrCodeRef = useRef<HTMLDivElement>(null);
    const currentUrl = window.location.href;

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(currentUrl);
            toast.success('Link copied to clipboard!');
        } catch (err) {
            toast.error('Failed to copy link');
        }
    };

    const handleDownloadImage = async () => {
        if (isGenerating) return;
        setIsGenerating(true);
        setIsOpen(false);

        try {
            // Create container
            const container = document.createElement('div');
            container.style.position = 'fixed';
            container.style.left = '-9999px';
            container.style.width = '600px';
            container.style.padding = '20px';
            container.style.backgroundColor = '#ffffff';

            // Add token name
            const nameElement = document.createElement('h1');
            nameElement.textContent = token.tokenName;
            nameElement.style.fontSize = '24px';
            nameElement.style.marginBottom = '10px';
            container.appendChild(nameElement);

            // Add token symbol
            const symbolElement = document.createElement('div');
            symbolElement.textContent = token.tokenSymbol;
            symbolElement.style.fontSize = '18px';
            symbolElement.style.marginBottom = '20px';
            container.appendChild(symbolElement);

            // Add QR code
            const qrContainer = document.createElement('div');
            const qrWrapper = document.createElement('div');
            ReactDOM.render(
                React.createElement(QRCodeSVG, {
                    value: currentUrl,
                    size: 150,
                    level: 'L'
                }),
                qrWrapper
            );
            qrContainer.appendChild(qrWrapper.firstChild!);
            container.appendChild(qrContainer);

            // Add to document temporarily
            document.body.appendChild(container);

            // Generate image
            const canvas = await html2canvas(container, {
                width: 600,
                scale: 2,
                backgroundColor: '#ffffff'
            });

            // Download image
            const link = document.createElement('a');
            link.download = `${token.tokenSymbol}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();

            // Cleanup
            document.body.removeChild(container);
            setIsGenerating(false);
        } catch (error) {
            console.error('Failed to generate image:', error);
            toast.error('Failed to generate image');
            setIsGenerating(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="btn btn-primary btn-sm"
                disabled={isGenerating}
            >
                Share
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-base-100 ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1" role="menu">
                        <button
                            className="w-full px-4 py-2 text-sm text-left hover:bg-base-200 flex items-center gap-2"
                            onClick={handleCopyLink}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                            </svg>
                            Copy Link
                        </button>
                        
                        <div className="w-full px-4 py-2 text-sm text-left hover:bg-base-200">
                            <TwitterShareButton
                                url={currentUrl}
                                title={`Hey buddy, joint me to mint ${token.tokenSymbol} on ${APP_NAME}!`}
                                className="flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                                </svg>
                                Share on X(Twitter)
                            </TwitterShareButton>
                        </div>

                        <button
                            className="w-full px-4 py-2 text-sm text-left hover:bg-base-200 flex items-center gap-2"
                            onClick={handleDownloadImage}
                            disabled={isGenerating}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            Share Image
                        </button>
                    </div>
                </div>
            )}

            {/* Hidden QR code for image generation */}
            <div className="hidden">
                <div ref={qrCodeRef} id="share-qr-code">
                    <QRCodeSVG value={currentUrl} size={150} />
                </div>
            </div>
        </div>
    );
};
