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

// 在这里可以继续添加其他的Context
// 例如：
/*
// User Context
interface UserContextType {
    user: User | null;
    login: (user: User) => void;
    logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // ... implementation
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

// 然后在Providers组件中添加：
export const Providers: React.FC<ProvidersProps> = ({ children }) => {
    return (
        <ThemeProvider>
            <UserProvider>
                {children}
            </UserProvider>
        </ThemeProvider>
    );
};
*/
