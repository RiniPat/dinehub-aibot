import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Bot, User, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatAgentProps {
  restaurantId: number;
  restaurantName: string;
  accentColor?: string;
}

export default function ChatAgent({ restaurantId, restaurantName, accentColor = "#7C3AED" }: ChatAgentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setError(null);
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/restaurants/${restaurantId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          history: messages,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Something went wrong" }));
        throw new Error(err.message);
      }

      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err: any) {
      setError(err.message || "Failed to get a response");
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I'm having trouble right now. Please try again in a moment! 🙏" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    "What's your bestseller?",
    "Any vegetarian options?",
    "Recommend something under 50 AED",
    "What desserts do you have?",
  ];

  return (
    <>
      {/* Chat Bubble Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform"
            style={{ backgroundColor: accentColor }}
          >
            <MessageCircle className="w-6 h-6" />
            {/* Pulse dot */}
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-white animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[550px] max-h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div
              className="px-5 py-4 flex items-center justify-between text-white shrink-0"
              style={{ backgroundColor: accentColor }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">{restaurantName}</h3>
                  <p className="text-[11px] opacity-80 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-300 inline-block" />
                    AI Menu Assistant
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
              {/* Welcome message */}
              {messages.length === 0 && (
                <div className="space-y-4">
                  <div className="flex gap-2.5">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5"
                      style={{ backgroundColor: accentColor }}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-sm border border-gray-100 max-w-[85%]">
                      <p className="text-sm text-gray-700">
                        Hi there! 👋 I'm your AI menu assistant. Ask me anything about our dishes — I can help with recommendations, ingredients, dietary needs, or prices!
                      </p>
                    </div>
                  </div>

                  {/* Quick questions */}
                  <div className="pl-9 flex flex-wrap gap-2">
                    {quickQuestions.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => { setInput(q); setTimeout(() => { setInput(q); sendMessageDirect(q); }, 50); }}
                        className="px-3 py-1.5 text-xs font-medium rounded-full border border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat messages */}
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  {msg.role === "assistant" ? (
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5"
                      style={{ backgroundColor: accentColor }}
                    >
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5 text-gray-500" />
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2.5 max-w-[80%] shadow-sm ${
                      msg.role === "user"
                        ? "text-white rounded-tr-md"
                        : "bg-white border border-gray-100 text-gray-700 rounded-tl-md"
                    }`}
                    style={msg.role === "user" ? { backgroundColor: accentColor } : {}}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex gap-2.5">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: accentColor }}
                  >
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-sm border border-gray-100">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-gray-100 bg-white shrink-0">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Ask about the menu..."
                  disabled={isLoading}
                  className="flex-1 h-10 px-4 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent disabled:opacity-50"
                  style={{ "--tw-ring-color": accentColor + "40" } as any}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
                  style={{ backgroundColor: accentColor }}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-gray-400 text-center mt-1.5">
                Powered by AI · May not always be accurate
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  // Direct send helper for quick questions
  function sendMessageDirect(text: string) {
    if (isLoading) return;
    setError(null);
    setMessages(prev => [...prev, { role: "user", content: text }]);
    setIsLoading(true);
    setInput("");

    fetch(`/api/restaurants/${restaurantId}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, history: messages }),
    })
      .then(async res => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({ message: "Something went wrong" }));
          throw new Error(err.message);
        }
        return res.json();
      })
      .then(data => {
        setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
      })
      .catch(err => {
        setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I'm having trouble right now. Please try again! 🙏" }]);
      })
      .finally(() => setIsLoading(false));
  }
}
