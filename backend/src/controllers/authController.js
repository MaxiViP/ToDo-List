const db = require('../db/db')
const { v4: uuid } = require('uuid')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// LOGIN
exports.login = (req, res) => {
	const { email, password } = req.body

	db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
		if (!user) {
			return res.status(401).json({ message: 'Invalid credentials' })
		}

		const isMatch = await bcrypt.compare(password, user.password)

		if (!isMatch) {
			return res.status(401).json({ message: 'Invalid credentials' })
		}

		const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET)

		res.json({ token })
	})
}

// REGISTER (для теста)
exports.register = async (req, res) => {
	const { email, password, role = 'user' } = req.body

	const hash = await bcrypt.hash(password, 5)

	db.run(`INSERT INTO users VALUES (?, ?, ?, ?)`, [uuid(), email, hash, role], function (err) {
		if (err) {
			return res.status(400).json({ message: 'User exists' })
		}

		res.json({ message: 'User created' })
	})
}
