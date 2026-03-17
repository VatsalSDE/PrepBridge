import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Calendar as CalendarIcon, TrendingUp, X, CheckCircle2, Circle, Clock, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { format } from 'date-fns';
import useCalendarStore from '@/store/calendarStore';
import { formatTime } from '@/utils/helpers';

const getCategoryColor = (category) => {
  const colors = {
    DSA: 'bg-primary/20 text-primary',
    'Core CS': 'bg-accent/20 text-accent',
    Aptitude: 'bg-warning/20 text-warning',
    Development: 'bg-success/20 text-success',
    'Soft Skills': 'bg-secondary/30 text-secondary-foreground',
    'Mock Interview': 'bg-orange-500/20 text-orange-500',
    Project: 'bg-cyan-500/20 text-cyan-500',
  };
  return colors[category] || 'bg-muted text-muted-foreground';
};

function DayTasksPopup({ selectedDay, isLoading, onClose }) {
  const popupDate = selectedDay?.date ? new Date(selectedDay.date) : new Date();
  const tasks = selectedDay?.tasks || [];
  const activity = selectedDay?.activity || {
    tasksCompleted: 0,
    tasksTotal: 0,
    minutesSpent: 0,
    productivityScore: 0,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-2xl"
      >
        <Card className="overflow-hidden border-2 border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 pb-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  {format(popupDate, 'EEEE, MMMM d, yyyy')}
                </CardTitle>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    {activity.tasksCompleted}/{activity.tasksTotal} completed
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatTime(activity.minutesSpent || 0)}
                  </span>
                  <span className="flex items-center gap-1">
                    <BarChart3 className="w-4 h-4" />
                    {activity.productivityScore || 0}% productivity
                  </span>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 max-h-[70vh] overflow-y-auto">
            {isLoading ? (
              <div className="py-10 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No tasks recorded for this day</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className={`p-3 rounded-lg border transition-all ${
                      task.completed ? 'bg-success/5 border-success/20' : 'bg-muted/30 border-border/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </p>
                        {task.description ? (
                          <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                        ) : null}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge variant="secondary" className={`text-xs ${getCategoryColor(task.category)}`}>
                            {task.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Planned: {formatTime(task.estimatedTime || 0)}
                          </span>
                          {task.actualTime > 0 ? (
                            <span className="text-xs text-muted-foreground">
                              Actual: {formatTime(task.actualTime)}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default function CalendarPage() {
  const {
    heatmapData,
    activeDays,
    streaks,
    selectedDay,
    isLoading,
    isDayLoading,
    error,
    fetchCalendarOverview,
    fetchDayDetails,
    clearSelectedDay,
  } = useCalendarStore();

  useEffect(() => {
    fetchCalendarOverview();

    const onFocus = () => {
      fetchCalendarOverview({ silent: true }).catch(() => {});
    };

    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [fetchCalendarOverview]);

  const today = new Date();
  const startDate = new Date(today);
  startDate.setFullYear(startDate.getFullYear() - 1);

  const currentStreak = streaks?.currentStreak || 0;
  const longestStreak = streaks?.longestStreak || 0;

  const handleDayClick = (value) => {
    if (!value?.date) return;
    fetchDayDetails(value.date).catch(() => {});
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Calendar & History</h1>
        <p className="text-muted-foreground">Track your consistency and view past performance</p>
      </motion.div>

      {error ? (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      ) : null}

      <div className="grid sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-streak/30 bg-gradient-to-br from-streak/10 to-transparent">
            <CardContent className="p-5 flex items-center gap-4">
              <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, -3, 3, 0] }} transition={{ duration: 2, repeat: Infinity }} className="w-12 h-12 rounded-xl bg-streak/20 flex items-center justify-center">
                <Flame className="h-6 w-6 text-streak" />
              </motion.div>
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold text-foreground">{currentStreak} days</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Longest Streak</p>
                <p className="text-2xl font-bold text-foreground">{longestStreak} days</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <CalendarIcon className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Days</p>
                <p className="text-2xl font-bold text-foreground">{activeDays} days</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span>Productivity Heatmap</span>
              <span className="text-xs sm:text-sm font-normal text-muted-foreground">Click on a day to view tasks</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto pb-4">
            <div className="min-w-[800px]">
              <CalendarHeatmap
                startDate={startDate}
                endDate={today}
                values={heatmapData}
                classForValue={(value) => {
                  if (!value || value.count === 0) return 'color-empty';
                  return `color-scale-${Math.min(value.count, 4)}`;
                }}
                showWeekdayLabels
                gutterSize={3}
                onClick={handleDayClick}
                titleForValue={(value) => {
                  if (!value) return 'No activity';
                  return `${value.date}: ${value.tasksCompleted || 0} tasks completed, ${value.score || 0}% productivity`;
                }}
              />
            </div>
            <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-sm heatmap-empty" />
                <div className="w-3 h-3 rounded-sm heatmap-low" />
                <div className="w-3 h-3 rounded-sm heatmap-medium" />
                <div className="w-3 h-3 rounded-sm heatmap-high" />
              </div>
              <span>More</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <AnimatePresence>
        {selectedDay ? (
          <DayTasksPopup
            selectedDay={selectedDay}
            isLoading={isDayLoading}
            onClose={clearSelectedDay}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
