const db = require('../db/db')
const { v4: uuid } = require('uuid')

// GET TASKS — важное исправление!
exports.getTasks = (req, res) => {
	const { page = 1, limit = 15, search = '', status } = req.query
	const offset = (page - 1) * limit
	const userId = req.user.id
	const isAdmin = req.user.role === 'admin'

	let query = `SELECT * FROM tasks WHERE 1=1`
	let params = []

	if (!isAdmin) {
		query += ` AND userId = ?`
		params.push(userId)
	}

	if (search) {
		query += ` AND title LIKE ?`
		params.push(`%${search}%`)
	}

	if (status !== undefined && status !== '') {
		query += ` AND isCompleted = ?`
		params.push(status === 'true' ? 1 : 0)
	}

	query += ` LIMIT ? OFFSET ?`
	params.push(Number(limit), Number(offset))

	db.all(query, params, (err, rows) => {
		if (err) {
			console.error('getTasks error:', err)
			return res.status(500).json({ message: 'Database error' })
		}
		res.json(rows)
	})
}

// CREATE TASK
exports.createTask = (req, res) => {
	const { title, description, dueDate } = req.body

	if (!title) {
		return res.status(400).json({ message: 'Title is required' })
	}

	db.run(
		`INSERT INTO tasks (id, title, description, dueDate, isCompleted, userId) 
		 VALUES (?, ?, ?, ?, ?, ?)`,
		[uuid(), title, description || '', dueDate || null, 0, req.user.id],
		function () {
			res.json({ message: 'Task created', id: this.lastID })
		},
	)
}

// UPDATE + DELETE остаются почти как были (с проверкой прав)
exports.updateTask = (req, res) => {
	const { id } = req.params
	const { title, description, dueDate, isCompleted } = req.body

	db.get(`SELECT * FROM tasks WHERE id = ?`, [id], (err, task) => {
		if (err) return res.status(500).json({ message: 'Server error' })
		if (!task) return res.status(404).json({ message: 'Task not found' })

		if (task.userId !== req.user.id && req.user.role !== 'admin') {
			return res.status(403).json({ message: 'Forbidden' })
		}

		db.run(
			`UPDATE tasks SET title=?, description=?, dueDate=?, isCompleted=? WHERE id=?`,
			[title, description || task.description, dueDate || task.dueDate, isCompleted ? 1 : 0, id],
			() => res.json({ message: 'Task updated' }),
		)
	})
}

exports.deleteTask = (req, res) => {
	const { id } = req.params

	db.get(`SELECT * FROM tasks WHERE id = ?`, [id], (err, task) => {
		if (err) return res.status(500).json({ message: 'Server error' })
		if (!task) return res.status(404).json({ message: 'Task not found' })

		if (task.userId !== req.user.id && req.user.role !== 'admin') {
			return res.status(403).json({ message: 'Forbidden' })
		}

		db.run(`DELETE FROM tasks WHERE id=?`, [id], () => {
			res.json({ message: 'Task deleted' })
		})
	})
}
