"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
    role: "user" | "assistant";
    content: string;
}

const QUICK_PROMPTS = [
    "How does pricing work?",
    "Track my shipment",
    "Become a courier",
    "Payment methods",
];

export default function Chatbot() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "Hi! I'm the SwiftShip Assistant 👋 How can I help you today? You can ask me about pricing, tracking, courier registration, or anything else about SwiftShip.",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [unread, setUnread] = useState(0);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            setUnread(0);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [open]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    const sendMessage = async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed || loading) return;

        const userMsg: Message = { role: "user", content: trimmed };
        const updated = [...messages, userMsg];
        setMessages(updated);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: updated.map((m) => ({ role: m.role, content: m.content })),
                }),
            });
            const data = await res.json();
            const reply = data.reply ?? "Sorry, something went wrong. Please try again.";
            setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
            if (!open) setUnread((n) => n + 1);
        } catch {
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "Connection error. Please check your internet and try again." },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Floating button */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
                {/* Chat window */}
                {open && (
                    <div className="w-[360px] sm:w-[400px] rounded-2xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden"
                        style={{ height: "520px" }}>

                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="size-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                                    <Bot className="size-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold leading-none">SwiftShip Assistant</p>
                                    <p className="text-xs text-primary-foreground/70 mt-0.5 flex items-center gap-1">
                                        <span className="size-1.5 rounded-full bg-emerald-400 inline-block" />
                                        Online
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setOpen(false)}
                                className="size-7 rounded-lg hover:bg-primary-foreground/15 flex items-center justify-center transition-colors"
                            >
                                <Minimize2 className="size-4" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-background">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                    {msg.role === "assistant" && (
                                        <div className="size-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                                            <Bot className="size-3.5 text-primary" />
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                                            msg.role === "user"
                                                ? "bg-primary text-primary-foreground rounded-tr-sm"
                                                : "bg-secondary text-foreground rounded-tl-sm"
                                        }`}
                                    >
                                        {msg.content}
                                    </div>
                                    {msg.role === "user" && (
                                        <div className="size-6 rounded-full bg-muted border border-border flex items-center justify-center shrink-0 mt-0.5">
                                            <User className="size-3.5 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Typing indicator */}
                            {loading && (
                                <div className="flex gap-2 justify-start">
                                    <div className="size-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                                        <Bot className="size-3.5 text-primary" />
                                    </div>
                                    <div className="bg-secondary rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                                        <span className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                                        <span className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                                        <span className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                                    </div>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        {/* Quick prompts — only show when just the welcome message */}
                        {messages.length === 1 && (
                            <div className="px-4 py-2 flex flex-wrap gap-1.5 border-t border-border bg-background shrink-0">
                                {QUICK_PROMPTS.map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => sendMessage(p)}
                                        className="text-xs px-2.5 py-1 rounded-full border border-primary/25 bg-primary/5 text-primary hover:bg-primary/15 transition-colors"
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input */}
                        <div className="px-3 py-3 border-t border-border bg-card shrink-0">
                            <form
                                onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
                                className="flex gap-2"
                                suppressHydrationWarning
                            >
                                <Input
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask me anything..."
                                    disabled={loading}
                                    className="flex-1 text-sm h-9"
                                />
                                <Button type="submit" size="icon" className="size-9 shrink-0" disabled={!input.trim() || loading}>
                                    {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                                </Button>
                            </form>
                            <p className="text-xs text-muted-foreground text-center mt-2">Powered by SwiftShip AI</p>
                        </div>
                    </div>
                )}

                {/* Toggle button */}
                <button
                    onClick={() => setOpen((v) => !v)}
                    className="relative size-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90 hover:scale-105 transition-all duration-200 flex items-center justify-center"
                    aria-label="Toggle chat"
                >
                    {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
                    {!open && unread > 0 && (
                        <span className="absolute -top-1 -right-1 size-5 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center">
                            {unread}
                        </span>
                    )}
                </button>
            </div>
        </>
    );
}
