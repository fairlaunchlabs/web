import { PublicKey } from '@solana/web3.js';

type TokenParams = {
    targetEras: string;
    epochesPerEra: string;
    targetSecondsPerEpoch: string;
    reduceRatio: string;
    initialMintSize: string;
    initialTargetMintSizePerEpoch: string;
    feeRate: string;
    liquidityTokensRatio: string;
};

export const DEFAULT_PARAMS = {
    "standard": { // must be same as program default params
        targetEras: '1',
        epochesPerEra: '250',
        targetSecondsPerEpoch: '2000',
        reduceRatio: '50',
        initialMintSize: '10000000000000',
        initialTargetMintSizePerEpoch: '200000000000000',
        feeRate: '200000000',
        liquidityTokensRatio: '20',
    },
    // TODO: remove it when mainnet launch ######
    // "meme": { // config for mainnet 
    //     targetEras: '1',
    //     epochesPerEra: '250',
    //     targetSecondsPerEpoch: '2000',
    //     reduceRatio: '75',
    //     initialMintSize: '10000000000000',
    //     initialTargetMintSizePerEpoch: '1000000000000000',
    //     feeRate: '10000000',
    //     liquidityTokensRatio: '20',
    // },
    "meme": { // config for dev
        targetEras: '1',
        epochesPerEra: '2',
        targetSecondsPerEpoch: '60',
        reduceRatio: '75',
        initialMintSize: '1000000000000',
        initialTargetMintSizePerEpoch: '10000000000000',
        feeRate: '10000000',
        liquidityTokensRatio: '20',
    },
} as Record<string, TokenParams>;


export const STORAGE = "irys" as "irys" | "arweave";
// export const FAIR_MINT_PROGRAM_ID = '3Jx2Y5q4Jgc9fWEwVdyDSSw5vKFCN7a6MVwbNKvcLNZv';
export const FAIR_MINT_PROGRAM_ID = '8GM2N7qQjzMyhqewu8jpDgzUh2BJbtBxSY1WzSFeFm6U';
export const SYSTEM_DEPLOYER = 'CXzddeiDgbTTxNnd1apeUGE7E1UAdvBoysf7c271AA79';
export const PROTOCOL_FEE_ACCOUNT = "CXzddeiDgbTTxNnd1apeUGE7E1UAdvBoysf7c271AA79";

export const APP_NAME = 'flipflop';
export const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
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
export const MINT_VAULT_OWNER_SEEDS = "mint-vault-owner";
export const EXTRA_ACCOUNT_META_LIST = "extra-account-metas";
export const cpSwapProgram = new PublicKey("CPMDWBwJDtYax9qW7AyRuVC19Cc4L4Vcy4n2BHAbHkCW"); // devnet
export const cpSwapConfigAddress = new PublicKey("9zSzfkYy6awexsHvmggeH36pfVUdDGyCcwmjT3AQPBj6"); // find address on devnet
export const createPoolFeeReceive = new PublicKey("G11FKBRaAkHAKuLCgLM6K6NUc9rTjPAznRCjZifrTQe2"); // find address on devnet

// export const cpSwapProgram = new PublicKey("2v2i1n5tHdvaepZo6LjzzFnGRbj4bwTBrev88PHVdeiS"); // localnet deploy cpmm
// export const cpSwapConfigAddress = new PublicKey("9tebm8DNMyyQYtNyTWdEmVYPgH1riB5qMurRiNM3NQD7"); // localnet deploy cpmm
// export const createPoolFeeReceive = new PublicKey("G11FKBRaAkHAKuLCgLM6K6NUc9rTjPAznRCjZifrTQe2"); // localnet deploy cpmm

// export const cpSwapProgram = new PublicKey("CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C"); // mainnet
// export const cpSwapConfigAddress = new PublicKey("D4FPEruKEHrG5TenZ2mpDGEfu1iUvTiqBxvpU8HLBvC2"); // mainnet
// export const createPoolFeeReceive = new PublicKey("DNXgeM9EiiaAbaWvwjHj9fQQLAX5ZsfHyvmYUNRAdNC8"); // mainnet

export const memoProgram = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
export const addressLookupTableAddress = new PublicKey("EebRqpLtUgjX17pJJNNbd6ngtYa34VGa51oYsibwJRXy");
export const slotsOfEstimatingInterval = 250; // localnet and devnet must be 250, mainnet suggest to be 3000000
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
// export const UPLOAD_API_URL = "http://localhost:8000/arweave"; // DEVELOPMENT
export const UPLOAD_API_URL = STORAGE === "arweave" ? "https://flipflop-api.vercel.app/arweave" : "https://flipflop-api.vercel.app/irys"; // PRODUCTION
export const ARWEAVE_GATEWAY_URL = "https://arweave.net";
export const ARSEEDING_GATEWAY_URL = "https://arseed.web3infra.dev";
export const ARWEAVE_DEFAULT_SYNC_TIME = 2 * 60 * 60;

export const IRYS_GATEWAY_URL = "https://gateway.irys.xyz";

export const VALID_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
export const MAX_AVATAR_FILE_SIZE = 0.25 * 1024 * 1024; // 1MB
export const MAX_HEADER_FILE_SIZE = 3 * 1024 * 1024; // 3MB

// export const COPILOTKIT_RUNTIME_URL = "http://127.0.0.1:8000/gpt/copilotkit";
export const COPILOTKIT_RUNTIME_URL = "https://flipflop-api.vercel.app/gpt/copilotkit";
export const U32_MAX = 4294967295;

export const tooltip = {
    currentEra: "The current milestone in the token's lifecycle",
    currentEpoch: "The current checkpoint within the current milestone",
    mintFee: "Fee required to mint tokens",
    currentMintSize: "Current amount of tokens that can be minted in this checkpoint",
    currentMinted: "Total amount of tokens that have been minted so far",
    targetSupply: "Target token supply to be reached by the specified milestone",
    mintSpeed: "Rate at which tokens are minted per checkpoint",
    deployAt: "Timestamp when the token was deployed",
    deployingTx: "Transaction hash of the deployment transaction",
    deployer: "Address of the token developer",
    tokenAddress: "The token's contract address on Solana",
    liquidityVaultSOL: "Vault address holding SOL liquidity",
    liquidityVaultToken: "Vault address holding token liquidity",
    targetEras: "Number of milestones to reach the target supply",
    startTimeOfCurrentEpoch: "When the current checkpoint started",
    liquidityTokensRatio: "Percentage of tokens allocated for liquidity",
    maxSupply: "Maximum possible token supply",
    targetMintTime: "Target time duration for minting tokens",
    reduceRatioPerEra: "Percentage by which the mint size reduces each milestone",
    targetMinimumFee: "Minimum total fee required to reach target supply",
    epochesPerEra: "Number of checkpoints in each milestone",
    currentMintFee: "Current mint fee",
    currentReferralFee: "Current referral fee",
    difficultyOfCurrentEpoch: "Difficulty of current checkpoint",
    difficultyOfLastEpoch: "Difficulty of last checkpoint"
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
export const SEARCH_CACHE_ITEMS = 10;

export const INDEX_DB_NAME = 'POM_IMAGE_CACHE';
export const STORE_NAME_IMAGE = 'token_images';
export const INDEX_DB_VERSION = 1;

export const CACHE_DURATION = 60 * 24 * 60 * 60 * 1000; // 60 days

export const DEPRECATED_MINTS = ["",
    "BitJngSe2MFQNnuBiA6bajRyZoFp7pkXYnBjVKMJMiCv",
    
]