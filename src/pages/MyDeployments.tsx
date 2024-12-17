import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import { queryMyDeployments } from "../utils/graphql";
import { ErrorBox } from "../components/common/ErrorBox";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { InitiazlizedTokenData, TokenMetadataIPFS } from "../types/types";
import { fetchTokenMetadataMap } from "../utils/web3";
import { TokenImage } from "../components/mintTokens/TokenImage";
import { AddressDisplay } from "../components/common/AddressDisplay";
import { CloseTokenModal } from "../components/tools/CloseTokenModal";
import { UpdateMetadataModal } from "../components/tools/UpdateMetadataModal";
import { Pagination } from "../components/common/Pagination";
import { PAGE_SIZE_OPTIONS } from "../config/constants";
import { useNavigate } from "react-router-dom";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useDeviceType } from "../utils/contexts";
import { MyDeploymentCard } from "../components/tools/MyDeploymentCard";

export type MyDeploymentsProps = {
    expanded: boolean;
};

export const MyDeployments: React.FC<MyDeploymentsProps> = ({ expanded }) => {
    const [metadataLoading, setLoadingMetadata] = useState(false);
    const [tokenMetadataMap, setTokenMetadataMap] = useState<Record<string, InitiazlizedTokenData>>({});
    const [selectedToken, setSelectedToken] = useState<InitiazlizedTokenData | null>(null);
    const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    
    const { connection } = useConnection();
    const wallet = useAnchorWallet();
    const navigate = useNavigate();
    const { isMobile } = useDeviceType();

    const { loading: initialLoading, error: initialError, data: initialData } = useQuery(queryMyDeployments, {
        variables: {
            wallet: wallet?.publicKey.toBase58(),
            skip: (currentPage - 1) * pageSize,
            first: pageSize,
        },
        skip: !wallet,
        onCompleted: (data) => {
            setTotalCount(Math.max(totalCount, (currentPage - 1) * pageSize + (data.initializeTokenEventEntities?.length ?? 0)));
        }
    });

    useEffect(() => {
        if (initialData?.initializeTokenEventEntities) {
            setLoadingMetadata(true);
            fetchTokenMetadataMap(initialData.initializeTokenEventEntities).then((updatedMap) => {
                setLoadingMetadata(false);
                setTokenMetadataMap(updatedMap);
            });
        }
    }, [initialData]);

    const handleClick = (mint: string) => {
        navigate(`/token/${mint}`);
    };

    const loading = initialLoading || metadataLoading;

    return (
        <div className={`flex flex-col items-center ${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
            <div className="w-full md:max-w-6xl mb:px-4 mb-3 md:mb-20">
                <h2 className="card-title mb-4">My Deployments</h2>
                {loading ? (
                    <div className="flex justify-center">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                ) : initialError ? (
                    <div className="w-full">
                        <ErrorBox title={`Error loading tokens. Please try again later.`} message={initialError.message}/>
                    </div>
                ) : initialData?.initializeTokenEventEntities?.length > 0 ? (
                    !isMobile ? (<div>
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
                            <table className="pixel-table w-full">
                                <thead>
                                    <tr>
                                        <th className="text-center"></th>
                                        <th className="text-left">Symbol & Name</th>
                                        <th className="text-left">Mint Address</th>
                                        <th className="text-right">Supply</th>
                                        <th className="text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {initialData.initializeTokenEventEntities.map((token: InitiazlizedTokenData) => (
                                        <tr key={token.id} className="hover">
                                            <td className="text-center cursor-pointer" onClick={() => handleClick(token.mint)}>
                                                <div className="">
                                                    <TokenImage 
                                                        imageUrl={tokenMetadataMap[token.mint]?.tokenMetadata?.image || ''}
                                                        name={token.tokenName}
                                                        launchTimestamp={Number(token.metadataTimestamp)}
                                                        size={48}
                                                        className="w-12 h-12"
                                                    />
                                                </div>
                                            </td>
                                            <td className="text-left cursor-pointer" onClick={() => handleClick(token.mint)}>
                                                <div className="font-bold">{token.tokenSymbol}</div>
                                                <div className="text-sm opacity-50">{token.tokenName}</div>
                                            </td>
                                            <td className="text-left">
                                                <AddressDisplay address={token.mint} />
                                            </td>
                                            <td className="text-right">
                                                {(Number(token.supply) / LAMPORTS_PER_SOL).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="text-center">
                                                <div className="flex gap-2 justify-end">
                                                    {token.supply === "0" && (
                                                        <button 
                                                            className="btn btn-sm btn-error"
                                                            onClick={() => {
                                                                setSelectedToken(token);
                                                                setIsCloseModalOpen(true);
                                                            }}
                                                        >
                                                            Close Mint
                                                        </button>
                                                    )}
                                                    <button 
                                                        className="btn btn-sm btn-primary"
                                                        onClick={() => {
                                                            setSelectedToken(token);
                                                            setIsUpdateModalOpen(true);
                                                        }}
                                                    >
                                                        Update Metadata
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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
                    </div>) : (
                    <div>
                        {initialData.initializeTokenEventEntities.map((token: InitiazlizedTokenData) => 
                            <MyDeploymentCard
                                key={token.id}
                                token={token}
                                metadata={tokenMetadataMap[token.mint as string]?.tokenMetadata}
                                setIsUpdateModalOpen={setIsUpdateModalOpen}
                                setIsCloseModalOpen={setIsCloseModalOpen}
                                setSelectedToken={setSelectedToken}
                            />)}
                    </div>
                    )
                ) : (
                    <div className="text-center py-10">
                        <p className="text-gray-500">No deployments found</p>
                    </div>
                )}
                <CloseTokenModal
                    isOpen={isCloseModalOpen}
                    onClose={() => {
                        setIsCloseModalOpen(false);
                        setSelectedToken(null);
                    }}
                    token={selectedToken}
                />
                <UpdateMetadataModal
                    isOpen={isUpdateModalOpen}
                    onClose={() => {
                        setIsUpdateModalOpen(false);
                        setSelectedToken(null);
                    }}
                    token={tokenMetadataMap[selectedToken?.mint as string]}
                />
            </div>
        </div>
    );
};