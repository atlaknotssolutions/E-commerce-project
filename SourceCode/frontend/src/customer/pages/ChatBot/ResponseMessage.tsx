import React from "react";

interface ResponseMessageProps {
  message: string;
}

const ResponseMessage = ({ message }: ResponseMessageProps) => {
  console.log("Assistant Message:", message);

  return (
    <div className="px-3 py-4 bg-slate-100 rounded-md text-black whitespace-pre-wrap">
      {String(message)}
    </div>
  );
};

export default ResponseMessage;