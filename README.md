# GREEN-API Telegram Chat

Веб-чат для отправки и получения сообщений в Telegram через
[GREEN-API](https://green-api.com/). Реализован на React + TypeScript + Vite.

## Стек

- React 18
- TypeScript 5.5 (strict)
- Vite 5
- GREEN-API (HTTP API, polling)

## Возможности

- Авторизация по `idInstance` и `apiTokenInstance`
- Создание чата по номеру телефона
- Отправка текстовых сообщений (метод `SendMessage`)
- Получение входящих сообщений (метод `ReceiveNotification`, polling)
- Оптимистичный UI с пометкой неотправленных сообщений
- Адаптивный трёхколоночный макет

## Требования

- Node.js 18+
- npm 9+
- Авторизованный инстанс GREEN-API

## Локальный запуск

```bash
# 1. Клонировать репозиторий
git clone https://github.com/Vladon305/green-api-telegram-chat
cd green-api-telegram-chat

# 2. Установить зависимости
npm install

# 3. Запустить dev-сервер
npm run dev
```

Откройте http://localhost:5173

## Проверка типов и сборка

```bash
npm run typecheck   # tsc --noEmit
npm run build       # tsc && vite build
npm run preview     # preview production build
```

## Настройка инстанса GREEN-API

В личном кабинете GREEN-API убедитесь, что:

- инстанс авторизован (статус **authorized**);

## Использование

1. Введите `idInstance` и `apiTokenInstance` из личного кабинета GREEN-API.
2. Нажмите **Войти**.
3. В левой панели введите номер телефона получателя в формате
   `79876543210` (без `+`, с кодом страны) и нажмите **+**.
4. Напишите сообщение и нажмите **Enter** или **Отправить**.
5. Ответ получателя появится в чате автоматически (polling каждые 5 секунд).

## Архитектура

- `src/api/greenApi.ts` — все запросы к GREEN-API
- `src/hooks/usePolling.ts` — polling уведомлений
- `src/components/` — UI-компоненты
- `src/types/` — доменные типы
