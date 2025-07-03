import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Target, 
  Star, 
  Award, 
  TrendingUp, 
  Flame,
  Users,
  Zap,
  Crown,
  Medal
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface UserPoints {
  id: number;
  userId: number;
  totalPoints: number;
  currentLevel: number;
  pointsToNextLevel: number;
  dailyStreak: number;
  weeklyStreak: number;
  monthlyStreak: number;
  lifetimeEarnings: number;
  currentRank: string;
}

interface Achievement {
  id: number;
  name: string;
  description: string;
  category: string;
  pointReward: number;
  badgeIcon: string;
  badgeColor: string;
  requirements: any;
  isActive: boolean;
}

interface DailyChallenge {
  id: number;
  title: string;
  description: string;
  challengeType: string;
  targetValue: number;
  pointReward: number;
  category: string;
  validDate: string;
  isActive: boolean;
}

export default function GamificationSystemClean() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const currentUserId = 1; // Default to user 1

  const { data: userPoints, isLoading: pointsLoading } = useQuery({
    queryKey: ["/api/gamification/user-points", currentUserId],
    queryFn: () => fetch(`/api/gamification/user-points/${currentUserId}`).then(res => res.json())
  });

  const { data: achievements, isLoading: achievementsLoading } = useQuery({
    queryKey: ["/api/gamification/achievements"],
    queryFn: () => fetch("/api/gamification/achievements").then(res => res.json())
  });

  const { data: dailyChallenges, isLoading: challengesLoading } = useQuery({
    queryKey: ["/api/gamification/daily-challenges"],
    queryFn: () => fetch("/api/gamification/daily-challenges").then(res => res.json())
  });

  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery({
    queryKey: ["/api/gamification/leaderboard"],
    queryFn: () => fetch("/api/gamification/leaderboard").then(res => res.json())
  });

  const awardPointsMutation = useMutation({
    mutationFn: (data: { userId: number; points: number; source: string; description: string }) =>
      apiRequest("POST", "/api/gamification/award-points", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gamification/user-points"] });
      toast({
        title: "Points Awarded!",
        description: "Points have been successfully added to your account.",
      });
    },
  });

  const completeChallengeMutation = useMutation({
    mutationFn: (data: { userId: number; challengeId: number }) =>
      apiRequest("POST", "/api/gamification/complete-challenge", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gamification/user-challenges"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gamification/user-points"] });
      toast({
        title: "Challenge Completed!",
        description: "You've successfully completed a daily challenge!",
      });
    },
  });

  const getRankColor = (rank: string) => {
    switch (rank.toLowerCase()) {
      case 'rookie': return 'bg-gray-500';
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-blue-500';
      case 'advanced': return 'bg-purple-500';
      case 'expert': return 'bg-orange-500';
      case 'master': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case 'phone': return <Zap className="h-6 w-6" />;
      case 'trophy': return <Trophy className="h-6 w-6" />;
      case 'target': return <Target className="h-6 w-6" />;
      case 'star': return <Star className="h-6 w-6" />;
      case 'flame': return <Flame className="h-6 w-6" />;
      case 'crown': return <Crown className="h-6 w-6" />;
      case 'medal': return <Medal className="h-6 w-6" />;
      default: return <Award className="h-6 w-6" />;
    }
  };

  const testAwardPoints = () => {
    awardPointsMutation.mutate({
      userId: currentUserId,
      points: 100,
      source: 'manual_test',
      description: 'Test points awarded'
    });
  };

  const testCompleteChallenge = (challengeId: number) => {
    completeChallengeMutation.mutate({
      userId: currentUserId,
      challengeId
    });
  };

  if (pointsLoading || achievementsLoading || challengesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gamification System</h2>
          <p className="text-muted-foreground">Track your progress and earn rewards</p>
        </div>
        <div className="flex items-center space-x-4">
          <img 
            src="/attached_assets/TRAFIC BOOSTERS3 copy_1751060321835.png" 
            alt="Traffik Boosters" 
            className="h-16 w-auto"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="challenges">Daily Challenges</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          {userPoints && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Points</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userPoints.totalPoints?.toLocaleString() || '0'}</div>
                  <p className="text-xs text-muted-foreground">
                    Lifetime: {userPoints.lifetimeEarnings?.toLocaleString() || '0'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Level</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Level {userPoints.currentLevel || 1}</div>
                  <div className="mt-2">
                    <Progress value={75} className="w-full" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {userPoints.pointsToNextLevel || 100} to next level
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Rank</CardTitle>
                  <Crown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Badge className={getRankColor(userPoints.currentRank || 'rookie')}>
                      {userPoints.currentRank?.charAt(0).toUpperCase() + userPoints.currentRank?.slice(1) || 'Rookie'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Daily Streak</CardTitle>
                  <Flame className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userPoints.dailyStreak || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Weekly: {userPoints.weeklyStreak || 0} | Monthly: {userPoints.monthlyStreak || 0}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Test Gamification Features</CardTitle>
              <CardDescription>Test the gamification system functionality</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={testAwardPoints} disabled={awardPointsMutation.isPending}>
                {awardPointsMutation.isPending ? "Awarding..." : "Award 100 Test Points"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {achievements?.map((achievement: Achievement) => (
              <Card key={achievement.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getAchievementIcon(achievement.badgeIcon)}
                      <CardTitle className="text-lg">{achievement.name}</CardTitle>
                    </div>
                    <Badge variant="secondary">{achievement.pointReward} pts</Badge>
                  </div>
                  <CardDescription>{achievement.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{achievement.category}</Badge>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {dailyChallenges?.map((challenge: DailyChallenge) => (
              <Card key={challenge.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{challenge.title}</CardTitle>
                    <Badge variant="secondary">{challenge.pointReward} pts</Badge>
                  </div>
                  <CardDescription>{challenge.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Target: {challenge.targetValue} {challenge.challengeType}
                      </p>
                      <Badge variant="outline">{challenge.category}</Badge>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => testCompleteChallenge(challenge.id)}
                      disabled={completeChallengeMutation.isPending}
                    >
                      {completeChallengeMutation.isPending ? "Completing..." : "Complete"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Top Performers</span>
              </CardTitle>
              <CardDescription>See how you rank against other team members</CardDescription>
            </CardHeader>
            <CardContent>
              {leaderboardLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {leaderboard?.map((user: any, index: number) => (
                    <div key={user.userId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-muted-foreground">Level {user.currentLevel}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{user.totalPoints?.toLocaleString()} pts</p>
                        <Badge className={getRankColor(user.currentRank)}>
                          {user.currentRank}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}