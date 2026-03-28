// src/db/db.js
const sqlite3 = require('sqlite3').verbose()
const path = require('path')

// База будет храниться в файле tasks.db в папке db
const dbPath = path.join(__dirname, 'tasks.db')

const db = new sqlite3.Database(dbPath, err => {
	if (err) {
		console.error('Ошибка при подключении к базе:', err.message)
	} else {
		console.log('✅ Подключение к базе SQLite выполнено:', dbPath)
	}
})

// Создание таблиц, если их ещё нет
db.serialize(() => {
	// USERS
	db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT
    )
  `)

	// TASKS
	db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT,
      description TEXT,
      dueDate TEXT,
      priority TEXT DEFAULT 'обычный',
      isCompleted INTEGER DEFAULT 0,
      userId TEXT
    )
  `)
})

module.exports = db
