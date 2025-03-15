import { FC, useMemo, useState } from "react";
import { InitiazlizedTokenData, TokenMetadataIPFS } from "../../types/types";
import { DataBlock } from "./TokenInfo";
import { tooltip } from "../../config/constants";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { BN_HUNDRED, BN_LAMPORTS_PER_SOL, calculateMaxSupply, calculateMinTotalFee, calculateTotalSupplyToTargetEras, formatSeconds, getMintedSupply, getMintSpeed, numberStringToBN } from "../../utils/format";
import { AddressDisplay } from "../common/AddressDisplay";

export type TokenInfoDataMobileProps = {
  token: InitiazlizedTokenData,
  metadata: TokenMetadataIPFS,
  hasStarted: boolean
}

export const TokenInfoDataMobile: FC<TokenInfoDataMobileProps> = ({
  token,
  metadata,
  hasStarted
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const mintedSupply = useMemo(() => {
    return getMintedSupply(token.supply, token.liquidityTokensRatio);
  }, [token.supply, token.liquidityTokensRatio]);

  const mintSpeed = useMemo(() => {
    return getMintSpeed(token.targetSecondsPerEpoch, token.initialTargetMintSizePerEpoch, token.initialMintSize);
  }, [token.targetSecondsPerEpoch, token.initialTargetMintSizePerEpoch, token.initialMintSize]);

  const totalSupplyToTargetEras = useMemo(() => {
    return calculateTotalSupplyToTargetEras(
      token.epochesPerEra,
      token.initialTargetMintSizePerEpoch,
      token.reduceRatio,
      token.targetEras
    );
  }, [token.targetEras, token.initialTargetMintSizePerEpoch, token.reduceRatio, token.epochesPerEra]);

  const progressPercentage = useMemo(() => {
    return (mintedSupply * 100) / totalSupplyToTargetEras;
  }, [mintedSupply, totalSupplyToTargetEras]);

  const progressPercentageOfEpoch = useMemo(() => {
    return (Number(token.quantityMintedEpoch) * 100) / Number(token.targetMintSizeEpoch);
  }, [token.quantityMintedEpoch, token.targetMintSizeEpoch]);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <DataBlock
          label="Current Milestone/Checkpoint"
          value={`Milestone #${token.currentEra} / Checkpoint #${token.currentEpoch}`}
          tooltip={tooltip.currentEra}
        />
        <DataBlock
          label="Current Minted"
          value={`${mintedSupply.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${metadata?.symbol}`}
          tooltip={tooltip.currentMinted}
        />
        <DataBlock
          label="Mint Fee"
          value={`${(Number(token.feeRate) / LAMPORTS_PER_SOL)} SOL/Mint`}
          tooltip={tooltip.mintFee}
        />
        <DataBlock
          label="Token Address"
          value={<AddressDisplay address={token.mint} />}
          tooltip={tooltip.tokenAddress}
        />
      </div>

      <button
        onClick={() => setShowDetails(!showDetails)}
        className="btn w-full"
      >
        <span>{showDetails ? 'Hide Details' : 'Show Details'}</span>
        {showDetails ? (
          <svg className="w-4 h-4" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M7 16H5v-2h2v-2h2v-2h2V8h2v2h2v2h2v2h2v2h-2v-2h-2v-2h-2v-2h-2v2H9v2H7v2z" fill="currentColor" /> </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M7 8H5v2h2v2h2v2h2v2h2v-2h2v-2h2v-2h2V8h-2v2h-2v2h-2v2h-2v-2H9v-2H7V8z" fill="currentColor" /> </svg>
        )}
      </button>

      {showDetails && (
        <div className="space-y-2 pt-2">
          <DataBlock
            label="Current Mint Size"
            value={`${(numberStringToBN(token.mintSizeEpoch).mul(BN_HUNDRED).div(BN_LAMPORTS_PER_SOL).toNumber() / 100).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${metadata?.symbol}`}
            tooltip={tooltip.currentMintSize}
          />
          <DataBlock
            label="Target Speed"
            value={`${formatSeconds(mintSpeed)}/mint`}
            tooltip={tooltip.mintSpeed}
          />
          <DataBlock
            label={`Target Supply (MS:${token.targetEras})`}
            value={`${totalSupplyToTargetEras.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${metadata?.symbol}`}
            tooltip={tooltip.targetSupply}
          />
          <DataBlock
            label="Deploy at"
            value={new Date(Number(token.timestamp) * 1000).toLocaleString()}
            tooltip={tooltip.deployAt}
          />
          <DataBlock
            label='Deploying Tx'
            value={<AddressDisplay address={token.txId} type='tx' />}
            tooltip={tooltip.deployingTx}
          />
          <DataBlock
            label="Developer"
            value={<AddressDisplay address={token.admin} />}
            tooltip={tooltip.deployer}
          />
          <DataBlock
            label="Liquidity Vault (SOL)"
            value={<AddressDisplay address={token.configAccount} />}
            tooltip={tooltip.liquidityVaultSOL}
          />
          <DataBlock
            label={`Liquidity Vault (${metadata?.symbol})`}
            value={<AddressDisplay address={token.tokenVault} />}
            tooltip={tooltip.liquidityVaultToken}
          />
          <DataBlock
            label="Taget Milestones"
            value={token.targetEras}
            tooltip={tooltip.targetEras}
          />
          <DataBlock
            label="Start time of current checkpoint"
            value={new Date(Number(token.startTimestampEpoch) * 1000).toLocaleString()}
            tooltip={tooltip.startTimeOfCurrentEpoch}
          />
          <DataBlock
            label="Liquidity Tokens Ratio"
            value={token.liquidityTokensRatio + "%"}
            tooltip={tooltip.liquidityTokensRatio}
          />
          <DataBlock
            label="Max Supply"
            value={calculateMaxSupply(token.epochesPerEra, token.initialTargetMintSizePerEpoch, token.reduceRatio).toLocaleString(undefined, { maximumFractionDigits: 2 }) + " " + metadata?.symbol}
            tooltip={tooltip.maxSupply}
          />
          <DataBlock
            label="Target Mint Time"
            value={formatSeconds(Number(token.targetSecondsPerEpoch) * Number(token.epochesPerEra))}
            tooltip={tooltip.targetMintTime}
          />
          <DataBlock
            label="Reduce Ratio per Milestone"
            value={token.reduceRatio + "%"}
            tooltip={tooltip.reduceRatioPerEra}
          />
          <DataBlock
            label="Target Minimum Fee"
            value={(calculateMinTotalFee(
              token.initialTargetMintSizePerEpoch,
              token.feeRate,
              token.targetEras,
              token.epochesPerEra,
              token.initialMintSize
            )).toLocaleString(undefined, { maximumFractionDigits: 2 }) + " SOL"}
            tooltip={tooltip.targetMinimumFee}
          />
          <DataBlock
            label="Checkpoints per Milestone"
            value={token.epochesPerEra}
            tooltip={tooltip.epochesPerEra}
          />
          <DataBlock
            label="Current mint fee"
            value={(Number(token.totalMintFee) / LAMPORTS_PER_SOL).toLocaleString(undefined, { maximumFractionDigits: 2 }) + " SOL"}
            tooltip={tooltip.currentMintFee}
          />
          <DataBlock
            label="Current referral fee"
            value={(Number(token.totalReferrerFee) / LAMPORTS_PER_SOL).toLocaleString(undefined, { maximumFractionDigits: 2 }) + " SOL"}
            tooltip={tooltip.currentReferralFee}
          />
          <DataBlock
            label="Difficulty of current checkpoint"
            value={parseFloat(token.difficultyCoefficientEpoch).toFixed(4)}
            tooltip={tooltip.difficultyOfCurrentEpoch}
          />
          <DataBlock
            label="Difficulty of Last checkpoint"
            value={parseFloat(token.lastDifficultyCoefficientEpoch).toFixed(4)}
            tooltip={tooltip.difficultyOfLastEpoch}
          />
        </div>
      )}

      {hasStarted && (
        <div>
          <h3 className="text-base-content">Minted tokens to target supply</h3>
          <div className="text-sm font-medium mb-1 text-base-content">
            {mintedSupply.toLocaleString(undefined, { maximumFractionDigits: 2 })} / {totalSupplyToTargetEras.toLocaleString(undefined, { maximumFractionDigits: 2 })} ({progressPercentage.toFixed(2)}%)
          </div>
          <progress
            className="pixel-progress w-full"
            style={{ height: "16px" }}
            value={Math.min(progressPercentage, 100)}
            max="100"
          ></progress>
        </div>
      )}

      {hasStarted && (
        <div>
          <h3 className="text-base-content">Minted tokens to target mint size of current checkpoint</h3>
          <div className="text-sm font-medium mb-1 text-base-content">
            {(numberStringToBN(token.quantityMintedEpoch).mul(BN_HUNDRED).div(BN_LAMPORTS_PER_SOL).toNumber() / 100).toLocaleString(undefined, { maximumFractionDigits: 2 })} / {(numberStringToBN(token.targetMintSizeEpoch).mul(BN_HUNDRED).div(BN_LAMPORTS_PER_SOL).toNumber() / 100).toLocaleString(undefined, { maximumFractionDigits: 2 })} ({progressPercentageOfEpoch.toFixed(2)}%)
          </div>
          <progress
            className="pixel-progress w-full"
            style={{ height: "16px" }}
            value={Math.min(progressPercentageOfEpoch, 100)}
            max="100"
          ></progress>
        </div>
      )}
    </div>
  );
}