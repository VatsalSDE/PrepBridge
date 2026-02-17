import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, TrendingUp, TrendingDown, Calendar, Clock, Target,
  CheckCircle2, XCircle, PieChart, ArrowUp, ArrowDown, FileText,
  Lightbulb, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { containerVariants, itemVariants } from '@/utils/animations';
import { toast } from 'sonner';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';

const WEEKLY_DATA = [
  { day: 'Mon', productivity: 85, tasks: 6 },
  { day: 'Tue', productivity: 72, tasks: 5 },
  { day: 'Wed', productivity: 90, tasks: 7 },
  { day: 'Thu', productivity: 65, tasks: 4 },
  { day: 'Fri', productivity: 78, tasks: 5 },
  { day: 'Sat', productivity: 82, tasks: 6 },
  { day: 'Sun', productivity: 45, tasks: 3 }
];

const THREE_MONTHS_DATA = [
  { label: 'Dec W1', month: 'Dec', productivity: 65, tasks: 32 },
  { label: 'Dec W2', month: 'Dec', productivity: 68, tasks: 35 },
  { label: 'Dec W3', month: 'Dec', productivity: 70, tasks: 38 },
  { label: 'Dec W4', month: 'Dec', productivity: 72, tasks: 40 },
  { label: 'Jan W1', month: 'Jan', productivity: 75, tasks: 42 },
  { label: 'Jan W2', month: 'Jan', productivity: 78, tasks: 45 },
  { label: 'Jan W3', month: 'Jan', productivity: 80, tasks: 48 },
  { label: 'Jan W4', month: 'Jan', productivity: 82, tasks: 50 },
  { label: 'Feb W1', month: 'Feb', productivity: 85, tasks: 53 },
  { label: 'Feb W2', month: 'Feb', productivity: 80, tasks: 51 },
  { label: 'Feb W3', month: 'Feb', productivity: 82, tasks: 52 },
  { label: 'Feb W4', month: 'Feb', productivity: 78, tasks: 49 }
];

const SIX_MONTHS_DATA = [
  { label: 'Sep W1', month: 'Sep', productivity: 60, tasks: 25 },
  { label: 'Sep W3', month: 'Sep', productivity: 65, tasks: 28 },
  { label: 'Oct W1', month: 'Oct', productivity: 68, tasks: 30 },
  { label: 'Oct W3', month: 'Oct', productivity: 70, tasks: 32 },
  { label: 'Nov W1', month: 'Nov', productivity: 72, tasks: 35 },
  { label: 'Nov W3', month: 'Nov', productivity: 75, tasks: 38 },
  { label: 'Dec W1', month: 'Dec', productivity: 76, tasks: 40 },
  { label: 'Dec W3', month: 'Dec', productivity: 78, tasks: 42 },
  { label: 'Jan W1', month: 'Jan', productivity: 80, tasks: 45 },
  { label: 'Jan W3', month: 'Jan', productivity: 82, tasks: 48 },
  { label: 'Feb W1', month: 'Feb', productivity: 80, tasks: 50 },
  { label: 'Feb W3', month: 'Feb', productivity: 78, tasks: 49 }
];

const TWELVE_MONTHS_DATA = [
  { month: 'Mar', productivity: 55, tasks: 120 },
  { month: 'Apr', productivity: 58, tasks: 125 },
  { month: 'May', productivity: 62, tasks: 135 },
  { month: 'Jun', productivity: 64, tasks: 142 },
  { month: 'Jul', productivity: 63, tasks: 139 },
  { month: 'Aug', productivity: 65, tasks: 145 },
  { month: 'Sep', productivity: 68, tasks: 152 },
  { month: 'Oct', productivity: 72, tasks: 165 },
  { month: 'Nov', productivity: 75, tasks: 175 },
  { month: 'Dec', productivity: 78, tasks: 195 },
  { month: 'Jan', productivity: 82, tasks: 220 },
  { month: 'Feb', productivity: 78, tasks: 215 }
];

