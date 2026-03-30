const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')

const loggerMiddleware = require('./middleware/logger')

const app = express()

app.use(loggerMiddleware)

app.use(
	cors({
		origin: 'http://localhost:3000',
		credentials: true,
	}),
)

app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', require('./routes/auth'))
app.use('/api/tasks', require('./routes/tasks'))

app.use(require('./middleware/error'))

module.exports = app
