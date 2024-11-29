import React, { useRef, useState } from 'react';
import { TwitterShareButton, TwitterIcon } from 'react-share';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';
import { InitiazlizedTokenData } from '../../types/types';
import { APP_NAME } from '../../config/constants';

interface ShareButtonProps {
    token: InitiazlizedTokenData;
}

export const ShareButton: React.FC<ShareButtonProps> = ({ token }) => {
    const [isOpen, setIsOpen] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const currentUrl = window.location.href;

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(currentUrl);
            toast.success('Link copied to clipboard!');
        } catch (err) {
            toast.error('Failed to copy link:');
        }
    };

    const handleDownloadImage = async () => {
        if (!contentRef.current) return;
        try {
            const canvas = await html2canvas(document.body, {
                windowWidth: 1200,
                windowHeight: 800,
                scale: 2,
                logging: false,
                useCORS: true
            });

            // Create a new canvas with extra space for QR code
            const finalCanvas = document.createElement('canvas');
            const ctx = finalCanvas.getContext('2d');
            if (!ctx) return;

            // Set dimensions for the final image
            finalCanvas.width = canvas.width;
            finalCanvas.height = canvas.height + 200; // Extra space for QR code

            // Draw the screenshot
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
            ctx.drawImage(canvas, 0, 0);

            // Create QR code
            const qrCanvas = document.createElement('canvas');
            qrCanvas.width = 150;
            qrCanvas.height = 150;
            const qrCtx = qrCanvas.getContext('2d');
            if (!qrCtx) return;

            // Convert SVG QR code to canvas
            const qrSvg = document.getElementById('share-qr-code');
            if (qrSvg) {
                const svgData = new XMLSerializer().serializeToString(qrSvg);
                const img = new Image();
                img.onload = () => {
                    qrCtx.drawImage(img, 0, 0, 150, 150);
                    // Draw QR code on the final canvas
                    ctx.drawImage(qrCanvas, finalCanvas.width - 170, canvas.height + 25);
                    
                    // Add URL text
                    ctx.font = '14px Arial';
                    ctx.fillStyle = '#000000';
                    ctx.fillText(currentUrl, 20, canvas.height + 100);

                    // Convert to image and download
                    const link = document.createElement('a');
                    link.download = 'share.png';
                    link.href = finalCanvas.toDataURL('image/png');
                    link.click();
                };
                img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
            }
        } catch (err) {
            console.error('Failed to generate image:', err);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="btn btn-primary btn-sm"
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
                        
                        <div className="px-4 py-2 text-sm">
                            <TwitterShareButton
                                url={currentUrl}
                                title={`Hey buddy, joint me to mint ${token.tokenSymbol} on ${APP_NAME}!`}
                                className="w-full text-left hover:bg-base-200 flex items-center gap-2"
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
                <div id="share-qr-code">
                    <QRCodeSVG value={currentUrl} size={150} />
                </div>
            </div>
        </div>
    );
};
