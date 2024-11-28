import React from 'react';
// import { Balance } from '../pages/Balance';
// import { TransactionHistory } from '../pages/TransactionHistory';
// import { TokenAccounts } from '../pages/TokenAccounts';
import { LaunchToken } from '../pages/LaunchToken';
import { MintTokens } from '../pages/MintTokens';
import { 
    CreateMarketId, 
    CreateLiquidityPool, 
    AddLiquidity, 
    RemoveLiquidity, 
    BurnLPTokens 
} from '../pages/TokenManagement';
import { FaRocket, FaCoins } from 'react-icons/fa';
// import { BiHistory } from 'react-icons/bi';
// import { AiOutlineKey } from 'react-icons/ai';
import { 
    MdToken, 
    MdOutlineCreateNewFolder,
    MdPool,
    MdAddCircle,
    MdRemoveCircle,
    MdLocalFireDepartment,
    MdAccountCircle
} from 'react-icons/md';
import { MyAccount } from '../pages/MyAccount';

export type MenuItem = {
    id: string;
    label: string;
    icon: React.ReactNode;
    component: React.ReactNode;
    subItems?: MenuItem[];
};

export const menuItems = (expended: boolean): MenuItem[] => [
    // {
    //     id: 'my-account',
    //     label: 'My Account',
    //     icon: <FaUser className="w-5 h-5" />,
    //     component: null,
    //     subItems: [
    //         { 
    //             id: 'balance', 
    //             label: 'Wallet Balance', 
    //             icon: <FaWallet className="w-5 h-5" />,
    //             component: <Balance /> 
    //         },
    //         { 
    //             id: 'transactions', 
    //             label: 'Transactions', 
    //             icon: <BiHistory className="w-5 h-5" />,
    //             component: <TransactionHistory /> 
    //         },
    //         { 
    //             id: 'tokens', 
    //             label: 'Token Accounts', 
    //             icon: <AiOutlineKey className="w-5 h-5" />,
    //             component: <TokenAccounts /> 
    //         },
    //     ]
    // },
    { 
        id: 'launch-token', 
        label: 'Launch Token', 
        icon: <FaRocket className="w-5 h-5" />,
        component: <LaunchToken expanded={expended} /> 
    },
    { 
        id: 'mint-tokens', 
        label: 'Mint Tokens', 
        icon: <FaCoins className="w-5 h-5" />,
        component: <MintTokens expanded={expended} /> 
    },
    { 
        id: 'my-account', 
        label: 'My Account', 
        icon: <MdAccountCircle className="w-5 h-5" />,
        component: <MyAccount expanded={expended} /> 
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
                icon: <MdOutlineCreateNewFolder className="w-5 h-5" />,
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
