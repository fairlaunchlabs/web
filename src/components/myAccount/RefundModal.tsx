import { FC, useEffect, useState } from 'react';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import toast from 'react-hot-toast';
import { InitiazlizedTokenData, RefundModalProps, RefundTokenData } from '../../types/types';
import { getRefundAccountData, getSystemConfig, refund } from '../../utils/web3';
import { ToastBox } from '../common/ToastBox';
import { NETWORK, SCANURL } from '../../config/constants';
import { formatPrice } from '../../utils/format';
import AlertBox from '../common/AlertBox';

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
    const [refundAccountData, setRefundAccountData] = useState<RefundTokenData>();

    const liquidityRatio = Number(token.tokenData?.liquidityTokensRatio) / 100;
    
    useEffect(() => {
        if (wallet) {
            getSystemConfig(wallet, connection).then((data) => {
                if (data?.success && data.data) {
                    // console.log("protocol fee account", data.data.protocolFeeAccount.toBase58());
                    setProtocolFeeAccount(data.data.systemConfigData.protocolFeeAccount);
                    setRefundFeeRate(data.data.systemConfigData.refundFeeRate);
                }
                else toast.error(data.message as string);
            });
            getRefundAccountData(wallet, connection, token.tokenData as InitiazlizedTokenData).then((data) => {
                if (data?.success) setRefundAccountData(data.data);
                else toast.error(data.message as string);
            });
        }
    }, []);

    const handleRefund = async () => {
        if (!wallet) {
            toast.error('Please connect wallet');
            return;
        }

        if (!refundAccountData) {
            toast.error('No refund data available');
            return;
        }

        if (refundAccountData.totalTokens.isZero()) {
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
                close();
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

    const close = () => {
        setLoading(false);
        setTimeout(() => {
            onClose();
        }, 3000);
    }

    if (!isOpen) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box relative">
                <button
                    className="btn btn-circle btn-sm absolute right-2 top-2"
                    onClick={onClose}
                >
                    <svg className='w-4 h-4' fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M5 5h2v2H5V5zm4 4H7V7h2v2zm2 2H9V9h2v2zm2 0h-2v2H9v2H7v2H5v2h2v-2h2v-2h2v-2h2v2h2v2h2v2h2v-2h-2v-2h-2v-2h-2v-2zm2-2v2h-2V9h2zm2-2v2h-2V7h2zm0 0V5h2v2h-2z" fill="currentColor"/> </svg>
                </button>
                <h3 className="font-bold text-lg mb-4">Refund {token.tokenData?.tokenSymbol}</h3>
                <div className="space-y-4">
                    <div className="pixel-box mt-4 space-y-2 bg-base-200 p-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-base-content/70">Total paid</span>
                            <span className="font-medium text-primary">
                                {refundAccountData ? 
                                    formatPrice(refundAccountData.totalMintFee.toNumber() / LAMPORTS_PER_SOL, 3) : 
                                    '-'
                                } SOL
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-base-content/70">- Bonus to referrer</span>
                            <span className="font-medium">
                                {refundAccountData ? 
                                    formatPrice(refundAccountData.totalReferrerFee.toNumber() / LAMPORTS_PER_SOL, 3) : 
                                    '-'
                                } SOL
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-base-content/70">- Refund fee ({refundFeeRate * 100}%)</span>
                            <span className="font-medium">
                                {refundAccountData ? 
                                    formatPrice((refundAccountData.totalMintFee.toNumber() * refundFeeRate) / LAMPORTS_PER_SOL, 3) : 
                                    '-'
                                } SOL
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-base-content/70">Token burned from your wallet</span>
                            <span className="font-medium text-error">
                                {refundAccountData ? 
                                    formatPrice(refundAccountData.totalTokens.toNumber() / LAMPORTS_PER_SOL, 3) : 
                                    '-'
                                } {token.tokenData?.tokenSymbol}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-base-content/70">Token burned from vault</span>
                            <span className="font-medium text-error">
                                {refundAccountData ? 
                                    formatPrice(refundAccountData.totalTokens.toNumber() / LAMPORTS_PER_SOL / (1 - liquidityRatio) * liquidityRatio, 3) : 
                                    '-'
                                } {token.tokenData?.tokenSymbol}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-base-content/70 font-bold">You get</span>
                            <span className="font-medium text-success font-bold">
                                {refundAccountData ? 
                                    formatPrice(
                                        (refundAccountData.totalMintFee.toNumber() - 
                                        refundAccountData.totalReferrerFee.toNumber() - 
                                         (refundAccountData.totalMintFee.toNumber() * refundFeeRate)) / LAMPORTS_PER_SOL, 
                                        3
                                    ) : 
                                    '-'
                                } SOL
                            </span>
                        </div>
                    </div>

                    <AlertBox 
                        title="Warning!"
                        message={`You are about to refund your ${token.tokenData?.tokenSymbol} tokens. This action cannot be undone.`}
                    />

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
                            disabled={!confirmed || !refundAccountData}
                        >
                            {loading ? 'Processing...' : 'Confirm Refund'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
