import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, TrendingUp, Activity, CheckCircle2,
  ArrowUp, ArrowDown, Target, UserCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { containerVariants, itemVariants } from '@/utils/animations';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

const STATS = [
  { title: 'Total Users', value: '2,847', change: '+12%', changeType: 'up', icon: Users, color: 'primary' },
  { title: 'Active Users Today', value: '428', change: '+8%', changeType: 'up', icon: Activity, color: 'success' },
  { title: 'Tasks Completed', value: '15.2K', change: '+23%', changeType: 'up', icon: CheckCircle2, color: 'accent' },
  { title: 'Avg. Engagement', value: '78%', change: '+5%', changeType: 'up', icon: TrendingUp, color: 'warning' },
];

// Extended user growth data for different time ranges
const USER_GROWTH_DATA = {
  '3m': [
    { month: 'Oct', users: 2100 },
    { month: 'Nov', users: 2450 },
    { month: 'Dec', users: 2847 },
  ],
  '6m': [
    { month: 'Jul', users: 1200 },
    { month: 'Aug', users: 1450 },
    { month: 'Sep', users: 1680 },
    { month: 'Oct', users: 2100 },
    { month: 'Nov', users: 2450 },
    { month: 'Dec', users: 2847 },
  ],
  '12m': [
    { month: 'Jan', users: 420 },
    { month: 'Feb', users: 580 },
    { month: 'Mar', users: 720 },
    { month: 'Apr', users: 890 },
    { month: 'May', users: 1020 },
    { month: 'Jun', users: 1100 },
    { month: 'Jul', users: 1200 },
    { month: 'Aug', users: 1450 },
    { month: 'Sep', users: 1680 },
    { month: 'Oct', users: 2100 },
    { month: 'Nov', users: 2450 },
    { month: 'Dec', users: 2847 },
  ],
};

const DAILY_ACTIVITY = [
  { day: 'Mon', logins: 380, tasks: 520 },
  { day: 'Tue', logins: 420, tasks: 580 },
  { day: 'Wed', logins: 450, tasks: 620 },
  { day: 'Thu', logins: 410, tasks: 540 },
  { day: 'Fri', logins: 390, tasks: 480 },
  { day: 'Sat', logins: 280, tasks: 350 },
  { day: 'Sun', logins: 220, tasks: 280 },
];

const CATEGORY_DISTRIBUTION = [
  { name: 'DSA', value: 35, color: 'hsl(var(--primary))' },
  { name: 'Core CS', value: 25, color: 'hsl(var(--accent))' },
  { name: 'Development', value: 22, color: 'hsl(var(--success))' },
  { name: 'Aptitude', value: 18, color: 'hsl(var(--warning))' },
];

const CONSISTENT_PERFORMERS = [
  { name: 'Rahul Sharma', college: 'IIT Bombay', streak: 21, avgProductivity: 88 },
  { name: 'Priya Patel', college: 'NIT Trichy', streak: 18, avgProductivity: 84 },
  { name: 'Amit Kumar', college: 'BITS Pilani', streak: 15, avgProductivity: 81 },
  { name: 'Sneha Reddy', college: 'IIIT Hyderabad', streak: 14, avgProductivity: 79 },
  { name: 'Vikash Singh', college: 'DTU Delhi', streak: 12, avgProductivity: 76 },
];


function StatCard({ stat, index }) {
  const Icon = stat.icon;
  const bgColorMap = {
    primary: 'bg-primary/10',
    success: 'bg-success/10',
    accent: 'bg-accent/10',
    warning: 'bg-warning/10',
  };
  const textColorMap = {
    primary: 'text-primary',
    success: 'text-success',
    accent: 'text-accent',
    warning: 'text-warning',
  };
  return (
    <motion.div variants={itemVariants} custom={index}>
      <Card className="glass-card hover:shadow-lg transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <p className="text-3xl font-bold mt-1">{stat.value}</p>
              <div className={`flex items-center gap-1 mt-2 text-sm ${
                stat.changeType === 'up' ? 'text-success' : 'text-destructive'
              }`}>
                {stat.changeType === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                {stat.change} from last month
              </div>
            </div>
            <div className={`p-3 rounded-xl ${bgColorMap[stat.color]}`}>
              <Icon className={`w-6 h-6 ${textColorMap[stat.color]}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState('6m');

  const userGrowthData = useMemo(() => USER_GROWTH_DATA[timeRange], [timeRange]);

  // Calculate dynamic Y-axis domain based on time range
  const yAxisDomain = useMemo(() => {
    const data = USER_GROWTH_DATA[timeRange];
    const maxValue = Math.max(...data.map(d => d.users));
    const minValue = Math.min(...data.map(d => d.users));
    const padding = Math.round((maxValue - minValue) * 0.1);
    return [Math.max(0, minValue - padding), maxValue + padding];
  }, [timeRange]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of platform performance and user activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat, index) => (
          <StatCard key={stat.title} stat={stat} index={index} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* User Growth Chart with Time Range Selector */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                User Growth
              </CardTitle>
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
                  <LineChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" />
                    <YAxis domain={yAxisDomain} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
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

        {/* Daily Activity Chart */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-success" />
                Daily Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={DAILY_ACTIVITY}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="logins" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="tasks" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
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
                      data={CATEGORY_DISTRIBUTION}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      dataKey="value"
                    >
                      {CATEGORY_DISTRIBUTION.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                {CATEGORY_DISTRIBUTION.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span>{cat.name}</span>
                    </div>
                    <span className="font-medium">{cat.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Consistent Performers */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserCheck className="w-5 h-5 text-muted-foreground" />
                Consistent Performers (This Month)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {CONSISTENT_PERFORMERS.map((user) => (
                <div key={user.name} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
                      {user.name.charAt(0)}
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
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
