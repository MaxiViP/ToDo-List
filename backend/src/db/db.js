const sqlite3 = require('sqlite3').verbose()

const db = new sqlite3.Database(':memory:')

db.serialize(() => {
	// USERS
	db.run(`
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT
    )
  `)

	// TASKS
	db.run(`
    CREATE TABLE tasks (
      id TEXT PRIMARY KEY,
      title TEXT,
      description TEXT,
      dueDate TEXT,
      isCompleted INTEGER,
      userId TEXT
    )
  `)
})

module.exports = db
