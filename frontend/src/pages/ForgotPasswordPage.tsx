import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/authService';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-2">
          <div className="w-10 h-10 rounded-2xl bg-[#0B1F3A] flex items-center justify-center shadow-lg border border-cyan-500/30">
            <Shield className="w-5 h-5 text-cyan-400" />
          </div>
          <span className="text-2xl font-black text-[#0B1F3A]">
            SECURA<span className="text-red-600">X</span>
          </span>
        </Link>
        <h2 className="mt-4 text-2xl font-bold text-slate-900 tracking-tight">
          Reset Your Account Password
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Enter your registered email to receive recovery instructions.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-slate-200 sm:px-10">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Recovery Instructions Dispatched</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                If an account with <strong className="text-slate-900">{email}</strong> exists, instructions have been simulated and dispatched. Check your inbox or proceed with demo login.
              </p>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="w-full inline-block py-2.5 px-4 bg-slate-900 text-white font-bold text-xs rounded-xl transition"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registered Email Address
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

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg transition disabled:opacity-50"
                >
                  {loading ? 'Sending Instructions...' : 'Send Password Reset Link'}
                </button>
              </div>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center space-x-1 text-xs text-slate-600 hover:text-slate-900"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
