<<<<<<< HEAD
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Plus, Trash2, Edit2, Check, X, Globe2 } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../lib/firebase';
import { ChatMessage } from './chat-message';
import { ChatInput } from './chat-input';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where,
=======
import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Globe2,
} from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  auth,
  db,
  createMessagesQuery,
  createChatsQuery,
} from "../lib/firebase";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import {
  collection,
  addDoc,
  serverTimestamp,
>>>>>>> 8b535ae (Update 3)
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
<<<<<<< HEAD
  orderBy
} from 'firebase/firestore';
import { getChatCompletion, SUPPORTED_LANGUAGES, type Language } from '../lib/gemini';
=======
} from "firebase/firestore";
import {
  getChatCompletion,
  SUPPORTED_LANGUAGES,
  type Language,
} from "../lib/gemini";
>>>>>>> 8b535ae (Update 3)

interface Message {
  id: string;
  text: string;
  isAi: boolean;
  timestamp: any;
  userId: string;
  chatId: string;
}

interface Chat {
  id: string;
  title: string;
  userId: string;
  createdAt: any;
  language?: Language;
}

export function ChatPage() {
  const [user] = useAuthState(auth);
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
<<<<<<< HEAD
  const [editingTitle, setEditingTitle] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const languageButtonRef = useRef<HTMLButtonElement>(null);

  const chatsRef = collection(db, 'chats');
  const messagesRef = collection(db, 'messages');

  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
=======
  const [editingTitle, setEditingTitle] = useState("");
  const [currentLanguage, setCurrentLanguage] = useState<Language>("en");
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const languageButtonRef = useRef<HTMLButtonElement>(null);

  const messagesRef = collection(db, "messages");

  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
>>>>>>> 8b535ae (Update 3)
  };

  // Auto scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close language menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
<<<<<<< HEAD
      if (languageButtonRef.current && !languageButtonRef.current.contains(event.target as Node)) {
=======
      if (
        languageButtonRef.current &&
        !languageButtonRef.current.contains(event.target as Node)
      ) {
>>>>>>> 8b535ae (Update 3)
        setIsLanguageMenuOpen(false);
      }
    };

