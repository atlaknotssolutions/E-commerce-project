import React, { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { chatBot, clearChat } from "../../../Redux Toolkit/Customer/AiChatBotSlice";
import type { ChatAction } from "../../../Redux Toolkit/Customer/AiChatBotSlice";
import { IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import MinimizeIcon from "@mui/icons-material/Minimize";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import PromptMessage from "./PromptMessage";
import ResponseMessage from "./ResponseMessage";

interface ChatBotProps {
  handleClose: () => void;
  productId?: string;
}

const SUGGESTIONS = [
  "Find T-shirts under ₹2000",
  "Show me sneakers",
  "Suggest a gift",
  "Best deals today",
  "Show categories",
  "Compare popular products",
];

const actionToPrompt = (action: ChatAction): string => {
  const target = action.title || action.productId || "this item";

  switch (action.type) {
    case "ADD_TO_CART":
      return `Add ${target} to my cart`;
    case "VIEW_CART":
      return "Show my cart";
    case "PRODUCT_DETAIL":
      return `Show me details for ${target}`;
    case "UPDATE_CART_QUANTITY":
      return `Update the quantity of ${target} in my cart`;
    case "REMOVE_FROM_CART":
      return `Remove ${target} from my cart`;
    default:
      return "Continue";
  }
};

const ChatBot = ({ handleClose, productId }: ChatBotProps) => {
  const dispatch = useAppDispatch();
  const { aiChatBot } = useAppSelector((store) => store);
  const [prompt, setPrompt] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGivePrompt();
    }
  };

  const handleActionClick = (action: ChatAction) => {
    if (aiChatBot.loading) return;

    dispatch(
      chatBot({
        prompt: { prompt: actionToPrompt(action) },
        productId,
        action: {
          type: action.type,
          productId: action.productId,
          cartItemId: action.cartItemId,
          quantity: action.quantity ?? 1,
        },
      }),
    );
  };

  const handleRetry = () => {
    const lastUser = [...aiChatBot.messages].reverse().find((m) => m.role === "user");
    if (lastUser) handleGivePrompt(lastUser.message);
  };

  // Show more reuses the existing backend SHOW_MORE intent, which pages past
  // products already shown in this conversation (no client-side pagination).
  const handleShowMore = () => {
    if (aiChatBot.loading) return;
    handleGivePrompt("more options");
  };

  // Auto-scroll to the latest message without scrolling the page itself.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [aiChatBot.messages, aiChatBot.loading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Minimized view
  if (isMinimized) {
    return (
      <div className="animate-slide-up">
        <button
          onClick={() => setIsMinimized(false)}
          aria-label="Expand AI Shopping Assistant"
          className="flex w-[208px] items-center justify-between rounded-full bg-gradient-to-r from-teal-600 to-teal-700 px-4 py-2.5 text-white shadow-xl transition hover:shadow-2xl"
        >
          <span className="flex items-center gap-2">
            <AutoAwesomeIcon sx={{ fontSize: 18 }} />
            <span className="text-sm font-semibold">AI Assistant</span>
          </span>
          <span
            role="button"
            tabIndex={-1}
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-white/20"
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </span>
        </button>
      </div>
    );
  }

  const hasMessages = aiChatBot.messages.length > 0;

  return (
    <div className="animate-slide-up">
      <div className="flex h-[min(560px,calc(100dvh-3rem))] w-[calc(100vw-2rem)] max-w-[360px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
        {/* Header */}
        <header className="flex flex-shrink-0 items-center justify-between border-b border-gray-100 bg-gradient-to-r from-teal-600 to-teal-700 px-3 py-2.5 text-white">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
              <AutoAwesomeIcon sx={{ fontSize: 17 }} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-tight">AI Assistant</p>
              <p className="truncate text-[10px] leading-tight text-white/75">
                Shopping, deals & cart help
              </p>
            </div>
          </div>

          <div className="flex flex-shrink-0 items-center">
            <IconButton
              size="small"
              onClick={() => setIsMinimized(true)}
              aria-label="Minimize chat"
              title="Minimize"
              sx={{ color: "white", "&:hover": { bgcolor: "rgba(255,255,255,0.14)" }, p: 0.75 }}
            >
              <MinimizeIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => dispatch(clearChat())}
              disabled={!hasMessages && !aiChatBot.error}
              aria-label="Clear conversation"
              title="Clear chat"
              sx={{ color: "white", "&:hover": { bgcolor: "rgba(255,255,255,0.14)" }, "&.Mui-disabled": { color: "rgba(255,255,255,0.4)" }, p: 0.75 }}
            >
              <DeleteSweepIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={handleClose}
              aria-label="Close chat"
              title="Close"
              sx={{ color: "white", "&:hover": { bgcolor: "rgba(255,255,255,0.14)" }, p: 0.75 }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </div>
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain bg-gray-50 px-3 py-3">
          {/* Welcome + Suggestions */}
          {!hasMessages && !aiChatBot.loading && (
            <div className="space-y-3">
              <div className="rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-sm ring-1 ring-gray-100">
                <p className="text-sm leading-relaxed text-gray-700">
                  Hi! I'm your <strong className="font-semibold text-gray-900">AI Shopping Assistant</strong> 👋
                  {productId
                    ? " Ask anything about this product — price, stock, or add it to your cart."
                    : " I can help you find products, compare options, discover deals, and add items to your cart."}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleGivePrompt(q)}
                    className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-600 shadow-sm transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
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
              key={`${item.role}-${index}`}
              className={`mb-2 flex ${
                item.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {item.role === "user" ? (
                <PromptMessage message={item.message} />
              ) : (
                <ResponseMessage
                  message={item.message}
                  sources={item.sources || []}
                  actions={item.actions || []}
                  intent={item.intent}
                  loginRequired={item.loginRequired}
                  isError={item.isError}
                  onActionClick={handleActionClick}
                  onRetry={handleRetry}
                  onShowMore={handleShowMore}
                />
              )}
            </div>
          ))}

          {/* Loading dots */}
          {aiChatBot.loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-sm ring-1 ring-gray-100">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-500" style={{ animationDelay: "0ms" }} />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-500" style={{ animationDelay: "150ms" }} />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-500" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex-shrink-0 border-t border-gray-200 bg-white px-3 py-2.5">
          <div className="flex items-end gap-2 rounded-xl border border-gray-200 bg-gray-50 px-2.5 py-1.5 ring-teal-500/30 transition focus-within:border-teal-400 focus-within:ring-2">
            <textarea
              ref={inputRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              disabled={aiChatBot.loading}
              rows={1}
              aria-label="Message"
              className="max-h-24 flex-1 resize-none bg-transparent py-1 text-sm text-gray-800 outline-none placeholder:text-gray-400 disabled:opacity-60"
            />
            <IconButton
              size="small"
              onClick={() => handleGivePrompt()}
              disabled={aiChatBot.loading || !prompt.trim()}
              aria-label="Send message"
              title="Send message"
              sx={{
                color: "#00927c",
                flexShrink: 0,
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