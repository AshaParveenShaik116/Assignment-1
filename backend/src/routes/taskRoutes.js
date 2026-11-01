const express = require('express');
const taskController = require('../controllers/taskController');

const router = express.Router();

router.get('/', taskController.listTasks);
router.post('/', taskController.createTask);
router.get('/:id', taskController.getTask);
router.put('/:id', taskController.updateTask);
router.patch('/:id/status', taskController.updateTaskStatus);
router.delete('/:id', taskController.archiveTask);

module.exports = router;
