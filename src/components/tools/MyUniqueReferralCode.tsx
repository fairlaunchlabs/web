import { FC, useEffect, useState } from 'react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { useQuery } from '@apollo/client';
import { querySetRefererCodeEntitiesByOwner, queryTokensByMints } from '../../utils/graphql';
import { InitiazlizedTokenData, MyUniqueReferralCodeProps, TokenMetadataIPFS } from '../../types/types';
import { ReferralCodeModal } from '../myAccount/ReferralCodeModal';
import { useNavigate } from 'react-router-dom';
import { TokenImage } from '../mintTokens/TokenImage';
import { extractIPFSHash } from '../../utils/format';
import { pinata } from '../../utils/web3';
import { Pagination } from '../common/Pagination';
import { PAGE_SIZE_OPTIONS } from '../../config/constants';
import { AddressDisplay } from '../common/AddressDisplay';

export const MyUniqueReferralCode: FC<MyUniqueReferralCodeProps> = ({ expanded }) => {
    const wallet = useAnchorWallet();
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [selectedToken, setSelectedToken] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { loading: urcLoading, error: urcError, data: urcData, refetch: refetchUrc } = useQuery(querySetRefererCodeEntitiesByOwner, {
        variables: {
            owner: wallet?.publicKey.toBase58(),
            skip: (currentPage - 1) * pageSize,
            first: pageSize,
        },
        skip: !wallet,
        onCompleted: (data) => {
            setTotalCount(Math.max(totalCount, (currentPage - 1) * pageSize + (data.setRefererCodeEventEntities?.length ?? 0)));
        }
    });

    const mints = urcData?.setRefererCodeEventEntities?.map((token:any) => token.mint);
    const { loading: tokenLoading, error: tokenError, data: tokenData } = useQuery(queryTokensByMints, {
        variables: {
            mints: mints,
            skip: 0,
            first: mints?.length || 1,
        },
        skip: !mints?.length,
    });

    const [tokenMetadataMap, setTokenMetadataMap] = useState<Record<string, any>>({});

    // 使用useEffect处理异步操作
    useEffect(() => {
        const fetchTokenMetadata = async () => {
            if (!tokenData?.initializeTokenEventEntities) return;
            
            const updatedMap: Record<string, any> = {};
            for (const token of tokenData.initializeTokenEventEntities) {
                try {
                    const response = await pinata.gateways.get(extractIPFSHash(token.tokenUri) as string);
                    const tokenMetadata = response.data as TokenMetadataIPFS;
                    updatedMap[token.mint] = { ...token, tokenMetadata };
                } catch (error) {
                    console.error(`Error fetching metadata for token ${token.mint}:`, error);
                    updatedMap[token.mint] = token;
                }
            }
            setTokenMetadataMap(updatedMap);
        };

        fetchTokenMetadata();
    }, [tokenData]);

    useEffect(() => {
        if (wallet) {
            refetchUrc();
        }
    }, [wallet, refetchUrc]);

    const handleTokenClick = (token: any) => {
        navigate(`/token/${token.mint}`);
    };

    const handleGetURC = (item: any) => {
        const newSelectedToken = {
            mint: item.mint,
            amount: '',
            tokenData: {
                ...item,
                tokenMetadata: tokenMetadataMap[item.mint]?.tokenMetadata
            } as InitiazlizedTokenData
        };
        setSelectedToken(newSelectedToken);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTimeout(() => {
            setSelectedToken(null);
        }, 300);
    };

    const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newPageSize = Number(event.target.value);
        setPageSize(newPageSize);
        setCurrentPage(1); // 切换页面大小时重置到第一页
    };

    const totalPages = Math.ceil(totalCount / pageSize);

    if (!wallet) {
        return (
            <div className={`hero min-h-[400px] bg-base-200 ${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
                <div className="hero-content text-center">
                    <div className="max-w-md">
                        <p className="py-6">Please connect your wallet to view your URCs</p>
                    </div>
                </div>
            </div>
        );
    }

    if (urcError || tokenError) {
        return (
            <div className={`flex justify-center items-center min-h-[400px] ${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
                <span className="text-2xl font-bold text-center">Error</span>
            </div>
        );
    }

    if (urcLoading || tokenLoading) {
        return (
            <div className={`flex justify-center items-center min-h-[400px] ${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <div className={`space-y-6 p-6 ${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
            <h2 className="text-2xl font-bold text-center">My URCs(Unique Referral Codes)</h2>
            <div className="max-w-5xl mx-auto flex flex-col gap-4">
                <div className="flex justify-end">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-base-content">Rows per page:</span>
                        <select 
                            className="select select-bordered select-sm" 
                            value={pageSize}
                            onChange={handlePageSizeChange}
                        >
                            {PAGE_SIZE_OPTIONS.map(size => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                    </div>

                </div>
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th>Token</th>
                                <th>Mint Address</th>
                                <th>Developer</th>
                                <th className='text-right'>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tokenData?.initializeTokenEventEntities?.map((item: any) => {
                                const metadata = tokenMetadataMap[item.mint];
                                return (
                                    <tr key={item.id} className="hover">
                                        <td className="cursor-pointer" onClick={() => handleTokenClick(item)}>
                                            <div className="flex items-center space-x-2">
                                                <div className='mr-2'>
                                                    {metadata?.tokenMetadata?.image && <TokenImage imageUrl={metadata?.tokenMetadata.image as string} name={metadata.tokenName} size={40} className='rounded-full' />}
                                                </div>
                                                <div>
                                                    <div className="font-bold">{metadata?.tokenName || item.mint}</div>
                                                    <div className="text-sm opacity-50">{metadata?.tokenSymbol}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><AddressDisplay address={item.mint} /></td>
                                        <td><AddressDisplay address={item.admin} /></td>
                                        <td className='text-right'>
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    className="btn btn-sm btn-primary"
                                                    onClick={() => handleGetURC(item)}
                                                >
                                                    Detail
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {urcData?.setRefererCodeEventEntities?.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-gray-500">No URCs found</p>
                    </div>
                )}

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalCount={totalCount}
                    pageSize={pageSize}
                    onPageChange={(page) => setCurrentPage(page)}
                />

                {selectedToken && (
                    <ReferralCodeModal
                        isOpen={isModalOpen}
                        onClose={handleCloseModal}
                        token={selectedToken}
                    />
                )}
            </div>
        </div>
    );
};
