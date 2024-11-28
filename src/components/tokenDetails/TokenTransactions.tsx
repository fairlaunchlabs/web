import React from 'react';
import { InitiazlizedTokenData } from '../../types/types';
import { AddressDisplay } from '../common/AddressDisplay';

interface TokenTransactionsProps {
    token: InitiazlizedTokenData;
}

export const TokenTransactions: React.FC<TokenTransactionsProps> = ({ token }) => {
    // 模拟交易数据，后续替换为真实数据
    const transactions = [
        {
            id: '1',
            type: 'Mint',
            amount: '1000',
            from: 'System',
            to: token.mint,
            timestamp: new Date().toISOString(),
        },
        // 添加更多模拟数据...
    ];

    return (
        <div className="bg-base-200 rounded-lg shadow-lg p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4 text-base-content">Recent Transactions</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-base-content/10">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 bg-base-200 text-left text-xs font-medium text-base-content uppercase tracking-wider">
                                Type
                            </th>
                            <th className="px-6 py-3 bg-base-200 text-left text-xs font-medium text-base-content uppercase tracking-wider">
                                Amount
                            </th>
                            <th className="px-6 py-3 bg-base-200 text-left text-xs font-medium text-base-content uppercase tracking-wider">
                                From
                            </th>
                            <th className="px-6 py-3 bg-base-200 text-left text-xs font-medium text-base-content uppercase tracking-wider">
                                To
                            </th>
                            <th className="px-6 py-3 bg-base-200 text-left text-xs font-medium text-base-content uppercase tracking-wider">
                                Time
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-base-200 divide-y divide-base-content/10">
                        {transactions.map((tx) => (
                            <tr key={tx.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-base-content">
                                    {tx.type}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-base-content">
                                    {tx.amount} {token.tokenSymbol}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-base-content">
                                    <AddressDisplay address={tx.from} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-base-content">
                                    <AddressDisplay address={tx.to} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-base-content/70">
                                    {new Date(tx.timestamp).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
