import React, { useEffect } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { FaBars } from 'react-icons/fa';
import { NavbarProps } from '../../types/types';
import { Logo } from './Logo';
import { useDeviceType } from '../../utils/contexts';

export const Navbar: React.FC<NavbarProps> = ({ 
    title = "Logo",
    onMenuClick,
    isMenuOpen 
}) => {
    const { isMobile, isDesktop } = useDeviceType();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // 如果菜单是打开状态，且点击的不是菜单按钮或其子元素
            const menuButton = document.querySelector('.menu-button');
            const sidebar = document.querySelector('.sidebar');
            if (isMenuOpen && menuButton && sidebar) {
                if (!menuButton.contains(event.target as Node) && !sidebar.contains(event.target as Node)) {
                    onMenuClick?.();
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen, onMenuClick]);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-base-300 shadow-md border-b-2 border-primary-content">
            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* 左侧区域：菜单按钮和Logo */}
                    <div className="flex-1 flex items-center">
                        <button 
                            className={`menu-button btn btn-ghost btn-circle md:hidden`}
                            onClick={onMenuClick}
                        >
                            <FaBars className="w-5 h-5" />
                        </button>
                        {isDesktop && 
                        <a 
                            href="/" 
                            className={``}
                            onClick={(e) => {
                                e.preventDefault();
                                window.location.href = '/home';
                            }}
                        >
                            <Logo />
                        </a>
                        }
                    </div>

                    {/* 右侧区域：主题切换和钱包按钮 */}
                    <div className="flex-1 flex items-center justify-end gap-2">
                        {/* <button 
                            className={`btn btn-ghost btn-circle ${isDarkMode ? '' : 'hover:bg-base-200'}`}
                            onClick={toggleTheme}
                            title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
                        >
                            {isDarkMode ? (
                                <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"> <path d="M13 0h-2v4h2V0ZM0 11v2h4v-2H0Zm24 0v2h-4v-2h4ZM13 24h-2v-4h2v4ZM8 6h8v2H8V6ZM6 8h2v8H6V8Zm2 10v-2h8v2H8Zm10-2h-2V8h2v8Zm2-14h2v2h-2V2Zm0 2v2h-2V4h2Zm2 18h-2v-2h2v2Zm-2-2h-2v-2h2v2ZM4 2H2v2h2v2h2V4H4V2ZM2 22h2v-2h2v-2H4v2H2v2Z"/> </svg>
                            ) : (
                                <svg className='w-6 h-6' xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"> <path d="M6 2h8v2h-2v2h-2V4H6V2ZM4 6V4h2v2H4Zm0 10H2V6h2v10Zm2 2H4v-2h2v2Zm2 2H6v-2h2v2Zm10 0v2H8v-2h10Zm2-2v2h-2v-2h2Zm-2-4h2v4h2v-8h-2v2h-2v2Zm-6 0v2h6v-2h-6Zm-2-2h2v2h-2v-2Zm0 0V6H8v6h2Z"/> </svg>
                            )}
                        </button> */}
                        <div className="">
                            <WalletMultiButton 
                                className={`btn btn-primary whitespace-nowrap min-w-[160px]`}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};
