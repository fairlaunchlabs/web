import { FC, useEffect, useState } from 'react';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getMyReferrerData, getReferrerDataByReferralAccount, getSystemConfig, setReferrerCode } from '../../utils/web3';
import toast from 'react-hot-toast';
import { ReferralCodeModalProps, ReferrerData } from '../../types/types';
import { NETWORK, SCANURL } from '../../config/constants';
import { ToastBox } from '../common/ToastBox';

export const ReferralCodeModal: FC<ReferralCodeModalProps> = ({
    isOpen,
    onClose,
    token,
}) => {
    const { connection } = useConnection();
    const wallet = useAnchorWallet();
    const [loading, setLoading] = useState(false);
    const [referralData, setReferralData] = useState<ReferrerData>();
    const [renewCode, setRenewCode] = useState(false);
    const [referrerResetIntervalSeconds, setReferrerResetIntervalSeconds] = useState(0);
    const [referralUsageMaxCount, setReferralUsageMaxCount] = useState(0);

    useEffect(() => {
        if (wallet) {
            getMyReferrerData(wallet, connection, new PublicKey(token.mint)).then((data) => {
                if (data?.success) setReferralData(data.data);
                else toast.error(data.message as string);
            });
            getSystemConfig(wallet, connection).then((data) => {
                if (data?.success && data.data) {
                    setReferrerResetIntervalSeconds(data.data.referrerResetIntervalSeconds.toNumber());
                    setReferralUsageMaxCount(data.data.referralUsageMaxCount);
                }
                else toast.error(data.message as string);
            });
        }
    }, []);

    const handleGetCode = async () => {
        setLoading(true);
        try {
            const toastId = toast.loading('Geting URC...', {
                style: {
                    background: 'var(--fallback-b1,oklch(var(--b1)))',
                    color: 'var(--fallback-bc,oklch(var(--bc)))',
                },
            });
    
            const result = await setReferrerCode(
                wallet,
                connection,
                token.tokenData?.tokenName as string,
                token.tokenData?.tokenSymbol as string,
                new PublicKey(token.mint),
                renewCode
            );
            if (!result.success) {
                throw new Error(result.message);
            }
            const explorerUrl = `${SCANURL}/tx/${result.data?.tx}?cluster=${NETWORK}`;
            toast.success(
                <ToastBox url={explorerUrl} urlText="View transaction" title="Got URC successfully!" />,
                {
                    id: toastId
                }
            );


            const referralAccount = result.data?.referralAccount as string
            getReferrerDataByReferralAccount(wallet, connection, new PublicKey(referralAccount)).then((data) => {
                if (data?.success) setReferralData(data.data);
                else toast.error(data.message as string);
            });
        } catch (error: any) {
            toast.error(error.message || 'Failed to generate referral code');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = async () => {
        const link = `${window.location.origin}/token/${token.tokenData?.mint}/${referralData?.code.toString()}`;
        try {
            await navigator.clipboard.writeText(link);
            toast.success('Link copied to clipboard!');
        } catch (err) {
            toast.error('Failed to copy link');
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
                <h3 className="font-bold text-lg mb-4">Activate Unique Referral Code(URC)</h3>
                <div className="space-y-4">
                    {referralData ? (
                        <div className="space-y-2">
                            <p className="font-semibold">Your URC for {token.tokenData?.tokenSymbol}</p>
                            <div className="bg-base-200 p-2 rounded-lg break-all">
                                {referralData.code.toString()}
                            </div>
                            <p className="font-semibold">Current used count (Max: {referralUsageMaxCount})</p>
                            <div className="bg-base-200 p-2 rounded-lg break-all">
                                {referralData.usageCount}
                            </div>
                            <p className="font-semibold">Active URC time</p>
                            <div className="bg-base-200 p-2 rounded-lg break-all">
                                {new Date(Number(referralData.activeTimestamp) * 1000).toLocaleString()}
                            </div>
                            <p className="font-semibold">Re-active URC time</p>
                            <div className="bg-base-200 p-2 rounded-lg break-all">
                                {new Date(Number(referralData.activeTimestamp) * 1000 + referrerResetIntervalSeconds * 1000).toLocaleString()}
                            </div>
                            <p className="font-semibold">Your personal link</p>
                            <div className="flex gap-2">
                                <div className="bg-base-200 p-2 rounded-lg break-all flex-1">
                                    {window.location.origin}/token/{token.tokenData?.mint}/{referralData.code.toString()}
                                </div>
                            </div>
                            <button
                                className="btn btn-primary w-full text-primary-content"
                                onClick={handleCopyLink}
                                disabled={loading}
                            >
                                Copy the link and share to your friends
                            </button>

                            {(new Date()).getTime() - Number(referralData.activeTimestamp) * 1000 > referrerResetIntervalSeconds * 1000 && <div className="space-y-2">
                                <div className="divider"></div>
                                <div className="form-control">
                                    <label className="label cursor-pointer">
                                        <span className="label-text">Generate new code and invalidate the old one</span>
                                        <input 
                                            type="checkbox" 
                                            className="checkbox checkbox-primary" 
                                            checked={renewCode}
                                            onChange={(e) => setRenewCode(e.target.checked)}
                                        />
                                    </label>
                                </div>
                                <button
                                    className={`btn btn-outline btn-primary w-full`}
                                    onClick={handleGetCode}
                                    disabled={loading}
                                >
                                    Reactive URC
                                </button>
                            </div>}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <p>Generate a referral code for {token.tokenData?.tokenSymbol} token.</p>
                            <button
                                className={`btn btn-primary w-full`}
                                onClick={handleGetCode}
                            >
                                Generate URC
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <div className="modal-backdrop" onClick={onClose}>
                <button className="cursor-default">Close</button>
            </div>
        </div>
    );
};
