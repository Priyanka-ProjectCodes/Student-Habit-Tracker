import { useState, useEffect } from 'react';
import { User, Mail, Hash, School, Shield, Trophy, Star, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function ProfilePage() {
  const { token } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/student/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setProfile(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  if (isLoading) return <div className="flex items-center justify-center h-full">
    <Loader2 className="animate-spin text-rose-accent" size={32} />
  </div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <div className="relative inline-block">
          <div className="w-32 h-32 bg-rose-accent rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-xl shadow-rose-accent/20 border-4 border-white">
            {profile?.name?.[0] || 'U'}
          </div>
          <div className="absolute -bottom-2 -right-2 bg-rose-secondary text-rose-dark p-2 rounded-xl shadow-lg border-2 border-white">
            <Star size={20} className="fill-rose-dark" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-rose-dark mt-6">{profile?.name}</h1>
        <p className="text-rose-dark/40 uppercase tracking-widest text-sm font-bold mt-1">{profile?.role}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-rose-secondary shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-rose-dark flex items-center gap-2">
            <User size={20} className="text-rose-accent" />
            Personal Info
          </h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-rose-dark/40 uppercase">Full Name</p>
              <p className="font-medium text-rose-dark">{profile?.name}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-rose-dark/40 uppercase">Email Address</p>
              <p className="font-medium text-rose-dark">{profile?.email}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-rose-dark/40 uppercase">Account Role</p>
              <p className="font-medium text-rose-dark capitalize">{profile?.role}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-rose-secondary shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-rose-dark flex items-center gap-2">
            <School size={20} className="text-rose-accent" />
            Academic Info
          </h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-rose-dark/40 uppercase">Roll Number</p>
              <p className="font-medium text-rose-dark">{profile?.roll_number || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-rose-dark/40 uppercase">Department</p>
              <p className="font-medium text-rose-dark">{profile?.department || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-rose-dark/40 uppercase">Register Number</p>
              <p className="font-medium text-rose-dark">{profile?.register_number || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-rose-accent rounded-3xl p-8 text-white flex items-center justify-between shadow-xl shadow-rose-accent/20">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Trophy size={32} />
            </div>
            <div>
              <p className="text-rose-primary font-bold uppercase tracking-wider text-sm">Current Standing</p>
              <p className="text-3xl font-black">Level {profile?.level}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-rose-primary font-bold uppercase tracking-wider text-sm">Total XP</p>
            <p className="text-3xl font-black">{profile?.xp_points}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
