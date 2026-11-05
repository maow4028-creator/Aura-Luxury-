import React, { useEffect, useState } from 'react';
import { MembershipPlan } from '../types';
import { useAuth } from '../context/AuthContext';
import { saveBookingToFirestore, saveMembershipToFirestore } from '../lib/firebase';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  Building,
  ArrowRight,
  ArrowLeft,
  Lock,
  Smartphone,
  AlertCircle,
  FileText,
  Calendar,
  Sparkles,
  User as UserIcon,
  Mail,
  Phone,
} from 'lucide-react';

interface BookingPageProps {
  initialPlanId?: number;
  navigate: (page: string, params?: any) => void;
}

export const BookingPage: React.FC<BookingPageProps> = ({ initialPlanId, navigate }) => {
  const { user, token, signInWithFirebase, signUpWithFirebase, signInWithGoogle, login } = useAuth();
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<number | undefined>(initialPlanId);
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'offline'>('razorpay');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inline Auth Form State for unauthenticated users
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Razorpay Checkout Modal Simulation State
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [selectedOnlineMethod, setSelectedOnlineMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('user@okhdfcbank');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Success Confirmation State
  const [confirmation, setConfirmation] = useState<{
    bookingCode: string;
    membershipCode?: string;
    receiptNumber?: string;
    planName: string;
    amount: number;
    paymentMethod: string;
    paymentStatus: string;
    membershipStatus: string;
    startDate?: string;
    expiryDate?: string;
    nextSteps: string[];
  } | null>(null);

  useEffect(() => {
    fetch('/api/plans')
      .then((res) => res.json())
      .then((data) => {
        const pList = data.plans || [];
        setPlans(pList);
        if (!selectedPlanId && pList.length > 0) {
          setSelectedPlanId(initialPlanId || pList[0].id);
        }
      });
  }, [initialPlanId]);

  const selectedPlan = plans.find((p) => p.id === Number(selectedPlanId)) || plans[0];

  // Handle Inline Sign In via Firebase
  const handleInlineSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      try {
        await signInWithFirebase(authEmail, authPassword);
      } catch (fbErr: any) {
        // Fallback to backend
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: authEmail, password: authPassword }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(fbErr.message || data.error);
        login(data.token, data.user);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Inline Sign Up via Firebase
  const handleInlineSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      await signUpWithFirebase(authEmail, authPassword, authFullName, authPhone);
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Inline Google Sign In
  const handleInlineGoogle = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setAuthError(err.message || 'Google Sign-In failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleInitiateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Please sign in or create an account first to complete your booking.');
      return;
    }
    if (!selectedPlan) {
      setError('Please select a membership plan.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/memberships/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan_id: selectedPlan.id,
          payment_method: paymentMethod,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit booking');
      }

      // Store booking in Firebase Firestore
      await saveBookingToFirestore({
        booking_code: data.booking_code,
        userId: String(user.id),
        userEmail: user.email,
        userName: user.full_name,
        userPhone: user.phone,
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        amount: selectedPlan.price_inr,
        paymentMethod,
        paymentStatus: 'PENDING',
        bookingStatus: 'PENDING_APPROVAL',
        notes,
      });

      if (paymentMethod === 'razorpay') {
        setCreatedOrder(data);
        setShowRazorpayModal(true);
      } else {
        setConfirmation({
          bookingCode: data.booking_code,
          planName: selectedPlan.name,
          amount: selectedPlan.price_inr,
          paymentMethod: 'Offline / Pay at Gym Desk',
          paymentStatus: 'PENDING',
          membershipStatus: 'PENDING_APPROVAL',
          nextSteps: [
            'Booking stored securely in Firebase Firestore and club database.',
            'Visit the Aura Luxury Fitness Club front desk at Linking Road, Bandra West.',
            `Quote your Booking ID #${data.booking_code} to the front desk concierge.`,
            'Complete payment via Cash, POS Card Terminal, or Cheque.',
            'Our front desk admin will verify payment and activate your membership.',
          ],
        });
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Complete Simulated Razorpay Payment & Activate in Firebase + DB
  const handleCompleteRazorpay = async () => {
    setIsProcessingPayment(true);
    try {
      const mockPaymentId = `pay_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
      const res = await fetch('/api/payments/razorpay/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          booking_id: createdOrder.booking_id,
          razorpay_payment_id: mockPaymentId,
          razorpay_order_id: createdOrder.razorpay_order_id,
        }),
      });

      const verifyData = await res.json();
      if (!res.ok) {
        throw new Error(verifyData.error || 'Payment verification failed');
      }

      // Save activated membership to Firebase Firestore
      await saveMembershipToFirestore({
        membership_code: verifyData.membership_code,
        userId: String(user?.id),
        userName: user?.full_name || '',
        userEmail: user?.email || '',
        planId: selectedPlan.id,
        planName: verifyData.plan_name,
        price: createdOrder.amount_inr,
        startDate: verifyData.start_date,
        expiryDate: verifyData.expiry_date,
        status: 'ACTIVE',
        receiptNumber: verifyData.receipt_number,
      });

      setShowRazorpayModal(false);
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#55B9E8', '#123B5D', '#FFFFFF', '#60A5FA'],
        });
      } catch (e) {
        // Safe confetti fallback
      }

      setConfirmation({
        bookingCode: createdOrder.booking_code,
        membershipCode: verifyData.membership_code,
        receiptNumber: verifyData.receipt_number,
        planName: verifyData.plan_name,
        amount: createdOrder.amount_inr,
        paymentMethod: 'Razorpay Online (UPI/Card)',
        paymentStatus: 'PAID & VERIFIED',
        membershipStatus: 'ACTIVE',
        startDate: verifyData.start_date,
        expiryDate: verifyData.expiry_date,
        nextSteps: [
          'Saved to Firebase Firestore & synchronized with club database!',
          `Digital Membership Card ID: ${verifyData.membership_code}`,
          `Tax invoice & receipt #${verifyData.receipt_number} generated.`,
          'Check in at the club using your phone number or digital ID.',
        ],
      });
    } catch (err: any) {
      alert(`Payment Error: ${err.message}`);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // ==========================================
  // CONFIRMATION VIEW
  // ==========================================
  if (confirmation) {
    const isActive = confirmation.membershipStatus === 'ACTIVE';
    return (
      <div className="bg-[#F5F7F9] min-h-screen py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-xl border border-[#DCE5EB] p-8 sm:p-12 text-center animate-in zoom-in-95 duration-200">
            <div
              className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6 ${
                isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
              }`}
            >
              {isActive ? <CheckCircle2 className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF6FC] text-[#123B5D] text-[10px] font-extrabold uppercase tracking-widest mb-3 border border-[#55B9E8]/30">
              <Sparkles className="w-3.5 h-3.5 text-[#55B9E8]" />
              <span>{isActive ? 'Stored in Firebase Firestore' : 'Waiting for Front Desk Verification'}</span>
            </div>

            <h1 className="text-3xl font-black text-[#123B5D] font-['Outfit'] mb-3 uppercase">
              {isActive ? 'MEMBERSHIP ACTIVATED & STORED' : 'WAITING FOR APPROVAL'}
            </h1>
            <p className="text-sm text-[#718596] max-w-lg mx-auto mb-8">
              {isActive
                ? 'Your payment was successfully authenticated and your membership record is stored in Firebase Firestore and the club database.'
                : 'Your booking has been registered in Firebase and is currently waiting for approval and front desk payment verification.'}
            </p>

            {/* Summary Card */}
            <div className="p-6 rounded-2xl bg-[#EAF6FC] border border-[#55B9E8]/30 text-left mb-8 space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between py-1 border-b border-[#DCE5EB]/60">
                <span className="text-[#718596]">Booking Reference ID:</span>
                <span className="font-mono font-bold text-[#123B5D]">{confirmation.bookingCode}</span>
              </div>
              {confirmation.membershipCode && (
                <div className="flex justify-between py-1 border-b border-[#DCE5EB]/60">
                  <span className="text-[#718596]">Digital Membership ID:</span>
                  <span className="font-mono font-bold text-[#55B9E8]">{confirmation.membershipCode}</span>
                </div>
              )}
              {confirmation.receiptNumber && (
                <div className="flex justify-between py-1 border-b border-[#DCE5EB]/60">
                  <span className="text-[#718596]">Official Tax Receipt:</span>
                  <span className="font-mono font-bold text-[#183247]">{confirmation.receiptNumber}</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-[#DCE5EB]/60">
                <span className="text-[#718596]">Selected Membership Plan:</span>
                <span className="font-bold text-[#183247]">{confirmation.planName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#DCE5EB]/60">
                <span className="text-[#718596]">Total Amount:</span>
                <span className="font-black text-[#123B5D] text-base">₹{confirmation.amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#DCE5EB]/60">
                <span className="text-[#718596]">Payment Method:</span>
                <span className="font-medium text-[#183247]">{confirmation.paymentMethod}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#718596]">Membership Status:</span>
                <span
                  className={`font-black uppercase px-2 py-0.5 rounded text-xs ${
                    isActive ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'
                  }`}
                >
                  {confirmation.membershipStatus}
                </span>
              </div>
            </div>

            {/* Next Steps List */}
            <div className="text-left bg-[#F5F7F9] p-6 rounded-2xl border border-[#DCE5EB] mb-8">
              <h4 className="font-bold text-[#123B5D] text-xs uppercase tracking-wider mb-3 font-['Outfit']">
                Next Steps:
              </h4>
              <ul className="space-y-2 text-xs text-[#183247]">
                {confirmation.nextSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#55B9E8] shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate('my-membership')}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#55B9E8] to-[#123B5D] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md hover:opacity-95 transition-all"
              >
                Go to "My Membership" Dashboard
              </button>
              <button
                onClick={() => navigate('home')}
                className="w-full sm:w-auto px-6 py-3.5 bg-white border border-[#DCE5EB] text-[#183247] text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#F5F7F9] transition-all"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // BOOKING FORM VIEW
  // ==========================================
  return (
    <div className="bg-[#F5F7F9] min-h-screen py-12 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('membership')}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#718596] hover:text-[#123B5D] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Membership Plans</span>
        </button>

        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF6FC] text-[#123B5D] text-[10px] font-bold border border-[#55B9E8]/30 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#55B9E8]" />
            <span>Firebase Connected (aura-luxury-fitness)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#123B5D] font-['Outfit'] uppercase">
            MEMBERSHIP BOOKING & CHECKOUT
          </h1>
          <p className="text-xs sm:text-sm text-[#718596] mt-1">
            Sign in or create your account, select your plan, and securely reserve your membership.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleInitiateBooking} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form: Details & Payment Method Selection */}
          <div className="lg:col-span-7 space-y-6">
            {/* STEP 1: MEMBER AUTHENTICATION / PROFILE BOX */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DCE5EB] shadow-sm">
              <h3 className="text-lg font-bold text-[#123B5D] font-['Outfit'] mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#EAF6FC] text-[#55B9E8] flex items-center justify-center text-xs font-bold">1</span>
                  <span>Member Account (Required for Booking)</span>
                </div>
                {user && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Signed In
                  </span>
                )}
              </h3>

              {user ? (
                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-[#EAF6FC] rounded-2xl border border-[#55B9E8]/30 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#718596] uppercase block">Authenticated As</span>
                      <span className="font-bold text-[#123B5D] text-sm">{user.full_name}</span>
                      <span className="text-[#718596] block text-[11px]">{user.email}</span>
                    </div>
                    <span className="px-2.5 py-1 bg-white text-[#123B5D] rounded-lg font-bold text-[10px] border border-[#DCE5EB]">
                      {user.role.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-[#718596] uppercase tracking-wider block mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        disabled
                        value={user.full_name}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F7F9] border border-[#DCE5EB] text-[#183247] font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-[#718596] uppercase tracking-wider block mb-1">
                        Mobile Number
                      </label>
                      <input
                        type="text"
                        disabled
                        value={user.phone || 'Recorded in profile'}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F7F9] border border-[#DCE5EB] text-[#183247] font-semibold"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* INLINE SIGN IN / SIGN UP TABBED COMPONENT FOR UNREGISTERED USERS */
                <div className="space-y-4 text-xs">
                  <div className="flex border-b border-[#DCE5EB] text-xs font-bold text-[#718596]">
                    <button
                      type="button"
                      onClick={() => setAuthMode('signin')}
                      className={`flex-1 pb-2.5 text-center transition-colors ${
                        authMode === 'signin'
                          ? 'border-b-2 border-[#55B9E8] text-[#123B5D]'
                          : 'hover:text-[#183247]'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode('signup')}
                      className={`flex-1 pb-2.5 text-center transition-colors ${
                        authMode === 'signup'
                          ? 'border-b-2 border-[#55B9E8] text-[#123B5D]'
                          : 'hover:text-[#183247]'
                      }`}
                    >
                      Create Account
                    </button>
                  </div>

                  {authError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{authError}</span>
                    </div>
                  )}

                  {/* Google Quick Button */}
                  <button
                    type="button"
                    onClick={handleInlineGoogle}
                    disabled={authLoading}
                    className="w-full py-2.5 px-3 rounded-xl border border-[#DCE5EB] bg-white hover:bg-[#F5F7F9] text-[#183247] text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
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
                    <span>Continue with Google</span>
                  </button>

                  <div className="relative flex items-center justify-center">
                    <div className="border-t border-[#DCE5EB] w-full"></div>
                    <span className="bg-white px-2 text-[10px] text-[#718596] uppercase">Or</span>
                  </div>

                  {authMode === 'signin' ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-bold text-[#718596] block mb-1">Email</label>
                        <input
                          type="email"
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          placeholder="e.g. member@example.com"
                          className="w-full px-3 py-2 rounded-xl border border-[#DCE5EB]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-[#718596] block mb-1">Password</label>
                        <input
                          type="password"
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-3 py-2 rounded-xl border border-[#DCE5EB]"
                        />
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleInlineSignIn}
                          disabled={authLoading}
                          className="flex-1 py-2.5 bg-[#123B5D] hover:bg-[#183247] text-white rounded-xl font-bold uppercase tracking-wider text-xs"
                        >
                          {authLoading ? 'Signing in...' : 'Sign In & Continue'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAuthEmail('rahul.sharma@example.com');
                            setAuthPassword('MemberPassword123!');
                          }}
                          className="px-3 py-2.5 bg-[#EAF6FC] text-[#123B5D] rounded-xl font-bold text-xs"
                        >
                          Demo Login
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-bold text-[#718596] block mb-1">Full Name</label>
                        <input
                          type="text"
                          value={authFullName}
                          onChange={(e) => setAuthFullName(e.target.value)}
                          placeholder="Your Full Name"
                          className="w-full px-3 py-2 rounded-xl border border-[#DCE5EB]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-bold text-[#718596] block mb-1">Email</label>
                          <input
                            type="email"
                            value={authEmail}
                            onChange={(e) => setAuthEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full px-3 py-2 rounded-xl border border-[#DCE5EB]"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-[#718596] block mb-1">Phone</label>
                          <input
                            type="tel"
                            value={authPhone}
                            onChange={(e) => setAuthPhone(e.target.value)}
                            placeholder="+91..."
                            className="w-full px-3 py-2 rounded-xl border border-[#DCE5EB]"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-[#718596] block mb-1">Password</label>
                        <input
                          type="password"
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          placeholder="Min 6 characters"
                          className="w-full px-3 py-2 rounded-xl border border-[#DCE5EB]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleInlineSignUp}
                        disabled={authLoading}
                        className="w-full py-2.5 bg-[#55B9E8] hover:bg-[#48a8d6] text-white rounded-xl font-bold uppercase tracking-wider text-xs shadow-md"
                      >
                        {authLoading ? 'Registering in Firebase...' : 'Sign Up in Firebase & Proceed'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* STEP 2: PLAN SELECTOR */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DCE5EB] shadow-sm">
              <h3 className="text-lg font-bold text-[#123B5D] font-['Outfit'] mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#EAF6FC] text-[#55B9E8] flex items-center justify-center text-xs font-bold">2</span>
                <span>Select Membership Tier</span>
              </h3>

              <div className="space-y-3">
                {plans.map((p) => {
                  const isChecked = selectedPlan?.id === p.id;
                  return (
                    <label
                      key={p.id}
                      className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'border-[#55B9E8] bg-[#EAF6FC]/50 ring-2 ring-[#55B9E8]/30 shadow-sm'
                          : 'border-[#DCE5EB] hover:border-[#55B9E8]/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="plan_choice"
                          checked={isChecked}
                          onChange={() => setSelectedPlanId(p.id)}
                          className="w-4 h-4 text-[#55B9E8] focus:ring-[#55B9E8]"
                        />
                        <div>
                          <div className="font-bold text-sm text-[#123B5D] flex items-center gap-2">
                            <span>{p.name}</span>
                            {p.popular_badge === 1 && (
                              <span className="text-[9px] uppercase px-2 py-0.5 rounded-full bg-[#55B9E8] text-white font-extrabold">
                                Popular
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#718596]">{p.duration_label} Access</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-base text-[#123B5D] font-['Outfit']">
                          ₹{p.price_inr.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* STEP 3: PAYMENT METHOD */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DCE5EB] shadow-sm">
              <h3 className="text-lg font-bold text-[#123B5D] font-['Outfit'] mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#EAF6FC] text-[#55B9E8] flex items-center justify-center text-xs font-bold">3</span>
                <span>Choose Payment Method</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label
                  className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    paymentMethod === 'razorpay'
                      ? 'border-[#55B9E8] bg-[#EAF6FC]/40 ring-2 ring-[#55B9E8]/30'
                      : 'border-[#DCE5EB] hover:border-[#55B9E8]/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="payment_type"
                          checked={paymentMethod === 'razorpay'}
                          onChange={() => setPaymentMethod('razorpay')}
                          className="w-4 h-4 text-[#55B9E8]"
                        />
                        <span className="font-bold text-sm text-[#123B5D]">Online Payment</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                        Instant
                      </span>
                    </div>
                    <p className="text-[11px] text-[#718596] leading-relaxed mb-3">
                      Powered by Razorpay. Supports UPI, Google Pay, PhonePe, Debit/Credit Cards & NetBanking.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-emerald-600 font-semibold pt-2 border-t border-[#DCE5EB]/60">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Activates membership immediately</span>
                  </div>
                </label>

                <label
                  className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    paymentMethod === 'offline'
                      ? 'border-[#55B9E8] bg-[#EAF6FC]/40 ring-2 ring-[#55B9E8]/30'
                      : 'border-[#DCE5EB] hover:border-[#55B9E8]/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="payment_type"
                          checked={paymentMethod === 'offline'}
                          onChange={() => setPaymentMethod('offline')}
                          className="w-4 h-4 text-[#55B9E8]"
                        />
                        <span className="font-bold text-sm text-[#123B5D]">Pay at Gym Desk</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-amber-100 text-amber-800">
                        Pending
                      </span>
                    </div>
                    <p className="text-[11px] text-[#718596] leading-relaxed mb-3">
                      Reserve your membership slot online and pay Cash, Card, or UPI at our Bandra West front desk.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-amber-600 font-semibold pt-2 border-t border-[#DCE5EB]/60">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Requires front desk admin verification</span>
                  </div>
                </label>
              </div>

              <div className="mt-4">
                <label className="text-[11px] font-bold text-[#718596] uppercase tracking-wider block mb-1">
                  Special Notes or Fitness Objectives (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Interested in personal training assessment, morning lockers..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DCE5EB] text-xs text-[#183247] focus:outline-none focus:border-[#55B9E8]"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Execution */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 bg-white p-6 sm:p-8 rounded-3xl border border-[#DCE5EB] shadow-lg space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#DCE5EB]">
                <h3 className="text-lg font-bold text-[#123B5D] font-['Outfit']">
                  Booking Summary
                </h3>
                <span className="text-[10px] font-bold text-[#55B9E8] uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Firebase Sync
                </span>
              </div>

              {selectedPlan ? (
                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-[11px] text-[#718596] font-semibold uppercase tracking-wider block">
                      Selected Plan
                    </span>
                    <h4 className="text-base font-bold text-[#123B5D]">{selectedPlan.name}</h4>
                    <span className="text-xs text-[#55B9E8] font-bold">
                      Duration: {selectedPlan.duration_label}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F5F7F9] space-y-2 text-[#183247]">
                    <div className="flex justify-between">
                      <span className="text-[#718596]">Plan Base Fee:</span>
                      <span className="font-semibold">₹{selectedPlan.price_inr.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#718596]">Registration & Assessment:</span>
                      <span className="font-semibold text-emerald-600">FREE (₹0)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#718596]">Goods & Services Tax (GST 18%):</span>
                      <span className="font-semibold text-emerald-600">Inclusive</span>
                    </div>
                    <div className="pt-2 border-t border-[#DCE5EB] flex justify-between items-baseline text-sm">
                      <span className="font-bold text-[#123B5D]">Total Payable:</span>
                      <span className="font-black text-xl text-[#123B5D] font-['Outfit']">
                        ₹{selectedPlan.price_inr.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-[11px] text-[#718596]">
                    <div className="flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-[#55B9E8]" />
                      <span>256-bit bank-grade encryption</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-[#55B9E8]" />
                      <span>Official digital tax invoice generated</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !user}
                    className={`w-full py-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 ${
                      !user
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                        : loading
                        ? 'bg-[#55B9E8] text-white opacity-75'
                        : 'bg-gradient-to-r from-[#55B9E8] to-[#123B5D] text-white hover:opacity-95'
                    }`}
                  >
                    {loading ? (
                      <span>Saving Booking to Firebase...</span>
                    ) : (
                      <>
                        <span>{paymentMethod === 'razorpay' ? 'Continue to Razorpay Checkout' : 'Submit Offline Booking'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {!user && (
                    <p className="text-[11px] text-center text-red-500 font-semibold">
                      Please sign in or register in Step 1 above to book.
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-[#718596]">Please select a plan to view summary.</p>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* RAZORPAY MODAL */}
      {showRazorpayModal && createdOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#DCE5EB] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-[#0C2340] text-white p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#55B9E8] flex items-center justify-center text-[#123B5D] font-black text-sm">
                    A
                  </div>
                  <div>
                    <h4 className="font-bold text-sm tracking-wide">Aura Luxury Fitness Club</h4>
                    <span className="text-[10px] text-[#55B9E8] uppercase tracking-wider">
                      Razorpay Checkout (Test Mode)
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowRazorpayModal(false)}
                  className="text-white/60 hover:text-white text-xs"
                >
                  Cancel
                </button>
              </div>

              <div className="p-3 bg-white/10 rounded-xl flex items-center justify-between text-xs">
                <span>{createdOrder.plan_name}</span>
                <span className="font-black text-base text-[#55B9E8]">
                  ₹{createdOrder.amount_inr.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex border-b border-[#DCE5EB] text-xs font-bold text-[#718596]">
                <button
                  type="button"
                  onClick={() => setSelectedOnlineMethod('upi')}
                  className={`flex-1 pb-3 text-center transition-colors ${
                    selectedOnlineMethod === 'upi'
                      ? 'border-b-2 border-[#55B9E8] text-[#123B5D]'
                      : 'hover:text-[#183247]'
                  }`}
                >
                  UPI / QR
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOnlineMethod('card')}
                  className={`flex-1 pb-3 text-center transition-colors ${
                    selectedOnlineMethod === 'card'
                      ? 'border-b-2 border-[#55B9E8] text-[#123B5D]'
                      : 'hover:text-[#183247]'
                  }`}
                >
                  Cards
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOnlineMethod('netbanking')}
                  className={`flex-1 pb-3 text-center transition-colors ${
                    selectedOnlineMethod === 'netbanking'
                      ? 'border-b-2 border-[#55B9E8] text-[#123B5D]'
                      : 'hover:text-[#183247]'
                  }`}
                >
                  NetBanking
                </button>
              </div>

              {selectedOnlineMethod === 'upi' && (
                <div className="space-y-3 py-2 text-xs">
                  <div>
                    <label className="text-[11px] font-bold text-[#718596] block mb-1">
                      Enter UPI ID (Google Pay / PhonePe / Paytm)
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@okhdfcbank"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE5EB] font-semibold text-[#183247]"
                    />
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-[11px] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Instant automatic verification & Firestore synchronization</span>
                  </div>
                </div>
              )}

              {selectedOnlineMethod === 'card' && (
                <div className="space-y-3 py-2 text-xs">
                  <input
                    type="text"
                    disabled
                    value="4242 •••• •••• 4242"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F7F9] border border-[#DCE5EB] font-mono text-[#183247]"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      disabled
                      value="12 / 28"
                      className="px-3.5 py-2.5 rounded-xl bg-[#F5F7F9] border border-[#DCE5EB] font-mono text-[#183247]"
                    />
                    <input
                      type="text"
                      disabled
                      value="•••"
                      className="px-3.5 py-2.5 rounded-xl bg-[#F5F7F9] border border-[#DCE5EB] font-mono text-[#183247]"
                    />
                  </div>
                </div>
              )}

              {selectedOnlineMethod === 'netbanking' && (
                <div className="py-2 text-xs space-y-2">
                  <div className="p-3 rounded-xl border border-[#DCE5EB] bg-[#F5F7F9] flex items-center justify-between">
                    <span className="font-bold text-[#123B5D]">HDFC Bank / ICICI / SBI Priority</span>
                    <span className="text-[10px] text-[#55B9E8] font-bold">Supported</span>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleCompleteRazorpay}
                disabled={isProcessingPayment}
                className="w-full py-4 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isProcessingPayment ? (
                  <span>Authenticating with Bank...</span>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Pay ₹{createdOrder.amount_inr.toLocaleString('en-IN')} (Simulate Success)</span>
                  </>
                )}
              </button>

              <p className="text-[10px] text-center text-[#718596]">
                Simulating verified payment for test order. Membership will be stored in Firestore.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
