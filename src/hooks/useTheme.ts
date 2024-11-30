import { useEffect, useState } from 'react';
import { LOCAL_STORAGE_KEY_THEME  } from '../config/constants';

export const useTheme = () => {
    const [theme, setTheme] = useState<Theme>(() => {
        // 从 localStorage 获取保存的主题，如果没有则使用 light
        const savedTheme = localStorage.getItem(LOCAL_STORAGE_KEY_THEME);
        return (savedTheme as Theme) || 'light';
    });

    useEffect(() => {
        // 保存主题到 localStorage
        localStorage.setItem(LOCAL_STORAGE_KEY_THEME, theme);
        // 更新 document 的 data-theme 属性
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    return { theme, toggleTheme };
};
