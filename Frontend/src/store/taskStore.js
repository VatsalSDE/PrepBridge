import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useTaskStore = create(
  persist(
    (set, get) => ({
      tasks: [],
      todaysTasks: [],
      streak: 7,
      longestStreak: 14,

      addTask: (task) => {
        const newTask = {
          id: Date.now().toString(),
          ...task,
          completed: false,
          createdAt: new Date().toISOString(),
          actualTime: 0,
        };
        set((state) => ({
          tasks: [...state.tasks, newTask],
          todaysTasks: [...state.todaysTasks, newTask],
        }));
      },

      toggleTask: (taskId) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
          ),
          todaysTasks: state.todaysTasks.map((task) =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
          ),
        }));
      },

      deleteTask: (taskId) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== taskId),
          todaysTasks: state.todaysTasks.filter((task) => task.id !== taskId),
        }));
      },

      updateTask: (taskId, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId ? { ...task, ...updates } : task
          ),
          todaysTasks: state.todaysTasks.map((task) =>
            task.id === taskId ? { ...task, ...updates } : task
          ),
        }));
      },

      getProductivity: () => {
        const today = get().todaysTasks;
        if (today.length === 0) return 0;
        const completed = today.filter((t) => t.completed).length;
        return Math.round((completed / today.length) * 100);
      },

      clearTodaysTasks: () => {
        set({ todaysTasks: [] });
      },
    }),
    {
      name: 'prepbridge-tasks',
    }
  )
);

export default useTaskStore;
