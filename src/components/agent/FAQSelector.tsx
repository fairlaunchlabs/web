import { FC } from "react"
import { LuLightbulb } from "react-icons/lu";
import { FAQs } from "../../config/faqs";

type FAQSelectorProps = {
  activeTab: number;
  setActiveTab: (value: number) => void;
  setPrompt: (value: string) => void;
}

export const FAQSelector:FC<FAQSelectorProps> = ({
  activeTab,
  setActiveTab,
  setPrompt
}) => {
  return (
    <div className="absolute left-0 w-full h-[384px] bottom-[72px] bg-gray-100 z-50 border-t-2 border-b-0 rounded-t-2xl">
      <div className="flex justify-between border-b-2 text-sm">
        {FAQs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`${activeTab === index ? "bg-gray-300" : ""} px-3 flex py-4 ${index === 0 ? "rounded-tl-2xl" : ""} ${index === FAQs.length - 1 ? "rounded-tr-2xl" : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-3 max-h-[330px] h-[330px] overflow-y-auto">
        <div className="text-sm mb-3">
          Total {FAQs[activeTab].questions.length} FAQs, select and get quick answer.
        </div>
        {FAQs[activeTab].questions.map((question, index) => (
          <div 
            className="bg-gray-200 mb-2 py-3 px-5 rounded-full text-sm cursor-pointer" 
            key={index}
            onClick={() => setPrompt(question)}
          >
            <LuLightbulb className="inline mr-2 -mt-1" /> {question}
          </div>
        ))}
      </div>
    </div>
  )
}