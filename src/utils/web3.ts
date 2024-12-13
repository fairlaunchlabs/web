import { 
    Connection, 
    PublicKey,
    SystemProgram,
    SYSVAR_RENT_PUBKEY,
    Transaction,
} from '@solana/web3.js';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import fairMintTokenIdl from '../idl/fair_mint_token.json';
import { METADATA_SEED, MINT_STATE_SEED, CONFIG_DATA_SEED, MINT_SEED, TOKEN_METADATA_PROGRAM_ID, SYSTEM_CONFIG_SEEDS, SYSTEM_DEPLOYER, NETWORK, REFERRAL_SEED, REFUND_SEEDS, REFERRAL_CODE_SEED, CODE_ACCOUNT_SEEDS, ARSEEDING_GATEWAY_URL, ARWEAVE_API_URL, ARWEAVE_GATEWAY_URL, ARWEAVE_DEFAULT_SYNC_TIME, PROTOCOL_FEE_ACCOUNT } from '../config/constants';
import { InitializeTokenAccounts, InitializeTokenConfig, InitiazlizedTokenData, ResponseData, TokenMetadata, TokenMetadataIPFS } from '../types/types';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { FairMintToken } from '../types/fair_mint_token';
import { ASSOCIATED_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@coral-xyz/anchor/dist/cjs/utils/token';
import axios from 'axios';
import { getAssociatedTokenAddress } from '@solana/spl-token';

const getProgram = (wallet: AnchorWallet, connection: Connection) => {
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
                Buffer.from(metadata.symbol.toLowerCase()),
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

        const tx = await program.methods
            .initializeToken(metadata, config as any)
            .accounts(initializeTokenAccounts)
            .transaction();
        return await processTransaction(tx, connection, wallet, {mintAddress: mintPda.toString()});
    } catch (error: any) {
        if (error.message.includes('Transaction simulation failed: This transaction has already been processed')) {
            return {
                success: false,
                message: 'Something went wrong but the token was createdsuccessfully',
            }
        }
        throw error;
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
        message: 'get code hash success',
        data: codeHash as PublicKey
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

export const getTokenBalance = async (ata: PublicKey, connection: Connection): Promise<number | null> => {
    const account = await connection.getTokenAccountBalance(ata);
    return account.value.uiAmount;
}

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
        codeAccount: codeAccountPda,
        configAccount: configAccountPda,
        systemConfigAccount: systemConfigAccountPda,
        payer: wallet.publicKey,
        systemProgram: SystemProgram.programId,
    };

    try {
        // do the tranasaction
        console.log("codeHash.data.toBuffer()", codeHash.data.toBuffer());
        const tx = await program.methods
            .setReferrerCode(tokenName, tokenSymbol, codeHash.data.toBuffer())
            .accounts(setReferrerCodeAccounts)
            .transaction();
        return await processTransaction(tx, connection, wallet, {referralAccount: referralAccountPda.toBase58(), mint: mint.toBase58()});
    } catch (error:any) {
        if (error.message.includes('Transaction simulation failed: This transaction has already been processed')) {
            return {
                success: false,
                message: 'Something went wrong but the referrer code was set successfully',
            }
        }
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
                message: 'Code already exists and the owner is you',
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
        program.programId,
    );

    const [systemConfigAccountPda] = PublicKey.findProgramAddressSync(
        [Buffer.from(SYSTEM_CONFIG_SEEDS), new PublicKey(SYSTEM_DEPLOYER).toBuffer()],
        program.programId,
    );

    const setReferrerCodeAccounts = {
        mint,
        referralAccount: referralAccountPda,
        codeAccount: codeAccountPda,
        referrerAta,
        configAccount: configAccountPda,
        systemConfigAccount: systemConfigAccountPda,
        payer: wallet.publicKey,
        systemProgram: SystemProgram.programId,
    };

    try {
        console.log(tokenName, tokenSymbol, codeHash.data.toBuffer());
        const tx = await program.methods
            .setReferrerCode(tokenName, tokenSymbol, codeHash.data.toBuffer())
            .accounts(setReferrerCodeAccounts)
            .transaction();
        return await processTransaction(tx, connection, wallet, {referralAccount: referralAccountPda.toBase58()});
    } catch (error: any) {
        if (error.message.includes('Transaction simulation failed: This transaction has already been processed')) {
            return {
                success: false,
                message: 'Something went wrong but the referrer code was set successfully',
            }
        }
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

    const program = getProgram(wallet, connection);
    const [referralAccountPda] = PublicKey.findProgramAddressSync(
        [
            Buffer.from(REFERRAL_SEED),
            mint.toBuffer(),
            wallet.publicKey.toBuffer(),
        ],
        program.programId,
    );

    const referralAccountInfo = await connection.getAccountInfo(referralAccountPda);
    if (!referralAccountInfo) {
        return {
            success: false,
            message: 'You have not set a referrer code for this token before.'
        }
    }

    const referrerData = await program.account.tokenReferralData.fetch(referralAccountPda);
    return {
        success: true,
        message: 'Get referrer data success',
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
    try {
        const program = getProgram(wallet, connection);
        const [systemConfigAccountPda] = PublicKey.findProgramAddressSync(
            [Buffer.from(SYSTEM_CONFIG_SEEDS), new PublicKey(SYSTEM_DEPLOYER).toBuffer()],
            program.programId,
        );
        const systemConfigData = await program.account.systemConfigData.fetch(systemConfigAccountPda);
        return {
            success: true,
            data: {
                systemConfigData,
                systemConfigAccountPda,
            }
        }    
    } catch (error) {
        return {
            success: false,
            message: 'Error getting system config'
        }
    }
}

export const getRefundAccountData = async (wallet: AnchorWallet, connection: Connection, token: InitiazlizedTokenData) => {
    if(!wallet) return {
        success: false,
        message: 'Please connect wallet'
    }
    const program = getProgram(wallet, connection);
    try {
        const [refundAccountPda] = PublicKey.findProgramAddressSync(
            [Buffer.from(REFUND_SEEDS), new PublicKey(token.mint).toBuffer(), wallet.publicKey.toBuffer()],
            program.programId,
        );
        const refundAccountData = await program.account.tokenRefundData.fetch(refundAccountPda);
        console.log("refundAccountData", refundAccountData);
        return {
            success: true,
            message: 'Get refund data success',
            data: refundAccountData
        };    
    } catch (error) {
        console.log("getRefundAccountData", error);
        return {
            success: false,
            message: 'Error getting refund account data'
        }
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

    const refundAccountData = await program.account.tokenRefundData.fetch(refundAccountPda);
    if (refundAccountData.owner.toBase58() !== wallet.publicKey.toBase58()) {
        return {
            success: false,
            message: 'Only User Account Allowed'
        }
    }

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
            .transaction()
        return await processTransaction(tx, connection, wallet, {mint: token.mint});
    } catch (error: any) {
        if (error.message.includes('Transaction simulation failed: This transaction has already been processed')) {
            return {
                success: false,
                message: 'Something went wrong but you have refund successfully',
            }
        }
        return {
            success: false,
            message: 'Error refunding' + error
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

    const tx = await program.methods
        .mintTokens(token.tokenName, token.tokenSymbol, codeHash.data.toBuffer())
        .accounts(mintAccounts)
        .transaction();
    return await processTransaction(tx, connection, wallet, {mint: token.mint});
}

const processTransaction = async (
    tx: Transaction,
    connection: Connection,
    wallet: AnchorWallet,
    extraData: {}
) => {
    try {
        // 获取最新的 blockhash
        const latestBlockhash = await connection.getLatestBlockhash();
        
        // 获取正在处理的交易
        const processingTx = localStorage.getItem('processing_tx');
        const processingTimestamp = localStorage.getItem('processing_timestamp');
        const now = Date.now();

        // 检查是否有正在处理的交易（2秒内的交易视为处理中）
        if (processingTx && processingTimestamp && (now - parseInt(processingTimestamp)) < 2000) {
            return {
                success: false,
                message: 'Previous transaction is still processing. Please wait.'
            }
        }

        // 设置交易参数
        tx.recentBlockhash = latestBlockhash.blockhash;
        tx.feePayer = wallet.publicKey;

        // 签名和序列化
        const signedTx = await wallet.signTransaction(tx);                
        const serializedTx = signedTx.serialize();

        // 先进行交易模拟
        const simulation = await connection.simulateTransaction(signedTx);
        
        // 如果模拟出现错误，直接返回错误信息
        if (simulation.value.err) {
            return {
                success: false,
                message: `Transaction simulation failed: ${simulation.value.err.toString()}`
            };
        }

        // 标记交易开始处理
        localStorage.setItem('processing_tx', 'true');
        localStorage.setItem('processing_timestamp', now.toString());

        // 发送交易
        const signature = await connection.sendRawTransaction(serializedTx, {
            skipPreflight: true // 跳过预检，因为我们已经模拟过了
        });
        
        // 等待交易确认
        const confirmation = await connection.confirmTransaction({
            signature,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
        });

        if (confirmation.value.err) {
            return {
                success: false,
                message: 'Transaction failed: ' + confirmation.value.err.toString()
            }
        }

        return {
            success: true,
            message: 'Mint success',
            data: {
                tx,
                ...extraData
            }
        };
    } catch (error: any) {
        if (error.message.includes('Transaction simulation failed: This transaction has already been processed')) {
            return {
                success: false,
                message: 'Something went wrong but you have mint successfully',
            }
        }
        return {
            success: false,
            message: 'Error: ' + error.message,
        };
    } finally {
        // 清除处理状态
        localStorage.removeItem('processing_tx');
        localStorage.removeItem('processing_timestamp');
    }
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

    const codeAccountInfo = await connection.getAccountInfo(codeAccountPda);
    if(!codeAccountInfo) {
        return {
            success: false,
            message: 'Code account does not exist'
        }
    }
    const codeAccountData = await program.account.codeAccountData.fetch(codeAccountPda);
    const referralAccountPda = codeAccountData.referralAccount;

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
        message: 'Get referrer data success',
        data: referrerData
    }
}

export const checkAvailableArweaveItemId = (id: string) => {
    return id.length === 43;
};

export const extractArweaveHash = (url: string): string => {
    // 移除可能的末尾斜杠
    if(url === undefined) return "";
    const cleanUrl = url.replace(/\/$/, '');
    // 从URL中提取最后一段作为hash
    const hash = cleanUrl.split('/').pop();
    if (!hash) {
        throw new Error('Invalid Arweave URL format');
    }
    return hash;
};

export const generateArweaveUrl = (updateTimestamp: number, id: string) => {
    if(updateTimestamp + ARWEAVE_DEFAULT_SYNC_TIME < Date.now() / 1000) {
        return `${ARWEAVE_GATEWAY_URL}/${id}`; // 从arweave加载
    } else {
        return `${ARSEEDING_GATEWAY_URL}/${id}`; // 从arseeding加载
    }
};

export const fetchMetadata = async (token: InitiazlizedTokenData): Promise<TokenMetadataIPFS | null> => {
    try {
        if (!token.tokenUri) return null;
        // Check if the URI is an Arweave URL
        if (token.tokenUri.startsWith(ARWEAVE_GATEWAY_URL)) {
            let url = generateArweaveUrl(Number(token.metadataTimestamp), extractArweaveHash(token.tokenUri));
            const response = await axios.get(url);
            console.log('response', response.data);
            return {
                name: response.data.name,
                symbol: response.data.symbol,
                description: response.data.description,
                image: generateArweaveUrl(Number(token.metadataTimestamp), extractArweaveHash(response.data.image)),
                header: generateArweaveUrl(Number(token.metadataTimestamp), extractArweaveHash(response.data.header)),
                extensions: response.data.extensions,
            } as TokenMetadataIPFS
        }
        
        // Fallback to IPFS for backward compatibility
        if (token.tokenUri.startsWith('ipfs://') || token.tokenUri.startsWith('https://gateway.pinata.cloud')) {
            // Deprecated
            // 忽略之前通过IPFS保存的metadata和图片
            // const response = await pinata.gateways.get(extractIPFSHash(token.tokenUri) as string);
            // return response.data as TokenMetadataIPFS;
            return {
                name: 'Test',
                description: 'Test',
                image: 'https://picsum.photos/200/200',
            } as TokenMetadataIPFS
        }

        throw new Error('Unsupported URI format');
    } catch (error) {
        console.error('Error fetching token metadata:', error);
        return null;
    }
};

export const fetchTokenMetadataMap = async (tokenData: Array<InitiazlizedTokenData>): Promise<Record<string, InitiazlizedTokenData>> => {
    if (!tokenData?.length) return {};
    const updatedMap: Record<string, InitiazlizedTokenData> = {};
    try {
        await Promise.all(tokenData.map(async (token) => {
            try {
                const tokenMetadata = await fetchMetadata(token);
                updatedMap[token.mint] = tokenMetadata ? { ...token, tokenMetadata } : token;
            } catch (error) {
                console.error(`Error fetching metadata for token ${token.mint}:`, error);
                updatedMap[token.mint] = token;
            }
        }));
    } catch (error) {
        console.error('Error fetching metadata for tokens:', error);
    }
    return updatedMap;
};

export const closeToken = async (
    wallet: AnchorWallet | undefined,
    connection: Connection,
    token: InitiazlizedTokenData,
): Promise<ResponseData> => {
    try {
        if (!wallet) {
            return {
                success: false,
                message: 'Please connect your wallet first'
            };
        }

        const program = getProgram(wallet, connection);

        const context = {
            mint: new PublicKey(token.mint),
            configAccount: new PublicKey(token.configAccount),
            tokenVault: new PublicKey(token.tokenVault),
            payer: wallet.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
        };

        const tx = await program.methods
            .closeToken(token.tokenName, token.tokenSymbol)
            .accounts(context)
            .transaction();
        return await processTransaction(tx, connection, wallet, {mint: token.mint});
    } catch (error: any) {
        if (error.message.includes('Transaction simulation failed: This transaction has already been processed')) {
            return {
                success: false,
                message: 'Something went wrong but the token was closed successfully',
            }
        }
        return {
            success: false,
            message: error.message || 'Failed to close token'
        };
    }
};

export const updateMetaData = async (
    wallet: AnchorWallet | undefined,
    connection: Connection,
    token: InitiazlizedTokenData,
    newMetadata: TokenMetadataIPFS
): Promise<ResponseData> => {
    try {
        if (!wallet) {
            return {
                success: false,
                message: 'Please connect your wallet first'
            };
        }

        const program = getProgram(wallet, connection);

        const [metadataAccountPda] = PublicKey.findProgramAddressSync(
            [
              Buffer.from(METADATA_SEED),
              TOKEN_METADATA_PROGRAM_ID.toBuffer(),
              new PublicKey(token.mint).toBuffer(),
            ],
            TOKEN_METADATA_PROGRAM_ID,
          );
        
        const systemConfig = await getSystemConfig(wallet, connection);
        if (!systemConfig.success) {
            return {
                success: false,
                message: systemConfig.message,
            };
        }
        const systemConfigData = systemConfig.data;

        const context = {
            mint: new PublicKey(token.mint),
            configAccount: new PublicKey(token.configAccount),
            payer: wallet.publicKey,
            metadata: metadataAccountPda,
            protocolFeeAccount: new PublicKey(systemConfigData.systemConfigData.protocolFeeAccount),
            systemConfigAccount: new PublicKey(systemConfigData.systemConfigAccountPda),
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            // rent: SYSVAR_RENT_PUBKEY,
            tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        };

        // 判断新的metadata是否和原来的metadata一样
        if (token.tokenMetadata?.description === newMetadata.description &&
            token.tokenMetadata?.image === newMetadata.image &&
            token.tokenMetadata?.header === newMetadata.header &&
            token.tokenMetadata?.name === newMetadata.name &&
            token.tokenMetadata?.symbol === newMetadata.symbol &&
            token.tokenMetadata?.extensions?.twitter === newMetadata.extensions?.twitter &&
            token.tokenMetadata?.extensions?.discord === newMetadata.extensions?.discord &&
            token.tokenMetadata?.extensions?.github === newMetadata.extensions?.github &&
            token.tokenMetadata?.extensions?.medium === newMetadata.extensions?.medium &&
            token.tokenMetadata?.extensions?.telegram === newMetadata.extensions?.telegram &&
            token.tokenMetadata?.extensions?.website === newMetadata.extensions?.website
        ) {
            return {
                success: false,
                message: 'Token metadata is the same as before',
            };
        }

        const metadataBlob = new Blob([JSON.stringify(newMetadata)], {
            type: 'application/json'
        });
        const metadataFile = new File([metadataBlob], 'metadata.json', {
            type: 'application/json'
        });

        // const metadataUrl = "https://arweave.net/WGCxn2nvHIo2WwhH2wx_wQXWXlnQsLoGNaT4IZXs9D4";
        const metadataUrl = await uploadToArweave(metadataFile); // ######
        console.log("metadataUrl", metadataUrl);
        const metadata: TokenMetadata = {
            symbol: token.tokenSymbol,
            name: token.tokenName,
            // decimals: 9,
            uri: metadataUrl,
        }
      
        const tx = await program.methods
            .updateTokenMetadata(metadata)
            .accounts(context)
            .transaction();
        return await processTransaction(tx, connection, wallet, {mint: token.mint});
    } catch (error: any) {
        if (error.message.includes('Transaction simulation failed: This transaction has already been processed')) {
            return {
                success: false,
                message: 'Something went wrong but the token metadata was updated successfully',
            }
        }
        return {
            success: false,
            message: error.message || 'Failed to update token metadata'
        };
    }
};

export const uploadToArweave = async (file: File, contentType: string = 'multipart/form-data'): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    try {
        const url = `${ARWEAVE_API_URL}/upload`;
        const response = await axios.post(url, formData, {
            headers: {
                'Content-Type': contentType,
            }
        });

        if (response.data.status === 'success') {
            return `${ARWEAVE_GATEWAY_URL}/${response.data.fileInfo.itemId}`;
        }
        throw new Error('Upload failed: ' + JSON.stringify(response.data));
    } catch (error) {
        console.error('Error uploading image to Arweave:', error);
        throw error;
    }
};
