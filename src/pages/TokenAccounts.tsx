import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import { useEffect, useState } from 'react';
import { TokenAccount } from '../types/types';
import { NETWORK, SCANURL } from '../config/constants';

export const TokenAccounts = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [tokenAccounts, setTokenAccounts] = useState<TokenAccount[]>([]);

  useEffect(() => {
    if (!publicKey) return;

    const getTokenAccounts = async () => {
      try {
        const accounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
          programId: TOKEN_2022_PROGRAM_ID,
        });

        const tokens = accounts.value.map((account) => {
          const parsedInfo = account.account.data.parsed.info;
          return {
            mint: parsedInfo.mint,
            amount: parsedInfo.tokenAmount.uiAmount,
            decimals: parsedInfo.tokenAmount.decimals,
          };
        });

        setTokenAccounts(tokens);
      } catch (e) {
        console.error('Error fetching token accounts:', e);
      }
    };

    getTokenAccounts();
  }, [connection, publicKey]);

  if (!publicKey) {
    return (
      <div className='flex justify-center items-center'>
        <div className="card w-96 bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Token Accounts</h2>
            <p>Please connect your wallet to view token accounts</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex justify-center items-center'>
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Token Accounts</h2>
          <div className="overflow-x-auto bg-base-100 rounded-xl shadow-xl">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Token Mint</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {tokenAccounts.map((token) => (
                  <tr key={token.mint}>
                    <td className="truncate max-w-xs">
                      <a
                        href={`${SCANURL}/address/${token.mint}?cluster=${NETWORK}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link link-primary"
                      >
                        {token.mint.slice(0, 20)}...
                      </a>
                    </td>
                    <td>{token.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
