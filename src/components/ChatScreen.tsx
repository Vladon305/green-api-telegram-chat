import { useCallback, useState } from "react";
import ChatList from "./ChatList";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { sendMessage, type IncomingNotificationBody } from "@/api/greenApi";
import { usePolling } from "@/hooks/usePolling";
import type { Chat, ChatMessage, GreenApiCredentials } from "@/types";

interface ChatScreenProps {
  credentials: GreenApiCredentials;
}

/** Приводит телефон к chatId формата `{digits}@c.us`. */
function phoneToChatId(phone: string): string {
  return `${phone.replace(/\D/g, "")}@c.us`;
}

export default function ChatScreen({ credentials }: ChatScreenProps) {
  const { idInstance, apiTokenInstance } = credentials;

  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const activeChat = chats.find((c) => c.chatId === activeChatId) ?? null;

  const handleCreateChat = (phone: string): void => {
    const chatId = phoneToChatId(phone);

    setChats((prev) => {
      if (prev.some((c) => c.chatId === chatId)) return prev;
      return [...prev, { chatId, phone, name: phone, messages: [] }];
    });
    setActiveChatId(chatId);
  };

  const appendMessage = useCallback(
    (chatId: string, message: ChatMessage): void => {
      setChats((prev) =>
        prev.map((chat) =>
          chat.chatId === chatId
            ? { ...chat, messages: [...chat.messages, message] }
            : chat,
        ),
      );
    },
    [],
  );

  const handleIncomingNotification = useCallback(
    (body: IncomingNotificationBody): void => {
      if (body.typeWebhook !== "incomingMessageReceived") return;
      if (body.messageData?.typeMessage !== "textMessage") return;

      const chatId = body.senderData?.chatId ?? body.senderData?.sender;
      const text = body.messageData?.textMessageData?.textMessage;
      if (!chatId || !text) return;

      const newMessage: ChatMessage = {
        id: body.idMessage ?? String(Date.now()),
        text,
        fromMe: false,
        ...(body.timestamp !== undefined ? { timestamp: body.timestamp } : {}),
      };

      setChats((prev) => {
        const existing = prev.find((c) => c.chatId === chatId);

        if (existing) {
          return prev.map((chat) =>
            chat.chatId === chatId
              ? { ...chat, messages: [...chat.messages, newMessage] }
              : chat,
          );
        }

        // Автосоздание чата для входящего от незнакомого отправителя.
        return [
          ...prev,
          {
            chatId,
            phone: body.senderData?.senderPhoneNumber ?? chatId,
            name:
              body.senderData?.senderName ??
              body.senderData?.chatName ??
              chatId,
            messages: [newMessage],
          },
        ];
      });

      setActiveChatId((current) => current ?? chatId);
    },
    [],
  );

  usePolling({
    idInstance,
    apiTokenInstance,
    onMessage: handleIncomingNotification,
    enabled: chats.length > 0,
  });

  const handleSend = async (text: string): Promise<void> => {
    if (!activeChat) return;

    const optimisticId = `local-${Date.now()}`;
    appendMessage(activeChat.chatId, {
      id: optimisticId,
      text,
      fromMe: true,
      timestamp: Math.floor(Date.now() / 1000),
    });

    try {
      await sendMessage({
        idInstance,
        apiTokenInstance,
        chatId: activeChat.chatId,
        message: text,
      });
    } catch {
      setChats((prev) =>
        prev.map((chat) =>
          chat.chatId === activeChat.chatId
            ? {
                ...chat,
                messages: chat.messages.map((m) =>
                  m.id === optimisticId ? { ...m, error: true } : m,
                ),
              }
            : chat,
        ),
      );
    }
  };

  return (
    <div className="chat-screen">
      <aside className="chat-sidebar">
        <ChatList
          chats={chats}
          activeChatId={activeChatId}
          onSelect={setActiveChatId}
          onCreateChat={handleCreateChat}
        />
      </aside>

      <main className="chat-main">
        {activeChat ? (
          <>
            <header className="chat-header">
              <h2>{activeChat.name || activeChat.phone}</h2>
              <span className="chat-phone">{activeChat.phone}</span>
            </header>
            <MessageList messages={activeChat.messages} />
            <MessageInput onSend={handleSend} />
          </>
        ) : (
          <div className="chat-empty">
            <p>Выберите чат или создайте новый, введя номер телефона</p>
          </div>
        )}
      </main>

      <aside className="chat-info">
        {activeChat && (
          <>
            <h3>Информация</h3>
            <p>
              <strong>Телефон:</strong> {activeChat.phone}
            </p>
            <p>
              <strong>chatId:</strong> {activeChat.chatId}
            </p>
          </>
        )}
      </aside>
    </div>
  );
}
