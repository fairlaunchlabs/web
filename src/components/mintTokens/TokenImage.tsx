import React, { useState, useEffect } from 'react';
import { TokenImageProps } from '../../types/types';
import { checkAvailableArweaveItemId, extractArweaveHash } from '../../utils/web3';
import { ARSEEDING_GATEWAY_URL, ARWEAVE_DEFAULT_SYNC_TIME, ARWEAVE_GATEWAY_URL } from '../../config/constants';
import axios from 'axios';

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

const detectImageType = (buffer: Buffer): string | null => {
    // 检查文件头部字节来判断图片类型
    const header = buffer.slice(0, 4);
    
    // JPEG signature: FF D8 FF
    if (header[0] === 0xFF && header[1] === 0xD8 && header[2] === 0xFF) {
        return 'image/jpeg';
    }
    
    // PNG signature: 89 50 4E 47
    if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47) {
        return 'image/png';
    }
    
    // GIF signature: 47 49 46 38
    if (header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x38) {
        return 'image/gif';
    }
    
    // 如果无法识别，返回null
    return null;
}

export const TokenImage: React.FC<TokenImageProps> = ({ 
    imageUrl, 
    name,
    launchTimestamp,
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
            const itemId = extractArweaveHash(imageUrl as string);
            if (!itemId || !checkAvailableArweaveItemId(itemId)) {
                throw new Error('Invalid Arweave id');
            }

            // Try to get from cache first
            const cachedImage = await getCachedImage(itemId);
            if (cachedImage) {
                const blobUrl = createBlobUrl(cachedImage);
                setImageData(blobUrl);
                setIsLoading(false);
                return;
            }

            let url = "";
            if(Number(launchTimestamp) + ARWEAVE_DEFAULT_SYNC_TIME < Date.now() / 1000) {
                // 从arweave加载
                url = `${ARWEAVE_GATEWAY_URL}/${itemId}`;
            } else {
                // 从arseeding加载
                url = `${ARSEEDING_GATEWAY_URL}/${itemId}`;
            }

            // 获取二进制图片数据
            const imageResponse = await axios.get(url, {
                responseType: 'arraybuffer'
            });

            if (!imageResponse?.data) {
                throw new Error('Failed to fetch image');
            }

            // 将arraybuffer转换为Buffer
            const imageBuffer = Buffer.from(imageResponse.data);

            // 检测图片格式
            const imageType = detectImageType(imageBuffer);
            if (!imageType) {
                throw new Error('Invalid image format');
            }

            // Cache the image data
            await setCachedImage(itemId, imageBuffer);

            // Create blob URL with detected image type
            const blobUrl = createBlobUrl(imageBuffer, imageType);
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
