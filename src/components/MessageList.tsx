import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/types";

interface MessageListProps {
  messages: ChatMessage[];
}

export default function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="message-list">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`message ${msg.fromMe ? "outgoing" : "incoming"}${
            msg.error ? " error" : ""
          }`}
        >
          <div className="message-text">{msg.text}</div>
          <div className="message-meta">
            {msg.timestamp !== undefined &&
              new Date(msg.timestamp * 1000).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            {msg.error && " · не отправлено"}
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
