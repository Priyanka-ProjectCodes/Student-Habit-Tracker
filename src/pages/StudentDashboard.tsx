import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Trophy, 
  Target, 
  TrendingUp, 
  Quote, 
  CheckCircle2, 
  Circle,
  Plus,
  BookOpen,
  Dumbbell,
  Moon,
  Clock
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { supabaseService } from '../services/supabaseService';

export default function StudentDashboard() {
  const { token, user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [habits, setHabits] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [motivation, setMotivation] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [profileData, habitsData, logsData, motivationRes] = await Promise.all([
        supabaseService.getProfile(),
        supabaseService.getHabits(),
        supabaseService.getLogs(),
        fetch('/api/motivation')
      ]);

      setProfile(profileData);
      setHabits(habitsData);
      setLogs(logsData);
      const motData = await motivationRes.json();
      setMotivation(motData.quote);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const toggleHabit = async (habitId: number) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const existingLog = logs.find(l => l.habit_id === habitId && l.logged_date === today);
    const newStatus = existingLog?.status === 'done' ? 'missed' : 'done';

    try {
      await supabaseService.logHabit({
        habit_id: habitId,
        value: 1,
        status: newStatus,
        logged_date: today
      });

      // Update XP and stats logic locally or refetch
      // For simplicity and accuracy with the new RLS/Triggers, we refetch
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-full text-rose-dark">Loading Dashboard...</div>;

  const today = format(new Date(), 'yyyy-MM-dd');
  const completedToday = habits.filter(h => logs.some(l => l.habit_id === h.id && l.logged_date === today && l.status === 'done')).length;
  
  // Chart data
  const chartData = [
    { name: 'Mon', xp: 20 },
    { name: 'Tue', xp: 45 },
    { name: 'Wed', xp: 30 },
    { name: 'Thu', xp: 60 },
    { name: 'Fri', xp: 80 },
    { name: 'Sat', xp: 50 },
    { name: 'Sun', xp: 90 },
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-rose-dark">Welcome back, {profile?.name}!</h1>
          <p className="text-rose-dark/60 mt-1">Level {profile?.level} {profile?.role === 'student' ? 'Student' : 'Admin'}</p>
        </div>
        <div className="flex items-center gap-4">
          <motion.div 
            key={`streak-${profile?.daily_streak}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white text-rose-accent px-4 py-2 rounded-xl flex items-center gap-2 border border-rose-primary shadow-sm"
          >
            <Flame size={20} className="fill-rose-accent" />
            <span className="font-bold text-lg">{profile?.daily_streak} Day Streak</span>
          </motion.div>
          <motion.div 
            key={`xp-${profile?.xp_points}`}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white text-rose-dark px-4 py-2 rounded-xl flex items-center gap-2 border border-rose-primary shadow-sm"
          >
            <Trophy size={20} className="fill-rose-secondary" />
            <span className="font-bold text-lg">{profile?.xp_points} XP</span>
          </motion.div>
        </div>
      </div>

      {/* Motivation Card */}
      <div className="bg-rose-accent rounded-3xl p-8 text-white shadow-lg shadow-rose-secondary/20">
        <div className="flex items-start gap-4">
          <Quote size={32} className="opacity-50 shrink-0" />
          <div>
            <p className="text-xl font-medium leading-relaxed italic">"{motivation}"</p>
            <p className="mt-4 text-rose-primary font-semibold">— HabitHero AI</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Daily Habits */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-rose-secondary shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-rose-dark">Today's Habits</h2>
              <span className="text-sm font-medium text-rose-dark/60">{completedToday} / {habits.length} Completed</span>
            </div>
            
            <div className="space-y-3">
              {habits.length === 0 ? (
                <div className="text-center py-8 text-rose-dark/40">
                  <Target size={48} className="mx-auto mb-3 opacity-20" />
                  <p>No habits added yet. Go to Habits page to start!</p>
                </div>
              ) : (
                habits.map((habit) => {
                  const isDone = logs.some(l => l.habit_id === habit.id && l.logged_date === today && l.status === 'done');
                  return (
                    <button
                      key={habit.id}
                      onClick={() => toggleHabit(habit.id)}
                      className={cn(
                        "w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-200",
                        isDone 
                          ? "bg-rose-primary/30 border-rose-primary text-rose-dark" 
                          : "bg-rose-bg/50 border-rose-secondary/30 text-rose-dark/70 hover:border-rose-secondary"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          isDone ? "bg-rose-primary" : "bg-white"
                        )}>
                          {habit.type === 'study' && <BookOpen size={20} />}
                          {habit.type === 'exercise' && <Dumbbell size={20} />}
                          {habit.type === 'sleep' && <Moon size={20} />}
                          {habit.type === 'reading' && <Clock size={20} />}
                          {habit.type === 'custom' && <Target size={20} />}
                        </div>
                        <div className="text-left">
                          <p className="font-bold">{habit.name}</p>
                          <p className="text-xs opacity-70">{habit.goal_value} {habit.unit} goal</p>
                        </div>
                      </div>
                      {isDone ? <CheckCircle2 className="text-rose-accent" /> : <Circle className="text-rose-secondary" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Progress Chart */}
          <div className="bg-white rounded-3xl p-6 border border-rose-secondary shadow-sm">
            <h2 className="text-xl font-bold text-rose-dark mb-6">Weekly Progress</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E8A1B0" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#E8A1B0" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F6C1CC" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#4A2C2A', fontSize: 12, opacity: 0.6}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#4A2C2A', fontSize: 12, opacity: 0.6}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#FFF5F7'}}
                  />
                  <Area type="monotone" dataKey="xp" stroke="#E8A1B0" strokeWidth={3} fillOpacity={1} fill="url(#colorXp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-8">
          <div className="bg-white rounded-3xl p-6 border border-rose-secondary shadow-sm">
            <h2 className="text-xl font-bold text-rose-dark mb-6">Level Progress</h2>
            <div className="space-y-4">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-rose-dark/60">Level {profile?.level}</span>
                <span className="text-rose-accent">{profile?.xp_points % 100} / 100 XP</span>
              </div>
              <div className="h-3 bg-rose-bg rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${profile?.xp_points % 100}%` }}
                  className="h-full bg-rose-accent rounded-full"
                />
              </div>
              <p className="text-xs text-rose-dark/40 text-center">Gain {100 - (profile?.xp_points % 100)} more XP to reach Level {profile?.level + 1}</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-rose-secondary shadow-sm">
            <h2 className="text-xl font-bold text-rose-dark mb-6">Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-rose-bg rounded-2xl border border-rose-primary/30 text-center">
                <p className="text-xs font-bold text-rose-dark/40 uppercase">Longest Streak</p>
                <p className="text-2xl font-black text-rose-accent">{profile?.longest_streak}</p>
              </div>
              <div className="p-4 bg-rose-bg rounded-2xl border border-rose-primary/30 text-center">
                <p className="text-xs font-bold text-rose-dark/40 uppercase">Completed</p>
                <p className="text-2xl font-black text-rose-accent">{profile?.completed_habits_count}</p>
              </div>
              <div className="p-4 bg-rose-bg rounded-2xl border border-rose-primary/30 text-center">
                <p className="text-xs font-bold text-rose-dark/40 uppercase">Missed</p>
                <p className="text-2xl font-black text-rose-dark/60">{profile?.missed_habits_count}</p>
              </div>
              <div className="p-4 bg-rose-bg rounded-2xl border border-rose-primary/30 text-center">
                <p className="text-xs font-bold text-rose-dark/40 uppercase">Class Score</p>
                <p className="text-2xl font-black text-rose-accent">{profile?.weekly_score}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
