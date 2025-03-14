"use client"
import { CopilotSidebar, useChatContext, HeaderProps, InputProps } from "@copilotkit/react-ui";
import { useEffect, useRef, useState } from "react";
import { useCopilotMessagesContext } from "@copilotkit/react-core";
import { ActionExecutionMessage, ResultMessage, TextMessage } from "@copilotkit/runtime-client-gql";
import { UserMessageProps } from "@copilotkit/react-ui";
import { AssistantMessageProps } from "@copilotkit/react-ui";
import MarkdownWithMath from "./MarkdownWithMath";
import { LuLightbulb, LuLightbulbOff, LuSend } from "react-icons/lu";
import { FAQSelector } from "./FAQSelector";
import { loadFAQs } from "../../utils/user";
import { useAuth } from "../../utils/contexts";
import toast from "react-hot-toast";
import { FAQ } from "../../types/types";

export const MyCopilotKit = () => {
  const { messages, setMessages } = useCopilotMessagesContext();
  // const [isDeepthink, setIsDeepthink] = useState(false);
  // const [isResearch, setIsResearch] = useState(false);
  const [isFAQOpen, setIsFAQOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [faqs, setFaqs] = useState<FAQ[] | null>(null);
  const { token } = useAuth();
  
  // save to local storage when messages change
  useEffect(() => {
    if (messages.length !== 0) {
      localStorage.setItem("flipflop-copilotkit-messages", JSON.stringify(messages));
    }
  }, [JSON.stringify(messages)]);

  // initially load from local storage
  useEffect(() => {
    const messages = localStorage.getItem("flipflop-copilotkit-messages");
    if (messages) {
      const parsedMessages = JSON.parse(messages).map((message: any) => {
        if (message.type === "TextMessage") {
          return new TextMessage({
            id: message.id,
            role: message.role,
            content: message.content,
            createdAt: message.createdAt,
          });
        } else if (message.type === "ActionExecutionMessage") {
          return new ActionExecutionMessage({
            id: message.id,
            name: message.name,
            scope: message.scope,
            arguments: message.arguments,
            createdAt: message.createdAt,
          });
        } else if (message.type === "ResultMessage") {
          return new ResultMessage({
            id: message.id,
            actionExecutionId: message.actionExecutionId,
            actionName: message.actionName,
            result: message.result,
            createdAt: message.createdAt,
          });
        } else {
          throw new Error(`Unknown message type: ${message.type}`);
        }
      });
      setMessages(parsedMessages);
    }
  }, []);

  useEffect(() => {
    if(token) {
      loadFAQs(token as string).then(result => {
        if(!result.success) {
          toast.error(result.message as string);
          return;
        }
        setFaqs(result.data.data as FAQ[]);
      })
    }
  }, [token]);

  const CustomUserMessage = (props: UserMessageProps) => {
    return (
      <div className="flex items-center gap-2 justify-end mb-4">
        <div className="bg-green-500 text-white py-2 px-4 rounded-xl break-words flex-shrink-0 max-w-[80%]">{props.message}</div>
      </div>
    );
  };

  const CustomAssistantMessage = (props: AssistantMessageProps) => {
    const { icons } = useChatContext();
    const { message, isLoading, subComponent } = props;
    // const avatar = <div className={"pixel-avatar-round p-1"}><RiRobot2Line className="h-6 w-6" /></div>
    return (
      <div className="py-2">
        <div className="flex items-start">
          {/* <div className="mr-2">{!subComponent && avatar}</div> */}
          <div className="bg-gray-100 px-4 rounded-xl py-2 text-sm md:text-md">
            {message && <MarkdownWithMath content={message || ""} />}
            {isLoading && icons.spinnerIcon}
          </div>
        </div>
        <div className="my-2">{subComponent}</div>
      </div>
    );
  };

  function Header({}: HeaderProps) {
    const { setOpen, icons, labels } = useChatContext();

    return (
      <div className="flex justify-between items-center p-4 bg-blue-500 text-white">
        <div className="text-lg">{labels.title}</div>
        <div className="w-24 flex justify-end">
          <button onClick={() => setOpen(false)} aria-label="Close">
            {icons.headerCloseIcon}
          </button>
        </div>
      </div>
    );
  };

  function CustomInput({ inProgress, onSend, isVisible }: InputProps) {
    const handleSubmit = (value: string) => {
      if (value.trim()) {
        onSend(value);
        setPrompt("");
        if (inputRef.current) inputRef.current.value = "";
      }
    };
    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
      if (inputRef.current && prompt !== inputRef.current.value) {
        inputRef.current.value = prompt;
        handleSubmit(prompt);
        setIsFAQOpen(false);
      }
    }, [prompt]);

    const wrapperStyle = "flex gap-2 p-4 border-t";
    const inputStyle = "text-sm flex-1 p-2 rounded-md border border-gray-300 focus:outline-none focus:border-green-500 disabled:bg-gray-100";

    return (
      <div>
        <div className="flex ml-8 gap-2 my-2">
          {/* <div className={modeButtonStyle + (isDeepthink ? " bg-green-500" : " bg-gray-300")} onClick={() => setIsDeepthink(!isDeepthink)}>Deep think</div>
          <div className={modeButtonStyle + (isResearch ? " bg-green-500" : " bg-gray-300")} onClick={() => setIsResearch(!isResearch)}>Search web</div> */}
          {isFAQOpen && faqs && <FAQSelector 
            faqs={faqs}
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            setPrompt={setPrompt} 
          />}
        </div>
        <div className={wrapperStyle}>
          <button
            disabled={inProgress}
            className={`text-sm px-3 py-2 bg-gray-300 text-white rounded-md ${isFAQOpen ? "bg-green-500 text-white" : "bg-white border-[1px] border-gray-200"}`}
            onClick={() => setIsFAQOpen(!isFAQOpen)}
          >
            {isFAQOpen ? <LuLightbulbOff  className={`w-4 h-4 ${isFAQOpen ? "text-white" : "text-black"}`}/> : <LuLightbulb  className={`w-4 h-4 ${isFAQOpen ? "text-white" : "text-black"}`}/>}
          </button>
  
          <input
            ref={inputRef}
            disabled={inProgress}
            type="text"
            placeholder="Ask your question here..."
            className={inputStyle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
          />

          <button
            disabled={inProgress}
            className="text-sm px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            onClick={(e) => {
              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
              handleSubmit(input.value);
              input.value = '';
            }}
          >
            <LuSend className="w-4 h-4"/>
          </button>
        </div>
      </div>
    );
  }

  return (
      <CopilotSidebar
        labels={{
          title: "FlipFlop AI Assistant",
          initial: "Hi! I'm your Popup Assistant. I'm here to help you with anything you need. Just ask me a question or tell me what you need help with.",
        }}
        instructions="AI help that shows up right when you need it"
        UserMessage={CustomUserMessage}
        AssistantMessage={CustomAssistantMessage}
        // Header={Header}
        Input={CustomInput}
      />
  );
}