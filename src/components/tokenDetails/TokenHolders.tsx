import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { InitiazlizedTokenData } from '../../types/types';
import { AddressDisplay } from '../common/AddressDisplay';
import { Pagination } from '../common/Pagination';
import { queryHolders } from '../../utils/graphql';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

interface TokenHoldersProps {
    token: InitiazlizedTokenData;
}

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export const TokenHolders: React.FC<TokenHoldersProps> = ({ token }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    const { data, loading, error } = useQuery(queryHolders, {
        variables: {
            mint: token.mint,
            skip: (currentPage - 1) * pageSize,
            first: pageSize
        },
        onCompleted: (data) => {
            // Note: This is a temporary solution. In production, you should get the total count from the API
            setTotalCount(Math.max(totalCount, (currentPage - 1) * pageSize + data.tokenAccountEntities.length));
        }
    });

    const totalPages = Math.ceil(totalCount / pageSize);

    const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newPageSize = Number(event.target.value);
        setPageSize(newPageSize);
        setCurrentPage(1);
    };

    if (loading && currentPage === 1) {
        return (
            <div className="bg-base-200 rounded-lg shadow-lg p-6 mt-6">
                <h3 className="text-xl font-semibold mb-4 text-base-content">Token Holders</h3>
                <div className="animate-pulse">
                    <div className="h-8 bg-base-300 rounded mb-4"></div>
                    <div className="h-8 bg-base-300 rounded mb-4"></div>
                    <div className="h-8 bg-base-300 rounded mb-4"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-base-200 rounded-lg shadow-lg p-6 mt-6">
                <h3 className="text-xl font-semibold mb-4 text-base-content">Token Holders</h3>
                <p className="text-error">Error loading token holders</p>
            </div>
        );
    }

    const totalSupply = Number(token.supply) / LAMPORTS_PER_SOL;

    return (
        <div className="bg-base-200 rounded-lg shadow-lg p-6 mt-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-base-content">Token Holders</h3>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-base-content">Rows per page:</span>
                    <select 
                        className="select select-bordered select-sm" 
                        value={pageSize}
                        onChange={handlePageSizeChange}
                    >
                        {PAGE_SIZE_OPTIONS.map(size => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="table w-full">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Holder</th>
                            <th>Balance</th>
                            <th>Percentage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.holdersEntities.map((holder: any, index: number) => {
                            const balance = Number(holder.amount) / LAMPORTS_PER_SOL;
                            const percentage = (balance / totalSupply * 100).toFixed(2);
                            return (
                                <tr key={holder.owner + index}>
                                    <td>{(currentPage - 1) * pageSize + index + 1}</td>
                                    <td><AddressDisplay address={holder.owner} /></td>
                                    <td>{balance.toLocaleString()} {token.tokenSymbol}</td>
                                    <td>{percentage}%</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            
            <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
            />
        </div>
    );
};