const MONTHLY_DATA = [
  { week: 'Week 1', productivity: 72 },
  { week: 'Week 2', productivity: 78 },
  { week: 'Week 3', productivity: 85 },
  { week: 'Week 4', productivity: 80 }
];

const MONTHLY_COMPARISON_DATA = [
  { month: 'Aug', productivity: 65, tasks: 45 },
  { month: 'Sep', productivity: 70, tasks: 52 },
  { month: 'Oct', productivity: 72, tasks: 58 },
  { month: 'Nov', productivity: 75, tasks: 61 },
  { month: 'Dec', productivity: 78, tasks: 72 },
  { month: 'Jan', productivity: 82, tasks: 78 },
  { month: 'Feb', productivity: 78, tasks: 68 }
];

const CATEGORY_DATA = [
  { name: 'DSA', value: 35, color: 'hsl(var(--primary))' },
  { name: 'Core CS', value: 25, color: 'hsl(var(--accent))' },
  { name: 'Development', value: 20, color: 'hsl(var(--success))' },
  { name: 'Aptitude', value: 12, color: 'hsl(var(--warning))' },
  { name: 'Soft Skills', value: 8, color: 'hsl(var(--streak))' }
];

const REFLECTIONS = [
  {
    date: 'December 22, 2024',
    wentWell: 'Completed all DSA tasks, solved 5 medium problems',
    challenges: 'Struggled with graph problems, need more practice',
    improvements: 'Will focus on BFS/DFS next week',
    mood: '😊'
  },
  {
    date: 'December 15, 2024',
    wentWell: 'Good consistency, maintained 7-day streak',
    challenges: 'Time management during aptitude practice',
    improvements: 'Set timer for each section',
    mood: '💪'
  }
];

