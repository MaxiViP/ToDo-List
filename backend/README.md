# 🧠 ToDo Backend API

Backend для ToDo-приложения на Node.js + Express + SQLite.

---

## 🚀 Стек

- Node.js
- Express 5
- SQLite3
- JWT (Access + Refresh)
- bcryptjs
- cookie-parser
- CORS
- Zod (валидация)
- Pino (логирование)

---

## ⚙️ Возможности

- 🔐 JWT авторизация (access + refresh)
- 🔄 Refresh token rotation (безопасность)
- 🍪 HttpOnly cookies
- 🔍 Поиск, фильтрация и сортировка задач
- 📄 Пагинация
- 👤 Роли (user / admin)
- 🛡️ Валидация входных данных (Zod)
- 📊 Логирование (Pino)
- 🧠 JSDoc типизация (подготовка к TypeScript)

---

## 🔐 Авторизация

### Схема:

- Access token — 15 минут
- Refresh token — хранится:
  - в cookie (httpOnly)
  - в базе данных

---

### 🔄 Flow

1. `POST /api/auth/login`
   - возвращает access token
   - устанавливает cookie refreshToken

2. Использование:

   ```
   Authorization: Bearer <token>
   ```

3. Обновление:

   ```
   POST /api/auth/refresh
   ```

   - выдаёт новый access token
   - 🔥 ротирует refresh token

4. Выход:

   ```
   POST /api/auth/logout
   ```

---

## 👑 Роли

- `user` → видит только свои задачи
- `admin` → видит ВСЕ задачи

---

## 🧪 Тестовые аккаунты

Создаются автоматически при запуске:

```
Admin:
admin@test.com / admin123

User:
user@test.com / 123456
```

---

## 📡 API

### AUTH

#### POST `/api/auth/login`

```json
{
	"email": "user@test.com",
	"password": "123456",
	"rememberMe": true
}
```

---

#### POST `/api/auth/register`

```json
{
	"email": "test@test.com",
	"password": "123456",
	"role": "user"
}
```

---

#### POST `/api/auth/refresh`

---

#### POST `/api/auth/logout`

---

## 📝 TASKS (требуется Authorization)

### GET `/api/tasks`

Query параметры:

- `page`
- `limit`
- `search`
- `status` (true/false)
- `sort` (date | status)

---

### POST `/api/tasks`

```json
{
	"title": "Task",
	"description": "Desc",
	"dueDate": "2026-04-01",
	"priority": "high"
}
```

---

### PUT `/api/tasks/:id`

---

### DELETE `/api/tasks/:id`

---

## 📦 Установка

```bash
npm install
```

---

## ▶️ Запуск

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

## 🗄️ База данных

### users

| поле         | тип  |
| ------------ | ---- |
| id           | TEXT |
| email        | TEXT |
| password     | TEXT |
| role         | TEXT |
| refreshToken | TEXT |

---

### tasks

| поле        | тип     |
| ----------- | ------- |
| id          | TEXT    |
| title       | TEXT    |
| description | TEXT    |
| dueDate     | TEXT    |
| priority    | TEXT    |
| isCompleted | INTEGER |
| userId      | TEXT    |

---

## 🌱 Seed

В режиме разработки:

- создаются пользователи
- создаются тестовые задачи

---

## 📁 Структура

```
src/
 ├── app.js
 ├── server.js
 ├── db/
 ├── routes/
 ├── controllers/
 ├── middleware/
 ├── validators/
 ├── utils/
```

---

## 🔐 Безопасность

- refresh token хранится в БД
- refresh token ротируется
- cookie httpOnly
- CORS настроен под frontend (`localhost:3000`)

---

## 🚀 Планы

- TypeScript
- Docker
- rate limit
- refresh token blacklist
- WebSockets (реалтайм задачи)

---

## 👤 Автор

Максим Поляков
📧 [batti@ya.ru](mailto:batti@ya.ru)
