import { BN } from "@coral-xyz/anchor";
import { UTCTimestamp } from "lightweight-charts";
import { InitiazlizedTokenData, MintData, SetRefererCodeEntity, TokenListItem } from "../types/types";
import { BADGE_BG_COLORS, DEPRECATED_MINTS } from "../config/constants";

export const formatAddress = (address: string, showCharacters = 4): string => {
    if (!address) return '';
    return `${address.slice(0, showCharacters)}...${address.slice(-showCharacters)}`;
};

export const BN_LAMPORTS_PER_SOL = new BN(1000000000);
export const BN_ZERO = new BN(0);
export const BN_HUNDRED = new BN(100);
export const BN_MILLION = new BN(1000000);

export const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
};

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

export const getMintSpeed = (targetSecondsPerEpoch: string, initialTargetMintSizePerEpoch: string, initialMintSize: string) => {
    return Number(targetSecondsPerEpoch) / Number(initialTargetMintSizePerEpoch) * Number(initialMintSize);
}
export const getMintedSupply = (supply: string, liquidityTokensRatio: string) => {
    return numberStringToBN(supply).sub(numberStringToBN(supply).mul(numberStringToBN(liquidityTokensRatio)).div(BN_HUNDRED)).div(BN_LAMPORTS_PER_SOL).toNumber();
}

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

export const numberStringToBN = (decimalStr: string): BN => {
    return new BN(decimalStr.replace(/[,\s]/g, '').split('.')[0] || '0');
};

export const formatPrice = (price: number, digitalsAfterZero: number = 5): string => {
    if (price === 0) return '0';
    digitalsAfterZero = digitalsAfterZero - 1;
    const priceStr = price.toString();
    // 如果是科学计数法表示，先转换为普通数字字符串
    if (priceStr.includes('e')) {
        const [base, exponent] = priceStr.split('e');
        const exp = parseInt(exponent);
        if (exp < 0) {
            // 处理小于1的数
            const absExp = Math.abs(exp);
            const baseNum = parseFloat(base);
            const fullNumber = baseNum.toFixed(absExp + digitalsAfterZero); // 保留5位有效数字
            const zeroCount = fullNumber.slice(2, fullNumber.length - digitalsAfterZero).length - 1;
            if (zeroCount > 2) { // if 0.00012345 does not need to be formatted
                const result = `0.0{${zeroCount}}${(baseNum * Math.pow(10, digitalsAfterZero)).toFixed(0)}`;
                return result.replace(/\.?0+$/, '');
            }
            const result = parseFloat(fullNumber).toFixed(digitalsAfterZero);
            return result.replace(/\.?0+$/, '');
        }
    }
    
    // 处理普通小数
    const parts = priceStr.split('.');
    if (parts.length === 2) {
        const decimals = parts[1];
        let zeroCount = 0;
        for (const char of decimals) {
            if (char === '0') {
                zeroCount++;
            } else {
                break;
            }
        }
        if (zeroCount > 2) {
            const significantDigits = decimals.slice(zeroCount, zeroCount + digitalsAfterZero);
            return `0.{${zeroCount}}${significantDigits}`;
        }
    }
    
    // 如果不需要特殊处理，保留5位小数
    return price.toLocaleString(undefined, { minimumFractionDigits: digitalsAfterZero });
};

export const processRawData = (data: MintData[], feeRate: number) => {
    if (!data || data.length === 0) return [];

    // 按时间戳排序
    const sortedData = [...data].sort((a, b) => parseInt(a.timestamp) - parseInt(b.timestamp));
    
    // 按分钟聚合数据
    const minuteData = new Map<number, {
        prices: number[];
        volumes: number[];
        timestamp: number;
    }>();

    // 遍历所有数据点，按分钟分组
    sortedData.forEach(item => {
        const timestamp = parseInt(item.timestamp);
        const mintSize = parseFloat(item.mintSizeEpoch);
        const price = feeRate / mintSize;
        
        // 将时间戳转换为分钟级别（去掉秒数）
        const minuteTimestamp = Math.floor(timestamp / 60) * 60;

        if (!minuteData.has(minuteTimestamp)) {
            minuteData.set(minuteTimestamp, {
                prices: [],
                volumes: [],
                timestamp: minuteTimestamp
            });
        }

        const minute = minuteData.get(minuteTimestamp)!;
        minute.prices.push(price);
        minute.volumes.push(mintSize / 1000000000); // 转换为标准单位
    });

    // 转换为K线数据
    return Array.from(minuteData.values()).map(minute => {
        const prices = minute.prices;
        const volumes = minute.volumes;
        
        return {
            time: minute.timestamp as UTCTimestamp,
            open: prices[0], // 这一分钟内的第一个价格
            high: Math.max(...prices), // 最高价
            low: Math.min(...prices), // 最低价
            close: prices[prices.length - 1], // 这一分钟内的最后一个价格
            volume: volumes.reduce((a, b) => a + b, 0) // 总交易量
        };
    });
};

