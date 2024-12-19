import { PublicKey } from '@solana/web3.js';

export const DEFAULT_PARAMS = { // must be same as program default params
    targetEras: '1',
    epochesPerEra: '250',
    targetSecondsPerEpoch: '10000',
    reduceRatio: '75',
    initialMintSize: '10000000000000',
    initialTargetMintSizePerEpoch: '1000000000000000',
    feeRate: '10000000',
    liquidityTokensRatio: '10',
}

export const APP_NAME = 'flipflop';
export const FAIR_MINT_PROGRAM_ID = 'CqaPF1WtcfJ478mEhTbFJsr37SFoYUqhEhD1BZazCUt4';
export const SYSTEM_DEPLOYER = 'CXzddeiDgbTTxNnd1apeUGE7E1UAdvBoysf7c271AA79';

export const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
export const PROTOCOL_FEE_ACCOUNT = "91nnH1cMNz8QHkZuyDyMS7Dj5fL2UNT7VR7t7sS8pWdN";
export const METADATA_SEED = "metadata";
export const MINT_SEED = "fair_mint";
export const CONFIG_DATA_SEED = "config_data";
export const FREEZE_SEED = "freeze";
export const MINT_STATE_SEED = "mint_state";
export const REFERRAL_SEED = "referral";
export const REFUND_SEEDS = "refund";
export const SYSTEM_CONFIG_SEEDS = "system_config";
export const REFERRAL_CODE_SEED = "referral_code";
export const CODE_ACCOUNT_SEEDS = "code_account";

export const subgraphUrl = 'https://api.studio.thegraph.com/query/61629/proof_of_mint/version/latest'
export const LOCAL_STORAGE_KEY_EXPANDED = 'sidebar_expanded_menus';
export const LOCAL_STORAGE_KEY_THEME = 'pom-theme';
export const LOCAL_STORAGE_MY_REFERRAL_CODE = 'my_referral_code';
export const NETWORK = 'devnet';
export const IRYS_NETWORK = 'devnet';
// export const SCANURL = 'https://solscan.io';
export const SCANURL = 'https://explorer.solana.com';
export const LOCAL_STORAGE_HISTORY_CACHE_PREFIX = 'mint_history_';
export const LOCAL_STORAGE_HISTORY_CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24小时的缓存时间

export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];
export const ARWEAVE_API_URL = "http://localhost:8000/arweave";
export const ARWEAVE_GATEWAY_URL = "https://arweave.net";
export const ARSEEDING_GATEWAY_URL = "https://arseed.web3infra.dev";
export const ARWEAVE_DEFAULT_SYNC_TIME = 2 * 60 * 60;

export const VALID_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
export const MAX_AVATAR_FILE_SIZE = 0.25 * 1024 * 1024; // 1MB
export const MAX_HEADER_FILE_SIZE = 3 * 1024 * 1024; // 3MB

export const tooltip = {
    currentEra: "The current era number in the token's lifecycle",
    currentEpoch: "The current epoch number within the current era",
    mintFee: "Fee required to mint tokens",
    currentMintSize: "Current amount of tokens that can be minted in this epoch",
    currentMinted: "Total amount of tokens that have been minted so far",
    targetSupply: "Target token supply to be reached by the specified era",
    mintSpeed: "Rate at which tokens are minted per epoch",
    deployAt: "Timestamp when the token was deployed",
    deployingTx: "Transaction hash of the deployment transaction",
    deployer: "Address of the token deployer",
    tokenAddress: "The token's contract address on Solana",
    liquidityVaultSOL: "Vault address holding SOL liquidity",
    liquidityVaultToken: "Vault address holding token liquidity",
    targetEras: "Number of eras to reach the target supply",
    startTimeOfCurrentEpoch: "When the current epoch started",
    liquidityTokensRatio: "Percentage of tokens allocated for liquidity",
    maxSupply: "Maximum possible token supply",
    targetMintTime: "Target time duration for minting tokens",
    reduceRatioPerEra: "Percentage by which the mint size reduces each era",
    targetMinimumFee: "Minimum total fee required to reach target supply",
    epochesPerEra: "Number of epochs in each era",
    currentMintFee: "Current mint fee",
    currentReferralFee: "Current referral fee",
    difficultyOfCurrentEpoch: "Difficulty of current epoch",
    difficultyOfLastEpoch: "Difficulty of last epoch"
}

export const DARK_THEME = 'skypixel';
export const LIGHT_THEME = 'pixel';

export const BADGE_BG_COLORS = [
    "#2FFF2F",
    "#FF00F5",
    "#FF4911",
    "#FFFF00",
    "#7DF9FF",
    "#3300FF",
    "#7FBC8C",
    "#E3A018",
    "#9723C9"
]
export const BADGE_TEXT_COLORS = ["black", "white", "white", "black", "black", "white", "black", "black", "white"]
export const DEPRECATED_SYMBOLS = [
    "", //"ar5", "ar4", "ar3", "aaa785",// "test#111", "test#121"
]
export const SEARCH_CACHE_ITEMS = 10;

export const INDEX_DB_NAME = 'POM_IMAGE_CACHE';
export const STORE_NAME_IMAGE = 'token_images';
export const INDEX_DB_VERSION = 1;

export const CACHE_DURATION = 60 * 24 * 60 * 60 * 1000; // 60 days

