import React from 'react';
import { InitiazlizedTokenData } from '../../types/types';

interface TokenChartsProps {
    token: InitiazlizedTokenData;
}

export const TokenCharts: React.FC<TokenChartsProps> = ({ token }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Supply Chart */}
            <div className="bg-base-200 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-base-content">Supply Distribution</h2>
                <div className="h-64 flex items-center justify-center text-base-content">
                    Chart Coming Soon
                </div>
            </div>

            {/* Price Chart */}
            <div className="bg-base-200 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-base-content">Price History</h2>
                <div className="h-64 flex items-center justify-center text-base-content">
                    Chart Coming Soon
                </div>
            </div>

            {/* Volume Chart */}
            <div className="bg-base-200 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-base-content">Trading Volume</h2>
                <div className="h-64 flex items-center justify-center text-base-content">
                    Chart Coming Soon
                </div>
            </div>

            {/* Liquidity Chart */}
            <div className="bg-base-200 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-base-content">Liquidity</h2>
                <div className="h-64 flex items-center justify-center text-base-content">
                    Chart Coming Soon
                </div>
            </div>
        </div>
    );
};
