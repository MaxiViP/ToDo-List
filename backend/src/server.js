require('dotenv').config()

const app = require('./app')
const seedDatabase = require('./db/seed')
const logger = require('./utils/logger')

const PORT = process.env.PORT || 3001

if (!process.env.JWT_SECRET) {
	throw new Error('❌ JWT_SECRET is not set')
}

// seed только в dev
if (process.env.NODE_ENV !== 'production') {
	seedDatabase()
}

app.listen(PORT, () => {
	logger.info(`🚀 Server running on http://localhost:${PORT}`)
})
