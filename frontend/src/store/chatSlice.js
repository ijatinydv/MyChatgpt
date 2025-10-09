import { createSlice, nanoid } from '@reduxjs/toolkit';

// helpers
const createEmptyChat = (title) => ({ id: nanoid(), title: title || 'New Chat', messages: [] });

const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        chats: [],
        activeChatId: null,
        isSending: false,
        input: ''
    },
    reducers: {
        ensureInitialChat(state) {
            if (state.chats.length === 0) {
                const chat = createEmptyChat();
                state.chats.unshift(chat);
                state.activeChatId = chat.id;
            }
        },
        startNewChat: {
            reducer(state, action) {
                console.log("startNewChat reducer called with:", action.payload);
                console.log("Current chats before:", JSON.parse(JSON.stringify(state.chats)));
                const { _id, title } = action.payload;
                const newChat = { _id, title: title || 'New Chat', messages: [] };
                state.chats.unshift(newChat);
                state.activeChatId = _id;
                console.log("New chat object:", newChat);
                console.log("Current chats after:", JSON.parse(JSON.stringify(state.chats)));
                console.log("Chats length after:", state.chats.length);
            }
        },
        selectChat(state, action) {
            state.activeChatId = action.payload;
        },
        setInput(state, action) {
            state.input = action.payload;
        },
        sendingStarted(state) {
            state.isSending = true;
        },
        sendingFinished(state) {
            state.isSending = false;
        },
        setChats(state, action) {
            state.chats = action.payload;
        },
        addUserMessage: {
            reducer(state, action) {
                const { chatId, message } = action.payload;
                const chat = state.chats.find(c => c.id === chatId);
                if (!chat) return;
                if (chat.messages.length === 0) {
                    chat.title = message.content.slice(0, 40) + (message.content.length > 40 ? '…' : '');
                }
                chat.messages.push(message);
            },
            prepare(chatId, content) {
                return { payload: { chatId, message: { id: nanoid(), role: 'user', content, ts: Date.now() } } };
            }
        },
        addAIMessage: {
            reducer(state, action) {
                const { chatId, message } = action.payload;
                const chat = state.chats.find(c => c.id === chatId);
                if (!chat) return;
                chat.messages.push(message);
            },
            prepare(chatId, content, error = false) {
                return { payload: { chatId, message: { id: nanoid(), role: 'ai', content, ts: Date.now(), ...(error ? { error: true } : {}) } } };
            }
        }
    }
});

export const {
    ensureInitialChat,
    startNewChat,
    selectChat,
    setInput,
    sendingStarted,
    sendingFinished,
    addUserMessage,
    addAIMessage,
    setChats
} = chatSlice.actions;

export default chatSlice.reducer;
