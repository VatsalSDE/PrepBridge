import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import taskService from '@/services/taskService';
import useProfileStore from '@/store/profileStore';

const normalizeTask = (task) => ({
  id: task._id || task.id,
  title: task.title,
  description: task.description || '',
  category: task.category || 'dsa',
  priority: task.priority || 'medium',
  estimatedTime: task.estimatedTime || 60,
  actualTime: task.actualTime || 0,
  completed: Boolean(task.completed),
  createdAt: task.createdAt,
  completedAt: task.completedAt,
  date: task.date,
});

const useTaskStore = create(
  persist(
    (set) => ({
      tasks: [],
      todaysTasks: [],
      streak: 0,
      longestStreak: 0,
      isLoading: false,
      error: null,

      fetchTodayTasks: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await taskService.getTodayTasks();
          const normalized = (response?.data || []).map(normalizeTask);
          set({
            tasks: normalized,
            todaysTasks: normalized,
            isLoading: false,
            error: null,
          });
          return normalized;
        } catch (error) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      addTask: async (task) => {
        set({ isLoading: true, error: null });
        try {
          const response = await taskService.createTask(task);
          const createdTask = normalizeTask(response?.data || {});

          set((state) => ({
            tasks: [...state.tasks, createdTask],
            todaysTasks: [...state.todaysTasks, createdTask],
            isLoading: false,
            error: null,
          }));

          return createdTask;
        } catch (error) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      toggleTask: async (taskId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await taskService.toggleTask(taskId);
          const updatedTask = normalizeTask(response?.data || {});

          // Find the previous state to determine the direction of the toggle
          const prevTask = useTaskStore.getState().tasks.find((t) => t.id === taskId);
          const wasCompleted = prevTask?.completed ?? false;
          const nowCompleted = updatedTask.completed;

          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === taskId ? updatedTask : task
            ),
            todaysTasks: state.todaysTasks.map((task) =>
              task.id === taskId ? updatedTask : task
            ),
            isLoading: false,
            error: null,
          }));

          // Keep profile stats in sync without an extra API call
          if (nowCompleted !== wasCompleted) {
            useProfileStore.getState().updateTasksCompleted(nowCompleted ? 1 : -1);
          }

          return updatedTask;
        } catch (error) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      deleteTask: async (taskId) => {
        set({ isLoading: true, error: null });
        try {
          await taskService.deleteTask(taskId);
          set((state) => ({
            tasks: state.tasks.filter((task) => task.id !== taskId),
            todaysTasks: state.todaysTasks.filter((task) => task.id !== taskId),
            isLoading: false,
            error: null,
          }));
        } catch (error) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      updateTask: async (taskId, updates) => {
        set({ isLoading: true, error: null });
        try {
          const response = await taskService.updateTask(taskId, updates);
          const updatedTask = normalizeTask(response?.data || {});

          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === taskId ? updatedTask : task
            ),
            todaysTasks: state.todaysTasks.map((task) =>
              task.id === taskId ? updatedTask : task
            ),
            isLoading: false,
            error: null,
          }));

          return updatedTask;
        } catch (error) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      getProductivity: () => {
        const today = useTaskStore.getState().todaysTasks;
        if (today.length === 0) return 0;
        const completed = today.filter((t) => t.completed).length;
        return Math.round((completed / today.length) * 100);
      },

      clearTodaysTasks: () => {
        set({ todaysTasks: [] });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'prepbridge-tasks',
    }
  )
);

export default useTaskStore;