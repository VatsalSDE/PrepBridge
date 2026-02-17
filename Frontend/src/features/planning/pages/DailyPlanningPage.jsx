import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Clock, 
  CheckCircle2, 
  Trash2, 
  Edit2,
  GripVertical,
  AlertCircle,
  Sparkles,
  Timer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import useTaskStore from '@/store/taskStore';
import { TASK_CATEGORIES, PRIORITY_LEVELS } from '@/utils/constants';
import { getProductivityColor, getEncouragementMessage } from '@/utils/helpers';
import toast from 'react-hot-toast';
import EmptyState from '@/components/common/EmptyState';
import PomodoroTimer from '@/components/productivity/PomodoroTimer';

const initialTasks = [
  { id: '1', title: 'Solve 5 LeetCode problems (Two Pointers)', category: 'dsa', priority: 'high', estimatedTime: 90, completed: false },
  { id: '2', title: 'Review DBMS Normalization concepts', category: 'core-cs', priority: 'medium', estimatedTime: 45, completed: true },
  { id: '3', title: 'Build REST API endpoints for user module', category: 'development', priority: 'high', estimatedTime: 120, completed: false },
  { id: '4', title: 'Practice verbal reasoning - 20 questions', category: 'aptitude', priority: 'low', estimatedTime: 30, completed: false },
];

