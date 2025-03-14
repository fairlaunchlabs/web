import {
  AddressLookupTableAccount,
  BlockhashWithExpiryBlockHeight,
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import fairMintTokenIdl from '../idl/fair_mint_token.json';
// import transferHookIdl from '../idl/transfer_hook.json';
import { CONFIG_DATA_SEED, MINT_SEED, SYSTEM_CONFIG_SEEDS, SYSTEM_DEPLOYER, REFERRAL_SEED, REFUND_SEEDS, REFERRAL_CODE_SEED, CODE_ACCOUNT_SEEDS, ARSEEDING_GATEWAY_URL, UPLOAD_API_URL, ARWEAVE_GATEWAY_URL, ARWEAVE_DEFAULT_SYNC_TIME, PROTOCOL_FEE_ACCOUNT, IRYS_GATEWAY_URL, STORAGE, cpSwapProgram, cpSwapConfigAddress, createPoolFeeReceive, addressLookupTableAddress, slotsOfEstimatingInterval, METADATA_SEED, TOKEN_METADATA_PROGRAM_ID, WALLET_SIGN_MESSAGE } from '../config/constants';
import { InitializeTokenConfig, InitiazlizedTokenData, MetadataAccouontData, MintExtentionData, RemainingAccount, ResponseData, TargetTimestampData, TokenMetadata, TokenMetadataIPFS, TransferHookState } from '../types/types';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { FairMintToken } from '../types/fair_mint_token';
// import { TransferHook } from '../types/transfer_hook';
import axios from 'axios';
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress, NATIVE_MINT, TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAssociatedTokenAddressSync } from '@solana/spl-token';
import { fetchMetadataFromUrlOrCache } from './db';
import { BN_LAMPORTS_PER_SOL, getFeeValue, numberStringToBN } from './format';
import { calculateDepositAmounts, calculateWithdrawAmounts, getPoolData, poolBurnLpTokensInstructions, poolDepositInstructions, poolSwapBaseInInstructions, poolSwapBaseOutInstructions, poolWithdrawInstructions, } from './raydium_cpmm/instruction';
import { getAuthAddress, getOrcleAccountAddress, getPoolAddress, getPoolLpMintAddress, getPoolVaultAddress } from './raydium_cpmm/pda';
import { RENT_PROGRAM_ID, SYSTEM_PROGRAM_ID } from '@raydium-io/raydium-sdk-v2';
import { ASSOCIATED_PROGRAM_ID } from '@coral-xyz/anchor/dist/cjs/utils/token';
import bs58 from 'bs58';
import jwt from 'jsonwebtoken';

export const getProvider = (wallet: AnchorWallet, connection: Connection) => {
  return new AnchorProvider(
    connection,
    {
      ...wallet,
      signTransaction: wallet.signTransaction.bind(wallet),
      signAllTransactions: wallet.signAllTransactions.bind(wallet),
      publicKey: wallet.publicKey,
    },
    { commitment: 'confirmed' }
  );
}

const getProgram = (wallet: AnchorWallet, connection: Connection) => {
  const provider = getProvider(wallet, connection);
  return new Program(fairMintTokenIdl as FairMintToken, provider);
}

export const compareMints = (mintA: PublicKey, mintB: PublicKey): number => {
  const bufferA = mintA.toBuffer();
  const bufferB = mintB.toBuffer();

  for (let i = 0; i < bufferA.length; i++) {
    if (bufferA[i] !== bufferB[i]) {
      return bufferA[i] - bufferB[i];
    }
  }
  return 0;
}

