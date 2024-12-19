import React, { FC } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { CommonPageProps } from '../types/types';

export const CreateMarketId: FC<CommonPageProps> = ({
    expanded
}) => {
    return (
        <div className={`space-y-0 md:p-4 ${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
            <PageHeader title="Create Market ID" bgImage='/bg/group1/7.jpg' />
            <p>Market ID creation functionality will be implemented here.</p>
        </div>
    )

};

export const CreateLiquidityPool: FC<CommonPageProps> = ({
    expanded
}) => {
    return (
        <div className={`space-y-0 md:p-4 ${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
            <PageHeader title="Create Liquidity Pool" bgImage='/bg/group1/8.jpg' />
            <p>Liquidity pool creation functionality will be implemented here.</p>
        </div>
    );
};

export const AddLiquidity: FC<CommonPageProps> = ({
    expanded
}) => {
    return (
        <div className={`space-y-0 md:p-4 ${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
            <PageHeader title="Add Liquidity" bgImage='/bg/group1/9.jpg' />
            <p>Add liquidity functionality will be implemented here.</p>
        </div>
    );
};

export const RemoveLiquidity: FC<CommonPageProps> = ({
    expanded
}) => {
    return (
        <div className={`space-y-0 md:p-4 ${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
            <PageHeader title="Remove Liquidity" bgImage='/bg/group1/10.jpg' />
            <p>Remove liquidity functionality will be implemented here</p>
        </div>
    );
};

export const BurnLPTokens: FC<CommonPageProps> = ({
    expanded
}) => {
    return (
        <div className={`space-y-0 md:p-4 ${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
            <PageHeader title="Burn LP Tokens" bgImage='/bg/group1/11.jpg' />
            <p>LP token burning functionality will be implemented here.</p>
        </div>
    );
};
