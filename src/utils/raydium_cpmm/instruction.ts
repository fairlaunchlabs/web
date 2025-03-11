import { Program, BN } from "@coral-xyz/anchor";
import { FairMintToken } from '../../types/fair_mint_token';
import {
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  ComputeBudgetProgram,
  LAMPORTS_PER_SOL,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import {
  getAuthAddress,
  getPoolAddress,
  getPoolLpMintAddress,
  getPoolVaultAddress,
  getOrcleAccountAddress,
} from "./pda";

import { ASSOCIATED_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import { CpmmPoolInfoLayout } from "@raydium-io/raydium-sdk-v2";
import { compareMints, getTokenBalance } from "../web3";
import { CONFIG_DATA_SEED, cpSwapConfigAddress, cpSwapProgram, createPoolFeeReceive, memoProgram, MINT_SEED } from "../../config/constants";
import { CpSwapPoolStateData } from "../../types/types";

export async function getPoolData (
  program: Program<FairMintToken>,
  token0: PublicKey, // always mint of pom
  token1: PublicKey // always wsol
) {
  const [poolAddress] = getPoolAddress(
    cpSwapConfigAddress,
    token0,
    token1,
    cpSwapProgram
  );
  
  const accountInfo = await program.provider.connection.getAccountInfo(poolAddress);
  if (!accountInfo) {
    return {
      poolAddress: null,
      cpSwapPoolState: null
    };
  }
  const poolState = CpmmPoolInfoLayout.decode(accountInfo!.data);

  // compare token0 and token1
  let cpSwapPoolState: CpSwapPoolStateData = {
    openTime: poolState.openTime.toNumber(),
    ammConfig: poolState.configId.toBase58(),
    poolCreator: poolState.poolCreator.toBase58(),
    lpMint: poolState.mintLp.toBase58(),
    token0Vault: poolState.vaultA.toBase58(),
    token1Vault: poolState.vaultB.toBase58(),
    token0Mint: poolState.mintA.toBase58(),
    token0Program: poolState.mintProgramA.toBase58(),
    token1Mint: poolState.mintB.toBase58(),
    token1Program: poolState.mintProgramB.toBase58(),
    status: poolState.status as number,
    lpAmount: poolState.lpAmount.toNumber() / 10 ** 9,
    token0Amount: await getTokenBalance(poolState.vaultA, program.provider.connection),
    token1Amount: await getTokenBalance(poolState.vaultB, program.provider.connection),
  };  
  return { poolAddress: poolAddress.toBase58(), cpSwapPoolState };
}

export async function calculateDepositAmounts(
  program: Program<FairMintToken>,
  token0: PublicKey,
  token1: PublicKey,
  desiredToken0Amount: BN,
  desiredToken1Amount: BN,
  slippageTolerance: number = 0.05
) {
  const poolInfo = await getPoolData(program, token0, token1);
  if (!poolInfo.poolAddress || !poolInfo.cpSwapPoolState) throw new Error("Pool not found");

  // LP token
  const lpSupply = new BN(poolInfo.cpSwapPoolState.lpAmount as number * LAMPORTS_PER_SOL);
  const token0Reserve = new BN(poolInfo.cpSwapPoolState.token0Amount as number * LAMPORTS_PER_SOL);
  const token1Reserve = new BN(poolInfo.cpSwapPoolState.token1Amount as number * LAMPORTS_PER_SOL);

  const lpTokenAmount = BN.min(
      desiredToken0Amount.mul(lpSupply).div(token0Reserve),
      desiredToken1Amount.mul(lpSupply).div(token1Reserve)
  );

  const actualToken0Amount = lpTokenAmount.mul(token0Reserve).div(lpSupply);
  const actualToken1Amount = lpTokenAmount.mul(token1Reserve).div(lpSupply);

  const maxToken0Amount = actualToken0Amount.mul(new BN(100 + slippageTolerance * 100)).div(new BN(100));
  const maxToken1Amount = actualToken1Amount.mul(new BN(100 + slippageTolerance * 100)).div(new BN(100));

  return {
      lpTokenAmount,
      maxToken0Amount,
      maxToken1Amount,
      actualToken0Amount,
      actualToken1Amount
  };
}

export async function calculateWithdrawAmounts(
  program: Program<FairMintToken>,
  token0: PublicKey,
  token1: PublicKey,
  desiredToken0Amount: BN,
  desiredToken1Amount: BN,
  slippageTolerance: number = 0.05
) {
  const poolInfo = await getPoolData(program, token0, token1);
  if (!poolInfo.poolAddress || !poolInfo.cpSwapPoolState) throw new Error("Pool not found");

  const lpSupply = new BN(poolInfo.cpSwapPoolState.lpAmount as number * LAMPORTS_PER_SOL);
  const token0Reserve = new BN(poolInfo.cpSwapPoolState.token0Amount as number * LAMPORTS_PER_SOL);
  const token1Reserve = new BN(poolInfo.cpSwapPoolState.token1Amount as number * LAMPORTS_PER_SOL);

  const lpTokenAmount = BN.max(
      desiredToken0Amount.mul(lpSupply).div(token0Reserve),
      desiredToken1Amount.mul(lpSupply).div(token1Reserve)
  );

  const actualToken0Amount = lpTokenAmount.mul(token0Reserve).div(lpSupply);
  const actualToken1Amount = lpTokenAmount.mul(token1Reserve).div(lpSupply);

  const minToken0Amount = actualToken0Amount.mul(new BN(100 - slippageTolerance * 100)).div(new BN(100));
  const minToken1Amount = actualToken1Amount.mul(new BN(100 - slippageTolerance * 100)).div(new BN(100));

  return {
      lpTokenAmount,
      minToken0Amount,
      minToken1Amount,
      actualToken0Amount,
      actualToken1Amount
  };
}

// export async function poolInitializeInstructions(
//   program: Program<FairMintToken>,
//   creator: PublicKey,
//   tokenName: string,
//   tokenSymbol: string,
//   token0: PublicKey,
//   token0Program: PublicKey,
//   token1: PublicKey,
//   token1Program: PublicKey,
//   initAmount: { initAmount0: BN; initAmount1: BN } = {
//     initAmount0: new BN(10000000000),
//     initAmount1: new BN(20000000000),
//   },
//   createPoolFee = createPoolFeeReceive
// ): Promise<Array<TransactionInstruction>> {
//   const [auth] = getAuthAddress(cpSwapProgram);
//   const [poolAddress] = getPoolAddress(
//     cpSwapConfigAddress,
//     token0,
//     token1,
//     cpSwapProgram
//   );
//   const [lpMintAddress] = getPoolLpMintAddress(
//     poolAddress,
//     cpSwapProgram
//   );
//   const [vault0] = getPoolVaultAddress(
//     poolAddress,
//     token0,
//     cpSwapProgram
//   );
//   const [vault1] = getPoolVaultAddress(
//     poolAddress,
//     token1,
//     cpSwapProgram
//   );

//   const [creatorLpTokenAddress] = PublicKey.findProgramAddressSync( 
//     [
//       creator.toBuffer(),
//       TOKEN_PROGRAM_ID.toBuffer(),
//       lpMintAddress.toBuffer(),
//     ],
//     ASSOCIATED_PROGRAM_ID
//   );

//   const [observationAddress] = getOrcleAccountAddress(
//     poolAddress,
//     cpSwapProgram
//   );

//   const creatorToken0 = getAssociatedTokenAddressSync( 
//     token0,
//     creator,
//     false,
//     token0Program
//   );
//   const creatorToken1 = getAssociatedTokenAddressSync( 
//     token1,
//     creator,
//     false,
//     token1Program
//   );

//   const [mintAccount] = PublicKey.findProgramAddressSync(
//     [Buffer.from(MINT_SEED), Buffer.from(tokenName), Buffer.from(tokenSymbol.toLowerCase())],
//     program.programId,
//   );

//   const [configAccount] = PublicKey.findProgramAddressSync(
//     [Buffer.from(CONFIG_DATA_SEED), mintAccount.toBuffer()],
//     program.programId,
//   );
  
//   const contextProxyInitialize = {
//     cpSwapProgram: cpSwapProgram,
//     creator: creator,
//     mint: mintAccount,
//     configAccount,
//     ammConfig: cpSwapConfigAddress,
//     authority: auth,
//     poolState: poolAddress,
//     token0Mint: token0,
//     token1Mint: token1,
//     lpMint: lpMintAddress,
//     creatorToken0,
//     creatorToken1,
//     creatorLpToken: creatorLpTokenAddress,
//     token0Vault: vault0,
//     token1Vault: vault1,
//     createPoolFee,
//     observationState: observationAddress,
//     tokenProgram: TOKEN_PROGRAM_ID,
//     token0Program: token0Program,
//     token1Program: token1Program,
//     associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
//     systemProgram: SystemProgram.programId,
//     rent: SYSVAR_RENT_PUBKEY,
//   };

//   console.log("Initialize pool context", Object.fromEntries(
//     Object.entries(contextProxyInitialize).map(([key, value]) => [key, value.toString()])
//   ));

//   try {
//     const preIx = [
//       ComputeBudgetProgram.setComputeUnitLimit({ units: 400000 }),
//     ];
//     const ix = await program.methods
//       .proxyInitialize(
//         tokenName, tokenSymbol,
//         initAmount.initAmount0, initAmount.initAmount1, new BN(0))
//       .accounts(contextProxyInitialize)
//       .instruction();

//     return [...preIx, ix];
//   } catch (error) {
//     console.log(error);
//     return [];
//   }
// }

export async function poolDepositInstructions(
  program: Program<FairMintToken>,
  owner: PublicKey,
  tokenName: string,
  tokenSymbol: string,
  token0: PublicKey,
  token0Program: PublicKey,
  token1: PublicKey,
  token1Program: PublicKey,
  lp_token_amount: BN,
  maximum_token_0_amount: BN,
  maximum_token_1_amount: BN,
): Promise<Array<TransactionInstruction>> {
  const [auth] = getAuthAddress(cpSwapProgram);
  const [poolAddress] = getPoolAddress(
    cpSwapConfigAddress,
    token0,
    token1,
    cpSwapProgram
  );
  const [lpMintAddress] = getPoolLpMintAddress(
    poolAddress,
    cpSwapProgram
  );
  const [vault0] = getPoolVaultAddress(
    poolAddress,
    token0,
    cpSwapProgram
  );
  const [vault1] = getPoolVaultAddress(
    poolAddress,
    token1,
    cpSwapProgram
  );

  const [mintAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from(MINT_SEED), Buffer.from(tokenName), Buffer.from(tokenSymbol.toLowerCase())],
    program.programId,
  );

  const [configAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from(CONFIG_DATA_SEED), mintAccount.toBuffer()],
    program.programId,
  );

  const ownerLpToken = getAssociatedTokenAddressSync(
    lpMintAddress,
    configAccount,
    true,
    undefined,
    undefined
  )
  const ownerLpTokenInfo = await program.provider.connection.getAccountInfo(ownerLpToken);
  const instructionCreateOwnerLpToken = createAssociatedTokenAccountInstruction(
    owner,
    ownerLpToken,
    configAccount,
    lpMintAddress,
    undefined,
    undefined
  )

  const onwerToken0 = getAssociatedTokenAddressSync(
    token0,
    configAccount,
    true,
    token0Program
  );
  const onwerToken1 = getAssociatedTokenAddressSync(
    token1,
    configAccount,
    true,
    token1Program
  );

  console.log("token0 account", onwerToken0.toBase58());
  console.log("token1 account", onwerToken1.toBase58());

  const contextProxyDeposit = {
    cpSwapProgram: cpSwapProgram,
    owner: owner,
    mint: mintAccount,
    configAccount,
    authority: auth,
    poolState: poolAddress,
    ownerLpToken: ownerLpToken,
    token0Account: onwerToken0,
    token1Account: onwerToken1,
    token0Vault: vault0,
    token1Vault: vault1,
    tokenProgram: TOKEN_PROGRAM_ID,
    tokenProgram2022: TOKEN_2022_PROGRAM_ID,
    vault0Mint: token0,
    vault1Mint: token1,
    lpMint: lpMintAddress,
  };

  try {
    const preIx = [
      ComputeBudgetProgram.setComputeUnitLimit({ units: 400000 }),
    ];
    if (!ownerLpTokenInfo) preIx.push(instructionCreateOwnerLpToken);
    const ix = await program.methods
    .proxyDeposit(
      tokenName,
      tokenSymbol,
      lp_token_amount,
      maximum_token_0_amount,
      maximum_token_1_amount
    )
    .accounts(contextProxyDeposit)
    .instruction();
    return [...preIx, ix];
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function poolWithdrawInstructions(
  program: Program<FairMintToken>,
  owner: PublicKey,
  tokenName: string,
  tokenSymbol: string,
  token0: PublicKey,
  token0Program: PublicKey,
  token1: PublicKey,
  token1Program: PublicKey,
  lp_token_amount: BN,
  minimum_token_0_amount: BN,
  minimum_token_1_amount: BN,
): Promise<Array<TransactionInstruction>> {
  const [auth] = getAuthAddress(cpSwapProgram);
  const [poolAddress] = getPoolAddress(
    cpSwapConfigAddress,
    token0,
    token1,
    cpSwapProgram
  );

  const [lpMintAddress] = getPoolLpMintAddress(
    poolAddress,
    cpSwapProgram
  );
  const [vault0] = getPoolVaultAddress(
    poolAddress,
    token0,
    cpSwapProgram
  );
  const [vault1] = getPoolVaultAddress(
    poolAddress,
    token1,
    cpSwapProgram
  );

  const [mintAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from(MINT_SEED), Buffer.from(tokenName), Buffer.from(tokenSymbol.toLowerCase())],
    program.programId,
  );

  const [configAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from(CONFIG_DATA_SEED), mintAccount.toBuffer()],
    program.programId,
  );

  const [ownerLpToken] = PublicKey.findProgramAddressSync(
    [
      configAccount.toBuffer(), // owner.publicKey.toBuffer(), 
      TOKEN_PROGRAM_ID.toBuffer(),
      lpMintAddress.toBuffer(),
    ],
    ASSOCIATED_PROGRAM_ID
  );

  const onwerToken0 = getAssociatedTokenAddressSync(
    token0,
    configAccount, // owner.publicKey,
    true,
    token0Program
  );
  const onwerToken1 = getAssociatedTokenAddressSync(
    token1,
    configAccount, // owner.publicKey,
    true,
    token1Program
  );

  const contextProxyWithdraw = {
    cpSwapProgram: cpSwapProgram,
    owner: owner,
    mint: mintAccount,
    configAccount,
    authority: auth,
    poolState: poolAddress,
    ownerLpToken,
    token0Account: onwerToken0,
    token1Account: onwerToken1,
    token0Vault: vault0,
    token1Vault: vault1,
    tokenProgram: TOKEN_PROGRAM_ID,
    tokenProgram2022: TOKEN_2022_PROGRAM_ID,
    vault0Mint: token0,
    vault1Mint: token1,
    lpMint: lpMintAddress,
    memoProgram: memoProgram,
  };

  try {
    const preIx = [
      ComputeBudgetProgram.setComputeUnitLimit({ units: 400000 }),
    ];
    const ix = await program.methods
    .proxyWithdraw(
      tokenName,
      tokenSymbol,
      lp_token_amount,
      minimum_token_0_amount,
      minimum_token_1_amount
    )
    .accounts(contextProxyWithdraw)
    .instruction();
    return [...preIx, ix];
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function poolSwapBaseInInstructions(
  program: Program<FairMintToken>,
  owner: PublicKey,
  tokenName: string,
  tokenSymbol: string,
  inputToken: PublicKey,
  inputTokenProgram: PublicKey,
  outputToken: PublicKey,
  outputTokenProgram: PublicKey,
  amount_in: BN,
  minimum_amount_out: BN,
): Promise<Array<TransactionInstruction>> {
  const [auth] = getAuthAddress(cpSwapProgram);
  const [poolAddress] = getPoolAddress(
    cpSwapConfigAddress,
    outputToken, // WSOL
    inputToken, // spl token
    cpSwapProgram
  );

  const [inputVault] = getPoolVaultAddress(
    poolAddress,
    inputToken,
    cpSwapProgram
  );
  const [outputVault] = getPoolVaultAddress(
    poolAddress,
    outputToken,
    cpSwapProgram
  );

  const [mintAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from(MINT_SEED), Buffer.from(tokenName), Buffer.from(tokenSymbol.toLowerCase())],
    program.programId,
  );

  const [configAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from(CONFIG_DATA_SEED), mintAccount.toBuffer()],
    program.programId,
  );

  const inputTokenAccount = getAssociatedTokenAddressSync(
    inputToken,
    configAccount, // owner.publicKey,
    true,
    inputTokenProgram
  );
  const outputTokenAccount = getAssociatedTokenAddressSync(
    outputToken,
    configAccount, // owner.publicKey,
    true,
    outputTokenProgram
  );
  const [observationAddress] = getOrcleAccountAddress(
    poolAddress,
    cpSwapProgram
  );

  const contextProxySwapBaseInput = {
    cpSwapProgram: cpSwapProgram,
    payer: owner,
    mint: mintAccount,
    configAccount,
    authority: auth,
    ammConfig: cpSwapConfigAddress,
    poolState: poolAddress,
    inputTokenAccount,
    outputTokenAccount,
    inputVault,
    outputVault,
    inputTokenProgram: inputTokenProgram,
    outputTokenProgram: outputTokenProgram,
    inputTokenMint: inputToken,
    outputTokenMint: outputToken,
    observationState: observationAddress,
  };

  console.log("Context", Object.fromEntries(
    Object.entries(contextProxySwapBaseInput).map(([key, value]) => [key, value.toString()])
  ));

  try {
    const preIx = [
      ComputeBudgetProgram.setComputeUnitLimit({ units: 400000 }),
    ];
    const ix = await program.methods
      .proxySwapBaseIn(
        tokenName, tokenSymbol,
        amount_in, minimum_amount_out
      )
      .accounts(contextProxySwapBaseInput)
      .instruction()
    return [...preIx, ix];
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function poolSwapBaseOutInstructions(
  program: Program<FairMintToken>,
  owner: PublicKey,
  tokenName: string,
  tokenSymbol: string,
  outputToken: PublicKey,
  outputTokenProgram: PublicKey,
  inputToken: PublicKey,
  inputTokenProgram: PublicKey,
  amount_out: BN,
  max_amount_in: BN,
): Promise<Array<TransactionInstruction>> {
  const [auth] = getAuthAddress(cpSwapProgram);
  const [poolAddress] = getPoolAddress(
    cpSwapConfigAddress,
    inputToken, // WSOL
    outputToken, // spl token
    cpSwapProgram
  );

  const [inputVault] = getPoolVaultAddress(
    poolAddress,
    inputToken,
    cpSwapProgram
  );
  const [outputVault] = getPoolVaultAddress(
    poolAddress,
    outputToken,
    cpSwapProgram
  );

  const [mintAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from(MINT_SEED), Buffer.from(tokenName), Buffer.from(tokenSymbol.toLowerCase())],
    program.programId,
  );

  const [configAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from(CONFIG_DATA_SEED), mintAccount.toBuffer()],
    program.programId,
  );

  const inputTokenAccount = getAssociatedTokenAddressSync(
    inputToken,
    configAccount, // owner.publicKey,
    true,
    inputTokenProgram
  );
  const outputTokenAccount = getAssociatedTokenAddressSync(
    outputToken,
    configAccount, // owner.publicKey,
    true,
    outputTokenProgram
  );
  const [observationAddress] = getOrcleAccountAddress(
    poolAddress,
    cpSwapProgram
  );

  const contextProxySwapBaseOutput = {
    cpSwapProgram: cpSwapProgram,
    payer: owner,
    mint: mintAccount,
    configAccount,
    authority: auth,
    ammConfig: cpSwapConfigAddress,
    poolState: poolAddress,
    inputTokenAccount,
    outputTokenAccount,
    inputVault,
    outputVault,
    inputTokenProgram: inputTokenProgram,
    outputTokenProgram: outputTokenProgram,
    inputTokenMint: inputToken,
    outputTokenMint: outputToken,
    observationState: observationAddress,
  };

  // console.log("contextProxySwapBaseOutput", Object.fromEntries(
  //   Object.entries(contextProxySwapBaseOutput).map(([key, value]) => [key, value.toString()])
  // ));

  try {
    const preIx = [
      ComputeBudgetProgram.setComputeUnitLimit({ units: 400000 }),
    ];
    const ix = await program.methods
      .proxySwapBaseOut(
        tokenName, tokenSymbol,
        max_amount_in, amount_out
      )
      .accounts(contextProxySwapBaseOutput)
      .instruction();
    return [...preIx, ix];
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function poolBurnLpTokensInstructions(
  program: Program<FairMintToken>,
  admin: PublicKey,
  tokenName: string,
  tokenSymbol: string,
  token0: PublicKey,
  token1: PublicKey,
  lpAmount: BN,
): Promise<Array<TransactionInstruction>> {
  const [poolAddress] = getPoolAddress(
    cpSwapConfigAddress,
    token0,
    token1,
    cpSwapProgram
  );

  const [lpMintAddress] = getPoolLpMintAddress(
    poolAddress,
    cpSwapProgram
  );

  const [mintAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from(MINT_SEED), Buffer.from(tokenName), Buffer.from(tokenSymbol.toLowerCase())],
    program.programId,
  );

  const [configAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from(CONFIG_DATA_SEED), mintAccount.toBuffer()],
    program.programId,
  );

  const ownerLpToken = getAssociatedTokenAddressSync(
    lpMintAddress,
    configAccount,
    true,
    TOKEN_PROGRAM_ID
  );

  const lpTokenBalance = await getTokenBalance(ownerLpToken, program.provider.connection) as number;
  console.log("lp token balance before burn", lpTokenBalance);
  console.log("You want to burn", lpAmount.toNumber() / LAMPORTS_PER_SOL);
  if (lpAmount.toNumber() / LAMPORTS_PER_SOL > lpTokenBalance) {
    throw new Error(`Insufficient LP token balance. Required: ${lpAmount.toNumber() / LAMPORTS_PER_SOL}, Available: ${lpTokenBalance}`);
  }

  try {
    const context = {
      admin: admin,
      mint: mintAccount,
      configAccount,
      ownerLpToken,
      lpMint: lpMintAddress,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    };
    const ix = await program.methods
      .proxyBurnLpTokens(tokenName, tokenSymbol, lpAmount)
      .accounts(context)
      .instruction();
    return [ix];
  } catch (error) {
    console.log(error);
    return [];
  }
}

