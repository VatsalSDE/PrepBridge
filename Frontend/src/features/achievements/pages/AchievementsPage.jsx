import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, Award, Flame, Star, Target, Zap, Medal, Crown,
  Lock, CheckCircle2, Calendar, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { containerVariants, itemVariants } from '@/utils/animations';

const BADGES = [
  // Consistency Badges
  { id: 1, name: '7-Day Warrior', icon: '🔥', description: 'Maintain a 7-day streak', category: 'consistency', earned: true, earnedDate: 'Dec 10, 2024' },
  { id: 2, name: '30-Day Champion', icon: '💪', description: 'Maintain a 30-day streak', category: 'consistency', earned: true, earnedDate: 'Dec 15, 2024' },
  { id: 3, name: '100-Day Legend', icon: '👑', description: 'Maintain a 100-day streak', category: 'consistency', earned: false, progress: 45 },
  
  // Progress Badges
  { id: 4, name: 'DSA Beginner', icon: '💻', description: 'Complete 25% of DSA roadmap', category: 'progress', earned: true, earnedDate: 'Nov 20, 2024' },
  { id: 5, name: 'DSA Intermediate', icon: '⚡', description: 'Complete 50% of DSA roadmap', category: 'progress', earned: true, earnedDate: 'Dec 5, 2024' },
  { id: 6, name: 'DSA Master', icon: '🏆', description: 'Complete 100% of DSA roadmap', category: 'progress', earned: false, progress: 62 },
  { id: 7, name: 'Aptitude Pro', icon: '🧮', description: 'Complete 50% of Aptitude', category: 'progress', earned: false, progress: 35 },
  { id: 8, name: 'Core CS Expert', icon: '📚', description: 'Complete 75% of Core CS', category: 'progress', earned: false, progress: 48 },
  
  // Milestone Badges
  { id: 9, name: 'First Step', icon: '👣', description: 'Complete your first task', category: 'milestone', earned: true, earnedDate: 'Oct 1, 2024' },
  { id: 10, name: 'Reflective Mind', icon: '🪞', description: 'Submit your first weekly reflection', category: 'milestone', earned: true, earnedDate: 'Oct 7, 2024' },
  { id: 11, name: 'Community Helper', icon: '🤝', description: 'Get 10 upvotes on your answers', category: 'milestone', earned: true, earnedDate: 'Nov 15, 2024' },
  { id: 12, name: 'Ready for Battle', icon: '⚔️', description: 'Achieve 80%+ JD match score', category: 'milestone', earned: false, progress: 68 }
];

const MILESTONES = [
  { name: '25% Roadmap Complete', progress: 100, achieved: true },
  { name: '50% Roadmap Complete', progress: 100, achieved: true },
  { name: '75% Roadmap Complete', progress: 75, achieved: false },
  { name: '100% Roadmap Complete', progress: 62, achieved: false }
];

function BadgeCard({ badge }) {
  return (
    <motion.div 
      variants={itemVariants}
      whileHover={{ 
        scale: badge.earned ? 1.05 : 1,
        y: badge.earned ? -5 : 0,
      }}
      whileTap={{ scale: badge.earned ? 0.98 : 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Card className={`glass-card transition-all ${
        badge.earned 
          ? 'hover:shadow-lg hover:shadow-primary/20 cursor-pointer' 
          : 'opacity-60'
      }`}>
        <CardContent className="p-5 text-center">
          <motion.div 
            className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center text-3xl ${
              badge.earned 
                ? 'bg-gradient-to-br from-primary/20 to-accent/20' 
                : 'bg-muted'
            }`}
            whileHover={badge.earned ? { 
              rotate: [0, -10, 10, 0],
              transition: { duration: 0.5 }
            } : {}}
          >
            {badge.earned ? badge.icon : <Lock className="w-6 h-6 text-muted-foreground" />}
          </motion.div>
          <h3 className="font-semibold mb-1">{badge.name}</h3>
          <p className="text-xs text-muted-foreground mb-3">{badge.description}</p>
          {badge.earned ? (
            <Badge variant="secondary" className="text-xs">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              {badge.earnedDate}
            </Badge>
          ) : (
            <div>
              <Progress value={badge.progress} className="h-1.5 mb-1" />
              <span className="text-xs text-muted-foreground">{badge.progress}% complete</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function AchievementsPage() {
  const earnedBadges = BADGES.filter(b => b.earned).length;
  const totalBadges = BADGES.length;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Trophy className="w-8 h-8 text-warning" />
            Achievements
          </h1>
          <p className="text-muted-foreground mt-1">Celebrate your progress and milestones</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-primary">{earnedBadges}/{totalBadges}</p>
          <p className="text-sm text-muted-foreground">Badges Earned</p>
        </div>
      </div>

      {/* Streak & Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <motion.div variants={itemVariants}>
          <Card className="glass-card bg-gradient-to-br from-streak/10 to-warning/10 border-streak/20">
            <CardContent className="p-5 text-center">
              <motion.div 
                className="text-5xl mb-2"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              >
                🔥
              </motion.div>
              <p className="text-3xl font-bold text-streak">28 Days</p>
              <p className="text-sm text-muted-foreground">Current Streak</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardContent className="p-5 text-center">
              <div className="text-5xl mb-2">⭐</div>
              <p className="text-3xl font-bold">45 Days</p>
              <p className="text-sm text-muted-foreground">Longest Streak</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardContent className="p-5 text-center">
              <div className="text-5xl mb-2">📊</div>
              <p className="text-3xl font-bold">78%</p>
              <p className="text-sm text-muted-foreground">Avg Productivity</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Milestones */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Roadmap Milestones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-2">
              {MILESTONES.map((milestone, idx) => (
                <div key={idx} className="flex-1 text-center">
                  <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                    milestone.achieved 
                      ? 'bg-success text-white' 
                      : 'bg-muted'
                  }`}>
                    {milestone.achieved ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <span className="text-sm font-bold">{milestone.progress}%</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{milestone.name}</p>
                </div>
              ))}
            </div>
            <Progress value={62} className="h-2 mt-4" />
            <p className="text-center text-sm text-muted-foreground mt-2">Overall Progress: 62%</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Badges Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Badges</TabsTrigger>
          <TabsTrigger value="consistency">Consistency</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="milestone">Milestones</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BADGES.map(badge => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="consistency">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BADGES.filter(b => b.category === 'consistency').map(badge => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="progress">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BADGES.filter(b => b.category === 'progress').map(badge => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="milestone">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BADGES.filter(b => b.category === 'milestone').map(badge => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Encouragement */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-r from-success/10 to-primary/10 border-success/20">
          <CardContent className="p-6 text-center">
            <p className="text-xl font-medium">
              🎉 You're doing amazing! Keep up the great work!
            </p>
            <p className="text-muted-foreground mt-2">
              Just 17 more days to reach your longest streak. You've got this! 💪
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}