import { FC, useState, useEffect } from 'react';
import { useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { InitiazlizedTokenData, ReferralData } from '../../types/types';
import { getReferralDataByCodeHash, getReferrerCodeHash, getTokenBalance, mintToken } from '../../utils/web3';
import toast from 'react-hot-toast';
import { NETWORK, SCANURL } from '../../config/constants';
import { ToastBox } from '../common/ToastBox';
import { BN_LAMPORTS_PER_SOL, formatPrice, getFeeValue, numberStringToBN } from '../../utils/format';
import { AddressDisplay } from '../common/AddressDisplay';

interface MintModalProps {
    isOpen: boolean;
    onClose: () => void;
    token: InitiazlizedTokenData;
    referrerCode: string | undefined;
}

const MintModal: FC<MintModalProps> = ({ isOpen, onClose, token, referrerCode }) => {
    const { connection } = useConnection();
    const wallet = useAnchorWallet();
    const [code, setCode] = useState(referrerCode || '');
    const [loading, setLoading] = useState(false);
    const [referralData, setReferralData] = useState<ReferralData>();
    const [isValidCode, setIsValidCode] = useState(false);

    const fetchReferralData = async (inputCode: string) => {
        if (!wallet || !inputCode) {
            setIsValidCode(false);
            return;
        }

        try {
            const codeHash = getReferrerCodeHash(wallet, connection, inputCode);
            if (!codeHash.success) {
                setIsValidCode(false);
                throw new Error(codeHash.message);
            }
            const result = await getReferralDataByCodeHash(wallet, connection, codeHash.data as PublicKey);
            if (!result.success) {
                setIsValidCode(false);
                throw new Error(result.message);
            }
            if(result.data === null || result.data === undefined) {
                setIsValidCode(false);
                setReferralData(undefined);
                return;
            }
            const ataBalance = await getTokenBalance(result.data.referrerAta, connection) as number;

            console.log(
                numberStringToBN(token.feeRate),
                parseFloat(token.difficultyCoefficientEpoch),
                numberStringToBN(ataBalance.toString()).mul(BN_LAMPORTS_PER_SOL),
                numberStringToBN(token.supply),
            )
            console.log("===1===");
            const [acturalPay, urcProviderBonus] = getFeeValue(
                numberStringToBN(token.feeRate),
                parseFloat(token.difficultyCoefficientEpoch),
                numberStringToBN(ataBalance.toString()).mul(BN_LAMPORTS_PER_SOL),
                numberStringToBN(token.supply),
            )
            console.log("===2===");
            setReferralData({
                ...result.data,
                tokenBalance: ataBalance,
                acturalPay: acturalPay,
                urcProviderBonus: urcProviderBonus,
            });
            setIsValidCode(true);
        } catch (error: any) {
            console.error('Error fetching referral data:', error);
            setIsValidCode(false);
            // 不显示toast，因为这是在输入过程中的验证
        }
    };
    
    // 监听code变化
    useEffect(() => {
        const debounceTimeout = setTimeout(() => {
            if (code) {
                fetchReferralData(code);
            } else {
                setIsValidCode(false);
            }
        }, 500); // 500ms防抖

        return () => clearTimeout(debounceTimeout);
    }, [code, wallet, connection]);

    // const close = () => {
    //     setLoading(false);
    //     setTimeout(() => {
    //         onClose();
    //     }, 3000);
    // }

    const handleMint = async () => {
        if (!wallet) {
            toast.error('Please connect wallet');
            return;
        }

        if (!code || !isValidCode) {
            toast.error('Please enter a valid code');
            return;
        }

        try {
            setLoading(true);
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
                referralData?.referralAccount as PublicKey,
                referralData?.referrerMain as PublicKey,
                referralData?.referrerAta as PublicKey,
                code,
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
                setLoading(false);
                // close();
            } else {
                toast.error(result.message as string);
                setLoading(false);
            }
        } catch (error: any) {
            toast.error(error.message);
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
                    <svg className='w-4 h-4' fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M5 5h2v2H5V5zm4 4H7V7h2v2zm2 2H9V9h2v2zm2 0h-2v2H9v2H7v2H5v2h2v-2h2v-2h2v-2h2v2h2v2h2v2h2v-2h-2v-2h-2v-2h-2v-2zm2-2v2h-2V9h2zm2-2v2h-2V7h2zm0 0V5h2v2h-2z" fill="currentColor"/> </svg>
                </button>
                <h3 className="text-heading text-lg mb-4">Mint {token.tokenSymbol}</h3>
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
                            disabled={loading}
                        />
                    </div>
                    {code &&
                    <div className="pixel-box mt-4 space-y-2 bg-base-200 p-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-base-content/70">Current fee</span>
                            <span className="text-medium">{
                                isValidCode ?
                                    (parseInt(token.feeRate) / LAMPORTS_PER_SOL).toFixed(4) + " SOL"
                                    : '-'
                                }
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-base-content/70">Current mint size</span>
                            <span className="text-medium">{
                                isValidCode ? 
                                    (parseFloat(token.mintSizeEpoch) / LAMPORTS_PER_SOL).toFixed(4) + " " + token.tokenSymbol
                                    : '-'
                                }
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-base-content/70">Current price</span>
                            <span className="text-medium">{
                                isValidCode ? 
                                    formatPrice(parseFloat(token.feeRate) / parseFloat(token.mintSizeEpoch))  + " SOL"
                                    : '-'
                                }
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-base-content/70">URC provider</span>
                            <span className="text-medium">{
                                isValidCode ?
                                    <AddressDisplay address={referralData?.referrerMain?.toBase58() as string} />
                                    : '-'
                                }
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-base-content/70">URC provider balance</span>
                            <span className="text-medium">{
                                isValidCode && referralData ? 
                                    referralData.tokenBalance?.toLocaleString(undefined, { maximumFractionDigits: 2 }) + " " + token.tokenSymbol
                                    : '-'
                                }
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-base-content/70">URC usage count</span>
                            <span className="text-medium">{
                                isValidCode ? referralData?.usageCount : '-'
                                }
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-base-content/70">Bonus to URC provider</span>
                            <span>{
                                isValidCode ?
                                    formatPrice(parseInt(referralData?.urcProviderBonus?.toString() || '0') / LAMPORTS_PER_SOL) + " SOL"
                                    : '-'
                                }
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-base-content/70">Discount of URC</span>
                            <span className="text-medium text-success">-{isValidCode && (100 - Number(referralData?.acturalPay) / parseInt(token.feeRate) * 100).toFixed(2) + "%"}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-medium border-t border-base-300 pt-2 mt-2">
                            <span>Actual pay</span>
                            <span>{
                                isValidCode ? 
                                    formatPrice(parseInt(referralData?.acturalPay?.toString() || '0') / LAMPORTS_PER_SOL) + " SOL"
                                    : '-'
                                }
                            </span>
                        </div>
                    </div>
                    }
                    <div className="space-y-2">
                        <button 
                            className={`btn btn-primary w-full`}
                            onClick={handleMint}
                            disabled={loading || !isValidCode || !code}
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
