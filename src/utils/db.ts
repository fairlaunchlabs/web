import axios from "axios";
import { CACHE_DURATION, INDEX_DB_NAME, INDEX_DB_VERSION, STORAGE, STORE_NAME_IMAGE } from "../config/constants";
import { checkAvailableArweaveItemId, checkAvailableIrysItemId, extractArweaveHash, extractIrysHash, generateArweaveUrl, generateIrysUrl } from "./web3";
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

  // WEBP signature: 52 49 46 46 XX XX XX XX 57 45 42 50
  if (
    header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46 &&
    header[8] === 0x57 && header[9] === 0x45 && header[10] === 0x42 && header[11] === 0x50
  ) {
    return 'image/webp';
  }

  // AVIF signature: 
  // 1. Starts with ftyp
  // 2. Followed by avif or avis brand
  if (
    header[4] === 0x66 && header[5] === 0x74 && header[6] === 0x79 && header[7] === 0x70 &&
    (
      // Check for 'avif'
      (header[8] === 0x61 && header[9] === 0x76 && header[10] === 0x69 && header[11] === 0x66) ||
      // Check for 'avis'
      (header[8] === 0x61 && header[9] === 0x76 && header[10] === 0x69 && header[11] === 0x73)
    )
  ) {
    return 'image/avif';
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

export const fetchImageFromUrlOrCache = async (imageUrl: string, metadataTimestamp: number): Promise<{ blobUrl: string, imageType: string }> => {
  try {
    // Extract CID and validate
    let itemId = "";
    if (STORAGE === "arweave") itemId = extractArweaveHash(imageUrl as string);
    else if (STORAGE === "irys") itemId = extractIrysHash(imageUrl as string);
    if (!itemId
      || (STORAGE === "arweave" && !checkAvailableArweaveItemId(itemId))
      || (STORAGE === "irys" && !checkAvailableIrysItemId(itemId))
    ) {
      throw new Error('Invalid Item id');
    }
    // Try to get from cache first
    const cachedImage = await getCachedData(itemId);

    if (cachedImage) {
      // console.log('Using cached image', itemId);
      const cachedImageType = detectImageType(cachedImage as unknown as Buffer);
      if (!cachedImageType) {
        throw new Error('Invalid cached image format');
      }
      const blobUrl = createBlobUrl(cachedImage);
      return { blobUrl, imageType: cachedImageType as string };
    }

    let url = STORAGE === "arweave" ? generateArweaveUrl(metadataTimestamp, itemId) : generateIrysUrl(metadataTimestamp, itemId);

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
    const blobUrl = createBlobUrl(imageBuffer as unknown as ArrayBuffer, imageType);
    return { blobUrl, imageType };
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : 'Unknown error');
  }
};

export const fetchMetadataFromUrlOrCache = async (tokenUri: string, metadataTimestamp: number) => {
  try {
    // Extract CID and validate
    let itemId = "";
    if (STORAGE === "arweave") itemId = extractArweaveHash(tokenUri as string);
    else if (STORAGE === "irys") itemId = extractIrysHash(tokenUri as string);
    if (!itemId
      || (STORAGE === "arweave" && !checkAvailableArweaveItemId(itemId))
      || (STORAGE === "irys" && !checkAvailableIrysItemId(itemId))) {
      throw new Error('Invalid item id');
    }
    const cachedMetadata = await getCachedData(itemId);
    if (cachedMetadata) {
      const blobUrl = cachedMetadata as TokenMetadataIPFS;
      // console.log('Using cached metadata', itemId);
      return blobUrl;
    }

    let url = STORAGE === "arweave" ? generateArweaveUrl(metadataTimestamp, itemId) : generateIrysUrl(metadataTimestamp, itemId);
    const response = await axios.get(url);

    if (!response?.data) {
      throw new Error('Failed to fetch image');
    }

    const data = {
      name: response.data.name,
      symbol: response.data.symbol,
      description: response.data.description,
      image: STORAGE === "arweave" ? generateArweaveUrl(Number(metadataTimestamp), extractArweaveHash(response.data.image)) : generateIrysUrl(Number(metadataTimestamp), extractIrysHash(response.data.image)),
      header: STORAGE === "arweave" ? generateArweaveUrl(Number(metadataTimestamp), extractArweaveHash(response.data.header)) : generateIrysUrl(Number(metadataTimestamp), extractIrysHash(response.data.header)),
      extensions: response.data.extensions,
    } as TokenMetadataIPFS
    console.log("data", data)

    // Cache the image data
    await setCachedData(itemId, data);
    return data;
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : 'Unknown error');
  }
};