import { FC, useEffect, useState } from 'react';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import toast from 'react-hot-toast';
import { InitiazlizedTokenData, RefundModalProps, RefundTokenData } from '../../types/types';
import { getRefundAccountData, getSystemConfig, refund } from '../../utils/web3';
import { ToastBox } from '../common/ToastBox';
import { NETWORK, SCANURL } from '../../config/constants';
import { formatPrice } from '../../utils/format';

export const RefundModal: FC<RefundModalProps> = ({
    isOpen,
    onClose,
    token,
}) => {
    const { connection } = useConnection();
    const wallet = useAnchorWallet();
    const [loading, setLoading] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const [protocolFeeAccount, setProtocolFeeAccount] = useState<PublicKey>(PublicKey.default);
    const [refundFeeRate, setRefundFeeRate] = useState(0);
    const [refundAccount, setRefundAccount] = useState<RefundTokenData>();

    const liquidityRatio = Number(token.tokenData?.liquidityTokensRatio) / 100;

    useEffect(() => {
        if (wallet) {
            getSystemConfig(wallet, connection).then((data) => {
                if (data?.success && data.data) {
                    setProtocolFeeAccount(data.data.protocolFeeAccount);
                    setRefundFeeRate(data.data.refundFeeRate);
                }
                else toast.error(data.message as string);
            });
            getRefundAccountData(wallet, connection, token.tokenData as InitiazlizedTokenData).then((data) => {
                if (data?.success) setRefundAccount(data.data);
                else toast.error(data.message as string);
            });
        }
    }, []);

    const handleRefund = async () => {
        if (!wallet) {
            toast.error('Please connect wallet');
            return;
        }

        if (!refundAccount) {
            toast.error('No refund data available');
            return;
        }

        if (refundAccount.totalTokens.isZero()) {
            toast.error('No tokens available for refund');
            return;
        }

        try {
            setLoading(true);
            const result = await refund(
                wallet, 
                connection, 
                token.tokenData as InitiazlizedTokenData, 
                protocolFeeAccount
            );

            if (result.success) {
                const explorerUrl = `${SCANURL}/tx/${result.data?.tx}?cluster=${NETWORK}`;
                toast.success(
                    <ToastBox 
                        title="Refund successful"
                        url={explorerUrl}
                        urlText="View transaction"
                    />,
                );
                onClose();
            } else {
                toast.error(result.message as string);
            }
        } catch (error) {
            console.error('Refund error:', error);
            toast.error('Refund failed');
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
                <h3 className="font-bold text-lg mb-4">Refund {token.tokenData?.tokenSymbol}</h3>
                <div className="space-y-4">
                    <div className="mt-4 space-y-2 bg-base-200 p-4 rounded-lg">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-base-content/70">Total paid</span>
                            <span className="font-medium text-primary">
                                {refundAccount ? 
                                    formatPrice(refundAccount.totalMintFee.toNumber() / LAMPORTS_PER_SOL, 3) : 
                                    '-'
                                } SOL
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-base-content/70">- Bonus to referrer</span>
                            <span className="font-medium">
                                {refundAccount ? 
                                    formatPrice(refundAccount.totalReferrerFee.toNumber() / LAMPORTS_PER_SOL, 3) : 
                                    '-'
                                } SOL
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-base-content/70">- Refund fee</span>
                            <span className="font-medium">
                                {refundAccount ? 
                                    formatPrice((refundAccount.totalMintFee.toNumber() * refundFeeRate) / LAMPORTS_PER_SOL, 3) : 
                                    '-'
                                } SOL
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-base-content/70">Token burned from your wallet</span>
                            <span className="font-medium text-error">
                                {refundAccount ? 
                                    formatPrice(refundAccount.totalTokens.toNumber() / LAMPORTS_PER_SOL, 3) : 
                                    '-'
                                } {token.tokenData?.tokenSymbol}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-base-content/70">Token burned from vault</span>
                            <span className="font-medium text-error">
                                {refundAccount ? 
                                    formatPrice(refundAccount.totalTokens.toNumber() / LAMPORTS_PER_SOL / (1 - liquidityRatio) * liquidityRatio, 3) : 
                                    '-'
                                } {token.tokenData?.tokenSymbol}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-base-content/70 font-bold">You get</span>
                            <span className="font-medium text-success font-bold">
                                {refundAccount ? 
                                    formatPrice(
                                        (refundAccount.totalMintFee.toNumber() - 
                                         refundAccount.totalReferrerFee.toNumber() - 
                                         (refundAccount.totalMintFee.toNumber() * refundFeeRate)) / LAMPORTS_PER_SOL, 
                                        3
                                    ) : 
                                    '-'
                                } SOL
                            </span>
                        </div>
                    </div>




                    <div className="alert alert-warning">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        <div>
                            <h3 className="font-bold">Warning!</h3>
                            <div className="text-sm">
                                You are about to refund your {token.tokenData?.tokenSymbol} tokens. This action cannot be undone.
                            </div>
                        </div>
                    </div>

                    <div className="form-control">
                        <label className="label cursor-pointer justify-start gap-2">
                            <input 
                                type="checkbox" 
                                className="checkbox checkbox-warning" 
                                checked={confirmed}
                                onChange={(e) => setConfirmed(e.target.checked)}
                            />
                            <span className="label-text">I understand that this action is irreversible</span>
                        </label>
                    </div>

                    <div className="space-y-2">
                        <button
                            className={`btn btn-error w-full`}
                            onClick={handleRefund}
                        >
                            {loading ? 'Processing...' : 'Confirm Refund'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
