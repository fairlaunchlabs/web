import { FC, useState } from "react"
import { AddressDisplay } from "../common/AddressDisplay"
import toast from "react-hot-toast"
import { proxyAddLiquidity, proxyRemoveLiquidity } from "../../utils/web3"
import { BN } from "@coral-xyz/anchor"
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react"
import { ToastBox } from "../common/ToastBox"
import { NETWORK, SCANURL } from "../../config/constants"
import { InitiazlizedTokenData } from "../../types/types"
import { useDeviceType } from "../../utils/contexts"

export type LiquiditiesProps = {
  onDone: () => void;
  liquiditiesData: any;
  tokenData: InitiazlizedTokenData;
  currentPrice: number;
  tokenVaultBalance: number;
  wsolVaultBalance: number;
  poolTokenBalance: number;
  poolSOLBalance: number;
  vaultLpTokenBalance: number;
  totalLpToken: number;
}

export const Liquidities: FC<LiquiditiesProps> = ({
  onDone,
  liquiditiesData,
  tokenData,
  currentPrice,
  tokenVaultBalance,
  wsolVaultBalance,
  poolTokenBalance,
  poolSOLBalance,
  vaultLpTokenBalance,
  totalLpToken,
}) => {
  const [loading, setLoading] = useState(false);
  const [addLiquidityAmount, setAddLiquidityAmount] = useState('0');
  const [removeLiquidityRatio, setRemoveLiquidityRatio] = useState('0');
  const [removeLiquidityAmount, setRemoveLiquidityAmount] = useState('0');
  const [addLiquidityAmount1, setAddLiquidityAmount1] = useState('0');
  const [removeLiquidityAmount1, setRemoveLiquidityAmount1] = useState('0');
  const [messageAddLiquidity, setMessageAddLiquidity] = useState('');
  const [messageRemoveLiquidity, setMessageRemoveLiquidity] = useState('');
  const { isMobile } = useDeviceType();
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  // Add Liquidity 操作处理
  const handleAddLiquidity = async () => {
    if (!tokenData) return;
    setLoading(true);
    const toastId = toast.loading('Add liquidity...', {
      style: {
        background: 'var(--fallback-b1,oklch(var(--b1)))',
        color: 'var(--fallback-bc,oklch(var(--bc)))',
      },
    });
    try {
      const amount = parseFloat(addLiquidityAmount);
      if (isNaN(amount) || amount <= 0) {
        toast.error('Please enter a valid amount');
        return;
      }

      const result = await proxyAddLiquidity(
        wallet,
        connection,
        tokenData,
        new BN(amount * 1e9), // Token amount
        new BN(amount * currentPrice * 1e9), // SOL amount
      );

      if (result.success) {
        toast.success(
          <ToastBox
            url={`${SCANURL}/tx/${result.data?.tx}?cluster=${NETWORK}`}
            urlText="View transaction"
            title="Add liquidity successfully!"
          />,
          {
            id: toastId,
          }
        );
        setAddLiquidityAmount('0');
        setAddLiquidityAmount1('0');
        onDone();
      } else {
        toast.error(result.message || 'Failed to add liquidity');
      }
    } catch (error) {
      console.error('Add liquidity error:', error);
      toast.error('Failed to add liquidity');
    } finally {
      setLoading(false);
    }
  };

  // Remove Liquidity 操作处理
  const handleRemoveLiquidity = async () => {
    if (!tokenData) return;
    setLoading(true);
    const toastId = toast.loading('Remove liquidity...', {
      style: {
        background: 'var(--fallback-b1,oklch(var(--b1)))',
        color: 'var(--fallback-bc,oklch(var(--bc)))',
      },
    });
    try {
      console.log(removeLiquidityAmount, removeLiquidityAmount1)
      const result = await proxyRemoveLiquidity(
        wallet,
        connection,
        tokenData,
        new BN(parseFloat(removeLiquidityAmount) * 1e9), // Token amount
        new BN(parseFloat(removeLiquidityAmount1) * 1e9), // SOL amount
      );

      if (result.success) {
        toast.success(
          <ToastBox
            url={`${SCANURL}/tx/${result.data?.tx}?cluster=${NETWORK}`}
            urlText="View transaction"
            title="Remove liquidity successfully!"
          />,
          {
            id: toastId,
          }
        );
        setRemoveLiquidityRatio('0');
        setRemoveLiquidityAmount1('0');
        onDone();
      } else {
        toast.error(result.message || 'Failed to remove liquidity');
      }
    } catch (error) {
      console.error('Remove liquidity error:', error);
      toast.error('Failed to remove liquidity');
    } finally {
      setLoading(false);
    }
  };

  const setRemoveLiquidityDataByRadio = (percent: number) => {
    setRemoveLiquidityRatio(percent.toString());
    if (percent === 0) {
      setRemoveLiquidityAmount1('0');
      setRemoveLiquidityAmount('0');
      setMessageRemoveLiquidity('');
    } else {
      const amount = poolTokenBalance * vaultLpTokenBalance / totalLpToken * percent / 100;
      const wsolNeeded = poolSOLBalance * vaultLpTokenBalance / totalLpToken * percent / 100;
      console.log(amount, wsolNeeded)
      if(amount > poolTokenBalance) {
        setMessageRemoveLiquidity("Exceed token in pool: " + poolTokenBalance.toFixed(4) + " " + tokenData.tokenSymbol);
      }
      else if(wsolNeeded > poolSOLBalance) {
        setMessageRemoveLiquidity("Exceed SOL in pool: " + poolSOLBalance.toFixed(4) + " SOL");
      }
      else {
        setMessageRemoveLiquidity('');
        setRemoveLiquidityAmount(amount.toFixed(4));
        setRemoveLiquidityAmount1(wsolNeeded.toFixed(4));
      }
    }

  }
  return (
    <div>
      <div className="grid md:grid-cols-1 gap-4">
        {/* Add liquidity */}
        <div className="">
          <div className="mb-2 ml-1 font-bold">Add liquidity</div>
          <input
            type="text"
            placeholder="quantity to add"
            className="input w-full"
            value={addLiquidityAmount}
            onChange={(e) => {
              setAddLiquidityAmount(e.target.value);
              const amount = parseFloat(e.target.value);
              if (isNaN(amount) || amount <= 0) {
                setAddLiquidityAmount1('0');
              } else {
                const wsolNeeded = amount * currentPrice;
                if(amount > tokenVaultBalance) setMessageAddLiquidity("Exceed token vault balance: " + tokenVaultBalance.toFixed(4) + " " + tokenData.tokenSymbol);
                else if(wsolNeeded > wsolVaultBalance) setMessageAddLiquidity("Exceed SOL vault balance: " + wsolVaultBalance.toFixed(4) + " SOL");
                else {
                  setMessageAddLiquidity('');
                  setAddLiquidityAmount1((amount * currentPrice).toFixed(4));
                }
              }
            }}
          />
          <div className="mt-2 ml-2 mb-2">
            <div>You will add around {addLiquidityAmount1} SOL</div>
            <div className='text-error text-sm'>{messageAddLiquidity}</div>
          </div>
          <button
            className="btn btn-success w-full"
            onClick={handleAddLiquidity}
            disabled={loading || !tokenData || messageAddLiquidity !== ''}
          >
            {loading ? 'Processing...' : 'Add Liquidity'}
          </button>
        </div>
        {/* Remove liquidity */}
        <div className="">
          <div className="mb-2 ml-1 font-bold">Remove liquidity</div>
          <div className="pixel-box w-full flex flex-col gap-2 bg-white p-2">
            <div className="flex justify-between text-sm">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={removeLiquidityRatio}
              onChange={(e) => {
                const percent = parseInt(e.target.value);
                setRemoveLiquidityDataByRadio(percent);
              }}
              className="progress w-full bg-gray"
            />
            <div className="flex justify-between items-center">
              <div>Lp percentage: {removeLiquidityRatio}%</div>
              <div className="flex gap-2 items-center">
                <button 
                  className="btn btn-xs" 
                  onClick={() => {
                    setRemoveLiquidityRatio('25');
                    setRemoveLiquidityDataByRadio(25);
                  }}
                >
                  25%
                </button>
                <button 
                  className="btn btn-xs" 
                  onClick={() => {
                    setRemoveLiquidityRatio('50');
                    setRemoveLiquidityDataByRadio(50);
                  }}
                >
                  50%
                </button>
                <button 
                  className="btn btn-xs" 
                  onClick={() => {
                    setRemoveLiquidityRatio('75');
                    setRemoveLiquidityDataByRadio(75);
                  }}
                >
                  75%
                </button>
                <button 
                  className="btn btn-xs" 
                  onClick={() => {
                    setRemoveLiquidityRatio('100');
                    setRemoveLiquidityDataByRadio(100);
                  }}
                >
                  MAX
                </button>
              </div>
            </div>
          </div>

          <div className="mt-2 ml-2 mb-2">
            <div>You will remove around {removeLiquidityAmount} {tokenData.tokenSymbol} and {removeLiquidityAmount1} SOL</div>
            <div className='text-error text-sm'>{messageRemoveLiquidity}</div>
          </div>
          <button
            className="btn btn-error w-full"
            onClick={handleRemoveLiquidity}
            disabled={loading || !tokenData || messageRemoveLiquidity !== ''}
          >
            {loading ? 'Processing...' : 'Remove Liquidity'}
          </button>
        </div>
      </div>
      {/* Table */}
      <div>
        {liquiditiesData.length > 0 && (
          <div className="overflow-x-auto mt-5">
            <table className="pixel-table w-full">
              <thead>
                <tr>
                  <th>Transaction</th>
                  {/* <th>Action</th> */}
                  {!isMobile && <th>Amount0</th>}
                  {!isMobile && <th>Amount1</th>}
                  <th>LP Amount</th>
                  {!isMobile && <th>Time</th>}
                </tr>
              </thead>
              <tbody>
                {liquiditiesData.map((liquidity: any) => (
                  <tr key={liquidity.id} className={liquidity.action === 'withdraw' ? 'text-error' : 'text-[#009866]'}>
                    <td><AddressDisplay address={liquidity.txId} type='tx' /></td>
                    {/* <td>{liquidity.action === 'withdraw' ? 'Remove' : 'Add'}</td> */}
                    {!isMobile && <td>{(liquidity.token0Amount / 1e9).toFixed(4)} {liquidity.tokenSymbol}</td>}
                    {!isMobile && <td>{(liquidity.token1Amount / 1e9).toFixed(4)} SOL</td>}
                    <td>{(liquidity.lpAmount / 1e9).toFixed(4)}</td>
                    {!isMobile && <td>{new Date(parseInt(liquidity.blockTimestamp) * 1000).toLocaleString()}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}