export const DEPRECATED_MINTS = ["",
    // 因为开发过程中，有些代币数据出错，过滤后内测
    "a1RtFfJgH2wQUt72cRWeMQqJCFn6qymp8QDjyoPzbmY", // test#111
    "BcVMtH5Tc4ekR9BnxAFL6uPaJBZQeKKmgFeYrqSe7Zc1", // test#121
    "73YJ8Gxvm5N1VconSNL8dipABi6BkT3c5xC8XF2BPdcP",
    "JDeza664hxRov5kXAkWVFcR7JtsMEUjnzLW4faRFE2eV",
    "71BkhUHSjtyssaH8m7HW5UcGEcPVBHsUzuARDFAFe71B",
    "12iwqAyzWD6ua1ivarRjtxGLR52PnHBdAE1U3iLyqVe9",
    "1111TKQcUkdeMxmyjcEUg4mQTP2nAjZne9iMUQv3FS",
    "1111MyBmtkJzkkMJLLZoocaGvxoeA9y5UNXCv6HmEC",
    "1111cvM1ztWds2kzjiWQTQpeyQAqa1gZyBAow93drd",
    "z3Vtzhjm1kJrkdPtJmbK9TAvL9MZetKu6pZsCbSUnry",
    "Hs5aBja677PYcL9YfN36eYc6rxFxTJWVbrEgEaxw6dAx",
    "FzvXGefXYJERmRNKTAd5oqme2RYxGYcvkLZWfoPey18P",
    "5Hz6LenDBdGMi1NyCmdrkKGnzMxYs4PSQiXbyE4rGRGB",
    "E1CyuqSQzBEYruAAY1hncv6xjbRRtenBBbUQzMYS6jQK",
    "Anas5k8xzQmacKLrpaeFLzSgXUu2J3kiaDxc8EMV8uWk",
    "BovZ9CiQb4dw6vnGiPvH7TsFvV5Qafrgr82T9pFMFeLM",
    "71BkhUHSjtyssaH8m7HW5UcGEcPVBHsUzuARDFAFe71B",
    "AKtYDRYPWFicpdzpiUXLvcLRb6TtdNoxeBBSA8aJvWmT",
    "67U8f2KnyTZi1CPv9SNxScNdNqT6dYEJN2NWywiMw5Z2",
    "CaYL2mEPo5U9nkh6zXLJYdW7PvVVh8qNtfUxwvS3UDh7",
    "JDeza664hxRov5kXAkWVFcR7JtsMEUjnzLW4faRFE2eV",
    "Hs5aBja677PYcL9YfN36eYc6rxFxTJWVbrEgEaxw6dAx",
    "ENnDTpxNnNmXPKDyi7LusiNpMZn7xNQNJupC9SzVSwnR",
    "CH6cHYv5nEnCWzzoj82CriiHSZrTPfGSYWH86GgFHrCB",
    "3bbRb2RbJUHk5wvVJStvXgaAFMU3RvueKczeCwH4cXmY",
    "34m1U3oCVtNoYM7yhvsLNkS2HQuPE6CkcgwCg1dEcUh7",
    "CChbuzbwfocSn4UKej27CYwTr5auz5eFbTiyc8bMcQA",
    "dXBo4c1BHVRAQwNabs6Buv3W7dUBGGG45KdsZMFQyYa",
    "6PSqJF6PuCmSroL6TZXpx8WLtts8r6PcCD9x1JUTXJpk",
    "EnVxZb2oTAuYX7V2DCWCyM9asZkFLriqFBPwTeJqeSjU",
    "5sbGbhogNXqNoqQQqick5WXNXkZHVigw2AtXadFEmV7J",
    "DNB73R85aDjGmQAMdpzjRT29Nn2WKZ2qdptqqdAFPGaN",
    "DUBgJ2yCeYXaiiSh975Z7uxmAMfSzjSQGkLtgi533MEc",
    "3UfhtzWX7qBu79QTnjRJ8dfYbcgJNEUkUMEr1FsCnXUn",
    "EbFJTTCU8xM4WXsEXG6dwvmwGjMqxecgguo4YFPYvJPV",
    "2dXWvsG7LQkc1wXrNucD2hNxDV43WorXVrFwxWDn432m",
    "BksbP1wXfx2PRyKGsv2s67woXHWUnVB6JiZBMaSJxj3q",
    "9XaYxB9RjpSCh46gJ7FTCD9QCmXX7nSJzBXNDkuSS697",
    "7NVeNNgSwM9nRPhDbsyDTVw2RLb3yivvVeKq9AwWuj33",
    "DtAXH1BJEUsCpF1JryD64raSU5D9U87Eb43WxVYrHye6",
    "6gkpJykcNGGTZAiw5QgiFbzqe5sxkJEBvaQP5Kvxctno",
    "GjEZuomwVSy2U78bwX63Gof8k8B7zNBt8c65kaMUaxEf",
    "z8rcrKDATyEWtghNksJWNqdfEpqncDhjfDbWRfJyEkg", // ar#11
    "EE4XNz6ban3x2Lt3hai1cAptchsgpygEV9BdKQKTXksg", // ar#12
    "AGnY6Ygok6aLuBQJB9nRGg7giag4M7qRPaJE8bwKv9dT", 
    "7g4MXbfN8SMC4uLwMXmfK7inqgahhmoRoBuZDrw8SawY", // ar2
    "7DLEqhREmQzagdDvNbmbikUubH2NMxGXLDRwt2BfAQAF", // ar8
    "3Bpy2NuzNKhhKVyiLabKvWtdoFiKCaUrkarXjifj1fa1", // ar13
]