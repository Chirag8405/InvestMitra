import { useState, useCallback } from 'react';

export interface LeaderboardUser {
  id: string;
  username: string;
  rank: number;
  totalReturn: number;
  totalReturnPercent: number;
  portfolioValue: number;
  winRate: number;
  sharpeRatio: number;
  maxDrawdown: number;
  consistencyScore: number;
  tradingFrequency: 'LOW' | 'MEDIUM' | 'HIGH';
  riskProfile: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
  joinedDate: number;
  achievements: string[];
  badges: UserBadge[];
  followers: number;
  following: number;
  isFollowing?: boolean;
}

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  earnedAt: number;
}

export interface Competition {
  id: string;
  title: string;
  description: string;
  startDate: number;
  endDate: number;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
  participants: number;
  prize: string;
  rules: string[];
  leaderboard: CompetitionEntry[];
}

export interface CompetitionEntry {
  userId: string;
  username: string;
  rank: number;
  score: number;
  change: number;
}

// Mock data for demonstration
const MOCK_USERS: LeaderboardUser[] = [
  {
    id: 'user1',
    username: 'TradingPro',
    rank: 1,
    totalReturn: 25000,
    totalReturnPercent: 25.0,
    portfolioValue: 125000,
    winRate: 78,
    sharpeRatio: 2.1,
    maxDrawdown: 3.2,
    consistencyScore: 92,
    tradingFrequency: 'MEDIUM',
    riskProfile: 'MODERATE',
    joinedDate: Date.now() - 90 * 24 * 60 * 60 * 1000,
    achievements: ['first-trade', 'profitable-month', 'risk-master'],
    badges: [
      {
        id: 'top-trader',
        name: 'Top Trader',
        description: 'Ranked #1 for 30 days',
        icon: '👑',
        rarity: 'LEGENDARY',
        earnedAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
      }
    ],
    followers: 1247,
    following: 23,
  },
  {
    id: 'user2',
    username: 'ValueInvestor',
    rank: 2,
    totalReturn: 22000,
    totalReturnPercent: 22.0,
    portfolioValue: 122000,
    winRate: 72,
    sharpeRatio: 1.8,
    maxDrawdown: 5.1,
    consistencyScore: 88,
    tradingFrequency: 'LOW',
    riskProfile: 'CONSERVATIVE',
    joinedDate: Date.now() - 120 * 24 * 60 * 60 * 1000,
    achievements: ['patient-investor', 'low-risk-master'],
    badges: [
      {
        id: 'value-hunter',
        name: 'Value Hunter',
        description: 'Expert at finding undervalued stocks',
        icon: '🔍',
        rarity: 'EPIC',
        earnedAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
      }
    ],
    followers: 892,
    following: 45,
  },
  {
    id: 'user3',
    username: 'TechStockGuru',
    rank: 3,
    totalReturn: 20500,
    totalReturnPercent: 20.5,
    portfolioValue: 120500,
    winRate: 75,
    sharpeRatio: 1.9,
    maxDrawdown: 8.7,
    consistencyScore: 85,
    tradingFrequency: 'HIGH',
    riskProfile: 'AGGRESSIVE',
    joinedDate: Date.now() - 60 * 24 * 60 * 60 * 1000,
    achievements: ['tech-specialist', 'momentum-trader'],
    badges: [
      {
        id: 'tech-expert',
        name: 'Tech Expert',
        description: 'Specializes in technology stocks',
        icon: '💻',
        rarity: 'RARE',
        earnedAt: Date.now() - 21 * 24 * 60 * 60 * 1000,
      }
    ],
    followers: 634,
    following: 67,
  },
  {
    id: 'user4',
    username: 'DividendKing',
    rank: 4,
    totalReturn: 18000,
    totalReturnPercent: 18.0,
    portfolioValue: 118000,
    winRate: 69,
    sharpeRatio: 1.6,
    maxDrawdown: 4.3,
    consistencyScore: 90,
    tradingFrequency: 'LOW',
    riskProfile: 'CONSERVATIVE',
    joinedDate: Date.now() - 150 * 24 * 60 * 60 * 1000,
    achievements: ['dividend-collector', 'steady-eddie'],
    badges: [
      {
        id: 'dividend-master',
        name: 'Dividend Master',
        description: 'Focuses on dividend-paying stocks',
        icon: '💰',
        rarity: 'RARE',
        earnedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
      }
    ],
    followers: 445,
    following: 89,
  },
  {
    id: 'user5',
    username: 'RiskTaker',
    rank: 5,
    totalReturn: 16500,
    totalReturnPercent: 16.5,
    portfolioValue: 116500,
    winRate: 65,
    sharpeRatio: 1.4,
    maxDrawdown: 12.1,
    consistencyScore: 75,
    tradingFrequency: 'HIGH',
    riskProfile: 'AGGRESSIVE',
    joinedDate: Date.now() - 45 * 24 * 60 * 60 * 1000,
    achievements: ['high-roller', 'volatility-surfer'],
    badges: [
      {
        id: 'risk-warrior',
        name: 'Risk Warrior',
        description: 'Thrives in volatile markets',
        icon: '⚡',
        rarity: 'COMMON',
        earnedAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
      }
    ],
    followers: 267,
    following: 134,
  },
  // Add current user at rank 47
  {
    id: 'current-user',
    username: 'You',
    rank: 47,
    totalReturn: -1250,
    totalReturnPercent: -1.25,
    portfolioValue: 98750,
    winRate: 45,
    sharpeRatio: 0.3,
    maxDrawdown: 8.5,
    consistencyScore: 60,
    tradingFrequency: 'MEDIUM',
    riskProfile: 'MODERATE',
    joinedDate: Date.now() - 7 * 24 * 60 * 60 * 1000,
    achievements: ['first-trade'],
    badges: [
      {
        id: 'newcomer',
        name: 'Newcomer',
        description: 'Welcome to InvestMitra!',
        icon: '🌟',
        rarity: 'COMMON',
        earnedAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
      }
    ],
    followers: 12,
    following: 8,
  },
];

