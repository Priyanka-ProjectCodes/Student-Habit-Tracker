import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Trophy, Mail, Lock, User, Hash, School, Loader2 } from 'lucide-react';

export default function Signup() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'student',
    rollNumber: '',
    department: '',
    registerNumber: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: formData.role,
            roll_number: formData.rollNumber,
            department: formData.department,
            register_number: formData.registerNumber
          }
        }
      });
      if (error) throw error;
      
      alert('Signup successful! You can now log in.');
      navigate('/login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-rose-bg flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl shadow-rose-secondary/20 p-8 border border-rose-primary">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-accent rounded-2xl text-white mb-4 shadow-lg shadow-rose-accent/20">
            <Trophy size={32} />
          </div>
          <h1 className="text-3xl font-bold text-rose-dark">Join HabitHero</h1>
          <p className="text-rose-dark/60 mt-2">Start your journey to success</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-rose-dark/70 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-secondary" size={18} />
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-rose-bg border border-rose-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-accent/20 focus:border-rose-accent transition-all"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-rose-dark/70 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-secondary" size={18} />
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-rose-bg border border-rose-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-accent/20 focus:border-rose-accent transition-all"
                  placeholder="name@university.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-rose-dark/70 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-secondary" size={18} />
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-rose-bg border border-rose-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-accent/20 focus:border-rose-accent transition-all"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-rose-dark/70 mb-2">Role</label>
              <select
                className="w-full px-4 py-3 bg-rose-bg border border-rose-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-accent/20 focus:border-rose-accent transition-all"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="student">Student</option>
                <option value="admin">Teacher / Admin</option>
              </select>
            </div>

            {formData.role === 'student' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-rose-dark/70 mb-2">Roll Number</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-secondary" size={18} />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-3 bg-rose-bg border border-rose-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-accent/20 focus:border-rose-accent transition-all"
                      placeholder="e.g. 21CS01"
                      value={formData.rollNumber}
                      onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-rose-dark/70 mb-2">Department</label>
                  <div className="relative">
                    <School className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-secondary" size={18} />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-3 bg-rose-bg border border-rose-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-accent/20 focus:border-rose-accent transition-all"
                      placeholder="e.g. Computer Science"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="md:col-span-2 mt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-rose-accent hover:bg-rose-accent/90 text-white font-bold py-4 px-4 rounded-xl shadow-lg shadow-rose-accent/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
            </button>
          </div>
        </form>

        <p className="text-center mt-8 text-rose-dark/60">
          Already have an account?{' '}
          <Link to="/login" className="text-rose-accent font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
