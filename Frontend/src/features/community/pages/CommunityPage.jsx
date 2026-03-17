import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  MessageSquare,
  ThumbsUp,
  Bookmark,
  Flag,
  Send,
  Filter,
  Plus,
  Search,
  Clock,
  Shield,
  X,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { containerVariants, itemVariants } from '@/utils/animations';
import { useCommunityStore } from '@/store/communityStore';
import useAuthStore from '@/store/authStore';

const CATEGORIES = [
  { id: 'all', label: 'All Topics' },
  { id: 'dsa', label: 'DSA' },
  { id: 'core-cs', label: 'Core CS' },
  { id: 'development', label: 'Development' },
  { id: 'aptitude', label: 'Aptitude' },
  { id: 'interview', label: 'Interview Experiences' },
  { id: 'motivation', label: 'Motivation' },
  { id: 'career', label: 'Career Guidance' },
  { id: 'other', label: 'Other' },
];

function getTimeAgo(timestamp) {
  const now = Date.now();
  const postedAt = new Date(timestamp).getTime();
  const diff = now - postedAt;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function categoryLabel(category) {
  return CATEGORIES.find((item) => item.id === category)?.label || category || 'Other';
}

function PostCard({
  post,
  onOpenComments,
  onUpvote,
  onBookmark,
  onDelete,
  onEdit,
  onReport,
  onAddComment,
  onDeleteComment,
}) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ title: post.title, content: post.content });

  useEffect(() => {
    setEditData({ title: post.title, content: post.content });
  }, [post.title, post.content]);

  const toggleComments = async () => {
    const next = !showComments;
    setShowComments(next);
    if (next) {
      await onOpenComments(post._id);
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;
    await onAddComment(post._id, newComment.trim());
    setNewComment('');
  };

  const handleSave = async () => {
    if (!editData.title.trim() || !editData.content.trim()) return;
    await onEdit(post._id, {
      title: editData.title.trim(),
      content: editData.content.trim(),
    });
    setIsEditing(false);
  };

  return (
    <motion.div variants={itemVariants}>
      <Card className="glass-card hover:shadow-lg transition-shadow">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 shrink-0">
                <AvatarFallback className="text-lg">{post.authorName?.charAt(0) || 'A'}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{post.authorName || 'Anonymous'}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3 shrink-0" />
                  {getTimeAgo(post.createdAt)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-13 sm:ml-0">
              <Badge variant="secondary">{categoryLabel(post.category)}</Badge>
              {post.isOwner && !isEditing ? (
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              ) : null}
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-3 mb-4">
              <Input
                value={editData.title}
                onChange={(event) => setEditData((current) => ({ ...current, title: event.target.value }))}
                placeholder="Post title"
              />
              <Textarea
                value={editData.content}
                onChange={(event) => setEditData((current) => ({ ...current, content: event.target.value }))}
                placeholder="Post content"
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button onClick={handleSave}>Save</Button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
            </>
          )}

          {!isEditing ? (
            <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2 sm:gap-4">
                <Button variant="ghost" size="sm" onClick={() => onUpvote(post._id)} className="gap-1.5">
                  <ThumbsUp className={`w-4 h-4 ${post.isUpvoted ? 'fill-primary text-primary' : ''}`} />
                  <span>{post.upvoteCount || 0}</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={toggleComments} className="gap-1.5">
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden xs:inline">{post.commentCount || post.comments?.length || 0} comments</span>
                  <span className="xs:hidden">{post.commentCount || post.comments?.length || 0}</span>
                </Button>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => onBookmark(post._id)} title="Bookmark">
                  <Bookmark className={`w-4 h-4 ${post.isBookmarked ? 'fill-primary text-primary' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onReport(post._id)}
                  title={post.isReported ? 'Remove report' : 'Report'}
                >
                  <Flag className={`w-4 h-4 ${post.isReported ? 'fill-destructive text-destructive' : ''}`} />
                </Button>
                {post.isOwner ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(post._id)}
                    title="Delete"
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}

          <AnimatePresence>
            {showComments && !isEditing ? (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 pt-4 border-t border-border/50"
              >
                <div className="space-y-3 mb-4">
                  {(post.comments || []).map((comment) => (
                    <div key={comment._id} className="flex gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>{comment.authorName?.charAt(0) || 'A'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 bg-muted/30 rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-xs font-medium mb-1">{comment.authorName || 'Anonymous'}</p>
                            <p className="text-sm text-muted-foreground">{comment.content}</p>
                          </div>
                          {comment.isOwner ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive hover:text-destructive"
                              onClick={() => onDeleteComment(post._id, comment._id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Write a comment..."
                    className="flex-1"
                    value={newComment}
                    onChange={(event) => setNewComment(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        handleComment();
                      }
                    }}
                  />
                  <Button size="icon" onClick={handleComment}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function CreatePostDialog({ onCreate, isMutating }) {
  const [category, setCategory] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '' });

  const handleCreate = async () => {
    if (!category || !formData.title.trim() || !formData.content.trim()) return;

    await onCreate({
      category,
      title: formData.title.trim(),
      content: formData.content.trim(),
    });

    setIsOpen(false);
    setCategory('');
    setFormData({ title: '', content: '' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> New Post
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Anonymous Post</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.filter((item) => item.id !== 'all').map((item) => (
                <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Post title..."
            value={formData.title}
            onChange={(event) => setFormData((current) => ({ ...current, title: event.target.value }))}
          />
          <Textarea
            placeholder="Share your question, experience, or thoughts..."
            className="min-h-[120px]"
            value={formData.content}
            onChange={(event) => setFormData((current) => ({ ...current, content: event.target.value }))}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={isMutating}>Post Anonymously</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function CommunityPage() {
  const { user, token } = useAuthStore();
  const {
    posts,
    bookmarkedPosts,
    isLoading,
    isMutating,
    error,
    fetchPosts,
    fetchBookmarks,
    fetchPost,
    createPost,
    updatePost,
    deletePost,
    toggleUpvote,
    toggleBookmark,
    addComment,
    deleteComment,
    reportPost,
    connectSocket,
    disconnectSocket,
  } = useCommunityStore();

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('all');

  useEffect(() => {
    fetchPosts(1, 'all', 'recent').catch(() => null);
    fetchBookmarks().catch(() => null);
  }, [fetchPosts, fetchBookmarks]);

  useEffect(() => {
    const userId = user?._id || user?.id;
    if (!token || !userId) {
      return undefined;
    }

    connectSocket({ token, userId });
    return () => disconnectSocket();
  }, [connectSocket, disconnectSocket, token, user]);

  const sourcePosts = sortBy === 'saved' ? bookmarkedPosts : posts;

  const visiblePosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = sourcePosts.filter((post) => {
      const categoryOk = activeCategory === 'all' || post.category === activeCategory;
      const searchOk =
        !query ||
        post.title?.toLowerCase().includes(query) ||
        post.content?.toLowerCase().includes(query) ||
        post.authorName?.toLowerCase().includes(query);
      return categoryOk && searchOk;
    });

    return [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [sourcePosts, activeCategory, searchQuery]);

  const handleCategoryChange = async (categoryId) => {
    setActiveCategory(categoryId);
    if (sortBy !== 'saved') {
      await fetchPosts(1, categoryId, 'recent');
    }
  };

  const handleSortChange = async (nextSort) => {
    setSortBy(nextSort);

    if (nextSort === 'saved') {
      await fetchBookmarks();
    } else {
      await fetchPosts(1, activeCategory, 'recent');
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <Users className="w-7 h-7 md:w-8 md:h-8 text-primary shrink-0" />
            Anonymous Community
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Ask doubts, share experiences, help others - all anonymously
          </p>
        </div>
        <CreatePostDialog onCreate={createPost} isMutating={isMutating} />
      </div>

      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-primary/10 shrink-0">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm font-medium">
                  <Badge variant="secondary" className="text-xs w-fit">
                    <Shield className="w-3 h-3 mr-1" />
                    Moderated by Admin
                  </Badge>
                  <span className="text-xs sm:text-sm">All posts are reviewed to ensure a safe and helpful community</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="bg-muted/30 border-border/50">
          <CardContent className="p-4">
            <p className="text-sm">
              <span className="font-medium">Community Guidelines:</span>{' '}
              <span className="text-muted-foreground">Be respectful • No spamming • Help genuinely • No sharing exam answers</span>
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {error ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      ) : null}

      <div className="grid lg:grid-cols-4 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-1 space-y-4">
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Filter className="w-4 h-4" /> Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategoryChange(category.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeCategory === category.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/50'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <div className="lg:col-span-3 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              className="pl-10"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button variant={sortBy === 'all' ? 'default' : 'ghost'} size="sm" className="gap-1" onClick={() => handleSortChange('all')}>
              All Posts
            </Button>
            <Button
              variant={sortBy === 'recent' ? 'default' : 'ghost'}
              size="sm"
              className="gap-1"
              onClick={() => handleSortChange('recent')}
            >
              <Clock className="w-4 h-4" /> Recent
            </Button>
            <Button
              variant={sortBy === 'saved' ? 'default' : 'ghost'}
              size="sm"
              className="gap-1"
              onClick={() => handleSortChange('saved')}
            >
              <Bookmark className="w-4 h-4" /> Saved Posts
            </Button>
          </div>

          {isLoading ? (
            <Card className="glass-card">
              <CardContent className="p-8 text-center text-muted-foreground">Loading posts...</CardContent>
            </Card>
          ) : null}

          {!isLoading ? (
            <motion.div variants={containerVariants} className="space-y-4">
              {visiblePosts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onOpenComments={fetchPost}
                  onUpvote={toggleUpvote}
                  onBookmark={toggleBookmark}
                  onDelete={deletePost}
                  onEdit={updatePost}
                  onReport={reportPost}
                  onAddComment={addComment}
                  onDeleteComment={deleteComment}
                />
              ))}
            </motion.div>
          ) : null}

          {!isLoading && visiblePosts.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="p-8 text-center">
                <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium">No posts found</h3>
                <p className="text-sm text-muted-foreground">Be the first to start a discussion!</p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}