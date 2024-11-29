import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { queryTokenTransactions } from '../../utils/graphql';
import { AddressDisplay } from '../common/AddressDisplay';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { InitiazlizedTokenData } from '../../types/types';
import { Pagination } from '../common/Pagination';

interface TokenTransactionsProps {
    token: InitiazlizedTokenData;
}

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export const TokenTransactions: React.FC<TokenTransactionsProps> = ({ token }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    const { data, loading, error } = useQuery(queryTokenTransactions, {
        variables: {
            mint: token.mint,
            skip: (currentPage - 1) * pageSize,
            first: pageSize
        },
        onCompleted: (data) => {
            // Note: This is a temporary solution. In production, you should get the total count from the API
            setTotalCount(Math.max(totalCount, (currentPage - 1) * pageSize + data.mintTokenEntities.length));
        }
    });

    const totalPages = Math.ceil(totalCount / pageSize);

    const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newPageSize = Number(event.target.value);
        setPageSize(newPageSize);
        setCurrentPage(1); // Reset to first page when changing page size
    };

    if (loading && currentPage === 1) {
        return (
            <div className="bg-base-200 rounded-lg shadow-lg p-6 mt-6">
                <h3 className="text-xl font-semibold mb-4 text-base-content">Recent Transactions</h3>
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
                <h3 className="text-xl font-semibold mb-4 text-base-content">Recent Transactions</h3>
                <p className="text-error">Error loading transactions</p>
            </div>
        );
    }

    return (
        <div className="bg-base-200 rounded-lg shadow-lg p-6 mt-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-base-content">Recent Transactions</h3>
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
                            <th>Minter</th>
                            <th>Transaction</th>
                            <th>Time</th>
                            <th>Era (Epoch)</th>
                            <th>Mint Size</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.mintTokenEntities.map((tx: any) => (
                            <tr key={tx.txId}>
                                <td><AddressDisplay address={tx.sender} /></td>
                                <td><AddressDisplay address={tx.txId} type="tx" /></td>
                                <td>{new Date(Number(tx.timestamp) * 1000).toLocaleString()}</td>
                                <td>{tx.currentEra} ({tx.currentEpoch})</td>
                                <td>{(Number(tx.mintSizeEpoch) / LAMPORTS_PER_SOL).toLocaleString(undefined, { maximumFractionDigits: 2 })} {token.tokenSymbol}</td>
                            </tr>
                        ))}
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