function StatCard({ title, value, change, changeType, icon: Icon, color }) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="glass-card">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold mt-1">{value}</p>
              {change && (
                <div className={`flex items-center gap-1 mt-2 text-sm ${
                  changeType === 'up' ? 'text-success' : 'text-destructive'
                }`}>
                  {changeType === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  {change} from last week
                </div>
              )}
            </div>
            <div className={`p-3 rounded-xl bg-${color}/10`}>
              <Icon className={`w-6 h-6 text-${color}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function WeeklyReflectionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);
  const [formData, setFormData] = useState({
    wentWell: '',
    challenges: '',
    improvements: ''
  });

  const handleSubmit = () => {
    if (!formData.wentWell.trim() || !formData.challenges.trim() || !formData.improvements.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success('✨ Reflection saved! Great job reflecting on your week.');
      setFormData({ wentWell: '', challenges: '', improvements: '' });
      setSelectedMood(null);
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Weekly Reflection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>What went well this week?</Label>
          <Textarea placeholder="Share your wins and achievements..." className="mt-2" value={formData.wentWell} onChange={(e) => setFormData({...formData, wentWell: e.target.value})} />
        </div>
        <div>
          <Label>What challenges did you face?</Label>
          <Textarea placeholder="What topics or areas were difficult..." className="mt-2" value={formData.challenges} onChange={(e) => setFormData({...formData, challenges: e.target.value})} />
        </div>
        <div>
          <Label>What will you improve next week?</Label>
          <Textarea placeholder="Your action plan for improvement..." className="mt-2" value={formData.improvements} onChange={(e) => setFormData({...formData, improvements: e.target.value})} />
        </div>
        <div>
          <Label>How are you feeling? (Select emoji)</Label>
          <div className="flex gap-3 mt-2">
            {['😊', '😐', '😔', '💪', '🔥', '😴'].map(emoji => (
              <motion.button 
                key={emoji}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedMood(emoji)}
                className={`text-2xl p-2 rounded-lg transition-colors ${selectedMood === emoji ? 'bg-primary/20' : 'hover:bg-muted/50'}`}
              >
                {emoji}
              </motion.button>
            ))}
          </div>
        </div>
        <Button className="w-full" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Submit Reflection'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState('weekly');

  const getChartData = () => {
    switch(timeRange) {
      case '3months':
        return THREE_MONTHS_DATA;
      case '6months':
        return SIX_MONTHS_DATA;
      case '12months':
        return TWELVE_MONTHS_DATA;
      default:
        return WEEKLY_DATA;
    }
  };

  const getChartTitle = () => {
    switch(timeRange) {
      case '3months':
        return 'Productivity Trend (Last 3 Months)';
      case '6months':
        return 'Productivity Trend (Last 6 Months)';
      case '12months':
        return 'Productivity Trend (Last 12 Months)';
      default:
        return 'Weekly Productivity Trend';
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
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-primary" />
          Reports & Insights
        </h1>
        <p className="text-muted-foreground mt-1">Track your progress and reflect on your journey</p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Avg. Productivity"
          value="78%"
          change="+5%"
          changeType="up"
          icon={TrendingUp}
          color="success"
        />
        <StatCard
          title="Active Days"
          value="24/30"
          change="+3"
          changeType="up"
          icon={Calendar}
          color="primary"
        />
        <StatCard
          title="Tasks Completed"
          value="156"
          change="+12"
          changeType="up"
          icon={CheckCircle2}
          color="accent"
        />
        <StatCard
          title="Total Hours"
          value="68h"
          change="-2h"
          changeType="down"
          icon={Clock}
          color="warning"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weekly/Extended Productivity Chart */}
          <motion.div variants={itemVariants}>
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{getChartTitle()}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={timeRange === 'weekly' ? 'default' : 'outline'}
                      onClick={() => setTimeRange('weekly')}
                    >
                      1W
                    </Button>
                    <Button
                      size="sm"
                      variant={timeRange === '3months' ? 'default' : 'outline'}
                      onClick={() => setTimeRange('3months')}
                    >
                      3M
                    </Button>
                    <Button
                      size="sm"
                      variant={timeRange === '6months' ? 'default' : 'outline'}
                      onClick={() => setTimeRange('6months')}
                    >
                      6M
                    </Button>
                    <Button
                      size="sm"
                      variant={timeRange === '12months' ? 'default' : 'outline'}
                      onClick={() => setTimeRange('12months')}
                    >
                      1Y
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getChartData()}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis 
                        dataKey={timeRange === '12months' ? 'month' : timeRange === 'weekly' ? 'day' : 'label'}
                        tickFormatter={(value, index) => {
                          const data = getChartData();
                          if (timeRange === '12months' || timeRange === 'weekly') {
                            return value;
                          }
                          // For 3months and 6months, show month name only when it changes
                          if (index === 0) return data[0].month;
                          if (data[index].month !== data[index - 1].month) {
                            return data[index].month;
                          }
                          return '';
                        }}
                      />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="productivity" 
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

          {/* Monthly Overview (This Month) */}
          <motion.div variants={itemVariants}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Monthly Overview (This Month)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MONTHLY_DATA}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar 
                        dataKey="productivity" 
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Past Reflections */}
          <motion.div variants={itemVariants}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Past Reflections</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {REFLECTIONS.map((reflection, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-muted/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{reflection.date}</span>
                      <span className="text-2xl">{reflection.mood}</span>
                    </div>
                    <div className="text-sm space-y-1">
                      <p><span className="text-success">✓ Wins:</span> <span className="text-muted-foreground">{reflection.wentWell}</span></p>
                      <p><span className="text-warning">⚡ Challenges:</span> <span className="text-muted-foreground">{reflection.challenges}</span></p>
                      <p><span className="text-primary">→ Next:</span> <span className="text-muted-foreground">{reflection.improvements}</span></p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Category Distribution */}
          <motion.div variants={itemVariants}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Time Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={CATEGORY_DATA}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                        labelLine={false}
                      >
                        {CATEGORY_DATA.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {CATEGORY_DATA.map((cat, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
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

          {/* Weekly Reflection Form */}
          <motion.div variants={itemVariants}>
            <WeeklyReflectionForm />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
