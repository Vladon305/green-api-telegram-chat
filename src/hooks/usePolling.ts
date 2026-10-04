// src/hooks/usePolling.ts
import { useCallback, useEffect, useRef } from "react";
import {
  deleteNotification,
  receiveNotification,
  type IncomingNotificationBody,
} from "@/api/greenApi";

interface UsePollingParams {
  idInstance: string;
  apiTokenInstance: string;
  onMessage: (body: IncomingNotificationBody) => void;
  enabled: boolean;
  /** Пауза между итерациями в миллисекундах. */
  intervalMs?: number;
}

export function usePolling({
  idInstance,
  apiTokenInstance,
  onMessage,
  enabled,
  intervalMs = 5000,
}: UsePollingParams): void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stoppedRef = useRef<boolean>(false);

  // Стабильная ссылка на колбэк, чтобы не перезапускать polling при каждом рендере.
  const onMessageRef = useRef(onMessage);
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const poll = useCallback(async (): Promise<void> => {
    if (stoppedRef.current) return;

    try {
      const notification = await receiveNotification({
        idInstance,
        apiTokenInstance,
      });

      if (notification && notification.body) {
        await deleteNotification({
          idInstance,
          apiTokenInstance,
          receiptId: notification.receiptId,
        });

        onMessageRef.current(notification.body);
      }
    } catch (err) {
      // 429/5xx — логируем, не останавливая polling.
      const message = err instanceof Error ? err.message : String(err);
      console.warn("Polling error:", message);
    }

    if (!stoppedRef.current) {
      timerRef.current = setTimeout(() => {
        void poll();
      }, intervalMs);
    }
  }, [idInstance, apiTokenInstance, intervalMs]);

  useEffect(() => {
    if (!enabled) return;

    stoppedRef.current = false;
    void poll();

    return () => {
      stoppedRef.current = true;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [enabled, poll]);
}
