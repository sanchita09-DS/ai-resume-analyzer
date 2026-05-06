import React, { useState, useEffect, useRef } from "react";
import { Send, Loader, MessageCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";
import { toast } from "sonner";

interface ChatMessage {
  id?: number;
  role: "user" | "assistant";
  content: string;
  createdAt?: Date;
}

interface AIChatbotProps {
  resumeId: number;
}

export function AIChatbot({ resumeId }: AIChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatQuery = trpc.chatbot.getHistory.useQuery({ resumeId });
  const sendMessageMutation = trpc.chatbot.sendMessage.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.message,
        },
      ]);
      setLoading(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send message");
      setLoading(false);
    },
  });

  // Load chat history
  useEffect(() => {
    if (chatQuery.data) {
      setMessages(
        chatQuery.data.map((msg) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          createdAt: new Date(msg.createdAt),
        }))
      );
    }
  }, [chatQuery.data]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    setLoading(true);

    // Add user message to UI
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
      },
    ]);

    // Send to API
    sendMessageMutation.mutate({
      resumeId,
      message: userMessage,
    });
  };

  return (
    <div className="flex flex-col h-full bg-card glow-box rounded-sm">
      {/* Header */}
      <div className="p-6 border-b-2 border-primary">
        <div className="flex items-center gap-3">
          <MessageCircle size={24} className="text-secondary neon-glow-cyan" />
          <div>
            <h2 className="text-xl font-bold text-foreground">AI Resume Coach</h2>
            <p className="text-sm text-muted-foreground">Get instant feedback on your resume</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <MessageCircle size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                Ask me anything about your resume!
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                I have full context of your resume and can provide targeted advice.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-sm ${
                  msg.role === "user" ? "chat-bubble-user" : "chat-bubble-assistant"
                }`}
              >
                {msg.role === "assistant" ? (
                  <Streamdown>{msg.content}</Streamdown>
                ) : (
                  <p className="text-sm">{msg.content}</p>
                )}
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="chat-bubble-assistant px-4 py-3 rounded-sm">
              <div className="flex items-center gap-2">
                <Loader size={16} className="animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-6 border-t-2 border-primary">
        <div className="flex gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me about your resume..."
            disabled={loading}
            className="input-neon flex-1 px-4 py-2 rounded-sm text-sm disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !inputValue.trim()}
            className="btn-neon px-4 py-2 rounded-sm disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <Loader size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
