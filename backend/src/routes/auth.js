const router = require('express').Router()
const ctrl = require('../controllers/authController')

// Вход и регистрация
router.post('/login', ctrl.login)
router.post('/register', ctrl.register)

// Обновление токена
 

router.post('/refresh', ctrl.refresh)

// Выход (очистка refresh-токена)
router.post('/logout', ctrl.logout)

module.exports = router
