import { useEffect, useState } from "react";
import AuthScreen from "./components/AuthScreen";
import ChatScreen from "./components/ChatScreen";
import type { GreenApiCredentials } from "./types";

const STORAGE_KEY = "greenApiCredentials";

function readStoredCredentials(): GreenApiCredentials | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<GreenApiCredentials>;
    if (
      typeof parsed.idInstance === "string" &&
      typeof parsed.apiTokenInstance === "string"
    ) {
      return {
        idInstance: parsed.idInstance,
        apiTokenInstance: parsed.apiTokenInstance,
      };
    }
  } catch {
    /* ignore */
  }

  sessionStorage.removeItem(STORAGE_KEY);
  return null;
}

export default function App() {
  const [credentials, setCredentials] = useState<GreenApiCredentials | null>(
    null,
  );

  useEffect(() => {
    setCredentials(readStoredCredentials());
  }, []);

  const handleAuth = (creds: GreenApiCredentials): void => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(creds));
    setCredentials(creds);
  };

  if (!credentials) {
    return <AuthScreen onAuth={handleAuth} />;
  }

  return <ChatScreen credentials={credentials} />;
}
