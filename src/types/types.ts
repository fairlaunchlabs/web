import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { Token } from 'graphql';

export type TokenMetadata = {
    name: string;
    symbol: string;
    uri: string;
    decimals: number;
    sellerFeeBasisPoints?: number;
    creators?: null;
    collection?: null;
    uses?: null;
}

export type TokenMetadataExtensions = {
    twitter?: string;
    discord?: string;
    website?: string;
    github?: string;
    medium?: string;
    telegram?: string;
}

export type TokenMetadataIPFS = {
    name?: string;
    symbol?: string;
    image?: string;
    description?: string;
    extensions?: TokenMetadataExtensions;
    attributes?: string[];
}

export type InitializeTokenConfig = {
    targetEras: BN;
    epochesPerEra: BN;
    targetSecondsPerEpoch: BN;
    reduceRatio: BN;
    initialMintSize: BN;
    initialTargetMintSizePerEpoch: BN;
    feeRate: BN;
    liquidityTokensRatio: BN;
}

export type InitializeTokenAccounts = {
    mint: PublicKey;
    metadata: PublicKey;
    payer: PublicKey;
    configAccount: PublicKey;
    mintStateAccount: PublicKey;
    rent: PublicKey;
    systemProgram: PublicKey;
    systemConfigAccount: PublicKey;
    tokenProgram: PublicKey;
    tokenMetadataProgram: PublicKey;
}

export type InitiazlizedTokenData = {
    id: string;
    txId: string;
    admin: string;
    tokenId: string;
    mint: string;
    configAccount: string;
    metadataAccount: string;
    tokenVault: string;
    timestamp: string;

    // TokenMetadata
    tokenName: string;
    tokenSymbol: string;
    tokenUri: string;

    // TokenMintState
    supply: string;
    currentEra: string;
    currentEpoch: string;
    elapsedSecondsEpoch: string;
    startTimestampEpoch: string;
    lastDifficultyCoefficientEpoch: string;
    difficultyCoefficientEpoch: string;
    mintSizeEpoch: string;
    quantityMintedEpoch: string;
    targetMintSizeEpoch: string;
    totalMintFee: string;
    totalReferrerFee: string;
    totalTokens: string;

    // InitializeTokenConfigData
    targetEras: string;
    epochesPerEra: string;
    targetSecondsPerEpoch: string;
    reduceRatio: string;
    initialMintSize: string;
    initialTargetMintSizePerEpoch: string;
    feeRate: string;
    liquidityTokensRatio: string;
}

export type MintTokenData = {
    id: string;
    txId: string;
    sender: string;
    mint: string;
    configAccount: string;
    tokenVault: string;
    referralAccount: string;
    referrerMain: string;
    referrerAta: string;
    refundAccount: string;
    timestamp: string;

    // TokenMintState
    supply: string;
    currentEra: string;
    currentEpoch: string;
    elapsedSecondsEpoch: string;
    startTimestampEpoch: string;
    lastDifficultyCoefficientEpoch: string;
    difficultyCoefficientEpoch: string;
    mintSizeEpoch: string;
    quantityMintedEpoch: string;
    targetMintSizeEpoch: string;
    totalMintFee: string;
    totalReferrerFee: string;
    totalTokens: string;
}

export type TokenImageProps = {
    imageUrl: string | null;
    name: string;
    size?: number;
    className?: string;
}

export type AddressDisplayProps = {
    address: string;
    type?: string;
    isDevnet?: boolean;
}

export type Language = 'en-US' | 'zh-CN' | 'ja-JP' | 'ru-RU';

export type LanguageSelectorProps = {
    currentLocale: Language;
    onLocaleChange: (locale: Language) => void;
}

export type NavbarProps = {
    title?: string;
    onMenuClick?: () => void;
    isMenuOpen?: boolean;
}

export type MenuItem = {
    id: string;
    label: string;
    icon: React.ReactNode;
    subItems?: MenuItem[];
}

export type SidebarProps = {
    menuItems: MenuItem[];
    activeMenuItem: string;
    onMenuItemClick: (id: string) => void;
    onExpandedChange?: (expanded: boolean) => void;
    isMobileOpen?: boolean;
}

export type TokenCardProps = {
    token: InitiazlizedTokenData;
}

export type TokenFormData = {
    name: string;
    symbol: string;
    imageUrl: string;
    imageCid: string;
    description: string;
}

export type TokenAccount = {
    mint: string;
    amount: number;
    decimals: number;
}

export type MetricsProps = {
    targetEras: string;
    epochesPerEra: string;
    targetSecondsPerEpoch: string;
    reduceRatio: string;
    displayInitialTargetMintSizePerEpoch: string;
    initialMintSize: string;
    feeRate: string;
    liquidityTokensRatio: string;
    symbol: string;
}

export type TokenImageUploadProps = {
    onImageChange: (file: File | null) => void;
    imageFile: File | null;
}

export type MyAccountProps = {
    expanded: boolean;
}

export type TokenListItem = {
    mint: string;
    amount: string;
    tokenData?: InitiazlizedTokenData;
    imageUrl?: string;
}

