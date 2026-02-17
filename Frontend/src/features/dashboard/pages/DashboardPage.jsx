import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Flame, 
  TrendingUp, 
  CheckCircle2, 
  Calendar,
  Target,
  Clock,
  ArrowRight,
  Zap,
  BookOpen,
  BarChart3,
  Lightbulb,
  Brain,
  Shield,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import useTaskStore from '@/store/taskStore';
import useAuthStore from '@/store/authStore';
import { getEncouragementMessage, getStreakMessage } from '@/utils/helpers';

// Mock foundations progress data (mirrors roadmap structure)
const foundationsData = {
  dsa: 42,
  coreCs: 28,
  aptitude: 12,
  systemDesign: 8,
};
const foundationsOverall = Math.round(
  (foundationsData.dsa + foundationsData.coreCs + foundationsData.aptitude + foundationsData.systemDesign) / 4
);

// Derive prep balance insight
const getPrepBalanceInsight = () => {
  const entries = Object.entries(foundationsData);
  const max = entries.reduce((a, b) => (b[1] > a[1] ? b : a));
  const min = entries.reduce((a, b) => (b[1] < a[1] ? b : a));
  const labels = { dsa: 'DSA', coreCs: 'Core CS', aptitude: 'Aptitude', systemDesign: 'System Design' };
  if (max[1] - min[1] > 20) {
    return `Your preparation is ${labels[max[0]]}-heavy. ${labels[min[0]]} needs more consistency.`;
  }
  return 'Your preparation is well-balanced across all areas.';
};

// Derive interview readiness
const getReadinessLabel = () => {
  if (foundationsOverall >= 70) return { label: 'Interview Ready', color: 'text-success', bg: 'bg-success/10' };
  if (foundationsOverall >= 35) return { label: 'Building Foundation', color: 'text-primary', bg: 'bg-primary/10' };
  return { label: 'Early Stage', color: 'text-warning', bg: 'bg-warning/10' };
};

// Derive attention needed
const getAttentionNeeded = () => {
  const labels = { dsa: 'DSA', coreCs: 'Core CS', aptitude: 'Aptitude', systemDesign: 'System Design' };
  const entries = Object.entries(foundationsData);
  const min = entries.reduce((a, b) => (b[1] < a[1] ? b : a));
  return `${labels[min[0]]} not practiced this week`;
};

const statsCards = [
  {
    title: "Today's Productivity",
    getValue: (data) => `${data.productivity}%`,
    icon: TrendingUp,
    color: 'text-success',
    bgColor: 'bg-success/10',
    description: (data) => getEncouragementMessage(data.productivity),
  },
  {
    title: 'Current Streak',
    getValue: (data) => `${data.streak} days`,
    icon: Flame,
    color: 'text-streak',
    bgColor: 'bg-streak/10',
    description: (data) => getStreakMessage(data.streak),
    isStreak: true,
  },
  {
    title: 'Foundations Progress',
    getValue: () => `${foundationsOverall}%`,
    icon: Target,
    color: 'text-accent',
    bgColor: 'bg-accent/10',
    description: () => 'Aggregated across all foundation areas',
  },
  {
    title: 'Weekly Study Hours',
    getValue: () => '18.5h',
    icon: Clock,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    description: () => 'of 25h weekly goal',
  },
];

const quickActions = [
  { label: 'Add Task', icon: Zap, path: '/planning', variant: 'hero' },
  { label: 'View Calendar', icon: Calendar, path: '/calendar', variant: 'outline' },
  { label: 'Continue Roadmap', icon: Target, path: '/roadmap', variant: 'outline' },
];

const todaysTasks = [
  { id: 1, title: 'Solve 5 LeetCode problems (Arrays)', category: 'DSA', completed: true, estimatedTime: 90 },
  { id: 2, title: 'Review DBMS Normalization', category: 'Core CS', completed: true, estimatedTime: 45 },
  { id: 3, title: 'Build REST API for project', category: 'Development', completed: false, estimatedTime: 120 },
  { id: 4, title: 'Practice verbal reasoning', category: 'Aptitude', completed: false, estimatedTime: 30 },
];

const weeklyBreakdown = [
  { day: 'Mon', hours: 3.5 },
  { day: 'Tue', hours: 4.0 },
  { day: 'Wed', hours: 2.5 },
  { day: 'Thu', hours: 3.0 },
  { day: 'Fri', hours: 5.5 },
  { day: 'Sat', hours: 0 },
  { day: 'Sun', hours: 0 },
];

