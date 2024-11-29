import { 
    Connection, 
    PublicKey,
    SystemProgram,
    SYSVAR_RENT_PUBKEY,
} from '@solana/web3.js';
import { getAssociatedTokenAddress, getOrCreateAssociatedTokenAccount, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import fairMintTokenIdl from '../idl/fair_mint_token.json';
import { FAIR_MINT_PROGRAM_ID, METADATA_SEED, MINT_STATE_SEED, CONFIG_DATA_SEED, MINT_SEED, TOKEN_METADATA_PROGRAM_ID, SYSTEM_CONFIG_SEEDS, SYSTEM_DEPLOYER, NETWORK, REFERRAL_SEED } from '../config/constants';
import { InitializeTokenAccounts, InitializeTokenConfig, TokenMetadata } from '../types/types';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { FairMintToken } from '../types/fair_mint_token';
import { PinataSDK } from 'pinata-web3';

// Solana 网络连接配置
const SOLANA_RPC_URL = process.env.REACT_APP_SOLANA_RPC_URL || `https://api.${NETWORK}.solana.com`;

// 程序 ID
const PROGRAM_ID = new PublicKey(FAIR_MINT_PROGRAM_ID);

// 创建 Solana 连接
export const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

// 连接钱包
export const connectWallet = async () => {
    try {
        // 检查 Solflare 钱包
        const solflare = (window as any).solflare;
        if (solflare?.isSolflare) {
            const response = await solflare.connect();
            return response;
        }

        // 检查 Phantom 钱包
        const phantom = (window as any).phantom?.solana;
        if (phantom?.isPhantom) {
            const response = await phantom.connect();
            return response;
        }

        throw new Error('Please install Phantom or Solflare wallet');
    } catch (error) {
        console.error('Error connecting wallet:', error);
        throw error;
    }
};

// 断开钱包连接
export const disconnectWallet = async () => {
    try {
        // 检查 Solflare 钱包
        const solflare = (window as any).solflare;
        if (solflare?.isSolflare && solflare.isConnected) {
            await solflare.disconnect();
            return;
        }

        // 检查 Phantom 钱包
        const phantom = (window as any).phantom?.solana;
        if (phantom?.isPhantom && phantom.isConnected) {
            await phantom.disconnect();
            return;
        }
    } catch (error) {
        console.error('Error disconnecting wallet:', error);
        throw error;
    }
};

// 创建代币
export const createTokenOnChain = async (
    metadata: TokenMetadata, 
    wallet: AnchorWallet,
    config: InitializeTokenConfig
) => {
    try {
        if (!wallet) {
            throw new Error('Please connect your wallet first');
        }        
        // 创建 Provider
        const provider = new AnchorProvider(
            connection,
            {
                ...wallet,
                signTransaction: wallet.signTransaction.bind(wallet),
                signAllTransactions: wallet.signAllTransactions.bind(wallet),
                publicKey: wallet.publicKey,
            },
            { commitment: 'confirmed' }
        );

        // 创建 Program
        const program = new Program(fairMintTokenIdl as FairMintToken, provider);

        // 计算 mint PDA
        const [mintPda] = PublicKey.findProgramAddressSync(
            [
                Buffer.from(MINT_SEED),
                Buffer.from(metadata.name),
                Buffer.from(metadata.symbol),
                wallet.publicKey.toBuffer()
            ],
            program.programId
        );

        // 计算 config PDA
        const [configPda] = PublicKey.findProgramAddressSync(
            [
                Buffer.from(CONFIG_DATA_SEED),
                mintPda.toBuffer()
            ],
            program.programId
        );

        // 计算 mint state PDA
        const [mintStatePda] = PublicKey.findProgramAddressSync(
            [
                Buffer.from(MINT_STATE_SEED),
                mintPda.toBuffer()
            ],
            program.programId
        );

        const [systemConfigAccount] = PublicKey.findProgramAddressSync(
            [Buffer.from(SYSTEM_CONFIG_SEEDS), new PublicKey(SYSTEM_DEPLOYER).toBuffer()],
            program.programId,
          );
        
        const [metadataPda] = PublicKey.findProgramAddressSync(
            [
              Buffer.from(METADATA_SEED),
              TOKEN_METADATA_PROGRAM_ID.toBuffer(),
              mintPda.toBuffer()
            ],
            TOKEN_METADATA_PROGRAM_ID,
          );
        
        const initializeTokenAccounts: InitializeTokenAccounts = {
            mint: mintPda,
            metadata: metadataPda,
            payer: wallet.publicKey,
            configAccount: configPda,
            mintStateAccount: mintStatePda,
            rent: SYSVAR_RENT_PUBKEY,
            systemProgram: SystemProgram.programId,
            systemConfigAccount: systemConfigAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
            tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        }

        try {
            const tx = await program.methods
                .initializeToken(metadata, config as any)
                .accounts(initializeTokenAccounts)
                .signers([])  // 使用钱包的 payer
                .rpc();

            return {
                signature: tx,
                mintAddress: mintPda.toString()
            };
        } catch (error) {
            console.error('Error in token creation:', error);
            throw error;
        }
    } catch (err) {
        console.error('Error creating token:', err);
        throw err;
    }
};

// 获取钱包余额
export const getBalance = async (publicKey: string) => {
    try {
        const balance = await connection.getBalance(new PublicKey(publicKey));
        return balance / 1e9; // Convert lamports to SOL
    } catch (error) {
        console.error('Error getting balance:', error);
        throw error;
    }
};

export const pinata = new PinataSDK({
    pinataJwt: process.env.REACT_APP_PINATA_JWT,
    pinataGateway: process.env.REACT_APP_PINATA_GATEWAY
});

export const setReferrerCode = async (
    wallet: AnchorWallet | undefined,
    connection: Connection,
    tokenName: string,
    tokenSymbol: string,
    mint: PublicKey,
    renewCode: boolean = false
) => {
    if (!wallet) return {
        success: false,
        message: 'Please connect wallet'
    }

    const program = new Program(fairMintTokenIdl as FairMintToken, new AnchorProvider(connection, wallet, { commitment: 'confirmed' }));
    const [configAccount] = PublicKey.findProgramAddressSync(
        [
            Buffer.from(CONFIG_DATA_SEED),
            mint.toBuffer()
        ],
        program.programId
    );

    const referrerAta = await getAssociatedTokenAddress(
        mint,
        wallet.publicKey, // 需要查询账户的公钥
        false,
    )
    console.log('referrerAta', referrerAta.toBase58())
    // 确认referrerAta是否存在
    const referrerAtaAccountInfo = await connection.getAccountInfo(referrerAta);
    if (!referrerAtaAccountInfo) {
        return {
            success: false,
            message: 'You have not minted this token'
        };
    }

    console.log('referrerAtaAccountInfo', referrerAtaAccountInfo);
    const [referralAccount] = PublicKey.findProgramAddressSync(
        [
            Buffer.from(REFERRAL_SEED),
            mint.toBuffer(),
            referrerAta.toBuffer()
        ],
        PROGRAM_ID
    );
    console.log('referralAccount', referralAccount.toBase58());

    const [systemConfigAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from(SYSTEM_CONFIG_SEEDS), new PublicKey(SYSTEM_DEPLOYER).toBuffer()],
        program.programId,
    );

    const setReferrerCodeAccounts = {
        mint,
        referralAccount,
        configAccount,
        systemConfigAccount,
        payer: wallet.publicKey,
        referrerAta,
        systemProgram: SystemProgram.programId,
    };

    try {
        const tx = await program.methods
            .setReferrerCode(tokenName, tokenSymbol, renewCode)
            .accounts(setReferrerCodeAccounts)
            .signers([])  // 使用钱包的 payer
            .rpc();

        return {
            success: true,
            data: {
                signature: tx,
                referralAccount: referralAccount.toBase58(),
            }
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error setting referrer code'
        }
    }
};

