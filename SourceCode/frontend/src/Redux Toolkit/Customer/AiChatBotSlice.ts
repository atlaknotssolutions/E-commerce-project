import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../Config/Api";

interface ChatMessage {
  role: "user" | "assistant";
  message: string;
}

interface ChatResponse {
  role: "assistant";
  message: string;
  mockMode: boolean;
}

interface AiChatBotState {
  response: string | null;
  loading: boolean;
  error: string | null;
  messages: ChatMessage[];
}

const initialState: AiChatBotState = {
  response: null,
  loading: false,
  error: null,
  messages: [],
};

export const chatBot = createAsyncThunk<
  ChatResponse,
  {
    prompt: { prompt: string };
    productId?: string | null;
  },
  {
    rejectValue: string;
  }
>(
  "aiChatBot/generateResponse",
  async ({ prompt, productId }, { rejectWithValue }) => {
    try {
      console.log("========== SENDING REQUEST ==========");
      console.log({
        prompt: prompt.prompt,
        productId: productId ?? null,
      });

      const response = await api.post("/ai/chat", {
        prompt: prompt.prompt,
        productId: productId ?? null,
      });

      console.log("========== AXIOS RESPONSE ==========");
      console.log(response);

      console.log("========== AXIOS DATA ==========");
      console.log(response.data);

      console.log("========== MESSAGE ==========");
      console.log(response.data.message);

      return response.data;
    } catch (error: any) {
      console.log("========== AI ERROR ==========");
      console.log(error);

      console.log("========== ERROR RESPONSE ==========");
      console.log(error.response);

      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to generate chatbot response"
      );
    }
  }
);

const aiChatBotSlice = createSlice({
  name: "aiChatBot",
  initialState,
  reducers: {
    clearChat(state) {
      state.messages = [];
      state.response = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(chatBot.pending, (state, action) => {
        state.loading = true;
        state.error = null;

        state.messages.push({
          role: "user",
          message: action.meta.arg.prompt.prompt,
        });
      })

      .addCase(chatBot.fulfilled, (state, action) => {
        state.loading = false;

        state.response = action.payload.message;

        state.messages.push({
          role: "assistant",
          message: action.payload.message,
        });
      })

      .addCase(chatBot.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ?? "Failed to generate chatbot response";
      });
  },
});

export const { clearChat } = aiChatBotSlice.actions;

export default aiChatBotSlice.reducer;

// import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// import { api } from "../../Config/Api";

// interface ChatMessage {
//   role: "user" | "assistant";
//   message: string;
// }

// interface AiChatBotState {
//   response: string | null;
//   loading: boolean;
//   error: string | null;
//   messages: ChatMessage[];
// }

// const initialState: AiChatBotState = {
//   response: null,
//   loading: false,
//   error: null,
//   messages: [],
// };

// export const chatBot = createAsyncThunk<
//   ChatMessage,
//   {
//     prompt: { prompt: string };
//     productId?: string | null;
//     userId?: string | null;
//   },
//   {
//     rejectValue: string;
//   }
// >(
//   "aiChatBot/generateResponse",
//   async ({ prompt, productId, userId }, { rejectWithValue }) => {
//     try {
//       const response = await api.post(
//         "/ai/chat",
//         prompt,
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("jwt")}`,
//           },
//           params: {
//             userId,
//             productId,
//           },
//         }
//       );

//       console.log("AI Response:", response.data);

//       return response.data as ChatMessage;
//     } catch (error: any) {
//       console.log("AI Error:", error.response);

//       return rejectWithValue(
//         error.response?.data?.message || "Failed to generate chatbot response"
//       );
//     }
//   }
// );

// const aiChatBotSlice = createSlice({
//   name: "aiChatBot",
//   initialState,
//   reducers: {
//     clearChat(state) {
//       state.messages = [];
//       state.response = null;
//       state.error = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(chatBot.pending, (state, action) => {
//         state.loading = true;
//         state.error = null;

//         state.messages.push({
//           role: "user",
//           message: action.meta.arg.prompt.prompt,
//         });
//       })

//       .addCase(chatBot.fulfilled, (state, action) => {
//         state.loading = false;
//         state.response = action.payload.message;
//         state.messages.push(action.payload);
//       })

//       .addCase(chatBot.rejected, (state, action) => {
//         state.loading = false;
//         state.error =
//           action.payload ?? "Failed to generate chatbot response";
//       });
//   },
// });

// export const { clearChat } = aiChatBotSlice.actions;

// export default aiChatBotSlice.reducer;