import { MyProfile } from "../components/social/MyProfile";
import { PageHeader } from "../components/common/PageHeader";

type SocialProfileProps = {
  expanded: boolean;
};

export const SocialProfile: React.FC<SocialProfileProps> = ({ expanded }) => {
  return (
    <div className={`space-y-3 md:p-4 md:mb-20 ${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
      <PageHeader title="My Profile" bgImage='/bg/group1/24.jpg' />
      <MyProfile />
    </div>
  );
};