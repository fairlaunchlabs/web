import { FC, useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { querySetRefererCodeEntityById } from '../../utils/graphql';
import toast from 'react-hot-toast';
import { useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getReferrerCodeHash, getReferrerDataByReferralAccount, getTokenBalance } from '../../utils/web3';
import { AddressDisplay } from '../common/AddressDisplay';

interface CheckURCProps {
    expanded: boolean;
}

interface SetRefererCodeEntity {
    id: string;
    mint: string;
    referralAccount: string;
    referrerAta: string;
    referrerMain: string;
}

interface OnChainReferralData {
    codeHash: string;
    usageCount: number;
    activeTimestamp: number;
    tokenBalance: number | null;
}

export const CheckURC: FC<CheckURCProps> = ({ expanded }) => {
    const { connection } = useConnection();
    const wallet = useAnchorWallet();
    const [searchId, setSearchId] = useState('');
    const [searchResult, setSearchResult] = useState<SetRefererCodeEntity | null>(null);
    const [onChainData, setOnChainData] = useState<OnChainReferralData | null>(null);
    const [loading, setLoading] = useState(false);
    const [referralLink, setReferralLink] = useState('');

    const [getRefererCode] = useLazyQuery(querySetRefererCodeEntityById, {
        onCompleted: async (data) => {
            if (data.setRefererCodeEventEntity) {
                setSearchResult(data.setRefererCodeEventEntity);
                try {
                    const result = await getReferrerDataByReferralAccount(
                        wallet,
                        connection,
                        new PublicKey(data.setRefererCodeEventEntity.referralAccount)
                    );
                    if (result?.success && result.data) {
                        setOnChainData({
                            codeHash: result.data.codeHash.toString(),
                            usageCount: result.data.usageCount,
                            activeTimestamp: result.data.activeTimestamp.toNumber(),
                            tokenBalance: await getTokenBalance(result.data.referrerAta, connection),
                        });
                        setReferralLink(
                            `${window.location.origin}/token/${data.setRefererCodeEventEntity.mint}/${searchId.trim()}`
                        );
                        // TODO: 根据mint获取token metadata以及当前价格，然后计算该code的打折信息

                    } else {
                        toast.error('Failed to fetch on-chain data');
                    }
                } catch (error) {
                    console.error('Error fetching on-chain data:', error);
                    toast.error('Error fetching on-chain data');
                }
            } else {
                toast.error('No data found for this URC');
                setSearchResult(null);
                setOnChainData(null);
            }
        },
        onError: (error) => {
            console.error('GraphQL error:', error);
            toast.error('Error searching for URC');
            setSearchResult(null);
            setOnChainData(null);
        }
    });

    const handleSearch = () => {
        if (!searchId.trim()) {
            toast.error('Please enter an ID to search');
            return;
        }
        setLoading(true);
      
        const result = getReferrerCodeHash(wallet, searchId.trim());
        console.log("==>>", result.data?.toString().toLowerCase());
        if (result.success) {
            getRefererCode({ 
                variables: { id: result.data?.toString().toLowerCase() } 
            }).finally(() => setLoading(false));
        } else {
            toast.error(result.message as string);
            setSearchResult(null);
            setOnChainData(null);
            setLoading(false);
        }
    };

    return (
        <div className={`space-y-6 p-6 ${expanded ? "md:ml-64" : "md:ml-20"}`}>
            <h2 className="text-2xl text-center font-bold">Validate URC</h2>
            <div className="max-w-5xl mx-auto w-full flex flex-col gap-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Enter URC ID"
                        className="input input-bordered flex-1"
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button 
                        className={`btn btn-primary ${loading ? 'loading' : ''}`}
                        onClick={handleSearch}
                        disabled={loading}
                    >
                        Search
                    </button>
                </div>

                {searchResult && (
                    <div className="card bg-base-200 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title">URC Details</h2>
                            <div className="overflow-x-auto">
                                <table className="table w-full">
                                    <tbody>
                                        {onChainData && (
                                            <>
                                                <tr>
                                                    <td className="font-bold w-1/3">Code Hash</td>
                                                    <td className="flex items-center gap-2 w-2/3">
                                                        {onChainData.codeHash}
                                                        {onChainData.codeHash === getReferrerCodeHash(wallet, searchId.trim()).data?.toString() && searchId ? (
                                                            <span className="badge badge-success">Verified</span>
                                                        ) : (
                                                            <span className="badge badge-error">Not Verified</span>
                                                        )}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="font-bold">Referral Link</td>
                                                    <td className="flex items-start gap-2">
                                                        <div className="relative flex-1 min-w-0">
                                                            <span className="block line-clamp-3 pr-2 text-sm break-all leading-5">
                                                                {referralLink}
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(referralLink);
                                                                toast.success('Copied');
                                                            }}
                                                            className="btn btn-ghost btn-xs p-0 min-h-0 h-auto flex-shrink-0 mt-0.5"
                                                            title="Copy Link"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                                                            </svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="font-bold">Usage Count</td>
                                                    <td>{onChainData.usageCount}</td>
                                                </tr>
                                                <tr>
                                                    <td className="font-bold">Active Time</td>
                                                    <td>{new Date(onChainData.activeTimestamp * 1000).toLocaleString()}</td>
                                                </tr>
                                                <tr>
                                                    <td className="font-bold">Referrer's token balance</td>
                                                    <td>{onChainData.tokenBalance?.toLocaleString()}</td>
                                                </tr>
                                            </>
                                        )}
                                        <tr>
                                            <td className="font-bold">Token Address</td>
                                            <td>
                                                {<AddressDisplay address={searchResult.mint} showCharacters={6} />}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="font-bold">Provider main account</td>
                                            <td>
                                                {<AddressDisplay address={searchResult.referrerMain} showCharacters={6} />}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="font-bold">Provider token accoount</td>
                                            <td>
                                                {<AddressDisplay address={searchResult.referrerAta} showCharacters={6} />}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="font-bold">URC Account</td>
                                            <td>
                                                {<AddressDisplay address={searchResult.referralAccount} showCharacters={6} />}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};