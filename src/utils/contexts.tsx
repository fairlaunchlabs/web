import React, { createContext, useContext, useState, useEffect } from 'react';
import { DARK_THEME, LIGHT_THEME, LOCAL_STORAGE_KEY_THEME } from '../config/constants';

// Theme Context
interface ThemeContextType {
    isDarkMode: boolean;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        // 从localStorage获取主题设置
        const savedTheme = localStorage.getItem(LOCAL_STORAGE_KEY_THEME);
        const prefersDark = savedTheme === 'dark' || 
            (savedTheme === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
        
        // 初始化时确保 HTML 类名与状态一致
        if (prefersDark) {
            document.documentElement.classList.add('dark');
            document.documentElement.setAttribute('data-theme', DARK_THEME);
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.setAttribute('data-theme', LIGHT_THEME);
        }
        return prefersDark;
    });

    const toggleTheme = () => {
        setIsDarkMode(prev => !prev);
    };

    useEffect(() => {
        const root = document.documentElement;
        const newTheme = isDarkMode ? DARK_THEME : LIGHT_THEME;
        
        // 更新DOM
        if (isDarkMode) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        root.setAttribute('data-theme', newTheme);
        
        // 保存到localStorage
        localStorage.setItem(LOCAL_STORAGE_KEY_THEME, newTheme);
    }, [isDarkMode]);

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

// 组合所有Providers
interface ProvidersProps {
    children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
    return (
        <ThemeProvider>
            {children}
        </ThemeProvider>
    );
};


// 定义设备类型枚举
export enum DeviceType {
    Mobile = 'mobile',
    Desktop = 'desktop'
  }
  
  // 定义断点
  const MOBILE_BREAKPOINT = 768; // 小于这个宽度认为是移动设备
  
  export const useDeviceType = () => {
    // 初始化设备类型状态
    const [deviceType, setDeviceType] = useState<DeviceType>(() => {
      // 初始化时判断窗口宽度
      return window.innerWidth < MOBILE_BREAKPOINT
        ? DeviceType.Mobile
        : DeviceType.Desktop;
    });
  
    useEffect(() => {
      // 创建处理窗口大小变化的函数
      const handleResize = () => {
        const width = window.innerWidth;
        const newDeviceType = width < MOBILE_BREAKPOINT
          ? DeviceType.Mobile
          : DeviceType.Desktop;
        
        setDeviceType(newDeviceType);
      };
  
      // 添加事件监听器
      window.addEventListener('resize', handleResize);
  
      // 清理函数
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, []); // 空依赖数组，只在组件挂载时运行
  
    // 返回当前设备类型和一些辅助函数
    return {
      deviceType,
      isMobile: deviceType === DeviceType.Mobile,
      isDesktop: deviceType === DeviceType.Desktop
    };
  };
  