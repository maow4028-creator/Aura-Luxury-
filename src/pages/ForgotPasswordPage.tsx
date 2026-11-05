import React, { useState } from 'react';
import { Mail, ArrowRight, AlertCircle, CheckCircle2, ArrowLeft, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ForgotPasswordPageProps {
  navigate: (page: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ navigate }) => {
  const { resetPasswordWithFirebase } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      // 1. Send Firebase password reset email
      try {
        await resetPasswordWithFirebase(email);
        setMessage(`Password reset email has been dispatched via Firebase to ${email}. Please check your inbox and follow the link to reset your password.`);
      } catch (fbErr: any) {
        // Fallback to backend route
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(fbErr.message || data.error);
        setMessage(data.message || `Password reset instructions generated for ${email}.`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process password reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-[#F5F7F9] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-[#DCE5EB] animate-in zoom-in-95 duration-200">
        <button
          onClick={() => navigate('login')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#718596] hover:text-[#123B5D]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </button>

        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF6FC] text-[#123B5D] text-[10px] font-bold border border-[#55B9E8]/30 mb-2">
            <Sparkles className="w-3 h-3 text-[#55B9E8]" />
            <span>Firebase Password Reset</span>
          </div>
          <h2 className="text-2xl font-black text-[#123B5D] font-['Outfit'] uppercase">
            RESET YOUR PASSWORD
          </h2>
          <p className="text-xs text-[#718596] mt-1">
            Enter your registered email address and we will dispatch a secure Firebase password reset link.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleRequestToken} className="space-y-4 text-xs">
          <div>
            <label className="text-[11px] font-bold text-[#718596] uppercase tracking-wider block mb-1">
              Your Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#718596] absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. member@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#DCE5EB] text-[#183247] focus:outline-none focus:border-[#55B9E8]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-[#55B9E8] to-[#123B5D] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Dispatching Reset Link...' : 'Send Firebase Reset Email'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
