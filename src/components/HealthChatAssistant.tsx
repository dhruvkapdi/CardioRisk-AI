import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircleHeart, X, Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PredictionResult } from "@/types/cardiorisk";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface HealthChatAssistantProps {
  predictionResult: PredictionResult | null;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

export function HealthChatAssistant({ predictionResult }: HealthChatAssistantProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const buildContextPrefix = useCallback(() => {
    if (!predictionResult) return "";
    return `[User's latest prediction data — use this to personalize answers when relevant:
Risk: ${predictionResult.prediction}, Probability: ${predictionResult.probability}%, BMI: ${predictionResult.bmi}, BP: ${predictionResult.input.ap_hi}/${predictionResult.input.ap_lo}, Cholesterol level: ${predictionResult.input.cholesterol}, Glucose level: ${predictionResult.input.gluc}, Top factors: ${predictionResult.top_factors.join(", ")}]\n\n`;
  }, [predictionResult]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);

    const contextPrefix = buildContextPrefix();
    const apiMessages = [
      ...messages.map(m => ({ role: m.role, content: m.content })),
      { role: "user" as const, content: contextPrefix + text },
    ];

    let assistantContent = "";
    const assistantId = crypto.randomUUID();

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({ error: "Failed to connect" }));
        setMessages(prev => [...prev, { id: assistantId, role: "assistant", content: err.error || "Sorry, something went wrong.", timestamp: new Date() }]);
        setIsStreaming(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.id === assistantId) {
                  return prev.map(m => m.id === assistantId ? { ...m, content: assistantContent } : m);
                }
                return [...prev, { id: assistantId, role: "assistant", content: assistantContent, timestamp: new Date() }];
              });
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      if (!assistantContent) {
        setMessages(prev => [...prev, { id: assistantId, role: "assistant", content: "I'm sorry, I couldn't generate a response. Please try again.", timestamp: new Date() }]);
      }
    } catch {
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: "assistant", content: "Connection error. Please check your network and try again.", timestamp: new Date() }]);
    }
    setIsStreaming(false);
  }, [input, isStreaming, messages, buildContextPrefix]);

  const formatTime = (d: Date) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
            aria-label="Open health chat"
          >
            <MessageCircleHeart className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-3rem)] bg-card border border-border rounded-2xl shadow-xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-primary/5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-sm text-foreground">CardioRisk AI Assistant</h3>
                  <p className="text-[10px] text-muted-foreground">Cardiovascular health guidance</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <MessageCircleHeart className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">Ask me anything about cardiovascular health!</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {["What does high BP mean?", "How to lower cholesterol?", "Heart-healthy foods"].map(q => (
                      <button
                        key={q}
                        onClick={() => { setInput(q); }}
                        className="text-xs px-3 py-1.5 rounded-full border border-border bg-muted/50 text-foreground hover:bg-muted transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map(msg => (
                <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-3 h-3 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[80%] space-y-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                    <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}>
                      {msg.content}
                    </div>
                    <p className="text-[10px] text-muted-foreground px-1">{formatTime(msg.timestamp)}</p>
                  </div>
                  {msg.role === "user" && (
                    <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-3 h-3 text-accent" />
                    </div>
                  )}
                </div>
              ))}

              {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3 h-3 text-primary" />
                  </div>
                  <div className="px-3 py-2 rounded-2xl bg-muted rounded-bl-md">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Disclaimer */}
            <div className="px-4 py-1.5 border-t border-border/50">
              <p className="text-[9px] text-muted-foreground text-center">
                This assistant provides general health information and is not a substitute for professional medical advice.
              </p>
            </div>

            {/* Input */}
            <div className="px-3 pb-3 pt-1">
              <form
                onSubmit={e => { e.preventDefault(); sendMessage(); }}
                className="flex gap-2"
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask about heart health..."
                  className="flex-1 h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  disabled={isStreaming}
                />
                <Button type="submit" size="icon" className="h-10 w-10 rounded-xl" disabled={isStreaming || !input.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
