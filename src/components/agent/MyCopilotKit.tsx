"use client"
import { CopilotSidebar } from "@copilotkit/react-ui";
import { useEffect, useState } from "react";
import { useCopilotMessagesContext } from "@copilotkit/react-core";
import { ActionExecutionMessage, ResultMessage, TextMessage } from "@copilotkit/runtime-client-gql";

export const MyCopilotKit = () => {
  const { messages, setMessages } = useCopilotMessagesContext();
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

  return (
      <CopilotSidebar
        labels={{
          title: "FlipFlop AI Assistant",
          initial: "Hi! I'm your Popup Assistant. I'm here to help you with anything you need. Just ask me a question or tell me what you need help with.",
        }}
        instructions="AI help that shows up right when you need it"
      />
  );
}