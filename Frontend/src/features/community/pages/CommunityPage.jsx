import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, MessageSquare, ThumbsUp, Bookmark, Flag, Send, Filter,
  Plus, Search, Clock, TrendingUp, ChevronDown, Shield, X, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { containerVariants, itemVariants } from '@/utils/animations';
import { toast } from 'sonner';
import EmptyState from '@/components/common/EmptyState';

const CATEGORIES = [
  { id: 'all', label: 'All Topics' },
  { id: 'dsa', label: 'DSA' },
  { id: 'core-cs', label: 'Core CS' },
  { id: 'development', label: 'Development' },
  { id: 'aptitude', label: 'Aptitude' },
  { id: 'interview', label: 'Interview Experiences' },
  { id: 'motivation', label: 'Motivation' },
  { id: 'career', label: 'Career Guidance' }
];

const ANIMAL_NAMES = ['Panda', 'Tiger', 'Eagle', 'Wolf', 'Bear', 'Fox', 'Owl', 'Hawk'];

const MOCK_POSTS = [
  {
    id: 1,
    anonymous_id: 'Anonymous Panda #4521',
    avatar: '🐼',
    category: 'dsa',
    title: 'How to approach Dynamic Programming problems?',
    content: "I've been struggling with DP for weeks now. I understand the basic concepts but when it comes to solving problems, I freeze. Any tips on how to build intuition for DP? What patterns should I focus on first?",
    upvotes: 24,
    upvotedBy: [],
    comments: [{id: 1, author: 'Anonymous Fox #3421', avatar: '🦊', text: 'Start with classics like Fibonacci and Climbing Stairs'}],
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    isBookmarked: false,
    isEditable: true
  },
  {
    id: 2,
    anonymous_id: 'Anonymous Tiger #2847',
    avatar: '🐯',
    category: 'interview',
    title: 'TCS Digital Interview Experience - Selected!',
    content: "Just cleared TCS Digital! The process had 3 rounds. First was TCS NQT with aptitude and coding. Then technical interview focused on DSA and DBMS. Finally HR round. Happy to answer questions!",
    upvotes: 56,
    upvotedBy: [],
    comments: [],
    timestamp: Date.now() - 5 * 60 * 60 * 1000,
    isBookmarked: true,
    isEditable: true
  },
  {
    id: 3,
    anonymous_id: 'Anonymous Eagle #1923',
    avatar: '🦅',
    category: 'motivation',
    title: 'Feeling demotivated after multiple rejections',
    content: "I've been preparing for 4 months now but haven't cleared any company yet. Starting to doubt myself. Anyone else going through this? How do you stay motivated?",
    upvotes: 89,
    upvotedBy: [],
    comments: [],
    timestamp: Date.now() - 24 * 60 * 60 * 1000,
    isBookmarked: false,
    isEditable: false
  },
  {
    id: 4,
    anonymous_id: 'Anonymous Wolf #7621',
    avatar: '🐺',
    category: 'core-cs',
    title: 'Best resources for OS and CN?',
    content: "Placements are in 2 months. Need solid resources for Operating Systems and Computer Networks that cover everything asked in interviews. Please suggest YouTube channels or notes.",
    upvotes: 18,
    upvotedBy: [],
    comments: [],
    timestamp: Date.now() - 3 * 60 * 60 * 1000,
    isBookmarked: false,
    isEditable: true
  }
];

