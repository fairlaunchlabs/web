import { FC, useEffect, useState } from 'react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { useQuery } from '@apollo/client';
import { querySetRefererCodeEntitiesByOwner, queryInitializeTokenEventBySearch } from '../../utils/graphql';
import { InitiazlizedTokenData, TokenListItem, TokenMetadataIPFS } from '../../types/types';
import { ReferralCodeModal } from '../myAccount/ReferralCodeModal';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { TokenImage } from '../mintTokens/TokenImage';
import { extractIPFSHash } from '../../utils/format';
import { pinata } from '../../utils/web3';

interface MyUniqueReferralCodeProps {
    expanded: boolean;
}

export const MyUniqueReferralCode: FC<MyUniqueReferralCodeProps> = ({ expanded }) => {
    const wallet = useAnchorWallet();
    const navigate = useNavigate();
    const [page, setPage] = useState(0);
    const pageSize = 10;
    const [selectedToken, setSelectedToken] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { loading: urcLoading, error: urcError, data: urcData, refetch: refetchUrc } = useQuery(querySetRefererCodeEntitiesByOwner, {
        variables: {
            owner: wallet?.publicKey.toBase58(),
            skip: page * pageSize,
            first: pageSize,
        },
        skip: !wallet,
    });

    // 构建当前页面所有代币的mint地址查询条件
    const mintAddresses = urcData?.setRefererCodeEntities?.map((item: any) => item.mint) || [];
    const mintQuery = mintAddresses.length > 0 ? mintAddresses.join(" ") : "";

    const { loading: tokenLoading, error: tokenError, data: tokenData } = useQuery(queryInitializeTokenEventBySearch, {
        variables: {
            searchQuery: mintQuery,
            skip: 0,
            first: mintAddresses.length || 1,
        },
        skip: !mintAddresses.length,
    });

    const [tokenMetadataMap, setTokenMetadataMap] = useState<Record<string, any>>({});

    // 创建基础的代币元数据Map
    const baseTokenMap = tokenData?.initializeTokenEventEntities?.reduce((acc: any, token: any) => {
        acc[token.mint] = token;
        return acc;
    }, {}) || {};

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

    if(Object.keys(tokenMetadataMap).length > 0) {
        console.log("tokenMetadataMap", tokenMetadataMap);
    }

    useEffect(() => {
        if (wallet) {
            refetchUrc();
        }
    }, [wallet, refetchUrc]);

    const handleTokenClick = (token: any) => {
        navigate(`/token/${token.mint}`);
    };

    const handleGetURC = (token: any) => {
        setSelectedToken({
            mint: token.mint,
            amount: '',
            tokenData: token as InitiazlizedTokenData
        });
        setIsModalOpen(true);
    };

    if (!wallet) {
        return (
            <div className={`hero min-h-[400px] bg-base-200 ${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
                <div className="hero-content text-center">
                    <div className="max-w-md">
                        <h1 className="text-5xl font-bold">Hello there</h1>
                        <p className="py-6">Please connect your wallet to view your URCs</p>
                    </div>
                </div>
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
            <h2 className="text-2xl font-bold">My URCs(Unique Referral Codes)</h2>
            <div className="overflow-x-auto">
                <table className="table w-full">
                    <thead>
                        <tr>
                            <th>Token</th>
                            <th>Active time</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {urcData?.setRefererCodeEntities?.map((item: any) => {
                            const metadata = tokenMetadataMap[item.mint];
                            return (
                                <tr key={item.id} className="hover">
                                    <td className="cursor-pointer" onClick={() => handleTokenClick(item)}>
                                        <div className="flex items-center space-x-2">
                                            <div className=''>
                                                {metadata?.tokenMetadata.image && <TokenImage imageUrl={metadata?.tokenMetadata.image as string} name={metadata.tokenName} size={40} className='rounded-full' />}
                                            </div>
                                            <div>
                                                <div className="font-bold">{metadata?.tokenName || item.mint}</div>
                                                <div className="text-sm opacity-50">{metadata?.tokenSymbol}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{new Date(item.activeTimestamp * 1000).toLocaleString()}</td>
                                    <td>
                                        <div className="flex gap-2">
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

            {urcData?.setRefererCodeEntities?.length === 0 && (
                <div className="text-center py-10">
                    <p className="text-gray-500">No URCs found</p>
                </div>
            )}

            <div className="flex justify-center gap-2 mt-4">
                <button
                    className="btn btn-sm"
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                >
                    Previous
                </button>
                <button
                    className="btn btn-sm"
                    onClick={() => setPage(p => p + 1)}
                    disabled={!urcData?.setRefererCodeEntities || urcData.setRefererCodeEntities.length < pageSize}
                >
                    Next
                </button>
            </div>

            {selectedToken && (
                <ReferralCodeModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    token={selectedToken}
                />
            )}
        </div>
    );
};
