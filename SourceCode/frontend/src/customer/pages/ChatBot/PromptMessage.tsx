// import React from "react";

// interface PromptMessageProps {
//   message: string;
// }

// const PromptMessage = ({ message }: PromptMessageProps) => {
//   return (
//     <div className="px-4 py-2.5 bg-teal-600 text-white rounded-2xl rounded-br-sm max-w-[85%] shadow-sm">
//       <p className="text-sm leading-relaxed">{message}</p>
//     </div>
//   );
// };

// export default PromptMessage;


import React from "react";

interface PromptMessageProps {
  message: string;
}

const PromptMessage = ({ message }: PromptMessageProps) => {
  return (
    <div className="px-4 py-2.5 bg-teal-600 text-white rounded-2xl rounded-br-sm max-w-[85%] shadow-sm">
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
    </div>
  );
};

export default PromptMessage;