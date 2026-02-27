const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  getPosts,
  createPost,
  getPost,
  updatePost,
  deletePost,
  toggleUpvote,
  toggleBookmark,
  addComment,
  deleteComment,
  reportPost,
  getMyPosts,
  getBookmarks
} = require('../controllers/community.controller');

router.use(protect);

router.route('/posts')
  .get(getPosts)
  .post(createPost);

router.get('/my-posts', getMyPosts);
router.get('/bookmarks', getBookmarks);

router.route('/posts/:id')
  .get(getPost)
  .put(updatePost)
  .delete(deletePost);

router.post('/posts/:id/upvote', toggleUpvote);
router.post('/posts/:id/bookmark', toggleBookmark);
router.post('/posts/:id/comments', addComment);
router.post('/posts/:id/report', reportPost);

router.delete('/comments/:id', deleteComment);

module.exports = router;
