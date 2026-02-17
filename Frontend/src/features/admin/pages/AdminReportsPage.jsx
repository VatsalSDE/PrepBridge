import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Flag, AlertTriangle, CheckCircle2, Clock, User, MessageSquare,
  Eye, XCircle, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { containerVariants, itemVariants } from '@/utils/animations';
import { toast } from 'sonner';

const USER_REPORTS = [
  {
    id: 1,
    reportedUser: 'Anonymous Fox #1234',
    reportedBy: 'Anonymous Tiger #5678',
    reason: 'Harassment',
    description: 'This user has been sending offensive messages in comments.',
    timestamp: '1 hour ago',
    status: 'pending'
  },
  {
    id: 2,
    reportedUser: 'Anonymous Bear #9012',
    reportedBy: 'Anonymous Eagle #3456',
    reason: 'Spam',
    description: 'Repeatedly posting promotional content.',
    timestamp: '3 hours ago',
    status: 'pending'
  },
];

const BUG_REPORTS = [
  {
    id: 1,
    title: 'Calendar heatmap not loading',
    description: 'The heatmap on the calendar page shows blank squares instead of activity data.',
    user: 'rahul@example.com',
    timestamp: '2 hours ago',
    severity: 'medium',
    status: 'open'
  },
  {
    id: 2,
    title: 'Task completion not saving',
    description: 'When I mark a task as complete, it reverts back to incomplete after refresh.',
    user: 'priya@example.com',
    timestamp: '5 hours ago',
    severity: 'high',
    status: 'investigating'
  },
  {
    id: 3,
    title: 'JD matching shows wrong percentage',
    description: 'The match percentage seems too high even for skills I dont have.',
    user: 'amit@example.com',
    timestamp: '1 day ago',
    severity: 'low',
    status: 'resolved'
  },
];

const FEEDBACK = [
  {
    id: 1,
    type: 'feature',
    title: 'Add dark mode toggle',
    description: 'Would love to have a quick toggle for dark/light mode in the navbar.',
    user: 'Anonymous',
    timestamp: '4 hours ago',
    votes: 24
  },
  {
    id: 2,
    type: 'improvement',
    title: 'Better mobile experience',
    description: 'The sidebar is hard to use on mobile devices.',
    user: 'Anonymous',
    timestamp: '1 day ago',
    votes: 18
  },
  {
    id: 3,
    type: 'feature',
    title: 'Integration with LeetCode',
    description: 'Auto-sync problems solved from LeetCode account.',
    user: 'Anonymous',
    timestamp: '2 days ago',
    votes: 45
  },
];

