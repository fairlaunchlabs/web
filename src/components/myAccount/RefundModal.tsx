import { FC, useEffect, useState } from 'react';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import toast from 'react-hot-toast';
import { InitiazlizedTokenData, RefundModalProps, RefundTokenData } from '../../types/types';
import { getRefundAccountData, getSystemConfig, getTokenBalanceByMintAndOwner, refund } from '../../utils/web3';
import { ToastBox } from '../common/ToastBox';
import { NETWORK, SCANURL } from '../../config/constants';
import { formatPrice } from '../../utils/format';
import AlertBox from '../common/AlertBox';
import { ModalTopBar } from '../common/ModalTopBar';

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
    const [tokenBalance, setTokenBalance] = useState(0);

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
            getTokenBalanceByMintAndOwner(new PublicKey(token.mint), wallet.publicKey, connection).then((data) => {
                setTokenBalance(data as number);
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
            <div className="modal-box pixel-box relative p-3">
                <ModalTopBar title={`Refund ${token.tokenData?.tokenSymbol}`} onClose={onClose} />
                <div className="max-h-[calc(100vh-12rem)] overflow-y-auto p-1">
                    <div className="space-y-4">
                        <div className="pixel-box mt-4 space-y-2 bg-base-200 p-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-base-content/70">Total paid</span>
                                <span className="font-medium">
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
                                <span className="text-base-content/70">Total tokens you minted</span>
                                <span className="font-medium text-error">
                                    {refundAccountData ? 
                                        formatPrice(refundAccountData.totalTokens.toNumber() / LAMPORTS_PER_SOL, 3) : 
                                        '-'
                                    } {token.tokenData?.tokenSymbol}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-base-content/70">Token balance in wallet</span>
                                <span className="font-medium text-error">
                                    {formatPrice(tokenBalance, 3)} {token.tokenData?.tokenSymbol}
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

                        {refundAccountData && tokenBalance == refundAccountData?.totalTokens.toNumber() / LAMPORTS_PER_SOL ? (
                            <div className="flex flex-col gap-2">
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
                        ) : (
                            <AlertBox 
                                title="Warning!"
                                message={`You balance is not equal to the total tokens you minted. This action cannot be undone.`}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
