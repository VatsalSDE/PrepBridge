// src/sockets/community.socket.js
// Socket.IO handlers for real-time community events

module.exports = (io) => {
  // Emit new post to all connected users
  const emitNewPost = (post) => {
    io.to('community').emit('post:created', {
      success: true,
      data: post
    });
  };

  // Emit post update to all connected users
  const emitPostUpdate = (post) => {
    io.to('community').emit('post:updated', {
      success: true,
      data: post
    });
  };

  // Emit post deletion to all connected users
  const emitPostDelete = (postId) => {
    io.to('community').emit('post:deleted', {
      success: true,
      data: { postId }
    });
  };

  // Emit upvote toggle to all connected users
  const emitUpvoteToggle = (payload) => {
    io.to('community').emit('post:upvoted', {
      success: true,
      data: payload
    });
  };

  // Emit new comment to all connected users
  const emitNewComment = (postId, comment) => {
    io.to('community').emit('comment:added', {
      success: true,
      data: {
        postId,
        comment
      }
    });
  };

  // Emit comment deletion to all connected users
  const emitCommentDelete = (postId, commentId) => {
    io.to('community').emit('comment:deleted', {
      success: true,
      data: {
        postId,
        commentId
      }
    });
  };

  // Emit bookmark toggle to all connected users
  const emitBookmarkToggle = (payload) => {
    io.to('community').emit('post:bookmarked', {
      success: true,
      data: payload
    });
  };

  return {
    emitNewPost,
    emitPostUpdate,
    emitPostDelete,
    emitUpvoteToggle,
    emitNewComment,
    emitCommentDelete,
    emitBookmarkToggle
  };
};
