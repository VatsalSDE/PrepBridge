import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ListTodo, 
  Calendar, 
  Map, 
  Users, 
  BarChart3, 
  Trophy,
  FileSearch,
  User,
  LogOut,
  Settings,
  ChevronLeft,
  ChevronRight,
  Flame
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import useAuthStore from '@/store/authStore';
import useTaskStore from '@/store/taskStore';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/planning', label: 'Daily Plan', icon: ListTodo },
  { path: '/calendar', label: 'Calendar', icon: Calendar },
  { path: '/roadmap', label: 'Roadmap', icon: Map },
  { path: '/jd-matching', label: 'JD Matching', icon: FileSearch },
  { path: '/community', label: 'Community', icon: Users },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
  { path: '/achievements', label: 'Achievements', icon: Trophy },
  { path: '/profile', label: 'Profile', icon: User },
];

const Sidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const { logout, user } = useAuthStore();
  const streak = useTaskStore((state) => state.streak);

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Logo & Toggle */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        {!collapsed && (
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="font-bold text-lg text-sidebar-foreground">PrepBridge</span>
          </Link>
        )}
        {collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="w-10 h-10 mx-auto text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        )}
        {!collapsed && (
          <Button
            variant="ghost"
            size="iconSm"
            onClick={onToggle}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Streak Banner */}
      {!collapsed && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mx-3 mt-4 p-3 rounded-xl bg-gradient-to-r from-streak/20 to-warning/20 border border-streak/30"
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1.05, 1.08, 1],
                rotate: [0, -3, 3, -2, 0],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-2xl"
            >
              🔥
            </motion.div>
            <div>
              <p className="text-xs text-sidebar-foreground/70">Current Streak</p>
              <p className="text-lg font-bold text-sidebar-foreground">{streak} Days</p>
            </div>
          </div>
        </motion.div>
      )}

      {collapsed && (
        <div className="flex justify-center mt-4">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1.05, 1.08, 1],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-10 h-10 rounded-full bg-streak/20 flex items-center justify-center"
          >
            <Flame className="w-5 h-5 text-streak" />
          </motion.div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-hide">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                  isActive 
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow" 
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                  collapsed && "justify-center px-2"
                )}
              >
                <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-sidebar-primary-foreground")} />
                {!collapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-sidebar-border p-3">
        {!collapsed ? (
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-9 h-9 rounded-full bg-gradient-primary flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user?.name?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.name || 'Alex Johnson'}
              </p>
              <p className="text-xs text-sidebar-foreground/50 truncate">
                {user?.email || 'alex@example.com'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-primary flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user?.name?.charAt(0) || 'A'}
              </span>
            </div>
          </div>
        )}
        
        <div className={cn("flex gap-2", collapsed && "flex-col items-center")}>
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "sm"}
            className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent flex-1"
          >
            <Settings className="h-4 w-4" />
            {!collapsed && <span>Settings</span>}
          </Button>
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "sm"}
            onClick={() => logout()}
            className="text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Logout</span>}
          </Button>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
