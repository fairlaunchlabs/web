import { 
    Connection, 
    PublicKey,
    SystemProgram,
    SYSVAR_RENT_PUBKEY,
} from '@solana/web3.js';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import fairMintTokenIdl from '../idl/fair_mint_token.json';
import { METADATA_SEED, MINT_STATE_SEED, CONFIG_DATA_SEED, MINT_SEED, TOKEN_METADATA_PROGRAM_ID, SYSTEM_CONFIG_SEEDS, SYSTEM_DEPLOYER, NETWORK, REFERRAL_SEED, REFUND_SEEDS, REFERRAL_CODE_SEED, CODE_ACCOUNT_SEEDS } from '../config/constants';
import { InitializeTokenAccounts, InitializeTokenConfig, InitiazlizedTokenData, ResponseData, TokenMetadata } from '../types/types';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { FairMintToken } from '../types/fair_mint_token';
import { PinataSDK } from 'pinata-web3';
import { ASSOCIATED_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@coral-xyz/anchor/dist/cjs/utils/token';
import { getAssociatedTokenAddress } from '@solana/spl-token';

export const pinata = new PinataSDK({
    pinataJwt: process.env.REACT_APP_PINATA_JWT,
    pinataGateway: process.env.REACT_APP_PINATA_GATEWAY
});

export const getProgram = (wallet: AnchorWallet, connection: Connection) => {
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
    
    return new Program(fairMintTokenIdl as FairMintToken, provider);
}

export const createTokenOnChain = async (
    metadata: TokenMetadata, 
    wallet: AnchorWallet,
    connection: Connection,
    config: InitializeTokenConfig
) => {
    try {
        if (!wallet) {
            throw new Error('Please connect your wallet first');
        }        

        const program = getProgram(wallet, connection);

        const [mintPda] = PublicKey.findProgramAddressSync(
            [
                Buffer.from(MINT_SEED),
                Buffer.from(metadata.name),
                Buffer.from(metadata.symbol),
                wallet.publicKey.toBuffer()
            ],
            program.programId
        );

        const [configPda] = PublicKey.findProgramAddressSync(
            [
                Buffer.from(CONFIG_DATA_SEED),
                mintPda.toBuffer()
            ],
            program.programId
        );

        const [mintStatePda] = PublicKey.findProgramAddressSync(
            [
                Buffer.from(MINT_STATE_SEED),
                mintPda.toBuffer()
            ],
            program.programId
        );

        const [systemConfigAccountPda] = PublicKey.findProgramAddressSync(
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
            systemConfigAccount: systemConfigAccountPda,
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

export const getReferrerCodeHash = (
    wallet: AnchorWallet | undefined, 
    connection: Connection,
    code: string // without hashed
): ResponseData => {
    if (!wallet) return {
        success: false,
        message: 'Please connect wallet'
    }

    const program = getProgram(wallet, connection);
    // Hash the code
    const [codeHash] = PublicKey.findProgramAddressSync(
        [Buffer.from(REFERRAL_CODE_SEED), Buffer.from(code)],
        program.programId,
      );

    return {
        success: true,
        data: codeHash
    };
}

// 获取钱包余额
export const getBalance = async (
    connection: Connection,
    publicKey: string
): Promise<number> => {
    try {
        const balance = await connection.getBalance(new PublicKey(publicKey));
        return balance / 1e9; // Convert lamports to SOL
    } catch (error) {
        console.error('Error getting balance:', error);
        throw error;
    }
};

export const reactiveReferrerCode = async (
    wallet: AnchorWallet | undefined,
    connection: Connection,
    tokenName: string,
    tokenSymbol: string,
    mint: PublicKey,
    code: string,
): Promise<ResponseData> => {
    if (!wallet) return {
        success: false,
        message: 'Please connect wallet'
    }

    const program = getProgram(wallet, connection);

    // Get code hash
    const codeHash = getReferrerCodeHash(wallet, connection, code);
    if (!codeHash.success) {
        return {
            success: false,
            message: codeHash.message
        }
    }

    // Get code account pda
    const [codeAccountPda] = PublicKey.findProgramAddressSync(
        [
            Buffer.from(CODE_ACCOUNT_SEEDS),
            (codeHash.data as PublicKey).toBuffer(),
        ],
        program.programId,
    );

    // check if the code account initialized
    const codeAccountInfo = await connection.getAccountInfo(codeAccountPda);
    if (codeAccountInfo) {
        // if codeAccountInfo exists, it means the code has already been used.
        // The system will not allow you to use the same code again or generate a new URC code.
        // Check the owner of the existing code is the wallet owner or not
        const codeAccountData = await program.account.codeAccountData.fetch(codeAccountPda);
        const referralAccountPda = codeAccountData.referralAccount;
        const referralAccountData = await program.account.tokenReferralData.fetch(referralAccountPda);
        if (referralAccountData.referrerMain.toBase58() !== wallet.publicKey.toBase58() || referralAccountData.mint.toBase58() !== mint.toBase58()) {
            return {
                success: false,
                message: 'Code already exists but the owner is not you, nor the mint is not the same',
            }
        }
    }

    // get config account pda
    const [configAccountPda] = PublicKey.findProgramAddressSync(
        [
            Buffer.from(CONFIG_DATA_SEED),
            mint.toBuffer()
        ],
        program.programId
    );

    // get referrer ata
    let referrerAta = await getAssociatedTokenAddress(
        mint,
        wallet.publicKey, // 需要查询账户的公钥
        false,
    )

    // get referral account pda
    const [referralAccountPda] = PublicKey.findProgramAddressSync(
        [Buffer.from(REFERRAL_SEED), mint.toBuffer(), wallet.publicKey.toBuffer()],
        program.programId,
    );

    // Get system config account
    const [systemConfigAccountPda] = PublicKey.findProgramAddressSync(
        [Buffer.from(SYSTEM_CONFIG_SEEDS), new PublicKey(SYSTEM_DEPLOYER).toBuffer()],
        program.programId,
    );

    const setReferrerCodeAccounts = {
        mint,
        referralAccount: referralAccountPda,
        referrerAta,
        configAccount: configAccountPda,
        systemConfigAccount: systemConfigAccountPda,
        payer: wallet.publicKey,
        systemProgram: SystemProgram.programId,
    };

    try {
        // do the tranasaction
        const tx = await program.methods
            .setReferrerCode(tokenName, tokenSymbol, codeHash.data as PublicKey)
            .accounts(setReferrerCodeAccounts)
            .signers([])
            .rpc();

        return {
            success: true,
            data: {
                tx,
                referralAccount: referralAccountPda.toBase58(),
            }
        };
    } catch (error) {
        console.log("setReferrerCode", error);
        return {
            success: false,
            message: 'Error setting referrer code'
        }
    }
}

export const setReferrerCode = async (
    wallet: AnchorWallet | undefined,
    connection: Connection,
    tokenName: string,
    tokenSymbol: string,
    mint: PublicKey,
    code: string,
): Promise<ResponseData> => {
    if (!wallet) return {
        success: false,
        message: 'Please connect wallet'
    }

    const program = getProgram(wallet, connection);

    const codeHash = getReferrerCodeHash(wallet, connection, code);
    if (!codeHash.success) {
        return {
            success: false,
            message: codeHash.message
        }
    }

    const [codeAccountPda] = PublicKey.findProgramAddressSync(
        [
            Buffer.from(CODE_ACCOUNT_SEEDS),
            (codeHash.data as PublicKey).toBuffer(),
        ],
        program.programId,
    );
    const codeAccountInfo = await connection.getAccountInfo(codeAccountPda);
    if (codeAccountInfo) {
        // 如果codeAccountInfo存在，说明code已经被使用
        // 检查该code的所有者是不是自己，以及mint是不是相符，如果是的话，则显示referral的数据，否则提示code已经存在，重新输入
        const codeAccountData = await program.account.codeAccountData.fetch(codeAccountPda);
        const referralAccountPda = codeAccountData.referralAccount;
        const referralAccountData = await program.account.tokenReferralData.fetch(referralAccountPda);
        if (referralAccountData.referrerMain.toBase58() !== wallet.publicKey.toBase58() || referralAccountData.mint.toBase58() !== mint.toBase58()) {
            return {
                success: false,
                message: 'Code already exists'
            }
        } else {
            return {
                success: true,
                data: {
                    tx: "mine",
                    referralAccount: codeAccountData.referralAccount.toBase58(),
                }
            };    
        }
    }

    const [configAccountPda] = PublicKey.findProgramAddressSync(
        [Buffer.from(CONFIG_DATA_SEED), mint.toBuffer()],
        program.programId
    );

    let referrerAta = await getAssociatedTokenAddress(
        mint,
        wallet.publicKey,
        false,
    )

    const [referralAccountPda] = PublicKey.findProgramAddressSync(
        [Buffer.from(REFERRAL_SEED), mint.toBuffer(), wallet.publicKey.toBuffer()],
        program.programId
    );

    const [systemConfigAccountPda] = PublicKey.findProgramAddressSync(
        [Buffer.from(SYSTEM_CONFIG_SEEDS), new PublicKey(SYSTEM_DEPLOYER).toBuffer()],
        program.programId,
    );

    const setReferrerCodeAccounts = {
        mint,
        referralAccount: referralAccountPda,
        referrerAta,
        configAccount: configAccountPda,
        systemConfigAccount: systemConfigAccountPda,
        payer: wallet.publicKey,
        systemProgram: SystemProgram.programId,
    };

    try {
        const tx = await program.methods
            .setReferrerCode(tokenName, tokenSymbol, codeHash.data as PublicKey)
            .accounts(setReferrerCodeAccounts)
            .signers([])  // 使用钱包的 payer
            .rpc();

        return {
            success: true,
            data: {
                tx,
                referralAccount: referralAccountPda.toBase58(),
            }
        };
    } catch (error) {
        console.log("setReferrerCode", error);
        return {
            success: false,
            message: 'Error setting referrer code'
        }
    }
};

export const getMyReferrerData = async (
    wallet: AnchorWallet | undefined, 
    connection: Connection, 
    mint: PublicKey, 
    referrerCode: string
): Promise<ResponseData> => {
    if(!wallet) return {
        success: false,
        message: 'Please connect wallet'
    }

    const referrerAta = await getAssociatedTokenAddress(
        mint,
        wallet.publicKey, // 需要查询账户的公钥
        false,
    )
    // console.log('referrerAta', referrerAta.toBase58())
    // Check if the referrer's ATA account exists
    const referrerAtaAccountInfo = await connection.getAccountInfo(referrerAta);
    if (!referrerAtaAccountInfo) {
        return {
            success: false,
            message: 'You have not minted this token'
        };
    }

    const codeHash = getReferrerCodeHash(wallet, connection, referrerCode);
    if (!codeHash.success) {
        return {
            success: false,
            message: codeHash.message
        }
    }
    // console.log('referrerAtaAccountInfo', referrerAtaAccountInfo);
    const program = getProgram(wallet, connection);
    const [referralAccountPda] = PublicKey.findProgramAddressSync(
        [
            Buffer.from(REFERRAL_SEED),
            mint.toBuffer(),
            wallet.publicKey.toBuffer(),
        ],
        program.programId,
    );
    console.log('referralAccount', referralAccountPda.toBase58());
    const referralAccountInfo = await connection.getAccountInfo(referralAccountPda);
    if (!referralAccountInfo) {
        return {
            success: false,
            message: 'You have not set a referrer code for this token before.'
        }
    }

    console.log('referralAccountInfo', referralAccountInfo);
    const referrerData = await program.account.tokenReferralData.fetch(referralAccountPda);
    return {
        success: true,
        data: referrerData
    }
}

export const getSystemConfig = async (
    wallet: AnchorWallet | undefined,
    connection: Connection
): Promise<ResponseData> => {
    if(!wallet) return {
        success: false,
        message: 'Please connect wallet'
    }
    const program = getProgram(wallet, connection);
    const [systemConfigAccountPda] = PublicKey.findProgramAddressSync(
        [Buffer.from(SYSTEM_CONFIG_SEEDS), new PublicKey(SYSTEM_DEPLOYER).toBuffer()],
        program.programId,
    );
    const systemConfigData = await program.account.systemConfigData.fetch(systemConfigAccountPda);
    return {
        success: true,
        data: systemConfigData
    }
}

export const refund = async (
    wallet: AnchorWallet | undefined, 
    connection: Connection,
    token: InitiazlizedTokenData,
    protocolFeeAccount: PublicKey,
): Promise<ResponseData> => {
    if(!wallet) return {
        success: false,
        message: 'Please connect wallet'
    }
    const program = getProgram(wallet, connection);
    const [systemConfigAccountPda] = PublicKey.findProgramAddressSync(
        [Buffer.from(SYSTEM_CONFIG_SEEDS), new PublicKey(SYSTEM_DEPLOYER).toBuffer()],
        program.programId,
    );
    const [refundAccountPda] = PublicKey.findProgramAddressSync(
        [Buffer.from(REFUND_SEEDS), new PublicKey(token.mint).toBuffer(), wallet.publicKey.toBuffer()],
        program.programId,
    );
    const tokenAta = await getAssociatedTokenAddress(
        new PublicKey(token.mint),
        wallet.publicKey,
        false,
    )

    const refundAccounts = {
        mint: new PublicKey(token.mint),
        refundAccount: refundAccountPda,
        configAccount: new PublicKey(token.configAccount),
        tokenVault: new PublicKey(token.tokenVault),
        protocolFeeAccount,
        tokenAta,
        systemConfigAccount: systemConfigAccountPda,
        payer: wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
    };
    try {
        const tx = await program.methods
            .refund(token.tokenName, token.tokenSymbol)
            .accounts(refundAccounts)
            .signers([])
            .rpc();
        return {    
            success: true,
            data: {
                tx,
            }
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error refunding'
        }
    }
}

export const mintToken = async (
    wallet: AnchorWallet | undefined, 
    connection: Connection,
    token: InitiazlizedTokenData,
    referralAccountPda: PublicKey,
    referrerMain: PublicKey,
    referrerAta: PublicKey,
    code: string,
): Promise<ResponseData> => {
    if(!wallet) return {
        success: false,
        message: 'Please connect wallet'
    }
    console.log("code", code);
    const program = getProgram(wallet, connection);
    // Check referrer account
    const referralAccountInfo = await connection.getAccountInfo(referralAccountPda);
    if (!referralAccountInfo) {
        return {
            success: false,
            message: 'Referrer account does not exist'
        }
    }
    // get data from referral account, and check if it is correct
    const referrerData = await program.account.tokenReferralData.fetch(referralAccountPda);
    console.log(referrerMain.toBase58(), referrerData.referrerMain.toBase58())
    if(referrerMain.toBase58() !== referrerData.referrerMain.toBase58()) {
        return {
            success: false,
            message: 'Wrong referrer account'
        }
    }
    const codeHash = getReferrerCodeHash(wallet, connection, code);
    if(!codeHash.success) {
        return {
            success: false,
            message: codeHash.message
        }
    }
    if(codeHash.data?.toBase58() !== referrerData.codeHash.toBase58()) {
        return {
            success: false,
            message: 'Wrong referrer code'
        }
    }
    // TODO: check if referrer code is exceed max usage

    const destinationAta = await getAssociatedTokenAddress(
        new PublicKey(token.mint),
        wallet.publicKey,
        false,
    )
    const [refundAccountPda] = PublicKey.findProgramAddressSync(
        [Buffer.from(REFUND_SEEDS), new PublicKey(token.mint).toBuffer(), wallet.publicKey.toBuffer()],
        program.programId,
    );
    const [systemConfigAccountPda] = PublicKey.findProgramAddressSync(
        [Buffer.from(SYSTEM_CONFIG_SEEDS), new PublicKey(SYSTEM_DEPLOYER).toBuffer()],
        program.programId,
    );

    const mintAccounts = {
        mint: new PublicKey(token.mint),
        destination: destinationAta,
        refundAccount: refundAccountPda,
        user: wallet.publicKey,
        configAccount: new PublicKey(token.configAccount),
        tokenVault: new PublicKey(token.tokenVault),
        systemConfigAccount: systemConfigAccountPda,
        referralAccount: referralAccountPda,
        referrerAta: referrerAta,
        referrerMain,
        rent: SYSVAR_RENT_PUBKEY,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        associatedAddressProgram: ASSOCIATED_PROGRAM_ID,
    };
    try {
        const tx = await program.methods
            .mintTokens(token.tokenName, token.tokenSymbol, codeHash.data as PublicKey)
            .accounts(mintAccounts)
            .signers([])
            .rpc();
        return {    
            success: true,
            data: {
                tx,
            }
        };
    } catch (error: any) {
        return {
            success: false,
            message: 'Error: ' + error.message,
        };
    }
}

export const getSolanaBalance = async (ata: PublicKey, connection: Connection): Promise<number> => {
    return await connection.getBalance(ata);
}

export const getTokenBalance = async (ata: PublicKey, connection: Connection): Promise<number | null> => {
    const account = await connection.getTokenAccountBalance(ata);
    return account.value.uiAmount;
}

export const getReferralDataByCodeHash = async (
    wallet: AnchorWallet | undefined,
    connection: Connection,
    codeHash: PublicKey
) => {
    if(!wallet) return {
        success: false,
        message: 'Please connect wallet'
    }

    const program = getProgram(wallet, connection);

    const [codeAccountPda] = PublicKey.findProgramAddressSync(
        [Buffer.from(CODE_ACCOUNT_SEEDS), codeHash.toBuffer()],
        program.programId,
    );

    // console.log('codeAccountPda', codeAccountPda.toBase58());
    const codeAccountInfo = await connection.getAccountInfo(codeAccountPda);
    if(!codeAccountInfo) {
        return {
            success: false,
            message: 'Code account does not exist'
        }
    }
    const codeAccountData = await program.account.codeAccountData.fetch(codeAccountPda);
    const referralAccountPda = codeAccountData.referralAccount;
    // console.log('referralAccountPda', referralAccountPda.toBase58());
    const referralAccountInfo = await connection.getAccountInfo(referralAccountPda);
    if(!referralAccountInfo) {
        return {
            success: false,
            message: 'Referral account does not exist'
        }
    }
    const referralAccountData = await program.account.tokenReferralData.fetch(referralAccountPda);
    return {
        success: true,
        data: {
            ...referralAccountData,
            referralAccount: referralAccountPda,
        }
    }
}

export const getReferrerDataByReferralAccount = async (
    wallet: AnchorWallet | undefined, 
    connection: Connection, 
    referralAccountPda: PublicKey
): Promise<ResponseData> => {
    if(!wallet) return {
        success: false,
        message: 'Please connect wallet'
    }
    const program = getProgram(wallet, connection);
    const referrerData = await program.account.tokenReferralData.fetch(referralAccountPda);
    return {
        success: true,
        data: referrerData
    }
}
