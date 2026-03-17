import { create } from 'zustand';
import { format } from 'date-fns';
import calendarService from '@/services/calendarService';
import achievementService from '@/services/achievementService';

const categoryLabels = {
  dsa: 'DSA',
  'core-cs': 'Core CS',
  development: 'Development',
  aptitude: 'Aptitude',
  'soft-skills': 'Soft Skills',
  'mock-interview': 'Mock Interview',
  project: 'Project',
};

const normalizeHeatmapEntry = (entry) => {
  const score = entry?.score || 0;
  let count = 0;

  if (score > 0) count = 1;
  if (score >= 30) count = 2;
  if (score >= 55) count = 3;
  if (score >= 80) count = 4;

  return {
    date: format(new Date(entry.date), 'yyyy-MM-dd'),
    score,
    count,
    tasksCompleted: entry?.tasksCompleted || 0,
  };
};

const normalizeTask = (task) => ({
  id: task?._id || task?.id,
  title: task?.title || '',
  description: task?.description || '',
  category: categoryLabels[task?.category] || task?.category || 'Other',
  priority: task?.priority || 'medium',
  estimatedTime: task?.estimatedTime || 0,
  actualTime: task?.actualTime || 0,
  completed: Boolean(task?.completed),
  date: task?.date,
  createdAt: task?.createdAt,
});

const useCalendarStore = create((set) => ({
  heatmapData: [],
  activeDays: 0,
  streaks: null,
  selectedDate: null,
  selectedDay: null,
  isLoading: false,
  isDayLoading: false,
  error: null,

  fetchCalendarOverview: async ({ silent = false } = {}) => {
    if (!silent) {
      set({ isLoading: true, error: null });
    }

    try {
      const [heatmapRes, streaksRes] = await Promise.all([
        calendarService.getHeatmap(),
        achievementService.getStreaks(),
      ]);

      const heatmapData = (heatmapRes?.data || []).map(normalizeHeatmapEntry);
      const activeDays = heatmapData.filter((entry) => entry.count > 0 || entry.tasksCompleted > 0).length;

      set({
        heatmapData,
        activeDays,
        streaks: streaksRes?.data || null,
        isLoading: false,
        error: null,
      });

      return heatmapData;
    } catch (error) {
      set({ isLoading: false, error: error.message || 'Failed to load calendar' });
      throw error;
    }
  },

  fetchDayDetails: async (date) => {
    set({ isDayLoading: true, error: null, selectedDate: date });
    try {
      const response = await calendarService.getDayDetails(date);
      const payload = response?.data || {};
      const selectedDay = {
        date: payload.date,
        activity: payload.activity || {
          tasksCompleted: 0,
          tasksTotal: 0,
          minutesSpent: 0,
          productivityScore: 0,
        },
        tasks: (payload.tasks || []).map(normalizeTask),
      };

      set({
        selectedDay,
        isDayLoading: false,
        error: null,
      });

      return selectedDay;
    } catch (error) {
      set({ isDayLoading: false, error: error.message || 'Failed to load day details' });
      throw error;
    }
  },

  clearSelectedDay: () => set({ selectedDay: null, selectedDate: null, isDayLoading: false }),
  clearError: () => set({ error: null }),
}));

export default useCalendarStore;
