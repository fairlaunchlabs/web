import React from 'react';
import { FaTwitter, FaDiscord, FaTelegram, FaGithub, FaMedium } from 'react-icons/fa';
import { socialLinks } from '../../config/social';

export const Footer: React.FC = () => {
    const socialIcons = [
        { icon: <FaTwitter className="w-5 h-5 md:w-6 md:h-6" />, ...socialLinks.twitter },
        { icon: <FaDiscord className="w-5 h-5 md:w-6 md:h-6" />, ...socialLinks.discord },
        { icon: <FaTelegram className="w-5 h-5 md:w-6 md:h-6" />, ...socialLinks.telegram },
        { icon: <FaGithub className="w-5 h-5 md:w-6 md:h-6" />, ...socialLinks.github },
        { icon: <FaMedium className="w-5 h-5 md:w-6 md:h-6" />, ...socialLinks.medium },
    ];

    return (
        <footer className="footer footer-center p-2 border-t-2 border-primary-content md:p-4 bg-base-300 text-base-content fixed bottom-0 z-40">
            <div className="flex gap-2 md:gap-4">
                {socialIcons.map((social, index) => (
                    <a
                        key={index}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost btn-circle btn-sm md:btn-md"
                        title={social.name}
                    >
                        {social.icon}
                    </a>
                ))}
            </div>
        </footer>
    );
};
