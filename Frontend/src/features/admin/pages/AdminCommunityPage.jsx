import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Flag, Search, Eye, Trash2, Clock3, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { containerVariants, itemVariants } from '@/utils/animations';
import { toast } from 'sonner';
import useAdminStore from '@/store/adminStore';

const EMOJI_BY_ANIMAL = {
  Panda: '🐼',
  Tiger: '🐯',
  Eagle: '🦅',
  Dolphin: '🐬',
  Wolf: '🐺',
  Fox: '🦊',
  Bear: '🐻',
  Lion: '🦁',
  Owl: '🦉',
  Hawk: '🦅',
  Shark: '🦈',
  Phoenix: '🐦',
  Dragon: '🐉',
  Falcon: '🦅',
  Panther: '🐆',
};

const animalFromName = (name = '') => {
  const match = name.match(/Anonymous\s+([A-Za-z]+)\s+#\d+/);
  return match?.[1] || 'Panda';
};

const avatarFromName = (name) => EMOJI_BY_ANIMAL[animalFromName(name)] || '🐼';

const relativeTime = (value) => {
  const date = new Date(value);
  const now = new Date();
  const diff = Math.max(0, now.getTime() - date.getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
};

const categoryLabel = (category = 'other') => {
  const value = String(category);
  if (value === 'core-cs') return 'Core CS';
  if (value === 'dsa') return 'DSA';
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const PostCard = ({ post, onView, onDelete }) => (
  <motion.div variants={itemVariants}>
    <Card className={`glass-card ${post.pendingReports > 0 ? 'border-destructive/30' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="text-lg">{avatarFromName(post.authorName)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm text-muted-foreground">{post.authorName || 'Anonymous User'}</p>
                <h3 className="font-semibold text-xl leading-tight">{post.title}</h3>
              </div>
              {post.pendingReports > 0 ? (
                <Badge variant="destructive" className="gap-1">
                  <Flag className="w-3 h-3" />
                  {post.pendingReports}
                </Badge>
              ) : null}
            </div>

            <p className="text-muted-foreground mt-1 line-clamp-2">{post.content}</p>

            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><ThumbsUp className="w-4 h-4" />{post.upvoteCount || 0}</span>
              <span>{post.commentCount || 0}</span>
              <span className="flex items-center gap-1"><Clock3 className="w-4 h-4" />{relativeTime(post.createdAt)}</span>
              <Badge variant="outline">{categoryLabel(post.category)}</Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-border/50">
          <Button variant="ghost" size="sm" onClick={() => onView(post)}>
            <Eye className="w-4 h-4 mr-2" />View
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onDelete(post)}>
            <Trash2 className="w-4 h-4 mr-2" />Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default function AdminCommunityPage() {
  const fetchCommunityPosts = useAdminStore((state) => state.fetchCommunityPosts);
  const deleteCommunityPost = useAdminStore((state) => state.deleteCommunityPost);
  const communityPosts = useAdminStore((state) => state.communityPosts);
  const isLoading = useAdminStore((state) => state.isLoading);

  const [searchInput, setSearchInput] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCommunityPosts({
        page: 1,
        limit: 50,
        search: searchInput,
        onlyReported: activeTab === 'reported',
      }).catch((error) => {
        toast.error(error.message || 'Failed to load community posts');
      });
    }, 250);

    return () => clearTimeout(timer);
  }, [activeTab, searchInput, fetchCommunityPosts]);

  const allPosts = useMemo(() => communityPosts, [communityPosts]);
  const reportedPosts = useMemo(() => allPosts.filter((post) => Number(post.totalReports || post.reportCount || 0) > 0), [allPosts]);
  const flaggedCount = useMemo(() => allPosts.filter((post) => Number(post.pendingReports || 0) > 0).length, [allPosts]);

  const handleDelete = async (post) => {
    try {
      await deleteCommunityPost(post._id);
      toast.success('Post deleted');
    } catch (error) {
      toast.error(error.message || 'Failed to delete post');
    }
  };

  const renderPosts = (posts) => {
    if (isLoading && posts.length === 0) {
      return <p className="text-sm text-muted-foreground">Loading posts...</p>;
    }
    if (!posts.length) {
      return <p className="text-sm text-muted-foreground">No posts found for this view.</p>;
    }
    return posts.map((post) => (
      <PostCard key={post._id} post={post} onView={setSelectedPost} onDelete={handleDelete} />
    ));
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-primary" />
          Community Moderation
        </h1>
        {flaggedCount > 0 ? (
          <Badge variant="destructive" className="gap-1 mt-1">
            <Flag className="w-3 h-3" />
            {flaggedCount} Flagged
          </Badge>
        ) : null}
      </div>

      <p className="text-muted-foreground">Review and moderate community posts</p>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search posts..."
          className="pl-10"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Posts ({allPosts.length})</TabsTrigger>
          <TabsTrigger value="reported" className="gap-2"><Flag className="w-4 h-4" />Reported ({reportedPosts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {renderPosts(allPosts)}
        </TabsContent>

        <TabsContent value="reported" className="space-y-4">
          {renderPosts(reportedPosts)}
        </TabsContent>
      </Tabs>

      <Dialog open={Boolean(selectedPost)} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Post Details</DialogTitle>
          </DialogHeader>
          {selectedPost ? (
            <div className="space-y-3 text-sm">
              <p className="font-semibold text-base">{selectedPost.title}</p>
              <p className="text-muted-foreground">{selectedPost.authorName || 'Anonymous User'}</p>
              <p>{selectedPost.content}</p>
              <div className="flex gap-2">
                <Badge variant="outline">{categoryLabel(selectedPost.category)}</Badge>
                <Badge variant={selectedPost.pendingReports > 0 ? 'destructive' : 'secondary'}>
                  Pending Reports: {selectedPost.pendingReports || 0}
                </Badge>
                <Badge variant="outline">Total Reports: {selectedPost.totalReports || 0}</Badge>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedPost(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
