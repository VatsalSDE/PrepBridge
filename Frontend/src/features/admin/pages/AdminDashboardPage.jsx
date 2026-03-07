import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Activity,
  CheckCircle2,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Target,
  UserCheck,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { containerVariants, itemVariants } from '@/utils/animations';
import useAdminStore from '@/store/adminStore';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const toMonthLabel = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
const toDayLabel = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });

const formatCompact = (value) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return String(value);
};

const changeMeta = (current = 0, previous = 0) => {
  const safePrev = previous || 0;
  if (safePrev === 0) {
    return { change: 0, isUp: current >= 0 };
  }
  const diff = ((current - safePrev) / safePrev) * 100;
  return { change: Math.round(Math.abs(diff)), isUp: diff >= 0 };
};

const PIE_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(var(--success))',
  'hsl(var(--warning))',
  'hsl(var(--muted-foreground))',
];

const StatCard = ({ title, value, icon: Icon, change }) => (
  <motion.div variants={itemVariants}>
    <Card className="glass-card hover:shadow-lg transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            <div className={`flex items-center gap-1 mt-2 text-sm ${change.isUp ? 'text-success' : 'text-destructive'}`}>
              {change.isUp ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              +{change.change}% from last period
            </div>
          </div>
          <div className="p-3 rounded-xl bg-primary/10">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState('6m');
  const [lastUpdated, setLastUpdated] = useState(null);
  const fetchDashboard = useAdminStore((state) => state.fetchDashboard);
  const dashboardStats = useAdminStore((state) => state.dashboardStats);

  useEffect(() => {
    let alive = true;

    const load = async (showError = true) => {
      try {
        await fetchDashboard();
        if (alive) setLastUpdated(new Date());
      } catch (error) {
        if (showError) toast.error(error.message || 'Failed to load dashboard');
      }
    };

    load(true);
    const interval = setInterval(() => {
      load(false);
    }, 30000);

    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, [fetchDashboard]);

  const stats = dashboardStats || {};
  const userGrowth = (stats.userGrowth || []).map((item) => ({
    ...item,
    month: toMonthLabel(item.date),
  }));

  const rangeSize = timeRange === '3m' ? 3 : timeRange === '6m' ? 6 : 12;
  const userGrowthData = userGrowth.slice(-rangeSize);

  const activityData = (stats.activityChart || []).map((item) => ({
    ...item,
    day: toDayLabel(item.date),
  }));

  const categories = stats.categoryDistribution || [];

  const performers = stats.consistentPerformers || [];

  const userGrowthChange = useMemo(() => {
    if (userGrowthData.length < 2) return { change: 0, isUp: true };
    const last = userGrowthData[userGrowthData.length - 1]?.users || 0;
    const prev = userGrowthData[userGrowthData.length - 2]?.users || 0;
    return changeMeta(last, prev);
  }, [userGrowthData]);

  const activeUsersToday = Number(stats.activeUsersToday || 0);
  const yesterdayActive = Number(activityData[activityData.length - 2]?.logins || 0);
  const activeUsersChange = changeMeta(activeUsersToday, yesterdayActive);

  const tasksCompleted = Number(stats.tasksCompleted || 0);
  const lastDayTasks = Number(activityData[activityData.length - 1]?.completedTasks || 0);
  const previousDayTasks = Number(activityData[activityData.length - 2]?.completedTasks || 0);
  const tasksChange = changeMeta(lastDayTasks, previousDayTasks);

  const avgEngagement = Number(stats.avgEngagement || 0);
  const prevEngagement = Number(stats.totalUsers || 0) > 0 && yesterdayActive > 0
    ? Math.round((yesterdayActive / Number(stats.totalUsers)) * 100)
    : 0;
  const engagementChange = changeMeta(avgEngagement, prevEngagement);

  const yAxisDomain = useMemo(() => {
    if (!userGrowthData.length) return [0, 100];
    const values = userGrowthData.map((entry) => entry.users);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const pad = Math.max(5, Math.round((max - min) * 0.12));
    return [Math.max(0, min - pad), max + pad];
  }, [userGrowthData]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of platform performance and user activity</p>
          <p className="text-xs text-muted-foreground mt-1">
            Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : '...'}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={async () => {
            try {
              await fetchDashboard();
              setLastUpdated(new Date());
              toast.success('Dashboard refreshed');
            } catch (error) {
              toast.error(error.message || 'Failed to refresh dashboard');
            }
          }}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={formatCompact(Number(stats.totalUsers || 0))}
          icon={Users}
          change={userGrowthChange}
        />
        <StatCard
          title="Active Users Today"
          value={formatCompact(activeUsersToday)}
          icon={Activity}
          change={activeUsersChange}
        />
        <StatCard
          title="Tasks Completed"
          value={formatCompact(tasksCompleted)}
          icon={CheckCircle2}
          change={tasksChange}
        />
        <StatCard
          title="Avg. Engagement"
          value={`${avgEngagement}%`}
          icon={TrendingUp}
          change={engagementChange}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>User Growth</CardTitle>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3m">Last 3 months</SelectItem>
                  <SelectItem value="6m">Last 6 months</SelectItem>
                  <SelectItem value="12m">Last 12 months</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart key={timeRange} data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" />
                    <YAxis domain={yAxisDomain} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Daily Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="logins" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="completedTasks" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card className="glass-card h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-accent" />
                Task Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categories}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      dataKey="value"
                    >
                      {categories.map((entry, index) => (
                        <Cell key={`${entry.name}-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                {categories.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No category data yet.</p>
                ) : (
                  categories.map((cat, index) => (
                    <div key={cat.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                        <span>{cat.name}</span>
                      </div>
                      <span className="font-medium">{cat.value}%</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="glass-card h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserCheck className="w-5 h-5 text-muted-foreground" />
                Consistent Performers (This Month)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {performers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No performer data yet.</p>
              ) : (
                performers.map((user) => (
                  <div key={user.name} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
                        {(user.name || 'U').charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.college}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{user.streak}d streak</span>
                      <span className="font-medium text-foreground">{user.avgProductivity}%</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
