
export type SocialValueManagerProps = {
    expanded: boolean;
}
export const SocialValueManager: React.FC<SocialValueManagerProps> = ({ expanded }) => {
    return (
        <div className={`card bg-base-200 shadow-xl ${expanded ? 'ml-64' : 'ml-20'}`}>
            <div className="card-body">
                <h2 className="card-title">Social Value Manager</h2>
                <p>Social value manager functionality will be implemented here.</p>
            </div>
        </div>
    );
};