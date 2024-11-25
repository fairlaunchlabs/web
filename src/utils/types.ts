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
