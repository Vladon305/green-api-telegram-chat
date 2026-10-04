/** Учётные данные инстанса GREEN-API */
export interface GreenApiCredentials {
  idInstance: string;
  apiTokenInstance: string;
}

/** Одно сообщение в ленте чата */
export interface ChatMessage {
  id: string;
  text: string;
  fromMe: boolean;
  /** Unix timestamp (секунды). У локально добавленных сообщений — момент отправки. */
  timestamp?: number;
  /** Флаг для оптимистично добавленных сообщений, которые не удалось отправить */
  error?: boolean;
}

/** Чат (диалог с одним получателем) */
export interface Chat {
  /** chatId в формате `{phone}@c.us` */
  chatId: string;
  phone: string;
  name: string;
  messages: ChatMessage[];
}
