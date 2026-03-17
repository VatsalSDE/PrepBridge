require('dotenv').config();

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const User = require('../src/models/User');
const CommunityPost = require('../src/models/CommunityPost');
const PostReport = require('../src/models/PostReport');
const PostComment = require('../src/models/PostComment');
const PostUpvote = require('../src/models/PostUpvote');
const PostBookmark = require('../src/models/PostBookmark');

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
  const users = [];

  try {
    await mongoose.connect(process.env.MONGO_URI);

    const admin = await User.create({
      name: 'Admin Action Tester',
      email: `admin_actions_${runId}@prepbridge.local`,
      password: 'Password123',
      role: 'admin',
      status: 'active',
      isVerified: true,
    });

    const owner = await User.create({
      name: 'Post Owner',
      email: `owner_actions_${runId}@prepbridge.local`,
      password: 'Password123',
      role: 'student',
      status: 'active',
      isVerified: true,
    });

    const reporter = await User.create({
      name: 'Reporter User',
      email: `reporter_actions_${runId}@prepbridge.local`,
      password: 'Password123',
      role: 'student',
      status: 'active',
      isVerified: true,
    });

    users.push(admin._id, owner._id, reporter._id);

    const adminToken = jwt.sign({ userId: String(admin._id) }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const ownerToken = jwt.sign({ userId: String(owner._id) }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const reporterToken = jwt.sign({ userId: String(reporter._id) }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const createPost = async (suffix) => {
      const created = await request('/community/posts', ownerToken, {
        method: 'POST',
        body: {
          category: 'dsa',
          title: `Admin Report Action ${suffix} ${runId}`,
          content: `Smoke content ${suffix}`,
        },
      });
      return created.data._id;
    };

    const reportPost = async (postId) => {
      await request(`/community/posts/${postId}/report`, reporterToken, {
        method: 'POST',
        body: { reason: 'spam' },
      });

      const reports = await request('/admin/community/reports', adminToken);
      const report = (reports.data || []).find((item) => item.postId?._id === postId && item.status === 'pending');
      assert(report, `Pending report not found for post ${postId}`);
      return report;
    };

    // 1) Allow Post (Dismiss)
    const allowPostId = await createPost('ALLOW');
    const allowReport = await reportPost(allowPostId);

    await request(`/admin/reports/${allowReport._id}/dismiss`, adminToken, { method: 'PATCH' });

    const afterDismiss = await request(`/community/posts/${allowPostId}`, reporterToken);
    assert(afterDismiss.data?.isReported === false, 'Allow action should clear reported marker for reporter');

    const reReport = await request(`/community/posts/${allowPostId}/report`, reporterToken, {
      method: 'POST',
      body: { reason: 'other' },
    });
    assert(reReport.data?.isReported === true, 'Reporter should be able to report again after allow');
    console.log('PASS: Allow action clears report marker and allows re-report');

    // 2) Hide And Resolve
    const hidePostId = await createPost('HIDE');
    const hideReport = await reportPost(hidePostId);

    await request(`/admin/reports/${hideReport._id}/resolve`, adminToken, {
      method: 'PATCH',
      body: { actionTaken: 'hidden' },
    });

    const hiddenPost = await CommunityPost.findById(hidePostId).select('isHidden reportCount');
    assert(hiddenPost?.isHidden === true, 'Hide+resolve should mark post hidden');
    assert((hiddenPost?.reportCount || 0) === 0, 'Hide+resolve should clear pending report count');
    console.log('PASS: Hide and resolve works');

    // 3) Delete Post
    const deletePostId = await createPost('DELETE');
    const deleteReport = await reportPost(deletePostId);

    await request(`/admin/reports/${deleteReport._id}/resolve`, adminToken, {
      method: 'PATCH',
      body: { actionTaken: 'deleted' },
    });

    const deletedPost = await CommunityPost.findById(deletePostId);
    assert(!deletedPost, 'Delete action should remove the post');
    console.log('PASS: Delete post action works');

    // 4) Admin community reported tab source should include ever-reported posts
    const reportedPosts = await request('/admin/community/posts?page=1&limit=50&onlyReported=true', adminToken);
    const containsAllowPost = (reportedPosts.data || []).some((post) => post._id === allowPostId);
    assert(containsAllowPost, 'Reported tab should include post with report history');
    console.log('PASS: Reported tab endpoint returns historically reported posts');

    console.log('Admin report-tab action smoke test completed successfully');
  } finally {
    if (users.length > 0) {
      const postIds = await CommunityPost.find({ userId: { $in: users } }).distinct('_id');
      await Promise.all([
        PostReport.deleteMany({ $or: [{ reporterId: { $in: users } }, { postId: { $in: postIds } }] }),
        PostComment.deleteMany({ postId: { $in: postIds } }),
        PostUpvote.deleteMany({ postId: { $in: postIds } }),
        PostBookmark.deleteMany({ postId: { $in: postIds } }),
        CommunityPost.deleteMany({ _id: { $in: postIds } }),
        User.deleteMany({ _id: { $in: users } }),
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
    console.error('Admin report action smoke test failed:', error.message);
    process.exit(1);
  });