<<<<<<< HEAD
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch chats
  useEffect(() => {
    if (!user) return;
    
    try {
      const chatsQuery = query(
        chatsRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
        const chatsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Chat[];
        
        setChats(chatsList);
        
        if (chatsList.length > 0 && !currentChatId) {
          setCurrentChatId(chatsList[0].id);
          setCurrentLanguage(chatsList[0].language || 'en');
        }
        setIsLoadingChats(false);
      }, (error) => {
        console.error('Error fetching chats:', error);
        setError('Failed to load chats. Please try refreshing the page.');
        setIsLoadingChats(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up chats listener:', err);
      setError('Failed to load chats. Please try refreshing the page.');
      setIsLoadingChats(false);
    }
  }, [user, currentChatId]);

  // Subscribe to messages for current chat
  useEffect(() => {
    if (!currentChatId) {
=======
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close sidebar on mobile when selecting a chat
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch chats
  useEffect(() => {
    if (!user) return;

    try {
      const unsubscribe = onSnapshot(
        createChatsQuery(user.uid),
        (snapshot) => {
          const chatsList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Chat[];

          setChats(chatsList);

          if (chatsList.length > 0 && !currentChatId) {
            setCurrentChatId(chatsList[0].id);
            setCurrentLanguage(chatsList[0].language || "en");
          }
          setIsLoadingChats(false);
        },
        (error) => {
          console.error("Error fetching chats:", error);
          setError("Failed to load chats. Please try refreshing the page.");
          setIsLoadingChats(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error("Error setting up chats listener:", err);
      setError("Failed to load chats. Please try refreshing the page.");
      setIsLoadingChats(false);
    }
  }, [user]);

  // Subscribe to messages for current chat
  useEffect(() => {
    if (!currentChatId || !user) {
>>>>>>> 8b535ae (Update 3)
      setMessages([]);
      return;
    }

    try {
<<<<<<< HEAD
      const messagesQuery = query(
        messagesRef,
        where('chatId', '==', currentChatId),
        orderBy('timestamp', 'asc')
      );

      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const messagesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Message[];
        
        setMessages(messagesList);
      }, (error) => {
        console.error('Error in messages subscription:', error);
        setError('Failed to load messages. Please try refreshing the page.');
      });

      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up messages listener:', err);
      setError('Failed to load messages. Please try refreshing the page.');
    }
  }, [currentChatId]);
=======
      const unsubscribe = onSnapshot(
        createMessagesQuery(currentChatId),
        (snapshot) => {
          const messagesList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Message[];

          setMessages(messagesList);
          setError(null); // Clear any previous errors
        },
        (error) => {
          console.error("Error in messages subscription:", error);
          setError("Failed to load messages. Please try refreshing the page.");
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error("Error setting up messages listener:", err);
      setError("Failed to load messages. Please try refreshing the page.");
    }
  }, [currentChatId, user]);
>>>>>>> 8b535ae (Update 3)

  const createNewChat = async () => {
    if (!user) return;
    setError(null);

    try {
<<<<<<< HEAD
      const newChat = await addDoc(chatsRef, {
        userId: user.uid,
        title: 'New Chat',
        createdAt: serverTimestamp(),
        language: currentLanguage
      });

      setCurrentChatId(newChat.id);
    } catch (err) {
      console.error('Error creating new chat:', err);
      setError('Failed to create new chat. Please try again.');
=======
      const newChat = await addDoc(collection(db, "chats"), {
        userId: user.uid,
        title: "New Chat",
        createdAt: serverTimestamp(),
        language: currentLanguage,
      });

      setCurrentChatId(newChat.id);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    } catch (err) {
      console.error("Error creating new chat:", err);
      setError("Failed to create new chat. Please try again.");
>>>>>>> 8b535ae (Update 3)
    }
  };

  const startEditingChat = (chat: Chat) => {
    setEditingChatId(chat.id);
    setEditingTitle(chat.title);
  };

  const saveEditingChat = async () => {
    if (!editingChatId || !editingTitle.trim()) return;
<<<<<<< HEAD
    
    try {
      await updateDoc(doc(db, 'chats', editingChatId), {
        title: editingTitle.trim()
      });
    } catch (err) {
      console.error('Error updating chat title:', err);
      setError('Failed to update chat title. Please try again.');
    } finally {
      setEditingChatId(null);
      setEditingTitle('');
=======

    try {
      await updateDoc(doc(db, "chats", editingChatId), {
        title: editingTitle.trim(),
      });
      setEditingChatId(null);
      setEditingTitle("");
    } catch (err) {
      console.error("Error updating chat title:", err);
      setError("Failed to update chat title. Please try again.");
>>>>>>> 8b535ae (Update 3)
    }
  };

  const cancelEditingChat = () => {
    setEditingChatId(null);
<<<<<<< HEAD
    setEditingTitle('');
=======
    setEditingTitle("");
>>>>>>> 8b535ae (Update 3)
  };

  const deleteChat = async (chatId: string) => {
    if (!user) return;
    setError(null);

    try {
<<<<<<< HEAD
      const messagesQuery = query(messagesRef, where('chatId', '==', chatId));
      const messagesSnapshot = await getDocs(messagesQuery);
      
      const deletePromises = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      await deleteDoc(doc(chatsRef, chatId));
      
      if (currentChatId === chatId) {
        const remainingChats = chats.filter(chat => chat.id !== chatId);
        setCurrentChatId(remainingChats[0]?.id || null);
      }
    } catch (err) {
      console.error('Error deleting chat:', err);
      setError('Failed to delete chat. Please try again.');
=======
      // Get all messages for this chat
      const messagesSnapshot = await getDocs(createMessagesQuery(chatId));

      // Delete all messages
      const deletePromises = messagesSnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);

      // Delete the chat
      await deleteDoc(doc(db, "chats", chatId));

      if (currentChatId === chatId) {
        const remainingChats = chats.filter((chat) => chat.id !== chatId);
        setCurrentChatId(remainingChats[0]?.id || null);
      }
    } catch (err) {
      console.error("Error deleting chat:", err);
      setError("Failed to delete chat. Please try again.");
>>>>>>> 8b535ae (Update 3)
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!user || !currentChatId) return;
    setError(null);
    setIsLoading(true);

    try {
      // Add user message
      await addDoc(messagesRef, {
        text,
        isAi: false,
        timestamp: serverTimestamp(),
        userId: user.uid,
<<<<<<< HEAD
        chatId: currentChatId
      });

      // Get chat history for context
      const chatHistory = messages.map(msg => ({
        role: msg.isAi ? 'model' : 'user' as const,
        parts: msg.text,
        timestamp: msg.timestamp?.toDate() || new Date()
      }));

      // Get AI response with chat history
      const aiResponse = await getChatCompletion(text, currentLanguage, chatHistory);
      
=======
        chatId: currentChatId,
      });

      // Get chat history for context
      const chatHistory = messages.map((msg) => ({
        role: msg.isAi ? "model" : ("user" as const),
        parts: msg.text,
        timestamp: msg.timestamp?.toDate() || new Date(),
      }));

      // Get AI response with chat history
      const aiResponse = await getChatCompletion(
        text,
        currentLanguage,
        chatHistory
      );

>>>>>>> 8b535ae (Update 3)
      // Add AI message
      await addDoc(messagesRef, {
        text: aiResponse,
        isAi: true,
        timestamp: serverTimestamp(),
        userId: user.uid,
<<<<<<< HEAD
        chatId: currentChatId
=======
        chatId: currentChatId,
>>>>>>> 8b535ae (Update 3)
      });

      // Update chat title if it's the first message
      if (messages.length === 0) {
<<<<<<< HEAD
        await updateDoc(doc(chatsRef, currentChatId), {
          title: text.slice(0, 30) + (text.length > 30 ? '...' : '')
        });
      }
    } catch (err) {
      console.error('Error in chat interaction:', err);
      setError('Failed to send message. Please try again.');
=======
        await updateDoc(doc(db, "chats", currentChatId), {
          title: text.slice(0, 30) + (text.length > 30 ? "..." : ""),
        });
      }
    } catch (err) {
      console.error("Error in chat interaction:", err);
      setError("Failed to send message. Please try again.");
>>>>>>> 8b535ae (Update 3)
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = async (language: Language) => {
    setCurrentLanguage(language);
    setIsLanguageMenuOpen(false);

    if (currentChatId) {
      try {
<<<<<<< HEAD
        await updateDoc(doc(chatsRef, currentChatId), { language });
      } catch (err) {
        console.error('Error updating chat language:', err);
        setError('Failed to update chat language. Please try again.');
=======
        await updateDoc(doc(db, "chats", currentChatId), { language });
      } catch (err) {
        console.error("Error updating chat language:", err);
        setError("Failed to update chat language. Please try again.");
>>>>>>> 8b535ae (Update 3)
      }
    }
  };

  if (isLoadingChats) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
<<<<<<< HEAD
    <div className="flex h-[calc(100vh-8rem)]">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border">
        <div className="p-4">
          <button
            onClick={createNewChat}
            className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Chat
=======
    <div className="flex h-[calc(100vh-8rem)] relative">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-card rounded-lg p-2 shadow-md"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Sidebar */}
      <div
        className={`
          fixed md:relative w-64 bg-card border-r border-border h-full z-40
          transition-transform duration-300 ease-in-out
          ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
        `}
      >
        <div className="p-4">
          <button
            onClick={createNewChat}
            className="w-full inline-flex items-center justify-center gap-2 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
>>>>>>> 8b535ae (Update 3)
          </button>
        </div>
        <div className="overflow-y-auto h-[calc(100%-5rem)]">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`flex items-center justify-between p-4 hover:bg-muted cursor-pointer ${
<<<<<<< HEAD
                currentChatId === chat.id ? 'bg-muted' : ''
              }`}
            >
              {editingChatId === chat.id ? (
                <div className="flex items-center gap-2 w-full">
=======
                currentChatId === chat.id ? "bg-muted" : ""
              }`}
            >
              {editingChatId === chat.id ? (
                <div className="flex items-center gap-2 w-full pr-2">
>>>>>>> 8b535ae (Update 3)
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    className="flex-1 px-2 py-1 rounded border border-input bg-background text-foreground text-sm"
                    autoFocus
                  />
<<<<<<< HEAD
                  <button
                    onClick={saveEditingChat}
                    className="text-green-500 hover:text-green-400"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={cancelEditingChat}
                    className="text-red-500 hover:text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
=======
                  <div className="flex items-center gap-1">
                    <button
                      onClick={saveEditingChat}
                      className="p-1 text-green-500 hover:text-green-400"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={cancelEditingChat}
                      className="p-1 text-red-500 hover:text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
>>>>>>> 8b535ae (Update 3)
                </div>
              ) : (
                <>
                  <div
                    onClick={() => {
                      setCurrentChatId(chat.id);
<<<<<<< HEAD
                      setCurrentLanguage(chat.language || 'en');
=======
                      setCurrentLanguage(chat.language || "en");
                      if (window.innerWidth < 768) {
                        setIsSidebarOpen(false);
                      }
>>>>>>> 8b535ae (Update 3)
                    }}
                    className="flex-1 truncate text-card-foreground"
                  >
                    {chat.title}
                  </div>
<<<<<<< HEAD
                  <div className="flex items-center gap-2">
=======
                  <div className="flex items-center gap-1 ml-2">
>>>>>>> 8b535ae (Update 3)
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditingChat(chat);
                      }}
<<<<<<< HEAD
                      className="text-muted-foreground hover:text-blue-500 transition-colors"
=======
                      className="p-1 text-muted-foreground hover:text-blue-500 transition-colors"
>>>>>>> 8b535ae (Update 3)
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat.id);
                      }}
<<<<<<< HEAD
                      className="text-muted-foreground hover:text-red-500 transition-colors"
=======
                      className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
>>>>>>> 8b535ae (Update 3)
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
<<<<<<< HEAD
      <div className="flex-1 flex flex-col bg-background">
        <div className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
=======
      <div className="flex-1 flex flex-col bg-background md:ml-0">
        <div className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
>>>>>>> 8b535ae (Update 3)
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
<<<<<<< HEAD
              <h1 className="text-2xl font-bold text-card-foreground">AI ChatBot</h1>
            </div>
            
=======
              <h1 className="text-2xl font-bold text-card-foreground">
                AI ChatBot
              </h1>
            </div>

>>>>>>> 8b535ae (Update 3)
            {/* Language Selector */}
            <div className="relative" ref={languageButtonRef}>
              <button
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card hover:bg-muted transition-colors"
              >
                <Globe2 className="w-4 h-4" />
<<<<<<< HEAD
                <span className="text-sm">{SUPPORTED_LANGUAGES[currentLanguage]}</span>
              </button>
              
=======
                <span className="text-sm hidden sm:inline">
                  {SUPPORTED_LANGUAGES[currentLanguage]}
                </span>
              </button>

>>>>>>> 8b535ae (Update 3)
              {isLanguageMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg bg-card border border-border shadow-lg z-50">
                  <div className="py-1 max-h-64 overflow-y-auto">
                    {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                      <button
                        key={code}
                        onClick={() => handleLanguageChange(code as Language)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors ${
<<<<<<< HEAD
                          currentLanguage === code ? 'bg-muted' : ''
=======
                          currentLanguage === code ? "bg-muted" : ""
>>>>>>> 8b535ae (Update 3)
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

<<<<<<< HEAD
        <div className="flex-1 overflow-y-auto px-6 py-4">
=======
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4">
>>>>>>> 8b535ae (Update 3)
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg mb-4">
              {error}
            </div>
          )}
<<<<<<< HEAD
          
          {currentChatId ? (
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  id={message.id}
                  message={message.text}
                  isAi={message.isAi}
                  timestamp={message.timestamp?.toDate() || new Date()}
                />
              ))}
              {isLoading && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-pulse text-muted-foreground">AI is thinking...</div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
=======

          {currentChatId ? (
            messages.length > 0 ? (
              <div className="space-y-4 max-w-3xl mx-auto">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    id={message.id}
                    message={message.text}
                    isAi={message.isAi}
                    timestamp={message.timestamp?.toDate() || new Date()}
                  />
                ))}
                {isLoading && (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-pulse text-muted-foreground">
                      AI is thinking...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Start a new conversation
              </div>
            )
>>>>>>> 8b535ae (Update 3)
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a chat or create a new one to start
            </div>
          )}
        </div>

<<<<<<< HEAD
        <div className="px-6 pb-6">
          <ChatInput 
            onSendMessage={handleSendMessage} 
            disabled={isLoading || !currentChatId} 
          />
=======
        <div className="px-4 md:px-6 pb-6">
          <div className="max-w-3xl mx-auto">
            <ChatInput
              onSendMessage={handleSendMessage}
              disabled={isLoading || !currentChatId}
            />
          </div>
>>>>>>> 8b535ae (Update 3)
        </div>
      </div>
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 8b535ae (Update 3)
