// src/server.js
require('dotenv').config()

const app = require('./app')
const seedDatabase = require('./db/seed')
const PORT = process.env.PORT || 3001

// Seed базы данных (только в development)
if (process.env.NODE_ENV !== 'production') {
	seedDatabase()
}

app.use((req, res, next) => {
	console.log('📥 Request:', {
		method: req.method,
		url: req.url,
		body: req.body,
		query: req.query,
	})
	next()
})

// Запуск сервера
app.listen(PORT, () => {
	console.log(`🚀 Server running on http://localhost:${PORT}`)
	console.log(`👤 Test accounts:`)
	console.log(`   • Admin → admin@test.com / admin123`)
	console.log(`   • User  → user@test.com / 123456`)
	console.log(`   • Secret admin code → ADMIN123`)
})
