import React, { FC, useMemo, useState } from 'react';
import './App.css';
import {
    ConnectionProvider,
    WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import {
    WalletModalProvider,
} from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { Balance } from './pages/Balance';
import { TransactionHistory } from './pages/TransactionHistory';
import { TokenAccounts } from './pages/TokenAccounts';
import { LaunchToken } from './pages/LaunchToken';
import { MintTokens } from './pages/MintTokens';
import { 
    CreateMarketId, 
    CreateLiquidityPool, 
    AddLiquidity, 
    RemoveLiquidity, 
    BurnLPTokens 
} from './pages/TokenManagement';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Sidebar } from './components/Sidebar';
import { FaWallet, FaRocket, FaCoins, FaUser } from 'react-icons/fa';
import { BiHistory } from 'react-icons/bi';
import { AiOutlineKey } from 'react-icons/ai';
import { 
    MdToken, 
    MdOutlineCreateNewFolder,
    MdPool,
    MdAddCircle,
    MdRemoveCircle,
    MdLocalFireDepartment
} from 'react-icons/md';
import { Toaster } from 'react-hot-toast';

require('@solana/wallet-adapter-react-ui/styles.css');

type MenuItem = {
    id: string;
    label: string;
    icon: React.ReactNode;
    component: React.ReactNode;
    subItems?: MenuItem[];
};

function App() {
    const network = process.env.REACT_APP_SOLANA_NETWORK as WalletAdapterNetwork;
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);
    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter(),
        ],
        [network],
    );

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedMenuItem, setSelectedMenuItem] = useState('balance');

    const menuItems: MenuItem[] = [
        {
            id: 'my-account',
            label: 'My Account',
            icon: <FaUser className="w-5 h-5" />,
            component: null,
            subItems: [
                { 
                    id: 'balance', 
                    label: 'Wallet Balance', 
                    icon: <FaWallet className="w-5 h-5" />,
                    component: <Balance /> 
                },
                { 
                    id: 'transactions', 
                    label: 'Transactions', 
                    icon: <BiHistory className="w-5 h-5" />,
                    component: <TransactionHistory /> 
                },
                { 
                    id: 'tokens', 
                    label: 'Token Accounts', 
                    icon: <AiOutlineKey className="w-5 h-5" />,
                    component: <TokenAccounts /> 
                },
            ]
        },
        { 
            id: 'launch-token', 
            label: 'Launch Token', 
            icon: <FaRocket className="w-5 h-5" />,
            component: <LaunchToken /> 
        },
        { 
            id: 'mint-tokens', 
            label: 'Mint Tokens', 
            icon: <FaCoins className="w-5 h-5" />,
            component: <MintTokens /> 
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

    const getActiveComponent = () => {
        for (const item of menuItems) {
            if (item.subItems) {
                const subItem = item.subItems.find(sub => sub.id === selectedMenuItem);
                if (subItem) return subItem.component;
            }
            if (item.id === selectedMenuItem) return item.component;
        }
        return null;
    };

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider 
                wallets={wallets} 
                autoConnect
                onError={(error: Error) => {
                    console.error('Wallet error:', error);
                }}
            >
                <WalletModalProvider>
                    <div className="min-h-screen bg-base-100 flex flex-col">
                        <Toaster 
                            position="bottom-right"
                            toastOptions={{
                                duration: 5000,
                            }}
                        />
                        <Navbar 
                            onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                            isMenuOpen={isSidebarOpen}
                        />
                        
                        {/* 主要内容区域 */}
                        <div className="flex-1 flex flex-col md:flex-row mt-16">
                            {/* 移动端遮罩层 */}
                            {isSidebarOpen && (
                                <div 
                                    className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                                    onClick={() => setIsSidebarOpen(false)}
                                />
                            )}

                            {/* 侧边栏容器 */}
                            <div className={`
                                fixed md:relative inset-y-0 left-0 z-30
                                transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                                md:translate-x-0 transition-transform duration-300 ease-in-out
                            `}>
                                <Sidebar
                                    menuItems={menuItems}
                                    activeMenuItem={selectedMenuItem}
                                    onMenuItemClick={(id) => {
                                        setSelectedMenuItem(id);
                                        setIsSidebarOpen(false); // 在移动端点击菜单项时关闭侧边栏
                                    }}
                                    isMobileOpen={isSidebarOpen}
                                />
                            </div>

                            {/* 内容区域 */}
                            <div className="flex-1 p-4 md:p-8 pb-20">
                                {getActiveComponent()}
                            </div>
                        </div>
                        <Footer />
                    </div>
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}

export default App;
