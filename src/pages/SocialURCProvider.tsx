
export type SocialURCProviderProps = {
    expanded: boolean;
}

export const SocialURCProvider: React.FC<SocialURCProviderProps> = ({ expanded }) => {
    return (
        <div className={`card bg-base-200 shadow-xl ${expanded ? 'ml-64' : 'ml-20'}`}>
            <div className="card-body">
                <h2 className="card-title">Social URC Provider</h2>
                <p>Social URC provider functionality will be implemented here.</p>
            </div>
        </div>
    );
};