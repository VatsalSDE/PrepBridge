require('dotenv').config();

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { io } = require('socket.io-client');

const User = require('../src/models/User');
const CommunityPost = require('../src/models/CommunityPost');
const PostComment = require('../src/models/PostComment');
const PostUpvote = require('../src/models/PostUpvote');
const PostBookmark = require('../src/models/PostBookmark');

const API_BASE = `http://localhost:${process.env.PORT || 5000}/api`;
const SOCKET_BASE = `http://localhost:${process.env.PORT || 5000}`;

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

  const text = await response.text();
  let data;

  try {
    data = text ? JSON.parse(text) : {};
  } catch (error) {
    throw new Error(`Failed to parse ${path} response: ${text}`);
  }

  if (!response.ok || data.success === false) {
    throw new Error(`${options.method || 'GET'} ${path} failed: ${data.message || response.statusText}`);
  }

  return data;
}

function connectSocket(token, userId) {
  return io(SOCKET_BASE, {
    auth: { token, userId: String(userId) },
    transports: ['websocket', 'polling'],
    timeout: 8000,
  });
}

function waitForEvent(socket, eventName, predicate, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      socket.off(eventName, handler);
      reject(new Error(`Timed out waiting for event ${eventName}`));
    }, timeoutMs);

    const handler = (payload) => {
      try {
        if (!predicate || predicate(payload)) {
          clearTimeout(timeout);
          socket.off(eventName, handler);
          resolve(payload);
        }
      } catch (error) {
        clearTimeout(timeout);
        socket.off(eventName, handler);
        reject(error);
      }
    };

    socket.on(eventName, handler);
  });
}

async function waitForConnect(socket, label) {
  if (socket.connected) {
    return;
  }

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`${label} socket connection timeout`)), 10000);

    const onConnect = () => {
      clearTimeout(timeout);
      socket.off('connect_error', onError);
      resolve();
    };

    const onError = (error) => {
      clearTimeout(timeout);
      socket.off('connect', onConnect);
      reject(new Error(`${label} socket error: ${error.message}`));
    };

    socket.once('connect', onConnect);
    socket.once('connect_error', onError);
  });
}

async function main() {
  const runId = Date.now();
  const userAEmail = `rt_a_${runId}@prepbridge.local`;
  const userBEmail = `rt_b_${runId}@prepbridge.local`;
  const createdUserIds = [];
  let socketA;
  let socketB;

  try {
    assert(process.env.MONGO_URI, 'MONGO_URI is missing');
    assert(process.env.JWT_SECRET, 'JWT_SECRET is missing');

    await mongoose.connect(process.env.MONGO_URI);

    const userA = await User.create({
      name: 'Realtime User A',
      email: userAEmail,
      password: 'Password123',
      role: 'student',
      status: 'active',
      isVerified: true,
    });

    const userB = await User.create({
      name: 'Realtime User B',
      email: userBEmail,
      password: 'Password123',
      role: 'student',
      status: 'active',
      isVerified: true,
    });

    createdUserIds.push(userA._id, userB._id);

    const tokenA = jwt.sign({ userId: String(userA._id) }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const tokenB = jwt.sign({ userId: String(userB._id) }, process.env.JWT_SECRET, { expiresIn: '1h' });

    socketA = connectSocket(tokenA, userA._id);
    socketB = connectSocket(tokenB, userB._id);

    await Promise.all([
      waitForConnect(socketA, 'User A'),
      waitForConnect(socketB, 'User B'),
    ]);

    console.log('Sockets connected for both users');

    const postCreatedOnB = waitForEvent(
      socketB,
      'post:created',
      (payload) => payload?.success && payload?.data?.title === `Realtime Post ${runId}`
    );

    const createRes = await request('/community/posts', tokenA, {
      method: 'POST',
      body: {
        category: 'dsa',
        title: `Realtime Post ${runId}`,
        content: 'Realtime integration smoke content',
        tags: ['realtime', 'smoke'],
      },
    });

    const postId = createRes.data?._id;
    assert(postId, 'Post creation did not return post id');

    await postCreatedOnB;
    console.log('PASS: post:created delivered to other user');

    const upvotedOnA = waitForEvent(
      socketA,
      'post:upvoted',
      (payload) => payload?.success && payload?.data?.postId === postId
    );

    const upvoteRes = await request(`/community/posts/${postId}/upvote`, tokenB, {
      method: 'POST',
    });

    assert(upvoteRes.data?.isUpvoted === true, 'Upvote response isUpvoted should be true');
    await upvotedOnA;
    console.log('PASS: post:upvoted delivered cross-user');

    const bookmarkedOnA = waitForEvent(
      socketA,
      'post:bookmarked',
      (payload) => payload?.success && payload?.data?.postId === postId
    );

    const bookmarkRes = await request(`/community/posts/${postId}/bookmark`, tokenB, {
      method: 'POST',
    });

    assert(bookmarkRes.data?.isBookmarked === true, 'Bookmark response isBookmarked should be true');
    await bookmarkedOnA;
    console.log('PASS: post:bookmarked delivered cross-user');

    const commentAddedOnA = waitForEvent(
      socketA,
      'comment:added',
      (payload) => payload?.success && payload?.data?.postId === postId
    );

    const commentRes = await request(`/community/posts/${postId}/comments`, tokenB, {
      method: 'POST',
      body: { content: 'Realtime comment test' },
    });

    const commentId = commentRes.data?._id;
    assert(commentId, 'Comment creation did not return comment id');
    await commentAddedOnA;
    console.log('PASS: comment:added delivered cross-user');

    const commentDeletedOnA = waitForEvent(
      socketA,
      'comment:deleted',
      (payload) => payload?.success && payload?.data?.postId === postId && payload?.data?.commentId === commentId
    );

    await request(`/community/comments/${commentId}`, tokenB, { method: 'DELETE' });
    await commentDeletedOnA;
    console.log('PASS: comment:deleted delivered cross-user');

    const postDeletedOnB = waitForEvent(
      socketB,
      'post:deleted',
      (payload) => payload?.success && payload?.data?.postId === postId
    );

    await request(`/community/posts/${postId}`, tokenA, { method: 'DELETE' });
    await postDeletedOnB;
    console.log('PASS: post:deleted delivered cross-user');

    const bookmarksAfterDelete = await request('/community/bookmarks?page=1&limit=20', tokenB);
    const hasDeletedPost = (bookmarksAfterDelete.data || []).some((post) => String(post._id) === String(postId));
    assert(!hasDeletedPost, 'Deleted post still appears in bookmarks');
    console.log('PASS: deleted post removed from bookmark list');

    console.log('\nRealtime smoke test completed successfully');
  } finally {
    if (socketA) {
      socketA.disconnect();
    }

    if (socketB) {
      socketB.disconnect();
    }

    if (createdUserIds.length > 0) {
      await Promise.all([
        CommunityPost.deleteMany({ userId: { $in: createdUserIds } }),
        PostComment.deleteMany({ userId: { $in: createdUserIds } }),
        PostUpvote.deleteMany({ userId: { $in: createdUserIds } }),
        PostBookmark.deleteMany({ userId: { $in: createdUserIds } }),
        User.deleteMany({ _id: { $in: createdUserIds } }),
      ]);
    }

    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    await sleep(200);
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Realtime smoke test failed:', error.message);
    process.exit(1);
  });
