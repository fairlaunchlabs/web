import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { queryTokenMintTransactions } from '../../utils/graphql';
import { AddressDisplay } from '../common/AddressDisplay';
import { MintTransactionData, TokenMintTransactionsProps } from '../../types/types';
import { Pagination } from '../common/Pagination';
import { BN_HUNDRED, BN_LAMPORTS_PER_SOL, numberStringToBN } from '../../utils/format';
import { PAGE_SIZE_OPTIONS } from '../../config/constants';
import { ErrorBox } from '../common/ErrorBox';

export const TokenMintTransactions: React.FC<TokenMintTransactionsProps> = ({ token }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    const { data, loading, error } = useQuery(queryTokenMintTransactions, {
        variables: {
            mint: token.mint,
            skip: (currentPage - 1) * pageSize,
            first: pageSize
        },
        onCompleted: (data) => {
            setTotalCount(Math.max(totalCount, (currentPage - 1) * pageSize + (data.mintTokenEntities?.length ?? 0)));
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
                <h3 className="text-xl font-semibold mb-4 text-base-content">Recent Mint</h3>
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
                <ErrorBox title="Get recent mint error" message={error.message} />
            </div>
        );
    }

    return (
        <div className="bg-base-200 rounded-lg shadow-lg p-6 mt-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-base-content">Recent Mint</h3>
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
                        {data?.mintTokenEntities.map((tx: MintTransactionData) => (
                            <tr key={tx.txId}>
                                <td><AddressDisplay address={tx.sender} /></td>
                                <td><AddressDisplay address={tx.txId} type="tx" /></td>
                                <td>{new Date(Number(tx.timestamp) * 1000).toLocaleString()}</td>
                                <td>{tx.currentEra} ({tx.currentEpoch})</td>
                                <td>{(numberStringToBN(tx.mintSizeEpoch).mul(BN_HUNDRED).div(BN_LAMPORTS_PER_SOL).toNumber() / 100).toLocaleString(undefined, { maximumFractionDigits: 2 })} {token.tokenSymbol}</td>
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
