import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { MenuItem, SidebarProps } from '../../types/types';
import { LOCAL_STORAGE_KEY_EXPANDED } from '../../config/constants';

export const Sidebar: React.FC<SidebarProps> = ({
    menuItems,
    activeMenuItem,
    onMenuItemClick,
    onExpandedChange,
    isMobileOpen
}) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [expandedSubMenus, setExpandedSubMenus] = useState<string[]>([]);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // 监听窗口大小变化
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // 初始化检查

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 从 localStorage 加载展开状态
    useEffect(() => {
        const savedExpandedMenus = localStorage.getItem(LOCAL_STORAGE_KEY_EXPANDED);
        if (savedExpandedMenus) {
            try {
                setExpandedSubMenus(JSON.parse(savedExpandedMenus));
            } catch (e) {
                console.error('Failed to parse saved menu state:', e);
            }
        }
    }, []);

    // 保存展开状态到 localStorage
    const toggleSubMenu = (id: string) => {
        const newExpandedMenus = expandedSubMenus.includes(id)
            ? expandedSubMenus.filter(item => item !== id)
            : [...expandedSubMenus, id];
        
        setExpandedSubMenus(newExpandedMenus);
        localStorage.setItem(LOCAL_STORAGE_KEY_EXPANDED, JSON.stringify(newExpandedMenus));
    };

    // 处理展开/收起状态变化
    const handleExpandedChange = (expanded: boolean) => {
        setIsExpanded(expanded);
        onExpandedChange?.(expanded);
    };

    const renderMenuItem = (item: MenuItem, isSubItem: boolean = false) => {
        const hasSubItems = item.subItems && item.subItems.length > 0;
        const isSubMenuExpanded = expandedSubMenus.includes(item.id);

        return (
            <li key={item.id}>
                <a 
                    className={`mt-1 pt-3 pb-2
                        ${activeMenuItem === item.id ? 'active' : ''} 
                        ${isExpanded ? '' : 'justify-center'}
                        ${isSubItem ? 'pl-3' : ''}
                        flex items-center cursor-pointer
                    `}
                    onClick={() => {
                        if (hasSubItems) {
                            toggleSubMenu(item.id);
                        } else {
                            onMenuItemClick(item.id);
                        }
                    }}
                    title={!isExpanded ? item.label : undefined}
                >
                    <div className={isExpanded ? 'w-6 h-6' : 'w-6 h-6'}>
                        {item.icon}
                    </div>
                    {(isExpanded || isMobile) && (
                        <>
                            <span className="ml-1 flex-1">{item.label}</span>
                            {hasSubItems && (
                                <div className="w-4 h-4">
                                    {isSubMenuExpanded ? <FaChevronUp /> : <FaChevronDown />}
                                </div>
                            )}
                        </>
                    )}
                </a>
                {hasSubItems && isExpanded && isSubMenuExpanded && (
                    <ul className="menu">
                        {item.subItems?.map(subItem => renderMenuItem(subItem, true))}
                    </ul>
                )}
            </li>
        );
    };

    return (
        <div 
            className={`sidebar bg-base-300 p-1 duration-50 fixed inset-y-0 left-0 border-r-2 border-primary-content
                ${isMobile ? 'w-64' : isExpanded ? 'w-64' : 'w-20'}
                ${isMobile && !isMobileOpen ? '-translate-x-full' : 'translate-x-0'}
            `}
        >
            <button
                className="absolute -right-3 top-3 btn btn-circle btn-sm bg-base-300 hover:bg-base-300 md:flex items-center justify-center shadow-lg z-[100] hidden"
                onClick={() => handleExpandedChange(!isExpanded)}
                title={isExpanded ? 'Collapse menu' : 'Expand menu'}
            >
                {isExpanded ? <FaChevronLeft /> : <FaChevronRight />}
            </button>
            
            <div className={`h-full overflow-y-auto ${isMobile ? 'mt-16' : 'mt-6'}`}>
                <ul className="menu bg-base-300 w-full p-2 rounded-box">
                    {menuItems.map(item => renderMenuItem(item))}
                </ul>
            </div>
        </div>
    );
};
