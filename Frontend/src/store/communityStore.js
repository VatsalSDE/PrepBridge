import { create } from 'zustand';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import communityService from '@/services/communityService';
import { API_BASE_URL } from '@/services/api';

const SOCKET_URL = API_BASE_URL.replace(/\/api$/, '');

const normalizePost = (post, currentUserId = null) => {
  const hasExplicitOwner = typeof post?.isOwner === 'boolean';
  const hasExplicitUpvoted = typeof post?.isUpvoted === 'boolean';
  const hasExplicitBookmarked = typeof post?.isBookmarked === 'boolean';
  const ownerFromUserId = currentUserId && post?.userId ? String(post.userId) === String(currentUserId) : undefined;

  return {
    ...post,
    comments: Array.isArray(post?.comments) ? post.comments : [],
    tags: Array.isArray(post?.tags) ? post.tags : [],
    upvoteCount: Number(post?.upvoteCount ?? 0),
    commentCount: Number(post?.commentCount ?? 0),
    bookmarkCount: Number(post?.bookmarkCount ?? 0),
    isOwner: hasExplicitOwner ? post.isOwner : ownerFromUserId,
    isUpvoted: hasExplicitUpvoted ? post.isUpvoted : undefined,
    isBookmarked: hasExplicitBookmarked ? post.isBookmarked : undefined,
  };
};

const mergePosts = (existingPost, incomingPost, currentUserId) => {
  const incoming = normalizePost(incomingPost, currentUserId);

  if (!existingPost) {
    return {
      ...incoming,
      isOwner: incoming.isOwner ?? false,
      isUpvoted: incoming.isUpvoted ?? false,
      isBookmarked: incoming.isBookmarked ?? false,
    };
  }

  return {
    ...existingPost,
    ...incoming,
    comments: incomingPost?.comments !== undefined ? incoming.comments : existingPost.comments || [],
    tags: incomingPost?.tags !== undefined ? incoming.tags : existingPost.tags || [],
    isOwner: incoming.isOwner ?? existingPost.isOwner ?? false,
    isUpvoted: incoming.isUpvoted ?? existingPost.isUpvoted ?? false,
    isBookmarked: incoming.isBookmarked ?? existingPost.isBookmarked ?? false,
  };
};

const upsertPostInList = (list, post, currentUserId, shouldInsert = false) => {
  const index = list.findIndex((item) => item._id === post._id);
  if (index === -1) {
    return shouldInsert ? [mergePosts(null, post, currentUserId), ...list] : list;
  }

  return list.map((item) => (item._id === post._id ? mergePosts(item, post, currentUserId) : item));
};

const removePostFromList = (list, postId) => list.filter((post) => post._id !== postId);
const updatePostInList = (list, postId, updater) => list.map((post) => (post._id === postId ? updater(post) : post));

const addCommentToPostSafely = (post, comment) => {
  const currentComments = Array.isArray(post?.comments) ? post.comments : [];
  const nextCommentId = comment?._id ? String(comment._id) : null;
  const alreadyExists = nextCommentId
    ? currentComments.some((item) => String(item?._id) === nextCommentId)
    : false;

  if (alreadyExists) {
    return post;
  }

  return {
    ...post,
    comments: [...currentComments, comment],
    commentCount: Number(post?.commentCount ?? currentComments.length) + 1,
  };
};

const findPostById = (state, postId) =>
  state.posts.find((post) => post._id === postId) ||
  state.myPosts.find((post) => post._id === postId) ||
  state.bookmarkedPosts.find((post) => post._id === postId) ||
  (state.selectedPost?._id === postId ? state.selectedPost : null);

const syncPostAcrossLists = (state, incomingPost, options = {}) => {
  const post = normalizePost(incomingPost, state.currentUserId);
  const existsInFeed = state.posts.some((item) => item._id === post._id);
  const existsInMyPosts = state.myPosts.some((item) => item._id === post._id);
  const existsInBookmarks = state.bookmarkedPosts.some((item) => item._id === post._id);
  const shouldBeInMyPosts = post.isOwner ?? existsInMyPosts;
  const shouldBeInBookmarks = post.isBookmarked ?? existsInBookmarks;

  return {
    posts: upsertPostInList(state.posts, post, state.currentUserId, options.insertInFeed ?? existsInFeed),
    myPosts: shouldBeInMyPosts
      ? upsertPostInList(state.myPosts, post, state.currentUserId, options.insertInMyPosts ?? existsInMyPosts)
      : removePostFromList(state.myPosts, post._id),
    bookmarkedPosts: shouldBeInBookmarks
      ? upsertPostInList(state.bookmarkedPosts, post, state.currentUserId, options.insertInBookmarks ?? existsInBookmarks)
      : removePostFromList(state.bookmarkedPosts, post._id),
  };
};

