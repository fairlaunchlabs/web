import { FC, useEffect, useState } from 'react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { useQuery } from '@apollo/client';
import { querySetRefererCodeEntitiesByOwner, queryTokensByMints, queryTotalReferrerBonusSum } from '../../utils/graphql';
import { InitiazlizedTokenData, MyUniqueReferralCodeProps, TokenMetadataIPFS } from '../../types/types';
import { ReferralCodeModal } from '../myAccount/ReferralCodeModal';
import { useNavigate } from 'react-router-dom';
import { TokenImage } from '../mintTokens/TokenImage';
import { fetchTokenMetadataMap } from '../../utils/web3';
import { Pagination } from '../common/Pagination';
import { PAGE_SIZE_OPTIONS } from '../../config/constants';
import { AddressDisplay } from '../common/AddressDisplay';
import { ErrorBox } from '../common/ErrorBox';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { ReferralBonusDetailModal } from './ReferralBonusDetailModal';

export const MyUniqueReferralCode: FC<MyUniqueReferralCodeProps> = ({ expanded }) => {
    const wallet = useAnchorWallet();
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [selectedToken, setSelectedToken] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [bonusByMint, setBonusByMint] = useState<Record<string, string>>({});
    const [selectedBonusMint, setSelectedBonusMint] = useState<string | null>(null);
    const [totalBonus, setTotalBonus] = useState(0);
    const [loadingMetadata, setLoadingMetadata] = useState(false);

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

    const { loading: referralBonusLoading, error: referralBonusError, data: referralBonusData} = useQuery(queryTotalReferrerBonusSum, {
        variables: {
            mints: mints,
            referrerMain: wallet?.publicKey.toBase58(),
        },
    });

    const [tokenMetadataMap, setTokenMetadataMap] = useState<Record<string, any>>({});

    useEffect(() => {
        setLoadingMetadata(true);
        fetchTokenMetadataMap(tokenData?.initializeTokenEventEntities).then((updatedMap) => {
            setLoadingMetadata(false);
            setTokenMetadataMap(updatedMap);
        });
    }, [tokenData]);

    useEffect(() => {
        if (referralBonusData?.mintTokenEntities) {
            const bonusMap = referralBonusData.mintTokenEntities.reduce((acc: Record<string, string>, entity: any) => {
                const existingBonus = acc[entity.mint] || '0';
                const newBonus = (parseFloat(existingBonus) + parseFloat(entity.referrerFee || '0')).toString();
                return { ...acc, [entity.mint]: newBonus };
            }, {});
            setBonusByMint(bonusMap);
        }
    }, [referralBonusData]);

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

    const handleOpenBonusDetail = (mint: string, totalBonus: number) => {
        setSelectedBonusMint(mint);
        setTotalBonus(totalBonus);
    };

    const handleCloseBonusDetail = () => {
        setSelectedBonusMint(null);
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

    return (
        <div className={`space-y-6 p-6 ${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
            <div className="max-w-6xl mx-auto flex flex-col gap-4 mb-20">
                <h2 className="card-title mb-4">My URCs(Unique Referral Codes)</h2>
                {urcLoading || tokenLoading || loadingMetadata ? (
                    <div className="flex justify-center">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                ) : urcError ? (
                    <ErrorBox title="Error loading URCs" message={urcError.message} />
                ) : urcData?.setRefererCodeEventEntities?.length === 0 ? (
                    <p>No URCs found</p>
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
                        {/* <div className="overflow-x-auto bg-base-100 rounded-xl shadow-xl pixel-table-container"> */}
                            <table className="pixel-table w-full">
                                <thead>
                                    <tr>
                                        <th className="text-center"></th>
                                        <th className="text-left">Symbol & Name</th>
                                        <th className="text-left">Mint Address</th>
                                        <th className="text-left">Developer</th>
                                        <th className="text-right">Bonus</th>
                                        <th className="text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tokenData?.initializeTokenEventEntities?.map((item: InitiazlizedTokenData) => {
                                        const metadata = tokenMetadataMap[item.mint];
                                        return (
                                            <tr key={item.id} className="hover">
                                                <td className="cursor-pointer" onClick={() => handleTokenClick(item)}>
                                                    <div className="flex items-center space-x-2">
                                                        <div className='mr-2'>
                                                            {metadata?.tokenMetadata?.image && 
                                                            <TokenImage 
                                                                imageUrl={metadata?.tokenMetadata.image as string} 
                                                                name={metadata.tokenName} 
                                                                launchTimestamp={Number(item.metadataTimestamp)}
                                                                size={40} 
                                                                className='w-12 h-12' 
                                                            />}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div>
                                                        <div className="font-bold">{metadata?.tokenSymbol || item.mint}</div>
                                                        <div className="text-sm opacity-50">{metadata?.tokenName}</div>
                                                    </div>
                                                </td>
                                                <td><AddressDisplay address={item.mint} /></td>
                                                <td><AddressDisplay address={item.admin} /></td>
                                                <td>{bonusByMint[item.mint] === undefined ? "0" : (Number(bonusByMint[item.mint]) / LAMPORTS_PER_SOL).toFixed(4)} SOL</td>
                                                <td className='text-right'>
                                                    <div className="flex gap-2 justify-end">
                                                        <button
                                                            className="btn btn-sm btn-primary mr-2"
                                                            onClick={() => handleGetURC(item)}
                                                        >
                                                            Code Detail
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-secondary"
                                                            onClick={() => handleOpenBonusDetail(item.mint, bonusByMint[item.mint] === undefined ? 0 : Number(bonusByMint[item.mint]) / LAMPORTS_PER_SOL)}
                                                        >
                                                            Bonus Detail
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        {/* </div> */}

                        {urcData?.setRefererCodeEventEntities?.length === 0 && (
                            <div className="text-center py-10">
                                <p className="text-gray-500">No URCs found</p>
                            </div>
                        )}

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
            {selectedToken && (
                <ReferralCodeModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    token={selectedToken}
                />
            )}

            {selectedBonusMint && wallet && (
                <ReferralBonusDetailModal
                    isOpen={!!selectedBonusMint}
                    onClose={handleCloseBonusDetail}
                    mint={selectedBonusMint}
                    referrerMain={wallet.publicKey.toBase58()}
                    totalBonus={totalBonus}
                />
            )}
        </div>
    );
};
