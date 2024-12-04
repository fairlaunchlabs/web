import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { HolderData, TokenHoldersProps } from '../../types/types';
import { AddressDisplay } from '../common/AddressDisplay';
import { Pagination } from '../common/Pagination';
import { queryHolders } from '../../utils/graphql';
import { BN_HUNDRED, BN_LAMPORTS_PER_SOL, BN_MILLION, BN_ZERO, numberStringToBN } from '../../utils/format';
import { PAGE_SIZE_OPTIONS } from '../../config/constants';

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
            setTotalCount(Math.max(totalCount, (currentPage - 1) * pageSize + (data.tokenAccountEntities?.length ?? 0)));
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
                        {data?.holdersEntities
                            .filter((holder: HolderData) => numberStringToBN(holder.amount).gt(BN_ZERO))
                            .map((holder: HolderData, index: number) => {
                            const totalSupply = numberStringToBN(token.supply).div(BN_LAMPORTS_PER_SOL);
                            const balance = numberStringToBN(holder.amount).div(BN_LAMPORTS_PER_SOL);
                            const percentage = balance.mul(BN_MILLION).div(totalSupply);
                            return (
                                <tr key={holder.owner + index}>
                                    <td>{(currentPage - 1) * pageSize + index + 1}</td>
                                    <td><AddressDisplay address={holder.owner} /></td>
                                    <td>{balance.toLocaleString()} {token.tokenSymbol}</td>
                                    <td>{(percentage.toNumber()/10000).toFixed(2)}%</td>
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
