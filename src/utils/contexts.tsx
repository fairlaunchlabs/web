import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DARK_THEME, LIGHT_THEME, LOCAL_STORAGE_KEY_THEME } from '../config/constants';
import { getFollowing, isRegistered, login, register } from './user';
import { getWalletAddressFromToken, signMessageWithWallet } from './web3';
import { User } from '../types/types';
import { UsernameModal } from '../components/common/UsernameModal';
import { generateDefaultUsername } from './format';
import toast from 'react-hot-toast';
import { AnchorWallet, useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { getProvider } from '../utils/web3';

// ===========================================
// ============= Theme Context ==============
// ===========================================
interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Get theme from localStorage
    const savedTheme = localStorage.getItem(LOCAL_STORAGE_KEY_THEME);
    const prefersDark = savedTheme === 'dark' ||
      (savedTheme === null && window.matchMedia('(prefers-color-scheme: dark)').matches);

    // Initialize with HTML class and state
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

    // Update DOM
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.setAttribute('data-theme', newTheme);

    // Save to localStorage
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

// ==========================================
// ============ Device Type Hook ============
// ==========================================
export enum DeviceType {
  Mobile = 'mobile',
  Desktop = 'desktop'
}

// Define breakpoint
const MOBILE_BREAKPOINT = 768; // Define breakpoint

export const useDeviceType = () => {
  // Initialize device type state
  const [deviceType, setDeviceType] = useState<DeviceType>(() => {
    return window.innerWidth < MOBILE_BREAKPOINT
      ? DeviceType.Mobile
      : DeviceType.Desktop;
  });

  useEffect(() => {
    // Create function to handle window resize
    const handleResize = () => {
      const width = window.innerWidth;
      const newDeviceType = width < MOBILE_BREAKPOINT
        ? DeviceType.Mobile
        : DeviceType.Desktop;

      setDeviceType(newDeviceType);
    };

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Clean up event listener on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Return current device type and some helper functions
  return {
    deviceType,
    isMobile: deviceType === DeviceType.Mobile,
    isDesktop: deviceType === DeviceType.Desktop
  };
};

// ==========================================
// ============ Auth Context ===============
// ==========================================
interface AuthContextType {
  token: string | null;
  walletAddress: string | null;
  handleLogin: () => Promise<void>;
  logout: () => void;
  following: User[];
  refreshFollowing: () => Promise<void>;
  isUsernameModalOpen: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const hasWalletListener = { current: false }; // Use this as signal to prevent multiple listeners being registered

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { publicKey, connect, disconnect, signMessage } = useWallet();
  const { connection } = useConnection();

  const [token, setToken] = useState<string | null>(localStorage.getItem('flipflop_token'));
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [following, setFollowing] = useState<User[]>([]);
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false);
  const [pendingRegistration, setPendingRegistration] = useState<{
    publicKey: string;
    signatureBase58: string;
    message: string;
  } | null>(null);
  const initialLoginAttemptedRef = React.useRef(false); // Use this as signal to prevent multiple login attempts
  const handledLoginRef = React.useRef(false); // Use this as signal to prevent multiple login attempts
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Define callback functions first
  const refreshFollowing = async () => {
    if (token) {
      try {
        const result = await getFollowing(token);
        if (!result.success) {
          toast.error(result.message as string);
          return;
        }
        setFollowing(result.data);
      } catch (error) {
        console.error('Failed to fetch following:', error);
      }
    }
  };

  const logout = () => {
    setToken(null);
    setWalletAddress(null);
    setFollowing([]);
    localStorage.removeItem('flipflop_token');
    disconnect();
  };

  const handleLogin = async () => {
    // Prevent multiple login attempts
    if (isLoggingIn || isUsernameModalOpen || pendingRegistration) {
      return;
    }
    setIsLoggingIn(true);
    
    if (!publicKey) {
      try {
        await connect(); // 连接钱包
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        setIsLoggingIn(false);
        return;
      }
    }

    try {
      // Wait until sign the message
      const { publicKey: pubKey, signatureBase58, message } = await signMessageWithWallet();

      try {
        const result = await login(pubKey, signatureBase58, message);
        if (result.success) {
          const token = result.token;
          setToken(token);
          setWalletAddress(pubKey);
          localStorage.setItem('flipflop_token', token);
          await refreshFollowing();
        }
      } catch (loginError: any) {
        if (loginError.response?.status === 404) {
          // Open register box if not registered
          setPendingRegistration({ publicKey: pubKey, signatureBase58, message });
          setIsUsernameModalOpen(true);
        } else {
          throw loginError;
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
    }
  };

  // Handle username submission from modal
  const handleUsernameSubmit = async (username: string) => {
    setIsUsernameModalOpen(false);
    if (!pendingRegistration) return;
    try {
      const { publicKey, signatureBase58, message } = pendingRegistration;
      const roles = 'issuer,participant,promoter'; // roles: participant, promoter, manager, issuer
      const result = await register(publicKey, username, roles, signatureBase58, message);
      if (result.success) {
        const token = result.token;
        setToken(token);
        setWalletAddress(publicKey);
        localStorage.setItem('flipflop_token', token);
        await refreshFollowing();
      }
      // Clear pending registration
      setPendingRegistration(null);
    } catch (error) {
      alert('Registration failed. Please try again.');
    }
  };

  const tryLoadLocalToken = (provider: any) => {
    if (provider.publicKey) {
      const storedToken = localStorage.getItem('flipflop_token');
      if (storedToken) {
        setToken(storedToken);
        const walletAddressFromToken = getWalletAddressFromToken(storedToken);
        if (walletAddressFromToken == provider.publicKey.toString()) {
          setWalletAddress(walletAddressFromToken);          
          refreshFollowing();
        } else {
          logout();
          handleLogin();
        }
      } else {
        if (!isLoggingIn && !isUsernameModalOpen && !pendingRegistration && !handledLoginRef.current) {
          handledLoginRef.current = true;
          handleLogin();
        }
      }
    }
  };

  const setupWalletListeners = () => {
    const provider = (window as any).solana;
    if (!provider) {
      alert('Please install Solana wallet');
      return;
    }
    if (!initialLoginAttemptedRef.current) {
      initialLoginAttemptedRef.current = true;
      tryLoadLocalToken(provider);
    }
  
    const handleWalletChange = async () => {
      const currentProvider = (window as any).solana;
      if (currentProvider && currentProvider.publicKey) {
        const currentAddress = currentProvider.publicKey.toString();
        const result = await isRegistered(currentAddress as string);
        if (result.success) {
          if (result.data.isRegistered) tryLoadLocalToken(currentProvider);
          else if (walletAddress !== currentAddress) {
            if (!isLoggingIn && !isUsernameModalOpen && !pendingRegistration && !handledLoginRef.current) {
              handledLoginRef.current = true;
              handleLogin();
            }
          }
        } else {
          toast.error(result.message as string);
        }
      } else {
        logout();
      }
    };
  
    if (provider && !hasWalletListener.current) {
      provider.on('connect', handleWalletChange);
      provider.on('disconnect', handleWalletChange);
      provider.on('accountChanged', handleWalletChange);
      hasWalletListener.current = true;
    }
  
    return () => {
      if (provider && hasWalletListener.current) {
        provider.off('connect', handleWalletChange);
        provider.off('disconnect', handleWalletChange);
        provider.off('accountChanged', handleWalletChange);
        hasWalletListener.current = false;
      }
    };
  };

  useEffect(() => {
    const cleanup = setupWalletListeners();
    return cleanup;
  }, [walletAddress, handleLogin, logout, refreshFollowing, isLoggingIn, isUsernameModalOpen, pendingRegistration]);

  return (
    <AuthContext.Provider value={{ 
      token, 
      walletAddress, 
      handleLogin, 
      logout, 
      following, 
      refreshFollowing,
      isUsernameModalOpen
    }}>
      {children}
      {pendingRegistration && (
        <UsernameModal
          isOpen={isUsernameModalOpen}
          onClose={() => {
            setIsUsernameModalOpen(false);
            setPendingRegistration(null);
          }}
          onSubmit={handleUsernameSubmit}
          defaultUsername={generateDefaultUsername(pendingRegistration.publicKey)}
        />
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

// ==========================================
// ============ Root Provider ==============
// ==========================================

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
};
