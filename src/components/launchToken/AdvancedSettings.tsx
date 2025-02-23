import React from 'react';
import { AdvancedSettingsProps } from '../../types/types';
import AlertBox from '../common/AlertBox';

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
    <div className="space-y-4 md:space-y-6" >
      <div>
        <label htmlFor="targetEras" className="block text-sm font-medium mb-1">
          Target Milestones
        </label>
        <input
          type="text"
          id="targetEras"
          value={targetEras}
          onChange={(e) => onTargetErasChange(e.target.value.replace(/[^0-9]/g, ''))}
          // className={`w-full px-3 py-2 border-2 border-dashed rounded-lg hover:border-primary transition-colors focus:outline-none focus:border-primary focus:border-2 bg-base-100 ${targetEras ? 'border-base-content' : ''}`}
          className='input w-full'
          placeholder="Enter target milestones"
        />
      </div>

      <div>
        <label htmlFor="epochesPerEra" className="block text-sm font-medium mb-1">
          Checkpoints Per Milestone
        </label>
        <input
          type="text"
          id="epochesPerEra"
          value={epochesPerEra}
          onChange={(e) => onEpochesPerEraChange(e.target.value.replace(/[^0-9]/g, ''))}
          // className={`w-full px-3 py-2 border-2 border-dashed rounded-lg hover:border-primary transition-colors focus:outline-none focus:border-primary focus:border-2 bg-base-100 ${epochesPerEra ? 'border-base-content' : ''}`}
          className='input w-full'
          placeholder="Enter checkpoints per milestone"
        />
      </div>

      <div>
        <label htmlFor="targetSecondsPerEpoch" className="block text-sm font-medium mb-1">
          Target Seconds Per Checkpoint
        </label>
        <input
          type="text"
          id="targetSecondsPerEpoch"
          value={targetSecondsPerEpoch}
          onChange={(e) => onTargetSecondsPerEpochChange(e.target.value.replace(/[^0-9]/g, ''))}
          // className={`w-full px-3 py-2 border-2 border-dashed rounded-lg hover:border-primary transition-colors focus:outline-none focus:border-primary focus:border-2 bg-base-100 ${targetSecondsPerEpoch ? 'border-base-content' : ''}`}
          className='input w-full'
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
          // className={`w-full px-3 py-2 border-2 border-dashed rounded-lg hover:border-primary transition-colors focus:outline-none focus:border-primary focus:border-2 bg-base-100 ${reduceRatio ? 'border-base-content' : ''}`}
          className='input w-full'
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
          // className={`w-full px-3 py-2 border-2 border-dashed rounded-lg hover:border-primary transition-colors focus:outline-none focus:border-primary focus:border-2 bg-base-100 ${displayInitialMintSize ? 'border-base-content' : ''}`}
          className='input w-full'
          placeholder="Enter initial mint size"
        />
      </div>

      <div>
        <label htmlFor="initialTargetMintSizePerEpoch" className="block text-sm font-medium mb-1">
          Initial Target Mint Size Per Checkpoint
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
          // className={`w-full px-3 py-2 border-2 border-dashed rounded-lg hover:border-primary transition-colors focus:outline-none focus:border-primary focus:border-2 bg-base-100 ${displayInitialTargetMintSizePerEpoch ? 'border-base-content' : ''}`}
          className='input w-full'
          placeholder="Enter target mint size per checkpoint"
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
          // className={`w-full px-3 py-2 border-2 border-dashed rounded-lg hover:border-primary transition-colors focus:outline-none focus:border-primary focus:border-2 bg-base-100 ${displayFeeRate ? 'border-base-content' : ''}`}
          className='input w-full'
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
          // className={`w-full px-3 py-2 border-2 border-dashed rounded-lg hover:border-primary transition-colors focus:outline-none focus:border-primary focus:border-2 bg-base-100 ${liquidityTokensRatio ? 'border-base-content' : ''}`}
          className='input w-full'
          placeholder="Enter liquidity tokens ratio"
        />
      </div>

      <AlertBox
        title="Info"
        message="Default params are popular and suggested, if you want to customize params, 0.15 SOL will be charged"
      />
    </div>
  );
};
