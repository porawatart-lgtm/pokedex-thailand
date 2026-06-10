"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const EXAMPLE_QUESTIONS = [
  "จัดทีม Rain Team ให้หน่อย",
  "ตัวแก้ Garchomp คือตัวไหนดี?",
  "อธิบาย Weather teams ใน Gen 9",
  "โปเกมอนไฟที่ใช้ใน OU มีอะไรบ้าง",
  "สร้างทีม Stall team ให้หน่อย",
  "Counter Dragonite คืออะไร",
];

async function sendMessage(message: string, history: Message[]): Promise<string> {
  const res = await fetch("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      history: history.map((m) => ({ role: m.role, content: m.content })),
    }),
  });
  if (!res.ok) {
    const err = await res.json() as { error: string };
    throw new Error(err.error);
  }
  const data = await res.json() as { data: { response: string } };
  return data.data.response;
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "สวัสดีครับ! ผมคือ AI ผู้เชี่ยวชาญ Pokémon ถามผมเรื่อง Pokémon, กลยุทธ์การต่อสู้, Team Building หรืออะไรก็ได้ที่เกี่ยวกับ Pokémon ได้เลยครับ 🎮",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (msg?: string) => {
    const text = msg ?? input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { role: "user", content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await sendMessage(text, messages);
      const assistantMsg: Message = { role: "assistant", content: response, timestamp: new Date() };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สามารถเชื่อมต่อ AI ได้");
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary mb-4">
          <Sparkles className="h-3.5 w-3.5 fill-current" />
          Powered by Claude AI
        </div>
        <h1 className="text-3xl font-black mb-2">
          <Bot className="inline h-8 w-8 text-primary mr-2 mb-1" />
          AI <span className="text-gradient">Pokémon Chat</span>
        </h1>
        <p className="text-muted-foreground">
          ถามเรื่อง Pokémon, กลยุทธ์, Team Building หรืออะไรก็ได้
        </p>
      </div>

      {/* Example Questions */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {EXAMPLE_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => handleSend(q)}
            disabled={isLoading}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-secondary transition-colors disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="h-[50vh] overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex items-start gap-3",
                msg.role === "user" && "flex-row-reverse"
              )}
            >
              {/* Avatar */}
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  msg.role === "assistant"
                    ? "bg-primary/20 text-primary"
                    : "bg-secondary text-foreground"
                )}
              >
                {msg.role === "assistant" ? (
                  <Bot className="h-4 w-4" />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>

              {/* Message */}
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  msg.role === "assistant"
                    ? "bg-secondary text-foreground rounded-tl-sm"
                    : "bg-primary text-white rounded-tr-sm"
                )}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <p
                  className={cn(
                    "mt-1 text-[10px]",
                    msg.role === "assistant" ? "text-muted-foreground" : "text-white/60"
                  )}
                >
                  {msg.timestamp.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-secondary px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">AI กำลังตอบ...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSend();
            }}
            className="flex gap-3"
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="ถามเรื่อง Pokémon..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1 rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </form>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            * AI ตอบอาจมีความผิดพลาด ควรตรวจสอบข้อมูลจากแหล่งที่เชื่อถือได้
          </p>
        </div>
      </div>
    </div>
  );
}
