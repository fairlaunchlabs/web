import React, { useState, useEffect } from 'react';
import { extractIPFSHash } from '../../utils/format';
import { PinataSDK } from 'pinata-web3';
import { TokenImageProps } from '../../types/types';

// Simple in-memory cache for metadata and image URLs
const metadataCache = new Map<string, { image: string; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Initialize Pinata client
const pinata = new PinataSDK({
    pinataJwt: process.env.REACT_APP_PINATA_JWT,
    pinataGateway: process.env.REACT_APP_PINATA_GATEWAY
});

export const TokenImage: React.FC<TokenImageProps> = ({ 
    imageUrl, 
    name,
    size = 64, 
    className = ''
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [imageData, setImageData] = useState("");
    const fetchImage = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Get image data from Pinata gateway
            const cid = extractIPFSHash(imageUrl as string);
            if (!cid) {
                throw new Error('Invalid IPFS hash');
            }
            const imageResponse = await pinata.gateways.get(cid);
            
            // Type-safe Blob creation with fallback
            const blobPart = imageResponse.data instanceof Blob 
                ? imageResponse.data 
                : typeof imageResponse.data === 'string' 
                    ? new Blob([imageResponse.data], { type: imageResponse.contentType as string }) 
                    : new Blob([JSON.stringify(imageResponse.data)], { type: 'application/json' });
            
            const blob = new Blob([blobPart], { type: imageResponse.contentType as string });
            const objectUrl = URL.createObjectURL(blob);
            setImageData(objectUrl);
            setIsLoading(false);
            setRetryCount(0); // Reset retry count on success
        } catch (err) {
            console.error('Error loading token image:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
            setIsLoading(false);

            // Retry logic with exponential backoff
            if (retryCount < 3) {
                const backoffTime = Math.pow(2, retryCount) * 1000;
                setTimeout(() => {
                    setRetryCount(prev => prev + 1);
                    setIsLoading(true);
                }, backoffTime);
            }
        }
    };

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        if (imageUrl) {
            fetchImage();
        }

        // Cleanup function to revoke object URLs when component unmounts
        return () => {
            isMounted = false;
            controller.abort();
            if (imageData) {
                URL.revokeObjectURL(imageData);
            }
        };
    }, [imageUrl, size, retryCount]);

    if (isLoading) {
        return (
            <div className={`animate-pulse bg-base-100 rounded-full ${className}`} style={{ width: size, height: size }} />
        );
    }

    if (error) {
        return (
            <div 
                className={`bg-base-100 rounded-full flex items-center justify-center ${className}`} 
                style={{ width: size, height: size }}
                title={error}
            >
                <span className="text-red-500">!</span>
            </div>
        );
    }

    return imageData !== "" ? (
        <img
            src={imageData}
            alt={name || 'Token'}
            className={`object-cover ${className}`}
            style={{ width: size, height: size }}
            loading="lazy"
        />
    ) : null;
};
