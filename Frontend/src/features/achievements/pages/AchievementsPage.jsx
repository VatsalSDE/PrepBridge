import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, Lock, CheckCircle2, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { containerVariants, itemVariants } from '@/utils/animations';
import useAchievementStore from '@/store/achievementStore';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function BadgeCard({ badge }) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: badge.earned ? 1.05 : 1, y: badge.earned ? -5 : 0 }}
      whileTap={{ scale: badge.earned ? 0.98 : 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Card className={`glass-card transition-all ${
        badge.earned ? 'hover:shadow-lg hover:shadow-primary/20 cursor-pointer' : 'opacity-60'
      }`}>
        <CardContent className="p-5 text-center">
          <motion.div
            className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center text-3xl ${
              badge.earned ? 'bg-gradient-to-br from-primary/20 to-accent/20' : 'bg-muted'
            }`}
            whileHover={badge.earned ? { rotate: [0, -10, 10, 0], transition: { duration: 0.5 } } : {}}
          >
            {badge.earned ? badge.icon : <Lock className="w-6 h-6 text-muted-foreground" />}
          </motion.div>
          <h3 className="font-semibold mb-1">{badge.name}</h3>
          <p className="text-xs text-muted-foreground mb-3">{badge.description}</p>
          {badge.earned ? (
            <Badge variant="secondary" className="text-xs">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              {formatDate(badge.earnedAt)}
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

function BadgeGrid({ badges }) {
  if (!badges.length) {
    return <p className="text-center text-muted-foreground py-8">No badges in this category yet. Keep going!</p>;
  }
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {badges.map(badge => <BadgeCard key={badge._id} badge={badge} />)}
    </div>
  );
}

export default function AchievementsPage() {
  const {
    allBadges, totalEarned, totalBadges,
    streaks, leaderboard, userRank,
    isLoading, error,
    fetchAchievements, fetchLeaderboard,
  } = useAchievementStore();

  useEffect(() => {
    fetchAchievements();
    fetchLeaderboard();
  }, [fetchAchievements, fetchLeaderboard]);

  const currentStreak   = streaks?.currentStreak   ?? 0;
  const longestStreak   = streaks?.longestStreak    ?? 0;
  const weeklyActiveDays = streaks?.weeklyActiveDays ?? 0;
  const weeklyPct = Math.round((weeklyActiveDays / 7) * 100);

  // Derive milestone badges from roadmap_percent criteria
  const roadmapMilestones = allBadges
    .filter(b => b.criteriaType === 'roadmap_percent')
    .sort((a, b) => a.criteriaValue - b.criteriaValue);

  const overallRoadmapProgress = roadmapMilestones.length
    ? Math.max(...roadmapMilestones.map(b => b.progress))
    : 0;

  const consistencyBadges = allBadges.filter(b => b.category === 'consistency');
  const progressBadges    = allBadges.filter(b => b.category === 'progress');
  const milestoneBadges   = allBadges.filter(b => b.category === 'milestone');

  const daysToRecord = longestStreak > currentStreak ? longestStreak - currentStreak : 0;
  const encouragement = currentStreak === 0
    ? "Start your streak today! Even one task counts. 💪"
    : daysToRecord > 0
      ? `Just ${daysToRecord} more day${daysToRecord !== 1 ? 's' : ''} to beat your longest streak!`
      : `You've matched your longest streak of ${longestStreak} days. Keep going! 🚀`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-destructive font-medium">{error}</p>
        <button
          className="text-sm text-primary underline"
          onClick={() => fetchAchievements()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <Trophy className="w-7 h-7 md:w-8 md:h-8 text-warning shrink-0" />
            Achievements
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">Celebrate your progress and milestones</p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-3xl font-bold text-primary">{totalEarned}/{totalBadges}</p>
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
                animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
              >
                🔥
              </motion.div>
              <p className="text-3xl font-bold text-streak">
                {currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}
              </p>
              <p className="text-sm text-muted-foreground">Current Streak</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardContent className="p-5 text-center">
              <div className="text-5xl mb-2">⭐</div>
              <p className="text-3xl font-bold">
                {longestStreak} {longestStreak === 1 ? 'Day' : 'Days'}
              </p>
              <p className="text-sm text-muted-foreground">Longest Streak</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardContent className="p-5 text-center">
              <div className="text-5xl mb-2">📅</div>
              <p className="text-3xl font-bold">{weeklyActiveDays}/7</p>
              <p className="text-sm text-muted-foreground">Active Days This Week</p>
              <Progress value={weeklyPct} className="h-1.5 mt-2" />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Roadmap Milestones */}
      {roadmapMilestones.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Roadmap Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {roadmapMilestones.map(badge => (
                  <div key={badge._id} className="flex-1 text-center">
                    <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                      badge.earned ? 'bg-success text-white' : 'bg-muted'
                    }`}>
                      {badge.earned
                        ? <CheckCircle2 className="w-6 h-6" />
                        : <span className="text-sm font-bold">{badge.progress}%</span>
                      }
                    </div>
                    <p className="text-xs text-muted-foreground">{badge.criteriaValue}% Complete</p>
                  </div>
                ))}
              </div>
              <Progress value={overallRoadmapProgress} className="h-2 mt-4" />
              <p className="text-center text-sm text-muted-foreground mt-2">
                Overall Roadmap Progress: {overallRoadmapProgress}%
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Badges Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Badges</TabsTrigger>
          <TabsTrigger value="consistency">Consistency</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="milestone">Milestones</TabsTrigger>
          {leaderboard.length > 0 && <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>}
        </TabsList>

        <TabsContent value="all">
          <BadgeGrid badges={allBadges} />
        </TabsContent>

        <TabsContent value="consistency">
          <BadgeGrid badges={consistencyBadges} />
        </TabsContent>

        <TabsContent value="progress">
          <BadgeGrid badges={progressBadges} />
        </TabsContent>

        <TabsContent value="milestone">
          <BadgeGrid badges={milestoneBadges} />
        </TabsContent>

        {leaderboard.length > 0 && (
          <TabsContent value="leaderboard">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Weekly Leaderboard
                  {userRank && (
                    <Badge variant="secondary" className="ml-auto">Your Rank: #{userRank}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard.map(entry => (
                    <div
                      key={entry.rank}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        entry.rank <= 3 ? 'bg-primary/5 border border-primary/10' : ''
                      }`}
                    >
                      <span className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-bold text-sm ${
                        entry.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                        entry.rank === 2 ? 'bg-gray-300 text-gray-700'   :
                        entry.rank === 3 ? 'bg-amber-600 text-amber-100' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {entry.rank}
                      </span>
                      <span className="flex-1 font-medium truncate">{entry.name}</span>
                      <span className="text-sm text-muted-foreground shrink-0">{entry.weeklyActiveDays}/7 days</span>
                      <span className="text-xs text-streak shrink-0">🔥 {entry.currentStreak}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Encouragement */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-r from-success/10 to-primary/10 border-success/20">
          <CardContent className="p-6 text-center">
            <p className="text-xl font-medium">
              🎉 You're doing amazing! Keep up the great work!
            </p>
            <p className="text-muted-foreground mt-2">{encouragement}</p>
          </CardContent>
        </Card>
      </motion.div>

    </motion.div>
  );
}