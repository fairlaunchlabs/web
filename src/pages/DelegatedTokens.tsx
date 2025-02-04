import { FC } from 'react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { useQuery } from '@apollo/client';
import { PageHeader } from '../components/common/PageHeader';
import { AddressDisplay } from '../components/common/AddressDisplay';
import { queryMyDelegatedTokens } from '../utils/graphql';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useDeviceType } from '../utils/contexts';
import { ErrorBox } from '../components/common/ErrorBox';

interface DelegatedTokensProps {
  expanded: boolean;
}

export const DelegatedTokens: FC<DelegatedTokensProps> = ({
  expanded,
}: DelegatedTokensProps) => {
  const wallet = useAnchorWallet();
  const navigate = useNavigate();
  const { isMobile } = useDeviceType();

  const { loading, error, data } = useQuery(queryMyDelegatedTokens, {
    variables: {
      wallet: wallet?.publicKey.toString(),
      skip: 0,
      first: 10,
    },
    skip: !wallet,
  });

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
        ) : data?.initializeTokenEventEntities?.length > 0 ? (
        !isMobile ? (        
        <div className="overflow-x-auto">
          <table className="pixel-table w-full">
            <thead>
              <tr>
                <th>Token</th>
                <th>Mint</th>
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
              ) : data?.initializeTokenEventEntities.map((token: any) => (
                <tr key={token.id}>
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
        <>
        Mobile =====
        </>)
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No deployments found</p>
          </div>
        )}
      </div>
    </div>
  );
};