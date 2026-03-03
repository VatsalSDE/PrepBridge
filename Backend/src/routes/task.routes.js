const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  getTodayTasks,
  getTasksByDate,
  createTask,
  updateTask,
  toggleTask,
  deleteTask,
  getTaskHistory,
  updatePomodoro
} = require('../controllers/task.controller');

router.use(protect);

router.route('/')
  .get(getTodayTasks)
  .post(createTask);

router.get('/history', getTaskHistory);
router.get('/date', getTasksByDate);

router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

router.patch('/:id/toggle', toggleTask);
router.patch('/:id/pomodoro', updatePomodoro);

module.exports = router;
