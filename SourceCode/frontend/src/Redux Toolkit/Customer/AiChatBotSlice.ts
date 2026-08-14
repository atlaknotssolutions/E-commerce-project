import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../Config/Api";

interface ChatSource {
  id?: string;
  title?: string;
  sellingPrice?: number;
  mrpPrice?: number;
  category?: {
    categoryId?: string;
    name?: string;
  };
  images?: Array<{ url?: string }>;
}

export interface ChatAction {
  type: string;
  productId?: string;
  cartItemId?: string;
  quantity?: number;
  title?: string;
  label?: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  message: string;
  sources?: ChatSource[];
  actions?: ChatAction[];
  intent?: string | null;
  loginRequired?: boolean;
  isError?: boolean;
}

interface ChatResponse {
  role: "assistant";
  message: string;
  mockMode: boolean;
  sources?: ChatSource[];
  actions?: ChatAction[];
  intent?: string | null;
  loginRequired?: boolean;
}

interface AiChatBotState {
  response: string | null;
  loading: boolean;
  error: string | null;
  messages: ChatMessage[];
  pendingRequestId: string | null;
}

const initialState: AiChatBotState = {
  response: null,
  loading: false,
  error: null,
  messages: [],
  pendingRequestId: null,
};

const getErrorMessage = (error: any): string => {
  const status = error?.response?.status;
  const serverMessage = error?.response?.data?.message;

  switch (status) {
    case 400:
      return (
        serverMessage ||
        "I couldn't understand that request. Please rephrase your question."
      );
    case 401:
      return "Your session has expired. Please sign in again to continue chatting.";
    case 403:
      return "You don't have permission to do that. Please sign in and try again.";
    case 404:
      return "That feature isn't available right now. Try asking about our products.";
    case 429:
      return "You're sending messages too quickly. Please wait a moment and try again.";
    default:
      if (typeof status === "number" && status >= 500) {
        return "Something went wrong on our side. Please try again in a moment.";
      }
      if (error?.code === "ECONNABORTED" || !error?.response) {
        return "I can't reach the assistant right now. Check your connection and try again.";
      }
      return serverMessage || "Failed to generate a response. Please try again.";
  }
};

// Synchronous in-flight flag guards against two requests dispatched in the
// same tick (state.loading is only updated after the pending action is
// dispatched, so it alone cannot prevent a rapid double submit).
let requestInFlight = false;

export const chatBot = createAsyncThunk<
  ChatResponse,
  {
    prompt: { prompt: string };
    productId?: string | null;
    action?: ChatAction | null;
  },
  {
    rejectValue: string;
  }
>(
  "aiChatBot/generateResponse",
  async ({ prompt, productId, action }, { rejectWithValue }) => {
    requestInFlight = true;
    try {
      const response = await api.post("/ai/chat", {
        prompt: prompt.prompt,
        productId: productId ?? null,
        action: action ?? null,
      });

      return response.data;
    } catch (error: any) {
      console.warn(
        `[AI Chat] request failed${
          error?.response?.status ? ` (status ${error.response.status})` : ""
        }`,
      );

      return rejectWithValue(getErrorMessage(error));
    } finally {
      requestInFlight = false;
    }
  },
  {
    condition: (_arg, { getState }) => {
      const state = getState() as { aiChatBot: AiChatBotState };

      if (requestInFlight || state.aiChatBot.loading) {
        return false;
      }

      return true;
    },
  },
);

const aiChatBotSlice = createSlice({
  name: "aiChatBot",
  initialState,
  reducers: {
    clearChat(state) {
      state.messages = [];
      state.response = null;
      state.error = null;
      state.loading = false;
      state.pendingRequestId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(chatBot.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.pendingRequestId = action.meta.requestId;

        state.messages.push({
          role: "user",
          message: action.meta.arg.prompt.prompt,
        });
      })

      .addCase(chatBot.fulfilled, (state, action) => {
        // A clearChat() ran while this request was in flight: drop the stale
        // response so it cannot repopulate a freshly cleared conversation.
        if (state.pendingRequestId !== action.meta.requestId) {
          return;
        }

        state.loading = false;
        state.pendingRequestId = null;

        state.response = action.payload.message;

        state.messages.push({
          role: "assistant",
          message: action.payload.message,
          sources: action.payload.sources ?? [],
          actions: action.payload.actions ?? [],
          intent: action.payload.intent ?? null,
          loginRequired: action.payload.loginRequired ?? false,
        });
      })

      .addCase(chatBot.rejected, (state, action) => {
        if (state.pendingRequestId !== action.meta.requestId) {
          return;
        }

        state.loading = false;
        state.pendingRequestId = null;

        const message =
          action.payload ?? "Failed to generate a response. Please try again.";

        state.error = message;

        state.messages.push({
          role: "assistant",
          message,
          isError: true,
        });
      });
  },
});

export const { clearChat } = aiChatBotSlice.actions;

export default aiChatBotSlice.reducer;
