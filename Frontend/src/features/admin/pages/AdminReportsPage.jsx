import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Flag, CheckCircle2, Clock3, EyeOff, Eye, XCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { containerVariants, itemVariants } from '@/utils/animations';
import { toast } from 'sonner';
import useAdminStore from '@/store/adminStore';

const StatusBadge = ({ status }) => {
  if (status === 'pending') return <Badge variant="destructive">pending</Badge>;
  if (status === 'resolved') return <Badge variant="default">resolved</Badge>;
  if (status === 'dismissed') return <Badge variant="secondary">dismissed</Badge>;
  return <Badge variant="outline">{status || 'unknown'}</Badge>;
};

const ReportRow = ({ report, onHide, onUnhide, onResolve, onDismiss }) => {
  const post = report.postId;

  return (
    <motion.div variants={itemVariants}>
      <Card className="glass-card">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <StatusBadge status={report.status} />
              <Badge variant="outline">{report.reason || 'unspecified'}</Badge>
            </div>
            <span className="text-xs text-muted-foreground">{new Date(report.createdAt).toLocaleString()}</span>
          </div>

          <div className="space-y-1">
            <p className="font-semibold">{post?.title || 'Post unavailable'}</p>
            <p className="text-sm text-muted-foreground line-clamp-2">{post?.content || 'No content available.'}</p>
          </div>

          <div className="text-sm text-muted-foreground">
            Reporter: {report.reporterId?.email || report.reporterId?.name || 'Unknown'}
          </div>
          {report.description ? <p className="text-sm">{report.description}</p> : null}

          <div className="flex flex-wrap gap-2 pt-1">
            {post?._id ? (
              post.isHidden ? (
                <Button size="sm" variant="outline" onClick={() => onUnhide(post._id)}>
                  <Eye className="w-4 h-4 mr-2" />
                  Unhide Post
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => onHide(post._id)}>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Hide Post
                </Button>
              )
            ) : null}

            {report.status === 'pending' ? (
              <>
                <Button size="sm" onClick={() => onResolve(report._id, 'hidden')}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Hide And Resolve
                </Button>
                <Button size="sm" variant="destructive" onClick={() => onResolve(report._id, 'deleted')}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Post
                </Button>
                <Button size="sm" variant="outline" onClick={() => onDismiss(report._id)}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Allow Post
                </Button>
              </>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function AdminReportsPage() {
  const reports = useAdminStore((state) => state.communityReports);
  const fetchCommunityReports = useAdminStore((state) => state.fetchCommunityReports);
  const hideCommunityPost = useAdminStore((state) => state.hideCommunityPost);
  const unhideCommunityPost = useAdminStore((state) => state.unhideCommunityPost);
  const resolveReport = useAdminStore((state) => state.resolveReport);
  const dismissReport = useAdminStore((state) => state.dismissReport);

  useEffect(() => {
    fetchCommunityReports().catch((error) => {
      toast.error(error.message || 'Failed to load reports');
    });
  }, [fetchCommunityReports]);

  const pendingReports = useMemo(() => reports.filter((report) => report.status === 'pending'), [reports]);
  const resolvedReports = useMemo(() => reports.filter((report) => report.status === 'resolved'), [reports]);
  const dismissedReports = useMemo(() => reports.filter((report) => report.status === 'dismissed'), [reports]);

  const handleHide = async (postId) => {
    try {
      await hideCommunityPost(postId);
      toast.success('Post hidden');
    } catch (error) {
      toast.error(error.message || 'Unable to hide post');
    }
  };

  const handleUnhide = async (postId) => {
    try {
      await unhideCommunityPost(postId);
      toast.success('Post unhidden');
    } catch (error) {
      toast.error(error.message || 'Unable to unhide post');
    }
  };

  const handleResolve = async (reportId, actionTaken = 'hidden') => {
    try {
      await resolveReport(reportId, actionTaken);
      if (actionTaken === 'deleted') {
        toast.success('Post deleted and reports resolved');
      } else if (actionTaken === 'hidden') {
        toast.success('Post hidden and reports resolved');
      } else {
        toast.success('Report resolved');
      }
    } catch (error) {
      toast.error(error.message || 'Unable to resolve report');
    }
  };

  const handleDismiss = async (reportId) => {
    try {
      await dismissReport(reportId);
      toast.success('Report dismissed');
    } catch (error) {
      toast.error(error.message || 'Unable to dismiss report');
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Flag className="w-8 h-8 text-primary" />
          Reports
        </h1>
        <p className="text-muted-foreground">Backend-driven moderation report center for the single admin</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-3">
            <Clock3 className="w-6 h-6 text-destructive" />
            <div>
              <p className="text-2xl font-bold">{pendingReports.length}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-primary" />
            <div>
              <p className="text-2xl font-bold">{resolvedReports.length}</p>
              <p className="text-sm text-muted-foreground">Resolved</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-3">
            <XCircle className="w-6 h-6 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{dismissedReports.length}</p>
              <p className="text-sm text-muted-foreground">Dismissed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingReports.length})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({resolvedReports.length})</TabsTrigger>
          <TabsTrigger value="dismissed">Dismissed ({dismissedReports.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-3">
          {pendingReports.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending reports.</p>
          ) : (
            pendingReports.map((report) => (
              <ReportRow
                key={report._id}
                report={report}
                onHide={handleHide}
                onUnhide={handleUnhide}
                onResolve={handleResolve}
                onDismiss={handleDismiss}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-3">
          {resolvedReports.length === 0 ? (
            <p className="text-sm text-muted-foreground">No resolved reports.</p>
          ) : (
            resolvedReports.map((report) => (
              <ReportRow
                key={report._id}
                report={report}
                onHide={handleHide}
                onUnhide={handleUnhide}
                onResolve={handleResolve}
                onDismiss={handleDismiss}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="dismissed" className="space-y-3">
          {dismissedReports.length === 0 ? (
            <p className="text-sm text-muted-foreground">No dismissed reports.</p>
          ) : (
            dismissedReports.map((report) => (
              <ReportRow
                key={report._id}
                report={report}
                onHide={handleHide}
                onUnhide={handleUnhide}
                onResolve={handleResolve}
                onDismiss={handleDismiss}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
