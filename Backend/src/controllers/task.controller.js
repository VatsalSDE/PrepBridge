const Task = require('../models/Task');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const streakService = require('../services/streak.service');
const badgeService = require('../services/badge.service');
const { getSettings } = require('../services/platformSettings.service');
const { getStartOfDay, getNextDay, getDateRange } = require('../utils/date.utils');

// Get today's tasks
exports.getTodayTasks = asyncHandler(async (req, res) => {
  const { start, end } = getDateRange();

  const tasks = await Task.find({
    userId: req.user.id,
    date: { $gte: start, $lt: end }
  }).sort({ createdAt: 1 });

  // Sort by priority (high > medium > low)
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  res.json({
    success: true,
    count: tasks.length,
    data: tasks
  });
});

// Get tasks by date
exports.getTasksByDate = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const { start, end } = getDateRange(date ? new Date(date) : new Date());

  const tasks = await Task.find({
    userId: req.user.id,
    date: { $gte: start, $lt: end }
  }).sort({ createdAt: 1 });

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  res.json({
    success: true,
    count: tasks.length,
    data: tasks
  });
});

// Create task
exports.createTask = asyncHandler(async (req, res) => {
  const { title, description, category, priority, estimatedTime, date } = req.body;

  const taskDate = getStartOfDay(date ? new Date(date) : new Date());
  const settings = await getSettings();
  const dayEnd = getNextDay(taskDate);

  const existingTaskCount = await Task.countDocuments({
    userId: req.user.id,
    date: { $gte: taskDate, $lt: dayEnd },
  });

  if (existingTaskCount >= settings.maxTasksPerDay) {
    throw new AppError(`Daily task limit reached. Maximum ${settings.maxTasksPerDay} tasks are allowed per day.`, 400);
  }

  const task = await Task.create({
    userId: req.user.id,
    title,
    description,
    category,
    priority,
    estimatedTime,
    date: taskDate
  });

  await streakService.updateActivityLog(req.user.id, taskDate);

  res.status(201).json({
    success: true,
    data: task
  });
});

// Update task
exports.updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, category, priority, estimatedTime, actualTime, date } = req.body;

  let task = await Task.findById(id);

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  if (task.userId.toString() !== req.user.id) {
    throw new AppError('Not authorized to update this task', 403);
  }

  const previousTaskDate = task.date;
  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (category !== undefined) updateData.category = category;
  if (priority !== undefined) updateData.priority = priority;
  if (estimatedTime !== undefined) updateData.estimatedTime = estimatedTime;
  if (actualTime !== undefined) updateData.actualTime = actualTime;
  if (date !== undefined) {
    updateData.date = getStartOfDay(new Date(date));

    const settings = await getSettings();
    const nextDay = getNextDay(updateData.date);
    const existingTaskCount = await Task.countDocuments({
      userId: req.user.id,
      _id: { $ne: id },
      date: { $gte: updateData.date, $lt: nextDay },
    });

    if (existingTaskCount >= settings.maxTasksPerDay) {
      throw new AppError(`Daily task limit reached. Maximum ${settings.maxTasksPerDay} tasks are allowed per day.`, 400);
    }
  }

  task = await Task.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  });

  await streakService.updateActivityLog(req.user.id, previousTaskDate);
  if (task.date.getTime() !== new Date(previousTaskDate).getTime()) {
    await streakService.updateActivityLog(req.user.id, task.date);
  }

  res.json({
    success: true,
    data: task
  });
});

// Toggle task completion
exports.toggleTask = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let task = await Task.findById(id);

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  if (task.userId.toString() !== req.user.id) {
    throw new AppError('Not authorized', 403);
  }

  const isCompleting = !task.completed;
  if (isCompleting) {
    const completionDeadline = new Date(task.date);
    completionDeadline.setHours(23, 59, 59, 999);

    if (Date.now() > completionDeadline.getTime()) {
      throw new AppError('Task completion deadline passed. You can only mark this task complete before 11:59 PM of its scheduled day.', 400);
    }
  }

  task.completed = !task.completed;
  task.completedAt = task.completed ? new Date() : null;
  await task.save();

  await streakService.updateActivityLog(req.user.id, task.date);

  if (task.completed) {
    await streakService.updateStreakOnTaskComplete(req.user.id);
  }
  await badgeService.checkBadgeProgress(req.user.id);

  res.json({
    success: true,
    data: task
  });
});

// Delete task
exports.deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const task = await Task.findById(id);

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  if (task.userId.toString() !== req.user.id) {
    throw new AppError('Not authorized to delete this task', 403);
  }

  const taskDate = task.date;
  await Task.findByIdAndDelete(id);
  await streakService.updateActivityLog(req.user.id, taskDate);
  await badgeService.checkBadgeProgress(req.user.id);

  res.json({
    success: true,
    message: 'Task deleted'
  });
});

// Get task history (past tasks)
exports.getTaskHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, category, completed } = req.query;

  const query = {
    userId: req.user.id,
    date: { $lt: getStartOfDay() }
  };

  if (category) query.category = category;
  if (completed !== undefined) query.completed = completed === 'true';

  const tasks = await Task.find(query)
    .sort({ date: -1, createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Task.countDocuments(query);

  res.json({
    success: true,
    count: tasks.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: tasks
  });
});

// Update pomodoro count
exports.updatePomodoro = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { pomodoroCount, actualTime } = req.body;

  let task = await Task.findById(id);

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  if (task.userId.toString() !== req.user.id) {
    throw new AppError('Not authorized', 403);
  }

  if (pomodoroCount !== undefined) task.pomodoroCount = pomodoroCount;
  if (actualTime !== undefined) task.actualTime = actualTime;
  
  await task.save();
  await streakService.updateActivityLog(req.user.id, task.date);

  res.json({
    success: true,
    data: task
  });
});