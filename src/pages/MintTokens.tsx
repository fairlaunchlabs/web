import React, { useState, KeyboardEvent } from 'react';
import { useQuery, useLazyQuery } from '@apollo/client';
import { queryInitializeTokenEvent, queryInitializeTokenEventBySearch } from '../utils/graphql';
import { TokenCard } from '../components/mintTokens/TokenCard';
import { InitiazlizedTokenData, MintTokensProps } from '../types/types';
import { FaSearch } from 'react-icons/fa';

export const MintTokens: React.FC<MintTokensProps> = ({
    expanded
}) => {
    const [searchInput, setSearchInput] = useState('');
    const [isSearchMode, setIsSearchMode] = useState(false);
    
    // 初始加载数据
    const { loading: initialLoading, error: initialError, data: initialData } = useQuery(queryInitializeTokenEvent, {
        variables: {
            skip: 0,
            first: 12
        }
    });

    // 搜索查询
    const [searchTokens, { loading: searchLoading, error: searchError, data: searchData }] = useLazyQuery(queryInitializeTokenEventBySearch, {
        fetchPolicy: 'network-only' // 确保每次都从网络获取最新数据
    });

    const handleSearch = () => {
        if (searchInput.trim()) {
            setIsSearchMode(true);
            searchTokens({
                variables: {
                    skip: 0,
                    first: 12,
                    searchQuery: searchInput.trim()
                }
            });
        } else {
            // 如果搜索框为空，退出搜索模式，显示初始数据
            setIsSearchMode(false);
        }
    };

    const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    // 合并错误和加载状态
    const loading = initialLoading || searchLoading;
    const error = initialError || searchError;
    // 使用搜索结果或初始数据
    const displayData = isSearchMode ? searchData : initialData;

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[200px] ml-64">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-error ml-64 m-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>Error loading tokens. Please try again later.</span>
            </div>
        );
    }

    return (
        <div className={`${expanded ? 'md:ml-64' : 'md:ml-20'} md:px-8 md:py-6 pl-5 pr-4 py-6`}>
            {/* Search Bar */}
            <div className="mb-12">
                <div className="join w-full">
                    <div className="relative join-item flex-1">
                        <input
                            type="text"
                            placeholder="Search by token name, symbol, or address..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="input input-bordered w-full pl-10 focus:outline-none focus:border-primary focus:border-2 rounded-r-none"
                        />
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    <button 
                        className="btn join-item btn-primary"
                        onClick={handleSearch}
                        disabled={loading}
                    >
                        {loading ? <span className="loading loading-spinner loading-sm"></span> : 'Search'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {displayData?.initializeTokenEventEntities.map((token: InitiazlizedTokenData) => (
                    <TokenCard key={token.tokenId} token={token} />
                ))}
            </div>

            {/* No Results Message */}
            {displayData?.initializeTokenEventEntities.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No tokens found
                </div>
            )}
        </div>
    );
};
