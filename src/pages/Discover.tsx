import React, { useState, KeyboardEvent, useEffect, useMemo } from 'react';
import { useQuery, useLazyQuery } from '@apollo/client';
import { queryInitializeTokenEvent, queryInitializeTokenEventBySearch, queryHotInitializeTokenEvent } from '../utils/graphql';
import { InitiazlizedTokenData, MintTokensProps } from '../types/types';
import { FaSearch } from 'react-icons/fa';
import { ErrorBox } from '../components/common/ErrorBox';
import { filterTokens, formatAddress } from '../utils/format';
import { BADGE_BG_COLORS, BADGE_TEXT_COLORS, SEARCH_CACHE_ITEMS } from '../config/constants';
import { TokenCardMobile } from '../components/mintTokens/TokenCardMobile';
import { PageHeader } from '../components/common/PageHeader';
import { useDeviceType } from '../utils/contexts';
import { ScrollCards } from '../components/common/ScrollCards';
import { TokenCardSimple } from '../components/mintTokens/TokenCardSimple';

export const Discover: React.FC<MintTokensProps> = ({
  expanded
}) => {
  const [searchInput, setSearchInput] = useState('');
  // const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const { isMobile } = useDeviceType();

  // Load search history on component mount
  useEffect(() => {
    const history = localStorage.getItem('search_history');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  // Save search term to history
  const saveToHistory = (term: string) => {
    const newHistory = [term, ...searchHistory.filter(item => item !== term)].slice(0, SEARCH_CACHE_ITEMS);
    setSearchHistory(newHistory);
    localStorage.setItem('search_history', JSON.stringify(newHistory));
  };

  // 初始加载数据
  const { loading: initialLoading, error: initialError, data: latestData } = useQuery(queryInitializeTokenEvent, {
    variables: {
      orderBy: 'timestamp',
    }
  });

  const { loading: hotLoading, error: hotError, data: hotData } = useQuery(queryHotInitializeTokenEvent, {
    variables: {
      orderBy: 'difficultyCoefficientEpoch',
    }
  });

  const filteredHotTokens = useMemo(() => {
    if (!hotData?.initializeTokenEventEntities) return [];
    const result = filterTokens(hotData.initializeTokenEventEntities as InitiazlizedTokenData[])
      .filter((token: InitiazlizedTokenData) =>
        token.currentEra <= token.targetEras
      )
      .sort((a: InitiazlizedTokenData, b: InitiazlizedTokenData) =>
        Number(b.difficultyCoefficientEpoch) - Number(a.difficultyCoefficientEpoch)
      )
      .slice(0, 10);
    return result;
  }, [hotData]);

  // 搜索查询
  const [searchTokens, { loading: searchLoading, error: searchError, data: searchData }] = useLazyQuery(queryInitializeTokenEventBySearch, {
    fetchPolicy: 'network-only' // 确保每次都从网络获取最新数据
  });

  const handleSearch = () => {
    if (searchInput.trim()) {
      // setIsSearchMode(true);
      saveToHistory(searchInput.trim());
      searchTokens({
        variables: {
          skip: 0,
          first: 50,
          searchQuery: searchInput.trim()
        }
      });
    }
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleHistoryClick = (term: string) => {
    setSearchInput(term);
    // setIsSearchMode(true);
    saveToHistory(term);
    searchTokens({
      variables: {
        skip: 0,
        first: 50,
        searchQuery: term
      }
    });
  };

  // Get the display data based on search mode
  const displayData = {
    initializeTokenEventEntities: filterTokens(searchData?.initializeTokenEventEntities || []),
  };

  const latestDisplayData = {
    initializeTokenEventEntities: filterTokens(latestData?.initializeTokenEventEntities || []),
  };

  // 合并错误和加载状态
  const loading = searchLoading || initialLoading || hotLoading;
  const error = searchError || initialError || hotError;

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
        <ErrorBox title={`Error loading tokens. Please try again later.`} message={error.message} />
      </div>
    );
  }

  return (
    <div className={`space-y-0 md:p-4 md:mb-20 ${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
      {/* Search Bar */}
      <PageHeader title="Discover" bgImage='/bg/group1/1.jpg' />
      <div className="md:max-w-6xl mx-auto mb-3 md:mb-12">
        <div className="join w-full mb-2">
          <div className="relative join-item flex-1">
            <input
              type="text"
              placeholder="Search by token name, symbol, or address..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className='input search-input w-full pl-10'
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

        {/* Search History */}
        {searchHistory.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {searchHistory.map((term, index) => {
              const colorIndex = index % BADGE_BG_COLORS.length;
              return <button
                key={index}
                onClick={() => handleHistoryClick(term)}
                className={`badge`}
                style={{
                  backgroundColor: BADGE_BG_COLORS[colorIndex],
                  color: BADGE_TEXT_COLORS[colorIndex]
                }}
              >
                {term.length > 40 ? formatAddress(term, 6) : term}
              </button>
            })}
          </div>
        )}

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayData.initializeTokenEventEntities.map((token: InitiazlizedTokenData) =>
            <TokenCardMobile key={token.tokenId} token={token} />
          )}
        </div>

        {/* No Results Message */}
        {/* {displayData.initializeTokenEventEntities.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No search results found
                    </div>
                )} */}

        {/* Latest Tokens */}

        {latestDisplayData.initializeTokenEventEntities.length > 0 && (
          <div className={`${isMobile && "bg-base-200 -ml-4 -mr-4 pb-4"}`}>
            <h2 className="text-xl mt-6 ml-4 pt-1">Latest Tokens</h2>
            {isMobile ? (
              <ScrollCards tokens={latestDisplayData.initializeTokenEventEntities} />
            ) : (
              <div className="grid grid-cols-3 gap-4 p-1">
                {latestDisplayData.initializeTokenEventEntities.map((token: InitiazlizedTokenData) =>
                  <TokenCardMobile key={token.tokenId} token={token} />
                )}
              </div>
            )}
          </div>
        )}

        {/* Hottest Tokens */}
        {filteredHotTokens.length > 0 && (
          <>
            <h2 className="text-xl mt-6">Hottest Tokens</h2>
            {isMobile ? (
              <div className="grid grid-cols-2 gap-4 p-1">
                {filteredHotTokens.map((token: InitiazlizedTokenData, index: number) =>
                  <TokenCardSimple key={token.tokenId} token={token} number={index + 1} type="static" />
                )}
              </div>

            ) : (
              <div className="grid grid-cols-3 gap-4 p-1">
                {filteredHotTokens.map((token: InitiazlizedTokenData, index: number) =>
                  <TokenCardMobile key={token.tokenId} token={token} number={index + 1} type="static" />
                )}
              </div>
            )}
          </>
        )}

      </div>

    </div>
  );
};
