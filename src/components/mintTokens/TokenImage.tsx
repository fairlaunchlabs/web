import React, { useState, useEffect } from 'react';
import { extractIPFSHash } from '../../utils/format';
import { TokenImageProps } from '../../types/types';
import { pinata } from '../../utils/web3';

// Cache configuration
const DB_NAME = 'token_image_cache';
const STORE_NAME = 'images';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// IndexedDB helper functions
const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'url' });
                store.createIndex('timestamp', 'timestamp', { unique: false });
            }
        };
    });
};

const getCachedImage = async (url: string): Promise<string | null> => {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(url);

            request.onerror = () => {
                db.close();
                reject(request.error);
            };

            request.onsuccess = () => {
                db.close();
                if (request.result && Date.now() - request.result.timestamp < CACHE_DURATION) {
                    resolve(request.result.data);
                } else if (request.result) {
                    // Remove expired cache
                    const deleteTransaction = db.transaction(STORE_NAME, 'readwrite');
                    const deleteStore = deleteTransaction.objectStore(STORE_NAME);
                    deleteStore.delete(url);
                    resolve(null);
                } else {
                    resolve(null);
                }
            };
        });
    } catch (error) {
        console.error('Error reading from cache:', error);
        return null;
    }
};

const setCachedImage = async (url: string, data: string): Promise<void> => {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put({
                url,
                data,
                timestamp: Date.now()
            });

            request.onerror = () => {
                db.close();
                reject(request.error);
            };

            request.onsuccess = () => {
                db.close();
                resolve();
            };
        });
    } catch (error) {
        console.error('Error writing to cache:', error);
    }
};

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

            // Try to get from cache first
            const cid = extractIPFSHash(imageUrl as string);
            const cachedImage = await getCachedImage(cid as string);
            if (cachedImage) {
                setImageData(cachedImage);
                setIsLoading(false);
                return;
            }

            // If not in cache, fetch from network
            if (!cid) {
                throw new Error('Invalid IPFS hash');
            }

            const imageResponse = await pinata.gateways.get(cid);
            
            const blobPart = imageResponse.data instanceof Blob 
                ? imageResponse.data 
                : typeof imageResponse.data === 'string' 
                    ? new Blob([imageResponse.data], { type: imageResponse.contentType as string }) 
                    : new Blob([JSON.stringify(imageResponse.data)], { type: 'application/json' });
            
            const blob = new Blob([blobPart], { type: imageResponse.contentType as string });
            const objectUrl = URL.createObjectURL(blob);
            
            // Cache the image
            await setCachedImage(cid as string, objectUrl);
            
            setImageData(objectUrl);
            setIsLoading(false);
            setRetryCount(0);
        } catch (err) {
            console.error('Error loading token image:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
            setIsLoading(false);

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
