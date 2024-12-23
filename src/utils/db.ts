import axios from "axios";
import { CACHE_DURATION, INDEX_DB_NAME, INDEX_DB_VERSION, STORE_NAME_IMAGE } from "../config/constants";
import { checkAvailableArweaveItemId, extractArweaveHash, generateArweaveUrl } from "./web3";
import { TokenMetadataIPFS } from "../types/types";

export const arrayBufferToBlob = (buffer: ArrayBuffer, type: string): Blob => {
    return new Blob([buffer], { type });
};

export const createBlobUrl = (data: ArrayBuffer | Blob, type: string = 'image/png'): string => {
    const blob = data instanceof Blob ? data : arrayBufferToBlob(data, type);
    return URL.createObjectURL(blob);
};

export const detectImageType = (buffer: Buffer): string | null => {
    // 检查文件头部字节来判断图片类型
    const header = buffer.slice(0, 12);
    
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

    // WebP signature: 52 49 46 46 (RIFF) + 4 bytes size + 57 45 42 50 (WEBP)
    if (
        header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46 &&
        header[8] === 0x57 && header[9] === 0x45 && header[10] === 0x42 && header[11] === 0x50
    ) {
        return 'image/webp';
    }
    
    // 如果无法识别，返回null
    return null;
}

// IndexedDB helper functions
export const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(INDEX_DB_NAME, INDEX_DB_VERSION);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            // 创建所有需要的stores
            if (!db.objectStoreNames.contains(STORE_NAME_IMAGE)) {
                const objectStore = db.createObjectStore(STORE_NAME_IMAGE, { keyPath: 'url' });
                objectStore.createIndex('timestamp', 'timestamp', { unique: false });
            }
        };
    });
};

export const getCachedData = async (url: string): Promise<ArrayBuffer | null> => {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME_IMAGE, 'readonly');
            const store = transaction.objectStore(STORE_NAME_IMAGE);
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
                    const deleteTransaction = db.transaction(STORE_NAME_IMAGE, 'readwrite');
                    const deleteStore = deleteTransaction.objectStore(STORE_NAME_IMAGE);
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

export const setCachedData = async (url: string, data: any): Promise<void> => {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME_IMAGE, 'readwrite');
            const store = transaction.objectStore(STORE_NAME_IMAGE);
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

export const fetchImageFromUrlOrCache = async (imageUrl: string, metadataTimestamp: number): Promise<{blobUrl: string, imageType: string}> => {
    try {
        // Extract CID and validate
        const itemId = extractArweaveHash(imageUrl as string);
        if (!itemId || !checkAvailableArweaveItemId(itemId)) {
            throw new Error('Invalid Arweave id');
        }
        // Try to get from cache first
        const cachedImage = await getCachedData(itemId);

        if (cachedImage) {
            console.log('Using cached image', itemId);
            const cachedImageType = detectImageType(cachedImage as Buffer);
            if (!cachedImageType) {
                throw new Error('Invalid cached image format');
            }
            const blobUrl = createBlobUrl(cachedImage);
            return {blobUrl, imageType: cachedImageType as string};
        }

        let url = generateArweaveUrl(metadataTimestamp, itemId);

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
        await setCachedData(itemId, imageBuffer);

        // Create blob URL with detected image type
        const blobUrl = createBlobUrl(imageBuffer, imageType);
        return {blobUrl, imageType};
    } catch (err) {
        throw new Error(err instanceof Error ? err.message : 'Unknown error');
    }
};

export const fetchMetadataFromUrlOrCache = async (tokenUri: string, metadataTimestamp: number) => {
    try {
        // Extract CID and validate
        const itemId = extractArweaveHash(tokenUri as string);
        if (!itemId || !checkAvailableArweaveItemId(itemId)) {
            throw new Error('Invalid Arweave id');
        }

        const cachedMetadata = await getCachedData(itemId);
        if (cachedMetadata) {
            const blobUrl = cachedMetadata as TokenMetadataIPFS;
            console.log('Using cached metadata', itemId);
            return blobUrl;
        }

        let url = generateArweaveUrl(metadataTimestamp, itemId);

        const response = await axios.get(url);

        if (!response?.data) {
            throw new Error('Failed to fetch image');
        }

        const data = {
            name: response.data.name,
            symbol: response.data.symbol,
            description: response.data.description,
            image: generateArweaveUrl(Number(metadataTimestamp), extractArweaveHash(response.data.image)),
            header: generateArweaveUrl(Number(metadataTimestamp), extractArweaveHash(response.data.header)),
            extensions: response.data.extensions,
        } as TokenMetadataIPFS

        // Cache the image data
        await setCachedData(itemId, data);
        return data;
    } catch (err) {
        throw new Error(err instanceof Error ? err.message : 'Unknown error');
    }
};