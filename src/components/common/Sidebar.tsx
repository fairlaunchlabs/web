import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { MenuItem, SidebarProps } from '../../types/types';
import { LOCAL_STORAGE_KEY_EXPANDED } from '../../config/constants';
import { FaTwitter, FaDiscord, FaTelegram, FaGithub, FaMedium } from 'react-icons/fa';
import { socialLinks } from '../../config/social';
import { useDeviceType } from '../../utils/contexts';

export const Sidebar: React.FC<SidebarProps> = ({
  menuItems,
  activeMenuItem,
  onMenuItemClick,
  onExpandedChange,
  isMobileOpen
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedSubMenus, setExpandedSubMenus] = useState<string[]>([]);
  const socialIcons = [
    { icon: <FaTwitter className="w-5 h-5 md:w-6 md:h-6" />, ...socialLinks.twitter },
    { icon: <FaDiscord className="w-5 h-5 md:w-6 md:h-6" />, ...socialLinks.discord },
    { icon: <FaTelegram className="w-5 h-5 md:w-6 md:h-6" />, ...socialLinks.telegram },
    { icon: <FaGithub className="w-5 h-5 md:w-6 md:h-6" />, ...socialLinks.github },
    { icon: <FaMedium className="w-5 h-5 md:w-6 md:h-6" />, ...socialLinks.medium },
  ];

  const { isMobile, isDesktop } = useDeviceType();

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
      <div>
        {item.visible && <li key={item.id}>
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
            <div className={isExpanded ? 'w-6 h-3' : 'w-6 h-3'}>
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
        </li>}
      </div>
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
        {isExpanded ?
          <svg className='w-5 h-5' fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M16 5v2h-2V5h2zm-4 4V7h2v2h-2zm-2 2V9h2v2h-2zm0 2H8v-2h2v2zm2 2v-2h-2v2h2zm0 0h2v2h-2v-2zm4 4v-2h-2v2h2z" fill="currentColor" /> </svg>
          :
          <svg className='w-5 h-5' fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M8 5v2h2V5H8zm4 4V7h-2v2h2zm2 2V9h-2v2h2zm0 2h2v-2h-2v2zm-2 2v-2h2v2h-2zm0 0h-2v2h2v-2zm-4 4v-2h2v2H8z" fill="currentColor" /> </svg>
        }
      </button>

      {/* Menu items */}
      <div className={`h-full overflow-y-auto ${isMobile ? 'mt-16' : 'mt-6'}`}>
        <ul className="menu bg-base-300 w-full p-2 rounded-box">
          {menuItems.map(item => renderMenuItem(item))}
        </ul>
      </div>

      {/* Social icons */}
      <div className="absolute bottom-5 left-5">
        {socialIcons.map((social, index) => (
          <a
            key={index}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-circle btn-sm mr-3 mb-3"
            title={social.name}
          >
            {social.icon}
          </a>
        ))}
      </div>

    </div>
  );
};
