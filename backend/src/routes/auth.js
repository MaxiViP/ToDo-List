const router = require('express').Router()
const ctrl = require('../controllers/authController')
const validate = require('../middleware/validate')
const { loginSchema, registerSchema } = require('../validators/auth')

router.post('/login', validate(loginSchema), ctrl.login)
router.post('/register', validate(registerSchema), ctrl.register)

router.post('/refresh', ctrl.refresh)
router.post('/logout', ctrl.logout)

module.exports = router
