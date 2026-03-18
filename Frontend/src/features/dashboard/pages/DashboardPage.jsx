import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import {
  Flame,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Target,
  Clock,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Zap,
  BookOpen,
  BarChart3,
  Lightbulb,
  Brain,
  Shield,
  AlertCircle,
  Crosshair,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import dashboardService from '@/services/dashboardService';
import taskService from '@/services/taskService';
import useAuthStore from '@/store/authStore';
import useProfileStore from '@/store/profileStore';
import { getEncouragementMessage, getStreakMessage } from '@/utils/helpers';
import { isProfileComplete } from '@/features/profile/utils/profileCompletion';
import ProfileCompletionModal from '@/features/dashboard/components/ProfileCompletionModal';

const AUTO_REFRESH_MS = 20000;

const formatSyncTime = (value) => {
  if (!value) return 'Syncing...';
  return new Date(value).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

const DashboardPage = () => {
  const user = useAuthStore((state) => state.user);
  const profile = useProfileStore((state) => state.profile);
  const hasFetched = useProfileStore((state) => state.hasFetched);

  const [summary, setSummary] = useState(null);
  const [todayTasks, setTodayTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Show modal only if profile is incomplete (and profile has been fetched)
  useEffect(() => {
    if (hasFetched && !isProfileComplete(profile)) {
      setShowProfileModal(true);
    } else {
      setShowProfileModal(false);
    }
  }, [hasFetched, profile]);

  const loadData = async (showLoader = false) => {
    if (showLoader) setIsRefreshing(true);

    try {
      setError('');
      const [summaryResponse, taskResponse] = await Promise.all([
        dashboardService.getSummary(),
        taskService.getTodayTasks(),
      ]);
      setSummary(summaryResponse?.data || null);
      setTodayTasks(taskResponse?.data || []);
      setLastSyncedAt(new Date());
    } catch (loadError) {
      setError(loadError.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
      if (showLoader) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(true);

    const interval = window.setInterval(() => {
      loadData(false);
    }, AUTO_REFRESH_MS);

    const handleFocus = () => loadData(false);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') loadData(false);
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const productivity = summary?.today?.productivity || 0;
  const streak = summary?.streak?.current || 0;
  const todayCompleted = summary?.today?.completedTasks || 0;
  const todayTotal = summary?.today?.totalTasks || 0;
  const weeklyTotalHours = summary?.weekly?.totalHours || 0;
  const weeklyGoal = summary?.weekly?.goal || 25;
  const weeklyDays = summary?.weekly?.days || [];
  const latestJD = summary?.latestJD;

  const readiness = useMemo(() => {
    const score = Math.round(((summary?.categoryBreakdown?.dsa || 0) + (summary?.categoryBreakdown?.coreCs || 0) + (summary?.categoryBreakdown?.development || 0) + (summary?.categoryBreakdown?.aptitude || 0)) / 4);
    if (score >= 70) return { label: 'Interview Ready', color: 'text-success', bg: 'bg-success/10' };
    if (score >= 35) return { label: 'Building Foundation', color: 'text-primary', bg: 'bg-primary/10' };
    return { label: 'Early Stage', color: 'text-warning', bg: 'bg-warning/10' };
  }, [summary]);

  const prepBalanceInsight = useMemo(() => {
    const map = {
      dsa: summary?.categoryBreakdown?.dsa || 0,
      coreCs: summary?.categoryBreakdown?.coreCs || 0,
      development: summary?.categoryBreakdown?.development || 0,
      aptitude: summary?.categoryBreakdown?.aptitude || 0,
    };
    const labels = { dsa: 'DSA', coreCs: 'Core CS', development: 'Development', aptitude: 'Aptitude' };
    const entries = Object.entries(map);
    const max = entries.reduce((a, b) => (b[1] > a[1] ? b : a));
    const min = entries.reduce((a, b) => (b[1] < a[1] ? b : a));

    if (max[1] - min[1] > 20) {
      return `Your preparation is ${labels[max[0]]}-heavy. ${labels[min[0]]} needs more consistency.`;
    }
    return 'Your preparation is well-balanced across active areas this week.';
  }, [summary]);

  const attentionNeeded = useMemo(() => {
    const map = {
      dsa: summary?.categoryBreakdown?.dsa || 0,
      coreCs: summary?.categoryBreakdown?.coreCs || 0,
      development: summary?.categoryBreakdown?.development || 0,
      aptitude: summary?.categoryBreakdown?.aptitude || 0,
    };
    const labels = { dsa: 'DSA', coreCs: 'Core CS', development: 'Development', aptitude: 'Aptitude' };
    const min = Object.entries(map).reduce((a, b) => (b[1] < a[1] ? b : a));
    return `${labels[min[0]]} needs more focus this week`;
  }, [summary]);

  const weeklyComparison = useMemo(() => {
    const diff = (summary?.weekly?.totalHours || 0) - (summary?.weekly?.lastWeekHours || 0);
    const isUp = diff >= 0;
    return {
      isUp,
      text: `${Math.abs(diff).toFixed(1)}h vs last week`,
    };
  }, [summary]);

  const maxHours = Math.max(...weeklyDays.map((d) => d.hours || 0), 1);

  const quickActions = [
    { label: 'Add Task', icon: Zap, path: '/planning', variant: 'hero' },
    { label: 'View Calendar', icon: Calendar, path: '/calendar', variant: 'outline' },
    { label: 'Continue Roadmap', icon: Target, path: '/roadmap', variant: 'outline' },
  ];

  const statsCards = [
    {
      title: "Today's Productivity",
      value: `${productivity}%`,
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-success/10',
      description: getEncouragementMessage(productivity),
    },
    {
      title: 'Current Streak',
      value: `${streak} days`,
      icon: Flame,
      color: 'text-streak',
      bgColor: 'bg-streak/10',
      description: getStreakMessage(streak),
    },
    {
      title: 'Weekly Study Hours',
      value: `${weeklyTotalHours}h`,
      icon: Clock,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      description: `of ${weeklyGoal}h weekly goal`,
    },
    {
      title: 'Tasks Done Today',
      value: `${todayCompleted}/${todayTotal}`,
      icon: CheckCircle2,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      description: todayTotal > 0 ? 'Keep the momentum going' : 'Plan your day to get started',
    },
  ];

  if (isLoading && !summary) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {showProfileModal && (
        <ProfileCompletionModal
          profile={profile}
          onDismiss={() => setShowProfileModal(false)}
        />
      )}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            Welcome back, <span className="text-gradient-primary">{user?.name?.split(' ')[0] || 'Learner'}</span>!
          </h1>
          <p className="mt-1 text-muted-foreground">Real-time preparation overview synced from your live data.</p>
          <p className="mt-1 text-xs text-muted-foreground">Last sync: {formatSyncTime(lastSyncedAt)}</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => loadData(true)} disabled={isRefreshing}>
            {isRefreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Refresh
          </Button>
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.path} to={action.path}>
                <Button variant={action.variant} size="sm" className="gap-2 btn-hover">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{action.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </motion.div>

      {error ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-start gap-3 p-4 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Card className="card-hover cursor-pointer hover:border-primary/30 dark:card-glow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{stat.description}</p>
                    </div>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bgColor}`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover h-full dark:card-glow">
          <CardContent className="flex items-start gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10">
              <Brain className="h-4 w-4 text-accent" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Prep Balance</p>
              <p className="mt-1 text-sm text-foreground">{prepBalanceInsight}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover h-full dark:card-glow">
          <CardContent className="flex items-start gap-3 p-4">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${readiness.bg}`}>
              <Shield className={`h-4 w-4 ${readiness.color}`} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Interview Readiness</p>
              <p className={`mt-1 text-sm font-semibold ${readiness.color}`}>{readiness.label}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover h-full border-warning/20 dark:card-glow">
          <CardContent className="flex items-start gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-warning/10">
              <AlertCircle className="h-4 w-4 text-warning" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Attention Needed</p>
              <p className="mt-1 text-sm text-foreground">{attentionNeeded}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover h-full border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 dark:card-glow">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Crosshair className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">JD Readiness</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-lg font-bold text-primary">{latestJD ? `${latestJD.score}%` : '--'}</span>
                  <span className="text-xs text-muted-foreground">match</span>
                </div>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {latestJD ? `${latestJD.missingCount} skills missing` : 'No JD analysis yet'}
                  </span>
                  <Link to="/jd-matching">
                    <span className="flex items-center gap-0.5 text-xs font-medium text-primary transition-colors hover:text-primary/80">
                      Improve <ArrowRight className="h-3 w-3" />
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
          <Card className="dark:card-glow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Today's Tasks</CardTitle>
              <Link to="/planning">
                <Button variant="ghost" size="sm" className="gap-1 text-primary btn-hover">
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl bg-secondary/50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Daily Progress</span>
                  <span className="text-sm font-semibold text-primary">{productivity}%</span>
                </div>
                <Progress value={productivity} className="h-2" />
                <p className="mt-2 text-xs text-muted-foreground">{todayCompleted} of {todayTotal} tasks completed</p>
              </div>

              <div className="space-y-3">
                {todayTasks.length > 0 ? todayTasks.map((task, index) => (
                  <motion.div
                    key={task._id || task.id || `${task.title}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    className={`flex items-center gap-4 rounded-lg border p-3 transition-all duration-200 ${
                      task.completed ? 'border-success/20 bg-success/5' : 'border-border bg-card hover:border-primary/30'
                    }`}
                  >
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${task.completed ? 'border-success bg-success' : 'border-muted-foreground/30'}`}>
                      {task.completed ? <CheckCircle2 className="h-3 w-3 text-success-foreground" /> : null}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm font-medium ${task.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                        {task.title}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2">
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{task.category}</span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {task.estimatedTime || task.actualTime || 0}m
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )) : (
                  <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    No tasks for today yet. Add one from Daily Planning.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="space-y-6">
          <Card className="dark:card-glow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">This Week's Study</CardTitle>
                <div className={`flex items-center gap-1 text-xs font-medium ${weeklyComparison.isUp ? 'text-success' : 'text-destructive'}`}>
                  {weeklyComparison.isUp ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                  <span>{weeklyComparison.text}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex h-32 items-end justify-between gap-2">
                {weeklyDays.length > 0 ? weeklyDays.map((day) => {
                  const heightPercent = maxHours > 0 ? ((day.hours || 0) / maxHours) * 100 : 0;
                  return (
                    <div key={day.date || day.day} className="flex flex-1 flex-col items-center gap-1">
                      <span className="text-xs text-muted-foreground">{day.hours || 0}h</span>
                      <div className="relative w-full" style={{ height: '80px' }}>
                        <div
                          className="absolute bottom-0 w-full rounded-t-md bg-primary/40 transition-colors hover:bg-primary/60"
                          style={{ height: `${Math.max(heightPercent, 4)}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{day.day}</span>
                    </div>
                  );
                }) : (
                  <div className="w-full rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    Weekly chart appears after task activity.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="dark:card-glow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Lightbulb className="h-5 w-5 text-warning" />
                Prep Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { icon: BookOpen, title: 'Revise Before Bed', description: 'Reviewing concepts before sleep improves retention by up to 20%.' },
                { icon: BarChart3, title: 'Track Weak Areas', description: 'Focus 60% of your time on weak topics and 40% on strengths.' },
                { icon: Lightbulb, title: 'Active Recall', description: "Test yourself instead of re-reading - it's 3x more effective." },
              ].map((tip, idx) => {
                const Icon = tip.icon;
                return (
                  <motion.div
                    key={tip.title}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + idx * 0.08 }}
                    className="card-hover flex items-start gap-3 rounded-lg bg-muted/30 p-3"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{tip.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{tip.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
