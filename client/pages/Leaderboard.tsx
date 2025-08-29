import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Trophy, 
  Medal, 
  Crown, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Target, 
  Star,
  UserPlus,
  UserMinus,
  Calendar,
  Award,
  BarChart3,
  Search,
  Zap,
  Shield,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";
import { useLeaderboard } from "@/hooks/use-leaderboard";

export default function Leaderboard() {
  const { 
    users,
    competitions,
    followedUsers,
    getTopTraders,
    getCurrentUserRank,
    getUsersNearCurrentRank,
    followUser,
    getActiveCompetitions,
    getUpcomingCompetitions,
    joinCompetition,
    getTopBadges,
    searchUsers,
    getPerformanceMetrics
  } = useLeaderboard();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const topTraders = getTopTraders(10);
  const currentUser = getCurrentUserRank();
  const nearbyUsers = getUsersNearCurrentRank(3);
  const activeCompetitions = getActiveCompetitions();
  const upcomingCompetitions = getUpcomingCompetitions();
  const topBadges = getTopBadges();
  const metrics = getPerformanceMetrics();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleFollow = (userId: string, username: string) => {
    followUser(userId);
    const isNowFollowing = !followedUsers.includes(userId);
    
    toast({
      title: isNowFollowing ? "Following" : "Unfollowed",
      description: `You ${isNowFollowing ? 'are now following' : 'unfollowed'} ${username}`,
    });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setSearchResults(searchUsers(query));
    } else {
      setSearchResults([]);
    }
  };

  const handleJoinCompetition = (competitionId: string, title: string) => {
    joinCompetition(competitionId);
    toast({
      title: "Competition Joined!",
      description: `You've successfully joined "${title}". Good luck!`,
    });
  };

  const getRankChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="h-3 w-3 text-success" />;
    if (change < 0) return <ArrowDown className="h-3 w-3 text-destructive" />;
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'LEGENDARY': return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20';
      case 'EPIC': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
      case 'RARE': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getUserProfileColor = (profile: string) => {
    switch (profile) {
      case 'AGGRESSIVE': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'MODERATE': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'CONSERVATIVE': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Trophy className="h-8 w-8" />
            Leaderboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Compete with traders worldwide and climb the rankings
          </p>
        </div>
        <div className="flex items-center gap-2">
          {currentUser && (
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 flex items-center gap-1">
              <Medal className="h-3 w-3" />
              Your Rank: #{currentUser.rank}
            </Badge>
          )}
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Traders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Active users</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.topPerformers}</div>
            <p className="text-xs text-muted-foreground">15%+ returns</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Return</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageReturn}%</div>
            <p className="text-xs text-muted-foreground">Community average</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageWinRate}%</div>
            <p className="text-xs text-muted-foreground">Success rate</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="global" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="global">Global Rankings</TabsTrigger>
          <TabsTrigger value="competitions">Competitions</TabsTrigger>
          <TabsTrigger value="badges">Badges & Awards</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
        </TabsList>

        {/* Global Rankings */}
        <TabsContent value="global">
          <div className="space-y-6">
            {/* Top 3 Podium */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Hall of Fame
                </CardTitle>
                <CardDescription>Top 3 performers of all time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {topTraders.slice(0, 3).map((trader, index) => (
                    <Card key={trader.id} className={`text-center p-6 ${index === 0 ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200' : ''}`}>
                      <div className="space-y-4">
                        <div className="flex items-center justify-center">
                          {index === 0 ? (
                            <Crown className="h-12 w-12 text-yellow-500" />
                          ) : index === 1 ? (
                            <Medal className="h-10 w-10 text-gray-400" />
                          ) : (
                            <Award className="h-8 w-8 text-amber-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold">{trader.username}</h3>
                          <p className="text-sm text-muted-foreground">Rank #{trader.rank}</p>
                        </div>
                        <div className="space-y-2">
                          <div className="text-2xl font-bold text-success">
                            +{trader.totalReturnPercent}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatCurrency(trader.portfolioValue)}
                          </div>
                        </div>
                        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                          <span>Win: {trader.winRate}%</span>
                          <span>Sharpe: {trader.sharpeRatio}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFollow(trader.id, trader.username)}
                          className="w-full"
                        >
                          {followedUsers.includes(trader.id) ? (
                            <>
                              <UserMinus className="h-3 w-3 mr-1" />
                              Unfollow
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-3 w-3 mr-1" />
                              Follow
                            </>
                          )}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Full Rankings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Global Rankings
                </CardTitle>
                <CardDescription>All traders ranked by performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {topTraders.map((trader) => (
                    <div key={trader.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="text-center min-w-[2rem]">
                          <div className="font-bold text-lg">#{trader.rank}</div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{trader.username}</span>
                            {trader.badges.length > 0 && (
                              <span className="text-lg">{trader.badges[0].icon}</span>
                            )}
                            <Badge className={getUserProfileColor(trader.riskProfile)}>
                              {trader.riskProfile}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Portfolio: {formatCurrency(trader.portfolioValue)}</span>
                            <span>Win Rate: {trader.winRate}%</span>
                            <span>Sharpe: {trader.sharpeRatio}</span>
                            <span>Followers: {trader.followers}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className={`text-lg font-bold ${trader.totalReturnPercent >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {trader.totalReturnPercent >= 0 ? '+' : ''}{trader.totalReturnPercent}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {trader.totalReturnPercent >= 0 ? '+' : ''}{formatCurrency(trader.totalReturn)}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFollow(trader.id, trader.username)}
                        >
                          {followedUsers.includes(trader.id) ? (
                            <UserMinus className="h-3 w-3" />
                          ) : (
                            <UserPlus className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Your Position */}
            {currentUser && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Position</CardTitle>
                  <CardDescription>See how you compare to nearby traders</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {nearbyUsers.map((trader) => (
                      <div 
                        key={trader.id} 
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          trader.id === 'current-user' ? 'bg-primary/10 border-primary/20' : 'hover:bg-accent/50'
                        } transition-colors`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-center min-w-[2rem]">
                            <div className="font-bold">#{trader.rank}</div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`font-semibold ${trader.id === 'current-user' ? 'text-primary' : ''}`}>
                                {trader.username}
                              </span>
                              {trader.id === 'current-user' && (
                                <Badge variant="default">You</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Win Rate: {trader.winRate}%</span>
                              <span>Sharpe: {trader.sharpeRatio}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${trader.totalReturnPercent >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {trader.totalReturnPercent >= 0 ? '+' : ''}{trader.totalReturnPercent}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatCurrency(trader.portfolioValue)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Competitions */}
        <TabsContent value="competitions">
          <div className="space-y-6">
            {/* Active Competitions */}
            {activeCompetitions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Active Competitions
                  </CardTitle>
                  <CardDescription>Join live competitions and win prizes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeCompetitions.map((competition) => (
                      <Card key={competition.id} className="p-4">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="text-lg font-semibold">{competition.title}</h3>
                                <Badge variant="default" className="bg-success">LIVE</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {competition.description}
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm font-medium">Prize Pool</p>
                              <p className="text-lg font-bold text-primary">{competition.prize}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Participants</p>
                              <p className="text-lg font-bold">{competition.participants.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Ends</p>
                              <p className="text-lg font-bold">
                                {new Date(competition.endDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {competition.leaderboard.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2">Current Leaderboard</h4>
                              <div className="space-y-2">
                                {competition.leaderboard.slice(0, 5).map((entry) => (
                                  <div key={entry.userId} className="flex items-center justify-between p-2 bg-accent/50 rounded">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">#{entry.rank}</span>
                                      <span className={entry.userId === 'current-user' ? 'font-bold text-primary' : ''}>
                                        {entry.username}
                                      </span>
                                      {entry.change !== 0 && getRankChangeIcon(entry.change)}
                                    </div>
                                    <span className={`font-semibold ${entry.score >= 0 ? 'text-success' : 'text-destructive'}`}>
                                      {entry.score >= 0 ? '+' : ''}{entry.score}%
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <Button 
                            onClick={() => handleJoinCompetition(competition.id, competition.title)}
                            className="w-full"
                          >
                            <Trophy className="h-4 w-4 mr-2" />
                            Join Competition
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Upcoming Competitions */}
            {upcomingCompetitions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Upcoming Competitions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingCompetitions.map((competition) => (
                      <Card key={competition.id} className="p-4 opacity-75">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-lg font-semibold">{competition.title}</h3>
                                <Badge variant="outline">UPCOMING</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {competition.description}
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm font-medium">Prize Pool</p>
                              <p className="text-lg font-bold text-primary">{competition.prize}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Pre-registered</p>
                              <p className="text-lg font-bold">{competition.participants}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Starts</p>
                              <p className="text-lg font-bold">
                                {new Date(competition.startDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <Button variant="outline" className="w-full" disabled>
                            <Calendar className="h-4 w-4 mr-2" />
                            Pre-register (Coming Soon)
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Badges & Awards */}
        <TabsContent value="badges">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Achievement Showcase
                </CardTitle>
                <CardDescription>Rare badges earned by top performers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Legendary Badges */}
                  {topBadges.legendary.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <span className="text-xl">👑</span>
                        Legendary Badges
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {topBadges.legendary.map((badge) => (
                          <Card key={badge.id} className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200">
                            <div className="text-center space-y-2">
                              <div className="text-3xl">{badge.icon}</div>
                              <h4 className="font-semibold">{badge.name}</h4>
                              <p className="text-sm text-muted-foreground">{badge.description}</p>
                              <Badge className={getRarityColor(badge.rarity)}>
                                {badge.rarity}
                              </Badge>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Epic Badges */}
                  {topBadges.epic.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <span className="text-xl">💜</span>
                        Epic Badges
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {topBadges.epic.map((badge) => (
                          <Card key={badge.id} className="p-3 text-center">
                            <div className="text-2xl mb-2">{badge.icon}</div>
                            <h4 className="font-medium text-sm">{badge.name}</h4>
                            <Badge className={getRarityColor(badge.rarity) + " text-xs mt-1"}>
                              {badge.rarity}
                            </Badge>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Your Badges */}
            {currentUser && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Badge Collection</CardTitle>
                  <CardDescription>Badges you've earned on your trading journey</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {currentUser.badges.map((badge) => (
                      <Card key={badge.id} className="p-4 text-center">
                        <div className="text-3xl mb-2">{badge.icon}</div>
                        <h4 className="font-semibold">{badge.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{badge.description}</p>
                        <Badge className={getRarityColor(badge.rarity) + " mt-2"}>
                          {badge.rarity}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-2">
                          Earned: {new Date(badge.earnedAt).toLocaleDateString()}
                        </p>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Social */}
        <TabsContent value="social">
          <div className="space-y-6">
            {/* Search Users */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Find Traders
                </CardTitle>
                <CardDescription>Search and connect with other traders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    placeholder="Search by username..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                  
                  {searchResults.length > 0 && (
                    <div className="space-y-2">
                      {searchResults.map((trader) => (
                        <div key={trader.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{trader.username}</span>
                                <Badge variant="outline">#{trader.rank}</Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {trader.totalReturnPercent >= 0 ? '+' : ''}{trader.totalReturnPercent}% • {trader.followers} followers
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleFollow(trader.id, trader.username)}
                          >
                            {followedUsers.includes(trader.id) ? (
                              <>
                                <UserMinus className="h-3 w-3 mr-1" />
                                Unfollow
                              </>
                            ) : (
                              <>
                                <UserPlus className="h-3 w-3 mr-1" />
                                Follow
                              </>
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Following */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Following ({followedUsers.length})
                </CardTitle>
                <CardDescription>Traders you're following</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {users
                    .filter(user => followedUsers.includes(user.id))
                    .map((trader) => (
                      <div key={trader.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{trader.username}</span>
                              <Badge variant="outline">#{trader.rank}</Badge>
                              {trader.badges.length > 0 && (
                                <span className="text-lg">{trader.badges[0].icon}</span>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {trader.totalReturnPercent >= 0 ? '+' : ''}{trader.totalReturnPercent}% • {trader.winRate}% win rate
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFollow(trader.id, trader.username)}
                        >
                          <UserMinus className="h-3 w-3 mr-1" />
                          Unfollow
                        </Button>
                      </div>
                    ))}
                  {followedUsers.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      You're not following anyone yet. Search for traders above to start building your network!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
