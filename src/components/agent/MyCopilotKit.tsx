"use client"
import { CopilotSidebar, useChatContext, HeaderProps, InputProps } from "@copilotkit/react-ui";
import { useEffect, useState } from "react";
import { useCopilotMessagesContext } from "@copilotkit/react-core";
import { ActionExecutionMessage, ResultMessage, TextMessage } from "@copilotkit/runtime-client-gql";
import { UserMessageProps } from "@copilotkit/react-ui";
import { AssistantMessageProps } from "@copilotkit/react-ui";
import { RiRobot2Line } from "react-icons/ri";
import { Markdown } from "@copilotkit/react-ui";
import MarkdownWithMath from "./MarkdownWithMath";

export const MyCopilotKit = () => {
  const { messages, setMessages } = useCopilotMessagesContext();
  const [isDeepthink, setIsDeepthink] = useState(false);
  const [isResearch, setIsResearch] = useState(false);
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
    const avatar = <div className={"pixel-avatar-round p-1"}><RiRobot2Line className="h-6 w-6" /></div>

    return (
      <div className="py-2">
        <div className="flex items-start">
          <div className="mr-2">{!subComponent && avatar}</div>
          <div className="bg-gray-100 px-4 rounded-xl py-2 text-sm md:text-md">
            {message && <Markdown content={message || ""} /> }
            {/* {message && <MarkdownWithMath content={message || ""} />} */}
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
      if (value.trim()) onSend(value);
    };

    const wrapperStyle = "flex gap-2 p-4 border-t";
    const inputStyle = "text-sm flex-1 p-2 rounded-md border border-gray-300 focus:outline-none focus:border-green-500 disabled:bg-gray-100";
    const buttonStyle = "text-sm px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed";
    const modeButtonStyle = "py-2 px-3 text-white rounded-md text-sm cursor-pointer";
    return (
      <div>
        <div className="flex ml-8 gap-2 mb-4">
          <div className={modeButtonStyle + (isDeepthink ? " bg-green-500" : " bg-gray-300")} onClick={() => setIsDeepthink(!isDeepthink)}>Deep think</div>
          <div className={modeButtonStyle + (isResearch ? " bg-green-500" : " bg-gray-300")} onClick={() => setIsResearch(!isResearch)}>Search web</div>
        </div>
        <div className={wrapperStyle}>
          <input
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
            className={buttonStyle}
            onClick={(e) => {
              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
              handleSubmit(input.value);
              input.value = '';
            }}
          >
            Ask
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
        Header={Header}
        Input={CustomInput}
      />
  );
}