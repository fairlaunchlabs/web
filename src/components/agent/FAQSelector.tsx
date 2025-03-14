import { FC, useEffect } from "react"
import { LuLightbulb } from "react-icons/lu";
// import { FAQs } from "../../config/faqs";
import { FAQ } from "../../types/types";

type FAQSelectorProps = {
  faqs: FAQ[];
  activeTab: number;
  setActiveTab: (value: number) => void;
  setPrompt: (value: string) => void;
}

export const FAQSelector:FC<FAQSelectorProps> = ({
  faqs,
  activeTab,
  setActiveTab,
  setPrompt
}) => {  
  return (
    <div className="absolute left-0 w-full h-96 bottom-[70px] bg-gray-100 z-50 border-t-0 border-b-0">
      <div className="flex justify-between border-b-2 text-sm">
        {faqs && faqs.length > 0 && faqs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`${activeTab === index ? "bg-gray-300" : ""} px-3 flex py-4 ${index === faqs.length - 1 ? "rounded-tr-2xl" : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-3 max-h-[330px] h-[330px] overflow-y-auto">
        <div className="text-sm mb-3">
          Total {faqs[activeTab].questions.length} FAQs, select and get quick answer.
        </div>
        {faqs && faqs.length > 0 && faqs[activeTab].questions.map((question:any, index) => (
          <div 
            className="bg-gray-200 mb-2 py-3 px-5 rounded-full text-sm cursor-pointer" 
            key={index}
            onClick={() => setPrompt(question.text)}
          >
            <LuLightbulb className="inline mr-2 -mt-1" /> {question.text}
          </div>
        ))}
      </div>
    </div>
  )
}