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
import { MdAccountCircle, MdToken, MdHome, MdAddCircle, MdQrCode, MdVerified, MdSupervisorAccount, MdGroups, MdPerson, MdManageAccounts, MdSettings, MdRemoveCircle, MdLocalFireDepartment } from 'react-icons/md';
import { MyAccount } from '../pages/MyAccount';
import { LaunchTokenForm } from '../pages/LaunchToken';
import { MenuItem } from '../types/types';
import { CheckURC } from '../components/tools/CheckURC';
import { MyUniqueReferralCode } from '../components/tools/MyUniqueReferralCode';

export const menuItems = (expended: boolean): MenuItem[] => [
    { 
        id: 'launch-token', 
        label: 'Launch Token', 
        icon: <MdAddCircle className="w-5 h-5" />,
        component: <LaunchTokenForm expanded={expended} /> 
    },
    { 
        id: 'mint-tokens', 
        label: 'Mint Tokens', 
        icon: <MdToken className="w-5 h-5" />,
        component: <MintTokens expanded={expended} /> 
    },
    { 
        id: 'my-account', 
        label: 'My Mints', 
        icon: <MdManageAccounts className="w-5 h-5" />,
        component: <MyAccount expanded={expended} /> 
    },
    {
        id: `tools`,
        label: `URC Tools`,
        icon: <MdQrCode className="w-5 h-5" />,
        component: null,
        subItems: [
            {
                id: 'tools-check-urc',
                label: 'Check URC',
                icon: <MdVerified className="w-5 h-5" />,
                component: <CheckURC expanded={expended} />
            },
            {
                id: 'tools-my-urc',
                label: 'My URC',
                icon: <MdPerson className="w-5 h-5" />,
                component: <MyUniqueReferralCode expanded={expended} />
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
                id: 'social-deployer',
                label: 'Deployer',
                icon: <MdSupervisorAccount className="w-5 h-5" />,
                component: <CheckURC expanded={expended} />
            },
            {
                id: 'social-urc_provider',
                label: 'URC provider',
                icon: <MdPerson className="w-5 h-5" />,
                component: <MyUniqueReferralCode expanded={expended} />
            }
        ]
    },
    {
        id: 'token-management',
        label: 'Token Management',
        icon: <MdToken className="w-5 h-5" />,
        component: null,
        subItems: [
            {
                id: 'create-market-id',
                label: 'Create Market ID',
                icon: <MdSettings className="w-5 h-5" />,
                component: <CreateMarketId />
            },
            {
                id: 'create-liquidity-pool',
                label: 'Create Pool',
                icon: <MdToken className="w-5 h-5" />,
                component: <CreateLiquidityPool />
            },
            {
                id: 'add-liquidity',
                label: 'Add Liquidity',
                icon: <MdAddCircle className="w-5 h-5" />,
                component: <AddLiquidity />
            },
            {
                id: 'remove-liquidity',
                label: 'Remove Liquidity',
                icon: <MdRemoveCircle className="w-5 h-5" />,
                component: <RemoveLiquidity />
            },
            {
                id: 'burn-lp-tokens',
                label: 'Burn LP Tokens',
                icon: <MdLocalFireDepartment className="w-5 h-5" />,
                component: <BurnLPTokens />
            }
        ]
    }
];