const DashboardPage = () => {
  const streak = useTaskStore((state) => state.streak);
  const user = useAuthStore((state) => state.user);

  const completedToday = todaysTasks.filter(t => t.completed).length;
  const productivity = Math.round((completedToday / todaysTasks.length) * 100);

  const statsData = {
    productivity,
    completed: completedToday,
    total: todaysTasks.length,
    streak,
  };

  const maxHours = Math.max(...weeklyBreakdown.map(d => d.hours), 1);
  const readiness = getReadinessLabel();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Welcome back, <span className="text-gradient-primary">{user?.name?.split(' ')[0] || 'Vatsal'}</span>! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's your preparation overview for today
          </p>
        </div>

        <div className="flex gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.path} to={action.path}>
                <Button variant={action.variant} size="sm" className="gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{action.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-300 hover:border-primary/30 cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold text-foreground mt-1">
                        {stat.getValue(statsData)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {stat.description(statsData)}
                      </p>
                    </div>
                    <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                      {stat.isStreak ? (
                        <motion.div
                          animate={{ 
                            scale: [1, 1.1, 1.05, 1.08, 1],
                            rotate: [0, -3, 3, -2, 0],
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <Icon className={`h-5 w-5 ${stat.color}`} />
                        </motion.div>
                      ) : (
                        <Icon className={`h-5 w-5 ${stat.color}`} />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Insight Strip */}
      <div className="grid sm:grid-cols-3 gap-4">
        {/* Prep Balance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="h-full">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <Brain className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Prep Balance</p>
                <p className="text-sm text-foreground mt-1">{getPrepBalanceInsight()}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Interview Readiness */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="h-full">
            <CardContent className="p-4 flex items-start gap-3">
              <div className={`w-9 h-9 rounded-lg ${readiness.bg} flex items-center justify-center shrink-0`}>
                <Shield className={`h-4 w-4 ${readiness.color}`} />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Interview Readiness</p>
                <p className={`text-sm font-semibold mt-1 ${readiness.color}`}>{readiness.label}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Attention Needed */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card className="h-full border-warning/20">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
                <AlertCircle className="h-4 w-4 text-warning" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Attention Needed</p>
                <p className="text-sm text-foreground mt-1">{getAttentionNeeded()}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Tasks Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Today's Tasks</CardTitle>
              <Link to="/planning">
                <Button variant="ghost" size="sm" className="gap-1 text-primary">
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress Summary */}
              <div className="p-4 rounded-xl bg-secondary/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Daily Progress</span>
                  <span className="text-sm font-semibold text-primary">{productivity}%</span>
                </div>
                <Progress value={productivity} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {completedToday} of {todaysTasks.length} tasks completed
                </p>
              </div>

              {/* Task List */}
              <div className="space-y-3">
                {todaysTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className={`flex items-center gap-4 p-3 rounded-lg border transition-all duration-200 ${
                      task.completed 
                        ? 'bg-success/5 border-success/20' 
                        : 'bg-card border-border hover:border-primary/30'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      task.completed 
                        ? 'bg-success border-success' 
                        : 'border-muted-foreground/30'
                    }`}>
                      {task.completed && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          <CheckCircle2 className="h-3 w-3 text-success-foreground" />
                        </motion.div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        task.completed ? 'text-muted-foreground line-through' : 'text-foreground'
                      }`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {task.category}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {task.estimatedTime}m
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Weekly Study Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">This Week's Study</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between gap-2 h-32">
                  {weeklyBreakdown.map((day, idx) => {
                    const heightPercent = maxHours > 0 ? (day.hours / maxHours) * 100 : 0;
                    const isToday = idx === new Date().getDay() - 1;
                    return (
                      <div key={day.day} className="flex flex-col items-center gap-1 flex-1">
                        <span className="text-xs text-muted-foreground">{day.hours > 0 ? `${day.hours}h` : ''}</span>
                        <div className="w-full relative" style={{ height: '80px' }}>
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${heightPercent}%` }}
                            transition={{ delay: 0.5 + idx * 0.05, duration: 0.4 }}
                            className={`absolute bottom-0 w-full rounded-t-md ${
                              isToday ? 'bg-primary' : 'bg-primary/30'
                            }`}
                          />
                        </div>
                        <span className={`text-xs ${isToday ? 'font-bold text-primary' : 'text-muted-foreground'}`}>{day.day}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Prep Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-warning" />
                  Prep Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { icon: BookOpen, title: 'Revise Before Bed', description: 'Reviewing concepts before sleep improves retention by up to 20%.' },
                  { icon: BarChart3, title: 'Track Weak Areas', description: 'Focus 60% of your time on weak topics and 40% on strengths.' },
                  { icon: Lightbulb, title: 'Active Recall', description: "Test yourself instead of re-reading — it's 3x more effective." },
                ].map((tip, idx) => {
                  const Icon = tip.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + idx * 0.1 }}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{tip.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{tip.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>

          {/* Encouragement Card */}
          {/* <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    🌟
                  </motion.div>
                  <span className="text-sm font-semibold text-foreground">Daily Insight</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  You're on a <span className="text-streak font-semibold">{streak}-day streak</span>! 
                  Keep showing up daily - consistency beats intensity in placement preparation.
                </p>
              </CardContent>
            </Card>
          </motion.div> */}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
