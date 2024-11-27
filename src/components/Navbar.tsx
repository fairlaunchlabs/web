import React, { useEffect } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { FaSun, FaMoon, FaBars } from 'react-icons/fa';
import { useTheme } from '../hooks/useTheme';
import { NavbarProps } from '../types/types';

export const Navbar: React.FC<NavbarProps> = ({ 
    title = "Logo",
    onMenuClick,
    isMenuOpen 
}) => {
    const { theme, toggleTheme } = useTheme();

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
        <nav className="fixed top-0 left-0 right-0 z-50 bg-base-100 shadow-md">
            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* 左侧区域：菜单按钮和Logo */}
                    <div className="flex-1 flex items-center">
                        <button 
                            className={`menu-button btn btn-ghost btn-circle md:hidden ${theme === 'light' ? 'hover:bg-gray-200' : ''}`}
                            onClick={onMenuClick}
                        >
                            <FaBars className="w-5 h-5" />
                        </button>
                        <a 
                            href="/" 
                            className={`btn btn-ghost normal-case text-lg md:text-xl ${theme === 'light' ? 'hover:bg-gray-200' : ''}`}
                            onClick={(e) => {
                                e.preventDefault();
                                window.location.href = '/';
                            }}
                        >
                            {title}
                        </a>
                    </div>

                    {/* 右侧区域：主题切换和钱包按钮 */}
                    <div className="flex-1 flex items-center justify-end gap-2">
                        <button 
                            className={`btn btn-ghost btn-circle ${theme === 'light' ? 'hover:bg-gray-200' : ''}`}
                            onClick={toggleTheme}
                            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                        >
                            {theme === 'light' ? (
                                <FaMoon className="w-5 h-5" />
                            ) : (
                                <FaSun className="w-5 h-5" />
                            )}
                        </button>
                        <div className="">
                            <WalletMultiButton 
                                className={`btn btn-primary whitespace-nowrap min-w-[160px] ${theme === 'light' ? 'hover:bg-primary-focus' : ''}`}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};
