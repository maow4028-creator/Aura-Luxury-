import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, Lock, Mail, User, Phone, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

interface RegisterPageProps {
  returnTo?: string;
  planId?: number;
  navigate: (page: string, params?: any) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ returnTo, planId, navigate }) => {
  const { signUpWithFirebase, signInWithGoogle } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    fitness_goals: 'Endurance & Hypertrophy',
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      // Create user in Firebase Auth and Firestore
      const newUser = await signUpWithFirebase(
        formData.email,
        formData.password,
        formData.full_name,
        formData.phone,
        formData.fitness_goals
      );

      if (returnTo === 'booking' && planId) {
        navigate('booking', { planId });
      } else {
        navigate('my-membership');
      }
    } catch (err: any) {
      setError(err.message || 'Error creating account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      if (returnTo === 'booking' && planId) {
        navigate('booking', { planId });
      } else {
        navigate('my-membership');
      }
    } catch (err: any) {
      setError(err.message || 'Google sign-up failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-[#F5F7F9] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-[#DCE5EB] animate-in zoom-in-95 duration-200">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#123B5D] to-[#55B9E8] flex items-center justify-center text-white mx-auto shadow-md shadow-[#55B9E8]/30 mb-3">
            <Dumbbell className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h2 className="text-2xl font-black text-[#123B5D] font-['Outfit'] uppercase">
            CREATE YOUR AURA ACCOUNT
          </h2>
          <p className="text-xs text-[#718596] mt-1">
            Sign up with Firebase to reserve memberships and track progress.
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF6FC] text-[#123B5D] text-[10px] font-bold border border-[#55B9E8]/30">
            <Sparkles className="w-3 h-3 text-[#55B9E8]" />
            <span>Connected to Firebase Firestore</span>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="leading-tight">{error}</span>
          </div>
        )}

        {/* Google Quick Sign-Up */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
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
          <span>{googleLoading ? 'Connecting to Google...' : 'Sign up with Google'}</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-[#DCE5EB] w-full"></div>
          <span className="bg-white px-3 text-[11px] font-semibold text-[#718596] uppercase">
            Or register with email
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="text-[11px] font-bold text-[#718596] uppercase tracking-wider block mb-1">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#718596] absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="e.g. Rahul Sharma"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#DCE5EB] text-[#183247] focus:outline-none focus:border-[#55B9E8]"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#718596] uppercase tracking-wider block mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#718596] absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. rahul@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#DCE5EB] text-[#183247] focus:outline-none focus:border-[#55B9E8]"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#718596] uppercase tracking-wider block mb-1">
              Mobile Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#718596] absolute left-3.5 top-3" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#DCE5EB] text-[#183247] focus:outline-none focus:border-[#55B9E8]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-[#718596] uppercase tracking-wider block mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#718596] absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min 6 chars"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#DCE5EB] text-[#183247] focus:outline-none focus:border-[#55B9E8]"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#718596] uppercase tracking-wider block mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#718596] absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={formData.confirm_password}
                  onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                  placeholder="Repeat password"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#DCE5EB] text-[#183247] focus:outline-none focus:border-[#55B9E8]"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-[#55B9E8] to-[#123B5D] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Creating Account in Firebase...' : 'Complete Firebase Sign Up'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-[#718596] pt-2 border-t border-[#DCE5EB]">
          Already have an account?{' '}
          <button
            onClick={() => navigate('login', { returnTo, planId })}
            className="text-[#55B9E8] font-bold hover:underline"
          >
            Sign In Here
          </button>
        </div>
      </div>
    </div>
  );
};
