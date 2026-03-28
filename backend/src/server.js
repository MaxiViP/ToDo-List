// src/server.js
require('dotenv').config()

const app = require('./app')
const seedDatabase = require('./db/seed') // ← теперь правильно, т.к. seed.js в src/db/

const PORT = process.env.PORT || 3001

// Seed базы данных (только в development)
if (process.env.NODE_ENV !== 'production') {
	seedDatabase()
}

// Запуск сервера
app.listen(PORT, () => {
	console.log(`🚀 Server running on http://localhost:${PORT}`)
	console.log(`👤 Test accounts:`)
	console.log(`   • Admin → admin@test.com / admin123`)
	console.log(`   • User  → user@test.com / 123456`)
	console.log(`   • Secret admin code → ADMIN123`)
})
