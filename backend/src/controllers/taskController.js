const db = require('../db/db')
const { v4: uuid } = require('uuid')

// =====================
// GET TASKS
// =====================
exports.getTasks = (req, res) => {
	const { page = 1, limit = 15, search = '', status } = req.query
	const offset = (page - 1) * limit
	const userId = req.user.id
	const isAdmin = req.user.role === 'admin'
	const { sort = 'date' } = req.query

	let orderBy = 'ORDER BY dueDate DESC'

	if (sort === 'status') {
		orderBy = `
  ORDER BY 
    isCompleted ASC, 
    CASE 
      WHEN priority = 'high' THEN 1
      WHEN priority = 'normal' THEN 2
      WHEN priority = 'low' THEN 3
      ELSE 4
    END,
    dueDate ASC
`
	}
	console.log('📥 GET /tasks', { userId, isAdmin, query: req.query })

	let baseQuery = `FROM tasks WHERE 1=1`
	let params = []

	if (!isAdmin) {
		baseQuery += ` AND userId = ?`
		params.push(userId)
	}

	if (search) {
		baseQuery += ` AND title LIKE ?`
		params.push(`%${search}%`)
	}

	if (status !== undefined && status !== '') {
		baseQuery += ` AND isCompleted = ?`
		params.push(status === 'true' ? 1 : 0)
	}

	// Сначала получаем total
	db.get(`SELECT COUNT(*) as total ${baseQuery}`, params, (err, row) => {
		if (err) {
			console.error('🔴 COUNT ERROR:', err)
			return res.status(500).json({ message: 'Database error' })
		}

		const total = row.total

		// Потом получаем саму страницу
		const query = `
  SELECT * ${baseQuery}
  ${orderBy}
  LIMIT ? OFFSET ?
`
		const queryParams = [...params, Number(limit), Number(offset)]

		db.all(query, queryParams, (err, rows) => {
			if (err) {
				console.error('🔴 getTasks error:', err)
				return res.status(500).json({ message: 'Database error' })
			}

			console.log('🟢 TASKS FOUND:', rows.length)

			res.json({
				tasks: rows,
				total,
			})
		})
	})
}

// =====================
// CREATE TASK
// =====================
exports.createTask = (req, res) => {
	console.log('📥 POST /tasks BODY:', req.body)

	const { title, description, dueDate, priority } = req.body

	if (!title) {
		console.warn('⚠️ Title missing')
		return res.status(400).json({ message: 'Title is required' })
	}

	// Валидация приоритета
	const allowedPriorities = ['low', 'normal', 'high']
	const finalPriority = allowedPriorities.includes(priority) ? priority : 'normal'

	const id = uuid()

	db.run(
		`INSERT INTO tasks (id, title, description, dueDate, priority, isCompleted, userId) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
		[id, title, description || '', dueDate || null, finalPriority, 0, req.user.id],
		function (err) {
			if (err) {
				console.error('🔴 CREATE ERROR:', err)
				return res.status(500).json({ message: 'Database error' })
			}

			console.log('🟢 TASK CREATED:', {
				id,
				title,
				userId: req.user.id,
			})

			res.json({
				id,
				title,
				description: description || '',
				dueDate: dueDate || null,
				priority: finalPriority,
				isCompleted: 0,
				userId: req.user.id,
			})
		},
	)
}

// =====================
// UPDATE TASK
// =====================
exports.updateTask = (req, res) => {
	const { id } = req.params
	const { title, description, dueDate, isCompleted, priority } = req.body

	console.log('📥 PUT /tasks/:id', {
		id,
		body: req.body,
		user: req.user,
	})

	db.get(`SELECT * FROM tasks WHERE id = ?`, [id], (err, task) => {
		if (err) {
			console.error('🔴 FETCH BEFORE UPDATE ERROR:', err)
			return res.status(500).json({ message: 'Server error' })
		}

		if (!task) {
			console.warn('⚠️ Task not found:', id)
			return res.status(404).json({ message: 'Task not found' })
		}

		if (task.userId !== req.user.id && req.user.role !== 'admin') {
			console.warn('⛔ Forbidden update attempt', {
				taskUser: task.userId,
				currentUser: req.user.id,
			})
			return res.status(403).json({ message: 'Forbidden' })
		}

		// Подготовка данных: если поле не передано, оставляем старое значение
		const newTitle = title !== undefined ? title : task.title
		const newDescription = description !== undefined ? description : task.description
		const newDueDate = dueDate !== undefined ? dueDate : task.dueDate
		const newIsCompleted = isCompleted !== undefined ? (isCompleted ? 1 : 0) : task.isCompleted

		// Валидация приоритета, если передан
		let newPriority = task.priority
		if (priority !== undefined) {
			const allowedPriorities = ['low', 'normal', 'high']
			newPriority = allowedPriorities.includes(priority) ? priority : task.priority
		}

		db.run(
			`UPDATE tasks SET title=?, description=?, dueDate=?, priority=?, isCompleted=? WHERE id=?`,
			[newTitle, newDescription, newDueDate, newPriority, newIsCompleted, id],
			function (err) {
				if (err) {
					console.error('🔴 UPDATE ERROR:', err)
					return res.status(500).json({ message: 'Database error' })
				}

				console.log('🟢 TASK UPDATED:', id)

				res.json({ message: 'Task updated' })
			},
		)
	})
}

// =====================
// DELETE TASK
// =====================
exports.deleteTask = (req, res) => {
	const { id } = req.params

	console.log('📥 DELETE /tasks/:id', {
		id,
		user: req.user,
	})

	db.get(`SELECT * FROM tasks WHERE id = ?`, [id], (err, task) => {
		if (err) {
			console.error('🔴 FETCH BEFORE DELETE ERROR:', err)
			return res.status(500).json({ message: 'Server error' })
		}

		if (!task) {
			console.warn('⚠️ Task not found:', id)
			return res.status(404).json({ message: 'Task not found' })
		}

		if (task.userId !== req.user.id && req.user.role !== 'admin') {
			console.warn('⛔ Forbidden delete attempt')
			return res.status(403).json({ message: 'Forbidden' })
		}

		db.run(`DELETE FROM tasks WHERE id=?`, [id], function (err) {
			if (err) {
				console.error('🔴 DELETE ERROR:', err)
				return res.status(500).json({ message: 'Database error' })
			}

			console.log('🟢 TASK DELETED:', id)

			res.json({ message: 'Task deleted' })
		})
	})
}
