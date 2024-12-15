import React, { useState, KeyboardEvent, useEffect } from 'react';
import { useQuery, useLazyQuery } from '@apollo/client';
import { queryInitializeTokenEvent, queryInitializeTokenEventBySearch } from '../utils/graphql';
import { TokenCard } from '../components/mintTokens/TokenCard';
import { InitiazlizedTokenData, MintTokensProps } from '../types/types';
import { FaSearch } from 'react-icons/fa';
import { ErrorBox } from '../components/common/ErrorBox';

export const MintTokens: React.FC<MintTokensProps> = ({
    expanded
}) => {
    const [searchInput, setSearchInput] = useState('');
    const [isSearchMode, setIsSearchMode] = useState(false);
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    
    // Load search history on component mount
    useEffect(() => {
        const history = localStorage.getItem('search_history');
        if (history) {
            setSearchHistory(JSON.parse(history));
        }
    }, []);

    // Save search term to history
    const saveToHistory = (term: string) => {
        const newHistory = [term, ...searchHistory.filter(item => item !== term)].slice(0, 5);
        setSearchHistory(newHistory);
        localStorage.setItem('search_history', JSON.stringify(newHistory));
    };

    // 初始加载数据
    // const { loading: initialLoading, error: initialError, data: initialData } = useQuery(queryInitializeTokenEvent, {
    //     variables: {
    //         skip: 0,
    //         first: 5
    //     }
    // });

    // 搜索查询
    const [searchTokens, { loading: searchLoading, error: searchError, data: searchData }] = useLazyQuery(queryInitializeTokenEventBySearch, {
        fetchPolicy: 'network-only' // 确保每次都从网络获取最新数据
    });

    const handleSearch = () => {
        if (searchInput.trim()) {
            setIsSearchMode(true);
            saveToHistory(searchInput.trim());
            searchTokens({
                variables: {
                    skip: 0,
                    first: 50,
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

    const handleHistoryClick = (term: string) => {
        setSearchInput(term);
        setIsSearchMode(true);
        saveToHistory(term);
        searchTokens({
            variables: {
                skip: 0,
                first: 50,
                searchQuery: term
            }
        });
    };

    // 合并错误和加载状态
    const loading = searchLoading;
    const error = searchError;
    // 使用搜索结果或初始数据
    const displayData = isSearchMode ? searchData : null;

    if (loading) {
        return (
            <div className={`flex justify-center items-center min-h-[200px] ${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
                <ErrorBox title={`Error loading tokens. Please try again later.`} message={error.message}/>
            </div>
        );
    }

    return (
        <div className={`${expanded ? 'md:ml-64' : 'md:ml-20'} md:px-8 md:py-6 pl-5 pr-4 py-6 mb-20`}>
            {/* Search Bar */}
            <div className="max-w-6xl mx-auto mb-12">
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
                
                {/* Search History */}
                {searchHistory.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {searchHistory.map((term, index) => (
                            <button
                                key={index}
                                onClick={() => handleHistoryClick(term)}
                                className="btn btn-sm btn-ghost text-sm hover:bg-base-200 hover:text-focus text-gray-500 transition-colors"
                            >
                                {term}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Token Cards // ###### TODO */}
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
