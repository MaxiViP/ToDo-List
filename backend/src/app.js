// src/app.js
const express = require('express')
const cors = require('cors')
require('dotenv').config()
const cookieParser = require('cookie-parser')
const app = express()

app.use(
	cors({
		origin: 'http://localhost:3000',
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
	}),
)
app.use(express.json())
app.use(cookieParser())
// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/tasks', require('./routes/tasks'))

// Error handler
app.use(require('./middleware/error'))

module.exports = app
