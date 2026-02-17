import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Calendar as CalendarIcon, TrendingUp, X, CheckCircle2, Circle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { generateHeatmapData } from '@/utils/helpers';
import useTaskStore from '@/store/taskStore';
import { format, parseISO, isSameDay } from 'date-fns';

// Sample historical tasks data (in real app, this would come from the store)
const HISTORICAL_TASKS = [
  { id: '1', title: 'Solve 5 LeetCode problems', category: 'DSA', completed: true, date: '2024-12-27', estimatedTime: 120 },
  { id: '2', title: 'Complete OS chapter', category: 'Core CS', completed: true, date: '2024-12-27', estimatedTime: 60 },
  { id: '3', title: 'Practice aptitude questions', category: 'Aptitude', completed: false, date: '2024-12-27', estimatedTime: 45 },
  { id: '4', title: 'Build portfolio project', category: 'Tech Stack', completed: true, date: '2024-12-26', estimatedTime: 180 },
  { id: '5', title: 'Review DBMS concepts', category: 'Core CS', completed: true, date: '2024-12-26', estimatedTime: 90 },
  { id: '6', title: 'Array problems practice', category: 'DSA', completed: true, date: '2024-12-25', estimatedTime: 60 },
  { id: '7', title: 'System Design basics', category: 'Tech Stack', completed: false, date: '2024-12-25', estimatedTime: 120 },
  { id: '8', title: 'Graph algorithms', category: 'DSA', completed: true, date: '2024-12-24', estimatedTime: 90 },
  { id: '9', title: 'Networking concepts', category: 'Core CS', completed: true, date: '2024-12-24', estimatedTime: 60 },
  { id: '10', title: 'Verbal ability practice', category: 'Aptitude', completed: true, date: '2024-12-24', estimatedTime: 30 },
];

const getCategoryColor = (category) => {
  const colors = {
    'DSA': 'bg-primary/20 text-primary',
    'Core CS': 'bg-accent/20 text-accent',
    'Aptitude': 'bg-warning/20 text-warning',
    'Tech Stack': 'bg-success/20 text-success',
  };
  return colors[category] || 'bg-muted text-muted-foreground';
};

// Day Tasks Popup Component
function DayTasksPopup({ date, tasks, onClose }) {
  const completedCount = tasks.filter(t => t.completed).length;
  const totalTime = tasks.reduce((acc, t) => acc + t.estimatedTime, 0);

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
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md"
      >
        <Card className="overflow-hidden border-2 border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  {format(date, 'EEEE, MMMM d, yyyy')}
                </CardTitle>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    {completedCount}/{tasks.length} completed
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {Math.floor(totalTime / 60)}h {totalTime % 60}m
                  </span>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 max-h-[60vh] overflow-y-auto">
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No tasks recorded for this day</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task, idx) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`p-3 rounded-lg border transition-all ${
                      task.completed 
                        ? 'bg-success/5 border-success/20' 
                        : 'bg-muted/30 border-border/50'
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
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className={`text-xs ${getCategoryColor(task.category)}`}>
                            {task.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {task.estimatedTime} min
                          </span>
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

const CalendarPage = () => {
  const streak = useTaskStore((state) => state.streak);
  const longestStreak = useTaskStore((state) => state.longestStreak);
  const storeTasks = useTaskStore((state) => state.tasks);
  const heatmapData = generateHeatmapData(365);
  
  const [selectedDate, setSelectedDate] = useState(null);

  const today = new Date();
  const startDate = new Date(today);
  startDate.setFullYear(startDate.getFullYear() - 1);

  // Combine store tasks with historical data
  const allTasks = [...HISTORICAL_TASKS, ...storeTasks];

  // Get tasks for selected date
  const getTasksForDate = (date) => {
    if (!date) return [];
    return allTasks.filter(task => {
      const taskDate = task.date || task.createdAt?.split('T')[0];
      return taskDate && isSameDay(parseISO(taskDate), date);
    });
  };

  const handleDayClick = (value) => {
    if (value && value.date) {
      setSelectedDate(new Date(value.date));
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Calendar & History</h1>
        <p className="text-muted-foreground">Track your consistency and view past performance</p>
      </motion.div>

      {/* Streak Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-streak/30 bg-gradient-to-br from-streak/10 to-transparent">
            <CardContent className="p-5 flex items-center gap-4">
              <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, -3, 3, 0] }} transition={{ duration: 2, repeat: Infinity }} className="w-12 h-12 rounded-xl bg-streak/20 flex items-center justify-center">
                <Flame className="h-6 w-6 text-streak" />
              </motion.div>
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold text-foreground">{streak} days</p>
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
                <p className="text-2xl font-bold text-foreground">156 days</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Heatmap */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Productivity Heatmap</span>
              <span className="text-sm font-normal text-muted-foreground">Click on a day to view tasks</span>
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
                  return `${value.date}: ${value.count} tasks completed`;
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

      {/* Day Tasks Popup */}
      <AnimatePresence>
        {selectedDate && (
          <DayTasksPopup
            date={selectedDate}
            tasks={getTasksForDate(selectedDate)}
            onClose={() => setSelectedDate(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CalendarPage;
