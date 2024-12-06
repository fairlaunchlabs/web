import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

export type Language = 'en-US' | 'zh-CN' | 'ja-JP' | 'ru-RU';
export type Theme = 'light' | 'dark';

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
    startTimestamp: string;
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
    showCharacters?: number;
}

export type MintTokensProps = {
    expanded: boolean;
};

export type TokenDetailProps = {
    expanded: boolean;
};

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
    component?: React.ReactNode;
    subItems?: MenuItem[];
};

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

export type HolderData = {
    owner: string;
    amount: string;
}

export type MintTransactionData = {
    id: string;
    txId: string;
    sender: string;
    timestamp: string;
    currentEra: string;
    currentEpoch: string;
    mintSizeEpoch: string;
}

export type RefundTransactionData = {
    id: string;
    txId: string;
    sender: string;
    timestamp: string;
    burnAmountFromUser: string;
    burnAmountFromVault: string;
    refundFee: string;
    refundAmountIncludingFee: string;
}

export type ReferralCodeModalProps = {
    isOpen: boolean;
    onClose: () => void;
    token: TokenListItem
}

export type ReferrerData = {
    codeHash: PublicKey;
    referrerMain: PublicKey;
    referrerAta: PublicKey;
    usageCount: number;
    activeTimestamp: BN;
}

export type PaginationProps = {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    hasMore?: boolean;
}

export type ShareButtonProps = {
    token: InitiazlizedTokenData;
}

export type ToggleSwitchProps = {
    id: string;
    label: string;
    checked: boolean;
    onChange: () => void;
}

export type AdvancedSettingsProps = {
    targetEras: string;
    epochesPerEra: string;
    targetSecondsPerEpoch: string;
    reduceRatio: string;
    displayInitialMintSize: string;
    displayInitialTargetMintSizePerEpoch: string;
    displayFeeRate: string;
    liquidityTokensRatio: string;
    onTargetErasChange: (value: string) => void;
    onEpochesPerEraChange: (value: string) => void;
    onTargetSecondsPerEpochChange: (value: string) => void;
    onReduceRatioChange: (value: string) => void;
    onDisplayInitialMintSizeChange: (value: string, mintSize: string) => void;
    onDisplayInitialTargetMintSizePerEpochChange: (value: string, targetMintSize: string) => void;
    onDisplayFeeRateChange: (value: string, feeRate: string) => void;
    onLiquidityTokensRatioChange: (value: string) => void;
}

export type SocialInformationProps = {
    description: string;
    website: string;
    twitter: string;
    discord: string;
    telegram: string;
    github: string;
    medium: string;
    onDescriptionChange: (value: string) => void;
    onWebsiteChange: (value: string) => void;
    onTwitterChange: (value: string) => void;
    onDiscordChange: (value: string) => void;
    onTelegramChange: (value: string) => void;
    onGithubChange: (value: string) => void;
    onMediumChange: (value: string) => void;
}

export type RefundModalProps = {
    isOpen: boolean;
    onClose: () => void;
    token: TokenListItem;
}

export type TokenChartsProps = {
    token: InitiazlizedTokenData;
}

export type TokenHoldersProps = {
    token: InitiazlizedTokenData;
}

export type TokenInfoProps = {
    token: InitiazlizedTokenData;
    referrerCode: string | undefined;
}

export type TokenMintTransactionsProps = {
    token: InitiazlizedTokenData;
}

export type TokenRefundTransactionsProps = {
    token: InitiazlizedTokenData;
}

export type SocialLink = {
    name: string;
    url: string;
}

export type LaunchTokenFormProps = {
    expanded: boolean;
}

export type ToastBoxProps = {
    title: string
    url: string
    urlText: string
}

export type RenderSocialIconsProps = {
    metadata: TokenMetadataIPFS;
}

export type DataBlockProps = {
    label: string;
    value: any;
    tooltip?: string;
}

export type MyUniqueReferralCodeProps = {
    expanded: boolean;
}


export type CheckURCProps = {
    expanded: boolean;
}

export type SetRefererCodeEntity = {
    id?: string;
    mint: string;
    referralAccount: string;
    referrerAta: string;
    referrerMain: string;
    usageCount: number;
    activeTimestamp: number;
    codeHash: string;
    tokenBalance: number | null;
}

export type OnChainReferralData = {
    codeHash: string;
    usageCount: number;
    activeTimestamp: number;
    tokenBalance: number | null;
}

export type ResponseData = {
    success: boolean;
    message?: string;
    data?: any;
}

export type MintData = {
    timestamp: string;
    mintSizeEpoch: string;
};

export type ReferralData = {
    referralAccount: PublicKey;
    mint: PublicKey;
    codeHash: PublicKey;
    referrerMain: PublicKey;
    referrerAta: PublicKey;
    usageCount: number;
    activeTimestamp: BN;
    tokenBalance?: number | null;
    acturalPay?: BN;
    urcProviderBonus?: BN;
}