const MOCK_COMPETITIONS: Competition[] = [
  {
    id: 'monthly-jan-2024',
    title: 'January 2024 Championship',
    description: 'Compete for the highest returns in January with a focus on Indian market opportunities',
    startDate: new Date(2024, 0, 1).getTime(),
    endDate: new Date(2024, 0, 31).getTime(),
    status: 'ACTIVE',
    participants: 2847,
    prize: '₹50,000 virtual coins + Premium badges',
    rules: [
      'Minimum 5 trades required',
      'Portfolio must be at least 80% invested',
      'No single stock can exceed 25% allocation',
      'Focus on NSE listed stocks only'
    ],
    leaderboard: [
      { userId: 'user1', username: 'TradingPro', rank: 1, score: 8.5, change: 0 },
      { userId: 'user2', username: 'ValueInvestor', rank: 2, score: 7.2, change: 1 },
      { userId: 'user3', username: 'TechStockGuru', rank: 3, score: 6.8, change: -1 },
      { userId: 'current-user', username: 'You', rank: 156, score: -0.8, change: 12 },
    ],
  },
  {
    id: 'quarterly-q1-2024',
    title: 'Q1 2024 Grand Tournament',
    description: 'The ultimate quarterly challenge for serious traders',
    startDate: new Date(2024, 0, 1).getTime(),
    endDate: new Date(2024, 2, 31).getTime(),
    status: 'UPCOMING',
    participants: 156,
    prize: '₹1,00,000 virtual coins + Legendary badge',
    rules: [
      'Minimum ₹75,000 portfolio value',
      'Sharpe ratio above 1.0 required',
      'Maximum 15% drawdown allowed'
    ],
    leaderboard: [],
  },
];

export function useLeaderboard() {
  const [users, setUsers] = useState<LeaderboardUser[]>(MOCK_USERS);
  const [competitions, setCompetitions] = useState<Competition[]>(MOCK_COMPETITIONS);
  const [followedUsers, setFollowedUsers] = useState<string[]>(['user1', 'user2']);
  const [loading, setLoading] = useState(false);

  const getTopTraders = useCallback((limit: number = 10) => {
    return users
      .filter(user => user.id !== 'current-user')
      .sort((a, b) => a.rank - b.rank)
      .slice(0, limit);
  }, [users]);

  const getCurrentUserRank = useCallback(() => {
    return users.find(user => user.id === 'current-user');
  }, [users]);

  const getUsersNearCurrentRank = useCallback((range: number = 5) => {
    const currentUser = getCurrentUserRank();
    if (!currentUser) return [];

    const startRank = Math.max(1, currentUser.rank - range);
    const endRank = currentUser.rank + range;

    return users
      .filter(user => user.rank >= startRank && user.rank <= endRank)
      .sort((a, b) => a.rank - b.rank);
  }, [users, getCurrentUserRank]);

  const followUser = useCallback((userId: string) => {
    setFollowedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });

    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          followers: followedUsers.includes(userId) ? user.followers - 1 : user.followers + 1,
          isFollowing: !followedUsers.includes(userId),
        };
      }
      return user;
    }));
  }, [followedUsers]);

  const getActiveCompetitions = useCallback(() => {
    return competitions.filter(comp => comp.status === 'ACTIVE');
  }, [competitions]);

  const getUpcomingCompetitions = useCallback(() => {
    return competitions.filter(comp => comp.status === 'UPCOMING');
  }, [competitions]);

  const getCompletedCompetitions = useCallback(() => {
    return competitions.filter(comp => comp.status === 'COMPLETED');
  }, [competitions]);

  const joinCompetition = useCallback((competitionId: string) => {
    setCompetitions(prev => prev.map(comp => {
      if (comp.id === competitionId) {
        return {
          ...comp,
          participants: comp.participants + 1,
        };
      }
      return comp;
    }));
  }, []);

  const getTopBadges = useCallback(() => {
    const allBadges = users.flatMap(user => user.badges);
    const legendaryBadges = allBadges.filter(badge => badge.rarity === 'LEGENDARY');
    const epicBadges = allBadges.filter(badge => badge.rarity === 'EPIC');
    const rareBadges = allBadges.filter(badge => badge.rarity === 'RARE');
    
    return {
      legendary: legendaryBadges.slice(0, 3),
      epic: epicBadges.slice(0, 5),
      rare: rareBadges.slice(0, 10),
    };
  }, [users]);

  const searchUsers = useCallback((query: string) => {
    if (!query.trim()) return [];
    
    return users.filter(user => 
      user.username.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10);
  }, [users]);

  const getPerformanceMetrics = useCallback(() => {
    const topPerformers = users.filter(user => user.totalReturnPercent > 15).length;
    const averageReturn = users.reduce((sum, user) => sum + user.totalReturnPercent, 0) / users.length;
    const averageWinRate = users.reduce((sum, user) => sum + user.winRate, 0) / users.length;
    
    return {
      totalUsers: users.length,
      topPerformers,
      averageReturn: averageReturn.toFixed(2),
      averageWinRate: averageWinRate.toFixed(1),
    };
  }, [users]);

  return {
    users,
    competitions,
    followedUsers,
    loading,
    getTopTraders,
    getCurrentUserRank,
    getUsersNearCurrentRank,
    followUser,
    getActiveCompetitions,
    getUpcomingCompetitions,
    getCompletedCompetitions,
    joinCompetition,
    getTopBadges,
    searchUsers,
    getPerformanceMetrics,
  };
}
