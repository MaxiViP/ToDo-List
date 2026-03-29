// src/db/db.js
const sqlite3 = require('sqlite3').verbose()
const path = require('path')

const dbPath = path.join(__dirname, 'tasks.db')

const db = new sqlite3.Database(dbPath, err => {
	if (err) {
		console.error('Ошибка при подключении к базе:', err.message)
	} else {
		console.log('✅ Подключение к базе SQLite выполнено:', dbPath)
	}
})

db.serialize(() => {
	// USERS
	db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT,
      refreshToken TEXT
    )
  `)

	// TASKS
	db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT,
      description TEXT,
      dueDate TEXT,
      priority TEXT DEFAULT 'normal',
      isCompleted INTEGER DEFAULT 0,
      userId TEXT
    )
  `)
})
// ✅ ИНДЕКСЫ
db.run(`CREATE INDEX IF NOT EXISTS idx_tasks_userId ON tasks(userId)`)
db.run(`CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(isCompleted)`)
module.exports = db
