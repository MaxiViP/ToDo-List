const db = require('../db/db')
const { v4: uuid } = require('uuid')

// GET TASKS (с фильтрацией + пагинацией + поиском)
exports.getTasks = (req, res) => {
	const { page = 1, limit = 10, search = '', status } = req.query
	const offset = (page - 1) * limit

	let query = `SELECT * FROM tasks WHERE title LIKE ?`
	let params = [`%${search}%`]

	if (status !== undefined) {
		query += ` AND isCompleted = ?`
		params.push(status === 'true' ? 1 : 0)
	}

	query += ` LIMIT ? OFFSET ?`
	params.push(Number(limit), Number(offset))

	db.all(query, params, (err, rows) => {
		res.json(rows)
	})
}

// CREATE TASK
exports.createTask = (req, res) => {
	const { title, description, dueDate } = req.body

	if (!title) {
		return res.status(400).json({ message: 'Title required' })
	}

	db.run(
		`INSERT INTO tasks VALUES (?, ?, ?, ?, ?, ?)`,
		[uuid(), title, description, dueDate, 0, req.user.id],
		function () {
			res.json({ message: 'Task created' })
		},
	)
}

// UPDATE TASK
exports.updateTask = (req, res) => {
	const { id } = req.params
	const { title, description, dueDate, isCompleted } = req.body

	db.get(`SELECT * FROM tasks WHERE id = ?`, [id], (err, task) => {
		if (!task) return res.status(404).json({ message: 'Not found' })

		// проверка прав
		if (task.userId !== req.user.id && req.user.role !== 'admin') {
			return res.status(403).json({ message: 'Forbidden' })
		}

		db.run(
			`UPDATE tasks SET title=?, description=?, dueDate=?, isCompleted=? WHERE id=?`,
			[title, description, dueDate, isCompleted ? 1 : 0, id],
			() => res.json({ message: 'Updated' }),
		)
	})
}

// DELETE TASK
exports.deleteTask = (req, res) => {
	const { id } = req.params

	db.get(`SELECT * FROM tasks WHERE id = ?`, [id], (err, task) => {
		if (!task) return res.status(404).json({ message: 'Not found' })

		if (task.userId !== req.user.id && req.user.role !== 'admin') {
			return res.status(403).json({ message: 'Forbidden' })
		}

		db.run(`DELETE FROM tasks WHERE id=?`, [id], () => res.json({ message: 'Deleted' }))
	})
}