export const useCommunityStore = create((set, get) => ({
  posts: [],
  myPosts: [],
  bookmarkedPosts: [],
  selectedPost: null,
  currentUserId: null,
  currentPage: 1,
  totalPages: 1,
  activeCategory: 'all',
  sortBy: 'recent',
  isLoading: false,
  isMutating: false,
  error: null,
  socket: null,

  connectSocket: ({ token, userId }) => {
    const existingSocket = get().socket;
    if (existingSocket) {
      set({ currentUserId: userId });
      return existingSocket;
    }

    const socket = io(SOCKET_URL, {
      auth: { token, userId },
      transports: ['websocket', 'polling'],
    });

    socket.on('post:created', (response) => {
      if (!response?.success || !response?.data) return;
      set((state) => syncPostAcrossLists({ ...state, currentUserId: userId }, response.data, { insertInFeed: true }));
    });

    socket.on('post:updated', (response) => {
      if (!response?.success || !response?.data?._id) return;
      set((state) => ({
        ...syncPostAcrossLists({ ...state, currentUserId: userId }, response.data),
        selectedPost: state.selectedPost?._id === response.data._id
          ? mergePosts(state.selectedPost, response.data, userId)
          : state.selectedPost,
      }));
    });

    socket.on('post:deleted', (response) => {
      const postId = response?.data?.postId;
      if (!postId) return;
      set((state) => ({
        posts: removePostFromList(state.posts, postId),
        myPosts: removePostFromList(state.myPosts, postId),
        bookmarkedPosts: removePostFromList(state.bookmarkedPosts, postId),
        selectedPost: state.selectedPost?._id === postId ? null : state.selectedPost,
      }));
    });

    socket.on('post:upvoted', (response) => {
      const payload = response?.data;
      if (!payload?.postId) return;
      set((state) => ({
        posts: updatePostInList(state.posts, payload.postId, (post) => ({ ...post, upvoteCount: payload.upvoteCount, isUpvoted: payload.isUpvoted })),
        myPosts: updatePostInList(state.myPosts, payload.postId, (post) => ({ ...post, upvoteCount: payload.upvoteCount, isUpvoted: payload.isUpvoted })),
        bookmarkedPosts: updatePostInList(state.bookmarkedPosts, payload.postId, (post) => ({ ...post, upvoteCount: payload.upvoteCount, isUpvoted: payload.isUpvoted })),
        selectedPost: state.selectedPost?._id === payload.postId
          ? { ...state.selectedPost, upvoteCount: payload.upvoteCount, isUpvoted: payload.isUpvoted }
          : state.selectedPost,
      }));
    });

    socket.on('post:bookmarked', (response) => {
      const payload = response?.data;
      if (!payload?.postId) return;
      set((state) => {
        const currentPost = findPostById(state, payload.postId);
        if (!currentPost) {
          return state;
        }

        const nextPost = {
          ...currentPost,
          bookmarkCount: payload.bookmarkCount,
          isBookmarked: payload.isBookmarked,
        };

        return {
          ...syncPostAcrossLists(state, nextPost, { insertInBookmarks: payload.isBookmarked }),
          selectedPost: state.selectedPost?._id === payload.postId
            ? { ...state.selectedPost, bookmarkCount: payload.bookmarkCount, isBookmarked: payload.isBookmarked }
            : state.selectedPost,
        };
      });
    });

    socket.on('comment:added', (response) => {
      const payload = response?.data;
      if (!payload?.postId || !payload?.comment) return;
      set((state) => ({
        posts: updatePostInList(state.posts, payload.postId, (post) => addCommentToPostSafely(post, payload.comment)),
        myPosts: updatePostInList(state.myPosts, payload.postId, (post) => addCommentToPostSafely(post, payload.comment)),
        bookmarkedPosts: updatePostInList(state.bookmarkedPosts, payload.postId, (post) => addCommentToPostSafely(post, payload.comment)),
        selectedPost: state.selectedPost?._id === payload.postId
          ? addCommentToPostSafely(state.selectedPost, payload.comment)
          : state.selectedPost,
      }));
    });

    socket.on('comment:deleted', (response) => {
      const payload = response?.data;
      if (!payload?.postId || !payload?.commentId) return;
      set((state) => ({
        posts: updatePostInList(state.posts, payload.postId, (post) => ({
          ...post,
          comments: (post.comments || []).filter((comment) => comment._id !== payload.commentId),
          commentCount: Math.max(0, (post.commentCount || 0) - 1),
        })),
        myPosts: updatePostInList(state.myPosts, payload.postId, (post) => ({
          ...post,
          comments: (post.comments || []).filter((comment) => comment._id !== payload.commentId),
          commentCount: Math.max(0, (post.commentCount || 0) - 1),
        })),
        bookmarkedPosts: updatePostInList(state.bookmarkedPosts, payload.postId, (post) => ({
          ...post,
          comments: (post.comments || []).filter((comment) => comment._id !== payload.commentId),
          commentCount: Math.max(0, (post.commentCount || 0) - 1),
        })),
        selectedPost: state.selectedPost?._id === payload.postId
          ? {
              ...state.selectedPost,
              comments: (state.selectedPost.comments || []).filter((comment) => comment._id !== payload.commentId),
              commentCount: Math.max(0, (state.selectedPost.commentCount || 0) - 1),
            }
          : state.selectedPost,
      }));
    });

    set({ socket, currentUserId: userId });
    return socket;
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
    }
    set({ socket: null, currentUserId: null });
  },

  fetchPosts: async (page = 1, category = 'all', sortBy = 'recent') => {
    set({ isLoading: true, error: null });
    try {
      const response = await communityService.getPosts(page, 10, category, sortBy === 'popular' ? 'popular' : 'recent');
      const currentUserId = get().currentUserId;

      set({
        posts: (response?.data || []).map((post) => mergePosts(null, post, currentUserId)),
        currentPage: response?.pagination?.page || page,
        totalPages: response?.pagination?.pages || 1,
        activeCategory: category,
        sortBy,
        isLoading: false,
      });

      return response?.data || [];
    } catch (error) {
      set({ isLoading: false, error: error.message || 'Failed to fetch posts' });
      throw error;
    }
  },

  fetchMyPosts: async () => {
    try {
      const currentUserId = get().currentUserId;
      const response = await communityService.getMyPosts();
      set({ myPosts: (response?.data || []).map((post) => mergePosts(null, post, currentUserId)) });
      return response?.data || [];
    } catch (error) {
      set({ error: error.message || 'Failed to fetch your posts' });
      throw error;
    }
  },

  fetchBookmarks: async () => {
    try {
      const currentUserId = get().currentUserId;
      const response = await communityService.getBookmarks();
      set({ bookmarkedPosts: (response?.data || []).map((post) => mergePosts(null, post, currentUserId)) });
      return response?.data || [];
    } catch (error) {
      set({ error: error.message || 'Failed to fetch bookmarks' });
      throw error;
    }
  },

  fetchPost: async (postId) => {
    try {
      const response = await communityService.getPost(postId);
      const currentUserId = get().currentUserId;
      const post = mergePosts(findPostById(get(), postId), response?.data || {}, currentUserId);

      set((state) => ({
        ...syncPostAcrossLists(state, post),
        selectedPost: post,
      }));

      return post;
    } catch (error) {
      set({ error: error.message || 'Failed to fetch post details' });
      throw error;
    }
  },

  createPost: async (payload) => {
    set({ isMutating: true, error: null });
    try {
      const currentUserId = get().currentUserId;
      const response = await communityService.createPost(payload);
      if (response?.data) {
        const post = mergePosts(null, response.data, currentUserId);
        set((state) => ({
          ...syncPostAcrossLists(state, post, { insertInFeed: true, insertInMyPosts: true }),
          isMutating: false,
        }));
      } else {
        set({ isMutating: false });
      }
      toast.success('Post created');
      return response?.data;
    } catch (error) {
      set({ isMutating: false, error: error.message || 'Failed to create post' });
      toast.error(error.message || 'Failed to create post');
      throw error;
    }
  },

  updatePost: async (postId, payload) => {
    try {
      const currentUserId = get().currentUserId;
      const response = await communityService.updatePost(postId, payload);
      if (response?.data) {
        const post = mergePosts(findPostById(get(), postId), response.data, currentUserId);
        set((state) => ({
          ...syncPostAcrossLists(state, post),
          selectedPost: state.selectedPost?._id === postId ? post : state.selectedPost,
        }));
      }
      toast.success('Post updated');
      return response?.data;
    } catch (error) {
      toast.error(error.message || 'Failed to update post');
      throw error;
    }
  },

  deletePost: async (postId) => {
    try {
      await communityService.deletePost(postId);
      set((state) => ({
        posts: removePostFromList(state.posts, postId),
        myPosts: removePostFromList(state.myPosts, postId),
        bookmarkedPosts: removePostFromList(state.bookmarkedPosts, postId),
        selectedPost: state.selectedPost?._id === postId ? null : state.selectedPost,
      }));
      toast.success('Post deleted');
    } catch (error) {
      toast.error(error.message || 'Failed to delete post');
      throw error;
    }
  },

  toggleUpvote: async (postId) => {
    const response = await communityService.toggleUpvote(postId);
    const payload = response?.data;
    if (payload?.postId) {
      set((state) => ({
        posts: updatePostInList(state.posts, payload.postId, (post) => ({ ...post, upvoteCount: payload.upvoteCount, isUpvoted: payload.isUpvoted })),
        myPosts: updatePostInList(state.myPosts, payload.postId, (post) => ({ ...post, upvoteCount: payload.upvoteCount, isUpvoted: payload.isUpvoted })),
        bookmarkedPosts: updatePostInList(state.bookmarkedPosts, payload.postId, (post) => ({ ...post, upvoteCount: payload.upvoteCount, isUpvoted: payload.isUpvoted })),
        selectedPost: state.selectedPost?._id === payload.postId
          ? { ...state.selectedPost, upvoteCount: payload.upvoteCount, isUpvoted: payload.isUpvoted }
          : state.selectedPost,
      }));
    }
    return payload;
  },

  toggleBookmark: async (postId) => {
    const response = await communityService.toggleBookmark(postId);
    const payload = response?.data;
    if (payload?.postId) {
      set((state) => {
        const currentPost = findPostById(state, payload.postId);
        if (!currentPost) {
          return state;
        }

        const nextPost = {
          ...currentPost,
          bookmarkCount: payload.bookmarkCount,
          isBookmarked: payload.isBookmarked,
        };

        return {
          ...syncPostAcrossLists(state, nextPost, { insertInBookmarks: payload.isBookmarked }),
          selectedPost: state.selectedPost?._id === payload.postId
            ? { ...state.selectedPost, bookmarkCount: payload.bookmarkCount, isBookmarked: payload.isBookmarked }
            : state.selectedPost,
        };
      });
    }
    return payload;
  },

  addComment: async (postId, content) => {
    const response = await communityService.addComment(postId, content);
    const comment = response?.data;
    if (comment) {
      set((state) => ({
        posts: updatePostInList(state.posts, postId, (post) => addCommentToPostSafely(post, comment)),
        myPosts: updatePostInList(state.myPosts, postId, (post) => addCommentToPostSafely(post, comment)),
        bookmarkedPosts: updatePostInList(state.bookmarkedPosts, postId, (post) => addCommentToPostSafely(post, comment)),
        selectedPost: state.selectedPost?._id === postId
          ? addCommentToPostSafely(state.selectedPost, comment)
          : state.selectedPost,
      }));
    }
    toast.success('Comment added');
    return comment;
  },

  deleteComment: async (postId, commentId) => {
    await communityService.deleteComment(commentId);
    set((state) => ({
      posts: updatePostInList(state.posts, postId, (post) => ({
        ...post,
        comments: (post.comments || []).filter((comment) => comment._id !== commentId),
        commentCount: Math.max(0, (post.commentCount || 0) - 1),
      })),
      myPosts: updatePostInList(state.myPosts, postId, (post) => ({
        ...post,
        comments: (post.comments || []).filter((comment) => comment._id !== commentId),
        commentCount: Math.max(0, (post.commentCount || 0) - 1),
      })),
      bookmarkedPosts: updatePostInList(state.bookmarkedPosts, postId, (post) => ({
        ...post,
        comments: (post.comments || []).filter((comment) => comment._id !== commentId),
        commentCount: Math.max(0, (post.commentCount || 0) - 1),
      })),
      selectedPost: state.selectedPost?._id === postId
        ? {
            ...state.selectedPost,
            comments: (state.selectedPost.comments || []).filter((comment) => comment._id !== commentId),
            commentCount: Math.max(0, (state.selectedPost.commentCount || 0) - 1),
          }
        : state.selectedPost,
    }));
    toast.success('Comment deleted');
  },

  reportPost: async (postId, reason = '') => {
    try {
      const response = await communityService.reportPost(postId, reason);
      const payload = response?.data;

      if (payload?.postId) {
        set((state) => ({
          posts: updatePostInList(state.posts, payload.postId, (post) => ({
            ...post,
            isReported: payload.isReported,
            reportCount: payload.reportCount,
          })),
          myPosts: updatePostInList(state.myPosts, payload.postId, (post) => ({
            ...post,
            isReported: payload.isReported,
            reportCount: payload.reportCount,
          })),
          bookmarkedPosts: updatePostInList(state.bookmarkedPosts, payload.postId, (post) => ({
            ...post,
            isReported: payload.isReported,
            reportCount: payload.reportCount,
          })),
          selectedPost: state.selectedPost?._id === payload.postId
            ? {
                ...state.selectedPost,
                isReported: payload.isReported,
                reportCount: payload.reportCount,
              }
            : state.selectedPost,
        }));
      }

      toast.success(response?.message || (payload?.isReported ? 'Post reported' : 'Post report removed'));
      return payload;
    } catch (error) {
      toast.error(error.message || 'Failed to update report status');
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));