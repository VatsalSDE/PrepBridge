require('dotenv').config();

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const User = require('../src/models/User');
const CommunityPost = require('../src/models/CommunityPost');
const PostReport = require('../src/models/PostReport');

const API_BASE = `http://localhost:${process.env.PORT || 5000}/api`;

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

async function request(path, token, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
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
  const adminEmail = `rt_admin_${runId}@prepbridge.local`;
  const ownerEmail = `rt_owner_${runId}@prepbridge.local`;
  const reporterEmail = `rt_reporter_${runId}@prepbridge.local`;
  const createdUserIds = [];

  try {
    await mongoose.connect(process.env.MONGO_URI);

    const admin = await User.create({
      name: 'Realtime Admin',
      email: adminEmail,
      password: 'Password123',
      role: 'admin',
      status: 'active',
      isVerified: true,
    });

    const owner = await User.create({
      name: 'Post Owner',
      email: ownerEmail,
      password: 'Password123',
      role: 'student',
      status: 'active',
      isVerified: true,
    });

    const reporter = await User.create({
      name: 'Reporter User',
      email: reporterEmail,
      password: 'Password123',
      role: 'student',
      status: 'active',
      isVerified: true,
    });

    createdUserIds.push(admin._id, owner._id, reporter._id);

    const adminToken = jwt.sign({ userId: String(admin._id) }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const ownerToken = jwt.sign({ userId: String(owner._id) }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const reporterToken = jwt.sign({ userId: String(reporter._id) }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const createRes = await request('/community/posts', ownerToken, {
      method: 'POST',
      body: {
        category: 'dsa',
        title: `Report Toggle Post ${runId}`,
        content: 'Post for report toggle verification',
      },
    });

    const postId = createRes.data._id;

    const firstReport = await request(`/community/posts/${postId}/report`, reporterToken, {
      method: 'POST',
      body: { reason: 'spam' },
    });

    assert(firstReport.data?.isReported === true, 'First report should set isReported=true');

    const reportsAfterFirst = await request('/admin/community/reports', adminToken);
    const foundAfterFirst = (reportsAfterFirst.data || []).find(
      (report) => report.postId?._id === postId && report.status === 'pending'
    );
    assert(foundAfterFirst, 'Reported post should be visible as pending in admin reports');

    console.log('PASS: Reported post appears in admin reports');

    const secondReport = await request(`/community/posts/${postId}/report`, reporterToken, {
      method: 'POST',
      body: { reason: 'spam' },
    });

    assert(secondReport.data?.isReported === false, 'Second report click should remove report');

    const reportsAfterSecond = await request('/admin/community/reports', adminToken);
    const stillExists = (reportsAfterSecond.data || []).find(
      (report) => report.postId?._id === postId && report.reporterId?._id === String(reporter._id)
    );
    assert(!stillExists, 'Report should be removed from admin list after unreport');

    const post = await CommunityPost.findById(postId).select('reportCount');
    assert((post?.reportCount || 0) === 0, 'Post reportCount should return to 0 after unreport');

    console.log('PASS: Second click removes report and resets report count');
    console.log('Report toggle smoke test completed successfully');
  } finally {
    if (createdUserIds.length > 0) {
      const postIds = await CommunityPost.find({ userId: { $in: createdUserIds } }).distinct('_id');
      await Promise.all([
        PostReport.deleteMany({ $or: [{ reporterId: { $in: createdUserIds } }, { postId: { $in: postIds } }] }),
        CommunityPost.deleteMany({ userId: { $in: createdUserIds } }),
        User.deleteMany({ _id: { $in: createdUserIds } }),
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
    console.error('Report toggle smoke test failed:', error.message);
    process.exit(1);
  });
