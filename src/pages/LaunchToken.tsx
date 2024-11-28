import React from 'react';
import { LaunchTokenForm } from '../components/launchToken/LaunchTokenForm';
import { TokenFormData } from '../types/types';

type LaunchTokenProps = {
    expanded: boolean;
};
export const LaunchToken: React.FC<LaunchTokenProps> = ({ expanded }) => {
    const handleSubmit = (data: TokenFormData) => {
        console.log('Token data:', data);
        // TODO: Handle token creation logic
    };

    return (
        <div className={`mx-auto py-8 ${expanded ? 'md:ml-40' : 'md:ml-20'}`}>
            {/* <h1 className="text-3xl font-bold text-center mb-8">Launch New Token</h1> */}
            <LaunchTokenForm onSubmit={handleSubmit} />
        </div>
    );
};
