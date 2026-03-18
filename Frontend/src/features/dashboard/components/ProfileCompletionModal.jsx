import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { UserRound, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfileCompletionModal({ profile, onDismiss }) {
  const navigate = useNavigate();

  const completionItems = [
    { label: 'College', done: Boolean(String(profile?.college || '').trim()) },
    { label: 'Branch', done: Boolean(String(profile?.branch || '').trim()) },
    { label: 'Target Role', done: Boolean(String(profile?.targetRole || '').trim()) },
    { label: 'At least one skill', done: Array.isArray(profile?.skills) && profile.skills.length > 0 },
  ];

  const doneCount = completionItems.filter((item) => item.done).length;

  const handleNavigateToProfile = () => {
    navigate('/profile');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="w-full max-w-md border-border/70 shadow-2xl">
          <CardHeader className="space-y-3 pb-4">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <UserRound className="w-6 h-6" />
              </div>
              <button
                onClick={onDismiss}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              <CardTitle className="text-xl">Complete Your Profile</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Personalize your PrepBridge experience with your details.
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Progress */}
            <div className="rounded-lg border border-border p-3 bg-secondary/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-foreground">Progress</span>
                <span className="text-xs text-muted-foreground">{doneCount}/4</span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${(doneCount / 4) * 100}%` }}
                />
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-2">
              {completionItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-lg px-3 py-2 bg-secondary/50 text-sm"
                >
                  <span className="text-foreground">{item.label}</span>
                  <span
                    className={`text-xs font-medium ${
                      item.done ? 'text-green-600' : 'text-amber-600'
                    }`}
                  >
                    {item.done ? '✓' : '○'}
                  </span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <Button
              onClick={handleNavigateToProfile}
              className="w-full"
              variant="hero"
            >
              Complete Profile
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
