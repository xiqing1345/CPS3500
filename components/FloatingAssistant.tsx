"use client";

import { useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function FloatingAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I’m your personal assistant. Ask me anything." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: "user", content: input.trim() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Server error");

      setMessages((prev) => [...prev, { role: "assistant", content: data.text || "" }]);
    } catch (e: any) {
      setError(e.message || "Failed to get response");
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="assistant-widget">
      {open && (
        <div className="assistant-panel">
          <div className="assistant-header">Personal Assistant</div>

          <div className="assistant-messages">
            {messages.map((message, idx) => (
              <div key={idx} className={`assistant-bubble ${message.role}`}>
                {message.content}
              </div>
            ))}
          </div>

          {error && <p className="assistant-error">{error}</p>}

          <div className="assistant-input-row">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask a question..."
              disabled={loading}
            />
            <button onClick={sendMessage} disabled={loading || !input.trim()}>
              {loading ? "..." : "Send"}
            </button>
          </div>
        </div>
      )}

      <button className="assistant-toggle" onClick={() => setOpen((prev) => !prev)}>
        {open ? "×" : "AI"}
      </button>
    </div>
  );
}
