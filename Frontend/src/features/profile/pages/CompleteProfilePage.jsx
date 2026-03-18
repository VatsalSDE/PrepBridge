import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserRound, ArrowRight, LogOut } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import useAuthStore from '@/store/authStore';
import useProfileStore from '@/store/profileStore';
import { isProfileComplete } from '@/features/profile/utils/profileCompletion';

export default function CompleteProfilePage() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const profile = useProfileStore((state) => state.profile);

  const completionItems = useMemo(
    () => [
      { label: 'College', done: Boolean(String(profile?.college || '').trim()) },
      { label: 'Branch', done: Boolean(String(profile?.branch || '').trim()) },
      { label: 'Target Role', done: Boolean(String(profile?.targetRole || '').trim()) },
      { label: 'At least one skill', done: Array.isArray(profile?.skills) && profile.skills.length > 0 },
    ],
    [profile]
  );

  const doneCount = completionItems.filter((item) => item.done).length;

  const handleContinue = () => {
    navigate('/profile');
  };

  const handleGoDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-border/70 shadow-xl">
          <CardHeader className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <UserRound className="w-7 h-7" />
            </div>
            <div>
              <CardTitle className="text-2xl">Complete Your Profile First</CardTitle>
              <p className="text-muted-foreground mt-2">
                Finish your basic profile so PrepBridge can personalize your roadmap, goals, and recommendations.
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-xl border border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Profile Completion</span>
                <span className="text-sm text-muted-foreground">{doneCount}/4 done</span>
              </div>
              <div className="space-y-2">
                {completionItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-lg px-3 py-2 bg-secondary/35"
                  >
                    <span className="text-sm text-foreground">{item.label}</span>
                    <span
                      className={`text-xs font-medium ${
                        item.done ? 'text-green-600' : 'text-amber-600'
                      }`}
                    >
                      {item.done ? 'Done' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="flex-1" onClick={handleContinue}>
                Complete Profile
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              {isProfileComplete(profile) && (
                <Button variant="outline" className="flex-1" onClick={handleGoDashboard}>
                  Continue to Dashboard
                </Button>
              )}
            </div>

            <Button
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={logout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