const DailyPlanningPage = () => {
  const [tasks, setTasks] = useState(initialTasks);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [activeTaskForTimer, setActiveTaskForTimer] = useState(null);
  const [pomodoroMinutes, setPomodoroMinutes] = useState(0);
  const [newTask, setNewTask] = useState({
    title: '',
    category: 'dsa',
    priority: 'medium',
    estimatedTime: 60,
  });

  const handlePomodoroComplete = (minutes) => {
    setPomodoroMinutes(prev => prev + minutes);
  };

  const setTaskForTimer = (task) => {
    setActiveTaskForTimer(task.id === activeTaskForTimer ? null : task.id);
  };

  const activeTask = tasks.find(t => t.id === activeTaskForTimer);

  const completedTasks = tasks.filter(t => t.completed).length;
  const productivity = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const totalTime = tasks.reduce((acc, t) => acc + t.estimatedTime, 0);
  const completedTime = tasks.filter(t => t.completed).reduce((acc, t) => acc + t.estimatedTime, 0);

  const getCategoryInfo = (categoryId) => {
    return TASK_CATEGORIES.find(c => c.id === categoryId) || TASK_CATEGORIES[0];
  };

  const getPriorityInfo = (priorityId) => {
    return PRIORITY_LEVELS.find(p => p.id === priorityId) || PRIORITY_LEVELS[1];
  };

  const toggleTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, completed: !task.completed }
        : task
    ));
    
    if (!task.completed) {
      toast.success('🎉 Task completed! Great work!');
    }
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    toast.success('Task deleted');
  };

  const startEditTask = (task) => {
    setEditingTask({ ...task });
    setIsEditDialogOpen(true);
  };

  const saveEditTask = () => {
    if (!editingTask.title.trim()) {
      toast.error('Please enter a task title');
      return;
    }
    setTasks(tasks.map(t => t.id === editingTask.id ? editingTask : t));
    setIsEditDialogOpen(false);
    setEditingTask(null);
    toast.success('✏️ Task updated!');
  };

  const addTask = () => {
    if (!newTask.title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    const task = {
      id: Date.now().toString(),
      ...newTask,
      completed: false,
    };

    setTasks([...tasks, task]);
    setNewTask({
      title: '',
      category: 'dsa',
      priority: 'medium',
      estimatedTime: 60,
    });
    setIsDialogOpen(false);
    toast.success('📝 Task added to your plan!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Daily Plan</h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
              <DialogDescription>
                Plan what you want to accomplish today
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Solve 5 LeetCode problems"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={newTask.category}
                    onValueChange={(value) => setNewTask({ ...newTask, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_LEVELS.map((priority) => (
                        <SelectItem key={priority.id} value={priority.id}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Estimated Time (minutes)</Label>
                <Input
                  id="time"
                  type="number"
                  min="5"
                  max="480"
                  value={newTask.estimatedTime}
                  onChange={(e) => setNewTask({ ...newTask, estimatedTime: parseInt(e.target.value) || 60 })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="hero" onClick={addTask}>
                Add Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">Productivity</span>
                <span className={`text-2xl font-bold text-${getProductivityColor(productivity)}`}>
                  {productivity}%
                </span>
              </div>
              <Progress value={productivity} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {getEncouragementMessage(productivity)}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-muted-foreground">Tasks</span>
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <p className="text-2xl font-bold text-foreground">
                {completedTasks} / {tasks.length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {tasks.length - completedTasks} remaining
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-muted-foreground">Time Planned</span>
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">
                {Math.floor(totalTime / 60)}h {totalTime % 60}m
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.floor(completedTime / 60)}h {completedTime % 60}m completed
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Grid - Tasks + Pomodoro */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Tasks */}
        <div className="lg:col-span-2 space-y-4">

          {/* Task List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Today's Tasks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {tasks.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12"
                    >
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground mb-4">No tasks planned for today</p>
                      <Button variant="hero" onClick={() => setIsDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Task
                      </Button>
                    </motion.div>
                  ) : (
                    tasks.map((task, index) => {
                      const category = getCategoryInfo(task.category);
                      const priority = getPriorityInfo(task.priority);
                      const isActiveForTimer = task.id === activeTaskForTimer;
                      
                      return (
                        <motion.div
                          key={task.id}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20, height: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`group flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${
                            isActiveForTimer
                              ? 'bg-primary/5 border-primary/30 ring-2 ring-primary/20'
                              : task.completed 
                                ? 'bg-success/5 border-success/20' 
                                : 'bg-card border-border hover:border-primary/30 hover:shadow-md'
                          }`}
                        >
                          {/* Drag Handle */}
                          <div className="cursor-grab text-muted-foreground/50 hover:text-muted-foreground">
                            <GripVertical className="h-5 w-5" />
                          </div>

                          {/* Checkbox */}
                          <button
                            onClick={() => toggleTask(task.id)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                              task.completed 
                                ? 'bg-success border-success' 
                                : 'border-muted-foreground/30 hover:border-primary'
                            }`}
                          >
                            {task.completed && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                              >
                                <CheckCircle2 className="h-4 w-4 text-white" />
                              </motion.div>
                            )}
                          </button>

                          {/* Task Content */}
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium ${
                              task.completed ? 'text-muted-foreground line-through' : 'text-foreground'
                            }`}>
                              {task.title}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${category.color} text-white`}>
                                {category.label}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${priority.color} text-white`}>
                                {priority.label}
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {task.estimatedTime}m
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1">
                            {!task.completed && (
                              <Button 
                                variant={isActiveForTimer ? "default" : "ghost"}
                                size="iconSm" 
                                className={isActiveForTimer ? "bg-primary" : "text-muted-foreground hover:text-primary"}
                                onClick={() => setTaskForTimer(task)}
                                title="Focus on this task"
                              >
                                <Timer className="h-4 w-4" />
                              </Button>
                            )}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="iconSm" className="text-muted-foreground hover:text-primary" onClick={() => startEditTask(task)}>
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="iconSm" 
                                className="text-muted-foreground hover:text-destructive"
                                onClick={() => deleteTask(task.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column - Pomodoro Timer */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-1"
        >
          <div className="sticky top-24">
            <PomodoroTimer 
              currentTask={activeTask?.title}
              onSessionComplete={handlePomodoroComplete}
            />
            
            {/* Focus Stats */}
            {pomodoroMinutes > 0 && (
              <Card className="mt-4 glass-card">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">Today's Focus Time</p>
                  <p className="text-2xl font-bold text-primary">
                    {Math.floor(pomodoroMinutes / 60)}h {pomodoroMinutes % 60}m
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </motion.div>
      </div>

      {/* Time Deadline Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
      >
        <AlertCircle className="h-4 w-4" />
        <span>Tasks can only be marked complete before 11:59 PM today</span>
      </motion.div>

      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update your task details</DialogDescription>
          </DialogHeader>
          {editingTask && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Task Title</Label>
                <Input
                  id="edit-title"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={editingTask.category} onValueChange={(value) => setEditingTask({ ...editingTask, category: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TASK_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={editingTask.priority} onValueChange={(value) => setEditingTask({ ...editingTask, priority: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PRIORITY_LEVELS.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-time">Estimated Time (minutes)</Label>
                <Input
                  id="edit-time"
                  type="number"
                  min="5"
                  max="480"
                  value={editingTask.estimatedTime}
                  onChange={(e) => setEditingTask({ ...editingTask, estimatedTime: parseInt(e.target.value) || 60 })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button variant="hero" onClick={saveEditTask}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DailyPlanningPage;
