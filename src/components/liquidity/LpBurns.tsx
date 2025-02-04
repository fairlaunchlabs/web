import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { FC, useState } from "react"
import { InitiazlizedTokenData } from "../../types/types";
import { AddressDisplay } from "../common/AddressDisplay";
import toast from "react-hot-toast";
import { proxyBurnLpToken } from "../../utils/web3";
import { BN } from "@coral-xyz/anchor";
import { ToastBox } from "../common/ToastBox";
import { NETWORK, SCANURL } from "../../config/constants";

export type LpBurnsProps = {
  tokenData: InitiazlizedTokenData;
  onDone: () => void;
  lpBurnData: any[];
  vaultLpTokenBalance: number;
}

export const LpBurns: FC<LpBurnsProps> = ({
  tokenData,
  onDone,
  lpBurnData,
  vaultLpTokenBalance,
}) => {
  const [burnLpAmount, setBurnLpAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [messageBurnLp, setMessageBurnLp] = useState('');

  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  // Burn LP Token 操作处理
  const handleBurnLpToken = async () => {
    if (!tokenData) return;
    setLoading(true);
    const toastId = toast.loading('Burn liquidity tokens...', {
      style: {
        background: 'var(--fallback-b1,oklch(var(--b1)))',
        color: 'var(--fallback-bc,oklch(var(--bc)))',
      },
    });
    try {
      const amount = parseFloat(burnLpAmount);
      if (isNaN(amount) || amount <= 0) {
        toast.error('Please enter a valid amount');
        return;
      }

      const result = await proxyBurnLpToken(
        wallet,
        connection,
        tokenData,
        new BN(amount * 1e9),
      );

      if (result.success) {
        toast.success(
          <ToastBox
            url={`${SCANURL}/tx/${result.data?.tx}?cluster=${NETWORK}`}
            urlText="View transaction"
            title="Burn liquidity tokens successfully!"
          />,
          {
            id: toastId,
          }
        );
        setBurnLpAmount('');
        onDone();
      } else {
        toast.error(result.message || 'Failed to burn LP tokens');
      }
    } catch (error) {
      console.error('Burn LP token error:', error);
      toast.error('Failed to burn LP tokens');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="w-full mx-auto">
        <input
          type="text"
          placeholder="quantity of LP tokens to burn"
          className="input input-bordered w-full"
          value={burnLpAmount}
          onChange={(e) => {
            setBurnLpAmount(e.target.value);
            const amount = parseFloat(e.target.value);
            if(amount > vaultLpTokenBalance) setMessageBurnLp('Insufficient LP token balance, max: ' + vaultLpTokenBalance.toFixed(4));
            else {
              setMessageBurnLp('');
            }
          }}
        />
        <div className="mt-2 ml-2 mb-2">
          <div>You will burn {burnLpAmount} LP tokens</div>
          <div className="text-error text-sm">{messageBurnLp}</div>
        </div>

        <button
          className="btn btn-success w-full"
          onClick={handleBurnLpToken}
          disabled={loading || !tokenData || messageBurnLp !== ''}
        >
          {loading ? 'Processing...' : 'Burn LP Token'}
        </button>
      </div>
      <div>
        {/* ====== history burn lp ====== */}
        {lpBurnData.length > 0 && (
          <div className="overflow-x-auto mt-5">
            <table className="pixel-table w-full">
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>LP Amount</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {lpBurnData.map((burn: any) => (
                  <tr key={burn.id}>
                    <td><AddressDisplay address={burn.txId} type="tx" /></td>
                    <td>{(burn.lpAmount / 1e9).toFixed(4)} LP</td>
                    <td>{new Date(parseInt(burn.blockTimestamp) * 1000).toLocaleString()}</td>
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