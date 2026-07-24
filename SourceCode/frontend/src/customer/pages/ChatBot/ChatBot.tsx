import React, { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { chatBot } from "../../../Redux Toolkit/Customer/AiChatBotSlice";
import { Button, IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";

import PromptMessage from "./PromptMessage";
import ResponseMessage from "./ResponseMessage";
import branding from "../../../Config/branding";

interface ChatBotProps {
  handleClose: (e: React.MouseEvent<HTMLElement>) => void;
  productId?: string;
}

const ChatBot = ({ handleClose, productId }: ChatBotProps) => {
  const dispatch = useAppDispatch();
  const { aiChatBot } = useAppSelector((store) => store);

  const [prompt, setPrompt] = useState("");

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  console.log("========== CHATBOT RENDER ==========");
  console.log("Loading:", aiChatBot.loading);
  console.log("Messages:", aiChatBot.messages);
  console.log("Response:", aiChatBot.response);
  console.log("Error:", aiChatBot.error);

  const handleGivePrompt = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();

    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt || aiChatBot.loading) {
      return;
    }

    console.log("========== USER PROMPT ==========");
    console.log(trimmedPrompt);

    dispatch(
      chatBot({
        prompt: { prompt: trimmedPrompt },
        productId,
      })
    );

    setPrompt("");
  };

  const handlePromptChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPrompt(e.target.value);
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [aiChatBot.messages, aiChatBot.loading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="rounded-lg">
      <div className="w-full lg:w-[40vw] h-[82vh] shadow-2xl bg-white rounded-lg z-50">
        {/* Header */}
        <div className="h-[12%] flex justify-between items-center px-5 bg-slate-100 rounded-t-lg">
          <div className="flex items-center gap-3">
            <img src={branding.logoUrlTransparent} alt={branding.appName} className="h-7 w-auto object-contain" />
            <p className="text-gray-500 text-sm font-medium">Assistant</p>
          </div>

          <IconButton onClick={handleClose} color="primary">
            <CloseIcon />
          </IconButton>
        </div>

        {/* Messages */}
        <div className="h-[78%] p-5 flex flex-col overflow-y-auto custom-scrollbar">
          <p className="mb-4 text-gray-600">
            Welcome to <strong>Jeet AI Assistant</strong>.
            {productId
              ? " Ask anything about this product."
              : " Ask me about your products, cart, orders or shopping."}
          </p>

          {aiChatBot.messages.map((item, index) => {
            console.log(`Message ${index}:`, item);

            return item.role === "user" ? (
              <div
                key={index}
                ref={chatContainerRef}
                className="self-end"
              >
                <PromptMessage
                  message={item.message}
                  index={index}
                />
              </div>
            ) : (
              <div
                key={index}
                ref={chatContainerRef}
                className="self-start"
              >
                <ResponseMessage message={item.message} />
              </div>
            );
          })}

          {aiChatBot.loading && (
            <div className="self-start text-gray-500 italic mt-2">
              AI is typing...
            </div>
          )}
        </div>

        {/* Input */}
        <div className="h-[10%] flex items-center">
          <input
            ref={inputRef}
            value={prompt}
            onChange={handlePromptChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleGivePrompt(
                  e as unknown as React.MouseEvent<HTMLElement>
                );
              }
            }}
            type="text"
            placeholder="Ask me anything about products, orders or your cart..."
            className="rounded-bl-lg pl-5 h-full w-full bg-slate-100 border-none outline-none"
          />

          <Button
            variant="contained"
            className="h-full"
            sx={{ borderRadius: "0 0 0.5rem 0" }}
            onClick={handleGivePrompt}
            disabled={aiChatBot.loading || !prompt.trim()}
          >
            <SendIcon />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;



// import React, { useEffect, useRef, useState } from "react";
// import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
// import { chatBot } from "../../../Redux Toolkit/Customer/AiChatBotSlice";
// import { Box, Button, IconButton } from "@mui/material";
// import SendIcon from "@mui/icons-material/Send";
// import PromptMessage from "./PromptMessage";
// import ResponseMessage from "./ResponseMessage";
// import { useSelector } from "react-redux";
// import CloseIcon from '@mui/icons-material/Close';

// interface ChatBotProps {
//     handleClose: (e: React.MouseEvent<HTMLElement>) => void;
//     productId?: string;
// }

// const ChatBot = ({handleClose,productId}:ChatBotProps) => {
//     const dispatch = useAppDispatch();
//     const [prompt, setPrompt] = useState("");
//     const chatContainerRef = useRef<HTMLDivElement>(null);
//     const [responses, setResponses] = useState<any>([]);
//     const [error, setError] = useState<string | null>(null);
//     const {aiChatBot}=useAppSelector(store=>store);

//     const handleGivePrompt = (e:any) => {
//         e.stopPropagation()
//         dispatch(chatBot({ prompt: { prompt }, productId, userId: null }));
//     };

//     const handlePromptChange = (
//     e: React.ChangeEvent<HTMLInputElement>
// ) => {
//     setPrompt(e.target.value);
// };
//     useEffect(() => {
//         if (chatContainerRef.current) {
//             chatContainerRef.current.scrollIntoView({ behavior: "smooth" });
//         }
//     }, [aiChatBot.messages]);
//     // console.log(aiChatBot)
//     return (
//         <div className="rounded-lg">
//             <div className="w-full lg:w-[40vw] h-[82vh] shadow-2xl bg-white z-50 rounded-lg">
//                 <div className=" h-[12%] flex justify-between items-center px-5 bg-slate-100 rounded-t-lg">
//                     <div className="flex items-center gap-3 ">
//                         <h1 className="logo">{branding.appShortName}</h1>
//                         <p>Assitant</p>
//                     </div>
//                    {/* {productId && <div className="flex items-center gap-3">
//                         <p>Product id :</p>
//                         <p>{productId}</p>
//                     </div>} */}
//                     <div>
//                         <IconButton 
//                         onClick={handleClose}
//                         color="primary"
                       
//                         >
//                             <CloseIcon/>
//                         </IconButton>
//                     </div>

//                 </div>

//                 <div className="h-[78%] p-5 flex flex-col py-5 px-5 overflow-y-auto  custom-scrollbar">

//                     <p>welcome to Jeet Ai Assistant, you can
//                       {productId?` Query About this Product : ${productId}`:"   Query about your cart, and order history here"}
//                     </p>
//                     { aiChatBot.messages.map((item:any, index:number) =>
//                         item.role == "user" ? (
//                             <div ref={chatContainerRef} className="self-end" key={index}>
//                                 <PromptMessage message={item.message} index={index} />
//                             </div>
//                         ) : (
//                             <div
//                                 ref={chatContainerRef}
//                                 className="self-start"
//                                 key={index}
//                             >
//                                 <ResponseMessage message={item.message} />
//                             </div>
//                         )
//                     )}
//                     {aiChatBot.loading && <p>fetching data...</p>}

//                 </div>

//                 <div className=" h-[10%] flex items-center">
//                     <input
//                         onChange={handlePromptChange}
//                         type="text"
//                         placeholder="give your prompt"
//                         className="rounded-bl-lg pl-5 h-full w-full bg-slate-100 border-none outline-none"
//                     />
//                     <Button
//                         sx={{ borderRadius: "0 0 0.5rem 0" }}
//                         className="h-full "
//                         onClick={handleGivePrompt}
//                         variant="contained"
//                     >
//                         <SendIcon />
//                     </Button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ChatBot;
