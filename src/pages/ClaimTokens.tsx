import { PageHeader } from "../components/common/PageHeader";

export type ClaimTokensProps = {
  expanded: boolean;
}
export const ClaimTokens: React.FC<ClaimTokensProps> = ({ expanded }) => {
  return (
    <div className={`space-y-0 md:p-4 ${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
      <PageHeader title="Claim Tokens" bgImage='/bg/group1/12.jpg' />
      <p>Claim your tokens which are locked in the mint period.</p>
    </div>

  );
};