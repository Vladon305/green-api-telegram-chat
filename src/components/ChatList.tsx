import { useState, type SubmitEvent } from "react";
import type { Chat } from "@/types";

interface ChatListProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelect: (chatId: string) => void;
  onCreateChat: (phone: string) => void;
}

export default function ChatList({
  chats,
  activeChatId,
  onSelect,
  onCreateChat,
}: ChatListProps) {
  const [phone, setPhone] = useState<string>("");

  const handleCreate = (e: SubmitEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const cleaned = phone.trim();
    if (!cleaned) return;
    onCreateChat(cleaned);
    setPhone("");
  };

  return (
    <div className="chat-list">
      <form className="new-chat-form" onSubmit={handleCreate}>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Номер телефона"
        />
        <button type="submit" aria-label="Создать чат">
          +
        </button>
      </form>

      <ul className="chat-items">
        {chats.map((chat) => {
          const last = chat.messages[chat.messages.length - 1];
          return (
            <li
              key={chat.chatId}
              className={chat.chatId === activeChatId ? "active" : ""}
              onClick={() => onSelect(chat.chatId)}
            >
              <div className="chat-item-name">{chat.name || chat.phone}</div>
              <div className="chat-item-preview">
                {last?.text ?? "Нет сообщений"}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
