
export type AskAIProps = {
    expanded: boolean;
}
export const AskAI: React.FC<AskAIProps> = ({ expanded }) => {
    return (
        <div className={`card bg-base-200 shadow-xl ${expanded ? 'ml-64' : 'ml-20'}`}>
            <div className="card-body">
                <h2 className="card-title">Ask AI</h2>
                <p>AI functionality will be implemented here.</p>
            </div>
        </div>
    );
};