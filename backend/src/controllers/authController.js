// authController.js
const db = require('../db/db')
const { v4: uuid } = require('uuid')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
// LOGIN
exports.login = (req, res) => {
	const { email, password, rememberMe } = req.body

	if (!email || !password) {
		return res.status(400).json({ message: 'Email and password are required' })
	}

	db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
		if (err) return res.status(500).json({ message: 'Server error' })
		if (!user) return res.status(401).json({ message: 'Неверные данные' })

		const isMatch = await bcrypt.compare(password, user.password)
		if (!isMatch) return res.status(401).json({ message: 'Неверные данные' })

		// Access token (короткий)
		const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' })

		// ✅ Refresh token – создаём ВСЕГДА, но с разным сроком жизни
		const refreshExpiresIn = rememberMe ? '30d' : '1d'
		const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: refreshExpiresIn })

		// Сохраняем refreshToken в БД (для валидации в /refresh)
		db.run(`UPDATE users SET refreshToken = ? WHERE id = ?`, [refreshToken, user.id], err => {
			if (err) console.error('Failed to save refreshToken:', err)
		})

		const isProduction = process.env.NODE_ENV === 'production'
		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			sameSite: isProduction ? 'strict' : 'lax',
			secure: isProduction,
			maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : isProduction ? undefined : 24 * 60 * 60 * 1000,
			path: '/',
		})

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

	const allowedRoles = ['user', 'admin']
	if (!allowedRoles.includes(role)) {
		return res.status(400).json({ message: 'Invalid role' })
	}

	const hash = await bcrypt.hash(password, 10)
	const id = uuid()

	db.run(`INSERT INTO users (id, email, password, role) VALUES (?, ?, ?, ?)`, [id, email, hash, role], function (err) {
		if (err) {
			if (err.code === 'SQLITE_CONSTRAINT') {
				return res.status(409).json({ message: 'User already exists' })
			}
			return res.status(500).json({ message: 'Server error' })
		}

		const token = jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' })

		res.status(201).json({
			message: 'User created successfully',
			token,
			user: { id, email, role },
		})
	})
}

// REFRESH
exports.refresh = (req, res) => {
	const refreshToken = req.cookies.refreshToken

	if (!refreshToken) {
		return res.status(401).json({ message: 'No refresh token' })
	}

	// Верифицируем refresh token
	jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
		if (err) {
			return res.status(403).json({ message: 'Invalid or expired refresh token' })
		}

		// Находим пользователя в БД и проверяем, что сохранённый токен совпадает
		db.get(`SELECT * FROM users WHERE id = ? AND refreshToken = ?`, [decoded.id, refreshToken], (err, user) => {
			if (err || !user) {
				return res.status(403).json({ message: 'Invalid refresh token' })
			}

			// Выдаём новый access token
			const newAccessToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' })

			res.json({ token: newAccessToken, user: { id: user.id, email: user.email, role: user.role } })
		})
	})
}

// LOGOUT
exports.logout = (req, res) => {
	const { refreshToken } = req.cookies

	if (refreshToken) {
		db.run(`UPDATE users SET refreshToken = NULL WHERE refreshToken = ?`, [refreshToken])
	}

	res.clearCookie('refreshToken')

	res.json({ message: 'Logged out' })
}
