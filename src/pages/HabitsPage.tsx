import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Target, 
  BookOpen, 
  Dumbbell, 
  Moon, 
  Clock, 
  Trash2,
  CheckCircle2,
  Circle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';
import { supabaseService } from '../services/supabaseService';

export default function HabitsPage() {
  const { token } = useAuth();
  const [habits, setHabits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newHabit, setNewHabit] = useState({
    name: '',
    type: 'study',
    goalValue: 1,
    unit: 'hours'
  });

  const fetchHabits = async () => {
    try {
      const data = await supabaseService.getHabits();
      setHabits(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, [token]);

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      await supabaseService.addHabit({
        name: newHabit.name,
        type: newHabit.type,
        goal_value: newHabit.goalValue,
        unit: newHabit.unit
      });
      setNewHabit({ name: '', type: 'study', goalValue: 1, unit: 'hours' });
      setIsAdding(false);
      fetchHabits();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteHabit = async (id: number) => {
    try {
      await supabaseService.deleteHabit(id);
      fetchHabits();
    } catch (err) {
      console.error(err);
    }
  };

  const habitTypes = [
    { id: 'study', label: 'Study', icon: BookOpen, color: 'text-rose-dark', bg: 'bg-rose-primary' },
    { id: 'reading', label: 'Reading', icon: Clock, color: 'text-rose-dark', bg: 'bg-rose-primary' },
    { id: 'exercise', label: 'Exercise', icon: Dumbbell, color: 'text-rose-dark', bg: 'bg-rose-primary' },
    { id: 'sleep', label: 'Sleep', icon: Moon, color: 'text-rose-dark', bg: 'bg-rose-primary' },
    { id: 'custom', label: 'Custom', icon: Target, color: 'text-rose-dark', bg: 'bg-rose-primary' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-rose-dark">Manage Habits</h1>
          <p className="text-rose-dark/60 mt-1">Design your daily routine for success</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Add Habit Form */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-3xl p-6 border border-rose-secondary shadow-sm sticky top-8">
            <h2 className="text-xl font-bold text-rose-dark mb-6">New Habit</h2>
            <form onSubmit={handleAddHabit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-rose-dark/70 mb-2">Habit Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-rose-bg border border-rose-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-accent/20 focus:border-rose-accent transition-all"
                  placeholder="e.g. Morning Coding"
                  value={newHabit.name}
                  onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-rose-dark/70 mb-2">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {habitTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setNewHabit({ ...newHabit, type: type.id })}
                      className={cn(
                        "flex flex-col items-center justify-center p-2 rounded-xl border transition-all",
                        newHabit.type === type.id 
                          ? "bg-rose-primary border-rose-accent text-rose-dark" 
                          : "bg-white border-rose-secondary/30 text-rose-dark/40 hover:border-rose-secondary"
                      )}
                    >
                      <type.icon size={20} />
                      <span className="text-[10px] mt-1 font-bold">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-rose-dark/70 mb-2">Goal</label>
                  <input
                    type="number"
                    required
                    className="w-full px-4 py-3 bg-rose-bg border border-rose-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-accent/20 focus:border-rose-accent transition-all"
                    value={newHabit.goalValue}
                    onChange={(e) => setNewHabit({ ...newHabit, goalValue: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-rose-dark/70 mb-2">Unit</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-rose-bg border border-rose-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-accent/20 focus:border-rose-accent transition-all"
                    placeholder="hours"
                    value={newHabit.unit}
                    onChange={(e) => setNewHabit({ ...newHabit, unit: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isAdding}
                className="w-full bg-rose-accent hover:bg-rose-accent/90 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-rose-accent/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isAdding ? <Loader2 className="animate-spin" size={20} /> : <><Plus size={20} /> Add Habit</>}
              </button>
            </form>
          </div>
        </div>

        {/* Habits List */}
        <div className="md:col-span-2 space-y-4">
          {isLoading ? (
            <div className="text-center py-12 text-rose-dark/40">Loading habits...</div>
          ) : habits.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-dashed border-rose-secondary text-center">
              <Target size={48} className="mx-auto mb-4 text-rose-secondary/50" />
              <h3 className="text-lg font-bold text-rose-dark">No habits yet</h3>
              <p className="text-rose-dark/50">Start by adding your first habit on the left.</p>
            </div>
          ) : (
            habits.map((habit) => {
              const typeInfo = habitTypes.find(t => t.id === habit.type) || habitTypes[4];
              return (
                <div key={habit.id} className="bg-white rounded-2xl p-5 border border-rose-secondary/30 shadow-sm flex items-center justify-between group hover:border-rose-accent transition-all">
                  <div className="flex items-center gap-4">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", typeInfo.bg, typeInfo.color)}>
                      <typeInfo.icon size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-rose-dark">{habit.name}</h3>
                      <p className="text-sm text-rose-dark/50">{habit.goal_value} {habit.unit} daily goal</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleDeleteHabit(habit.id)}
                      className="p-2 text-rose-dark/30 hover:text-rose-accent hover:bg-rose-primary/20 rounded-lg transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