export default function AdminReportsPage() {
  const [userReports, setUserReports] = useState(USER_REPORTS);
  const [bugReports, setBugReports] = useState(BUG_REPORTS);
  const [feedback, setFeedback] = useState(FEEDBACK);

  const handleResolveUserReport = (id) => {
    setUserReports(userReports.filter(r => r.id !== id));
    toast.success('Report resolved');
  };

  const handleDismissUserReport = (id) => {
    setUserReports(userReports.filter(r => r.id !== id));
    toast.success('Report dismissed');
  };

  const handleUpdateBugStatus = (id, status) => {
    setBugReports(bugReports.map(b => 
      b.id === id ? { ...b, status } : b
    ));
    toast.success(`Bug marked as ${status}`);
  };

  const handleUpdateFeedbackStatus = (id, newStatus) => {
    setFeedback(feedback.map(f => 
      f.id === id ? { ...f, status: newStatus } : f
    ));
    toast.success(`Feedback marked as ${newStatus}`);
  };

  const handleArchiveFeedback = (id) => {
    setFeedback(feedback.filter(f => f.id !== id));
    toast.success('Feedback archived');
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'destructive';
      case 'investigating': return 'warning';
      case 'resolved': return 'success';
      default: return 'secondary';
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Flag className="w-8 h-8 text-primary" />
          Reports & Feedback
        </h1>
        <p className="text-muted-foreground">Manage user reports, bugs, and feedback</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-destructive/10">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{userReports.length}</p>
              <p className="text-sm text-muted-foreground">User Reports</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-warning/10">
              <Flag className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{bugReports.filter(b => b.status !== 'resolved').length}</p>
              <p className="text-sm text-muted-foreground">Open Bugs</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{FEEDBACK.length}</p>
              <p className="text-sm text-muted-foreground">Feedback Items</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="user-reports" className="space-y-6">
        <TabsList>
          <TabsTrigger value="user-reports" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            User Reports
          </TabsTrigger>
          <TabsTrigger value="bugs" className="gap-2">
            <Flag className="w-4 h-4" />
            Bug Reports
          </TabsTrigger>
          <TabsTrigger value="feedback" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            Feedback
          </TabsTrigger>
        </TabsList>

        {/* User Reports */}
        <TabsContent value="user-reports" className="space-y-4">
          {userReports.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="p-8 text-center">
                <CheckCircle2 className="w-12 h-12 mx-auto text-success mb-4" />
                <h3 className="font-medium">No pending reports</h3>
                <p className="text-sm text-muted-foreground">All user reports have been handled</p>
              </CardContent>
            </Card>
          ) : (
            userReports.map((report) => (
              <motion.div key={report.id} variants={itemVariants}>
                <Card className="glass-card border-destructive/20">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive">{report.reason}</Badge>
                          <span className="text-sm text-muted-foreground">{report.timestamp}</span>
                        </div>
                        <p className="font-medium">Reported: {report.reportedUser}</p>
                        <p className="text-sm text-muted-foreground">By: {report.reportedBy}</p>
                        <p className="text-sm">{report.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" onClick={() => handleDismissUserReport(report.id)}>
                        <XCircle className="w-4 h-4 mr-2" />
                        Dismiss
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleResolveUserReport(report.id)}>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Take Action
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </TabsContent>

        {/* Bug Reports */}
        <TabsContent value="bugs" className="space-y-4">
          {bugReports.map((bug) => (
            <motion.div key={bug.id} variants={itemVariants}>
              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={getSeverityColor(bug.severity)}>{bug.severity}</Badge>
                        <Badge variant={getStatusColor(bug.status)}>
                          {bug.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{bug.timestamp}</span>
                      </div>
                      <h3 className="font-semibold">{bug.title}</h3>
                      <p className="text-sm text-muted-foreground">{bug.description}</p>
                      <p className="text-xs text-muted-foreground">Reported by: {bug.user}</p>
                    </div>
                  </div>
                  {bug.status !== 'resolved' && (
                    <div className="flex gap-2 mt-4">
                      {bug.status === 'open' && (
                        <Button size="sm" variant="outline" onClick={() => handleUpdateBugStatus(bug.id, 'investigating')}>
                          <Eye className="w-4 h-4 mr-2" />
                          Investigate
                        </Button>
                      )}
                      <Button size="sm" onClick={() => handleUpdateBugStatus(bug.id, 'resolved')}>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Mark Resolved
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        {/* Feedback */}
        <TabsContent value="feedback" className="space-y-4">
          {feedback.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="p-8 text-center">
                <CheckCircle2 className="w-12 h-12 mx-auto text-success mb-4" />
                <h3 className="font-medium">No feedback to review</h3>
                <p className="text-sm text-muted-foreground">All feedback has been addressed</p>
              </CardContent>
            </Card>
          ) : (
            feedback.map((item) => (
              <motion.div key={item.id} variants={itemVariants}>
                <Card className="glass-card">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={item.type === 'feature' ? 'default' : 'secondary'}>
                            {item.type}
                          </Badge>
                          {item.status && (
                            <Badge variant="outline">{item.status}</Badge>
                          )}
                          <span className="text-sm text-muted-foreground">{item.timestamp}</span>
                        </div>
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <p className="text-2xl font-bold text-primary">{item.votes}</p>
                        <p className="text-xs text-muted-foreground">votes</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      {!item.status && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleUpdateFeedbackStatus(item.id, 'reviewing')}>
                            <Eye className="w-4 h-4 mr-2" />
                            Review
                          </Button>
                          <Button size="sm" onClick={() => handleUpdateFeedbackStatus(item.id, 'implemented')}>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Implement
                          </Button>
                        </>
                      )}
                      {item.status === 'reviewing' && (
                        <Button size="sm" onClick={() => handleUpdateFeedbackStatus(item.id, 'implemented')}>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Implement
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleArchiveFeedback(item.id)}>
                        <XCircle className="w-4 h-4 mr-2" />
                        Archive
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
