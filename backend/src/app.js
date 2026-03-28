const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', require('./routes/auth'))
app.use('/api/tasks', require('./routes/tasks'))

app.use(require('./middleware/error'))

module.exports = app
