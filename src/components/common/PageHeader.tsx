import React from 'react';
import { useDeviceType } from '../../utils/contexts';

interface PageHeaderProps {
    title: string;
    bgImage?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, bgImage }) => {
    const { isMobile } = useDeviceType();
    const defaultBgImage = '/bg/group1/1.jpg';
    const aspectRatio = isMobile ? '40%' : '16%'; // 5:2 aspect ratio = 40% padding-bottom

    return (
        <div className="relative mb-4 -mt-3.5 -ml-4 -mr-4 md:-mt-12 md:-ml-12 md:-mr-12 md:mb-12">
            <div 
                className="w-full relative"
                style={{ paddingBottom: aspectRatio }}
            >
                <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ 
                        backgroundImage: `url(${bgImage || defaultBgImage})`,
                    }}
                >
                    {/* Overlay gradient */}
                    <div className="absolute inset-0"></div>
                    
                    {/* Title with neobrutalism shadow */}
                    <div className="absolute bottom-4 left-6 md:bottom-8 md:left-48">
                        <h1 
                            className="text-2xl md:text-4xl font-bold text-white relative inline-block"
                            style={{
                                textShadow: `
                                    2px 2px 0 #000,
                                    4px 4px 0 #000
                                `
                            }}
                        >
                            {title}
                        </h1>
                    </div>
                </div>
            </div>
        </div>
    );
};