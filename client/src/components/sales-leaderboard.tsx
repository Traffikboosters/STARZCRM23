import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Target, TrendingUp, Award, Crown, Medal, Zap, Flame, Calendar, DollarSign } from "lucide-react";

interface LeaderboardEntry {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  rank: number;
  previousRank: number;
  points: number;
  totalRevenue: number;
  dealsWon: number;
  appointmentsCompleted: number;
  contactRate: number;
  closingRatio: number;
  streak: number;
  level: number;
  xpToNextLevel: number;
  achievements: Achievement[];
  badges: Badge[];
  monthlyGoal: number;
  monthlyProgress: number;
  trend: 'up' | 'down' | 'stable';
  trendPercent: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  unlockedAt: Date;
  points: number;
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  target: number;
  current: number;
  reward: number;
  expiresAt: Date;
  completed: boolean;
}

export default function SalesLeaderboard() {
  const [timeFrame, setTimeFrame] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly'>('monthly');
  const [selectedCategory, setSelectedCategory] = useState<'overall' | 'revenue' | 'deals' | 'appointments'>('overall');

  const { data: leaderboardData = [], isLoading } = useQuery({
    queryKey: ['/api/sales-leaderboard', timeFrame, selectedCategory],
    refetchInterval: 30000 // Refresh every 30 seconds for real-time updates
  });

  const { data: challengesData = [] } = useQuery<Challenge[]>({
    queryKey: ['/api/sales-challenges'],
  });

  const { data: currentUserStats } = useQuery({
    queryKey: ['/api/sales-leaderboard/me'],
  });

  // Generate leaderboard data
  const generateLeaderboard = (): LeaderboardEntry[] => {
    return [
      {
        id: 2,
        name: "Sarah Johnson",
        email: "sarah.johnson@traffikboosters.com",
        rank: 1,
        previousRank: 2,
        points: 2850,
        totalRevenue: 145000,
        dealsWon: 12,
        appointmentsCompleted: 28,
        contactRate: 92,
        closingRatio: 42.8,
        streak: 7,
        level: 8,
        xpToNextLevel: 150,
        monthlyGoal: 120000,
        monthlyProgress: 89,
        trend: 'up',
        trendPercent: 15.2,
        achievements: [
          {
            id: 'deal_master',
            name: 'Deal Master',
            description: 'Close 10+ deals in a month',
            icon: '💰',
            tier: 'gold',
            unlockedAt: new Date(),
            points: 500
          },
          {
            id: 'streak_champion',
            name: 'Streak Champion',
            description: 'Maintain 7-day closing streak',
            icon: '🔥',
            tier: 'silver',
            unlockedAt: new Date(),
            points: 300
          }
        ],
        badges: [
          { id: 'top_performer', name: 'Top Performer', icon: '👑', color: 'gold', description: 'Ranked #1 this month' },
          { id: 'deal_closer', name: 'Deal Closer', icon: '💼', color: 'blue', description: 'Expert deal closer' }
        ]
      },
      {
        id: 3,
        name: "David Chen",
        email: "david.chen@traffikboosters.com",
        rank: 2,
        previousRank: 1,
        points: 2650,
        totalRevenue: 132000,
        dealsWon: 11,
        appointmentsCompleted: 25,
        contactRate: 88,
        closingRatio: 44.0,
        streak: 3,
        level: 7,
        xpToNextLevel: 275,
        monthlyGoal: 110000,
        monthlyProgress: 95,
        trend: 'down',
        trendPercent: -3.8,
        achievements: [
          {
            id: 'appointment_ace',
            name: 'Appointment Ace',
            description: 'Complete 25+ appointments',
            icon: '📅',
            tier: 'silver',
            unlockedAt: new Date(),
            points: 250
          }
        ],
        badges: [
          { id: 'consistency_king', name: 'Consistency King', icon: '⚡', color: 'purple', description: 'Consistent performance' }
        ]
      },
      {
        id: 4,
        name: "Amanda Davis",
        email: "amanda.davis@traffikboosters.com",
        rank: 3,
        previousRank: 3,
        points: 2420,
        totalRevenue: 118000,
        dealsWon: 9,
        appointmentsCompleted: 23,
        contactRate: 91,
        closingRatio: 39.1,
        streak: 5,
        level: 6,
        xpToNextLevel: 380,
        monthlyGoal: 100000,
        monthlyProgress: 92,
        trend: 'stable',
        trendPercent: 0.5,
        achievements: [
          {
            id: 'contact_champion',
            name: 'Contact Champion',
            description: '90%+ contact rate',
            icon: '📞',
            tier: 'bronze',
            unlockedAt: new Date(),
            points: 200
          }
        ],
        badges: [
          { id: 'rising_star', name: 'Rising Star', icon: '⭐', color: 'orange', description: 'Rapid improvement' }
        ]
      }
    ];
  };

  const leaderboard = generateLeaderboard();

  const generateChallenges = (): Challenge[] => {
    return [
      {
        id: 'daily_calls',
        name: 'Daily Call Warrior',
        description: 'Make 20 calls today',
        type: 'daily',
        target: 20,
        current: 14,
        reward: 50,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        completed: false
      },
      {
        id: 'weekly_revenue',
        name: 'Revenue Rocket',
        description: 'Generate $25K in revenue this week',
        type: 'weekly',
        target: 25000,
        current: 18500,
        reward: 300,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        completed: false
      },
      {
        id: 'monthly_deals',
        name: 'Deal Dynasty',
        description: 'Close 15 deals this month',
        type: 'monthly',
        target: 15,
        current: 12,
        reward: 1000,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        completed: false
      }
    ];
  };

  const challenges = generateChallenges();

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Award className="h-6 w-6 text-amber-600" />;
      default: return <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold text-gray-600">{rank}</div>;
    }
  };

  const getRankChange = (current: number, previous: number) => {
    if (current < previous) return { icon: <TrendingUp className="h-4 w-4 text-green-500" />, text: `↑${previous - current}`, color: 'text-green-500' };
    if (current > previous) return { icon: <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />, text: `↓${current - previous}`, color: 'text-red-500' };
    return { icon: <div className="w-4 h-4 bg-gray-300 rounded-full" />, text: '=', color: 'text-gray-500' };
  };

  const getLevelBadge = (level: number) => {
    const colors = ['bg-gray-500', 'bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-yellow-500', 'bg-red-500', 'bg-pink-500', 'bg-indigo-500'];
    return colors[Math.min(level - 1, colors.length - 1)] || 'bg-gray-500';
  };

  const getChallengeTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'bg-blue-500';
      case 'weekly': return 'bg-purple-500';
      case 'monthly': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Sales Leaderboard
          </h1>
          <p className="text-gray-600 mt-2">Compete, achieve, and dominate the sales arena</p>
        </div>

        <div className="flex gap-2">
          {(['daily', 'weekly', 'monthly', 'quarterly'] as const).map((period) => (
            <Button
              key={period}
              variant={timeFrame === period ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeFrame(period)}
              className={timeFrame === period ? "bg-[#e45c2b] hover:bg-[#d14a1f]" : ""}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2">
        {([
          { key: 'overall', label: 'Overall Points', icon: Trophy },
          { key: 'revenue', label: 'Revenue', icon: DollarSign },
          { key: 'deals', label: 'Deals Closed', icon: Target },
          { key: 'appointments', label: 'Appointments', icon: Calendar }
        ] as const).map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={selectedCategory === key ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(key)}
            className={`flex items-center gap-2 ${selectedCategory === key ? "bg-[#e45c2b] hover:bg-[#d14a1f]" : ""}`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Leaderboard */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Top Performers - {timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {leaderboard.map((entry, index) => {
                const rankChange = getRankChange(entry.rank, entry.previousRank);
                
                return (
                  <div
                    key={entry.id}
                    className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                      entry.rank === 1 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' :
                      entry.rank === 2 ? 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200' :
                      entry.rank === 3 ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200' :
                      'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Rank & Avatar */}
                        <div className="flex items-center gap-2">
                          {getRankIcon(entry.rank)}
                          <div className="w-12 h-12 bg-[#e45c2b] rounded-full flex items-center justify-center text-white font-semibold text-lg">
                            {entry.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        </div>

                        {/* User Info */}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{entry.name}</h3>
                            <div className="flex items-center gap-1">
                              {rankChange.icon}
                              <span className={`text-xs font-medium ${rankChange.color}`}>
                                {rankChange.text}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Level {entry.level}</span>
                            <div className="flex items-center gap-1">
                              <Flame className="h-3 w-3 text-orange-500" />
                              <span>{entry.streak} day streak</span>
                            </div>
                            <span className={`font-medium ${entry.trend === 'up' ? 'text-green-600' : entry.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                              {entry.trend === 'up' ? '+' : entry.trend === 'down' ? '-' : ''}{entry.trendPercent}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{entry.points.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">XP Points</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={(entry.points % 1000) / 10} className="w-20 h-2" />
                          <span className="text-xs text-gray-500">{entry.xpToNextLevel} to next level</span>
                        </div>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">${(entry.totalRevenue / 1000).toFixed(0)}K</div>
                        <div className="text-xs text-gray-600">Revenue</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{entry.dealsWon}</div>
                        <div className="text-xs text-gray-600">Deals Won</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{entry.contactRate}%</div>
                        <div className="text-xs text-gray-600">Contact Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{entry.closingRatio}%</div>
                        <div className="text-xs text-gray-600">Close Rate</div>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2 mt-3">
                      {entry.badges.map((badge) => (
                        <Badge key={badge.id} variant="outline" className="text-xs">
                          <span className="mr-1">{badge.icon}</span>
                          {badge.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Active Challenges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-500" />
                Active Challenges
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {challenges.map((challenge) => (
                <div key={challenge.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{challenge.name}</h4>
                    <Badge className={`text-xs ${getChallengeTypeColor(challenge.type)} text-white`}>
                      {challenge.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">{challenge.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>{challenge.current} / {challenge.target}</span>
                      <span className="text-blue-600">+{challenge.reward} XP</span>
                    </div>
                    <Progress value={(challenge.current / challenge.target) * 100} className="h-2" />
                    <div className="text-xs text-gray-500">
                      Expires: {challenge.expiresAt.toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {leaderboard[0]?.achievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{achievement.name}</div>
                    <div className="text-xs text-gray-600">{achievement.description}</div>
                    <div className="text-xs text-blue-600">+{achievement.points} XP</div>
                  </div>
                  <Badge variant="outline" className={`text-xs ${
                    achievement.tier === 'gold' ? 'border-yellow-500 text-yellow-700' :
                    achievement.tier === 'silver' ? 'border-gray-400 text-gray-700' :
                    achievement.tier === 'bronze' ? 'border-amber-600 text-amber-700' :
                    'border-purple-500 text-purple-700'
                  }`}>
                    {achievement.tier}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-500" />
                Team Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Revenue</span>
                <span className="font-semibold">${(leaderboard.reduce((sum, entry) => sum + entry.totalRevenue, 0) / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Deals Closed</span>
                <span className="font-semibold">{leaderboard.reduce((sum, entry) => sum + entry.dealsWon, 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Close Rate</span>
                <span className="font-semibold">{(leaderboard.reduce((sum, entry) => sum + entry.closingRatio, 0) / leaderboard.length).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Top Streak</span>
                <span className="font-semibold flex items-center gap-1">
                  <Flame className="h-4 w-4 text-orange-500" />
                  {Math.max(...leaderboard.map(entry => entry.streak))} days
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}