import { PageHeader } from "../components/common/PageHeader";

export type SocialDeveloperProps = {
  expanded: boolean;
}
export const SocialDeveloper: React.FC<SocialDeveloperProps> = ({ expanded }) => {
  return (
    <div className={`space-y-0 md:p-4 md:mb-20 ${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
      <PageHeader title="Developer" bgImage='/bg/group1/23.jpg' />
      <p>Social developer functionality will be implemented here.</p>
    </div>
  );
};