import React from 'react';

interface AdvancedSettingsProps {
    targetEras: string;
    epochesPerEra: string;
    targetSecondsPerEpoch: string;
    reduceRatio: string;
    displayInitialMintSize: string;
    displayInitialTargetMintSizePerEpoch: string;
    displayFeeRate: string;
    liquidityTokensRatio: string;
    onTargetErasChange: (value: string) => void;
    onEpochesPerEraChange: (value: string) => void;
    onTargetSecondsPerEpochChange: (value: string) => void;
    onReduceRatioChange: (value: string) => void;
    onDisplayInitialMintSizeChange: (value: string, mintSize: string) => void;
    onDisplayInitialTargetMintSizePerEpochChange: (value: string, targetMintSize: string) => void;
    onDisplayFeeRateChange: (value: string, feeRate: string) => void;
    onLiquidityTokensRatioChange: (value: string) => void;
}

export const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({
    targetEras,
    epochesPerEra,
    targetSecondsPerEpoch,
    reduceRatio,
    displayInitialMintSize,
    displayInitialTargetMintSizePerEpoch,
    displayFeeRate,
    liquidityTokensRatio,
    onTargetErasChange,
    onEpochesPerEraChange,
    onTargetSecondsPerEpochChange,
    onReduceRatioChange,
    onDisplayInitialMintSizeChange,
    onDisplayInitialTargetMintSizePerEpochChange,
    onDisplayFeeRateChange,
    onLiquidityTokensRatioChange,
}) => {
    return (
        <div className="space-y-6 mt-4">
            <div>
                <label htmlFor="targetEras" className="block text-sm font-medium mb-1">
                    Target Eras
                </label>
                <input
                    type="text"
                    id="targetEras"
                    value={targetEras}
                    onChange={(e) => onTargetErasChange(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter target eras"
                />
            </div>

            <div>
                <label htmlFor="epochesPerEra" className="block text-sm font-medium mb-1">
                    Epoches Per Era
                </label>
                <input
                    type="text"
                    id="epochesPerEra"
                    value={epochesPerEra}
                    onChange={(e) => onEpochesPerEraChange(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter epochs per era"
                />
            </div>

            <div>
                <label htmlFor="targetSecondsPerEpoch" className="block text-sm font-medium mb-1">
                    Target Seconds Per Epoch
                </label>
                <input
                    type="text"
                    id="targetSecondsPerEpoch"
                    value={targetSecondsPerEpoch}
                    onChange={(e) => onTargetSecondsPerEpochChange(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter target seconds"
                />
            </div>

            <div>
                <label htmlFor="reduceRatio" className="block text-sm font-medium mb-1">
                    Reduce Ratio
                </label>
                <input
                    type="text"
                    id="reduceRatio"
                    value={reduceRatio}
                    onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        const num = parseInt(value);
                        if (!isNaN(num) && num <= 100) {
                            onReduceRatioChange(value);
                        }
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter reduce ratio (0-100)"
                />
            </div>

            <div>
                <label htmlFor="initialMintSize" className="block text-sm font-medium mb-1">
                    Initial Mint Size
                </label>
                <input
                    type="text"
                    id="initialMintSize"
                    value={displayInitialMintSize}
                    onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.]/g, '');
                        const mintSize = (parseFloat(value) * 1000000000).toString();
                        onDisplayInitialMintSizeChange(value, mintSize);
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter initial mint size"
                />
            </div>

            <div>
                <label htmlFor="initialTargetMintSizePerEpoch" className="block text-sm font-medium mb-1">
                    Initial Target Mint Size Per Epoch
                </label>
                <input
                    type="text"
                    id="initialTargetMintSizePerEpoch"
                    value={displayInitialTargetMintSizePerEpoch}
                    onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.]/g, '');
                        const targetMintSize = (parseFloat(value) * 1000000000).toString();
                        onDisplayInitialTargetMintSizePerEpochChange(value, targetMintSize);
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter target mint size per epoch"
                />
            </div>

            <div>
                <label htmlFor="feeRate" className="block text-sm font-medium mb-1">
                    Fee Rate(SOL)
                </label>
                <input
                    type="text"
                    id="feeRate"
                    value={displayFeeRate}
                    onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.]/g, '');
                        const feeRate = (parseFloat(value) * 1000000000).toString();
                        onDisplayFeeRateChange(value, feeRate);
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter fee rate"
                />
            </div>

            <div>
                <label htmlFor="liquidityTokensRatio" className="block text-sm font-medium mb-1">
                    Liquidity Tokens Ratio(%)
                </label>
                <input
                    type="text"
                    id="liquidityTokensRatio"
                    value={liquidityTokensRatio}
                    onChange={(e) => onLiquidityTokensRatioChange(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter liquidity tokens ratio"
                />
            </div>
        </div>
    );
};
