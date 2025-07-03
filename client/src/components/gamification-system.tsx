import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { 
  Trophy, Star, Award, Target, Calendar, Zap, 
  TrendingUp, Crown, Medal, Flame, Activity,
  Users, Clock, CheckCircle, Gift, Brain
} from "lucide-react";

interface UserPoints {
  userId: number;
  totalPoints: number;
  currentLevel: number;
  pointsToNextLevel: number;
  dailyStreak: number;
  weeklyStreak: number;
  monthlyStreak: number;
  lifetimeEarnings: number;
  currentRank: string;
  lastActivityDate: Date;
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
  targetValue: number;
  pointReward: number;
  category: string;
  validDate: Date;
  isActive: boolean;
}

interface LeaderboardEntry {
  leaderboard: {
    userId: number;
    leaderboardType: string;
    category: string;
    score: number;
    rank: number;
    period: string;
  };
  user: {
    id: number;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
}

interface Badge {
  id: number;
  badgeName: string;
  badgeDescription: string;
  badgeIcon: string;
  badgeColor: string;
  category: string;
  rarity: string;
  pointsEarned: number;
  earnedAt: Date;
}

export function GamificationSystem() {
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [selectedPeriod, setSelectedPeriod] = useState("weekly");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get current user ID (assuming logged in user)
  const userId = 1; // This would come from auth context

  // Fetch user points
  const { data: userPoints, isLoading: pointsLoading } = useQuery({
    queryKey: [`/api/gamification/user/${userId}/points`],
    queryFn: async () => {
      const response = await apiRequest(`/api/gamification/user/${userId}/points`);
      return response.json() as Promise<UserPoints>;
    }
  });

  // Fetch user achievements
  const { data: userAchievements, isLoading: achievementsLoading } = useQuery({
    queryKey: [`/api/gamification/user/${userId}/achievements`],
    queryFn: async () => {
      const response = await apiRequest(`/api/gamification/user/${userId}/achievements`);
      return response.json();
    }
  });

  // Fetch all achievements
  const { data: allAchievements, isLoading: allAchievementsLoading } = useQuery({
    queryKey: ["/api/gamification/achievements"],
    queryFn: async () => {
      const response = await apiRequest("/api/gamification/achievements");
      return response.json() as Promise<Achievement[]>;
    }
  });

  // Fetch daily challenges
  const { data: dailyChallenges, isLoading: challengesLoading } = useQuery({
    queryKey: ["/api/gamification/challenges/daily"],
    queryFn: async () => {
      const response = await apiRequest("/api/gamification/challenges/daily");
      return response.json() as Promise<DailyChallenge[]>;
    }
  });

  // Fetch user challenges
  const { data: userChallenges, isLoading: userChallengesLoading } = useQuery({
    queryKey: [`/api/gamification/user/${userId}/challenges`],
    queryFn: async () => {
      const response = await apiRequest(`/api/gamification/user/${userId}/challenges`);
      return response.json();
    }
  });

  // Fetch leaderboard
  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery({
    queryKey: [`/api/gamification/leaderboard`, selectedPeriod, selectedCategory],
    queryFn: async () => {
      const response = await apiRequest(`/api/gamification/leaderboard?type=points&category=${selectedCategory}&period=${selectedPeriod}`);
      return response.json() as Promise<LeaderboardEntry[]>;
    }
  });

  // Fetch user badges
  const { data: userBadges, isLoading: badgesLoading } = useQuery({
    queryKey: [`/api/gamification/user/${userId}/badges`],
    queryFn: async () => {
      const response = await apiRequest(`/api/gamification/user/${userId}/badges`);
      return response.json() as Promise<Badge[]>;
    }
  });

  // Award points mutation
  const awardPointsMutation = useMutation({
    mutationFn: async (data: { userId: number; activityType: string; points: number; description: string }) => {
      const response = await fetch("/api/gamification/points/award", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/gamification/user/${userId}/points`] });
      toast({
        title: "Points Awarded!",
        description: "Points have been successfully awarded.",
      });
    }
  });

  const getRankIcon = (rank: string) => {
    switch (rank.toLowerCase()) {
      case 'diamond': return <Crown className="h-5 w-5 text-blue-400" />;
      case 'platinum': return <Medal className="h-5 w-5 text-gray-300" />;
      case 'gold': return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 'silver': return <Award className="h-5 w-5 text-gray-400" />;
      default: return <Star className="h-5 w-5 text-orange-500" />;
    }
  };

  const getLevelProgress = () => {
    if (!userPoints) return 0;
    const totalNeeded = (userPoints.currentLevel * 150);
    const currentProgress = totalNeeded - userPoints.pointsToNextLevel;
    return (currentProgress / totalNeeded) * 100;
  };

  const handleTestAward = () => {
    awardPointsMutation.mutate({
      userId,
      activityType: 'test_activity',
      points: 50,
      description: 'Test point award from gamification system'
    });
  };

  if (pointsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with Traffik Boosters Logo */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img 
            src="/TRAFIC BOOSTERS3 copy.png" 
            alt="Traffik Boosters" 
            className="h-16 w-auto crisp-edges"
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">STARZ Gamification</h1>
            <p className="text-gray-600">Drive engagement through achievements and rewards</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">More Traffik! More Sales!</p>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center space-x-2">
            <Trophy className="h-4 w-4" />
            <span>Achievements</span>
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Challenges</span>
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center space-x-2">
            <Crown className="h-4 w-4" />
            <span>Leaderboard</span>
          </TabsTrigger>
          <TabsTrigger value="badges" className="flex items-center space-x-2">
            <Award className="h-4 w-4" />
            <span>Badges</span>
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* User Level & Progress */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Level</CardTitle>
                <Star className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Level {userPoints?.currentLevel || 1}</div>
                <div className="space-y-2 mt-2">
                  <Progress value={getLevelProgress()} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {userPoints?.pointsToNextLevel || 0} points to next level
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Total Points */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Points</CardTitle>
                <Zap className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userPoints?.totalPoints?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Lifetime: {userPoints?.lifetimeEarnings?.toLocaleString() || 0}
                </p>
              </CardContent>
            </Card>

            {/* Current Rank */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Rank</CardTitle>
                {getRankIcon(userPoints?.currentRank || 'Bronze')}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userPoints?.currentRank || 'Bronze'}</div>
                <p className="text-xs text-muted-foreground">Keep earning to rank up!</p>
              </CardContent>
            </Card>

            {/* Daily Streak */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Daily Streak</CardTitle>
                <Flame className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userPoints?.dailyStreak || 0} days</div>
                <p className="text-xs text-muted-foreground">
                  Weekly: {userPoints?.weeklyStreak || 0} | Monthly: {userPoints?.monthlyStreak || 0}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Achievements & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5" />
                  <span>Recent Achievements</span>
                </CardTitle>
                <CardDescription>Your latest unlocked achievements</CardDescription>
              </CardHeader>
              <CardContent>
                {achievementsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                    ))}
                  </div>
                ) : userAchievements?.length > 0 ? (
                  <div className="space-y-3">
                    {userAchievements.slice(0, 3).map((achievement: any) => (
                      <div key={achievement.userAchievement.id} className="flex items-center space-x-3 p-2 bg-green-50 rounded-lg">
                        <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                          <Trophy className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{achievement.achievement.name}</p>
                          <p className="text-xs text-gray-500">{achievement.achievement.description}</p>
                        </div>
                        <Badge variant="secondary">+{achievement.achievement.pointReward}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No achievements yet. Start earning!</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Quick Actions</span>
                </CardTitle>
                <CardDescription>Test the gamification system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleTestAward} 
                  disabled={awardPointsMutation.isPending}
                  className="w-full"
                >
                  <Gift className="h-4 w-4 mr-2" />
                  Award Test Points (+50)
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Complete Task
                  </Button>
                  <Button variant="outline" size="sm">
                    <Brain className="h-4 w-4 mr-1" />
                    Learn Skill
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Achievement Gallery</CardTitle>
              <CardDescription>Track your progress and unlock new achievements</CardDescription>
            </CardHeader>
            <CardContent>
              {allAchievementsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-32 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allAchievements?.map((achievement) => {
                    const isUnlocked = userAchievements?.some((ua: any) => ua.achievement.id === achievement.id);
                    return (
                      <Card key={achievement.id} className={`${isUnlocked ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                              isUnlocked ? 'bg-green-500' : 'bg-gray-300'
                            }`}>
                              <Trophy className={`h-6 w-6 ${isUnlocked ? 'text-white' : 'text-gray-500'}`} />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium">{achievement.name}</h3>
                              <p className="text-sm text-gray-600">{achievement.description}</p>
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge variant={isUnlocked ? "default" : "secondary"}>
                                  {achievement.pointReward} points
                                </Badge>
                                {isUnlocked && (
                                  <Badge variant="outline" className="text-green-600 border-green-600">
                                    Unlocked
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Today's Challenges</span>
              </CardTitle>
              <CardDescription>Complete daily challenges to earn bonus points</CardDescription>
            </CardHeader>
            <CardContent>
              {challengesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : dailyChallenges && dailyChallenges.length > 0 ? (
                <div className="space-y-4">
                  {dailyChallenges.map((challenge) => {
                    const userChallenge = userChallenges?.find((uc: any) => uc.challenge.id === challenge.id);
                    const progress = userChallenge?.userChallenge.progress || 0;
                    const isCompleted = userChallenge?.userChallenge.isCompleted || false;
                    
                    return (
                      <Card key={challenge.id} className={`${isCompleted ? 'border-green-500 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium flex items-center space-x-2">
                                <Target className="h-4 w-4" />
                                <span>{challenge.title}</span>
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">{challenge.description}</p>
                              <div className="mt-3">
                                <div className="flex items-center justify-between text-sm mb-1">
                                  <span>Progress: {progress}/{challenge.targetValue}</span>
                                  <span>{Math.round((progress / challenge.targetValue) * 100)}%</span>
                                </div>
                                <Progress value={(progress / challenge.targetValue) * 100} className="h-2" />
                              </div>
                            </div>
                            <div className="ml-4 text-center">
                              <Badge variant={isCompleted ? "default" : "secondary"} className="mb-2">
                                +{challenge.pointReward} pts
                              </Badge>
                              {isCompleted && (
                                <div className="text-green-600 text-sm font-medium">
                                  ✓ Completed
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No challenges available today. Check back tomorrow!</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Crown className="h-5 w-5" />
                <span>Leaderboard</span>
              </CardTitle>
              <CardDescription>See how you rank against other users</CardDescription>
              <div className="flex space-x-2">
                <Button
                  variant={selectedPeriod === 'daily' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod('daily')}
                >
                  Daily
                </Button>
                <Button
                  variant={selectedPeriod === 'weekly' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod('weekly')}
                >
                  Weekly
                </Button>
                <Button
                  variant={selectedPeriod === 'monthly' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod('monthly')}
                >
                  Monthly
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {leaderboardLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : leaderboard && leaderboard.length > 0 ? (
                <div className="space-y-3">
                  {leaderboard.map((entry, index) => (
                    <div
                      key={entry.leaderboard.userId}
                      className={`flex items-center space-x-4 p-3 rounded-lg ${
                        index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-center w-8 h-8">
                        {index === 0 && <Crown className="h-6 w-6 text-yellow-500" />}
                        {index === 1 && <Medal className="h-6 w-6 text-gray-400" />}
                        {index === 2 && <Award className="h-6 w-6 text-orange-500" />}
                        {index > 2 && <span className="font-bold text-gray-600">{index + 1}</span>}
                      </div>
                      <Avatar>
                        <AvatarImage src={entry.user.avatar || undefined} />
                        <AvatarFallback>{entry.user.firstName[0]}{entry.user.lastName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{entry.user.firstName} {entry.user.lastName}</p>
                        <p className="text-sm text-gray-600">{entry.leaderboard.score.toLocaleString()} points</p>
                      </div>
                      <Badge variant={index < 3 ? "default" : "secondary"}>
                        Rank #{entry.leaderboard.rank}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No leaderboard data available yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Badge Collection</span>
              </CardTitle>
              <CardDescription>Your earned badges and achievements</CardDescription>
            </CardHeader>
            <CardContent>
              {badgesLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="h-24 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : userBadges && userBadges.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {userBadges.map((badge) => (
                    <Card key={badge.id} className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                      <div className="w-12 h-12 mx-auto mb-2 bg-blue-500 rounded-full flex items-center justify-center">
                        <Award className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-medium text-sm">{badge.badgeName}</h3>
                      <p className="text-xs text-gray-600 mt-1">{badge.badgeDescription}</p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {badge.rarity}
                      </Badge>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No badges earned yet.</p>
                  <p className="text-sm text-gray-400">Complete achievements to earn your first badges!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}