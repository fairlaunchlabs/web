import React, { useEffect, useState } from 'react';
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
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        if (isMobile) {
          if (window.scrollY > lastScrollY && window.scrollY > 50) {
            setIsVisible(false);
          } else {
            setIsVisible(true);
          }
          setLastScrollY(window.scrollY);
        } else {
          setIsVisible(true);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlNavbar);
      return () => {
        window.removeEventListener('scroll', controlNavbar);
      };
    }
  }, [lastScrollY, isMobile]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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
    <nav className={`fixed top-0 left-0 right-0 z-50 bg-base-300 shadow-md border-b-2 border-primary-content transition-transform duration-300 ${!isVisible ? '-translate-y-full' : 'translate-y-0'}`}>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
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

          <div className="flex-1 flex justify-end">
            <WalletMultiButton className='btn btn-ghost' />
          </div>
        </div>
      </div>
    </nav>
  );
};
