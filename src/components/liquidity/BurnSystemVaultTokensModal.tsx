import { FC, useState } from 'react';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import toast from 'react-hot-toast';
import { InitiazlizedTokenData } from '../../types/types';
import { NETWORK, SCANURL } from '../../config/constants';
import { ToastBox } from '../common/ToastBox';
import AlertBox from '../common/AlertBox';
import { ModalTopBar } from '../common/ModalTopBar';
import { formatPrice } from '../../utils/format';
import { BN } from '@coral-xyz/anchor';
import { burnTokensFromMintTokenVault } from '../../utils/web3';

type BurnSystemVaultTokensModalProps = {
  isOpen: boolean;
  onClose: () => void;
  token: InitiazlizedTokenData;
  totalBalance: number;
}
export const BurnSystemVaultTokensModal: FC<BurnSystemVaultTokensModalProps> = ({
  isOpen,
  onClose,
  token,
  totalBalance,
}) => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("0")

  if (!isOpen) return null;

  const handleBurn = async () => {
    const burnAmount = new BN(amount).mul(new BN(10**9));
    if (burnAmount.eq(new BN(0))) {
      toast.error('Wrong amount');
      return;
    }
    if (parseFloat(amount) > totalBalance) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      setLoading(true);
      const result = await burnTokensFromMintTokenVault(
        wallet,
        connection,
        token,
        burnAmount,
      );

      if (result.success) {
        const explorerUrl = `${SCANURL}/tx/${result.data?.tx}?cluster=${NETWORK}`;
        toast.success(
          <ToastBox
            title="Burn system vault tokens successful"
            url={explorerUrl}
            urlText="View transaction"
          />,
        );
        close();
      } else {
        toast.error(result.message as string);
      }
    } catch (error) {
      console.error('Burn error:', error);
      toast.error('Burn failed');
    } finally {
      setLoading(false);
    }
  }

  const close = () => {
    setLoading(false);
    setTimeout(() => {
      onClose();
    }, 3000);
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box pixel-box relative p-3">
        <ModalTopBar title="Burn system vault tokens" onClose={onClose} />
        <div className="max-h-[calc(100vh-12rem)] overflow-y-auto p-1">
          <div className="space-y-4">
              <div className="space-y-2">
                <p>Enter amount of tokens you want to burn from the system vault. (max: {formatPrice(totalBalance, 3)} {token.tokenSymbol})</p>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className='input w-full'
                  placeholder="Enter amount"
                />
                <AlertBox title="Attention" message="If you burn tokens from the system vault, it cannot be recovered, the max supply will deduced by the amount you burn!" />
                <button
                  className={`btn btn-primary w-full mt-3`}
                  onClick={handleBurn}
                  disabled={loading}
                >
                  {loading ? 'Burning...' : 'Burn'}
                </button>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};
