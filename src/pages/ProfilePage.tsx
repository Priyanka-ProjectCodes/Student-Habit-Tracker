import React, { useState, useEffect } from 'react';
import { User, Mail, Hash, School, Shield, Trophy, Star, Loader2, Camera, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabaseService } from '../services/supabaseService';

export default function ProfilePage() {
  const { token } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      const data = await supabaseService.getProfile();
      setProfile(data);
      if (data?.avatar_url) {
        const signedUrl = await supabaseService.getSignedUrl(data.avatar_url);
        setAvatarUrl(signedUrl);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Delete old avatar if it exists
      if (profile?.avatar_url) {
        await supabaseService.deleteFile(profile.avatar_url);
      }

      const path = await supabaseService.uploadFile(file, 'avatars', profile.id);
      await supabaseService.updateProfile({ avatar_url: path });
      await fetchProfile();
    } catch (err) {
      console.error(err);
      alert('Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAvatarDelete = async () => {
    if (!profile?.avatar_url) return;

    setIsUploading(true);
    try {
      await supabaseService.deleteFile(profile.avatar_url);
      await supabaseService.updateProfile({ avatar_url: null });
      setAvatarUrl(null);
      await fetchProfile();
    } catch (err) {
      console.error(err);
      alert('Failed to delete avatar');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-full">
    <Loader2 className="animate-spin text-rose-accent" size={32} />
  </div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <div className="relative inline-block">
          <div className="w-32 h-32 bg-rose-accent rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-xl shadow-rose-accent/20 border-4 border-white overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              profile?.name?.[0] || 'U'
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Loader2 className="animate-spin text-white" size={24} />
              </div>
            )}
          </div>
          <div className="absolute -bottom-2 -right-2 flex gap-1">
            <label className="bg-rose-secondary text-rose-dark p-2 rounded-xl shadow-lg border-2 border-white cursor-pointer hover:bg-rose-primary transition-colors">
              <Camera size={20} />
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={isUploading} />
            </label>
            {avatarUrl && (
              <button 
                onClick={handleAvatarDelete}
                className="bg-red-100 text-red-600 p-2 rounded-xl shadow-lg border-2 border-white hover:bg-red-200 transition-colors"
                disabled={isUploading}
              >
                <Trash2 size={20} />
              </button>
            )}
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
