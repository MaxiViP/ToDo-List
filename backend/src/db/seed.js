// db/seed.js
const db = require('./db')
const { v4: uuid } = require('uuid')
const bcrypt = require('bcryptjs')

const seedDatabase = () => {
	console.log('🌱 Seeding database...')

	const adminPassword = 'admin123'
	const userPassword = '123456'

	const adminHash = bcrypt.hashSync(adminPassword, 10)
	const userHash = bcrypt.hashSync(userPassword, 10)

	// Создаём админа
	db.run(
		`INSERT OR IGNORE INTO users (id, email, password, role) 
     VALUES (?, 'admin@test.com', ?, 'admin')`,
		[uuid(), adminHash],
		() => console.log('✅ Admin created: admin@test.com / admin123'),
	)

	// Создаём обычного пользователя
	db.run(
		`INSERT OR IGNORE INTO users (id, email, password, role) 
     VALUES (?, 'user@test.com', ?, 'user')`,
		[uuid(), userHash],
		() => console.log('✅ User created: user@test.com / 123456'),
	)

	// Добавляем несколько тестовых задач для user@test.com
	db.get(`SELECT id FROM users WHERE email = 'user@test.com'`, [], (err, user) => {
		if (user) {
			const tasks = [
				['Купить продукты', 'Молоко, хлеб, яйца', '2026-04-05', 0, user.id],
				['Сдать проект', 'Завершить тестовое задание', '2026-04-10', 0, user.id],
				['Позвонить маме', '', '2026-04-02', 1, user.id],
			]

			tasks.forEach(([title, description, dueDate, isCompleted, userId]) => {
				db.run(
					`INSERT OR IGNORE INTO tasks (id, title, description, dueDate, isCompleted, userId)
           VALUES (?, ?, ?, ?, ?, ?)`,
					[uuid(), title, description, dueDate, isCompleted, userId],
				)
			})
			console.log('✅ Test tasks added for user@test.com')
		}
	})

	console.log('🎉 Database seeding completed!')
}

module.exports = seedDatabase
