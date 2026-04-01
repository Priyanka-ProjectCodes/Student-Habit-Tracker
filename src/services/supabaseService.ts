import { supabase } from '../supabaseClient';

export const supabaseService = {
  // --- Profile ---
  async getProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (error) throw error;
    return data;
  },

  async updateProfile(updates: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);
    if (error) throw error;
    return data;
  },

  // --- Habits ---
  async getHabits() {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async addHabit(habit: { name: string; type: string; goal_value: number; unit: string }) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('habits')
      .insert([{ ...habit, user_id: user?.id }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteHabit(id: number) {
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // --- Logs ---
  async getLogs() {
    const { data, error } = await supabase
      .from('habit_logs')
      .select('*')
      .order('logged_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async logHabit(log: { habit_id: number; value: number; status: 'done' | 'missed'; logged_date: string }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // 1. Save the log
    const { data: logData, error: logError } = await supabase
      .from('habit_logs')
      .upsert({ ...log, user_id: user.id }, { onConflict: 'habit_id,logged_date' })
      .select()
      .single();
    
    if (logError) throw logError;

    // 2. Fetch profile to update stats
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError) throw profileError;

    let { xp_points, level, daily_streak, longest_streak, completed_habits_count, missed_habits_count } = profile;

    if (log.status === 'done') {
      xp_points += 10;
      completed_habits_count += 1;
      
      // Simple streak logic: if it's the first habit today, increment streak
      // (In a real app, you'd check if yesterday was completed too)
      if (daily_streak === 0) daily_streak = 1;
      if (daily_streak > longest_streak) longest_streak = daily_streak;
    } else {
      missed_habits_count += 1;
      daily_streak = 0; // Reset streak on miss
    }

    // Level up logic: every 100 XP
    level = Math.floor(xp_points / 100);

    // 3. Update the profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        xp_points,
        level,
        daily_streak,
        longest_streak,
        completed_habits_count,
        missed_habits_count
      })
      .eq('id', user.id);

    if (updateError) throw updateError;

    return logData;
  },

  // --- Admin ---
  async getAllStudents() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student');
    if (error) throw error;
    return data;
  },

  async markAttendance(userId: string, status: 'present' | 'absent', date: string) {
    const { data, error } = await supabase
      .from('attendance')
      .upsert({ user_id: userId, status, date }, { onConflict: 'user_id,date' });
    if (error) throw error;
    return data;
  },

  async getStudentReport(userId: string) {
    const { data, error } = await supabase
      .from('habit_logs')
      .select('*, habits(name)')
      .eq('user_id', userId);
    if (error) throw error;
    return data.map(log => ({ ...log, habit_name: (log.habits as any)?.name }));
  },

  async getAttendance() {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .order('date', { ascending: false });
    if (error) throw error;
    return data;
  },

  // --- Storage ---
  async uploadFile(file: File, featureName: string, itemId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const extension = file.name.split('.').pop();
    const uuid = crypto.randomUUID();
    const path = `${user.id}/${featureName}/${itemId}/${uuid}.${extension}`;

    const { data, error } = await supabase.storage
      .from('app-files')
      .upload(path, file);

    if (error) throw error;
    return data.path;
  },

  async getSignedUrl(path: string) {
    const { data, error } = await supabase.storage
      .from('app-files')
      .createSignedUrl(path, 3600); // 1 hour

    if (error) throw error;
    return data.signedUrl;
  },

  async deleteFile(path: string) {
    const { error } = await supabase.storage
      .from('app-files')
      .remove([path]);

    if (error) throw error;
  }
};
