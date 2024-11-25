import { 
    Connection, 
    PublicKey,
    SystemProgram,
    SYSVAR_RENT_PUBKEY,
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import fairMintTokenIdl from '../idl/fair_mint_token.json';
import { FAIR_MINT_PROGRAM_ID, METADATA_SEED, MINT_STATE_SEED, CONFIG_DATA_SEED, MINT_SEED, TOKEN_METADATA_PROGRAM_ID, SYSTEM_CONFIG_SEEDS, SYSTEM_DEPLOYER } from '../config/constants';
import { InitializeTokenAccounts, InitializeTokenConfig, TokenMetadata } from '../types/types';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { FairMintToken } from '../types/fair_mint_token';

// Solana 网络连接配置
const SOLANA_NETWORK = process.env.REACT_APP_SOLANA_NETWORK || 'devnet';
const SOLANA_RPC_URL = process.env.REACT_APP_SOLANA_RPC_URL || 'https://api.devnet.solana.com';

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
        
        console.table(metadata);
        console.table({
            mintPda: mintPda.toString(),
            configPda: configPda.toString(),
            mintStatePda: mintStatePda.toString(),
            rent: SYSVAR_RENT_PUBKEY.toString(),
            systemProgram: SystemProgram.programId.toString(),
            systemConfigAccount: systemConfigAccount.toString(),
            metadataPda: metadataPda.toString(),
            tokenProgram: TOKEN_PROGRAM_ID.toString(),
            tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID.toString(),
        });

        console.table({
            targetEras: config.targetEras.toString(),
            epochesPerEra: config.epochesPerEra.toString(),
            targetSecondsPerEpoch: config.targetSecondsPerEpoch.toString(),
            reduceRatio: config.reduceRatio.toString(),
            initialMintSize: config.initialMintSize.toString(),
            initialTargetMintSizePerEpoch: config.initialTargetMintSizePerEpoch.toString(),
            feeRate: config.feeRate.toString(),
            liquidityTokensRatio: config.liquidityTokensRatio.toString(),
        })

        try {
            const tx = await program.methods
                .initializeToken(metadata, config as any)
                .accounts(initializeTokenAccounts)
                .signers([])  // 使用钱包的 payer
                .rpc();

            console.log('Token created successfully:', tx);
            console.log('Mint address:', mintPda.toString());

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
