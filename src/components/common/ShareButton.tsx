import React, { useRef, useState } from 'react';
import { TwitterShareButton } from 'react-share';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import ReactDOM from 'react-dom';
import { ShareButtonProps } from '../../types/types';
import { APP_NAME } from '../../config/constants';

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

    // TODO: 以后完善分享图片
    const handleDownloadImage = async () => {
        if (isGenerating) return;
        setIsGenerating(true);
        setIsOpen(false);

        try {
            // Create canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;
            
            // Set canvas size
            canvas.width = 600;
            canvas.height = 400;
            
            // Fill background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw token name
            ctx.font = 'bold 24px Arial';
            ctx.fillStyle = '#000000';
            ctx.fillText(token.tokenName, 20, 40);
            
            // Draw token symbol
            ctx.font = '18px Arial';
            ctx.fillText(token.tokenSymbol, 20, 70);

            // Generate QR code in a temporary element
            const qrWrapper = document.createElement('div');
            ReactDOM.render(
                React.createElement(QRCodeSVG, {
                    value: currentUrl,
                    size: 150,
                    level: 'L'
                }),
                qrWrapper
            );

            // Convert QR code SVG to image
            const qrSvg = qrWrapper.querySelector('svg');
            if (qrSvg) {
                const svgData = new XMLSerializer().serializeToString(qrSvg);
                const img = new Image();
                img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
                
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                });

                // Draw QR code
                ctx.drawImage(img, 20, 100, 150, 150);
            }

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

    return (
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

            {/* Hidden QR code for image generation */}
            <div className="hidden">
                <div ref={qrCodeRef} id="share-qr-code">
                    <QRCodeSVG value={currentUrl} size={150} />
                </div>
            </div>
        </div>
    );
};
