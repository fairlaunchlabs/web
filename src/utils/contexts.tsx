import React, { createContext, useContext, useState, useEffect } from 'react';

// Theme Context
interface ThemeContextType {
    isDarkMode: boolean;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const darkMode = document.documentElement.classList.contains('dark');
        // 初始化时确保 HTML 类名与状态一致
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        return darkMode;
    });

    const toggleTheme = () => {
        setIsDarkMode(prev => !prev);
    };

    useEffect(() => {
        const root = document.documentElement;
        if (isDarkMode) {
            root.classList.add('dark');
            root.setAttribute('data-theme', 'dark');
        } else {
            root.classList.remove('dark');
            root.setAttribute('data-theme', 'light');
        }
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
