import { PublicKey } from '@solana/web3.js';

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

export const VALID_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
export const MAX_AVATAR_FILE_SIZE = 0.25 * 1024 * 1024; // 1MB
export const MAX_HEADER_FILE_SIZE = 3 * 1024 * 1024; // 3MB

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