import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare, Flag, Trash2, CheckCircle2, XCircle, Eye,
  ThumbsUp, Clock, Search, Filter, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { containerVariants, itemVariants } from '@/utils/animations';
import { toast } from 'sonner';

const MOCK_POSTS = [
  {
    id: 1,
    author: 'Anonymous Panda #4521',
    avatar: '🐼',
    title: 'How to approach Dynamic Programming?',
    content: "I've been struggling with DP for weeks now. I understand the basic concepts but when it comes to solving problems, I freeze.",
    category: 'DSA',
    upvotes: 24,
    comments: 8,
    timestamp: '2 hours ago',
    reports: 0,
    status: 'approved'
  },
  {
    id: 2,
    author: 'Anonymous Tiger #2847',
    avatar: '🐯',
    title: 'TCS Digital Interview Experience - Selected!',
    content: "Just cleared TCS Digital! The process had 3 rounds. First was TCS NQT with aptitude and coding.",
    category: 'Interview',
    upvotes: 56,
    comments: 15,
    timestamp: '5 hours ago',
    reports: 0,
    status: 'approved'
  },
  {
    id: 3,
    author: 'Anonymous Wolf #7621',
    avatar: '🐺',
    title: 'Spam post - ignore this',
    content: "Buy cheap followers! Click here for more...",
    category: 'Other',
    upvotes: 0,
    comments: 2,
    timestamp: '1 hour ago',
    reports: 5,
    status: 'pending'
  },
];

const REPORTED_POSTS = [
  {
    id: 4,
    author: 'Anonymous Fox #1234',
    avatar: '🦊',
    title: 'Offensive content here',
    content: "This post contains inappropriate language that violates community guidelines.",
    category: 'Other',
    upvotes: 2,
    comments: 1,
    timestamp: '30 min ago',
    reports: 8,
    reportReasons: ['Spam', 'Offensive content', 'Harassment'],
    status: 'flagged'
  },
  {
    id: 5,
    author: 'Anonymous Bear #5678',
    avatar: '🐻',
    title: 'Selling interview answers',
    content: "I have all TCS NQT answers. DM me for price...",
    category: 'Other',
    upvotes: 1,
    comments: 3,
    timestamp: '2 hours ago',
    reports: 12,
    reportReasons: ['Cheating', 'Spam', 'Scam'],
    status: 'flagged'
  },
];

function PostCard({ post,  onDelete, onView }) {
  return (
    <motion.div variants={itemVariants}>
      <Card className={`glass-card ${post.reports > 0 ? 'border-destructive/30' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="text-lg">{post.avatar}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">{post.author}</p>
                  <h3 className="font-semibold">{post.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  {post.reports > 0 && (
                    <Badge variant="outline" className="text-destructive border-destructive/30">
                      <Flag className="w-3 h-3 mr-1" />
                      {post.reports}
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{post.content}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3" /> {post.upvotes}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" /> {post.comments}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {post.timestamp}
                </span>
                <Badge variant="outline" className="text-xs">{post.category}</Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-border/50">
            <Button variant="ghost" size="sm" onClick={() => onView(post)}>
              <Eye className="w-4 h-4 mr-2" />
              View
            </Button>
            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onDelete(post)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function AdminCommunityPage() {
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [reportedPosts, setReportedPosts] = useState(REPORTED_POSTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);

  const handleDelete = (post) => {
    setPosts(posts.filter(p => p.id !== post.id));
    setReportedPosts(reportedPosts.filter(p => p.id !== post.id));
    toast.success('Post deleted');
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-primary" />
            Community Moderation
          </h1>
          <p className="text-muted-foreground">Review and moderate community posts</p>
        </div>
        <div className="flex items-center gap-2">
          {reportedPosts.length > 0 && (
            <Badge variant="destructive" className="px-3 py-1">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {reportedPosts.length} Flagged
            </Badge>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">
            All Posts ({posts.length})
          </TabsTrigger>
          <TabsTrigger value="reported" className="gap-2">
            <Flag className="w-4 h-4" />
            Reported ({reportedPosts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onDelete={handleDelete}
              onView={setSelectedPost}
            />
          ))}
        </TabsContent>

        <TabsContent value="reported" className="space-y-4">
          {reportedPosts.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="p-8 text-center">
                <CheckCircle2 className="w-12 h-12 mx-auto text-success mb-4" />
                <h3 className="font-medium">No flagged posts</h3>
                <p className="text-sm text-muted-foreground">All reported content has been reviewed</p>
              </CardContent>
            </Card>
          ) : (
            reportedPosts.map((post) => (
              <Card key={post.id} className="glass-card border-destructive/30">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="text-lg">{post.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{post.author}</p>
                          <h3 className="font-semibold">{post.title}</h3>
                        </div>
                        <Badge variant="destructive">
                          <Flag className="w-3 h-3 mr-1" />
                          {post.reports} reports
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{post.content}</p>
                      
                      {/* Report Reasons */}
                      <div className="mt-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                        <p className="text-xs font-medium text-destructive mb-2">Report Reasons:</p>
                        <div className="flex flex-wrap gap-1">
                          {post.reportReasons.map((reason, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs border-destructive/30 text-destructive">
                              {reason}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-4">
                        <Button size="sm" className="flex-1" variant="destructive" onClick={() => handleDelete(post)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Post
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Post Detail Modal */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Post Details</DialogTitle>
          </DialogHeader>
          {selectedPost && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{selectedPost.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedPost.author}</p>
                  <p className="text-sm text-muted-foreground">{selectedPost.timestamp}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg">{selectedPost.title}</h3>
                <p className="text-muted-foreground mt-2">{selectedPost.content}</p>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>👍 {selectedPost.upvotes} upvotes</span>
                <span>💬 {selectedPost.comments} comments</span>
                <Badge>{selectedPost.category}</Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedPost(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
