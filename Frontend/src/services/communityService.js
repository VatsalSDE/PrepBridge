import { apiRequest } from '@/services/api';

const communityService = {
  getPosts(page = 1, limit = 10, category = 'all', sortBy = 'recent') {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      sortBy,
    });

    if (category && category !== 'all') {
      params.set('category', category);
    }

    return apiRequest(`/community/posts?${params.toString()}`, {
      auth: true,
      authType: 'user',
    });
  },

  getPost(postId) {
    return apiRequest(`/community/posts/${postId}`, {
      auth: true,
      authType: 'user',
    });
  },

  createPost(payload) {
    return apiRequest('/community/posts', {
      method: 'POST',
      auth: true,
      authType: 'user',
      body: payload,
    });
  },

  updatePost(postId, payload) {
    return apiRequest(`/community/posts/${postId}`, {
      method: 'PUT',
      auth: true,
      authType: 'user',
      body: payload,
    });
  },

  deletePost(postId) {
    return apiRequest(`/community/posts/${postId}`, {
      method: 'DELETE',
      auth: true,
      authType: 'user',
    });
  },

  toggleUpvote(postId) {
    return apiRequest(`/community/posts/${postId}/upvote`, {
      method: 'POST',
      auth: true,
      authType: 'user',
    });
  },

  toggleBookmark(postId) {
    return apiRequest(`/community/posts/${postId}/bookmark`, {
      method: 'POST',
      auth: true,
      authType: 'user',
    });
  },

  addComment(postId, content) {
    return apiRequest(`/community/posts/${postId}/comments`, {
      method: 'POST',
      auth: true,
      authType: 'user',
      body: { content },
    });
  },

  deleteComment(commentId) {
    return apiRequest(`/community/comments/${commentId}`, {
      method: 'DELETE',
      auth: true,
      authType: 'user',
    });
  },

  reportPost(postId, reason = '') {
    return apiRequest(`/community/posts/${postId}/report`, {
      method: 'POST',
      auth: true,
      authType: 'user',
      body: { reason },
    });
  },

  getMyPosts(page = 1, limit = 20) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    return apiRequest(`/community/my-posts?${params.toString()}`, {
      auth: true,
      authType: 'user',
    });
  },

  getBookmarks(page = 1, limit = 20) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    return apiRequest(`/community/bookmarks?${params.toString()}`, {
      auth: true,
      authType: 'user',
    });
  },
};

export default communityService;