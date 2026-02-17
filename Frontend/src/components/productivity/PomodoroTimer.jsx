import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, RotateCcw, Coffee, Brain, SkipForward,
  Volume2, VolumeX, Settings, X, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';

const DEFAULT_SETTINGS = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsUntilLongBreak: 4,
};

const TIMER_MODES = {
  WORK: 'work',
  SHORT_BREAK: 'shortBreak',
  LONG_BREAK: 'longBreak',
};

export default function PomodoroTimer({ currentTask, onSessionComplete }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [mode, setMode] = useState(TIMER_MODES.WORK);
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tempSettings, setTempSettings] = useState(settings);

  const getDuration = useCallback((timerMode) => {
    switch (timerMode) {
      case TIMER_MODES.WORK:
        return settings.workDuration * 60;
      case TIMER_MODES.SHORT_BREAK:
        return settings.shortBreakDuration * 60;
      case TIMER_MODES.LONG_BREAK:
        return settings.longBreakDuration * 60;
      default:
        return settings.workDuration * 60;
    }
  }, [settings]);

  const playSound = useCallback(() => {
    if (soundEnabled) {
      // Create a simple beep sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;
      
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, 200);
    }
  }, [soundEnabled]);

  const handleTimerComplete = useCallback(() => {
    playSound();
    
    if (mode === TIMER_MODES.WORK) {
      const newCompletedSessions = completedSessions + 1;
      setCompletedSessions(newCompletedSessions);
      setTotalFocusTime(prev => prev + settings.workDuration);
      
      if (onSessionComplete) {
        onSessionComplete(settings.workDuration);
      }
      
      toast.success(`🍅 Pomodoro #${newCompletedSessions} complete!`);
      
      // Determine next break type
      if (newCompletedSessions % settings.sessionsUntilLongBreak === 0) {
        setMode(TIMER_MODES.LONG_BREAK);
        setTimeLeft(settings.longBreakDuration * 60);
        toast('☕ Time for a long break!', { icon: '🎉' });
      } else {
        setMode(TIMER_MODES.SHORT_BREAK);
        setTimeLeft(settings.shortBreakDuration * 60);
        toast('Take a short break!', { icon: '☕' });
      }
    } else {
      // Break finished
      setMode(TIMER_MODES.WORK);
      setTimeLeft(settings.workDuration * 60);
      toast('Break over! Ready to focus? 💪', { icon: '🧠' });
    }
    
    setIsRunning(false);
  }, [mode, completedSessions, settings, playSound, onSessionComplete]);

  useEffect(() => {
    let interval;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }
    
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, handleTimerComplete]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
    if (!isRunning) {
      playSound();
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getDuration(mode));
  };

  const skipToNext = () => {
    if (mode === TIMER_MODES.WORK) {
      // Skip work session (doesn't count)
      const nextMode = (completedSessions + 1) % settings.sessionsUntilLongBreak === 0 
        ? TIMER_MODES.LONG_BREAK 
        : TIMER_MODES.SHORT_BREAK;
      setMode(nextMode);
      setTimeLeft(getDuration(nextMode));
    } else {
      // Skip break
      setMode(TIMER_MODES.WORK);
      setTimeLeft(settings.workDuration * 60);
    }
    setIsRunning(false);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setTimeLeft(getDuration(newMode));
    setIsRunning(false);
  };

  const saveSettings = () => {
    setSettings(tempSettings);
    setTimeLeft(tempSettings.workDuration * 60);
    setMode(TIMER_MODES.WORK);
    setIsRunning(false);
    setSettingsOpen(false);
    toast.success('Settings saved!');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((getDuration(mode) - timeLeft) / getDuration(mode)) * 100;

  const getModeColor = () => {
    switch (mode) {
      case TIMER_MODES.WORK:
        return 'from-primary to-accent';
      case TIMER_MODES.SHORT_BREAK:
        return 'from-success to-emerald-400';
      case TIMER_MODES.LONG_BREAK:
        return 'from-blue-500 to-cyan-400';
      default:
        return 'from-primary to-accent';
    }
  };

  const getModeLabel = () => {
    switch (mode) {
      case TIMER_MODES.WORK:
        return 'Focus Time';
      case TIMER_MODES.SHORT_BREAK:
        return 'Short Break';
      case TIMER_MODES.LONG_BREAK:
        return 'Long Break';
      default:
        return 'Focus Time';
    }
  };

  return (
    <Card className="glass-card overflow-hidden">
      {/* Mode indicator bar */}
      <div className={`h-1 bg-gradient-to-r ${getModeColor()}`} />
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            {mode === TIMER_MODES.WORK ? (
              <Brain className="w-5 h-5 text-primary" />
            ) : (
              <Coffee className="w-5 h-5 text-success" />
            )}
            Pomodoro Timer
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="h-8 w-8"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4 text-muted-foreground" />
              )}
            </Button>
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Timer Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Focus Duration (min)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="60"
                        value={tempSettings.workDuration}
                        onChange={(e) => setTempSettings(prev => ({
                          ...prev,
                          workDuration: parseInt(e.target.value) || 25
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Short Break (min)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="30"
                        value={tempSettings.shortBreakDuration}
                        onChange={(e) => setTempSettings(prev => ({
                          ...prev,
                          shortBreakDuration: parseInt(e.target.value) || 5
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Long Break (min)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="60"
                        value={tempSettings.longBreakDuration}
                        onChange={(e) => setTempSettings(prev => ({
                          ...prev,
                          longBreakDuration: parseInt(e.target.value) || 15
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Sessions until long break</Label>
                      <Input
                        type="number"
                        min="2"
                        max="10"
                        value={tempSettings.sessionsUntilLongBreak}
                        onChange={(e) => setTempSettings(prev => ({
                          ...prev,
                          sessionsUntilLongBreak: parseInt(e.target.value) || 4
                        }))}
                      />
                    </div>
                  </div>
                  <Button onClick={saveSettings} className="w-full">
                    <Check className="w-4 h-4 mr-2" />
                    Save Settings
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Mode Tabs */}
        <div className="flex gap-2 p-1 bg-muted/50 rounded-lg">
          <button
            onClick={() => switchMode(TIMER_MODES.WORK)}
            className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all ${
              mode === TIMER_MODES.WORK 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Focus
          </button>
          <button
            onClick={() => switchMode(TIMER_MODES.SHORT_BREAK)}
            className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all ${
              mode === TIMER_MODES.SHORT_BREAK 
                ? 'bg-success text-white shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Short
          </button>
          <button
            onClick={() => switchMode(TIMER_MODES.LONG_BREAK)}
            className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all ${
              mode === TIMER_MODES.LONG_BREAK 
                ? 'bg-blue-500 text-white shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Long
          </button>
        </div>

        {/* Timer Display */}
        <div className="relative flex flex-col items-center py-6">
          {/* Circular Progress */}
          <div className="relative w-48 h-48">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="8"
              />
              <motion.circle
                cx="96"
                cy="96"
                r="88"
                fill="none"
                stroke={mode === TIMER_MODES.WORK 
                  ? "hsl(var(--primary))" 
                  : mode === TIMER_MODES.SHORT_BREAK 
                    ? "hsl(var(--success))" 
                    : "hsl(217 91% 60%)"
                }
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={553}
                strokeDashoffset={553 - (553 * progress / 100)}
                initial={false}
                animate={{ strokeDashoffset: 553 - (553 * progress / 100) }}
                transition={{ duration: 0.5 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span 
                className="text-5xl font-bold font-mono"
                key={timeLeft}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.1 }}
              >
                {formatTime(timeLeft)}
              </motion.span>
              <span className="text-sm text-muted-foreground mt-1">
                {getModeLabel()}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 mt-6">
            <Button
              variant="outline"
              size="icon"
              onClick={resetTimer}
              className="h-10 w-10"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                onClick={toggleTimer}
                className={`h-14 w-14 rounded-full ${
                  mode === TIMER_MODES.WORK 
                    ? 'bg-primary hover:bg-primary/90' 
                    : mode === TIMER_MODES.SHORT_BREAK
                      ? 'bg-success hover:bg-success/90'
                      : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {isRunning ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-0.5" />
                )}
              </Button>
            </motion.div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={skipToNext}
              className="h-10 w-10"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Current Task */}
        {currentTask && (
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-xs text-muted-foreground mb-1">Working on:</p>
            <p className="text-sm font-medium truncate">{currentTask}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/30 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              {[...Array(settings.sessionsUntilLongBreak)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < (completedSessions % settings.sessionsUntilLongBreak)
                      ? 'bg-primary'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            <p className="text-lg font-bold">{completedSessions}</p>
            <p className="text-xs text-muted-foreground">Pomodoros</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 text-center">
            <p className="text-lg font-bold">{totalFocusTime}</p>
            <p className="text-xs text-muted-foreground">Minutes focused</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
