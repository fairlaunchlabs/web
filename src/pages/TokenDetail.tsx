import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { queryInitializeTokenEventBySearch } from '../utils/graphql';
import { InitiazlizedTokenData } from '../types/types';
import { TokenInfo } from '../components/tokenDetails/TokenInfo';
import { TokenCharts } from '../components/tokenDetails/TokenCharts';
import { TokenTransactions } from '../components/tokenDetails/TokenTransactions';
import { TokenHolders } from '../components/tokenDetails/TokenHolders';

type TokenDetailProps = {
    expanded: boolean;
};

export const TokenDetail: React.FC<TokenDetailProps> = ({ expanded }) => {
    const { tokenMintAddress } = useParams();
    const { loading, error, data } = useQuery(queryInitializeTokenEventBySearch, {
        variables: {
            skip: 0,
            first: 1,
            searchQuery: tokenMintAddress
        },
        fetchPolicy: 'network-only'
    });

    if (loading) {
        return (
            <div className={`container mx-auto py-8 ${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
                <div className="max-w-6xl mx-auto">
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
            <div className={`container mx-auto py-8 ${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
                <div className="max-w-6xl mx-auto">
                    <div className="bg-red-50 border-l-4 border-red-500 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Error loading token details</h3>
                                <div className="mt-2 text-sm text-red-700">
                                    {error.message}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const token = data?.initializeTokenEventEntities?.[0];

    if (!token) {
        return (
            <div className={`container mx-auto py-8 ${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
                <div className="max-w-6xl mx-auto">
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

    return (
        <div className={`container mx-auto py-8 mb-20 ${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
            <div className="max-w-6xl mx-auto space-y-6">
                <TokenInfo token={token as InitiazlizedTokenData} />
                <TokenCharts token={token as InitiazlizedTokenData} />
                <TokenHolders token={token as InitiazlizedTokenData} />
                <TokenTransactions token={token as InitiazlizedTokenData} />
            </div>
        </div>
    );
};
