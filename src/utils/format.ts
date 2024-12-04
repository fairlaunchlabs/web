import { BN } from "@coral-xyz/anchor";

export const formatAddress = (address: string, showCharacters = 4): string => {
    if (!address) return '';
    return `${address.slice(0, showCharacters)}...${address.slice(-showCharacters)}`;
};

export const BN_LAMPORTS_PER_SOL = new BN(1000000000);
export const BN_ZERO = new BN(0);
export const BN_HUNDRED = new BN(100);
export const BN_MILLION = new BN(1000000);

export const formatSeconds = (totalSeconds: number): string => {
    if (isNaN(totalSeconds) || totalSeconds <= 0) return 'arrived';

    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    if (days > 0) {
        return `${days}d ${hours}h`;
    }
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }

    if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    }
    
    return `${seconds}s`;
};

export const getTimeRemaining = (startTimestamp: string) => {
    const diff = Number(startTimestamp) - Math.floor(Date.now() / 1000);
    if (diff <= 0) return 'arrived';
    return `Start in ${formatSeconds(diff)}`;        
};

export const calculateMaxSupply = (epochesPerEra: string, initialTargetMintSizePerEpoch: string, reduceRatio: string): number => {
    const epochesPerEraNum = parseFloat(epochesPerEra) || 0;
    const initialTargetMintSizePerEpochNum = numberStringToBN(initialTargetMintSizePerEpoch).div(BN_LAMPORTS_PER_SOL).toNumber();
    const reduceRatioNum = parseFloat(reduceRatio) / 100 || 0;

    if (epochesPerEraNum <= 0 || initialTargetMintSizePerEpochNum <= 0 || reduceRatioNum <= 0) {
        return 0;
    }

    return epochesPerEraNum * initialTargetMintSizePerEpochNum / (1 - reduceRatioNum);
};

export const calculateTotalSupplyToTargetEras = (
    epochesPerEra: string,
    initialTargetMintSizePerEpoch: string,
    reduceRatio: string,
    targetEras: string
): number => {
    const reduceRatioNum = parseFloat(reduceRatio) / 100 || 0;
    const targetErasNum = parseFloat(targetEras) || 0;

    if (reduceRatioNum <= 0 || targetErasNum <= 0) {
        return 0;
    }

    const maxSupply = calculateMaxSupply(epochesPerEra, initialTargetMintSizePerEpoch, reduceRatio);
    const percentToTargetEras = 1 - Math.pow(reduceRatioNum, targetErasNum);
    const totalsupplyToTargetEras = percentToTargetEras * maxSupply;
    return totalsupplyToTargetEras;
};

export const calculateTargetMintTime = (
    targetSecondsPerEpoch: string,
    epochesPerEra: string,
    targetEras: string
): number => {
    const targetSecondsPerEpochNum = parseFloat(targetSecondsPerEpoch) || 0;
    const epochesPerEraNum = parseFloat(epochesPerEra) || 0;
    const targetErasNum = parseFloat(targetEras) || 0;

    if (targetSecondsPerEpochNum <= 0 || epochesPerEraNum <= 0 || targetErasNum <= 0) {
        return 0;
    }

    return targetSecondsPerEpochNum * epochesPerEraNum * targetErasNum;
};

export const calculateMinTotalFee = (
    initialTargetMintSizePerEpoch: string,
    feeRate: string,
    targetEras: string,
    epochesPerEra: string,
    initialMintSize: string
): number => {
    const initialTargetMintSizePerEpochNum = numberStringToBN(initialTargetMintSizePerEpoch).div(BN_LAMPORTS_PER_SOL).toNumber();
    const feeRateNum = parseFloat(feeRate) || 0;
    const targetErasNum = parseFloat(targetEras) || 0;
    const epochesPerEraNum = parseFloat(epochesPerEra) || 0;
    const initialMintSizeNum = numberStringToBN(initialMintSize).div(BN_LAMPORTS_PER_SOL).toNumber();

    if (initialTargetMintSizePerEpochNum <= 0 || feeRateNum <= 0 || targetErasNum <= 0 || 
        epochesPerEraNum <= 0 || initialMintSizeNum <= 0) {
        return 0;
    }

    return initialTargetMintSizePerEpochNum / initialMintSizeNum * feeRateNum * (targetErasNum * epochesPerEraNum + 1) / 1e9;
};

export const extractIPFSHash = (url: string): string | null => {
    // 处理直接的 IPFS 哈希
    if (url.startsWith('Qm') || url.startsWith('baf')) {
        return url;
    }

    // 处理 ipfs:// 协议的链接
    if (url.startsWith('ipfs://')) {
        const hash = url.replace('ipfs://', '');
        if (hash.startsWith('Qm') || hash.startsWith('baf')) {
            return hash;
        }
    }

    try {
        // 创建 URL 对象处理 https:// 链接
        const urlObj = new URL(url);
        
        // 从路径中提取 IPFS 哈希
        const pathParts = urlObj.pathname.split('/');
        const ipfsIndex = pathParts.indexOf('ipfs');
        
        if (ipfsIndex !== -1 && pathParts[ipfsIndex + 1]) {
            return pathParts[ipfsIndex + 1];
        }

        return null;
    } catch (error) {
        console.error('Invalid URL:', error);
        return null;
    }
};

export const numberStringToBN = (decimalStr: string): BN => {
    return new BN(decimalStr.replace(/[,\s]/g, '').split('.')[0] || '0');
};