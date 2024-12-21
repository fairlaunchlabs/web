import { FC, useEffect, useState } from 'react';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getMyReferrerData, getReferrerDataByReferralAccount, getSystemConfig, reactiveReferrerCode, setReferrerCode } from '../../utils/web3';
import toast from 'react-hot-toast';
import { ReferralCodeModalProps, ReferrerData } from '../../types/types';
import { LOCAL_STORAGE_MY_REFERRAL_CODE, NETWORK, SCANURL } from '../../config/constants';
import { ToastBox } from '../common/ToastBox';
import AlertBox from '../common/AlertBox';
import { ModalTopBar } from '../common/ModalTopBar';

export const ReferralCodeModal: FC<ReferralCodeModalProps> = ({
    isOpen,
    onClose,
    token,
}) => {
    const { connection } = useConnection();
    const wallet = useAnchorWallet();
    const [loading, setLoading] = useState(false);
    const [referralData, setReferralData] = useState<ReferrerData>();
    const [referrerResetIntervalSeconds, setReferrerResetIntervalSeconds] = useState(0);
    const [referralUsageMaxCount, setReferralUsageMaxCount] = useState(0);
    const [myReferrerCode, setMyReferrerCode] =  useState<string>(localStorage.getItem(LOCAL_STORAGE_MY_REFERRAL_CODE + "_" + token.mint + "_" + wallet?.publicKey.toBase58()) !== null ? localStorage.getItem(LOCAL_STORAGE_MY_REFERRAL_CODE + "_" + token.mint + "_" + wallet?.publicKey.toBase58()) as string : "");

    useEffect(() => {
        if (wallet) {
            if(myReferrerCode !== "" && myReferrerCode !== null) {
                getMyReferrerData(wallet, connection, new PublicKey(token.mint), myReferrerCode).then((data) => {
                    if (data?.success) setReferralData(data.data);
                    else toast.error(data.message as string);
                });    
            }
            getSystemConfig(wallet, connection).then((data) => {
                if (data?.success && data.data) {
                    setReferrerResetIntervalSeconds(data.data.systemConfigData.referrerResetIntervalSeconds.toNumber());
                    setReferralUsageMaxCount(data.data.systemConfigData.referralUsageMaxCount);
                }
                else toast.error(data.message as string);
            });
        }
    }, []);

    const handleReactiveCode = async () => {
        if(myReferrerCode === "" || myReferrerCode === null) {
            toast.error("Referrer code is empty");
            return;
        }
        // Check if the code contains only letters, numbers and underscore
        if (!/^[a-zA-Z0-9_]+$/.test(myReferrerCode)) {
            toast.error("Referrer code can only contain letters, numbers and underscore");
            return;
        }
        setLoading(true);
        try {
            const result = await reactiveReferrerCode(
                wallet,
                connection,
                token.tokenData?.tokenName as string,
                token.tokenData?.tokenSymbol as string,
                new PublicKey(token.mint),
                myReferrerCode,
            );
            if (!result.success) {
                throw new Error(result.message);
            }
            const explorerUrl = `${SCANURL}/tx/${result.data?.tx}?cluster=${NETWORK}`;
            toast.success(
                <ToastBox url={explorerUrl} urlText="View transaction" title="Got URC successfully!" />,
            );    

            const referralAccount = result.data?.referralAccount as string
            getReferrerDataByReferralAccount(wallet, connection, new PublicKey(referralAccount)).then((data) => {
                if (data?.success) setReferralData(data.data);
                else toast.error(data.message as string);
            });
            localStorage.setItem(LOCAL_STORAGE_MY_REFERRAL_CODE + "_" + token.mint + "_" + wallet?.publicKey.toBase58(), myReferrerCode);
        } catch (error: any) {
            toast.error(error.message || 'Failed to generate referral code');
        } finally {
            setLoading(false);
        }
    }

    const handleGetCode = async () => {
        if(myReferrerCode === "" || myReferrerCode === null) {
            toast.error("Referrer code is empty");
            return;
        }
        // Check if the code contains only letters, numbers and underscore
        if (!/^[a-zA-Z0-9_]+$/.test(myReferrerCode)) {
            toast.error("Referrer code can only contain letters, numbers and underscore");
            return;
        }
        setLoading(true);
        try {
            const result = await setReferrerCode(
                wallet,
                connection,
                token.tokenData?.tokenName as string,
                token.tokenData?.tokenSymbol as string,
                new PublicKey(token.mint),
                myReferrerCode,
            );
            if (!result.success) {
                throw new Error(result.message);
            }
            if(result.data?.tx === "mine") {
                // code is exists
            } else {
                const explorerUrl = `${SCANURL}/tx/${result.data?.tx}?cluster=${NETWORK}`;
                toast.success(
                    <ToastBox url={explorerUrl} urlText="View transaction" title="Got URC successfully!" />,
                );    
            }

            const referralAccount = result.data?.referralAccount as string
            getReferrerDataByReferralAccount(wallet, connection, new PublicKey(referralAccount)).then((data) => {
                if (data?.success) setReferralData(data.data);
                else toast.error(data.message as string);
            });
            localStorage.setItem(LOCAL_STORAGE_MY_REFERRAL_CODE + "_" + token.mint + "_" + wallet?.publicKey.toBase58(), myReferrerCode);
        } catch (error: any) {
            toast.error(error.message || 'Failed to generate referral code');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = async () => {
        const link = `${window.location.origin}/token/${token.tokenData?.mint}/${myReferrerCode}`;
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
            <div className="modal-box pixel-box relative p-3">
                <ModalTopBar title="My Referral Code" onClose={onClose} />
                <div className="max-h-[calc(100vh-12rem)] overflow-y-auto p-1">
                    <div className="space-y-4">
                        {referralData ? (
                            <div className="space-y-2">
                                <p className="">
                                    Here's your URC for {token.tokenData?.tokenSymbol}
                                </p>
                                <div className="flex justify-between items-center">
                                    <input
                                        type="text"
                                        value={myReferrerCode}
                                        onChange={(e) => setMyReferrerCode(e.target.value)}
                                        // className={`w-full px-3 py-2 bg-base-300 border-2 border-base-300 hover:border-2 hover:border-dashed rounded-lg hover:border-primary transition-colors focus:outline-none focus:border-primary focus:border-2 bg-base-100 ${myReferrerCode ? 'border-base-content' : ''}`}
                                        className='input w-full'
                                        placeholder="Enter your favourite name as URC"
                                    />
                                    <button
                                        className="btn btn-circle btn-sm btn-ghost ml-2"
                                        onClick={() => {
                                            navigator.clipboard.writeText(myReferrerCode);
                                            toast.success('URC copied to clipboard!');
                                        }}
                                        disabled={loading}
                                    >
                                        <svg className='w-4 h-4' fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M4 2h11v2H6v13H4V2zm4 4h12v16H8V6zm2 2v12h8V8h-8z" fill="currentColor"/> </svg>
                                    </button>
                                </div>
                                <AlertBox title="Attention" message="The URC code is stored locally, please remember it when you change device!" />

                                <p className="">Current used count (Max: {referralUsageMaxCount})</p>
                                <div className="pixel-box bg-base-200 p-2 break-all">
                                    {referralData.usageCount}
                                </div>
                                <p className="">Active URC time</p>
                                <div className="pixel-box bg-base-200 p-2 break-all">
                                    {new Date(Number(referralData.activeTimestamp) * 1000).toLocaleString()}
                                </div>
                                <p className="">Re-active URC time</p>
                                <div className="pixel-box bg-base-200 p-2 break-all">
                                    {new Date(Number(referralData.activeTimestamp) * 1000 + referrerResetIntervalSeconds * 1000).toLocaleString()}
                                </div>

                                {myReferrerCode && 
                                <div className="">
                                    <p className="mb-2">Your personal link</p>
                                    <div className="flex gap-2">
                                        <div className="pixel-box bg-base-200 p-2 break-all flex-1">
                                            {window.location.origin}/token/{token.tokenData?.mint}/{myReferrerCode}
                                        </div>
                                    </div>
                                </div>}
                                <button
                                    className="btn btn-primary w-full text-primary-content"
                                    onClick={handleCopyLink}
                                    disabled={loading}
                                >
                                    Copy the link and share to your friends
                                </button>

                                {(new Date()).getTime() - Number(referralData.activeTimestamp) * 1000 > referrerResetIntervalSeconds * 1000 && <div className="space-y-2">
                                    {/* <div className="divider"></div> */}
                                    <button
                                        className={`btn btn-secondary w-full mt-3`}
                                        onClick={handleReactiveCode}
                                        disabled={loading}
                                    >
                                        Reactive URC
                                    </button>
                                </div>}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <p>Enter your favourite name as a Unique Referral Code(URC) for {token.tokenData?.tokenSymbol}</p>
                                <input
                                    type="text"
                                    value={myReferrerCode}
                                    onChange={(e) => setMyReferrerCode(e.target.value)}
                                    // className={`w-full px-3 py-2 bg-base-300 border-2 border-base-300 hover:border-2 hover:border-dashed rounded-lg hover:border-primary transition-colors focus:outline-none focus:border-primary focus:border-2 bg-base-100 ${myReferrerCode ? 'border-base-content' : ''}`}
                                    className='input w-full'
                                    placeholder="Enter your favourite name as URC"
                                />
                                <p className='text-error'>This code is stored locally, please remember it when you change device!</p>
                                <button
                                    className={`btn btn-primary w-full mt-3`}
                                    onClick={handleGetCode}
                                    disabled={loading}
                                >
                                    {loading ? 'Getting URC...' : 'Get URC'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
