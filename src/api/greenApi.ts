import type { GreenApiCredentials } from "@/types";

const API_HOST = "https://api.green-api.com";

/* =============================================================
 *  Типы запросов
 * ============================================================= */

export interface SendMessageRequest extends GreenApiCredentials {
  chatId: string;
  message: string;
}

export interface ReceiveNotificationRequest extends GreenApiCredentials {}

export interface DeleteNotificationRequest extends GreenApiCredentials {
  receiptId: number;
}

/* =============================================================
 *  Типы ответов
 * ============================================================= */

export interface SendMessageResponse {
  idMessage: string;
}

export interface DeleteNotificationResponse {
  result: boolean;
}

/** Уведомление из очереди GREEN-API (полная схема не нужна, берем только нужные поля). */
export interface Notification {
  receiptId: number;
  body: IncomingNotificationBody;
}

/** Часть схемы webhook-уведомления GREEN-API, которую мы реально читаем. */
export interface IncomingNotificationBody {
  typeWebhook: string;
  idMessage?: string;
  timestamp?: number;
  senderData?: {
    chatId?: string;
    sender?: string;
    chatName?: string;
    senderName?: string;
    senderPhoneNumber?: string;
  };
  messageData?: {
    typeMessage?: string;
    textMessageData?: {
      textMessage?: string;
    };
  };
}

/* =============================================================
 *  Общие утилиты
 * ============================================================= */

function buildUrl(
  idInstance: string,
  apiTokenInstance: string,
  method: string,
): string {
  return `${API_HOST}/waInstance${idInstance}/${method}/${apiTokenInstance}`;
}

async function readError(res: Response, fallback: string): Promise<string> {
  try {
    const text = await res.text();
    return text || fallback;
  } catch {
    return fallback;
  }
}

/* =============================================================
 *  Методы API
 * ============================================================= */

/**
 * Отправка текстового сообщения.
 * POST /waInstance{idInstance}/sendMessage/{apiTokenInstance}
 */
export async function sendMessage({
  idInstance,
  apiTokenInstance,
  chatId,
  message,
}: SendMessageRequest): Promise<SendMessageResponse> {
  const url = buildUrl(idInstance, apiTokenInstance, "sendMessage");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chatId, message }),
  });

  if (!res.ok) {
    const details = await readError(res, "unknown error");
    console.error("SendMessage failed:", res.status, details);
    throw new Error(`SendMessage failed (${res.status}): ${details}`);
  }

  return (await res.json()) as SendMessageResponse;
}

/**
 * Получение одного уведомления из очереди.
 * GET /waInstance{idInstance}/receiveNotification/{apiTokenInstance}
 * Возвращает null, если очередь пуста (по документации GREEN-API).
 */
export async function receiveNotification({
  idInstance,
  apiTokenInstance,
}: ReceiveNotificationRequest): Promise<Notification | null> {
  const url = buildUrl(idInstance, apiTokenInstance, "receiveNotification");
  const res = await fetch(url, { method: "GET" });

  if (!res.ok) {
    const details = await readError(res, "unknown error");
    throw new Error(`ReceiveNotification failed (${res.status}): ${details}`);
  }

  const json = (await res.json()) as Notification | null;
  return json;
}

/**
 * Удаление уведомления из очереди после обработки.
 * DELETE /waInstance{idInstance}/deleteNotification/{apiTokenInstance}/{receiptId}
 */
export async function deleteNotification({
  idInstance,
  apiTokenInstance,
  receiptId,
}: DeleteNotificationRequest): Promise<DeleteNotificationResponse> {
  const url = `${buildUrl(
    idInstance,
    apiTokenInstance,
    "deleteNotification",
  )}/${receiptId}`;

  const res = await fetch(url, { method: "DELETE" });

  if (!res.ok) {
    const details = await readError(res, "unknown error");
    throw new Error(`DeleteNotification failed (${res.status}): ${details}`);
  }

  return (await res.json()) as DeleteNotificationResponse;
}
