export const TASK_CATEGORIES = [
  { id: 'dsa', label: 'DSA', color: 'bg-primary', icon: 'Code2' },
  { id: 'core-cs', label: 'Core CS', color: 'bg-accent', icon: 'Database' },
  { id: 'development', label: 'Development', color: 'bg-success', icon: 'Globe' },
  { id: 'aptitude', label: 'Aptitude', color: 'bg-warning', icon: 'Calculator' },
  { id: 'soft-skills', label: 'Soft Skills', color: 'bg-streak', icon: 'MessageSquare' },
  { id: 'mock-interview', label: 'Mock Interview', color: 'bg-destructive', icon: 'Video' },
  { id: 'project', label: 'Project Work', color: 'bg-muted-foreground', icon: 'Folder' },
];

export const PRIORITY_LEVELS = [
  { id: 'high', label: 'High', color: 'bg-destructive' },
  { id: 'medium', label: 'Medium', color: 'bg-warning' },
  { id: 'low', label: 'Low', color: 'bg-success' },
];

export const TARGET_ROLES = [
  'Software Development Engineer (SDE)',
  'Data Engineer',
  'Data Scientist',
  'Cybersecurity Engineer',
  'AI/ML Engineer',
  'DevOps Engineer',
  'Cloud Engineer',
  'Product Manager',
  'Quality Assurance Engineer',
  'Full Stack Developer',
];

export const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/planning', label: 'Daily Plan', icon: 'ListTodo' },
  { path: '/calendar', label: 'Calendar', icon: 'Calendar' },
  { path: '/roadmap', label: 'Roadmap', icon: 'Map' },
  { path: '/community', label: 'Community', icon: 'Users' },
  { path: '/reports', label: 'Reports', icon: 'BarChart3' },
  { path: '/achievements', label: 'Achievements', icon: 'Trophy' },
];

export const MOCK_USER = {
  id: '1',
  name: 'Alex Johnson',
  email: 'alex@example.com',
  college: 'ABC Engineering College',
  branch: 'Computer Science',
  year: 3,
  cgpa: 8.2,
  targetRole: 'Software Development Engineer (SDE)',
  streak: 7,
  longestStreak: 14,
  tasksCompleted: 156,
  avgProductivity: 78,
};
