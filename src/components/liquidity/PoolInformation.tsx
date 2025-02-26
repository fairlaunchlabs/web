import { FC, useEffect, useState } from "react";
import { InitiazlizedTokenData, PoolData, ResponseData } from "../../types/types";
import { AddressDisplay } from "../common/AddressDisplay";
import { getLiquidityPoolData, getTokenBalance, getTokenBalanceByMintAndOwner } from "../../utils/web3";
import { PublicKey } from "@solana/web3.js";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import toast from "react-hot-toast";
import AlertBox from "../common/AlertBox";
import { DexStatusBar } from "./DexStatusBar";
import { formatPrice } from "../../utils/format";
import { BurnSystemVaultTokensModal } from "./BurnSystemVaultTokensModal";
import { U64_MAX } from "../../config/constants";

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
  isDexOpen: boolean;
  setIsDexOpen: (data: boolean) => void;
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
  setTotalLpToken,
  isDexOpen,
  setIsDexOpen,
}) => {
  const [poolAddress, setPoolAddress] = useState('');
  const [openTime, setOpenTime] = useState(0);
  const [mintTokenVaultBalance, setMintTokenVaultBalance] = useState(0);
  const [showBurnSystemVaultTokensModel, setShowBurnSystemVaultTokensModel] = useState(false);

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
        setOpenTime(poolData.cpSwapPoolState.openTime);
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
        // console.log("pool address", poolData.poolAddress);
        setPoolAddress(poolData.poolAddress)
        setTotalLpToken(poolData.cpSwapPoolState.lpAmount)
        getTokenBalanceByMintAndOwner(new PublicKey(poolData.cpSwapPoolState.lpMint as string), new PublicKey(tokenData.configAccount), connection, true, TOKEN_PROGRAM_ID).then(balance => {
          setVaultLpTokenBalance(balance as number);
        })
        getTokenBalanceByMintAndOwner(new PublicKey(tokenData.mint), new PublicKey(tokenData.mint), connection, true, TOKEN_PROGRAM_ID).then(balance => {
          setMintTokenVaultBalance(balance as number);
        })
        // console.log("open time", poolData.cpSwapPoolState.openTime);
      } else {
        toast.error(res.message as string);
      }
    })
  }, [nonce]);

  return (
    <div>
      <div className="bg-base-200 md:p-6 p-3 rounded-lg mb-8">
        <h2 className="md:text-xl text-lg font-semibold mb-4">Pool Information</h2>
        <div className="grid md:gap-3 gap-2 md:text-md text-sm">
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
            <span>{formatPrice(tokenVaultBalance, 3)} {tokenData.tokenSymbol}</span>
          </div>
          <div className="flex justify-between">
            <span>Vault SOL Balance:</span>
            <span>{formatPrice(wsolVaultBalance, 3)} SOL</span>
          </div>

          {poolAddress !== "" && <div>
            <div className='grid gap-3'>
              <div className="flex justify-between">
                <span>Pool Address:</span>
                <span>{<AddressDisplay address={poolAddress} />}</span>
              </div>
              <div className="flex justify-between">
                <span>Pool Token Balance:</span>
                <span>{formatPrice(poolTokenBalance, 3)} {tokenData?.tokenSymbol}</span>
              </div>
              <div className="flex justify-between">
                <span>Pool SOL Balance:</span>
                <span>{formatPrice(poolSOLBalance, 3)} SOL</span>
              </div>
              <div className="flex justify-between">
                <span>Current Token Price:</span>
                <span>{formatPrice(currentPrice, 3)} SOL</span>
              </div>
              <div className="flex justify-between">
                <span>Total LP Token:</span>
                <span>{formatPrice(totalLpToken, 3)} LP-{tokenData.tokenSymbol}-SOL</span>
              </div>
              <div className="flex justify-between">
                <span>Vault LP Token:</span>
                <span>{formatPrice(vaultLpTokenBalance, 3)} LP-{tokenData.tokenSymbol}-SOL</span>
              </div>
            </div>
            <DexStatusBar openTime={openTime} isDexOpen={isDexOpen} setIsDexOpen={setIsDexOpen} />
          </div>}
        </div>
      </div>
      {parseInt(tokenData.graduateEpoch) < U64_MAX &&
        <div className="bg-base-200 md:p-6 p-3 rounded-lg mb-8">
          <div className="flex justify-between">
            <span>Tokens in System vault:</span>
            <span>{formatPrice(mintTokenVaultBalance, 3)} {tokenData?.tokenSymbol}</span>
          </div>
          <div className="flex justify-between">
            <span></span>
            <span>
              <button 
                className="btn btn-secondary btn-sm mt-2"
                onClick={() => setShowBurnSystemVaultTokensModel(true)}
              >
                Burn the system vault tokens
              </button>
            </span>
            <span>{tokenData.graduateEpoch}</span>
          </div>
        </div>}
      {/* {poolAddress === "" && 
      <div>
        <AlertBox title="Alert" message="Raydium pool has not created! Please create a pool first." />
        <div className="mt-5"><a href={`/create-liquidity-pool/${tokenData.mint}`} className="text-blue-500 underline">Create pool</a></div>
      </div>} */}
      {poolAddress !== "" && !isDexOpen &&
        <div>
          <AlertBox title="Alert" message={`Raydium pool has been created but not opened! Please wait until ${new Date(openTime * 1000).toLocaleString()}`} />
        </div>}
      {showBurnSystemVaultTokensModel && mintTokenVaultBalance > 0 &&
      <BurnSystemVaultTokensModal 
        token={tokenData} 
        isOpen={showBurnSystemVaultTokensModel} 
        onClose={() => setShowBurnSystemVaultTokensModel(false)} 
        totalBalance={mintTokenVaultBalance}
      />}
    </div>
  );
};