export const getMyReferrerData = async (wallet: AnchorWallet | undefined, connection: Connection, mint: PublicKey) => {
    if(!wallet) return {
        success: false,
        message: 'Please connect wallet'
    }

    const referrerAta = await getAssociatedTokenAddress(
        mint,
        wallet.publicKey, // 需要查询账户的公钥
        false,
    )
    console.log('referrerAta', referrerAta.toBase58())
    // 确认referrerAta是否存在
    const referrerAtaAccountInfo = await connection.getAccountInfo(referrerAta);
    if (!referrerAtaAccountInfo) {
        return {
            success: false,
            message: 'You have not minted this token'
        };
    }

    console.log('referrerAtaAccountInfo', referrerAtaAccountInfo);
    const [referralAccount] = PublicKey.findProgramAddressSync(
        [
            Buffer.from(REFERRAL_SEED),
            mint.toBuffer(),
            referrerAta.toBuffer()
        ],
        PROGRAM_ID
    );
    console.log('referralAccount', referralAccount.toBase58());
    const referralAccountInfo = await connection.getAccountInfo(referralAccount);
    if (!referralAccountInfo) {
        return {
            success: false,
            message: 'You have not set a referrer code for this token before.'
        }
    }

    console.log('referralAccountInfo', referralAccountInfo);
    const program = new Program(fairMintTokenIdl as FairMintToken, new AnchorProvider(connection, wallet, { commitment: 'confirmed' }));
    const referrerData = await program.account.tokenReferralData.fetch(referralAccount);
    return {
        success: true,
        data: referrerData
    }
}

