import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

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

export type TokenMetadataIPFS = {
    name?: string;
    symbol?: string;
    image?: string;
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
    mintStateAccount: string;
    tokenName: string;
    tokenSymbol: string;
    tokenUri: string;
    targetEras: string;
    epochesPerEra: string;
    targetSecondsPerEpoch: string;
    reduceRatio: string;
    initialMintSize: string;
    initialTargetMintSizePerEpoch: string;
    feeRate: string;
    liquidityTokensRatio: string;
}

export type TokenImageProps = {
    uri: string;
    name: string;
    size?: number;
    className?: string;
}

export type AddressDisplayProps = {
    address: string;
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

export type TokenFormProps = {
    onSubmit?: (data: TokenFormData) => void;
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
