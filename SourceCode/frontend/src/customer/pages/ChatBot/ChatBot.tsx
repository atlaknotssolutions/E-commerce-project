// import React, { useEffect, useRef, useState } from "react";
// import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
// import { chatBot } from "../../../Redux Toolkit/Customer/AiChatBotSlice";
// import { IconButton } from "@mui/material";
// import SendIcon from "@mui/icons-material/Send";
// import CloseIcon from "@mui/icons-material/Close";
// import MinimizeIcon from "@mui/icons-material/Minimize";
// import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
// import PromptMessage from "./PromptMessage";
// import ResponseMessage from "./ResponseMessage";

// interface ChatBotProps {
//   handleClose: () => void;
//   productId?: string;
// }

// const SUGGESTED_PROMPTS = [
//   "Find products under ₹1000",
//   "Best rated products",
//   "Highest discount products",
//   "Suggest a gift",
//   "Do you have any coupons?",
//   "Compare popular products",
// ];

// const ChatBot = ({ handleClose, productId }: ChatBotProps) => {
//   const dispatch = useAppDispatch();
//   const { aiChatBot } = useAppSelector((store) => store);
//   const [prompt, setPrompt] = useState("");
//   const [isMinimized, setIsMinimized] = useState(false);
//   const chatContainerRef = useRef<HTMLDivElement>(null);
//   const inputRef = useRef<HTMLInputElement>(null);

//   const handleGivePrompt = (text?: string) => {
//     const trimmedPrompt = (text || prompt).trim();
//     if (!trimmedPrompt || aiChatBot.loading) return;
//     dispatch(chatBot({ prompt: { prompt: trimmedPrompt }, productId }));
//     setPrompt("");
//   };

//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       handleGivePrompt();
//     }
//   };

//   useEffect(() => {
//     if (chatContainerRef.current) {
//       chatContainerRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [aiChatBot.messages, aiChatBot.loading]);

//   useEffect(() => {
//     inputRef.current?.focus();
//   }, []);

//   if (isMinimized) {
//     return (
//       <div className="animate-slide-up">
//         <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-[340px] sm:w-[380px] overflow-hidden">
//           <button onClick={() => setIsMinimized(false)}
//             className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white">
//             <div className="flex items-center gap-2">
//               <AutoAwesomeIcon sx={{ fontSize: 18 }} />
//               <span className="text-sm font-medium">AI Assistant</span>
//             </div>
//             <CloseIcon sx={{ fontSize: 18 }} onClick={(e) => { e.stopPropagation(); handleClose(); }} />
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="animate-slide-up">
//       <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-[340px] sm:w-[380px] flex flex-col overflow-hidden">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
//           <div className="flex items-center gap-2">
//             <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center">
//               <AutoAwesomeIcon sx={{ fontSize: 16 }} />
//             </div>
//             <div>
//               <p className="text-sm font-medium">AI Assistant</p>
//               <p className="text-[10px] text-white/70">Ask me anything about shopping</p>
//             </div>
//           </div>
//           <div className="flex items-center gap-1">
//             <IconButton size="small" onClick={() => setIsMinimized(true)} sx={{ color: "white" }}>
//               <MinimizeIcon fontSize="small" />
//             </IconButton>
//             <IconButton size="small" onClick={handleClose} sx={{ color: "white" }}>
//               <CloseIcon fontSize="small" />
//             </IconButton>
//           </div>
//         </div>

//         {/* Messages */}
//         <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 max-h-[400px]" style={{ minHeight: "300px" }}>
//           {/* Welcome + Suggestions */}
//           {aiChatBot.messages.length === 0 && !aiChatBot.loading && (
//             <div className="space-y-3">
//               <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[90%]">
//                 <p className="text-sm text-gray-700">
//                   Hi! I'm your <strong>AI Shopping Assistant</strong>.
//                   {productId
//                     ? " Ask anything about this product."
//                     : " I can help find products, suggest deals, and more."}
//                 </p>
//               </div>
//               <div className="flex flex-wrap gap-2">
//                 {SUGGESTED_PROMPTS.map((q) => (
//                   <button key={q} onClick={() => handleGivePrompt(q)}
//                     className="text-xs bg-gray-100 hover:bg-teal-50 hover:text-teal-700 text-gray-600 px-3 py-1.5 rounded-full border border-gray-200 hover:border-teal-300 transition-colors">
//                     {q}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           )}

//           {aiChatBot.messages.map((item, index) => (
//             <div key={index} ref={index === aiChatBot.messages.length - 1 ? chatContainerRef : null}
//               className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}>
//               {item.role === "user" ? (
//                 <PromptMessage message={item.message} />
//               ) : (
//                 <ResponseMessage message={item.message} />
//               )}
//             </div>
//           ))}