export function getFeeValue(
    feeRate: BN,
    difficultyCoefficient: number,
    referrerAtaBalance: BN,
    totalSupply: BN
): [BN, BN] {
    // 为了在BN中进行小数计算，我们将比例放大1000000倍
    const SCALE = BN_MILLION; // new BN(1000000);
    
    // Calculate balance ratio with scale
    console.log("referrerAtaBalance:", referrerAtaBalance.toString());
    console.log("totalSupply:", totalSupply.toString());
    const balanceRatioScaled = totalSupply.gt(new BN(0)) ? referrerAtaBalance.mul(SCALE).div(totalSupply) : new BN(0);
    const balanceRatio = balanceRatioScaled.toNumber() / SCALE.toNumber();
    console.log("balance_ratio:", balanceRatio);

    // Determine discount rate and convert to scaled BN
    let discountRateScaled: BN;
    if (balanceRatio >= 0.01) {
        discountRateScaled = new BN(250000); // 0.25 * SCALE
    } else if (balanceRatio >= 0.008) {
        discountRateScaled = new BN(200000); // 0.20 * SCALE
    } else if (balanceRatio >= 0.006) {
        discountRateScaled = new BN(150000); // 0.15 * SCALE
    } else if (balanceRatio >= 0.004) {
        discountRateScaled = new BN(100000); // 0.10 * SCALE
    } else if (balanceRatio >= 0.002) {
        discountRateScaled = new BN(50000);  // 0.05 * SCALE
    } else {
        discountRateScaled = new BN(0);
    }
    const discountRate = discountRateScaled.toNumber() / SCALE.toNumber();
    console.log("discount_rate:", discountRate);

    // Convert difficultyCoefficient to scaled BN
    const difficultyScaled = new BN(Math.floor(difficultyCoefficient * SCALE.toNumber()));

    // Calculate fee: feeRate * (1 + discountRate/difficultyCoefficient - discountRate)
    const one = SCALE;
    const discountByDifficulty = discountRateScaled.mul(SCALE).div(difficultyScaled);
    const scaledMultiplier = one.add(discountByDifficulty).sub(discountRateScaled);
    const fee = feeRate.mul(scaledMultiplier).div(SCALE);

    console.log(
        "fee:",
        `${1} + ${discountRate} / ${difficultyCoefficient} - ${discountRate} = ${fee.toString()}`
    );

    // Calculate code sharer reward: 0.2 * feeRate * discountRate * (1 - 1/difficultyCoefficient)
    const rewardBase = new BN(200000); // 0.2 * SCALE
    const difficultyFactor = SCALE.sub(SCALE.mul(SCALE).div(difficultyScaled));
    const rewardMultiplier = rewardBase.mul(discountRateScaled).mul(difficultyFactor);
    const codeSharerReward = feeRate.mul(rewardMultiplier).div(SCALE.mul(SCALE).mul(SCALE));

    return [fee, codeSharerReward];
}

export const addressToNumber = (address: string, maxNumber: number): number => {
    // Convert address to number array
    const numbers = address.split('').map(char => char.charCodeAt(0));
    
    // Sum all numbers
    const sum = numbers.reduce((acc, curr) => acc + curr, 0);
    
    // Use modulo to get a number between 0-99, then add 1 to get 1-100
    return (sum % maxNumber) + 1;
};

export const addressToColor = (address: string): string => {
    const number = addressToNumber(address, BADGE_BG_COLORS.length);
    const colors = BADGE_BG_COLORS[number - 1];
    return colors;
};

// Filter out deprecated tokens
export const filterTokens = (data: InitiazlizedTokenData[]) => {
    if (!data) return [];
    return data.filter(
        (token: InitiazlizedTokenData) => !DEPRECATED_MINTS.includes(token.mint)
    );
};


export const filterTokenListItem = (data: TokenListItem[]) => {
    if (!data) return [];
    return data.filter(
        (token: TokenListItem) => !DEPRECATED_MINTS.includes(token.mint)
    );
};

export const filterRefererCode = (data: SetRefererCodeEntity[]) => {
    if (!data) return [];
    return data.filter(
        (code: SetRefererCodeEntity) => !DEPRECATED_MINTS.includes(code.mint)
    );
};  

export const formatLargeNumber = (num: number): string => {
    const billion = 1000000000;
    const million = 1000000;
    const thousand = 1000;

    if (num >= billion) {
        return (num / billion).toFixed(1) + 'B';
    } else if (num >= million) {
        return (num / million).toFixed(1) + 'M';
    } else if (num >= thousand) {
        return (num / thousand).toFixed(1) + 'K';
    }
    return num.toString();
};