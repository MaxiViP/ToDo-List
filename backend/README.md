# 🧠 ToDo Backend API

Backend для ToDo-приложения на Node.js + Express + SQLite.

## 🚀 Стек

- Node.js
- Express 5
- SQLite3
- JWT (access + refresh)
- bcrypt
- cookie-parser
- CORS

---
refresh token хранится в БД
cookie httpOnly
CORS настроен под frontend (localhost:3000)
admin видит ВСЕ задачи

Тестовые аккаунты

После запуска автоматически создаются:

Admin:
admin@test.com / admin123

User:
user@test.com / 123456

Авторизация

Используется схема:

Access token (15 мин)
Refresh token (cookie, httpOnly)
Flow:
/login → получаем access token + cookie refreshToken
access token используем в Authorization: Bearer
при истечении → /refresh
/logout → удаляет refresh token

## 📦 Установка

```bash
npm install

https://github.com/MaxiViP/ToDo-List

batti@ya.ru
Поляков Максим Викторович
-79057353580
```
