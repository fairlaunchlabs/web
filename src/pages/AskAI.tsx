import { PageHeader } from "../components/common/PageHeader";

export type AskAIProps = {
  expanded: boolean;
}
export const AskAI: React.FC<AskAIProps> = ({ expanded }) => {
  return (
    <div className={`space-y-0 md:p-4 ${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
      <PageHeader title="Ask AI" bgImage='/bg/group2/1.jpg' />
      <p>AI functionality will be implemented here..</p>
    </div>

  );
};