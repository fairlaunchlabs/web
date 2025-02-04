import { FC, useEffect, useState } from "react";
import { InitiazlizedTokenData, PoolData, ResponseData } from "../../types/types";
import { AddressDisplay } from "../common/AddressDisplay";
import { getLiquidityPoolData, getTokenBalance, getTokenBalanceByMintAndOwner } from "../../utils/web3";
import { PublicKey } from "@solana/web3.js";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import toast from "react-hot-toast";
import AlertBox from "../common/AlertBox";

type PoolInformationProps = {
  tokenData: InitiazlizedTokenData;
  currentPrice: number;
  setPoolData: (data: PoolData) => void;
  setCurrentPrice: (data: number) => void;
  nonce: number;
  tokenVaultBalance: number;
  setTokenVaultBalance: (data: number) => void;
  wsolVaultBalance: number;
  setWsolVaultBalance: (data: number) => void;
  poolTokenBalance: number;
  setPoolTokenBalance: (data: number) => void;
  poolSOLBalance: number;
  setPoolSOLBalance: (data: number) => void;
  vaultLpTokenBalance: number;
  setVaultLpTokenBalance: (data: number) => void;
  totalLpToken: number;
  setTotalLpToken: (data: number) => void;
}

export const PoolInformation: FC<PoolInformationProps> = ({
  tokenData,
  currentPrice,
  setPoolData,
  setCurrentPrice,
  nonce,
  tokenVaultBalance,
  setTokenVaultBalance,
  wsolVaultBalance,
  setWsolVaultBalance,
  poolTokenBalance,
  setPoolTokenBalance,
  poolSOLBalance,
  setPoolSOLBalance,
  vaultLpTokenBalance,
  setVaultLpTokenBalance,
  totalLpToken,
  setTotalLpToken
}) => {
  const [poolAddress, setPoolAddress] = useState('');

  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  useEffect(() => {
    console.log("load pool information...")
    getTokenBalance(new PublicKey(tokenData.tokenVault), connection).then(balance => {
      setTokenVaultBalance(balance as number);
    });

    getTokenBalance(new PublicKey(tokenData.wsolVault), connection).then(balance => {
      setWsolVaultBalance(balance as number);
    });

    getLiquidityPoolData(wallet, connection, tokenData).then((res: ResponseData) => {
      if (res.success) {
        const poolData = res.data as PoolData;
        setPoolData(poolData);
        const _poolTokenBalance = poolData.cpSwapPoolState.token0Amount as number;
        const _poolSOLBalance = poolData.cpSwapPoolState.token1Amount as number;
        if (poolData.mintIsToken0) {
          setPoolTokenBalance(_poolTokenBalance)
          setPoolSOLBalance(_poolSOLBalance)
          setCurrentPrice(_poolTokenBalance > 0 ? _poolSOLBalance / _poolTokenBalance : 0);
        } else {
          setPoolTokenBalance(_poolSOLBalance)
          setPoolSOLBalance(_poolTokenBalance)
          setCurrentPrice(_poolTokenBalance > 0 ? _poolTokenBalance / _poolSOLBalance : 0);
        }
        console.log("pool address", poolData.poolAddress);
        setPoolAddress(poolData.poolAddress)
        setTotalLpToken(poolData.cpSwapPoolState.lpAmount)
        getTokenBalanceByMintAndOwner(new PublicKey(poolData.cpSwapPoolState.lpMint as string), new PublicKey(tokenData.configAccount), connection, true, TOKEN_PROGRAM_ID).then(balance => {
          setVaultLpTokenBalance(balance as number);
        })
      } else {
        toast.error(res.message as string);
      }
    })
  }, [nonce]);

  return (
    <div>
      <div className="bg-base-200 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Pool Information</h2>
        <div className="grid gap-3">
          <div className="flex justify-between">
            <span>Token Name:</span>
            <span>{tokenData.tokenName}</span>
          </div>
          <div className="flex justify-between">
            <span>Token Symbol:</span>
            <span>{tokenData.tokenSymbol}</span>
          </div>

          <div className="flex justify-between">
            <span>Vault Token Balance:</span>
            <span>{tokenVaultBalance} {tokenData.tokenSymbol}</span>
          </div>
          <div className="flex justify-between">
            <span>Vault SOL Balance:</span>
            <span>{wsolVaultBalance} SOL</span>
          </div>

          {poolAddress !== "" &&
            <div className='grid gap-3'>
              <div className="flex justify-between">
                <span>Pool Address:</span>
                <span>{<AddressDisplay address={poolAddress} />}</span>
              </div>
              <div className="flex justify-between">
                <span>Pool Token Balance:</span>
                <span>{poolTokenBalance} {tokenData?.tokenSymbol}</span>
              </div>
              <div className="flex justify-between">
                <span>Pool SOL Balance:</span>
                <span>{poolSOLBalance} SOL</span>
              </div>
              <div className="flex justify-between">
                <span>Current Token Price:</span>
                <span>{currentPrice.toFixed(8)} SOL</span>
              </div>
              <div className="flex justify-between">
                <span>Total LP Token:</span>
                <span>{totalLpToken} LP-{tokenData.tokenSymbol}-SOL</span>
              </div>
              <div className="flex justify-between">
                <span>Vault LP Token:</span>
                <span>{vaultLpTokenBalance} LP-{tokenData.tokenSymbol}-SOL</span>
              </div>
            </div>}
        </div>
      </div>
      {poolAddress === "" && 
      <div>
        <AlertBox title="Alert" message="Raydium pool has not created! Please create a pool first." />
        <div className="mt-5"><a href={`/create-liquidity-pool/${tokenData.mint}`} className="text-blue-500 underline">Create pool</a></div>
      </div>}
      </div>
  );
};