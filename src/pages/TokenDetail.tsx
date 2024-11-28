import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { queryInitializeTokenEventBySearch } from '../utils/graphql';
import { InitiazlizedTokenData } from '../types/types';

type TokenDetailProps = {
    expanded: boolean;
};

export const TokenDetail: React.FC<TokenDetailProps> = ({ expanded }) => {
    const { tokenMintAddress } = useParams<{ tokenMintAddress: string }>();

    const { loading, error, data } = useQuery(queryInitializeTokenEventBySearch, {
        variables: {
            skip: 0,
            first: 10,
            searchQuery: tokenMintAddress
        },
        fetchPolicy: 'network-only'
    });

    if (loading) {
        return (
            <div className={`flex justify-center items-center min-h-[200px] ${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`alert alert-error m-4 ${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Error loading token details. Please try again later.</span>
            </div>
        );
    }

    const token = data?.initializeTokenEventEntities[0];

    if (!token) {
        return (
            <div className={`alert alert-warning m-4 ${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Token not found.</span>
            </div>
        );
    }

    return (
        <div className={`container mx-auto py-8 ${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
            <div className="max-w-6xl mx-auto">
                {JSON.stringify(token, null, 2) || token}
            </div>
        </div>
    );
};
