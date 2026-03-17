import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  PieChart as PieChartIcon,
} from 'lucide-react';
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
  Legend,
} from 'recharts';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { containerVariants, itemVariants } from '@/utils/animations';
import useReportStore from '@/store/reportStore';

const formatDate = (value) => new Date(value).toLocaleDateString();
const formatShortDate = (value, options) => new Date(value).toLocaleDateString(undefined, options);

const moodOptions = [
  { emoji: '😊', value: 'good', label: 'Good' },
  { emoji: '😐', value: 'okay', label: 'Okay' },
  { emoji: '😔', value: 'bad', label: 'Bad' },
  { emoji: '💪', value: 'productive', label: 'Productive' },
  { emoji: '🔥', value: 'productive', label: 'On fire' },
  { emoji: '😴', value: 'terrible', label: 'Low energy' },
];

const trendRanges = [
  { label: '1W', value: 7 },
  { label: '3M', value: 90 },
  { label: '6M', value: 180 },
  { label: '1Y', value: 365 },
];

const formatDelta = (delta, suffix = '') => {
  const amount = typeof delta === 'number' ? delta : 0;
  const sign = amount > 0 ? '+' : '';
  return `${sign}${amount}${suffix}`;
};

function StatCard({ title, value, icon: Icon, deltaText, deltaTone = 'neutral' }) {
  const deltaClassName = deltaTone === 'positive'
    ? 'text-emerald-500'
    : deltaTone === 'negative'
      ? 'text-rose-500'
      : 'text-muted-foreground';

  return (
    <motion.div variants={itemVariants}>
      <Card className="glass-card">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="mt-1 text-3xl font-bold">{value}</p>
              {deltaText ? <p className={`mt-2 text-xs ${deltaClassName}`}>{deltaText}</p> : null}
            </div>
            <div className="rounded-xl bg-primary/10 p-3">
              <Icon className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ReflectionForm({ onSubmit, isSubmitting }) {
  const [mood, setMood] = useState('');
  const [formData, setFormData] = useState({
    accomplishments: '',
    challenges: '',
    tomorrowGoals: '',
  });

  const submit = async () => {
    if (!mood) {
      toast.error('Please select a mood');
      return;
    }

    try {
      await onSubmit({
        type: 'weekly',
        mood,
        accomplishments: formData.accomplishments,
        challenges: formData.challenges,
        tomorrowGoals: formData.tomorrowGoals,
      });

      setMood('');
      setFormData({
        accomplishments: '',
        challenges: '',
        tomorrowGoals: '',
      });
      toast.success('Reflection submitted');
    } catch (error) {
      toast.error(error.message || 'Failed to submit reflection');
    }
  };

  return (
    <Card className="glass-card h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Weekly Reflection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>How are you feeling?</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {moodOptions.map((item) => (
              <button
                key={`${item.emoji}-${item.label}`}
                type="button"
                onClick={() => setMood(item.value)}
                className={`rounded-lg border p-2 text-2xl ${mood === item.value ? 'border-primary bg-primary/10' : 'border-border'}`}
                title={item.label}
              >
                {item.emoji}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label>What went well this week?</Label>
          <Textarea
            className="mt-2"
            placeholder="Share your wins and achievements..."
            value={formData.accomplishments}
            onChange={(event) => setFormData((prev) => ({ ...prev, accomplishments: event.target.value }))}
          />
        </div>

        <div>
          <Label>What challenges did you face?</Label>
          <Textarea
            className="mt-2"
            placeholder="What topics or areas were difficult..."
            value={formData.challenges}
            onChange={(event) => setFormData((prev) => ({ ...prev, challenges: event.target.value }))}
          />
        </div>

        <div>
          <Label>What will you improve next week?</Label>
          <Textarea
            className="mt-2"
            placeholder="Your action plan for improvement..."
            value={formData.tomorrowGoals}
            onChange={(event) => setFormData((prev) => ({ ...prev, tomorrowGoals: event.target.value }))}
          />
        </div>

        <Button className="w-full" onClick={submit} disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Reflection'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function ReportsPage() {
  const {
    dashboard,
    reflections,
    isLoading,
    isRefreshing,
    isSubmitting,
    error,
    fetchReportsDashboard,
    submitReflection,
  } = useReportStore();

  const [timeRange, setTimeRange] = useState(7);

  useEffect(() => {
    fetchReportsDashboard().catch((loadError) => {
      toast.error(loadError.message || 'Failed to load reports');
    });
  }, [fetchReportsDashboard]);

  useEffect(() => {
    const refresh = () => {
      fetchReportsDashboard({ silent: true }).catch(() => {});
    };

    const intervalId = window.setInterval(refresh, 20000);
    const handleFocus = () => refresh();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') refresh();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchReportsDashboard]);

  const trendChartData = useMemo(() => {
    const source = dashboard?.trendSeries || [];
    const filtered = source.slice(-timeRange);

    return filtered.map((item) => ({
      ...item,
      label: timeRange === 7
        ? formatShortDate(item.date, { weekday: 'short' })
        : formatShortDate(item.date, { month: 'short', day: 'numeric' }),
    }));
  }, [dashboard, timeRange]);

  const timeDistributionData = useMemo(() => {
    return (dashboard?.timeDistribution || []).filter((item) => item.minutes > 0);
  }, [dashboard]);

  const monthlyOverviewData = useMemo(() => dashboard?.monthlyOverview || [], [dashboard]);

  const summaryCards = dashboard?.cards;
  const comparisonLabel = dashboard?.comparisonLabel || 'vs previous period';
  const lastUpdatedAt = dashboard?.lastUpdatedAt;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <div>
        <h1 className="flex items-center gap-3 text-3xl font-bold text-foreground">
          <BarChart3 className="h-8 w-8 text-primary" />
          Reports & Insights
        </h1>
        <p className="mt-1 text-muted-foreground">Track your progress and reflect on your journey with live backend data</p>
        {lastUpdatedAt ? (
          <p className="mt-2 text-xs text-muted-foreground">
            {isRefreshing ? 'Refreshing live data...' : `Last updated ${new Date(lastUpdatedAt).toLocaleTimeString()}`}
          </p>
        ) : null}
      </div>

      {error ? (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Avg. Productivity"
          value={`${summaryCards?.avgProductivity?.value || 0}%`}
          icon={TrendingUp}
          deltaText={`${formatDelta(summaryCards?.avgProductivity?.delta || 0, '%')} ${comparisonLabel}`}
          deltaTone={(summaryCards?.avgProductivity?.delta || 0) >= 0 ? 'positive' : 'negative'}
        />
        <StatCard
          title="Active Days"
          value={`${summaryCards?.activeDays?.value || 0}/${summaryCards?.activeDays?.total || 30}`}
          icon={Calendar}
          deltaText={`${formatDelta(summaryCards?.activeDays?.delta || 0)} ${comparisonLabel}`}
          deltaTone={(summaryCards?.activeDays?.delta || 0) >= 0 ? 'positive' : 'negative'}
        />
        <StatCard
          title="Tasks Completed"
          value={`${summaryCards?.tasksCompleted?.value || 0}`}
          icon={CheckCircle2}
          deltaText={`${formatDelta(summaryCards?.tasksCompleted?.delta || 0)} ${comparisonLabel}`}
          deltaTone={(summaryCards?.tasksCompleted?.delta || 0) >= 0 ? 'positive' : 'negative'}
        />
        <StatCard
          title="Total Hours"
          value={`${summaryCards?.totalHours?.value || 0}h`}
          icon={Clock}
          deltaText={`${formatDelta(summaryCards?.totalHours?.delta || 0, 'h')} ${comparisonLabel}`}
          deltaTone={(summaryCards?.totalHours?.delta || 0) >= 0 ? 'positive' : 'negative'}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle>Weekly Productivity Trend</CardTitle>
                <div className="flex items-center gap-2">
                  {trendRanges.map((range) => (
                    <Button
                      key={range.value}
                      size="sm"
                      variant={timeRange === range.value ? 'default' : 'outline'}
                      onClick={() => setTimeRange(range.value)}
                    >
                      {range.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="label" minTickGap={24} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="productivity" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="glass-card h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-primary" />
                Time Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={timeDistributionData}
                      dataKey="minutes"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={88}
                      paddingAngle={2}
                    >
                      {timeDistributionData.map((entry) => (
                        <Cell key={entry.key} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, _, item) => [`${Math.round((value || 0) / 60 * 10) / 10}h`, item?.payload?.name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 text-sm">
                {timeDistributionData.length === 0 ? (
                  <p className="text-muted-foreground">No tracked study time in the last 30 days yet.</p>
                ) : (
                  timeDistributionData.map((item) => (
                    <div key={item.key} className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="truncate">{item.name}</span>
                      </div>
                      <span>{item.percentage}%</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Monthly Overview (This Month)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyOverviewData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="label" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="productivity" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <ReflectionForm onSubmit={submitReflection} isSubmitting={isSubmitting} />
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Past Reflections</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(reflections || []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No reflections yet. Submit one and it will appear here.</p>
            ) : (
              (reflections || []).slice(0, 5).map((item) => (
                <div key={item._id} className="rounded-xl border border-border/60 bg-muted/20 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold">{formatDate(item.date)}</p>
                    <span className="text-lg leading-none">{item.moodEmoji || '🙂'}</span>
                  </div>
                  <div className="mt-2 space-y-1 text-sm">
                    <p>
                      <span className="text-emerald-500">✓ Wins:</span>{' '}
                      {(item.accomplishments || []).join(', ') || 'No wins noted'}
                    </p>
                    <p>
                      <span className="text-amber-500">⚡ Challenges:</span>{' '}
                      {(item.challenges || []).join(', ') || 'No challenges noted'}
                    </p>
                    <p>
                      <span className="text-primary">→ Next:</span>{' '}
                      {(item.tomorrowGoals || []).join(', ') || 'No next step noted'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </motion.div>

      {isLoading ? <p className="text-sm text-muted-foreground">Refreshing reports...</p> : null}
    </motion.div>
  );
}
