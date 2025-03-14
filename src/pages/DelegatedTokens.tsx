import { FC, useEffect, useState } from 'react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { useQuery } from '@apollo/client';
import { PageHeader } from '../components/common/PageHeader';
import { AddressDisplay } from '../components/common/AddressDisplay';
import { queryMyDelegatedTokens } from '../utils/graphql';
import { useNavigate } from 'react-router-dom';
import { useDeviceType } from '../utils/contexts';
import { ErrorBox } from '../components/common/ErrorBox';
import { InitiazlizedTokenData } from '../types/types';
import { DelegatedTokenCard } from '../components/liquidity/DelegatedTokenCard';
import { filterTokens } from '../utils/format';
import { fetchTokenMetadataMap } from '../utils/web3';
import { PAGE_SIZE_OPTIONS } from '../config/constants';
import { TokenImage } from '../components/mintTokens/TokenImage';

interface DelegatedTokensProps {
  expanded: boolean;
}

export const DelegatedTokens: FC<DelegatedTokensProps> = ({
  expanded,
}: DelegatedTokensProps) => {
  const [metadataLoading, setLoadingMetadata] = useState(false);
  const [tokenMetadataMap, setTokenMetadataMap] = useState<Record<string, InitiazlizedTokenData>>({});
  const [dataAfterFilter, setDataAfterFilter] = useState<InitiazlizedTokenData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const wallet = useAnchorWallet();
  const navigate = useNavigate();
  const { isMobile } = useDeviceType();

  const { loading: initialLoading, error, data } = useQuery(queryMyDelegatedTokens, {
    variables: {
      wallet: wallet?.publicKey.toString(),
      skip: 0,
      first: 10,
    },
    skip: !wallet,
    fetchPolicy: 'network-only',
  });

  const handleClick = (mint: string) => {
    navigate(`/token/${mint}`);
  };

  useEffect(() => {
    const _dataAfterFilter = filterTokens(data?.initializeTokenEventEntities);
    setDataAfterFilter(_dataAfterFilter);
    setTotalCount(Math.max(totalCount, (currentPage - 1) * pageSize + (_dataAfterFilter?.length ?? 0)));
    if (_dataAfterFilter) {
      setLoadingMetadata(true);
      fetchTokenMetadataMap(_dataAfterFilter).then((updatedMap) => {
        setLoadingMetadata(false);
        setTokenMetadataMap(updatedMap);
      });
    }
  }, [data]);

  const loading = initialLoading || metadataLoading;

  return (
    <div className={`space-y-0 md:p-4 md:mb-20 ${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
      <PageHeader title="My Delegated Tokens" bgImage='/bg/group1/8.jpg' />

      <div className="w-full md:max-w-6xl mx-auto mb-3 md:mb-20">
      {loading ? (
          <div className="flex justify-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : error ? (
          <div className="w-full">
            <ErrorBox title={`Error loading tokens. Please try again later.`} message={error.message} />
          </div>
        ) : dataAfterFilter.length > 0 ? (
        !isMobile ? (        
        <div className="overflow-x-auto">
          <div className="flex justify-end mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-base-content">Rows per page:</span>
              <select
                className="select select-bordered select-sm"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                {PAGE_SIZE_OPTIONS.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          </div>

          <table className="pixel-table w-full">
            <thead>
              <tr>
                <th className=" text-center"></th>
                <th>Symbol & Name</th>
                <th>Mint Address</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center">
                    Loading...
                  </td>
                </tr>
              ) : dataAfterFilter.map((token: InitiazlizedTokenData) => (
                <tr key={token.id}>
                  <td className=" text-center cursor-pointer" onClick={() => handleClick(token.mint)}>
                    <div className="">
                      <TokenImage
                        imageUrl={tokenMetadataMap[token.mint]?.tokenMetadata?.image || ''}
                        name={token.tokenName}
                        metadataTimestamp={Number(token.metadataTimestamp)}
                        size={48}
                        className="w-12 h-12"
                      />
                    </div>
                  </td>
                  
                  <td>
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="font-bold">{token.tokenName}</div>
                        <div className="text-sm opacity-50">{token.tokenSymbol}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <AddressDisplay address={token.mint} />
                  </td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate(`/manage-liquidity/${token.mint}`)}
                    >
                      Manage market value
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        ) : (
          <div>
            {dataAfterFilter.map((token: InitiazlizedTokenData) =>
              <DelegatedTokenCard
                key={token.id}
                token={token}
                metadata={tokenMetadataMap[token.mint as string]?.tokenMetadata}
              />)}
          </div>
        )
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No deployments found</p>
          </div>
        )}
      </div>
    </div>
  );
};