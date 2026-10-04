import { useState, type SubmitEvent } from "react";
import type { GreenApiCredentials } from "@/types";

interface AuthScreenProps {
  onAuth: (credentials: GreenApiCredentials) => void;
}

export default function AuthScreen({ onAuth }: AuthScreenProps) {
  const [idInstance, setIdInstance] = useState<string>("");
  const [apiTokenInstance, setApiTokenInstance] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>): void => {
    e.preventDefault();

    const trimmedId = idInstance.trim();
    const trimmedToken = apiTokenInstance.trim();

    if (!trimmedId || !trimmedToken) {
      setError("Заполните оба поля");
      return;
    }

    setError("");
    onAuth({ idInstance: trimmedId, apiTokenInstance: trimmedToken });
  };

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>GREEN-API · Telegram Chat</h1>
        <p className="auth-hint">
          Введите данные из личного кабинета GREEN-API
        </p>

        <label>
          idInstance
          <input
            type="text"
            value={idInstance}
            onChange={(e) => setIdInstance(e.target.value)}
            placeholder="1101000000"
            autoComplete="off"
          />
        </label>

        <label>
          apiTokenInstance
          <input
            type="password"
            value={apiTokenInstance}
            onChange={(e) => setApiTokenInstance(e.target.value)}
            placeholder="abcdef12345..."
            autoComplete="off"
          />
        </label>

        {error && <p className="auth-error">{error}</p>}

        <button type="submit">Войти</button>
      </form>
    </div>
  );
}