export const initializeToken = async (
  metadata: TokenMetadata,
  wallet: AnchorWallet,
  connection: Connection,
  config: InitializeTokenConfig
): Promise<ResponseData> => {
  try {
    if (!wallet) {
      // throw new Error('Please connect your wallet first');
      return {
        success: false,
        message: 'Please connect your wallet first',
      }
    }
    const program = getProgram(wallet, connection);
    const [mintPda] = PublicKey.findProgramAddressSync(
      [Buffer.from(MINT_SEED), Buffer.from(metadata.name), Buffer.from(metadata.symbol.toLowerCase())],
      program.programId
    );
    const mintAccountInfo = await connection.getAccountInfo(mintPda);
    if (mintAccountInfo) {
      // throw new Error('Token already exists');
      return {
        success: false,
        message: 'Token already exists',
      }
    }

    const [configPda] = PublicKey.findProgramAddressSync(
      [Buffer.from(CONFIG_DATA_SEED), mintPda.toBuffer()],
      program.programId
    );

    const configAccountInfo = await connection.getAccountInfo(configPda);
    if (configAccountInfo) {
      // throw new Error('Config account already exists');
      return {
        success: false,
        message: 'Config account already exists',
      }
    }
    const [metadataAccountPda] = PublicKey.findProgramAddressSync(
      [Buffer.from(METADATA_SEED), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mintPda.toBuffer()],
      TOKEN_METADATA_PROGRAM_ID,
    );
    const metadataAccountInfo = await connection.getAccountInfo(metadataAccountPda);
    if (metadataAccountInfo) {
      return {
        success: false,
        message: 'Metadata account already exists',
      }
    }

    const [systemConfigAccountPda] = PublicKey.findProgramAddressSync(
      [Buffer.from(SYSTEM_CONFIG_SEEDS), new PublicKey(SYSTEM_DEPLOYER).toBuffer()],
      program.programId,
    );
    const wsolVaultAta = await getAssociatedTokenAddress(NATIVE_MINT, configPda, true, TOKEN_PROGRAM_ID);
    const tokenVaultAta = await getAssociatedTokenAddress(mintPda, configPda, true, TOKEN_PROGRAM_ID);
    const mintTokenVaultAta = await getAssociatedTokenAddress(mintPda, mintPda, true, TOKEN_PROGRAM_ID);

    const contextInitializeTokenAccounts = {
      metadata: metadataAccountPda,
      payer: wallet.publicKey,
      mint: mintPda,
      configAccount: configPda,
      mintTokenVault: mintTokenVaultAta,
      tokenVault: tokenVaultAta,
      wsolMint: NATIVE_MINT,
      wsolVault: wsolVaultAta,
      systemConfigAccount: systemConfigAccountPda,
      protocolFeeAccount: new PublicKey(PROTOCOL_FEE_ACCOUNT),
      tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
    }

    const instructionInitializeToken = await program.methods
      .initializeToken(metadata, config as any)
      .accounts(contextInitializeTokenAccounts)
      .instruction();

    const tx = new Transaction().add(instructionInitializeToken);
    return await processTransaction(tx, connection, wallet, "Create token successfully", { mintAddress: mintPda.toString() });
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

export const getTokenBalanceByMintAndOwner = async (mint: PublicKey, owner: PublicKey, connection: Connection, allowOwnerOffCurve: boolean = false, programId: PublicKey = TOKEN_PROGRAM_ID): Promise<number | null> => {
  const ata = await getAssociatedTokenAddress(mint, owner, allowOwnerOffCurve, programId);
  const ataInfo = await connection.getAccountInfo(ata);
  if (!ataInfo) return 0;
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
  const referrerAta = await getAssociatedTokenAddress(
    mint,
    wallet.publicKey,
    false,
    TOKEN_PROGRAM_ID
  )
  const referrerAtaInfo = await connection.getAccountInfo(referrerAta);
  const instructionCreateReferrerAta = createAssociatedTokenAccountInstruction(
    wallet.publicKey,
    referrerAta,
    wallet.publicKey,
    mint,
    TOKEN_PROGRAM_ID
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
    tokenProgram: TOKEN_PROGRAM_ID,
    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
  };
  const instructionSetReferrerCode = await program.methods
    .setReferrerCode(tokenName, tokenSymbol, codeHash.data.toBuffer())
    .accounts(setReferrerCodeAccounts)
    .transaction();

  try {
    // do the tranasaction
    const transaction = new Transaction();
    // If the referrer ata does not exist, create it
    if (!referrerAtaInfo) transaction.add(instructionCreateReferrerAta);
    transaction.add(instructionSetReferrerCode);
    return await processTransaction(transaction, connection, wallet, "Reactive referrer code successfully", { referralAccount: referralAccountPda.toBase58(), mint: mint.toBase58() });
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
    TOKEN_PROGRAM_ID,
  )

  const referrerAtaInfo = await connection.getAccountInfo(referrerAta);

  const instructionCreateReferrerAta = createAssociatedTokenAccountInstruction(
    wallet.publicKey,
    referrerAta,
    wallet.publicKey,
    mint,
    TOKEN_PROGRAM_ID
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
    referrerAta,
    codeAccount: codeAccountPda,
    configAccount: configAccountPda,
    systemConfigAccount: systemConfigAccountPda,
    payer: wallet.publicKey,
    systemProgram: SystemProgram.programId,
    tokenProgram: TOKEN_PROGRAM_ID,
    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
  };
  const instructionSetReferrerCode = await program.methods
    .setReferrerCode(tokenName, tokenSymbol, codeHash.data.toBuffer())
    .accounts(setReferrerCodeAccounts)
    .transaction();

  try {
    // do the tranasaction
    const transaction = new Transaction();
    // If the referrer ata does not exist, create it
    if (!referrerAtaInfo) transaction.add(instructionCreateReferrerAta);
    transaction.add(instructionSetReferrerCode);
    return await processTransaction(transaction, connection, wallet, "Set referrer code successfully", { referralAccount: referralAccountPda.toBase58() });
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
  if (!wallet) return {
    success: false,
    message: 'Please connect wallet'
  }

  const referrerAta = await getAssociatedTokenAddress(
    mint,
    wallet.publicKey,
    false,
    TOKEN_PROGRAM_ID
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
  if (!wallet) return {
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
    console.log(error);
    return {
      success: false,
      message: 'Error getting system config'
    }
  }
}

export const getRefundAccountData = async (wallet: AnchorWallet, connection: Connection, token: InitiazlizedTokenData) => {
  if (!wallet) return {
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
    // console.log("refundAccountData", refundAccountData);
    return {
      success: true,
      message: 'Get refund data success',
      data: refundAccountData
    };
  } catch (error) {
    // console.log("getRefundAccountData", error);
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
): Promise<ResponseData> => {
  if (!wallet) return {
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
  const tokenAta = await getAssociatedTokenAddress(new PublicKey(token.mint), wallet.publicKey, false, TOKEN_PROGRAM_ID);
  const payerWsolAta = getAssociatedTokenAddressSync(NATIVE_MINT, wallet.publicKey, false, TOKEN_PROGRAM_ID);
  const protocolWsolAta = getAssociatedTokenAddressSync(NATIVE_MINT, new PublicKey(PROTOCOL_FEE_ACCOUNT), false, TOKEN_PROGRAM_ID);
  const wsolVaultAta = await getAssociatedTokenAddress(NATIVE_MINT, new PublicKey(token.configAccount), true, TOKEN_PROGRAM_ID);

  const refundAccounts = {
    mint: new PublicKey(token.mint),
    refundAccount: refundAccountPda,
    configAccount: new PublicKey(token.configAccount),
    tokenAta,
    tokenVault: new PublicKey(token.tokenVault),
    protocolFeeAccount: new PublicKey(PROTOCOL_FEE_ACCOUNT),
    systemConfigAccount: systemConfigAccountPda,
    payer: wallet.publicKey,
    wsolVault: wsolVaultAta,
    payerWsolVault: payerWsolAta,
    protocolWsolVault: protocolWsolAta,
    tokenProgram: TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
  };
  const instructionRefund = await program.methods
    .refund(token.tokenName, token.tokenSymbol)
    .accounts(refundAccounts)
    .instruction();

  try {
    const tx = new Transaction();

    const payerWsolAtaData = await connection.getAccountInfo(payerWsolAta);
    // If payer has not received WSOL before and has no WSOL ata, create it
    if (!payerWsolAtaData) tx.add(createAssociatedTokenAccountInstruction(
      wallet.publicKey,
      payerWsolAta,
      wallet.publicKey,
      NATIVE_MINT,
      TOKEN_PROGRAM_ID
    ));
    // If protocol account has not received WSOL before and has no WSOL ata, create it
    const protocolWsolAtaData = await connection.getAccountInfo(protocolWsolAta);
    if (!protocolWsolAtaData) tx.add(createAssociatedTokenAccountInstruction(
      wallet.publicKey,
      protocolWsolAta,
      new PublicKey(PROTOCOL_FEE_ACCOUNT),
      NATIVE_MINT,
      TOKEN_PROGRAM_ID
    ));
    // Add refund instruction
    tx.add(instructionRefund);
    // send transactions
    return await processTransaction(tx, connection, wallet, "Refund successfully", { mint: token.mint });
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
  if (!wallet) return {
    success: false,
    message: 'Please connect wallet'
  }

  if (referrerMain.toBase58() === wallet.publicKey.toBase58()) return {
    success: false,
    message: 'You cannot be your own referrer'
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

  if (referrerMain.toBase58() !== referrerData.referrerMain.toBase58()) {
    return {
      success: false,
      message: 'Wrong referrer account'
    }
  }
  const codeHash = getReferrerCodeHash(wallet, connection, code);
  if (!codeHash.success) {
    return {
      success: false,
      message: codeHash.message
    }
  }
  if (codeHash.data?.toBase58() !== referrerData.codeHash.toBase58()) {
    return {
      success: false,
      message: 'Wrong referrer code'
    }
  }
  // TODO: check if referrer code is exceed max usage

  const destinationAta = await getAssociatedTokenAddress(new PublicKey(token.mint), wallet.publicKey, false, TOKEN_PROGRAM_ID);
  const destinationAtaInfo = await connection.getAccountInfo(destinationAta);
  const [refundAccountPda] = PublicKey.findProgramAddressSync(
    [Buffer.from(REFUND_SEEDS), new PublicKey(token.mint).toBuffer(), wallet.publicKey.toBuffer()],
    program.programId,
  );
  const [systemConfigAccountPda] = PublicKey.findProgramAddressSync(
    [Buffer.from(SYSTEM_CONFIG_SEEDS), new PublicKey(SYSTEM_DEPLOYER).toBuffer()],
    program.programId,
  );

  const configAccountPda = new PublicKey(token.configAccount);
  const wsolVaultAta = await getAssociatedTokenAddress(NATIVE_MINT, configAccountPda, true, TOKEN_PROGRAM_ID);
  const protocolWsolAta = getAssociatedTokenAddressSync(NATIVE_MINT, new PublicKey(PROTOCOL_FEE_ACCOUNT), false, TOKEN_PROGRAM_ID);
  const destinationWsolAta = getAssociatedTokenAddressSync(NATIVE_MINT, wallet.publicKey, false, TOKEN_PROGRAM_ID);
  const destinationWsolInfo = await connection.getAccountInfo(destinationWsolAta);
  const mintTokenVaultAta = await getAssociatedTokenAddress(new PublicKey(token.mint), new PublicKey(token.mint), true, TOKEN_PROGRAM_ID);

  let token0Mint = new PublicKey(token.mint);
  let token1Mint = NATIVE_MINT;
  if (compareMints(token0Mint, token1Mint) > 0) {
    [token0Mint, token1Mint] = [token1Mint, token0Mint];
  }
  const [poolAddress] = getPoolAddress(cpSwapConfigAddress, token0Mint, token1Mint, cpSwapProgram);

  const mintAccounts = {
    mint: new PublicKey(token.mint),
    destination: destinationAta,
    destinationWsolAta: destinationWsolAta,
    refundAccount: refundAccountPda,
    user: wallet.publicKey,
    configAccount: configAccountPda,
    systemConfigAccount: systemConfigAccountPda,
    mintTokenVault: mintTokenVaultAta,
    tokenVault: new PublicKey(token.tokenVault),
    wsolVault: wsolVaultAta,
    wsolMint: NATIVE_MINT,
    referrerAta: referrerAta,
    referrerMain: referrerMain,
    referralAccount: referralAccountPda,
    protocolFeeAccount: new PublicKey(PROTOCOL_FEE_ACCOUNT),
    protocolWsolVault: protocolWsolAta,
    poolState: poolAddress,
    ammConfig: cpSwapConfigAddress,
    cpSwapProgram: cpSwapProgram,
    token0Mint: token0Mint,
    token1Mint: token1Mint,
  };

  // console.log("=== mint accounts ===", Object.fromEntries(
  //     Object.entries(mintAccounts).map(([key, value]) => [key, value.toString()])
  // ));

  const instructionSetComputerUnitLimit = ComputeBudgetProgram.setComputeUnitLimit({ units: 500000 }); // or use --compute-unit-limit 400000 to run solana-test-validator
  const instructionCreateWSOLAta = createAssociatedTokenAccountInstruction( // Create WSOL for user if don't has
    wallet.publicKey,
    destinationWsolAta,
    wallet.publicKey,
    NATIVE_MINT,
    TOKEN_PROGRAM_ID
  );
  const instructionCreateTokenAta = createAssociatedTokenAccountInstruction( // Create token for user if don't has
    wallet.publicKey,
    destinationAta,
    wallet.publicKey,
    new PublicKey(token.mint),
    TOKEN_PROGRAM_ID
  );
  const remainingAccounts = getRemainingAccountsForMintTokens(new PublicKey(token.mint), wallet.publicKey);
  // Create versioned transaction with LUT
  const accountInfo = await connection.getAccountInfo(addressLookupTableAddress);
  const lookupTable = new AddressLookupTableAccount({
    key: addressLookupTableAddress,
    state: AddressLookupTableAccount.deserialize(accountInfo!.data),
  });

  const ix = await program.methods
    .mintTokens(token.tokenName, token.tokenSymbol, codeHash.data.toBuffer())
    .accounts(mintAccounts)
    .remainingAccounts(remainingAccounts)
    .instruction();
  const confirmLevel = "confirmed";
  const latestBlockhash = await connection.getLatestBlockhash(confirmLevel);
  const instructions = [instructionSetComputerUnitLimit];
  if (destinationAtaInfo === null) instructions.push(instructionCreateTokenAta);
  if (destinationWsolInfo === null) instructions.push(instructionCreateWSOLAta);
  instructions.push(ix);
  const versionedTx = new VersionedTransaction(
    new TransactionMessage({
      payerKey: wallet.publicKey,
      recentBlockhash: latestBlockhash.blockhash,
      instructions,
    }).compileToV0Message([lookupTable])
  );

  try {
    return processVersionedTransaction(versionedTx, connection, wallet, latestBlockhash, confirmLevel);
  } catch (error) {
    return {
      success: false,
      message: `Mint failed: ${error}`,
    }
  }
}

export const processVersionedTransaction = async (
  versionedTx: VersionedTransaction,
  connection: Connection,
  wallet: AnchorWallet,
  latestBlockhash: BlockhashWithExpiryBlockHeight,
  confirmLevel: 'processed' | 'confirmed' | 'finalized' = 'confirmed'
) => {
  if (!wallet?.publicKey) return {
    success: false,
    message: 'Please connect wallet'
  }
  try {
    versionedTx.message.recentBlockhash = latestBlockhash.blockhash;
    const signedTx = await wallet.signTransaction(versionedTx);
    const serializedTx = signedTx.serialize();
    const signature = await connection.sendRawTransaction(serializedTx, {
      skipPreflight: true,
    });
    const status = await connection.confirmTransaction({
      signature,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    }, confirmLevel);

    if (status.value.err) {
      return {
        success: false,
        message: `Mint failed: ${JSON.stringify(status.value.err)}`,
      }
    }
    return {
      success: true,
      message: `Mint succeeded`,
      data: {
        tx: signature,
      }
    }
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error.message,
    }
  }
}

const getRemainingAccountsForMintTokens = (
  mint: PublicKey,
  user: PublicKey
): Array<RemainingAccount> => {
  let token0 = mint;
  let token0Program = TOKEN_PROGRAM_ID;

  let token1 = NATIVE_MINT;
  let token1Program = TOKEN_PROGRAM_ID;

  if (compareMints(token0, token1) > 0) {
    [token0, token1] = [token1, token0];
    [token0Program, token1Program] = [token1Program, token0Program];
  }
  const [authority] = getAuthAddress(cpSwapProgram);
  const [poolAddress] = getPoolAddress(cpSwapConfigAddress, token0, token1, cpSwapProgram);
  const [lpMintAddress] = getPoolLpMintAddress(poolAddress, cpSwapProgram);
  const [vault0] = getPoolVaultAddress(poolAddress, token0, cpSwapProgram);
  const [vault1] = getPoolVaultAddress(poolAddress, token1, cpSwapProgram);
  const [observationAddress] = getOrcleAccountAddress(poolAddress, cpSwapProgram);
  const creatorLpTokenAddress = getAssociatedTokenAddressSync(lpMintAddress, user, false, TOKEN_PROGRAM_ID);
  const creatorToken0 = getAssociatedTokenAddressSync(token0, user, false, token0Program);
  const creatorToken1 = getAssociatedTokenAddressSync(token1, user, false, token1Program);

  return [{
    pubkey: cpSwapProgram, // <- 1
    isWritable: false,
    isSigner: false,
  }, {
    pubkey: user, // <- 2
    isWritable: true,
    isSigner: true,
  }, {
    pubkey: cpSwapConfigAddress, // <- 3
    isWritable: true,
    isSigner: false,
  }, {
    pubkey: authority, // <- 4
    isWritable: true,
    isSigner: false,
  }, {
    pubkey: poolAddress, // <- 5
    isWritable: true,
    isSigner: false,
  }, {
    pubkey: token0, // <- 6
    isWritable: true,
    isSigner: false,
  }, {
    pubkey: token1, // <- 7
    isWritable: true,
    isSigner: false,
  }, {
    pubkey: lpMintAddress, // <- 8
    isWritable: true,
    isSigner: false,
  }, {
    pubkey: creatorToken0, // <- 9
    isWritable: true,
    isSigner: false,
  }, {
    pubkey: creatorToken1, // <- 10
    isWritable: true,
    isSigner: false,
  }, {
    pubkey: creatorLpTokenAddress, // <- 11
    isWritable: true,
    isSigner: false,
  }, {
    pubkey: vault0, // <- 12
    isWritable: true,
    isSigner: false,
  }, {
    pubkey: vault1, // <- 13
    isWritable: true,
    isSigner: false,
  }, {
    pubkey: createPoolFeeReceive, // <- 14
    isWritable: true,
    isSigner: false,
  }, {
    pubkey: observationAddress, // <- 15
    isWritable: true,
    isSigner: false,
  }, {
    pubkey: TOKEN_PROGRAM_ID, // <- 16
    isWritable: true,
    isSigner: false,
  }, {
    pubkey: token0Program, // <- 17
    isWritable: true,
    isSigner: false,
  }, {
    pubkey: token1Program, // <- 18
    isWritable: true,
    isSigner: false,
  }, {
    pubkey: ASSOCIATED_PROGRAM_ID, // <- 19
    isWritable: true,
    isSigner: false,
  }, {
    pubkey: SYSTEM_PROGRAM_ID, // <- 20
    isWritable: true,
    isSigner: false,
  }, {
    pubkey: RENT_PROGRAM_ID, // <- 21
    isWritable: true,
    isSigner: false,
  }]
}

export const getReferralDataByCodeHash = async (
  wallet: AnchorWallet | undefined,
  connection: Connection,
  codeHash: PublicKey
) => {
  if (!wallet) return {
    success: false,
    message: 'Please connect wallet'
  }

  const program = getProgram(wallet, connection);

  const [codeAccountPda] = PublicKey.findProgramAddressSync(
    [Buffer.from(CODE_ACCOUNT_SEEDS), codeHash.toBuffer()],
    program.programId,
  );

  const codeAccountInfo = await connection.getAccountInfo(codeAccountPda);
  if (!codeAccountInfo) {
    return {
      success: false,
      message: 'Code account does not exist'
    }
  }
  const codeAccountData = await program.account.codeAccountData.fetch(codeAccountPda);
  const referralAccountPda = codeAccountData.referralAccount;

  const referralAccountInfo = await connection.getAccountInfo(referralAccountPda);
  if (!referralAccountInfo) {
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
  if (!wallet) return {
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
export const checkAvailableIrysItemId = (id: string) => {
  return id.length === 43 || id.length === 44;
};

export const extractArweaveHash = (url: string): string => {
  if (url === undefined) return "";
  const cleanUrl = url.replace(/\/$/, '');
  const hash = cleanUrl.split('/').pop();
  if (!hash) {
    throw new Error('Invalid Arweave URL format');
  }
  return hash;
};

export const extractIrysHash = (url: string): string => {
  if (url === undefined) return "";
  const cleanUrl = url.replace(/\/$/, '');
  const hash = cleanUrl.split('/').pop();
  if (!hash) {
    throw new Error('Invalid Irys URL format');
  }
  return hash;
};

export const generateArweaveUrl = (updateTimestamp: number, id: string) => {
  if (updateTimestamp + ARWEAVE_DEFAULT_SYNC_TIME < Date.now() / 1000) {
    return `${ARWEAVE_GATEWAY_URL}/${id}`; // Load from arweave
  } else {
    return `${ARSEEDING_GATEWAY_URL}/${id}`; // Load from arseeding
  }
};

export const generateIrysUrl = (updateTimestamp: number, id: string) => {
  return `${IRYS_GATEWAY_URL}/${id}`;
}

export const fetchMetadata = async (token: InitiazlizedTokenData): Promise<TokenMetadataIPFS | null> => {
  try {
    if (!token.tokenUri) return null;
    // Check if the URI is an Arweave URL
    if (token.tokenUri.includes(ARWEAVE_GATEWAY_URL) || token.tokenUri.includes("irys.xyz")) {
      return await fetchMetadataFromUrlOrCache(token.tokenUri, Number(token.metadataTimestamp));
    }

    // Deprecated
    if (token.tokenUri.startsWith('ipfs://') || token.tokenUri.startsWith('https://gateway.pinata.cloud')) {
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
        const tokenMetadata: TokenMetadataIPFS = await fetchMetadata(token) as TokenMetadataIPFS;
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
    const wsolVaultAta = await getAssociatedTokenAddress(NATIVE_MINT, new PublicKey(token.configAccount), true, TOKEN_PROGRAM_ID);
    const mintTokenVaultAta = await getAssociatedTokenAddress(new PublicKey(token.mint), new PublicKey(token.mint), true, TOKEN_PROGRAM_ID);

    const context = {
      mint: new PublicKey(token.mint),
      payer: wallet.publicKey,
      tokenVault: new PublicKey(token.tokenVault),
      wsolVault: wsolVaultAta,
      mintTokenVault: mintTokenVaultAta,
      configAccount: new PublicKey(token.configAccount),
    };

    const tx = await program.methods
      .closeToken(token.tokenName, token.tokenSymbol)
      .accounts(context)
      .transaction();
    return await processTransaction(tx, connection, wallet, "Close token successfully", { mint: token.mint });
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
      [Buffer.from(METADATA_SEED), TOKEN_METADATA_PROGRAM_ID.toBuffer(), new PublicKey(token.mint).toBuffer()],
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
      systemConfigAccount: new PublicKey(systemConfigData.systemConfigAccountPda),
      protocolFeeAccount: new PublicKey(systemConfigData.systemConfigData.protocolFeeAccount),
      tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
    };

    // console.log("update metadata context", Object.fromEntries(
    //   Object.entries(context).map(([key, value]) => [key, value.toString()])
    // ));

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
    const metadataUrl = await uploadToStorage(metadataFile, 'metadata');
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
    return await processTransaction(tx, connection, wallet, "Update token metadata successfully", { mint: token.mint });
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

export const revokeMetadataUpdateAuthority = async (
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

    const [metadataAccountPda] = PublicKey.findProgramAddressSync(
      [Buffer.from(METADATA_SEED), TOKEN_METADATA_PROGRAM_ID.toBuffer(), new PublicKey(token.mint).toBuffer()],
      TOKEN_METADATA_PROGRAM_ID,
    );

    const context = {
      mint: new PublicKey(token.mint),
      metadata: metadataAccountPda,
      payer: wallet.publicKey,
      configAccount: new PublicKey(token.configAccount),
      tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
    };
    const metadataParams = {
      name: token.tokenName as string,
      symbol: token.tokenSymbol as string,
      uri: token.tokenUri as string,
    }
    const tx = await program.methods
      .revokeUpdateMetadataAuthority(metadataParams)
      .accounts(context)
      .transaction();
    return await processTransaction(tx, connection, wallet, "Drop metadata update authority successfully", { mint: token.mint });
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    }
  }
}

export const delegateValueManager = async (
  wallet: AnchorWallet | undefined,
  connection: Connection,
  token: InitiazlizedTokenData,
  valueManagerAccount: string,
): Promise<ResponseData> => {
  if (!wallet) {
    return {
      success: false,
      message: 'Please connect your wallet first'
    }
  }
  // check valueManagerAccount
  try {
    new PublicKey(valueManagerAccount);
  } catch (error) {
    return {
      success: false,
      message: 'Invalid value manager account'
    }
  }

  const program = getProgram(wallet, connection);
  const context = {
    admin: wallet.publicKey,
    mint: new PublicKey(token.mint),
    configAccount: new PublicKey(token.configAccount),
  };

  try {
    const tx = await program.methods
      .delegateValueManager(token.tokenName as string, token.tokenSymbol as string, new PublicKey(valueManagerAccount))
      .accounts(context)
      .transaction();
    return await processTransaction(tx, connection, wallet, "Delegate value manager successfully", { mint: token.mint });
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    }
  }
}

// action: 'avatar' ｜ 'banner' | 'metadata'
export const uploadToStorage = async (file: File, action: string = 'avatar', contentType: string = 'multipart/form-data'): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('action', action);

  try {
    const url = `${UPLOAD_API_URL}/upload`;
    const response = await axios.post(url, formData, {
      headers: {
        'Content-Type': contentType,
      }
    });

    if (response.data.status === 'success') {
      if (STORAGE === "arweave") return `${ARWEAVE_GATEWAY_URL}/${response.data.fileInfo.itemId}`;
      else if (STORAGE === "irys") return `${IRYS_GATEWAY_URL}/${response.data.fileInfo.itemId}`;
    }
    throw new Error('Upload failed: ' + JSON.stringify(response.data));
  } catch (error) {
    console.error('Error uploading image to Arweave:', error);
    throw error;
  }
};

const processTransaction = async (
  tx: Transaction,
  connection: Connection,
  wallet: AnchorWallet,
  successMessage: string,
  extraData: {}
) => {
  try {
    // Get latest blockhash
    const latestBlockhash = await connection.getLatestBlockhash();

    // Get processing tx
    const processingTx = localStorage.getItem('processing_tx');
    const processingTimestamp = localStorage.getItem('processing_timestamp');
    const now = Date.now();

    // Check if there is a processing transaction (transaction within 2 seconds is considered as processing)
    if (processingTx && processingTimestamp && (now - parseInt(processingTimestamp)) < 2000) {
      return {
        success: false,
        message: 'Previous transaction is still processing. Please wait.'
      }
    }

    // Set transaction parameters
    tx.recentBlockhash = latestBlockhash.blockhash;
    tx.feePayer = wallet.publicKey;

    // Sign and serialize
    const signedTx = await wallet.signTransaction(tx);
    const serializedTx = signedTx.serialize();

    // Simulate the transaction
    const simulation = await connection.simulateTransaction(signedTx);

    // If simulation fails, return error
    if (simulation.value.err) {
      return {
        success: false,
        message: `Transaction simulation failed: ${parseAnchorError(simulation.value.logs as string[])}`
      };
    }

    // Mark the transaction as processing
    localStorage.setItem('processing_tx', 'true');
    localStorage.setItem('processing_timestamp', now.toString());

    // Send the transaction
    const txHash = await connection.sendRawTransaction(serializedTx, {
      skipPreflight: true 
    });

    // Wait for the transaction confirmation
    const confirmation = await connection.confirmTransaction({
      signature: txHash,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
    }, 'confirmed');

    if (confirmation.value.err) {
      const txDetails = await connection.getTransaction(txHash, {
        commitment: "confirmed",
        maxSupportedTransactionVersion: 0,
      });
      const errorMessage = parseAnchorError(txDetails?.meta?.logMessages || []);
      return {
        success: false,
        message: 'Transaction failed: ' + errorMessage
      }
    }

    return {
      success: true,
      message: successMessage,
      data: {
        tx: txHash,
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
    localStorage.removeItem('processing_tx');
    localStorage.removeItem('processing_timestamp');
  }
}

// 解析 Anchor 错误的辅助函数
function parseAnchorError(logs: string[]): string {
  console.log("parseAnchorError logs", logs);
  // TODO:
  // for (const log of logs) {
  //   const anchorErrorMatch = log.match(/Error Code: (\d+)\. Error Message: (.+)/);
  //   if (anchorErrorMatch) {
  //     const errorCode = parseInt(anchorErrorMatch[1], 10);
  //     const errorMsg = ANCHOR_ERROR_MAP[errorCode] || "Unknown Anchor error";
  //     return `${errorMsg} (Code: ${errorCode})`;
  //   }
  //   // 如果是自定义错误但没有详细消息
  //   if (log.includes("Program failed to complete")) {
  //     return "Transaction failed due to program error";
  //   }
  // }
  return logs.toString();
}
export const getMintDiscount = async (
  wallet: AnchorWallet | undefined,
  connection: Connection,
  token: InitiazlizedTokenData,
  inputCode?: string
) => {
  if (!wallet) {
    return {
      success: false,
      message: 'Please connect wallet',
    };
  }

  if (inputCode === null || inputCode === undefined || inputCode === '') {
    return {
      success: false,
      message: 'URC code is not available',
    };
  }

  const codeHash = getReferrerCodeHash(wallet, connection, inputCode);
  const result = await getReferralDataByCodeHash(wallet, connection, codeHash.data as PublicKey);
  if (!result.success) {
    return {
      success: false,
      message: result.message as string
    };
  }
  if (result.data === null || result.data === undefined) {
    return {
      success: false,
      message: 'Referral data not found',
    };
  }

  const ataBalance = await getTokenBalance(result.data.referrerAta, connection) as number;

  const [acturalPay,] = getFeeValue(
    numberStringToBN(token.feeRate),
    parseFloat(token.difficultyCoefficientEpoch),
    numberStringToBN(ataBalance.toString()).mul(BN_LAMPORTS_PER_SOL),
    numberStringToBN(token.supply),
  )
  const discount = (100 - Number(acturalPay) / parseInt(token.feeRate) * 100).toFixed(2);
  return {
    success: true,
    data: discount
  };
};

async function getLegacyTokenMetadataAccountData(connection: Connection, metadataAccountPda: PublicKey): Promise<ResponseData> {
  try {
    const metadataAccountInfo = await connection.getAccountInfo(metadataAccountPda);
    if (!metadataAccountInfo) {
      throw new Error('Metadata account not found');
    }

    const data = metadataAccountInfo.data;

    // Parse key (1 byte)
    const key = data[0];

    // Parse update authority (32 bytes)
    const updateAuthority = new PublicKey(data.slice(1, 33));

    // Parse mint (32 bytes)
    const mint = new PublicKey(data.slice(33, 65));

    // Parse name
    const nameLength = data.readUInt32LE(65);
    let currentPos = 69;
    const name = data.slice(currentPos, currentPos + nameLength).toString('utf8');
    currentPos += nameLength;

    // Parse symbol
    const symbolLength = data.readUInt32LE(currentPos);
    currentPos += 4;
    const symbol = data.slice(currentPos, currentPos + symbolLength).toString('utf8');
    currentPos += symbolLength;

    // Parse uri
    const uriLength = data.readUInt32LE(currentPos);
    currentPos += 4;
    const uri = data.slice(currentPos, currentPos + uriLength).toString('utf8');
    currentPos += uriLength;

    // Parse seller fee basis points (2 bytes)
    const sellerFeeBasisPoints = data.readUInt16LE(currentPos);
    currentPos += 2;

    // Parse creators
    const hasCreators = data[currentPos];
    currentPos += 1;

    let creators = [];
    if (hasCreators) {
      const creatorsLength = data.readUInt32LE(currentPos);
      currentPos += 4;
      for (let i = 0; i < creatorsLength; i++) {
        const creatorAddress = new PublicKey(data.slice(currentPos, currentPos + 32));
        currentPos += 32;
        const verified = data[currentPos] === 1;
        currentPos += 1;
        const share = data[currentPos];
        currentPos += 1;
        creators.push({ address: creatorAddress, verified, share });
      }
    }

    // Parse collection
    const hasCollection = data[currentPos];
    currentPos += 1;
    let collection = null;
    if (hasCollection) {
      const collectionKey = new PublicKey(data.slice(currentPos, currentPos + 32));
      currentPos += 32;
      const verified = data[currentPos] === 1;
      currentPos += 1;
      collection = { key: collectionKey, verified };
    }

    // Finally, parse isMutable
    const isMutable = data[currentPos] === 1;

    const response = {
      key,
      updateAuthority,
      mint: mint,
      isMutable,
      data: {
        name,
        symbol,
        uri,
        sellerFeeBasisPoints,
        creators: creators.map(c => ({
          address: c.address,
          verified: c.verified,
          share: c.share
        })),
      },
      collection: collection ? {
        key: collection.key.toBase58(),
        verified: collection.verified
      } : null,
    } as MetadataAccouontData;

    return {
      success: true,
      data: response,
    };
  } catch (error: any) {
    console.error('Error fetching metadata:', error);
    return {
      success: false,
      message: error.message,
    }
  }
}

export async function getTokenMetadataMutable(connection: Connection, mint: PublicKey): Promise<boolean> {
  const metadataAccountPda = PublicKey.findProgramAddressSync(
    [Buffer.from(METADATA_SEED), TOKEN_METADATA_PROGRAM_ID.toBuffer(), new PublicKey(mint).toBuffer()],
    TOKEN_METADATA_PROGRAM_ID,
  )[0];
  const metadataAccouontData = (await getLegacyTokenMetadataAccountData(connection, metadataAccountPda)).data as MetadataAccouontData;
  return metadataAccouontData !== undefined ? metadataAccouontData.isMutable : false;
}

export async function getBlockTimestamp(
  connection: Connection
): Promise<number> {
  let slot = await connection.getSlot();
  return await connection.getBlockTime(slot) as number;
}

export const burnTokensFromMintTokenVault = async (
  wallet: AnchorWallet | undefined,
  connection: Connection,
  token: InitiazlizedTokenData,
  amount: BN,
): Promise<ResponseData> => {
  if (!wallet) return {
    success: false,
    message: 'Please connect wallet'
  }
  const program = getProgram(wallet, connection);
  const mintTokenVaultAta = await getAssociatedTokenAddress(new PublicKey(token.mint), new PublicKey(token.mint), true, TOKEN_PROGRAM_ID);

  const context = {
    mint: new PublicKey(token.mint),
    configAccount: new PublicKey(token.configAccount),
    payer: wallet.publicKey,
    mintTokenVault: mintTokenVaultAta,
  }
  
  const ix = await program.methods
  .burnMintTokenVault(token.tokenName, token.tokenSymbol, amount)
  .accounts(context)
  .instruction();

  try {
    const tx = new Transaction();
    tx.add(ix);
    // send transactions
    return await processTransaction(tx, connection, wallet, "Burn system tokens successfully", { mint: token.mint });
  } catch (error: any) {
    if (error.message.includes('Transaction simulation failed: This transaction has already been processed')) {
      return {
        success: false,
        message: 'Something went wrong but you have burn successfully',
      }
    }
    return {
      success: false,
      message: 'Error burning' + error
    }
  }
}

export async function proxyCreatePool(
  wallet: AnchorWallet | undefined,
  connection: Connection,
  token: InitiazlizedTokenData,
): Promise<ResponseData> {
  if (!wallet) return {
    success: false,
    message: 'Please connect wallet'
  }
  const program = getProgram(wallet, connection);
  const destinationAta = await getAssociatedTokenAddress(new PublicKey(token.mint), wallet.publicKey, false, TOKEN_PROGRAM_ID);

  const destinationAtaInfo = await connection.getAccountInfo(destinationAta);
  const [refundAccountPda] = PublicKey.findProgramAddressSync(
    [Buffer.from(REFUND_SEEDS), new PublicKey(token.mint).toBuffer(), wallet.publicKey.toBuffer()],
    program.programId,
  );
  const [systemConfigAccountPda] = PublicKey.findProgramAddressSync(
    [Buffer.from(SYSTEM_CONFIG_SEEDS), new PublicKey(SYSTEM_DEPLOYER).toBuffer()],
    program.programId,
  );

  const configAccountPda = new PublicKey(token.configAccount);
  const wsolVaultAta = await getAssociatedTokenAddress(NATIVE_MINT, configAccountPda, true, TOKEN_PROGRAM_ID);
  const creatorWsolVault = getAssociatedTokenAddressSync(NATIVE_MINT, wallet.publicKey, false, TOKEN_PROGRAM_ID);
  const creatorTokenVault = getAssociatedTokenAddressSync(new PublicKey(token.mint), wallet.publicKey, false, TOKEN_PROGRAM_ID);
  const destinationWsolAta = getAssociatedTokenAddressSync(NATIVE_MINT, wallet.publicKey, false, TOKEN_PROGRAM_ID);
  const destinationWsolInfo = await connection.getAccountInfo(destinationWsolAta);

  let token0Mint = new PublicKey(token.mint);
  let token1Mint = NATIVE_MINT;
  if (compareMints(token0Mint, token1Mint) > 0) {
    [token0Mint, token1Mint] = [token1Mint, token0Mint];
  }
  const [poolAddress] = getPoolAddress(cpSwapConfigAddress, token0Mint, token1Mint, cpSwapProgram);

  const contextProxyInitialize = {
    creator: wallet.publicKey,
    creatorTokenVault: creatorTokenVault,
    creatorWsolVault: creatorWsolVault,
    mint: new PublicKey(token.mint),
    configAccount: configAccountPda,
    tokenVault: new PublicKey(token.tokenVault),
    systemConfigAccount: systemConfigAccountPda,
    wsolVault: wsolVaultAta,
    wsolMint: NATIVE_MINT,
    poolState: poolAddress,
    ammConfig: cpSwapConfigAddress,
    cpSwapProgram: cpSwapProgram,
    token0Mint: token0Mint,
    token1Mint: token1Mint,
    tokenProgram: TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
  };

  const instructionSetComputerUnitLimit = ComputeBudgetProgram.setComputeUnitLimit({ units: 500000 }); // or use --compute-unit-limit 400000 to run solana-test-validator
  const instructionCreateWSOLAta = createAssociatedTokenAccountInstruction(wallet.publicKey, destinationWsolAta, wallet.publicKey, NATIVE_MINT, TOKEN_PROGRAM_ID);
  const instructionCreateTokenAta = createAssociatedTokenAccountInstruction(wallet.publicKey, destinationAta, wallet.publicKey, new PublicKey(token.mint), TOKEN_PROGRAM_ID);
  const remainingAccounts = getRemainingAccountsForMintTokens(new PublicKey(token.mint), wallet.publicKey);

  const accountInfo = await connection.getAccountInfo(addressLookupTableAddress);
  const lookupTable = new AddressLookupTableAccount({
    key: addressLookupTableAddress,
    state: AddressLookupTableAccount.deserialize(accountInfo!.data),
  });

  const ix = await program.methods
    .proxyCreatePool(token.tokenName, token.tokenSymbol)
    .accounts(contextProxyInitialize)
    .remainingAccounts(remainingAccounts)
    .instruction();
  const confirmLevel = "confirmed";
  const latestBlockhash = await connection.getLatestBlockhash(confirmLevel);
  const instructions = [instructionSetComputerUnitLimit];
  if (destinationAtaInfo === null) instructions.push(instructionCreateTokenAta);
  if (destinationWsolInfo === null) instructions.push(instructionCreateWSOLAta);
  instructions.push(ix);
  const versionedTx = new VersionedTransaction(
    new TransactionMessage({
      payerKey: wallet.publicKey,
      recentBlockhash: latestBlockhash.blockhash,
      instructions,
    }).compileToV0Message([lookupTable])
  );

  try {
    return processVersionedTransaction(versionedTx, connection, wallet, latestBlockhash, confirmLevel);
  } catch (error) {
    return {
      success: false,
      message: `Create pool failed: ${error}`,
    }
  }
}

export async function proxyAddLiquidity(
  wallet: AnchorWallet | undefined,
  connection: Connection,
  tokenData: InitiazlizedTokenData,
  desiredToken0Amount: BN,
  desiredToken1Amount: BN,
): Promise<ResponseData> {
  if (!wallet) {
    return {
      success: false,
      message: 'Wallet not connected',
    }
  }
  const program = getProgram(wallet, connection);

  let token0 = new PublicKey(tokenData.mint);
  let token0Program = TOKEN_PROGRAM_ID;

  let token1 = NATIVE_MINT;
  let token1Program = TOKEN_PROGRAM_ID;

  let pair = `${tokenData.tokenSymbol}/SOL`;

  if (compareMints(token0, token1) > 0) {
    [token0, token1] = [token1, token0];
    [token0Program, token1Program] = [token1Program, token0Program];
    [desiredToken0Amount, desiredToken1Amount] = [desiredToken1Amount, desiredToken0Amount];
    pair = `SOL/${tokenData.tokenSymbol}`;
  }

  // Check if the pool has been created already
  const poolData = await getPoolData(program, token0, token1);
  if (poolData === undefined) {
    return {
      success: false,
      message: 'Pool has not been created yet',
    }
  }

  const depositAmount = await calculateDepositAmounts(program, token0, token1, desiredToken0Amount, desiredToken1Amount)

  // Add liquidity
  const ixs = await poolDepositInstructions(
    program,
    wallet.publicKey, // creator
    tokenData.tokenName,
    tokenData.tokenSymbol,
    token0, // -> token_0
    token0Program,
    token1, // -> token_1
    token1Program,
    depositAmount.lpTokenAmount,
    depositAmount.maxToken0Amount,
    depositAmount.maxToken1Amount,
  );
  const tx = new Transaction();
  for (var i = 0; i < ixs.length; i++) {
    tx.add(ixs[i]);
  }
  return await processTransaction(tx, connection, wallet, 'Pool deposited', {});
}

export async function proxyRemoveLiquidity(
  wallet: AnchorWallet | undefined,
  connection: Connection,
  tokenData: InitiazlizedTokenData,
  desiredToken0Amount: BN,
  desiredToken1Amount: BN,
): Promise<ResponseData> {
  if (!wallet) {
    return {
      success: false,
      message: 'Wallet not connected',
    }
  }
  const program = getProgram(wallet, connection);
  let token0 = new PublicKey(tokenData.mint);
  let token0Program = TOKEN_PROGRAM_ID;

  let token1 = NATIVE_MINT;
  let token1Program = TOKEN_PROGRAM_ID;

  let pair = `${tokenData.tokenSymbol}/SOL`;

  if (compareMints(token0, token1) > 0) {
    [token0, token1] = [token1, token0];
    [token0Program, token1Program] = [token1Program, token0Program];
    [desiredToken0Amount, desiredToken1Amount] = [desiredToken1Amount, desiredToken0Amount];
    pair = `SOL/${tokenData.tokenSymbol}`;
  }

  // Check if the pool has been created already
  const poolData = await getPoolData(program, token0, token1);
  if (poolData === undefined) {
    return {
      success: false,
      message: 'Pool has not been created yet',
    }
  }

  const withdrawAmount = await calculateWithdrawAmounts(program, token0, token1, desiredToken0Amount, desiredToken1Amount)

  // Add liquidity
  const ixs = await poolWithdrawInstructions(
    program,
    wallet.publicKey, // creator
    tokenData.tokenName,
    tokenData.tokenSymbol,
    token0, // -> token_0
    token0Program,
    token1, // -> token_1
    token1Program,
    withdrawAmount.lpTokenAmount,
    withdrawAmount.minToken0Amount,
    withdrawAmount.minToken1Amount,
  );
  const tx = new Transaction();
  for (var i = 0; i < ixs.length; i++) {
    tx.add(ixs[i]);
  }
  return await processTransaction(tx, connection, wallet, 'Pool withdrawn', {});
}

// Sell token, get SOL
export async function proxySwapBaseIn(
  wallet: AnchorWallet | undefined,
  connection: Connection,
  tokenData: InitiazlizedTokenData,
  tokenInAmount: BN,
  tokenOutAmount: BN,
  slippage: BN, // 10 means 0.1%
): Promise<ResponseData> {
  if (!wallet) {
    return {
      success: false,
      message: 'Wallet not connected',
    }
  }
  const program = getProgram(wallet, connection);
  let tokenIn = new PublicKey(tokenData.mint);
  let tokenInProgram = TOKEN_PROGRAM_ID;

  let tokenOut = NATIVE_MINT;
  let tokenOutProgram = TOKEN_PROGRAM_ID;
  let minTokenOutAmount = tokenOutAmount.mul(new BN(10000).sub(slippage)).div(new BN(10000));

  // Check if the pool has been created already
  const poolData = await getPoolData(program, tokenOut, tokenIn);
  if (poolData === undefined) {
    return {
      success: false,
      message: 'Pool has not been created yet',
    }
  }

  const ixs = await poolSwapBaseInInstructions(
    program,
    wallet.publicKey, // creator
    tokenData.tokenName,
    tokenData.tokenSymbol,
    tokenIn, // -> token_0
    tokenInProgram,
    tokenOut, // -> token_1
    tokenOutProgram,
    tokenInAmount,
    minTokenOutAmount,
  );
  const tx = new Transaction();
  for (var i = 0; i < ixs.length; i++) {
    tx.add(ixs[i]);
  }
  return await processTransaction(tx, connection, wallet, 'Swap token to SOL', {});
}

// Buy token, sell SOL
export async function proxySwapBaseOut(
  wallet: AnchorWallet | undefined,
  connection: Connection,
  tokenData: InitiazlizedTokenData,
  tokenInAmount: BN,
  tokenOutAmount: BN,
  slippage: BN, // 10 means 0.1%
): Promise<ResponseData> {
  if (!wallet) {
    return {
      success: false,
      message: 'Wallet not connected',
    }
  }
  const program = getProgram(wallet, connection);
  let token0 = new PublicKey(tokenData.mint);
  let token0Program = TOKEN_PROGRAM_ID;

  let token1 = NATIVE_MINT;
  let token1Program = TOKEN_PROGRAM_ID;

  const tokenOut = token0;
  const tokenOutProgram = token0Program;
  const tokenIn = token1;
  const tokenInProgram = token1Program;

  let maxTokenInAmount = tokenInAmount.mul(new BN(10000).add(slippage)).div(new BN(10000));

  // Check if the pool has been created already
  const poolData = await getPoolData(program, token0, token1);
  if (poolData === undefined) {
    return {
      success: false,
      message: 'Pool has not been created yet',
    }
  }

  const ixs = await poolSwapBaseOutInstructions(
    program,
    wallet.publicKey, // creator
    tokenData.tokenName,
    tokenData.tokenSymbol,
    tokenOut, // -> token_0
    tokenOutProgram,
    tokenIn, // -> token_1
    tokenInProgram,
    tokenOutAmount,
    maxTokenInAmount,
  );
  const tx = new Transaction();
  for (var i = 0; i < ixs.length; i++) {
    tx.add(ixs[i]);
  }
  return await processTransaction(tx, connection, wallet, 'Swap SOL to token', {});
}

// Burn LP token
export async function proxyBurnLpToken(
  wallet: AnchorWallet | undefined,
  connection: Connection,
  tokenData: InitiazlizedTokenData,
  amount: BN,
): Promise<ResponseData> {
  if (!wallet) {
    return {
      success: false,
      message: 'Wallet not connected',
    }
  }
  const program = getProgram(wallet, connection);
  let token0 = new PublicKey(tokenData.mint);
  let token0Program = TOKEN_PROGRAM_ID;

  let token1 = NATIVE_MINT;
  let token1Program = TOKEN_PROGRAM_ID;

  let pair = `${tokenData.tokenSymbol}/SOL`;

  if (compareMints(token0, token1) > 0) {
    [token0, token1] = [token1, token0];
    [token0Program, token1Program] = [token1Program, token0Program];
    pair = `SOL/${tokenData.tokenSymbol}`;
  }
  // check LP token balance of config account
  const ixs = await poolBurnLpTokensInstructions(
    program,
    wallet.publicKey,
    tokenData.tokenName,
    tokenData.tokenSymbol,
    token0,
    token1,
    amount
  );
  const tx = new Transaction();
  for (var i = 0; i < ixs.length; i++) {
    tx.add(ixs[i]);
  }
  return await processTransaction(tx, connection, wallet, 'Burn LP token', {});
}

export async function getLiquidityPoolData(
  wallet: AnchorWallet | undefined,
  connection: Connection,
  tokenData: InitiazlizedTokenData,
): Promise<ResponseData> {
  if (!wallet) {
    return {
      success: false,
      message: 'Wallet not connected',
    }
  }
  let token0 = new PublicKey(tokenData.mint);
  let token1 = NATIVE_MINT;
  let mintIsToken0 = true;
  if (compareMints(token0, token1) > 0) {
    [token0, token1] = [token1, token0];
    mintIsToken0 = false;
  }
  const program = getProgram(wallet as AnchorWallet, connection);
  const data = await getPoolData(
    program,
    token0,
    token1
  );
  if (!data.poolAddress || !data.cpSwapPoolState) {
    return {
      success: false,
      message: 'Pool has not been created yet',
    }
  }
  return {
    success: true,
    data: {
      mintIsToken0,
      ...data,
    }
  };
}

export const getBlockTimestampBySlot = async (rpc: string, slot: number) => {
  try {
    const response = await axios.post(rpc, {
      jsonrpc: '2.0',
      id: 1,
      method: 'getBlockTime',
      params: [slot],
    });

    if (response.data.error) {
      throw new Error(`Failed to get block: ${JSON.stringify(response.data.error)}`);
    }

    return response.data.result;
  } catch (error) {
    console.error('Error fetching block:', error);
    throw error;
  }
}

export const getCurrentSlopInterval = async (rpc: string, startSlot: number, endSlot: number) => {
  startSlot = startSlot < 0 ? 0 : startSlot;
  const startSlotTimestamp = await getBlockTimestampBySlot(rpc, startSlot);
  const endSlotTimestamp = await getBlockTimestampBySlot(rpc, endSlot);
  return (endSlotTimestamp - startSlotTimestamp) / (endSlot - startSlot);
}

export const getTargetTimestampAfterEpoches = async (
  connection: Connection,
  rpc: string,
  epoches: number,
  slotsOfEstimatingInterval: number = 250
): Promise<TargetTimestampData> => {
  const startTimestamp = Math.floor((new Date()).getTime() / 1000);
  const epochInfo = await connection.getEpochInfo();
  const currentEpoch = epochInfo.epoch;
  const secondsPerSlot = await getCurrentSlopInterval(rpc, epochInfo.absoluteSlot - slotsOfEstimatingInterval, epochInfo.absoluteSlot);
  const futureTimestamp = startTimestamp + ((currentEpoch + epoches) * epochInfo.slotsInEpoch - epochInfo.absoluteSlot) * secondsPerSlot;
  return {
    currentTimestamp: Math.floor((new Date()).getTime() / 1000),
    currentEpoch,
    slotIndex: epochInfo.slotIndex,
    absoluteSlot: epochInfo.absoluteSlot,
    slotsInEpoch: epochInfo.slotsInEpoch,
    futureTimestamp,
    wait: futureTimestamp - startTimestamp,
    secondsPerSlot,
  };
}

type Signature = {
  publicKey: BN,
  signature: Uint8Array,
}

export const signMessageWithWallet = async () => {
  const provider = window.solana;
  if (!provider) throw new Error('Wallet not found');
  await provider.connect();
  const message = WALLET_SIGN_MESSAGE;
  const encodedMessage = new TextEncoder().encode(message);
  const signature: Signature = await provider.signMessage(encodedMessage, 'utf8');
  const publicKey: string = provider.publicKey.toString();
  const signatureBase58: string = bs58.encode(signature.signature);
  return { publicKey, signatureBase58, message };
}


export const getWalletAddressFromToken = (token: string): string | null => {
  try {
    const decoded = jwt.decode(token) as { id: number; wallet_address: string } | null;
    return decoded?.wallet_address || null;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}
