import React, { FC, useMemo, useState, useEffect } from 'react';
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
    const [selectedMenuItem, setSelectedMenuItem] = useState(() => {
        return localStorage.getItem('selectedMenuItem') || 'balance';
    });

    useEffect(() => {
        localStorage.setItem('selectedMenuItem', selectedMenuItem);
    }, [selectedMenuItem]);

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
                                    onMenuItemClick={(id: string) => {
                                        setSelectedMenuItem(id);
                                        setIsSidebarOpen(false);
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
