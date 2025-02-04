import { FC, useState, useEffect } from "react"
import { AddressDisplay } from "../common/AddressDisplay"
import toast from "react-hot-toast"
import { proxySwapBaseIn, proxySwapBaseOut } from "../../utils/web3"
import { ToastBox } from "../common/ToastBox"
import { NETWORK, SCANURL } from "../../config/constants"
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react"
import { BN } from "@coral-xyz/anchor"
import { InitiazlizedTokenData } from "../../types/types"

const SLIPPAGE_KEY = 'trade_slippage';
const DEFAULT_SLIPPAGE = 0.5;
const MIN_SLIPPAGE = 0.1;
const MAX_SLIPPAGE = 100;

export type TradesProps = {
    tradesData: any[];
    onDone: () => void;
    tokenData: InitiazlizedTokenData;
    currentPrice: number;
    tokenVaultBalance: number;
    wsolVaultBalance: number;
    poolTokenBalance: number;
    poolSOLBalance: number;
  }

export const Trades: FC<TradesProps> = ({
    tradesData,
    onDone,
    tokenData,
    currentPrice,
    tokenVaultBalance,
    wsolVaultBalance,
    poolTokenBalance,
    poolSOLBalance,
  }) => {
  const [buyAmount, setBuyAmount] = useState('0')
  const [sellAmount, setSellAmount] = useState('0')
  const [loading, setLoading] = useState(false);
  const [buy1Amount, setBuy1Amount] = useState('0');
  const [sell1Amount, setSell1Amount] = useState('0');
  const [messageBuy, setMessageBuy] = useState('');
  const [messageSell, setMessageSell] = useState('');
  const [slippageValue, setSlippageValue] = useState(DEFAULT_SLIPPAGE);
  const [showSlippageSettings, setShowSlippageSettings] = useState(false);

  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  // 从localStorage加载slippage
  useEffect(() => {
    const savedSlippage = localStorage.getItem(SLIPPAGE_KEY);
    if (savedSlippage) {
      const value = parseFloat(savedSlippage);
      if (!isNaN(value) && value >= MIN_SLIPPAGE && value <= MAX_SLIPPAGE) {
        setSlippageValue(value);
      }
    }
  }, []);

  // 保存slippage到localStorage
  const handleSlippageChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= MIN_SLIPPAGE && numValue <= MAX_SLIPPAGE) {
      setSlippageValue(numValue);
      localStorage.setItem(SLIPPAGE_KEY, numValue.toString());
    }
  };

  const handleBuy = async () => {
    if (!tokenData) return;
    setLoading(true);
    const toastId = toast.loading('Buy tokens...', {
      style: {
          background: 'var(--fallback-b1,oklch(var(--b1)))',
          color: 'var(--fallback-bc,oklch(var(--bc)))',
      },
    });
    try {
      const amount = parseFloat(buyAmount);
      if (isNaN(amount) || amount <= 0) {
        toast.error('Please enter a valid amount');
        return;
      }

      const result = await proxySwapBaseOut(
        wallet,
        connection,
        tokenData,
        new BN(amount * 1e9 * currentPrice), // SOL amount
        new BN(amount * 1e9), // Token amount
        new BN(slippageValue * 100), // slippage
      );

      if (result.success) {
        toast.success(
          <ToastBox
              url={`${SCANURL}/tx/${result.data?.tx}?cluster=${NETWORK}`}
              urlText="View transaction"
              title="Buy tokens successfully!"
          />,
          {
              id: toastId,
          }
        );
        // setBuyAmount('');
        onDone();
      } else {
        toast.error(result.message || 'Buy failed');
      }
    } catch (error) {
      console.error('Buy error:', error);
      toast.error('Buy failed');
    } finally {
      setLoading(false);
    }
  };
  
    // Sell 操作处理
    const handleSell = async () => {
      if (!tokenData) return;
      setLoading(true);
      const toastId = toast.loading('Sell tokens...', {
        style: {
            background: 'var(--fallback-b1,oklch(var(--b1)))',
            color: 'var(--fallback-bc,oklch(var(--bc)))',
        },
      });
      try {
        const amount = parseFloat(sellAmount);
        if (isNaN(amount) || amount <= 0) {
          toast.error('Please enter a valid amount');
          return;
        }
  
        const result = await proxySwapBaseIn(
          wallet,
          connection,
          tokenData,
          new BN(amount * 1e9), // Token amount
          new BN(amount * currentPrice * 1e9), // SOL amount
          new BN(slippageValue * 100), // slippage
        );
  
        if (result.success) {
          toast.success(
            <ToastBox
                url={`${SCANURL}/tx/${result.data?.tx}?cluster=${NETWORK}`}
                urlText="View transaction"
                title="Sell tokens successfully!"
            />,
            {
                id: toastId,
            }
          );
          // setSellAmount('');
          onDone();
        } else {
          toast.error(result.message || 'Sell failed');
        }
      } catch (error) {
        console.error('Sell error:', error);
        toast.error('Sell failed');
      } finally {
        setLoading(false);
      }
    };
  
  return (
    <div>
      {/* Slippage Settings */}
      <div className="mb-4 justify-end">
        <div className="flex items-center gap-2">
          <span>Slippage: {slippageValue}%</span>
          <button
            className="btn btn-ghost btn-xs"
            onClick={() => setShowSlippageSettings(!showSlippageSettings)}
          >
            Setup
          </button>
        </div>

        {showSlippageSettings && (
          <div className="mt-2 bg-base-200 rounded-lg">
            <div className="flex items-center gap-2">
              <input
                type="number"
                className="input input-bordered w-24"
                value={slippageValue}
                onChange={(e) => handleSlippageChange(e.target.value)}
                min={MIN_SLIPPAGE}
                max={MAX_SLIPPAGE}
                step="0.1"
              />
              <span>%</span>
            </div>
            <div className="mt-2 text-sm">
              <p>Min: {MIN_SLIPPAGE}% | Max: {MAX_SLIPPAGE}%</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Buy tokens */}
        <div className="">
          <input
            type="text"
            placeholder="quantity to buy"
            className="input w-full"
            value={buyAmount}
            onChange={(e) => {
              setBuyAmount(e.target.value);
              const amount = parseFloat(e.target.value);
              if (isNaN(amount) || amount <= 0) {
                setBuy1Amount('0');
              } else {
                const wsolNeeded = amount * currentPrice;
                if(amount > poolTokenBalance) setMessageBuy("Exceed tokens in pool: " + poolTokenBalance.toFixed(4) + " " + tokenData?.tokenSymbol);
                else if(wsolNeeded > wsolVaultBalance) setMessageBuy("Exceed SOL vault balance: " + wsolVaultBalance.toFixed(4) + " SOL");
                else {
                  setMessageBuy('');
                  setBuy1Amount((amount * currentPrice).toFixed(4));
                }
              }
            }}
          />
          <div className="mt-2 ml-2 mb-2">
            <div>You will pay around {buy1Amount} SOL</div>
            <div className='text-error text-sm'>{messageBuy}</div>
          </div>
          <button
            className="btn btn-success w-full"
            onClick={handleBuy}
            disabled={loading || !tokenData || messageBuy !== ''}
          >
            {loading ? 'Processing...' : `BUY ${tokenData?.tokenSymbol}`}
          </button>
        </div>
        {/* Sell tokens */}
        <div className="">
          <input
            type="text"
            placeholder="quantity to sell"
            className="input w-full"
            value={sellAmount}
            onChange={(e) => {
              setSellAmount(e.target.value); 
              const amount = parseFloat(e.target.value);
              if (isNaN(amount) || amount <= 0) {
                setSell1Amount('0');
              } else {
                const wsolGet = amount * currentPrice;
                if(wsolGet > poolSOLBalance) setMessageSell("Exceed SOL in pool: " + poolSOLBalance.toFixed(4) + " SOL");
                else if(amount > tokenVaultBalance) setMessageSell("Exceed token vault balance: " + tokenVaultBalance.toFixed(4) + " " + tokenData?.tokenSymbol);
                else {
                  setMessageSell('');
                  setSell1Amount((amount * currentPrice).toFixed(4));
                }
              }
            }}
          />
          <div className="mt-2 ml-2 mb-2">
            <div>You will get around {sell1Amount} SOL</div>
            <div className='text-error text-sm'>{messageSell}</div>
          </div>
          <button
            className="btn btn-error w-full"
            onClick={handleSell}
            disabled={loading || !tokenData || messageSell !== ''}
          >
            {loading ? 'Processing...' : `SELL ${tokenData?.tokenSymbol}`}
          </button>
        </div>
      </div>
      {tradesData.length > 0 && (
        <div className="overflow-x-auto mt-5">
          <table className="pixel-table w-full">
            <thead>
              <tr>
                <th>Transaction</th>
                <th>Action</th>
                <th>Token Amount</th>
                <th>SOL Amount</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {tradesData.map((trade: any) => (
                <tr key={trade.id} className={trade.action === 'in' ? 'text-error' : 'text-[#009866]'}>
                  <td><AddressDisplay address={trade.txId} type='tx' /></td>
                  <td>{trade.action === 'in' ? 'Sell' : 'Buy'}</td>
                  <td>{(trade.baseAmount / 1e9).toFixed(4)} {trade.tokenSymbol}</td>
                  <td>{(trade.priceAmount / 1e9).toFixed(4)} SOL</td>
                  <td>{new Date(parseInt(trade.blockTimestamp) * 1000).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  )
}