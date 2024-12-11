import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { FC, useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { queryMyTokenList, queryTokensByMints } from '../utils/graphql';
import { InitiazlizedTokenData, MyAccountProps, TokenListItem, TokenMetadataIPFS } from '../types/types';
import { AddressDisplay } from '../components/common/AddressDisplay';
import { TokenImage } from '../components/mintTokens/TokenImage';
import { fetchMetadata } from '../utils/web3';
import { BN_LAMPORTS_PER_SOL, BN_ZERO, numberStringToBN } from '../utils/format';
import { useNavigate } from 'react-router-dom';
import { ReferralCodeModal } from '../components/myAccount/ReferralCodeModal';
import { RefundModal } from '../components/myAccount/RefundModal';
import { Pagination } from '../components/common/Pagination';
import { PAGE_SIZE_OPTIONS } from '../config/constants';

export const MyAccount: FC<MyAccountProps> = ({ expanded }) => {
    const { connection } = useConnection();
    const { publicKey } = useWallet();
    const navigate = useNavigate();
    const [balance, setBalance] = useState(0);
    const [tokenList, setTokenList] = useState<TokenListItem[]>([]);
    const [searchMints, setSearchMints] = useState<string[]>([]);
    const [selectedTokenForReferral, setSelectedTokenForReferral] = useState<TokenListItem | null>(null);
    const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
    const [selectedTokenForRefund, setSelectedTokenForRefund] = useState<TokenListItem | null>(null);
    const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    const { data: myTokensData, loading: loadingTokens } = useQuery(queryMyTokenList, {
        variables: {
            owner: publicKey?.toBase58() || '',
            skip: (currentPage - 1) * pageSize,
            first: pageSize
        },
        skip: !publicKey,
        onCompleted: (data) => {
            if (data?.tokenAccountEntities) {
                const mints = data.tokenAccountEntities.map((token: TokenListItem) => token.mint);
                setSearchMints(mints);
                setTokenList(data.tokenAccountEntities);
                setTotalCount(Math.max(totalCount, (currentPage - 1) * pageSize + (data.tokenAccountEntities?.length ?? 0)));
            }
        }
    });

    const { data: tokenDetailsData, loading: loadingDetails } = useQuery(queryTokensByMints, {
        variables: {
            mints: searchMints,
            skip: 0,
            first: 100
        },
        skip: searchMints.length === 0
    });

    useEffect(() => {
        if (!publicKey) return;

        const getBalance = async () => {
            try {
                const balance = await connection.getBalance(publicKey);
                setBalance(balance / LAMPORTS_PER_SOL);
            } catch (e) {
                console.error('Error getting balance:', e);
            }
        };

        getBalance();
        const id = connection.onAccountChange(publicKey, (account) => {
            setBalance(account.lamports / LAMPORTS_PER_SOL);
        });

        return () => {
            connection.removeAccountChangeListener(id);
        };
    }, [connection, publicKey]);

    useEffect(() => {
        if (myTokensData?.holdersEntities) {
            const mints = myTokensData.holdersEntities.map((token:any) => token.mint);
            setSearchMints(mints);
            setTokenList(myTokensData.holdersEntities);
        }
    }, [myTokensData]);

    useEffect(() => {
        if (tokenDetailsData?.initializeTokenEventEntities) {
            const updatedTokenList = tokenList.map(token => ({
                ...token,
                tokenData: tokenDetailsData.initializeTokenEventEntities.find(
                    (event: InitiazlizedTokenData) => event.mint === token.mint
                )
            }));
            setTokenList(updatedTokenList);

            // Fetch token images
            updatedTokenList.forEach(async (token) => {
                if (token.tokenData?.tokenUri) {
                    try {
                        const data = await fetchMetadata(token.tokenData as InitiazlizedTokenData);
                        setTokenList(currentList => 
                            currentList.map(t => 
                                t.mint === token.mint 
                                    ? { ...t, imageUrl: data?.image }
                                    : t
                            )
                        );
                    } catch (error) {
                        console.error('Error fetching token image:', error);
                    }
                }
            });
        }
    }, [tokenDetailsData]);

    const handleRefund = (token: TokenListItem) => {
        setSelectedTokenForRefund(token);
        setIsRefundModalOpen(true);
    };

    if (!publicKey) {
        return (
            <div className='flex justify-center items-center'>
                <div className="card w-96 bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">My Tokens</h2>
                        <p>Please connect your wallet to view your account</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex flex-col items-center ${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
            <div className="w-full max-w-6xl px-4">
                <h2 className="card-title mb-4">My Tokens</h2>
                {loadingTokens || loadingDetails ? (
                    <div className="flex justify-center">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                ) : tokenList.filter(token => numberStringToBN(token.amount).gt(BN_ZERO)).length === 0 ? (
                    <p>No tokens found</p>
                ) : (
                    <>
                        <div className="flex justify-end mb-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-base-content">Rows per page:</span>
                                <select 
                                    className="select select-bordered select-sm" 
                                    value={pageSize}
                                    onChange={(e) => {
                                        setPageSize(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                >
                                    {PAGE_SIZE_OPTIONS.map(size => (
                                        <option key={size} value={size}>{size}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="overflow-x-auto bg-base-100 rounded-xl shadow-xl">
                            <table className="table w-full">
                                <thead>
                                    <tr>
                                        <th className="text-left">Image</th>
                                        <th className="text-left">Name & Symbol</th>
                                        <th className="text-left">Mint Address</th>
                                        <th className="text-right">Balance</th>
                                        <th className="text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tokenList
                                        .filter(token => numberStringToBN(token.amount).gt(BN_ZERO))
                                        .map((token: TokenListItem) => (
                                        <tr key={token.mint} className="hover">
                                            <td className="text-left">
                                                {token.imageUrl && (
                                                    <TokenImage
                                                        imageUrl={token.imageUrl}
                                                        name={token.tokenData?.tokenName || 'Unknown'}
                                                        launchTimestamp={Number(token.tokenData?.timestamp) || 0}
                                                        size={48}
                                                        className="w-12 h-12 rounded-full"
                                                    />
                                                )}
                                            </td>
                                            <td className="text-left">
                                                <div className="font-bold">{token.tokenData?.tokenName || 'Unknown'}</div>
                                                <div className="text-sm opacity-50">{token.tokenData?.tokenSymbol || 'Unknown'}</div>
                                            </td>
                                            <td className="text-left">
                                                <AddressDisplay address={token.mint} />
                                            </td>
                                            <td className="text-right">
                                                {(numberStringToBN(token.amount).div(BN_LAMPORTS_PER_SOL)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                            </td>
                                            <td>
                                                <div className="flex gap-2 justify-end">
                                                    <button 
                                                        className="btn btn-sm btn-primary"
                                                        onClick={() => navigate(`/token/${token.mint}`)}
                                                    >
                                                        Get more
                                                    </button>
                                                    <button 
                                                        className="btn btn-sm btn-error"
                                                        onClick={() => handleRefund(token)}
                                                    >
                                                        Refund
                                                    </button>
                                                    <button 
                                                        className="btn btn-sm btn-accent"
                                                        onClick={() => {
                                                            setSelectedTokenForReferral(token);
                                                            setIsReferralModalOpen(true);
                                                        }}
                                                    >
                                                        Code
                                                    </button>
                                                    <button 
                                                        className="btn btn-sm btn-info"
                                                        onClick={() => {
                                                            // TODO: Implement thaw functionality
                                                        }}
                                                    >
                                                        Thaw
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={Math.ceil(totalCount / pageSize)}
                                totalCount={totalCount}
                                pageSize={pageSize}
                                onPageChange={setCurrentPage}
                                hasMore={(currentPage * pageSize) < totalCount}
                            />
                        </div>
                    </>
                )}
            </div>
            {selectedTokenForReferral && (
                <ReferralCodeModal
                    isOpen={isReferralModalOpen}
                    onClose={() => {
                        setIsReferralModalOpen(false);
                        setSelectedTokenForReferral(null);
                    }}
                    token={selectedTokenForReferral}
                />
            )}
            {selectedTokenForRefund && (
                <RefundModal
                    isOpen={isRefundModalOpen}
                    onClose={() => {
                        setIsRefundModalOpen(false);
                        setSelectedTokenForRefund(null);
                    }}
                    token={selectedTokenForRefund}
                />
            )}
        </div>
    );
};