function PostCard({ post, onUpvote, onBookmark, onDelete, onEdit, onReport, onAddComment, onDeleteComment, currentUserId }) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ title: post.title, content: post.content });
  
  const hasUpvoted = post.upvotedBy?.includes(currentUserId);

  const handleSaveEdit = () => {
    if (editData.title.trim() && editData.content.trim()) {
      onEdit(post.id, editData);
      setIsEditing(false);
      toast.success('Post updated successfully!');
    } else {
      toast.error('Title and content cannot be empty');
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(post.id, newComment);
      setNewComment('');
      toast.success('Comment added!');
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (hours < 1) return 'just now';
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  };

  return (
    <motion.div variants={itemVariants}>
      <Card className="glass-card hover:shadow-lg transition-shadow">
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="text-lg">{post.avatar}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{post.anonymous_id}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {getTimeAgo(post.timestamp)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{CATEGORIES.find(c => c.id === post.category)?.label}</Badge>
              {post.isEditable && !isEditing && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
              )}
            </div>
          </div>

          {/* Content */}
          {isEditing ? (
            <div className="space-y-3 mb-4">
              <Input 
                value={editData.title}
                onChange={(e) => setEditData({...editData, title: e.target.value})}
                placeholder="Post title"
              />
              <Textarea 
                value={editData.content}
                onChange={(e) => setEditData({...editData, content: e.target.value})}
                placeholder="Post content"
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button onClick={handleSaveEdit}>Save</Button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{post.content}</p>
            </>
          )}

          {/* Actions */}
          {!isEditing && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onUpvote(post.id)}
                  className="gap-2"
                >
                  <ThumbsUp className={`w-4 h-4 ${hasUpvoted ? 'fill-primary text-primary' : ''}`} />
                  <span>{post.upvotes}</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowComments(!showComments)}
                  className="gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{post.comments.length} comments</span>
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => onBookmark(post.id)}
                  title="Bookmark"
                >
                  <Bookmark className={`w-4 h-4 ${post.isBookmarked ? 'fill-primary text-primary' : ''}`} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => {
                    onReport(post.id);
                    toast.success('Post reported. Admin will review it soon.');
                  }}
                  title="Report"
                >
                  <Flag className="w-4 h-4" />
                </Button>
                {post.isEditable && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onDelete(post.id)}
                    title="Delete"
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Comments Section */}
          <AnimatePresence>
            {showComments && !isEditing && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 pt-4 border-t border-border/50"
              >
                <div className="space-y-3 mb-4">
                  {post.comments.map(comment => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>{comment.avatar || '🐛'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 bg-muted/30 rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-xs font-medium mb-1">{comment.author}</p>
                            <p className="text-sm text-muted-foreground">{comment.text}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive hover:text-destructive"
                            onClick={() => onDeleteComment(post.id, comment.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
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
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                  />
                  <Button size="icon" onClick={handleAddComment}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function CreatePostDialog({ onPostCreate }) {
  const [category, setCategory] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '' });

  const handlePost = () => {
    if (!category || !formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    onPostCreate({ category, ...formData });
    toast.success('🎉 Post created! Your anonymous post is live.');
    setIsOpen(false);
    setCategory('');
    setFormData({ title: '', content: '' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> New Post
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Anonymous Post</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <Avatar>
              <AvatarFallback>🐻</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">You'll appear as:</p>
              <p className="text-primary">Anonymous Bear #8294</p>
            </div>
          </div>
          <div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Input 
            placeholder="Post title..." 
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
          <Textarea 
            placeholder="Share your question, experience, or thoughts..." 
            className="min-h-[120px]"
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={handlePost}>Post Anonymously</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function CommunityPage() {
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('all');
  const [currentUserId] = useState('user_' + Math.floor(Math.random() * 10000));

  const handleUpvote = (postId) => {
    setPosts(posts.map(p => {
      if (p.id === postId) {
        const hasLiked = p.upvotedBy?.includes(currentUserId);
        if (hasLiked) {
          // Unlike - remove user from upvotedBy and decrease upvotes
          return {
            ...p,
            upvotes: p.upvotes - 1,
            upvotedBy: p.upvotedBy.filter(id => id !== currentUserId)
          };
        } else {
          // Like - add user to upvotedBy and increase upvotes
          return {
            ...p,
            upvotes: p.upvotes + 1,
            upvotedBy: [...(p.upvotedBy || []), currentUserId]
          };
        }
      }
      return p;
    }));
  };

  const handleBookmark = (postId) => {
    setPosts(posts.map(p => 
      p.id === postId ? { ...p, isBookmarked: !p.isBookmarked } : p
    ));
  };

  const handleDeletePost = (postId) => {
    setPosts(posts.filter(p => p.id !== postId));
    toast.success('Post deleted');
  };

  const handleEditPost = (postId, editData) => {
    setPosts(posts.map(p => 
      p.id === postId ? { ...p, title: editData.title, content: editData.content } : p
    ));
  };

  const handleReportPost = (postId) => {
    // Increment report count or mark as reported
    setPosts(posts.map(p => 
      p.id === postId ? { ...p, isReported: true } : p
    ));
  };

  const handleAddComment = (postId, commentText) => {
    setPosts(posts.map(p => 
      p.id === postId ? {
        ...p,
        comments: [...p.comments, {
          id: Date.now(),
          author: 'Anonymous User #' + Math.floor(Math.random() * 9000 + 1000),
          avatar: ['🐼', '🐯', '🦅', '🐺', '🐻', '🦊', '🦉'][Math.floor(Math.random() * 7)],
          text: commentText
        }]
      } : p
    ));
  };

  const handleDeleteComment = (postId, commentId) => {
    setPosts(posts.map(p =>
      p.id === postId ? {
        ...p,
        comments: p.comments.filter(c => c.id !== commentId)
      } : p
    ));
    toast.success('Comment deleted');
  };

  const handlePostCreate = (newPostData) => {
    const newPost = {
      id: Date.now(),
      anonymous_id: `Anonymous ${ANIMAL_NAMES[Math.floor(Math.random() * ANIMAL_NAMES.length)]} #${Math.floor(Math.random() * 9000 + 1000)}`,
      avatar: ['🐼', '🐯', '🦅', '🐺', '🐻', '🦊', '🦉', '🦅'][Math.floor(Math.random() * 8)],
      category: newPostData.category,
      title: newPostData.title,
      content: newPostData.content,
      upvotes: 0,
      upvotedBy: [],
      comments: [],
      timestamp: Date.now(),
      isBookmarked: false,
      isEditable: true
    };
    setPosts([newPost, ...posts]);
  };

  const filteredPosts = posts.filter(post => {
    const matchesCategory = activeCategory === 'all' || post.category === activeCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSaved = sortBy === 'saved' ? post.isBookmarked : true;
    return matchesCategory && matchesSearch && matchesSaved;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'recent') {
      return b.timestamp - a.timestamp;
    } else {
      // 'all' and 'saved' - show in creation order (most recent first by default)
      return b.timestamp - a.timestamp;
    }
  });

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            Anonymous Community
          </h1>
          <p className="text-muted-foreground mt-1">Ask doubts, share experiences, help others - all anonymously</p>
        </div>
        <CreatePostDialog onPostCreate={handlePostCreate} />
      </div>

      {/* Moderation Notice */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    <Shield className="w-3 h-3 mr-1" />
                    Moderated by Admin
                  </Badge>
                  All posts are reviewed to ensure a safe and helpful community
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Community Guidelines */}
      <motion.div variants={itemVariants}>
        <Card className="bg-muted/30 border-border/50">
          <CardContent className="p-4">
            <p className="text-sm">
              <span className="font-medium">🤝 Community Guidelines:</span>{' '}
              <span className="text-muted-foreground">
                Be respectful • No spamming • Help genuinely • No sharing exam answers
              </span>
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar Filters */}
        <motion.div variants={itemVariants} className="lg:col-span-1 space-y-4">
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Filter className="w-4 h-4" /> Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeCategory === cat.id 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'hover:bg-muted/50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </CardContent>
          </Card>


        </motion.div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search posts..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button 
              variant={sortBy === 'all' ? 'default' : 'ghost'}
              size="sm" 
              className="gap-1"
              onClick={() => setSortBy('all')}
            >
              All Posts
            </Button>
            <Button 
              variant={sortBy === 'recent' ? 'default' : 'ghost'}
              size="sm" 
              className="gap-1"
              onClick={() => setSortBy('recent')}
            >
              <Clock className="w-4 h-4" /> Recent
            </Button>
            <Button 
              variant={sortBy === 'saved' ? 'default' : 'ghost'}
              size="sm" 
              className="gap-1"
              onClick={() => setSortBy('saved')}
            >
              <Bookmark className="w-4 h-4" /> Saved Posts
            </Button>
          </div>

          {/* Posts */}
          <motion.div variants={containerVariants} className="space-y-4">
            {sortedPosts.map(post => (
              <PostCard 
                key={post.id} 
                post={post} 
                onUpvote={handleUpvote}
                onBookmark={handleBookmark}
                onDelete={handleDeletePost}
                onEdit={handleEditPost}
                onReport={handleReportPost}
                onAddComment={handleAddComment}
                onDeleteComment={handleDeleteComment}
                currentUserId={currentUserId}
              />
            ))}
          </motion.div>

          {sortedPosts.length === 0 && (
            <Card className="glass-card">
              <CardContent className="p-8 text-center">
                <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium">No posts found</h3>
                <p className="text-sm text-muted-foreground">Be the first to start a discussion!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
}