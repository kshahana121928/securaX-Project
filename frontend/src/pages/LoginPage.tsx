import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await demoLogin();
      navigate('/dashboard');
    } catch (err: any) {
      setError('Failed to log in with demo account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-2">
          <div className="w-12 h-12 rounded-2xl bg-[#0B1F3A] flex items-center justify-center shadow-lg border border-cyan-500/30">
            <Shield className="w-6 h-6 text-cyan-400" />
          </div>
          <span className="text-2xl font-black text-[#0B1F3A]">
            SECURA<span className="text-red-600">X</span>
          </span>
        </Link>
        <h2 className="mt-4 text-2xl font-bold text-slate-900 tracking-tight">
          Sign In to Your Safety Account
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Your Safety. Your Control. Always.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Quick Demo Login Pill for Reviewers */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl text-center shadow-sm">
          <div className="flex items-center justify-center space-x-1.5 text-blue-900 font-bold text-xs mb-1">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Fast College Demonstration Mode</span>
          </div>
          <p className="text-[11px] text-blue-700 mb-3">
            Click below to instantly sign in as pre-seeded demo user (Aahana Sharma) with contacts, sessions, and history ready.
          </p>
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>One-Click Demo Login</span>
          </button>
        </div>

        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-slate-200 sm:px-10">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full px-4 py-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-blue-600 hover:text-blue-500"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-lg transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-blue-600 hover:text-blue-500">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
