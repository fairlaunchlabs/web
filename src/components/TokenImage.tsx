import React, { useState, useEffect } from 'react';
import { getOptimizedImageUrl, preloadOptimizedImage } from '../utils/cloudinary';
import { extractIPFSHash } from '../utils/format';
import { PinataSDK } from 'pinata-web3';
import { TokenImageProps, TokenMetadata, TokenMetadataIPFS } from '../types/types';

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

            // // Convert image URI to gateway URL
            const imageGatewayUrl = data.image;
            
            // Get optimized image URL with specific size
            const optimizedImageUrl = getOptimizedImageUrl(imageGatewayUrl, {
                width: size,
                height: size,
                quality: 90,
                format: 'auto'
            });

            // Preload the image
            await preloadOptimizedImage(optimizedImageUrl);

            // Update cache
            metadataCache.set(uri, {
                image: optimizedImageUrl,
                timestamp: Date.now()
            });

            setImageUrl(optimizedImageUrl);
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

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [uri, size, retryCount]);

    if (isLoading) {
        return (
            <div className={`${className} flex items-center justify-center bg-base-300 animate-pulse rounded-full`} style={{ width: size, height: size }}>
                <svg className="w-6 h-6 text-base-content/30 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        );
    }

    if (error || !imageUrl) {
        return (
            <div className={`${className} flex items-center justify-center bg-base-300 rounded-full`} style={{ width: size, height: size }}>
                <div className="w-8 h-8 rounded-full bg-base-content/10 flex items-center justify-center">
                    <span className="text-base-content/50 text-lg font-semibold">
                        {name.charAt(0).toUpperCase()}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <img
            src={imageUrl}
            alt={`${name} token`}
            className={className}
            style={{ width: size, height: size, objectFit: 'cover' }}
            loading="lazy"
            onError={(e) => {
                setError('Image failed to load');
                setImageUrl(null);
            }}
        />
    );
};
