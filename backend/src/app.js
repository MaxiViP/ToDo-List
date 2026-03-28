// src/app.js
const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/tasks', require('./routes/tasks'))

// Error handler
app.use(require('./middleware/error'))

module.exports = app
