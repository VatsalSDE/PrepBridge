require('dotenv').config();

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const User = require('../src/models/User');
const Reflection = require('../src/models/Reflection');
const WeeklyReport = require('../src/models/WeeklyReport');
const Task = require('../src/models/Task');

const API_BASE = `http://localhost:${process.env.PORT || 5000}/api`;

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

async function request(path, token, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json();
  if (!response.ok || data.success === false) {
    throw new Error(`${options.method || 'GET'} ${path} failed: ${data.message || response.statusText}`);
  }

  return data;
}

async function main() {
  const runId = Date.now();
  let userId;

  try {
    await mongoose.connect(process.env.MONGO_URI);

    const user = await User.create({
      name: 'Reports Smoke User',
      email: `reports_smoke_${runId}@prepbridge.local`,
      password: 'Password123',
      role: 'student',
      status: 'active',
      isVerified: true,
    });

    userId = user._id;
    const token = jwt.sign({ userId: String(user._id) }, process.env.JWT_SECRET, { expiresIn: '1h' });

    await Task.create({
      userId,
      title: 'Estimated-time report task',
      category: 'dsa',
      completed: true,
      estimatedTime: 90,
      actualTime: 0,
      date: new Date(),
    });

    const weekly = await request('/reports/weekly', token);
    assert(weekly.data?.summary, 'Weekly report must include summary');
    assert((weekly.data?.summary?.totalMinutes || 0) >= 90, 'Weekly report should count estimated time when actual time is missing');

    const dashboard = await request('/reports/dashboard', token);
    assert(Array.isArray(dashboard.data?.trendSeries), 'Dashboard must include trend series');
    assert(Array.isArray(dashboard.data?.monthlyOverview), 'Dashboard must include monthly overview');
    assert((dashboard.data?.cards?.totalHours?.value || 0) > 0, 'Dashboard total hours should reflect completed task time');

    const stats = await request('/reports/stats?days=30', token);
    assert(stats.data?.tasks, 'Stats must include task summary');

    const reflection = await request('/reports/reflection', token, {
      method: 'POST',
      body: {
        type: 'weekly',
        mood: 'good',
        accomplishments: 'Completed focused learning sessions',
        challenges: 'Need better time boxing',
        learnings: 'Smaller goals improve consistency',
        tomorrowGoals: 'Finish roadmap foundation section',
        gratitude: 'Supportive peers',
      },
    });
    assert(reflection.data?._id, 'Reflection should be created');

    const reflections = await request('/reports/reflections?limit=10', token);
    assert(Array.isArray(reflections.data), 'Reflections response should be array');
    assert(reflections.data.length > 0, 'Reflections list should not be empty after submit');

    const history = await request('/reports/history?limit=12', token);
    assert(Array.isArray(history.data), 'History response should be array');

    console.log('Reports module smoke test completed successfully');
  } finally {
    if (userId) {
      await Promise.all([
        Task.deleteMany({ userId }),
        Reflection.deleteMany({ userId }),
        WeeklyReport.deleteMany({ userId }),
        User.deleteOne({ _id: userId }),
      ]);
    }

    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Reports module smoke test failed:', error.message);
    process.exit(1);
  });
