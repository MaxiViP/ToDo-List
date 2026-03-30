const router = require('express').Router()
const ctrl = require('../controllers/taskController')
const auth = require('../middleware/auth')
const validate = require('../middleware/validate')
const { createTaskSchema, updateTaskSchema } = require('../validators/task')

router.use(auth)

router.get('/', ctrl.getTasks)
router.post('/', validate(createTaskSchema), ctrl.createTask)
router.put('/:id', validate(updateTaskSchema), ctrl.updateTask)
router.delete('/:id', ctrl.deleteTask)

module.exports = router
