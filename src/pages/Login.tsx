import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Trophy, Mail, Lock, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      
      login(data.token, data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-rose-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl shadow-rose-secondary/20 p-8 border border-rose-primary">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-accent rounded-2xl text-white mb-4 shadow-lg shadow-rose-accent/20">
            <Trophy size={32} />
          </div>
          <h1 className="text-3xl font-bold text-rose-dark">Welcome Back</h1>
          <p className="text-rose-dark/60 mt-2">Log in to track your progress</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-rose-dark/70 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-secondary" size={18} />
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-3 bg-rose-bg border border-rose-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-accent/20 focus:border-rose-accent transition-all"
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-rose-accent hover:bg-rose-accent/90 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-rose-accent/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-8 text-rose-dark/60">
          Don't have an account?{' '}
          <Link to="/signup" className="text-rose-accent font-bold hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
