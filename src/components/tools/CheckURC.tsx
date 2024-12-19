import { FC, useState } from 'react';
import toast from 'react-hot-toast';
import { useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getReferralDataByCodeHash, getReferrerCodeHash, getTokenBalance } from '../../utils/web3';
import { AddressDisplay } from '../common/AddressDisplay';
import { CheckURCProps, SetRefererCodeEntity } from '../../types/types';
import { FaSearch } from 'react-icons/fa';
import { PageHeader } from '../common/PageHeader';

export const CheckURC: FC<CheckURCProps> = ({ expanded }) => {
    const { connection } = useConnection();
    const wallet = useAnchorWallet();
    const [searchId, setSearchId] = useState('');
    const [searchResult, setSearchResult] = useState<SetRefererCodeEntity | null>(null);
    const [loading, setLoading] = useState(false);
    const [referralLink, setReferralLink] = useState('');

    const handleSearch = () => {
        if (!searchId.trim()) {
            toast.error('Please enter an ID to search');
            return;
        }
        setLoading(true);
      
        const codeHashData = getReferrerCodeHash(wallet, connection, searchId.trim());
        if (codeHashData.success) {
            getReferralDataByCodeHash(wallet, connection, codeHashData.data as PublicKey).then(async (result) => {
                if (result?.success && result.data) {
                    setSearchResult({
                        mint: result.data.mint.toBase58(),
                        referrerMain: result.data.referrerMain.toBase58(),
                        referrerAta: result.data.referrerAta.toBase58(),
                        referralAccount: result.data.referralAccount.toBase58(),
                        usageCount: result.data.usageCount,
                        activeTimestamp: result.data.activeTimestamp.toNumber(),
                        codeHash: result.data.codeHash.toString(),
                        tokenBalance: await getTokenBalance(result.data.referrerAta, connection),
                    } as SetRefererCodeEntity);
                    setReferralLink(
                        `${window.location.origin}/token/${result.data.mint.toBase58()}/${searchId.trim()}`
                    );
                    setLoading(false);
                } else {
                    toast.error(result.message as string);
                    setSearchResult(null);
                    setLoading(false);
                }
            });
        } else {
            toast.error(codeHashData.message as string);
            setSearchResult(null);
            setLoading(false);
        }
    };

    return (
        <div className={`space-y-0 md:p-4 ${expanded ? "md:ml-64" : "md:ml-20"}`}>
            <PageHeader title="Check URC" bgImage='/bg/group1/6.jpg' />
            <div className="md:max-w-5xl mx-auto w-full flex flex-col gap-4">
                <div className="join w-full">
                    <div className='relative join-item flex-1'>
                    <input
                        type="text"
                        placeholder="Enter URC ID"
                        className='input search-input w-full pl-10'
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    <button 
                        className="search-btn join-item btn-primary w-24"
                        onClick={handleSearch}
                        disabled={loading}
                    >
                        {loading ? <span className="loading loading-spinner loading-sm"></span> : 'Search'}
                    </button>
                </div>

                {searchResult && searchResult.codeHash === getReferrerCodeHash(wallet, connection, searchId.trim()).data?.toString() && searchId ? (
                    <div className="pixel-box bg-base-200 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title">URC Details</h2>
                            <div className="overflow-x-auto">
                                <table className="table w-full">
                                    <tbody>
                                        {searchResult && (
                                            <>
                                                <tr>
                                                    <td className="font-bold w-1/3">Code Hash</td>
                                                    <td className="flex items-center gap-2 w-2/3">
                                                        {searchResult.codeHash}
                                                        <span className="badge badge-success">Verified</span>
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
                                                            className="btn btn-sm w-8 h-8 p-0"
                                                            title="Copy Link"
                                                        >
                                                        <svg className='w-4 h-4' fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M4 2h11v2H6v13H4V2zm4 4h12v16H8V6zm2 2v12h8V8h-8z" fill="currentColor"/> </svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="font-bold">Usage Count</td>
                                                    <td>{searchResult.usageCount}</td>
                                                </tr>
                                                <tr>
                                                    <td className="font-bold">Active Time</td>
                                                    <td>{new Date(searchResult.activeTimestamp * 1000).toLocaleString()}</td>
                                                </tr>
                                                <tr>
                                                    <td className="font-bold">Referrer's token balance</td>
                                                    <td>{searchResult.tokenBalance?.toLocaleString()}</td>
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
                ): searchId && (
                    <div className='text-red-500'>
                        Invalid URC
                    </div>
                )}
            </div>
        </div>
    );
};