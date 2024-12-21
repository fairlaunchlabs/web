import React, { FC, useMemo, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
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
import { Navbar } from './components/common/Navbar';
import { Toaster } from 'react-hot-toast';
import { Sidebar } from './components/common/Sidebar';
import { Footer } from './components/common/Footer';
import { menuItems } from './config/menu';
import { TokenDetail } from './pages/TokenDetail';
import { APP_NAME } from './config/constants';
import { Providers, useDeviceType } from './utils/contexts';
import { Discover } from './pages/Discover';
import { MyMintedTokens } from './pages/MyMintedTokens';
import { MyDeployments } from './pages/MyDeployments';
import { AskAI } from './pages/AskAI';
import { SocialDeveloper } from './pages/SocialDeveloper';
import { SocialURCProvider } from './pages/SocialURCProvider';
import { SocialValueManager } from './pages/SocialValueManager';
import { LaunchTokenForm } from './pages/LaunchToken';
import { AddLiquidity, BurnLPTokens, CreateLiquidityPool, CreateMarketId, RemoveLiquidity } from './pages/TokenManagement';
import { CheckURC } from './components/tools/CheckURC';
import { MyUniqueReferralCode } from './components/tools/MyUniqueReferralCode';

require('@solana/wallet-adapter-react-ui/styles.css');

const AppContent = () => {
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedMenuItem, setSelectedMenuItem] = useState(() => {
        return localStorage.getItem('selectedMenuItem') || 'balance';
    });
    const {isMobile} = useDeviceType();

    useEffect(() => {
        localStorage.setItem('selectedMenuItem', selectedMenuItem);
    }, [selectedMenuItem]);

    const getActiveComponent = () => {
        for (const item of menuItems(expanded)) {
            if (item.subItems) {
                const subItem = item.subItems.find(sub => sub.id === selectedMenuItem);
                if (subItem) return subItem.component;
            }
            if (item.id === selectedMenuItem) return item.component;
        }
        return null;
    };

    return (
        <Providers>
            <div className="min-h-screen bg-base-100 flex flex-col">
                <Navbar 
                    title={APP_NAME}
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
                        fixed md:top-16 inset-y-0 left-0 z-30
                        transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                        md:translate-x-0 transition-transform duration-300 ease-in-out
                    `}>
                        <Sidebar
                            menuItems={menuItems(expanded)}
                            activeMenuItem={selectedMenuItem}
                            onMenuItemClick={(id: string) => {
                                setSelectedMenuItem(id);
                                setIsSidebarOpen(false);
                                navigate(`/${id}`);
                            }}
                            isMobileOpen={isSidebarOpen}
                            onExpandedChange={setExpanded}
                        />
                    </div>

                    {/* 内容区域 */}
                    <div className="flex-1 p-4 md:p-8 pb-20">
                        <Routes>
                            <Route path="/" element={<Discover expanded={expanded} />} />
                            <Route path="/discover" element={<Discover expanded={expanded} />} />
                            <Route path="/launch-token" element={<LaunchTokenForm expanded={expanded} />} />
                            <Route path="/my-minted-tokens" element={<MyMintedTokens expanded={expanded} />} />
                            <Route path="/my-deployments" element={<MyDeployments expanded={expanded} />} />
                            <Route path="/create-market-id" element={<CreateMarketId expanded={expanded} />} />
                            <Route path="/create-liquidity-pool" element={<CreateLiquidityPool expanded={expanded} />} />
                            <Route path="/add-liquidity" element={<AddLiquidity expanded={expanded} />} />
                            <Route path="/remove-liquidity" element={<RemoveLiquidity expanded={expanded} />} />
                            <Route path="/burn-lp-tokens" element={<BurnLPTokens expanded={expanded} />} />
                            <Route path="/check-urc" element={<CheckURC expanded={expanded} />} />
                            <Route path="/my-urc" element={<MyUniqueReferralCode expanded={expanded} />} />
                            <Route path="/ask-ai" element={<AskAI expanded={expanded} />} />
                            <Route path="/social-developer" element={<SocialDeveloper expanded={expanded} />} />
                            <Route path="/social-urc-provider" element={<SocialURCProvider expanded={expanded} />} />
                            <Route path="/social-value-manager" element={<SocialValueManager expanded={expanded} />} />
                            <Route path="/token/:tokenMintAddress" element={<TokenDetail expanded={expanded} />} />
                            <Route path="/token/:tokenMintAddress/:referrerCode" element={<TokenDetail expanded={expanded} />} />
                        </Routes>
                    </div>
                </div>
                <Toaster 
                    position={isMobile ? "top-center" : "bottom-right"}
                    toastOptions={{
                        duration: 5000,
                    }}
                />
                <Footer />
            </div>
        </Providers>
    );
};

// 主 App 组件
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

    return (
        <Router>
            <ConnectionProvider endpoint={endpoint}>
                <WalletProvider 
                    wallets={wallets} 
                    autoConnect
                    onError={(error: Error) => {
                        console.error('Wallet error:', error);
                    }}
                >
                    <WalletModalProvider>
                        <AppContent />
                    </WalletModalProvider>
                </WalletProvider>
            </ConnectionProvider>
        </Router>
    );
}

export default App;
