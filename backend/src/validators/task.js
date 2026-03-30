const { z } = require('zod')

exports.createTaskSchema = z.object({
	title: z.string().min(1),
	description: z.string().optional(),
	dueDate: z.string().optional(),
	priority: z.enum(['low', 'normal', 'high']).optional(),
})

exports.updateTaskSchema = z.object({
	title: z.string().optional(),
	description: z.string().optional(),
	dueDate: z.string().optional(),
	isCompleted: z.boolean().optional(),
	priority: z.enum(['low', 'normal', 'high']).optional(),
})
