import React, { useState, useEffect } from 'react';
import { getOptimizedImageUrl, preloadOptimizedImage } from '../utils/cloudinary';
import { extractIPFSHash } from '../utils/format';
import { PinataSDK } from 'pinata-web3';
import { TokenImageProps, TokenMetadataIPFS } from '../types/types';

// Simple in-memory cache for metadata and image URLs
const metadataCache = new Map<string, { image: string; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Initialize Pinata client
const pinata = new PinataSDK({
    pinataJwt: process.env.REACT_APP_PINATA_JWT,
    pinataGateway: process.env.REACT_APP_PINATA_GATEWAY
});

export const TokenImage: React.FC<TokenImageProps> = ({ uri, name, size = 64, className = '' }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    
    const fetchMetadata = async (uri: string) => {
        try {
            if (!uri) {
                throw new Error('No URI provided');
            }
            
            // Check cache first
            const cached = metadataCache.get(uri);
            if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
                setImageUrl(cached.image);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);

            // Convert URI to gateway URL with proper headers
            const data: TokenMetadataIPFS = (await pinata.gateways.get(extractIPFSHash(uri) as string)).data as TokenMetadataIPFS;
            if (!data.image) {
                throw new Error('No image in metadata');
            }

            // Get image data from Pinata gateway
            const imageResponse = await pinata.gateways.get(extractIPFSHash(data.image) as string);
            
            // Type-safe Blob creation with fallback
            const blobPart = imageResponse.data instanceof Blob 
                ? imageResponse.data 
                : typeof imageResponse.data === 'string' 
                    ? new Blob([imageResponse.data], { type: imageResponse.contentType as string }) 
                    : new Blob([JSON.stringify(imageResponse.data)], { type: 'application/json' });
            
            const blob = new Blob([blobPart], { type: imageResponse.contentType as string });
            const objectUrl = URL.createObjectURL(blob);

            // Update cache with the object URL
            metadataCache.set(uri, {
                image: objectUrl,
                timestamp: Date.now()
            });

            setImageUrl(objectUrl);
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

        if (uri) {
            fetchMetadata(uri);
        }

        // Cleanup function to revoke object URLs when component unmounts
        return () => {
            isMounted = false;
            controller.abort();
            if (imageUrl) {
                URL.revokeObjectURL(imageUrl);
            }
        };
    }, [uri, size, retryCount]);

    if (isLoading) {
        return (
            <div className={`animate-pulse bg-gray-200 rounded-full ${className}`} style={{ width: size, height: size }} />
        );
    }

    if (error) {
        return (
            <div 
                className={`bg-gray-200 rounded-full flex items-center justify-center ${className}`} 
                style={{ width: size, height: size }}
                title={error}
            >
                <span className="text-red-500">!</span>
            </div>
        );
    }

    return imageUrl ? (
        <img
            src={imageUrl}
            alt={name || 'Token'}
            className={`rounded-full object-cover ${className}`}
            style={{ width: size, height: size }}
            loading="lazy"
        />
    ) : null;
};
