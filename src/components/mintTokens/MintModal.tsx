import { FC, useState } from 'react';
import { useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import { useLazyQuery } from '@apollo/client';
import { BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { InitiazlizedTokenData } from '../../types/types';
import { mintToken } from '../../utils/web3';
import toast from 'react-hot-toast';
import { NETWORK, SCANURL } from '../../config/constants';
import { ToastBox } from '../common/ToastBox';
import { querySetRefererCodeEntityById } from '../../utils/graphql';

interface MintModalProps {
    isOpen: boolean;
    onClose: () => void;
    token: InitiazlizedTokenData;
}

const MintModal: FC<MintModalProps> = ({ isOpen, onClose, token }) => {
    const { connection } = useConnection();
    const wallet = useAnchorWallet();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);

    const [getRefererCode] = useLazyQuery(querySetRefererCodeEntityById);

    const fetchReferralData = async () => {
        try {
            const { data } = await getRefererCode({
                variables: {
                    id: code,
                },
            });

            if (data?.setRefererCodeEntity) {
                if (data.setRefererCodeEntity.mint !== token.mint) {
                    throw new Error('Referral code not for this token');
                }
                return {
                    referralAccount: new PublicKey(data.setRefererCodeEntity.referralAccount),
                    referrerMain: new PublicKey(data.setRefererCodeEntity.referrerMain),
                    referrerAta: new PublicKey(data.setRefererCodeEntity.referrerAta),
                };
            } else {
                throw new Error('Referral code not found');
            }
        } catch (error: any) {
            console.error('Error fetching referral data:', error);
            throw new Error(error.message || 'Error fetching referral data');
        }
    };
    
    const handleMint = async () => {
        if (!wallet) {
            toast.error('Please connect wallet');
            return;
        }

        if (!code || code === '') {
            toast.error('Please enter a valid code');
            return;
        }

        try {
            setLoading(true);
            const referralData = await fetchReferralData();
            const toastId = toast.loading('Minting token...', {
                style: {
                    background: 'var(--fallback-b1,oklch(var(--b1)))',
                    color: 'var(--fallback-bc,oklch(var(--bc)))',
                },
            });
            const result = await mintToken(
                wallet,
                connection,
                token,
                referralData.referralAccount,
                referralData.referrerMain,
                referralData.referrerAta,
                new BN(code)
            );

            if (result.success) {
                toast.success(
                    <ToastBox
                        url={`${SCANURL}/tx/${result.data?.tx}?cluster=${NETWORK}`}
                        urlText="View transaction"
                        title="Token minted successfully!"
                    />,
                    {
                        id: toastId,
                    }
                );
                onClose();
            } else {
                toast.error(result.message as string);
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box relative">
                <button
                    className="btn btn-circle btn-sm absolute right-2 top-2"
                    onClick={onClose}
                >
                    ✕
                </button>
                <h3 className="font-bold text-lg mb-4">Mint {token.tokenSymbol}</h3>
                <div className="space-y-4">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Unique Referral Code(URC)</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Enter referral code"
                            className="input input-bordered w-full"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <button 
                            className={`btn btn-primary w-full`}
                            onClick={handleMint}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Mint'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MintModal;
