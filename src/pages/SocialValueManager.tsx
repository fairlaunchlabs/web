import { PageHeader } from "../components/common/PageHeader";

export type SocialValueManagerProps = {
    expanded: boolean;
}
export const SocialValueManager: React.FC<SocialValueManagerProps> = ({ expanded }) => {
    return (
        <div className={`space-y-0 md:p-4 ${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
            <PageHeader title="Value Manager" bgImage='/bg/group1/21.jpg' />
            <p>Social value manager functionality will be implemented here.</p>
        </div>
    );
};