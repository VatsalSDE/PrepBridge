import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Bell, CheckCircle2, Flame, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import useAuthStore from '@/store/authStore';
import ThemeToggle from '@/components/common/ThemeToggle';

const mockNotifications = [
  { id: 1, icon: CheckCircle2, color: 'text-success', text: "You completed today's plan", time: '2h ago' },
  { id: 2, icon: Flame, color: 'text-streak', text: 'You maintained your streak', time: '5h ago' },
  { id: 3, icon: AlertTriangle, color: 'text-warning', text: 'You ignored Aptitude for 3 days', time: '1d ago' },
];

const Header = ({ onMenuClick, sidebarCollapsed }) => {
  const user = useAuthStore((state) => state.user);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-30 h-16 bg-background/80 backdrop-blur-lg border-b border-border"
    >
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo - only show on mobile or when desktop sidebar is collapsed */}
          {(sidebarCollapsed || false) && (
            <Link to="/dashboard" className="hidden lg:flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">P</span>
              </div>
              <span className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                PrepBridge
              </span>
            </Link>
          )}
          {/* Mobile logo - always show */}
          <Link to="/dashboard" className="flex lg:hidden items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">P</span>
            </div>
            <span className="text-lg font-bold text-foreground hidden sm:block group-hover:text-primary transition-colors">
              PrepBridge
            </span>
          </Link>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setNotifOpen(!notifOpen)}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
            </Button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-popover shadow-lg overflow-hidden z-50"
                >
                  <div className="p-3 border-b border-border">
                    <p className="text-sm font-semibold text-foreground">Notifications</p>
                  </div>
                  <div className="divide-y divide-border">
                    {mockNotifications.map((n) => {
                      const Icon = n.icon;
                      return (
                        <div key={n.id} className="flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors">
                          <div className={`mt-0.5 ${n.color}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground">{n.text}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile User Avatar */}
          <div className="lg:hidden w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
            <span className="text-primary-foreground font-semibold text-sm">
              {user?.name?.charAt(0) || 'A'}
            </span>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
