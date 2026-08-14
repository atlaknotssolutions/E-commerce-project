import React from "react";

interface PromptMessageProps {
  message: string;
}

const PromptMessage = ({ message }: PromptMessageProps) => {
  return (
    <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-teal-600 px-3.5 py-2 text-sm text-white shadow-sm">
      <p className="whitespace-pre-wrap leading-relaxed">{message}</p>
    </div>
  );
};

export default PromptMessage;