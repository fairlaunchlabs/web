import { Discover } from '../pages/Discover';
import { 
    MdQrCodeScanner,
    MdPool,
    MdAddBox,
    MdOutlineRealEstateAgent,
} from 'react-icons/md';
import { MyMintedTokens } from '../pages/MyMintedTokens';
import { LaunchTokenForm } from '../pages/LaunchToken';
import { MenuItem } from '../types/types';
import { CheckURC } from '../components/tools/CheckURC';
import { MyUniqueReferralCode } from '../components/tools/MyUniqueReferralCode';
import { AskAI } from '../pages/AskAI';
import { SocialDeveloper } from '../pages/SocialDeveloper';
import { SocialURCProvider } from '../pages/SocialURCProvider';
import { SocialValueManager } from '../pages/SocialValueManager';
import { MyDeployments } from '../pages/MyDeployments';
import { CreateLiquidityPool } from '../pages/CreateLiquidityPool';
import { ManageLiquidity } from '../pages/ManageLiquidity';
import { ClaimTokens } from '../pages/ClaimTokens';
import { DelegatedTokens } from '../pages/DelegatedTokens';

export const menuItems = (expended: boolean): MenuItem[] => [
    { 
        id: 'discover', 
        label: 'Discover', // Mint or mine tokens
        icon: <svg className='w-5 h-5' xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"> <path d="M13 2h-2v4h2V2Zm2 6H9v2H7v4h2v4h6v-4h2v-4h-2V8Zm0 2v4h-2v2h-2v-2H9v-4h6ZM9 20h6v2H9v-2Zm14-9v2h-4v-2h4ZM5 13v-2H1v2h4Zm12-7h2v2h-2V6Zm2 0h2V4h-2v2ZM5 6h2v2H5V6Zm0 0V4H3v2h2Z" /> </svg>,
        component: <Discover expanded={expended} /> 
    },
    { 
        id: 'launch-token', 
        label: 'Launch Token', // Launch a new crypto token
        icon: <svg className='w-5 h-5' fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M6 2h12v2H6V2zM4 6V4h2v2H4zm0 12V6H2v12h2zm2 2v-2H4v2h2zm12 0v2H6v-2h12zm2-2v2h-2v-2h2zm0-12h2v12h-2V6zm0 0V4h-2v2h2zm-9-1h2v2h3v2h-6v2h6v6h-3v2h-2v-2H8v-2h6v-2H8V7h3V5z" fill="currentColor"/> </svg>,
        component: <LaunchTokenForm expanded={expended} /> 
    },
    { 
        id: 'my-minted-tokens', 
        label: 'My mint tokens', // My token list
        icon: <svg className='w-5 h-5' fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M18 3H2v18h18v-4h2V7h-2V3h-2zm0 14v2H4V5h14v2h-8v10h8zm2-2h-8V9h8v6zm-4-4h-2v2h2v-2z" fill="currentColor"/> </svg>,
        component: <MyMintedTokens expanded={expended} /> 
    },
    {
        id: `tools`,
        label: `Tools`, // URC means unique referral code, this is tools for URC management
        icon: <MdQrCodeScanner className="w-5 h-5" />,
        component: null,
        subItems: [
            {
                id: 'check-urc',
                label: 'Validate URC', // validate code
                icon: <svg className='w-5 h-5' fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M8 6h8v2H8V6zm-4 4V8h4v2H4zm-2 2v-2h2v2H2zm0 2v-2H0v2h2zm2 2H2v-2h2v2zm4 2H4v-2h4v2zm8 0v2H8v-2h8zm4-2v2h-4v-2h4zm2-2v2h-2v-2h2zm0-2h2v2h-2v-2zm-2-2h2v2h-2v-2zm0 0V8h-4v2h4zm-10 1h4v4h-4v-4z" fill="currentColor"/> </svg>,
                component: <CheckURC expanded={expended} />
            },
            {
                id: 'my-urc',
                label: 'My URC', // my URC code list
                icon: <svg className='w-5 h-5' fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M8 5h2v2H8V5zM6 7h2v2H6V7zM4 9h2v2H4V9zm-2 2h2v2H2v-2zm2 2h2v2H4v-2zm2 2h2v2H6v-2zm2 2h2v2H8v-2zm8-12h-2v2h2V5zm2 2h-2v2h2V7zm2 2h-2v2h2V9zm2 2h-2v2h2v-2zm-2 2h-2v2h2v-2zm-2 2h-2v2h2v-2zm-2 2h-2v2h2v-2z" fill="currentColor"/> </svg>,
                component: <MyUniqueReferralCode expanded={expended} />
            },
            {
                id: 'my-deployments',
                label: 'My Deployment',
                icon: <svg className='w-5 h-5' fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M4 4h6v8H2V4h2zm4 6V6H4v4h4zm14-4H12v2h10V6zm0 4H12v2h10v-2zm0 4v2H2v-2h20zm0 6v-2H2v2h20z" fill="currentColor"/> </svg>,
                component: <MyDeployments expanded={expended} />
            },
            {
                id: 'claim-tokens',
                label: 'Claim Tokens',
                icon: <svg className='w-5 h-5' fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M11 1H9v2h2v2H5v2H3v10h2v2h2v-2H5V7h6v2H9v2h2V9h2V7h2V5h-2V3h-2V1zm8 4h-2v2h2v10h-6v-2h2v-2h-2v2h-2v2H9v2h2v2h2v2h2v-2h-2v-2h6v-2h2V7h-2V5z" fill="currentColor"/> </svg>,
                component: <ClaimTokens expanded={expended} />

            }
        ]
    },
    {
        id: 'token-management',
        label: 'Token Management',
        icon: <svg className='w-5 h-5' fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M9 2h2v2H9V2zm4 4V4h-2v2H9v2H7v2H5v2H3v2h2v2h2v2h2v2h2v2h2v-2h2v-2h2v-2h2v6h2V12h-2v-2h-2V8h-2V6h-2zm0 0v2h2v2h2v2h2v2H5v-2h2v-2h2V8h2V6h2z" fill="currentColor"/> </svg>,
        component: null,
        subItems: [
            {
                id: 'my-delegated-tokens',
                label: 'Delegated tokens',
                icon: <MdOutlineRealEstateAgent className="w-5 h-5" />,
                component: <DelegatedTokens expanded={expended} />
            },
            {
                id: 'create-liquidity-pool',
                label: 'Create Pool',
                icon: <MdPool className="w-5 h-5" />,
                component: <CreateLiquidityPool expanded={expended} />
            },
            {
                id: 'manage-liquidity',
                label: 'Manage Liquidity',
                icon: <MdAddBox className="w-5 h-5" />,
                component: <ManageLiquidity expanded={expended} />
            },
        ]
    },
    {
        id: `social`,
        label: `Social`,
        icon: <svg className='w-5 h-5' fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M11 0H5v2H3v6h2v2h6V8H5V2h6V0zm0 2h2v6h-2V2zM0 14h2v4h12v2H0v-6zm2 0h12v-2H2v2zm14 0h-2v6h2v-6zM15 0h4v2h-4V0zm4 8h-4v2h4V8zm0-6h2v6h-2V2zm5 12h-2v4h-4v2h6v-6zm-6-2h4v2h-4v-2z" fill="currentColor"/> </svg>,
        component: null,
        subItems: [
            {
                id: 'social-developer',
                label: 'Developer', // here you can find and follow developers who launch tokens
                icon: <svg className='w-5 h-5' fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M11 4h2v2h-2V4zM9 8V6h2v2H9zm0 0v2H7V8h2zm6 0h-2V6h2v2zm0 0h2v2h-2V8zm-6 8H7v-2h2v2zm2 2H9v-2h2v2zm2 0v2h-2v-2h2zm2-2h-2v2h2v-2zm0 0v-2h2v2h-2z" fill="currentColor"/> </svg>,
                component: <SocialDeveloper expanded={expended} />
            },
            {
                id: 'social-urc-provider',
                label: 'URC provider', // here you can find URC providers
                icon: <svg className='w-5 h-5' fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M6 4h14v2h2v6h-8v2h6v2h-4v2h-2v2H2V8h2V6h2V4zm2 6h2V8H8v2z" fill="currentColor"/> </svg>,
                component: <SocialURCProvider expanded={expended} />
            },
            {
                id: 'social-value-manager',
                label: 'Value Manager', // here you can find Value manager to manage the token value
                icon: <svg className='w-5 h-5' fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M4 2H2v8h2V2zm16 0h2v8h-2V2zm-6 6h-4V2H4v2h4v4H4v2h4v4H4v2h4v4H4v2h6v-6h4v6h2v-6h4v-2h-4v-4h4V8h-4V2h-2v6zm-4 6v-4h4v4h-4zM20 2h-4v2h4V2zM2 14h2v8H2v-8zm14 6h4v2h-4v-2zm6-6h-2v8h2v-8z" fill="currentColor"/> </svg>,
                component: <SocialValueManager expanded={expended} />
            }
        ]
    },
    {
        id: 'ask-ai',
        label: 'Ask AI', // Here you can ask ChatGPT everything about this platform
        icon: <svg className='w-5 h-5' fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M2 5h2v2H2V5zm4 4H4V7h2v2zm2 0H6v2H4v2H2v6h20v-6h-2v-2h-2V9h2V7h2V5h-2v2h-2v2h-2V7H8v2zm0 0h8v2h2v2h2v4H4v-4h2v-2h2V9zm2 4H8v2h2v-2zm4 0h2v2h-2v-2z" fill="currentColor"/> </svg>,
        component: <AskAI expanded={expended} />
    }
];
