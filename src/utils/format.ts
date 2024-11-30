import { BN } from "@coral-xyz/anchor";

export const formatAddress = (address: string): string => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

export const BN_LAMPORTS_PER_SOL = new BN(1000000000);
export const BN_ZERO = new BN(0);
export const BN_HUNDRED = new BN(100);
export const BN_MILLION = new BN(1000000);

const formatSeconds = (seconds: string | number): string => {
    const totalSeconds = Number(seconds);
    
    if (isNaN(totalSeconds)) return '0s';
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const remainingSeconds = totalSeconds % 60;
    
    const parts = [];
    
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}s`);
    
    return parts.join(' ');
};

export const formatDays = (totalSeconds: number): string => {
    if (isNaN(totalSeconds) || totalSeconds <= 0) return formatSeconds(totalSeconds);

    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    
    const parts = [];
    
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0 || (days === 0 && parts.length === 0)) parts.push(`${hours}h`);
    
    return parts.join(' ');
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