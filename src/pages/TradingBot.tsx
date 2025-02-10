import { FC } from "react"
import { PageHeader } from "../components/common/PageHeader"

type TradingBotProps = {
  expanded: boolean;
}

export const TradingBot: FC<TradingBotProps> = ({
  expanded
}) => {
  return (
    <div className={`space-y-0 md:p-4 md:mb-20 ${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
      <PageHeader title="Trading Bot" bgImage='/bg/group1/8.jpg' />
      <p>=== Under construction ===</p>
    </div>
  )
}