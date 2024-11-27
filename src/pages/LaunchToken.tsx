import React from 'react';
import { TokenForm } from '../components/TokenForm';
import { TokenFormData } from '../types/types';

export const LaunchToken: React.FC = () => {
    const handleSubmit = (data: TokenFormData) => {
        console.log('Token data:', data);
        // TODO: Handle token creation logic
    };

    return (
        <div className="container mx-auto py-8">
            {/* <h1 className="text-3xl font-bold text-center mb-8">Launch New Token</h1> */}
            <TokenForm onSubmit={handleSubmit} />
        </div>
    );
};