//           {aiChatBot.loading && (
//             <div className="flex justify-start">
//               <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-4 py-3">
//                 <div className="flex gap-1">
//                   <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
//                   <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
//                   <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Input */}
//         <div className="border-t border-gray-100 px-4 py-3 flex-shrink-0">
//           <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-1.5">
//             <input ref={inputRef} value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={handleKeyDown}
//               placeholder="Type a message..." disabled={aiChatBot.loading}
//               className="flex-1 bg-transparent outline-none text-sm placeholder-gray-400" />
//             <IconButton size="small" onClick={() => handleGivePrompt()} disabled={aiChatBot.loading || !prompt.trim()}
//               sx={{ color: "#00927c", '&.Mui-disabled': { color: "#d0d0d0" } }}>
//               <SendIcon fontSize="small" />
//             </IconButton>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChatBot;

import React, { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { chatBot } from "../../../Redux Toolkit/Customer/AiChatBotSlice";
import { IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import MinimizeIcon from "@mui/icons-material/Minimize";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import PromptMessage from "./PromptMessage";
import ResponseMessage from "./ResponseMessage";

interface ChatBotProps {
  handleClose: () => void;
  productId?: string;
}

const SUGGESTED_PROMPTS = [
  "Find products under ₹1000",
  "Best rated products",
  "Highest discount products",
  "Suggest a gift",
  "Do you have any coupons?",
  "Compare popular products",
  "Show me categories",
];

const ChatBot = ({ handleClose, productId }: ChatBotProps) => {
  const dispatch = useAppDispatch();
  const { aiChatBot } = useAppSelector((store) => store);
  const [prompt, setPrompt] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleGivePrompt = (text?: string) => {
    const trimmedPrompt = (text || prompt).trim();
    if (!trimmedPrompt || aiChatBot.loading) return;

    dispatch(
      chatBot({
        prompt: { prompt: trimmedPrompt },
        productId,
      }),
    );
    setPrompt("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGivePrompt();
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [aiChatBot.messages, aiChatBot.loading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Minimized view
  if (isMinimized) {
    return (
      <div className="animate-slide-up">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-[340px] sm:w-[380px] overflow-hidden">
          <button
            onClick={() => setIsMinimized(false)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white"
          >
            <div className="flex items-center gap-2">
              <AutoAwesomeIcon sx={{ fontSize: 18 }} />
              <span className="text-sm font-medium">AI Assistant</span>
            </div>
            <CloseIcon
              sx={{ fontSize: 18 }}
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
            />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-[340px] sm:w-[380px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center">
              <AutoAwesomeIcon sx={{ fontSize: 16 }} />
            </div>
            <div>
              <p className="text-sm font-medium">AI Assistant</p>
              <p className="text-[10px] text-white/70">
                Ask me anything about shopping
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <IconButton
              size="small"
              onClick={() => setIsMinimized(true)}
              sx={{ color: "white" }}
            >
              <MinimizeIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={handleClose}
              sx={{ color: "white" }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto px-4 py-3 space-y-3 max-h-[400px]"
          style={{ minHeight: "300px" }}
        >
          {/* Welcome + Suggestions */}
          {aiChatBot.messages.length === 0 && !aiChatBot.loading && (
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[90%]">
                <p className="text-sm text-gray-700">
                  Hi! I'm your <strong>AI Shopping Assistant</strong>.
                  {productId
                    ? " Ask anything about this product."
                    : " I can help find products, suggest deals, and more."}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {SUGGESTED_PROMPTS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleGivePrompt(q)}
                    className="text-xs bg-gray-100 hover:bg-teal-50 hover:text-teal-700 text-gray-600 px-3 py-1.5 rounded-full border border-gray-200 hover:border-teal-300 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Messages */}
          {aiChatBot.messages.map((item, index) => (
            <div
              key={index}
              ref={
                index === aiChatBot.messages.length - 1
                  ? chatContainerRef
                  : null
              }
              className={`flex ${
                item.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {item.role === "user" ? (
                <PromptMessage message={item.message} />
              ) : (
                <ResponseMessage
                  message={item.message}
                  sources={item.sources || []}
                />
              )}
            </div>
          ))}

          {/* Loading dots */}
          {aiChatBot.loading && (
            <div className="flex justify-start">
              <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  <span
                    className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-gray-100 px-4 py-3 flex-shrink-0">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-1.5">
            <input
              ref={inputRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              disabled={aiChatBot.loading}
              className="flex-1 bg-transparent outline-none text-sm placeholder-gray-400"
            />
            <IconButton
              size="small"
              onClick={() => handleGivePrompt()}
              disabled={aiChatBot.loading || !prompt.trim()}
              sx={{
                color: "#00927c",
                "&.Mui-disabled": { color: "#d0d0d0" },
              }}
            >
              <SendIcon fontSize="small" />
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
