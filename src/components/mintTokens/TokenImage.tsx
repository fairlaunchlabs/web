import React, { useState, useEffect } from 'react';
import { TokenImageProps } from '../../types/types';
import { fetchImageFromUrlOrCache} from '../../utils/db';

export const TokenImage: React.FC<TokenImageProps> = ({ 
    imageUrl, 
    name,
    metadataTimestamp,
    size = 64, 
    className = ''
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [imageData, setImageData] = useState("");

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        if (imageUrl) {
            if (imageUrl) {
                setIsLoading(true);
                setError(null);
                fetchImageFromUrlOrCache(imageUrl, metadataTimestamp).then((blobUrl) => {
                    setImageData(blobUrl as string);
                    setIsLoading(false);
                    setRetryCount(0);
                }).catch((error) => {
                    setError(error instanceof Error ? error.message : 'Unknown error');
                    setIsLoading(false);
                    if (retryCount < 3) {
                        const backoffTime = Math.pow(2, retryCount) * 1000;
                        setTimeout(() => {
                            setRetryCount(prev => prev + 1);
                            setIsLoading(true);
                        }, backoffTime);
                    }
                });
            }
        }

        return () => {
            isMounted = false;
            controller.abort();
            if (imageData) {
                URL.revokeObjectURL(imageData);
            }
        };
    }, [imageUrl, retryCount]);

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
            className={`pixel-avatar ${className}`}
            style={{ width: size, height: size }}
            loading="lazy"
            onError={() => {
                setError('Failed to display image');
                if (imageData) {
                    URL.revokeObjectURL(imageData);
                }
            }}
        />
    ) : null;
};
