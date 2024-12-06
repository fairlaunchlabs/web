import React, { useState, useEffect } from 'react';
import { extractIPFSHash } from '../../utils/format';
import { TokenImageProps } from '../../types/types';
import { pinata } from '../../utils/web3';

// Cache configuration
const DB_NAME = 'POM_IMAGE_CACHE';
const STORE_NAME = 'token_images';
const CACHE_DURATION = 60 * 24 * 60 * 60 * 1000; // 60 days

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

const getCachedImage = async (url: string): Promise<ArrayBuffer | null> => {
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

const setCachedImage = async (url: string, data: ArrayBuffer): Promise<void> => {
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

const arrayBufferToBlob = (buffer: ArrayBuffer, type: string): Blob => {
    return new Blob([buffer], { type });
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

    const createBlobUrl = (data: ArrayBuffer | Blob, type: string = 'image/png'): string => {
        if (imageData) {
            URL.revokeObjectURL(imageData);
        }
        const blob = data instanceof Blob ? data : arrayBufferToBlob(data, type);
        return URL.createObjectURL(blob);
    };

    const fetchImage = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Extract CID and validate
            const cid = extractIPFSHash(imageUrl as string);
            if (!cid) {
                throw new Error('Invalid IPFS hash');
            }

            // Try to get from cache first
            const cachedImage = await getCachedImage(cid);
            if (cachedImage) {
                const blobUrl = createBlobUrl(cachedImage);
                setImageData(blobUrl);
                setIsLoading(false);
                return;
            }

            // If not in cache, fetch from network
            const imageResponse = await pinata.gateways.get(cid);
            if (!imageResponse?.data) {
                throw new Error('Failed to fetch image');
            }

            let imageBuffer: ArrayBuffer;
            if (imageResponse.data instanceof ArrayBuffer) {
                imageBuffer = imageResponse.data;
            } else if (imageResponse.data instanceof Blob) {
                imageBuffer = await imageResponse.data.arrayBuffer();
            } else if (typeof imageResponse.data === 'string') {
                const encoder = new TextEncoder();
                imageBuffer = encoder.encode(imageResponse.data).buffer;
            } else {
                throw new Error('Unsupported image data format');
            }

            // Cache the image data
            await setCachedImage(cid, imageBuffer);

            // Create blob URL
            const blobUrl = createBlobUrl(imageBuffer, imageResponse.contentType || 'image/png');
            setImageData(blobUrl);
            setIsLoading(false);
            setRetryCount(0);
        } catch (err) {
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
            className={`object-cover ${className}`}
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
