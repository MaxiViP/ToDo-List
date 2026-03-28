const db = require('../db/db')
const { v4: uuid } = require('uuid')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// LOGIN
exports.login = (req, res) => {
	const { email, password } = req.body

	if (!email || !password) {
		return res.status(400).json({ message: 'Email and password are required' })
	}

	db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
		if (err) return res.status(500).json({ message: 'Server error' })
		if (!user) {
			return res.status(401).json({ message: 'Invalid credentials' })
		}

		const isMatch = await bcrypt.compare(password, user.password)
		if (!isMatch) {
			return res.status(401).json({ message: 'Invalid credentials' })
		}

		const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })

		res.json({
			token,
			user: { id: user.id, email: user.email, role: user.role },
		})
	})
}

// REGISTER
exports.register = async (req, res) => {
	const { email, password, role = 'user' } = req.body

	if (!email || !password) {
		return res.status(400).json({ message: 'Email and password are required' })
	}

	// Защита: разрешаем только 'user' и 'admin'
	const allowedRoles = ['user', 'admin']
	if (!allowedRoles.includes(role)) {
		return res.status(400).json({ message: 'Invalid role' })
	}

	const hash = await bcrypt.hash(password, 10) // лучше 10, а не 5

	db.run(
		`INSERT INTO users (id, email, password, role) VALUES (?, ?, ?, ?)`,
		[uuid(), email, hash, role],
		function (err) {
			if (err) {
				if (err.code === 'SQLITE_CONSTRAINT') {
					return res.status(409).json({ message: 'User with this email already exists' })
				}
				return res.status(500).json({ message: 'Server error' })
			}

			// После регистрации сразу логиним пользователя
			const token = jwt.sign({ id: this.lastID, role }, process.env.JWT_SECRET, { expiresIn: '7d' })

			res.status(201).json({
				message: 'User created successfully',
				token,
				user: { id: this.lastID, email, role },
			})
		},
	)
}
