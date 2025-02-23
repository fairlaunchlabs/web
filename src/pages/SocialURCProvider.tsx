import { PageHeader } from "../components/common/PageHeader";

export type SocialURCProviderProps = {
  expanded: boolean;
}

export const SocialURCProvider: React.FC<SocialURCProviderProps> = ({ expanded }) => {
  return (
    <div className={`space-y-0 md:p-4 md:mb-20 ${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
      <PageHeader title="URC Provider" bgImage='/bg/group1/22.jpg' />
      <p>Social URC provider functionality will be implemented here.</p>
    </div>
  );
};