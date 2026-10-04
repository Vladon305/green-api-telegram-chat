import { useState, type SubmitEvent, type KeyboardEvent } from "react";

interface MessageInputProps {
  onSend: (text: string) => void | Promise<void>;
}

export default function MessageInput({ onSend }: MessageInputProps) {
  const [text, setText] = useState<string>("");

  const submit = (): void => {
    const trimmed = text.trim();
    if (!trimmed) return;
    void onSend(trimmed);
    setText("");
  };

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>): void => {
    e.preventDefault();
    submit();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <form className="message-input" onSubmit={handleSubmit}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Напишите сообщение..."
        rows={1}
      />
      <button type="submit">Отправить</button>
    </form>
  );
}
