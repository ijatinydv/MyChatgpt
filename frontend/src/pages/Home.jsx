import React, { useEffect, useState } from 'react';
import { io } from "socket.io-client";
import ChatMobileBar from '../components/chat/ChatMobileBar.jsx';
import ChatSidebar from '../components/chat/ChatSidebar.jsx';
import ChatMessages from '../components/chat/ChatMessages.jsx';
import ChatComposer from '../components/chat/ChatComposer.jsx';
import '../components/chat/ChatLayout.css';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import {
  startNewChat,
  selectChat,
  setInput,
  sendingStarted,
  sendingFinished,
  setChats
} from '../store/chatSlice.js';

const Home = () => {
  const dispatch = useDispatch();
  const chats = useSelector(state => state.chat.chats);
  const activeChatId = useSelector(state => state.chat.activeChatId);
  const input = useSelector(state => state.chat.input);
  const isSending = useSelector(state => state.chat.isSending);
  const [ sidebarOpen, setSidebarOpen ] = React.useState(false);
  const [ socket, setSocket ] = useState(null);
  const [ messages, setMessages ] = useState([]);
  const [ isLoading, setIsLoading ] = useState(true);

  const handleNewChat = async () => {
    try {
      // Create chat instantly with default title (like ChatGPT)
      const timestamp = new Date().toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
      const title = `New Chat - ${timestamp}`;

      const response = await axios.post("http://localhost:3000/api/chat", {
        title
      }, {
        withCredentials: true
      });
      
      dispatch(startNewChat(response.data.chat));
      dispatch(selectChat(response.data.chat._id));
      setMessages([]);
      setSidebarOpen(false);
    } catch (error) {
      console.error('Error creating chat:', error);
      if (error.response?.status === 401) {
        alert('Please login first');
        window.location.href = '/login';
      } else {
        alert('Failed to create chat. Please try again.');
      }
    }
  }

  // Ensure at least one chat exists initially
  useEffect(() => {

    axios.get("http://localhost:3000/api/chat", { withCredentials: true })
      .then(response => {
        const chatsList = response.data.chats.reverse();
        dispatch(setChats(chatsList));
        
        // Auto-select first chat if available and no active chat
        if (chatsList.length > 0 && !activeChatId) {
          dispatch(selectChat(chatsList[0]._id));
          getMessages(chatsList[0]._id);
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error fetching chats:", error);
        if (error.response?.status === 401) {
          window.location.href = '/login';
        }
        setIsLoading(false);
      });

    const tempSocket = io("http://localhost:3000", {
      withCredentials: true,
    })

    tempSocket.on("connect", () => {
      console.log("Socket connected:", tempSocket.id);
    });

    tempSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    tempSocket.on("ai-response", (messagePayload) => {
      console.log("Received AI response:", messagePayload);

      setMessages((prevMessages) => [ ...prevMessages, {
        type: 'ai',
        content: messagePayload.content
      } ]);

      dispatch(sendingFinished());
    });

    setSocket(tempSocket);

    return () => {
      tempSocket.disconnect();
    };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const sendMessage = async () => {

    const trimmed = input.trim();
    console.log("Sending message:", trimmed);
    
    if (!trimmed) {
      console.log("Empty message, not sending");
      return;
    }
    
    if (!activeChatId) {
      alert("Please create or select a chat first!");
      return;
    }
    
    if (!socket || !socket.connected) {
      alert("Connection lost. Please refresh the page.");
      return;
    }
    
    if (isSending) {
      console.log("Already sending a message");
      return;
    }
    
    dispatch(sendingStarted());

    const newMessages = [ ...messages, {
      type: 'user',
      content: trimmed
    } ];

    console.log("New messages array:", newMessages);
    console.log("Active chat ID:", activeChatId);
    console.log("Socket connected:", socket?.connected);

    setMessages(newMessages);
    dispatch(setInput(''));

    // Auto-update chat title with first message (ChatGPT-like behavior)
    if (messages.length === 0) {
      const autoTitle = trimmed.length > 50 
        ? trimmed.substring(0, 50) + '...' 
        : trimmed;
      
      try {
        await axios.patch(`http://localhost:3000/api/chat/${activeChatId}`, {
          title: autoTitle
        }, {
          withCredentials: true
        });
        
        // Update chat title in Redux store
        dispatch(setChats(chats.map(chat => 
          chat._id === activeChatId 
            ? { ...chat, title: autoTitle }
            : chat
        )));
      } catch (error) {
        console.error('Error updating chat title:', error);
      }
    }

    socket.emit("ai-message", {
      chat: activeChatId,
      content: trimmed
    });
    
    console.log("Message emitted to socket");
  }

  const getMessages = async (chatId) => {

   try {
     const response = await axios.get(`http://localhost:3000/api/chat/messages/${chatId}`, { withCredentials: true })

     console.log("Fetched messages:", response.data.messages);

     setMessages(response.data.messages.map(m => ({
       type: m.role === 'user' ? 'user' : 'ai',
       content: m.content,
       _id: m._id
     })));
   } catch (error) {
     console.error("Error fetching messages:", error);
     setMessages([]);
     if (error.response?.status === 401) {
       window.location.href = '/login';
     }
   }

  }

  const handleRenameChat = async (chatId, newTitle) => {
    try {
      await axios.patch(`http://localhost:3000/api/chat/${chatId}`, {
        title: newTitle
      }, {
        withCredentials: true
      });
      
      // Update chat title in local state
      dispatch(setChats(chats.map(chat => 
        chat._id === chatId 
          ? { ...chat, title: newTitle }
          : chat
      )));
    } catch (error) {
      console.error('Error renaming chat:', error);
      alert('Failed to rename chat. Please try again.');
    }
  };

  const handleDeleteChat = async (chatId) => {
    try {
      await axios.delete(`http://localhost:3000/api/chat/${chatId}`, {
        withCredentials: true
      });
      
      // Remove chat from local state
      const updatedChats = chats.filter(chat => chat._id !== chatId);
      dispatch(setChats(updatedChats));
      
      // If deleted chat was active, select another or clear
      if (activeChatId === chatId) {
        if (updatedChats.length > 0) {
          dispatch(selectChat(updatedChats[0]._id));
          getMessages(updatedChats[0]._id);
        } else {
          dispatch(selectChat(null));
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      alert('Failed to delete chat. Please try again.');
    }
  };


return (
  <div className="chat-layout minimal">
    <ChatMobileBar
      onToggleSidebar={() => setSidebarOpen(o => !o)}
      onNewChat={handleNewChat}
    />
    <ChatSidebar
      chats={chats}
      activeChatId={activeChatId}
      onSelectChat={(_id) => {
        dispatch(selectChat(_id));
        setSidebarOpen(false);
        getMessages(_id);
      }}
      onNewChat={handleNewChat}
      onRenameChat={handleRenameChat}
      onDeleteChat={handleDeleteChat}
      open={sidebarOpen}
    />
    <main className="chat-main" role="main">
      {isLoading ? (
        <div className="chat-welcome" aria-hidden="true">
          <h1>Loading...</h1>
          <p>Fetching your chats...</p>
        </div>
      ) : !activeChatId ? (
        <div className="chat-welcome" aria-hidden="true">
          <div className="chip">Early Preview</div>
          <h1>Welcome to Our ChatGPT</h1>
          <p>Create a new chat to get started. Click the "New" button in the sidebar to begin.</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="chat-welcome" aria-hidden="true">
          <div className="chip">Early Preview</div>
          <h1>Start Chatting</h1>
          <p>Ask anything. Paste text, brainstorm ideas, or get quick explanations. Your chats stay in the sidebar so you can pick up where you left off.</p>
        </div>
      ) : null}
      
      <ChatMessages messages={messages} isSending={isSending} />
      
        <ChatComposer
          input={input}
          setInput={(v) => dispatch(setInput(v))}
          onSend={sendMessage}
          isSending={isSending}
          disabled={!activeChatId}
        />
    </main>
    {sidebarOpen && (
      <button
        className="sidebar-backdrop"
        aria-label="Close sidebar"
        onClick={() => setSidebarOpen(false)}
      />
    )}
  </div>
);
};

export default Home;
