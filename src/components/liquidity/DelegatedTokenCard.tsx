import { FC } from 'react';
import { InitiazlizedTokenData, TokenMetadataIPFS } from '../../types/types';
import { TokenImage } from '../mintTokens/TokenImage';
import { AddressDisplay } from '../common/AddressDisplay';
import { useNavigate } from 'react-router-dom';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { formatTimestamp } from '../../utils/format';
import { TokenBackgroundImage } from '../common/TokenBackgroundImage';

type DelegatedTokenCardProps = {
  token: InitiazlizedTokenData;
  metadata: TokenMetadataIPFS | undefined;
}

export const DelegatedTokenCard: FC<DelegatedTokenCardProps> = ({
  token,
  metadata,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/manage-liquidity/${token.mint}`);
  };

  return (
    <div className="pixel-box mb-4 p-4 cursor-pointer overflow-hidden relative">
      {metadata?.header && <TokenBackgroundImage imageUrl={metadata.header} metadataTimestamp={Number(token.metadataTimestamp)} />}
      <div className="relative z-10 flex items-start gap-4">
        <div className='flex flex-col items-center'>
          {metadata?.image &&
            <TokenImage
              imageUrl={metadata?.image}
              name={metadata?.name || token.tokenSymbol}
              metadataTimestamp={Number(token.metadataTimestamp)}
              className="w-12 h-12"
            />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="badge badge-md badge-secondary">{metadata?.symbol || token.tokenSymbol}</h3>
            <span className="text-sm">{token?.tokenName || metadata?.name}</span>
          </div>

          <div className="flex gap-2">
            <div className="text-sm mt-0.5 opacity-70">Mint:</div>
            <AddressDisplay address={token.mint} showCharacters={5} />
          </div>
          <div className="flex gap-2 justify-end mt-2">
            <button
              className="btn btn-sm btn-success"
              onClick={handleClick}
            >
              Manage Liquidity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};