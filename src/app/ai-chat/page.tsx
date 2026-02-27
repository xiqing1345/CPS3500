"use client";

import { useEffect, useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const fullText = "How can I help you today?";
    let index = 0;
    const timer = setInterval(() => {
      index += 1;
      setGreeting(fullText.slice(0, index));
      if (index >= fullText.length) {
        clearInterval(timer);
      }
    }, 45);

    return () => clearInterval(timer);
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Server error");
      const botMsg: Message = { role: "assistant", content: data.text };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div>
      <h1>AI Chat Demo</h1>
      <div className="chat-container">
        <div className="chat-message assistant">{greeting}</div>
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`chat-message ${m.role}`}
          >
            {m.content}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <textarea
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()}>
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
