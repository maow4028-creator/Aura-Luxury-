import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, Lock, Mail, ArrowRight, AlertCircle, ShieldCheck, User as UserIcon } from 'lucide-react';

interface LoginPageProps {
  returnTo?: string;
  planId?: number;
  navigate: (page: string, params?: any) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ returnTo, planId, navigate }) => {
  const { signInWithFirebase, signInWithGoogle, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Try Firebase Authentication
      try {
        const loggedInUser = await signInWithFirebase(email, password);
        if (returnTo === 'booking' && planId) {
          navigate('booking', { planId });
        } else if (loggedInUser.role === 'admin') {
          navigate('admin');
        } else {
          navigate('my-membership');
        }
        return;
      } catch (fbErr: any) {
        console.warn('Firebase login attempt:', fbErr.message);
        // Fallback to backend authentication (for demo accounts seeded in SQLite)
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(fbErr.message || data.error || 'Invalid email or password');
        }

        login(data.token, data.user);
        if (returnTo === 'booking' && planId) {
          navigate('booking', { planId });
        } else if (data.user.role === 'admin') {
          navigate('admin');
        } else {
          navigate('my-membership');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const loggedInUser = await signInWithGoogle();
      if (returnTo === 'booking' && planId) {
        navigate('booking', { planId });
      } else if (loggedInUser.role === 'admin') {
        navigate('admin');
      } else {
        navigate('my-membership');
      }
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleFillDemoMember = () => {
    setEmail('rahul.sharma@example.com');
    setPassword('MemberPassword123!');
  };

  const handleFillDemoAdmin = () => {
    setEmail('maow4028@gmail.com');
    setPassword('202020');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-[#F5F7F9] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-[#DCE5EB] animate-in zoom-in-95 duration-200">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#123B5D] to-[#55B9E8] flex items-center justify-center text-white mx-auto shadow-md shadow-[#55B9E8]/30 mb-3">
            <Dumbbell className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h2 className="text-2xl font-black text-[#123B5D] font-['Outfit'] uppercase">
            SIGN IN TO AURA
          </h2>
          <p className="text-xs text-[#718596] mt-1">
            Access your membership, bookings, and workout schedule.
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF6FC] text-[#123B5D] text-[10px] font-bold border border-[#55B9E8]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Firebase Auth: aura-luxury-fitness</span>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="leading-tight">{error}</span>
          </div>
        )}

        {/* Google Sign-In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="w-full py-3 px-4 rounded-xl border border-[#DCE5EB] bg-white hover:bg-[#F5F7F9] text-[#183247] text-xs font-bold transition-all flex items-center justify-center gap-3 shadow-sm hover:border-[#55B9E8]"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-[#DCE5EB] w-full"></div>
          <span className="bg-white px-3 text-[11px] font-semibold text-[#718596] uppercase">
            Or sign in with email
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-[11px] font-bold text-[#718596] uppercase tracking-wider block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#718596] absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. rahul.sharma@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#DCE5EB] text-[#183247] focus:outline-none focus:border-[#55B9E8]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-[#718596] uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => navigate('forgot-password')}
                className="text-[11px] text-[#55B9E8] hover:underline font-semibold"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#718596] absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#DCE5EB] text-[#183247] focus:outline-none focus:border-[#55B9E8]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-[#55B9E8] to-[#123B5D] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Development Demo Access */}
        <div className="pt-3 border-t border-[#DCE5EB] space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#718596] block text-center">
            One-Click Demo Access
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={handleFillDemoMember}
              className="px-2.5 py-2 rounded-xl bg-[#EAF6FC] hover:bg-[#DCE5EB] text-[#123B5D] font-bold flex items-center justify-center gap-1.5 transition-colors text-[11px]"
            >
              <UserIcon className="w-3.5 h-3.5 text-[#55B9E8]" />
              <span>Demo Member</span>
            </button>
            <button
              type="button"
              onClick={handleFillDemoAdmin}
              className="px-2.5 py-2 rounded-xl bg-[#123B5D] hover:bg-[#183247] text-white font-bold flex items-center justify-center gap-1.5 transition-colors text-[11px]"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#55B9E8]" />
              <span>Demo Admin</span>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-[#718596]">
          Don't have an account yet?{' '}
          <button
            onClick={() => navigate('register', { returnTo, planId })}
            className="text-[#55B9E8] font-bold hover:underline"
          >
            Create New Account
          </button>
        </div>
      </div>
    </div>
  );
};