export const getReferrerDataByReferralAccount = async (wallet: AnchorWallet | undefined, connection: Connection, referralAccount: PublicKey) => {
    if(!wallet) return {
        success: false,
        message: 'Please connect wallet'
    }
    const program = new Program(fairMintTokenIdl as FairMintToken, new AnchorProvider(connection, wallet, { commitment: 'confirmed' }));
    const referrerData = await program.account.tokenReferralData.fetch(referralAccount);
    return {
        success: true,
        data: referrerData
    }
}

export const getSystemConfig = async (wallet: AnchorWallet | undefined, connection: Connection) => {
    if(!wallet) return {
        success: false,
        message: 'Please connect wallet'
    }
    const program = new Program(fairMintTokenIdl as FairMintToken, new AnchorProvider(connection, wallet, { commitment: 'confirmed' }));
    const [systemConfigAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from(SYSTEM_CONFIG_SEEDS), new PublicKey(SYSTEM_DEPLOYER).toBuffer()],
        program.programId,
    );
    const config = await program.account.systemConfigData.fetch(systemConfigAccount);
    return {
        success: true,
        data: config
    }
}

export const refund = async (wallet: AnchorWallet | undefined, connection: Connection, mint: PublicKey) => {
    if(!wallet) return {
        success: false,
        message: 'Please connect wallet'
    }
    const program = new Program(fairMintTokenIdl as FairMintToken, new AnchorProvider(connection, wallet, { commitment: 'confirmed' }));
    const [configAccount] = PublicKey.findProgramAddressSync(
        [
            Buffer.from(CONFIG_DATA_SEED),
            mint.toBuffer()
        ],
        program.programId
    );
    const [mintStateAccount] = PublicKey.findProgramAddressSync(
        [
            Buffer.from(MINT_STATE_SEED),
            mint.toBuffer()
        ],
        program.programId
    );
    const [systemConfigAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from(SYSTEM_CONFIG_SEEDS), new PublicKey(SYSTEM_DEPLOYER).toBuffer()],
        program.programId,
    );
    const refundAccounts = {
        mint,
        configAccount,
        mintStateAccount,
        systemConfigAccount,
        payer: wallet.publicKey,
        systemProgram: SystemProgram.programId,
    };
    // try {
    //     const tx = await program.methods
    //         .refund()
    //         .accounts(refundAccounts)
    //         .signers([])  // 使用钱包的 payer
    //         .rpc();
    //     return {    
    //         success: true,
    //         data: {
    //             signature: tx,
    //         }
    //     };
    // } catch (error) {
    //     return {
    //         success: false,
    //         message: 'Error refunding'
    //     }
    // }
}