import React from 'react';
import { APP_NAME } from '../../config/constants';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
    return (
        <div className="footer footer-center p-3 border-t-2 border-primary-content md:p-4 bg-base-300 text-base-content fixed bottom-0 z-40">
            <a 
                href="/" 
                className={`btn`}
                onClick={(e) => {
                    e.preventDefault();
                    window.location.href = '/';
                }}
            >
                <Logo />
            </a>
        </div>
    );
};
