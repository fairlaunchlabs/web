"use client"
import { useCopilotReadable } from "@copilotkit/react-core";
import { CopilotPopup } from "@copilotkit/react-ui";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { useState } from "react";
// import { CopilotRuntime, OpenAIAdapter } from "@copilotkit/runtime";
// import OpenAI from "openai";

export const MyCopilotKit = () => {
  // const [colleagues, setColleagues] = useState([
  //   { id: 1, name: "John Doe", role: "Developer" },
  //   { id: 2, name: "Jane Smith", role: "Designer" },
  //   { id: 3, name: "Bob Wilson", role: "Product Manager" }
  // ]);

  // // Define Copilot readable state
  // useCopilotReadable({
  //   description: "The current user's colleagues",
  //   value: colleagues,
  // });

  return (
      <CopilotSidebar
        labels={{
          title: "Popup Assistant",
          initial: "How can I help you today?"
        }}
        instructions="AI help that shows up right when you need it"
      />
  );
}