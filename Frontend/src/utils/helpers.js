import { format, isToday, isYesterday, differenceInDays } from 'date-fns';

export const formatDate = (date) => {
  const d = new Date(date);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMM d, yyyy');
};

export const formatTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

export const getProductivityColor = (percentage) => {
  if (percentage >= 80) return 'success';
  if (percentage >= 50) return 'warning';
  return 'destructive';
};

export const getProductivityLabel = (percentage) => {
  if (percentage >= 80) return 'Excellent';
  if (percentage >= 60) return 'Good';
  if (percentage >= 40) return 'Moderate';
  return 'Needs Improvement';
};

export const generateHeatmapData = (days = 365) => {
  const data = [];
  const today = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Random productivity for demo
    const random = Math.random();
    let count = 0;
    if (random > 0.3) count = 1;
    if (random > 0.5) count = 2;
    if (random > 0.7) count = 3;
    if (random > 0.9) count = 4;
    
    // Make some days empty
    if (random < 0.15) count = 0;
    
    data.push({
      date: format(date, 'yyyy-MM-dd'),
      count,
      productivity: count * 25,
    });
  }
  
  return data;
};

export const getStreakMessage = (streak) => {
  if (streak === 0) return "Start your streak today!";
  if (streak < 3) return "Great start! Keep going!";
  if (streak < 7) return "You're building momentum!";
  if (streak < 14) return "Impressive consistency!";
  if (streak < 30) return "You're on fire! 🔥";
  return "Legendary streak! 🏆";
};

export const getEncouragementMessage = (productivity) => {
  if (productivity >= 90) return "Outstanding work! You're crushing it! 🌟";
  if (productivity >= 80) return "Excellent day! Keep this energy! 💪";
  if (productivity >= 60) return "Good progress! Every step counts! 📈";
  if (productivity >= 40) return "You showed up today. That matters! ✨";
  if (productivity > 0) return "Small progress is still progress! 🌱";
  return "Tomorrow is a fresh start! You've got this! 🌅";
};

export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};
