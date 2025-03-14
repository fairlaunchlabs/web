import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { queryInitializeTokenEventBySearch } from '../utils/graphql';
import { InitiazlizedTokenData, TokenDetailProps, OrderedToken, UserAPIResponse } from '../types/types';
import { TokenInfo } from '../components/tokenDetails/TokenInfo';
import { useAuth } from '../utils/contexts';
import { TokenCharts } from '../components/tokenDetails/TokenCharts';
import { TokenMintTransactions } from '../components/tokenDetails/TokenMintTransactions';
import { TokenHolders } from '../components/tokenDetails/TokenHolders';
import { TokenRefundTransactions } from '../components/tokenDetails/TokenRefundTransactions';
import { ErrorBox } from '../components/common/ErrorBox'; import { useDeviceType } from '../utils/contexts';
import { SEARCH_CACHE_ITEMS } from '../config/constants';
import { useState } from 'react';
import { CommentBox } from '../components/social/CommentBox';
import { getTokenDataByMint } from '../utils/user';
import toast from 'react-hot-toast';

export const TokenDetail: React.FC<TokenDetailProps> = ({ expanded }) => {
  const { tokenMintAddress, referrerCode } = useParams();
  const [tokenData, setTokenData] = useState<OrderedToken | null>(null);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [mint, setMint] = useState<string | null>(null);
  const { token: userToken } = useAuth();

  const { loading, error, data } = useQuery(queryInitializeTokenEventBySearch, {
    variables: {
      skip: 0,
      first: 1,
      searchQuery: tokenMintAddress
    },
    fetchPolicy: 'network-only'
  });

  const { isMobile } = useDeviceType();

  const fetchTokenData = async () => {
    const result = await getTokenDataByMint(userToken as string, mint as string);
    if (result.success) {
      setTokenData(result.data);
    } else {
      setTokenData(null);
      toast.error(result.message as string);
    }
  }

  useEffect(() => {
    if (mint) fetchTokenData();
  }, [mint]);

  const saveToHistory = (term: string) => {
    const history = localStorage.getItem('search_history');
    if (history) {
      const historyArray = JSON.parse(history);
      const newHistory = [term, ...historyArray.filter((item: string) => item !== term)].slice(0, SEARCH_CACHE_ITEMS);
      localStorage.setItem('search_history', JSON.stringify(newHistory));
    }
  };

  useEffect(() => {
    if (data) {
      const _mint = (data?.initializeTokenEventEntities as InitiazlizedTokenData[])[0].mint;
      setMint(_mint);
      getTokenDataByMint(userToken as string, _mint).then((result: UserAPIResponse) => {
        if (result.success) {
          setTokenData(result.data);
        } else {
          setTokenData(null);
          toast.error(result.message as string);
        }
      })
    }
  }, [data])

  if (loading) {
    return (
      <div className={`container mx-auto py-8 ${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
        <div className="md:max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-base-200 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-64 bg-base-200 rounded"></div>
              <div className="h-64 bg-base-200 rounded"></div>
              <div className="h-64 bg-base-200 rounded"></div>
              <div className="h-64 bg-base-200 rounded"></div>
            </div>
            <div className="h-96 bg-base-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
        <ErrorBox title="Error loading token details" message={error.message} />
      </div>
    );
  }

  const token = data?.initializeTokenEventEntities?.[0];
  const hasStarted = !token.startTimestamp || Number(token.startTimestamp) <= Math.floor(Date.now() / 1000);

  if (!token) {
    return (
      <div className={`container mx-auto py-8 ${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
        <div className="md:max-w-6xl mx-auto">
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Token not found</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  No token found with address: {tokenMintAddress}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  saveToHistory((token as InitiazlizedTokenData).tokenSymbol as string);
  // if(!fetchedTokenData.current) fetchTokenData();

  return (
    <div className={`container mx-auto py-6 md:mb-20 ${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
      <div className="md:max-w-6xl mx-auto space-y-6">
        <TokenInfo 
          token={token as InitiazlizedTokenData} 
          referrerCode={referrerCode} 
          tokenData={tokenData} 
          fetchTokenData={fetchTokenData} 
          isCommentOpen={isCommentOpen} 
          setIsCommentOpen={setIsCommentOpen} 
        />
        {hasStarted && (
          <div>
            <TokenCharts token={token as InitiazlizedTokenData} height={isMobile ? 360 : 560} />
            <TokenHolders token={token as InitiazlizedTokenData} />
            <TokenMintTransactions token={token as InitiazlizedTokenData} />
            <TokenRefundTransactions token={token as InitiazlizedTokenData} />
          </div>
        )}
      </div>
      {/* Comments */}
      {isCommentOpen &&
        <div className="bg-white">
          <CommentBox
            setIsOpen={setIsCommentOpen}
            token={userToken as string}
            orderedData={tokenData as OrderedToken}
            type={'token'}
            expanded={expanded}
          />
        </div>}
    </div>
  );
};
