import React from 'react';
// import { Balance } from '../pages/Balance';
// import { TransactionHistory } from '../pages/TransactionHistory';
// import { TokenAccounts } from '../pages/TokenAccounts';
import { MintTokens } from '../pages/MintTokens';
import { 
    CreateMarketId, 
    CreateLiquidityPool, 
    AddLiquidity, 
    RemoveLiquidity, 
    BurnLPTokens 
} from '../pages/TokenManagement';
import { 
    MdSmartToy, 
    MdQrCode, 
    MdGroups, 
    MdCurrencyExchange,
    MdLocalFireDepartment,
    MdRocketLaunch,
    MdOutlineEnergySavingsLeaf,
    MdAccountBalanceWallet,
    MdQrCodeScanner,
    MdBadge,
    MdEngineering,
    MdSupportAgent,
    MdAccountBalance,
    MdPool,
    MdAddBox,
    MdRemoveCircleOutline
} from 'react-icons/md';
import { MyAccount } from '../pages/MyAccount';
import { LaunchTokenForm } from '../pages/LaunchToken';
import { MenuItem } from '../types/types';
import { CheckURC } from '../components/tools/CheckURC';
import { MyUniqueReferralCode } from '../components/tools/MyUniqueReferralCode';
import { AskAI } from '../pages/AskAI';
import { SocialDeveloper } from '../pages/SocialDeveloper';
import { SocialURCProvider } from '../pages/SocialURCProvider';
import { SocialValueManager } from '../pages/SocialValueManager';
import { MyDeployments } from '../pages/MyDeployments';

export const menuItems = (expended: boolean): MenuItem[] => [
    { 
        id: 'launch-token', 
        label: 'Launch Token', // Launch a new crypto token
        icon: <MdRocketLaunch className="w-5 h-5" />,
        component: <LaunchTokenForm expanded={expended} /> 
    },
    { 
        id: 'mint-tokens', 
        label: 'Mint Tokens', // Mint or mine tokens
        icon: <MdOutlineEnergySavingsLeaf className="w-5 h-5" />,
        component: <MintTokens expanded={expended} /> 
    },
    { 
        id: 'my-account', 
        label: 'My Mints', // My token list
        icon: <MdAccountBalanceWallet className="w-5 h-5" />,
        component: <MyAccount expanded={expended} /> 
    },
    {
        id: `tools`,
        label: `Tools`, // URC means unique referral code, this is tools for URC management
        icon: <MdQrCodeScanner className="w-5 h-5" />,
        component: null,
        subItems: [
            {
                id: 'tools-check-urc',
                label: 'Validate URC', // validate code
                icon: <MdBadge className="w-5 h-5" />,
                component: <CheckURC expanded={expended} />
            },
            {
                id: 'tools-my-urc',
                label: 'My URC', // my URC code list
                icon: <MdQrCode className="w-5 h-5" />,
                component: <MyUniqueReferralCode expanded={expended} />
            },
            {
                id: 'tools-my-deployed',
                label: 'My Deployment',
                icon: <MdSmartToy className="w-5 h-5" />,
                component: <MyDeployments expanded={expended} />
            }
        ]
    },
    {
        id: `social`,
        label: `Social`,
        icon: <MdGroups className="w-5 h-5" />,
        component: null,
        subItems: [
            {
                id: 'social-developer',
                label: 'Developer', // here you can find and follow developers who launch tokens
                icon: <MdEngineering className="w-5 h-5" />,
                component: <SocialDeveloper expanded={expended} />
            },
            {
                id: 'social-urc-provider',
                label: 'URC provider', // here you can find URC providers
                icon: <MdSupportAgent className="w-5 h-5" />,
                component: <SocialURCProvider expanded={expended} />
            },
            {
                id: 'social-value-manager',
                label: 'Value Manager', // here you can find Value manager to manage the token value
                icon: <MdCurrencyExchange className="w-5 h-5" />,
                component: <SocialValueManager expanded={expended} />
            }
        ]
    },
    {
        id: 'token-management',
        label: 'Token Management',
        icon: <MdAccountBalance className="w-5 h-5" />,
        component: null,
        subItems: [
            {
                id: 'create-market-id',
                label: 'Create Market ID',
                icon: <MdAddBox className="w-5 h-5" />,
                component: <CreateMarketId />
            },
            {
                id: 'create-liquidity-pool',
                label: 'Create Pool',
                icon: <MdPool className="w-5 h-5" />,
                component: <CreateLiquidityPool />
            },
            {
                id: 'add-liquidity',
                label: 'Add Liquidity',
                icon: <MdAddBox className="w-5 h-5" />,
                component: <AddLiquidity />
            },
            {
                id: 'remove-liquidity',
                label: 'Remove Liquidity',
                icon: <MdRemoveCircleOutline className="w-5 h-5" />,
                component: <RemoveLiquidity />
            },
            {
                id: 'burn-lp-tokens',
                label: 'Burn LP Tokens',
                icon: <MdLocalFireDepartment className="w-5 h-5" />,
                component: <BurnLPTokens />
            }
        ]
    },
    {
        id: 'gpt',
        label: 'Ask AI', // Here you can ask ChatGPT everything about this platform
        icon: <MdSmartToy className="w-5 h-5" />,
        component: <AskAI expanded={expended} />
    }
];
