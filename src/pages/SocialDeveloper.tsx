
export type SocialDeployerProps = {
    expanded: boolean;
}
export const SocialDeveloper: React.FC<SocialDeployerProps> = ({ expanded }) => {
    return (
        <div className={`card bg-base-200 shadow-xl ${expanded ? 'ml-64' : 'ml-20'}`}>
            <div className="card-body">
                <h2 className="card-title">Social Deploy</h2>
                <p>Social deploy functionality will be implemented here.</p>
            </div>
        </div>
    );
};