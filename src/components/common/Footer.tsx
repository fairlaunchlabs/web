import React, { useEffect, useState } from 'react';
import { Logo } from './Logo';
import { useDeviceType } from '../../utils/contexts';

export const Footer: React.FC = () => {
  const { isMobile } = useDeviceType();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (isMobile) {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.scrollY;
        const showThreshold = documentHeight - windowHeight - 300;
        setIsVisible(scrollTop >= showThreshold);
      } else {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMobile]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="footer footer-center p-3 border-t-2 border-primary-content md:p-4 bg-base-300 fixed bottom-0 z-40">
      <a
        href="/"
        className={`btn`}
        onClick={(e) => {
          e.preventDefault();
          window.location.href = '/discover';
        }}
      >
        <Logo />
      </a>
    </div>
  );
};
