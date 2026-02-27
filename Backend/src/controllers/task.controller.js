const Task = require('../models/Task');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

// Get today's tasks
exports.getTodayTasks = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const tasks = await Task.find({
    userId: req.user.id,
    date: { $gte: today, $lt: tomorrow }
  }).sort({ priority: -1, createdAt: 1 });

  res.json({
    success: true,
    count: tasks.length,
    data: tasks
  });
});

// Get tasks by date
exports.getTasksByDate = asyncHandler(async (req, res) => {
  const { date } = req.query;
  
  const targetDate = date ? new Date(date) : new Date();
  targetDate.setHours(0, 0, 0, 0);
  
  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const tasks = await Task.find({
    userId: req.user.id,
    date: { $gte: targetDate, $lt: nextDay }
  }).sort({ priority: -1, createdAt: 1 });

  res.json({
    success: true,
    count: tasks.length,
    data: tasks
  });
});

// Create task
exports.createTask = asyncHandler(async (req, res) => {
  const { title, description, category, priority, estimatedTime, date } = req.body;

  const taskDate = date ? new Date(date) : new Date();
  taskDate.setHours(0, 0, 0, 0);

  const task = await Task.create({
    userId: req.user.id,
    title,
    description,
    category,
    priority,
    estimatedTime,
    date: taskDate
  });

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

  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (category !== undefined) updateData.category = category;
  if (priority !== undefined) updateData.priority = priority;
  if (estimatedTime !== undefined) updateData.estimatedTime = estimatedTime;
  if (actualTime !== undefined) updateData.actualTime = actualTime;
  if (date !== undefined) {
    const taskDate = new Date(date);
    taskDate.setHours(0, 0, 0, 0);
    updateData.date = taskDate;
  }

  task = await Task.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  });

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

  task.completed = !task.completed;
  task.completedAt = task.completed ? new Date() : null;
  await task.save();

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

  await Task.findByIdAndDelete(id);

  res.json({
    success: true,
    message: 'Task deleted'
  });
});

// Get task history (past tasks)
exports.getTaskHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, category, completed } = req.query;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const query = {
    userId: req.user.id,
    date: { $lt: today }
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

  res.json({
    success: true,
    data: task
  });
});