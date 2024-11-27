import React from 'react';
import { useQuery } from '@apollo/client';
import { queryInitializeTokenEvent } from '../utils/graphql';
import { TokenCard } from '../components/mintTokens/TokenCard';
import { InitiazlizedTokenData } from '../types/types';

type MintTokensProps = {
    expanded: boolean;
};

export const MintTokens: React.FC<MintTokensProps> = ({
    expanded
}) => {
    const { loading, error, data } = useQuery(queryInitializeTokenEvent, {
        variables: {
            skip: 0,
            first: 10
        }
    });

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
        <div className={`${expanded ? 'md:ml-64' : 'md:ml-20'} md:px-8 md:py-8 pl-5 pr-4 py-8`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {data?.initializeTokenEventEntities.map((token: InitiazlizedTokenData) => (
                    <TokenCard key={token.tokenId} token={token} />
                ))}
            </div>
        </div>
    );
};
