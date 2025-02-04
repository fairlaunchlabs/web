import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useEffect, useState } from 'react';

export const Balance = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (!publicKey) return;

    const getBalance = async () => {
      try {
        const balance = await connection.getBalance(publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      } catch (e) {
        console.error('Error getting balance:', e);
      }
    };

    getBalance();
    // 设置余额监听器
    const id = connection.onAccountChange(publicKey, (account) => {
      setBalance(account.lamports / LAMPORTS_PER_SOL);
    });

    return () => {
      connection.removeAccountChangeListener(id);
    };
  }, [connection, publicKey]);

  if (!publicKey) {
    return (
      <div className='flex justify-center items-center'>
        <div className="card w-96 bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Wallet Balance</h2>
            <p>Please connect your wallet to view balance</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex justify-center items-center'>
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Wallet Balance</h2>
          <p>Address: {publicKey.toBase58()}</p>
          <p>Balance: {balance} SOL</p>
        </div>
      </div>
    </div>
  );
};
