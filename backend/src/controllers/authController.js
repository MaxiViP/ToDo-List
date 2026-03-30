const db = require('../db/db')
const { v4: uuid } = require('uuid')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

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

		const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' })

		const refreshExpiresIn = rememberMe ? '30d' : '1d'
		const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: refreshExpiresIn })

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

exports.refresh = (req, res) => {
	const refreshToken = req.cookies.refreshToken

	if (!refreshToken) {
		return res.status(401).json({ message: 'No refresh token' })
	}

	jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
		if (err) {
			return res.status(403).json({ message: 'Invalid refresh token' })
		}

		db.get(`SELECT * FROM users WHERE id = ? AND refreshToken = ?`, [decoded.id, refreshToken], (err, user) => {
			if (err || !user) {
				return res.status(403).json({ message: 'Invalid refresh token' })
			}

			const newRefreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' })

			db.run(`UPDATE users SET refreshToken = ? WHERE id = ?`, [newRefreshToken, user.id])

			const newAccessToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' })

			res.cookie('refreshToken', newRefreshToken, {
				httpOnly: true,
				sameSite: 'lax',
			})

			res.json({
				token: newAccessToken,
				user: { id: user.id, email: user.email, role: user.role },
			})
		})
	})
}

exports.logout = (req, res) => {
	const { refreshToken } = req.cookies

	if (refreshToken) {
		db.run(`UPDATE users SET refreshToken = NULL WHERE refreshToken = ?`, [refreshToken])
	}

	res.clearCookie('refreshToken')

	res.json({ message: 'Logged out' })
}
