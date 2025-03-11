import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { BN } from '@coral-xyz/anchor';
import { InitiazlizedTokenData, PoolData } from '../types/types';
import { useLazyQuery } from '@apollo/client';
import { queryBurnLp, queryLiquidities, queryTokensByMints, queryTrades } from '../utils/graphql';
import { Trades } from '../components/liquidity/Trades';
import { Liquidities } from '../components/liquidity/Liquidities';
import { LpBurns } from '../components/liquidity/LpBurns';
import { PoolInformation } from '../components/liquidity/PoolInformation';
import { useParams } from 'react-router-dom';
import { sleep } from '@raydium-io/raydium-sdk-v2';

interface ManageLiquidityProps {
  expanded: boolean;
}

export function ManageLiquidity({
  expanded,
}: ManageLiquidityProps
) {
  const [mintAddress, setMintAddress] = useState('');
  const [tokenData, setTokenData] = useState<InitiazlizedTokenData | null>(null);
  const [poolData, setPoolData] = useState<PoolData | null>(null);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [tradesData, setTradesData] = useState([]);
  const [liquiditiesData, setLiquiditiesData] = useState([]);
  const [lpBurnData, setLpBurnData] = useState([]);
  const [activeTab, setActiveTab] = useState('trades');
  const [tokenVaultBalance, setTokenVaultBalance] = useState(0);
  const [wsolVaultBalance, setWsolVaultBalance] = useState(0);
  const [poolTokenBalance, setPoolTokenBalance] = useState(0);
  const [poolSOLBalance, setPoolSOLBalance] = useState(0);
  const [vaultLpTokenBalance, setVaultLpTokenBalance] = useState(0);
  const [totalLpToken, setTotalLpToken] = useState(0);
  const [isDexOpen, setIsDexOpen] = useState(false);

  const initialFetchDone = useRef(false);
  const nonce = useRef(0);

  const { mint } = useParams();

  useEffect(() => {
    if(mint && !initialFetchDone.current) {
      initialFetchDone.current = true;
      setMintAddress(mint as string);
      fetchAllData(mint);
    }
  }, [mint])

  const onDone = () => {
    initialFetchDone.current = false;
    nonce.current += 1;
    fetchAllData(mintAddress);
  }

  // ====== query data from subgraph ======
  const [getTokenData, { loading: queryTokenDataLoading }] = useLazyQuery(queryTokensByMints, {
    onCompleted: (data) => {
      const _tokenData = data.initializeTokenEventEntities[0];
      setTokenData(_tokenData);
    },
    onError: (error) => {
      toast.error('Failed to fetch token data');
      console.error('Error fetching token data:', error);
    }
  });

  const [getTradesData, { loading: queryTradesLoading }] = useLazyQuery(queryTrades, {
    onCompleted: (data) => {
      const _tradesData = data.proxySwapBaseEventEntities as [];
      console.log("trades", _tradesData);
      setTradesData([..._tradesData]);
    },
    onError: (error) => {
      toast.error('Failed to fetch trades data');
      console.error('Error fetching trades data:', error);
    }
  });

  const [getLiquiditiesData, { loading: queryLiquiditiesLoading }] = useLazyQuery(queryLiquidities, {
    onCompleted: (data) => {
      const _liquiditiesData = data.proxyLiquidityEventEntities as [];
      console.log("liquidities", _liquiditiesData);
      setLiquiditiesData([..._liquiditiesData]);
    },
    onError: (error) => {
      toast.error('Failed to fetch liquidities data');
      console.error('Error fetching liquidities data:', error);
    }
  });

  const [getLpBurnData, { loading: queryLpBurnLoading }] = useLazyQuery(queryBurnLp, {
    onCompleted: (data) => {
      const _lpBurnData = data.proxyBurnLpTokensEventEntities as [];
      console.log("lp burn", _lpBurnData);
      setLpBurnData([..._lpBurnData]);
    },
    onError: (error) => {
      toast.error('Failed to fetch lp burn data');
      console.error('Error fetching lp burn data:', error);
    }
  });

  const fetchAllData = async (address: string) => {
    if (!address) {
      toast.error('Please enter mint address');
      return;
    }
    console.log("fetch all data...");

    try {
      // Waiting 2 seconds for chain data sync
      await sleep(2000);
      
      const queryParams = {
        skip: 0,
        first: 10,
        mint: address
      };

      await Promise.all([
        getTokenData({
          variables: {
            mints: [address],
            skip: 0,
            first: 10
          }
        }),
        getLiquiditiesData({
          variables: queryParams,
          fetchPolicy: 'network-only'
        }),
        getLpBurnData({
          variables: queryParams,
          fetchPolicy: 'network-only'
        }),
        getTradesData({
          variables: queryParams,
          fetchPolicy: 'network-only'
        })
      ]);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to fetch data');
    }
  };

  return (
    <div className={`space-y-0 md:p-4 md:mb-20 ${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
      {/* <PageHeader title="Manage Liquidity" bgImage='/bg/group1/8.jpg' /> */}

      <div className="container mx-auto md:px-4 px-1 py-8">
        <div className='max-w-4xl mx-auto'>
          <h1 className='text-2xl mb-6'>Manage Liquidity</h1>
          {!mint && (
          <div className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter mint address"
                className="input input-bordered flex-1"
                value={mintAddress}
                onChange={(e) => setMintAddress(e.target.value)}
              />
              <button
                onClick={() => fetchAllData(mintAddress)}
                disabled={queryTokenDataLoading || queryLiquiditiesLoading || queryTradesLoading || queryLpBurnLoading || !mintAddress}
                className="btn btn-primary"
              >
                {queryTokenDataLoading ? 'Loading...' : 'Get Info'}
              </button>
            </div>
          </div>)}

          {tokenData && (
            <PoolInformation
              tokenData={tokenData}
              currentPrice={currentPrice}
              setPoolData={setPoolData}
              setCurrentPrice={setCurrentPrice}
              nonce={nonce.current}
              tokenVaultBalance={tokenVaultBalance}
              setTokenVaultBalance={setTokenVaultBalance}
              wsolVaultBalance={wsolVaultBalance}
              setWsolVaultBalance={setWsolVaultBalance}
              poolTokenBalance={poolTokenBalance}
              setPoolTokenBalance={setPoolTokenBalance}
              poolSOLBalance={poolSOLBalance}
              setPoolSOLBalance={setPoolSOLBalance}
              vaultLpTokenBalance={vaultLpTokenBalance}
              setVaultLpTokenBalance={setVaultLpTokenBalance}
              totalLpToken={totalLpToken}
              setTotalLpToken={setTotalLpToken}
              isDexOpen={isDexOpen}
              setIsDexOpen={setIsDexOpen}
            />
          )}

          {poolData && isDexOpen &&
            <div className="bg-base-200 md:p-6 p-3 rounded-lg md:text-md text-sm">
              <div className="grid gap-8">
                <div className="tabs tabs-boxed">
                  <a
                    className={`tab px-0 h-12 ${activeTab === 'trades' ? 'bg-gray-700 text-white' : ''}`}
                    onClick={() => setActiveTab('trades')}
                  >
                    <div className='font-bold'>[Trade]</div>
                  </a>
                  <a
                    className={`tab px-0 h-12 ${activeTab === 'liquidity' ? 'bg-gray-700 text-white' : ''}`}
                    onClick={() => setActiveTab('liquidity')}
                  >
                    <div className='font-bold'>[Liquidity]</div>
                  </a>
                  <a
                    className={`tab px-0 h-12 ${activeTab === 'burn' ? 'bg-gray-700 text-white' : ''}`}
                    onClick={() => setActiveTab('burn')}
                  >
                    <div className='font-bold'>[Burn]</div>
                  </a>
                </div>

                {activeTab === 'trades' && (
                  <Trades
                    tradesData={tradesData}
                    tokenData={tokenData as InitiazlizedTokenData}
                    currentPrice={currentPrice}
                    onDone={onDone}
                    tokenVaultBalance={tokenVaultBalance}
                    wsolVaultBalance={wsolVaultBalance}
                    poolTokenBalance={poolTokenBalance}
                    poolSOLBalance={poolSOLBalance}
                  />
                )}
                {activeTab === 'liquidity' && (
                  <Liquidities
                    tokenData={tokenData as InitiazlizedTokenData}
                    liquiditiesData={liquiditiesData}
                    currentPrice={currentPrice}
                    onDone={onDone}
                    tokenVaultBalance={tokenVaultBalance}
                    wsolVaultBalance={wsolVaultBalance}
                    poolTokenBalance={poolTokenBalance}
                    poolSOLBalance={poolSOLBalance}
                    vaultLpTokenBalance={vaultLpTokenBalance}
                    totalLpToken={totalLpToken}
                  />
                )}
                {activeTab === 'burn' && (
                  <LpBurns
                    tokenData={tokenData as InitiazlizedTokenData}
                    lpBurnData={lpBurnData}
                    onDone={onDone}
                    vaultLpTokenBalance={vaultLpTokenBalance}
                  />
                )}
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  );
}
