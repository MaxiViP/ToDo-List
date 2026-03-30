const { z } = require('zod')

exports.loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
	rememberMe: z.boolean().optional(),
})

exports.registerSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
	role: z.enum(['user', 'admin']).optional(),
})
