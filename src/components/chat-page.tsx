import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Plus, Trash2, Edit2, Check, X } from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../lib/firebase";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { getChatCompletion } from "../lib/gemini";

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
  const [editingTitle, setEditingTitle] = useState("");

  // Add ref for messages container
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatsRef = collection(db, "chats");
  const messagesRef = collection(db, "messages");

  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch chats
  useEffect(() => {
    if (!user) return;

    try {
      const chatsQuery = query(chatsRef, where("userId", "==", user.uid));

      const unsubscribe = onSnapshot(
        chatsQuery,
        (snapshot) => {
          const chatsList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Chat[];

          // Sort chats by createdAt on the client side
          chatsList.sort((a, b) => {
            const dateA = a.createdAt?.toDate() || new Date(0);
            const dateB = b.createdAt?.toDate() || new Date(0);
            return dateB.getTime() - dateA.getTime();
          });

          setChats(chatsList);

          if (chatsList.length > 0 && !currentChatId) {
            setCurrentChatId(chatsList[0].id);
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
  }, [user, currentChatId]);

  // Subscribe to messages for current chat
  useEffect(() => {
    if (!currentChatId) {
      setMessages([]);
      return;
    }

    try {
      const messagesQuery = query(
        messagesRef,
        where("chatId", "==", currentChatId)
      );

      const unsubscribe = onSnapshot(
        messagesQuery,
        (snapshot) => {
          const messagesList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Message[];

          // Sort messages by timestamp on the client side
          messagesList.sort((a, b) => {
            const dateA = a.timestamp?.toDate() || new Date(0);
            const dateB = b.timestamp?.toDate() || new Date(0);
            return dateA.getTime() - dateB.getTime();
          });

          setMessages(messagesList);
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
  }, [currentChatId]);

  const createNewChat = async () => {
    if (!user) return;
    setError(null);

    try {
      const newChat = await addDoc(chatsRef, {
        userId: user.uid,
        title: "New Chat",
        createdAt: serverTimestamp(),
      });

      const newChatData = {
        id: newChat.id,
        title: "New Chat",
        userId: user.uid,
        createdAt: new Date(),
      };

      setChats((prevChats) => [newChatData, ...prevChats]);
      setCurrentChatId(newChat.id);
    } catch (err) {
      console.error("Error creating new chat:", err);
      setError("Failed to create new chat. Please try again.");
    }
  };

  const startEditingChat = (chat: Chat) => {
    setEditingChatId(chat.id);
    setEditingTitle(chat.title);
  };

  const saveEditingChat = async () => {
    if (!editingChatId || !editingTitle.trim()) return;

    try {
      await updateDoc(doc(db, "chats", editingChatId), {
        title: editingTitle.trim(),
      });

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === editingChatId
            ? { ...chat, title: editingTitle.trim() }
            : chat
        )
      );
    } catch (err) {
      console.error("Error updating chat title:", err);
      setError("Failed to update chat title. Please try again.");
    } finally {
      setEditingChatId(null);
      setEditingTitle("");
    }
  };

  const cancelEditingChat = () => {
    setEditingChatId(null);
    setEditingTitle("");
  };

  const deleteChat = async (chatId: string) => {
    if (!user) return;
    setError(null);

    try {
      const messagesQuery = query(messagesRef, where("chatId", "==", chatId));
      const messagesSnapshot = await getDocs(messagesQuery);

      const deletePromises = messagesSnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);

      await deleteDoc(doc(chatsRef, chatId));

      const updatedChats = chats.filter((chat) => chat.id !== chatId);
      setChats(updatedChats);
      setCurrentChatId(updatedChats[0]?.id || null);
    } catch (err) {
      console.error("Error deleting chat:", err);
      setError("Failed to delete chat. Please try again.");
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
        chatId: currentChatId,
      });

      // Get AI response
      const aiResponse = await getChatCompletion(text);

      // Add AI message
      await addDoc(messagesRef, {
        text: aiResponse,
        isAi: true,
        timestamp: serverTimestamp(),
        userId: user.uid,
        chatId: currentChatId,
      });

      // Update chat title if it's the first message
      if (messages.length === 0) {
        await updateDoc(doc(chatsRef, currentChatId), {
          title: text.slice(0, 30) + (text.length > 30 ? "..." : ""),
        });

        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.id === currentChatId
              ? {
                  ...chat,
                  title: text.slice(0, 30) + (text.length > 30 ? "..." : ""),
                }
              : chat
          )
        );
      }
    } catch (err) {
      console.error("Error in chat interaction:", err);
      setError("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
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
          </button>
        </div>
        <div className="overflow-y-auto h-[calc(100%-5rem)]">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`flex items-center justify-between p-4 hover:bg-muted cursor-pointer ${
                currentChatId === chat.id ? "bg-muted" : ""
              }`}
            >
              {editingChatId === chat.id ? (
                <div className="flex items-center gap-2 w-full">
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    className="flex-1 px-2 py-1 rounded border border-input bg-background text-foreground text-sm"
                    autoFocus
                  />
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
                </div>
              ) : (
                <>
                  <div
                    onClick={() => setCurrentChatId(chat.id)}
                    className="flex-1 truncate text-card-foreground"
                  >
                    {chat.title}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEditingChat(chat)}
                      className="text-muted-foreground hover:text-blue-500 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteChat(chat.id)}
                      className="text-muted-foreground hover:text-red-500 transition-colors"
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
      <div className="flex-1 flex flex-col bg-background">
        <div className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-card-foreground">
              AI ChatBot
            </h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg mb-4">
              {error}
            </div>
          )}

          {currentChatId ? (
            <div className="space-y-4">
              {messages.map((message: Message) => (
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
              {/* Add invisible div for scrolling */}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a chat or create a new one to start
            </div>
          )}
        </div>

        <div className="px-6 pb-6">
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={isLoading || !currentChatId}
          />
        </div>
      </div>
    </div>
  );
}
