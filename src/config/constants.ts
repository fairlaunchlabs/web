import { PublicKey } from '@solana/web3.js';

export const APP_NAME = 'Logo';
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
// export const SCANURL = 'https://solscan.io';
export const SCANURL = 'https://explorer.solana.com';
export const LOCAL_STORAGE_HISTORY_CACHE_PREFIX = 'mint_history_';
export const LOCAL_STORAGE_HISTORY_CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24小时的缓存时间

export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];
