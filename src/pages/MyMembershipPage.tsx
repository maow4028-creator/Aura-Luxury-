import React, { useEffect, useState } from 'react';
import { ActiveMembership, MembershipHistoryItem, MembershipPlan } from '../types';
import { useAuth } from '../context/AuthContext';
import { ReceiptModal } from '../components/ReceiptModal';
import {
  CreditCard,
  ShieldCheck,
  Calendar,
  Clock,
  Printer,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Dumbbell,
  Sparkles,
} from 'lucide-react';

interface MyMembershipPageProps {
  navigate: (page: string, params?: any) => void;
}

export const MyMembershipPage: React.FC<MyMembershipPageProps> = ({ navigate }) => {
  const { user, token } = useAuth();
  const [membershipData, setMembershipData] = useState<{
    has_membership: boolean;
    membership?: ActiveMembership;
    pending_booking?: any;
    recent_cancelled_booking?: any;
    user_name?: string;
  } | null>(null);
  const [history, setHistory] = useState<MembershipHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeReceiptNumber, setActiveReceiptNumber] = useState<string | null>(null);

  // Renew Modal State
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);

  const fetchMembershipInfo = async () => {
    if (!token) return;
    try {
      const [resActive, resHistory, resPlans] = await Promise.all([
        fetch('/api/memberships/my-active', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/memberships/history', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/plans'),
      ]);

      const activeJson = await resActive.json();
      const historyJson = await resHistory.json();
      const plansJson = await resPlans.json();

      setMembershipData(activeJson);
      setHistory(historyJson.history || []);
      setPlans(plansJson.plans || []);
    } catch (err) {
      console.error('Error fetching membership info:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembershipInfo();
  }, [token]);

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#F5F7F9] py-16 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-[#DCE5EB] text-center shadow-lg">
          <CreditCard className="w-12 h-12 text-[#55B9E8] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#123B5D] font-['Outfit'] mb-2">
            Sign In Required
          </h2>
          <p className="text-xs text-[#718596] mb-6">
            Please log in to view your live membership status, duration counter, and printable invoices.
          </p>
          <button
            onClick={() => navigate('login', { returnTo: 'my-membership' })}
            className="w-full py-3 bg-[#123B5D] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#183247] transition-all"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const membership = membershipData?.membership;

  // Status badge styling per requirement B:
  // ACTIVE – Green, PENDING – Orange, EXPIRED – Red, CANCELLED – Grey
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            ACTIVE
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            PENDING
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            EXPIRED
          </span>
        );
      case 'CANCELLED':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-300">
            CANCELLED
          </span>
        );
    }
  };

  return (
    <div className="bg-[#F5F7F9] min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#DCE5EB] shadow-sm">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#55B9E8] block mb-1">
              Member Subscription Dashboard
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#123B5D] font-['Outfit'] uppercase">
              MY MEMBERSHIP
            </h1>
            <p className="text-xs text-[#718596] mt-0.5">
              Live subscription tracking, automatic expiry calculation, and official payment receipts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowRenewModal(true)}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#55B9E8] to-[#123B5D] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md hover:opacity-95 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Renew Membership</span>
            </button>
            <button
              onClick={fetchMembershipInfo}
              title="Refresh Membership Status"
              className="p-3 bg-[#EAF6FC] hover:bg-[#DCE5EB] text-[#123B5D] rounded-xl text-xs font-bold transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================= */}
        {/* PENDING MEMBERSHIP (WAITING FOR APPROVAL) */}
        {/* ========================================= */}
        {membershipData?.pending_booking && (
          <div className="bg-white rounded-3xl border-2 border-amber-300 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
            {/* Amber/Orange Top Accent Strip */}
            <div className="h-2.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400" />

            <div className="p-6 sm:p-10 space-y-6">
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#DCE5EB]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-sm">
                    <Clock className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#718596] block">
                        Booking ID: <strong className="text-[#123B5D] font-mono">{membershipData.pending_booking.booking_code}</strong>
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[9px] font-black uppercase tracking-wider">
                        Waiting for Approval
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-[#123B5D] font-['Outfit'] mt-0.5">
                      {membershipData.pending_booking.plan_name} ({membershipData.pending_booking.duration_label || 'Membership'})
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {renderStatusBadge('PENDING')}
                </div>
              </div>

              {/* Status Notice */}
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-xs text-[#183247] space-y-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-[#123B5D]">Offline Payment & Desk Approval in Progress</h4>
                    <p className="text-[#718596] mt-1 leading-relaxed">
                      Your booking request is registered in the club database and is currently <strong>WAITING FOR APPROVAL</strong>. Please visit the front desk at Linking Road, Bandra West to complete verification and payment. Once approved by our team, your membership activates immediately.
                    </p>
                  </div>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-[#F5F7F9] border border-[#DCE5EB]/60">
                  <span className="text-[10px] font-bold text-[#718596] uppercase tracking-wider block mb-1">
                    Booked Plan
                  </span>
                  <span className="font-bold text-[#123B5D] text-sm block truncate">
                    {membershipData.pending_booking.plan_name}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#F5F7F9] border border-[#DCE5EB]/60">
                  <span className="text-[10px] font-bold text-[#718596] uppercase tracking-wider block mb-1">
                    Amount Payable
                  </span>
                  <span className="font-black text-[#123B5D] text-sm block">
                    ₹{membershipData.pending_booking.amount_inr?.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#F5F7F9] border border-[#DCE5EB]/60">
                  <span className="text-[10px] font-bold text-[#718596] uppercase tracking-wider block mb-1">
                    Payment Method
                  </span>
                  <span className="font-bold text-[#183247] text-sm block">
                    {membershipData.pending_booking.payment_method === 'offline' ? 'Pay at Gym Desk' : 'Online (Pending)'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#F5F7F9] border border-[#DCE5EB]/60">
                  <span className="text-[10px] font-bold text-[#718596] uppercase tracking-wider block mb-1">
                    Booking Date
                  </span>
                  <span className="font-medium text-[#718596] text-xs block">
                    {new Date(membershipData.pending_booking.created_at || Date.now()).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#DCE5EB]">
                <div className="text-xs text-[#718596] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#55B9E8]" />
                  <span>Front desk concierge: <strong>+91 91528 77826</strong></span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <a
                    href={`https://wa.me/919152877826?text=${encodeURIComponent(`Hello Aura Concierge, I would like to verify my offline membership booking #${membershipData.pending_booking.booking_code} for ${membershipData.pending_booking.plan_name}.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 sm:flex-initial px-4 py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors text-center"
                  >
                    WhatsApp Concierge
                  </a>
                  <button
                    onClick={() => navigate('booking', { planId: membershipData.pending_booking.plan_id })}
                    className="flex-1 sm:flex-initial px-4 py-2.5 bg-[#123B5D] hover:bg-[#183247] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors text-center"
                  >
                    Pay Online to Activate
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RECENTLY DECLINED / REJECTED BOOKING NOTICE */}
        {membershipData?.recent_cancelled_booking && !membershipData?.has_membership && !membershipData?.pending_booking && (
          <div className="bg-white rounded-3xl border border-rose-200 p-6 sm:p-8 shadow-sm space-y-4 animate-in fade-in">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                <XCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full">
                    Booking Request Declined
                  </span>
                  <span className="text-xs text-[#718596] font-mono">
                    #{membershipData.recent_cancelled_booking.booking_code}
                  </span>
                </div>
                <h4 className="text-base font-bold text-[#123B5D] font-['Outfit'] mt-1">
                  {membershipData.recent_cancelled_booking.plan_name} — ₹{membershipData.recent_cancelled_booking.amount_inr?.toLocaleString('en-IN')}
                </h4>
                <p className="text-xs text-[#718596] mt-1 leading-relaxed">
                  Reason provided by club desk: <strong>{membershipData.recent_cancelled_booking.admin_notes || 'Payment not completed or declined at front desk.'}</strong>
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => navigate('membership')}
                    className="px-4 py-2 bg-[#123B5D] hover:bg-[#183247] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    Select a New Plan
                  </button>
                  <a
                    href="https://wa.me/919152877826"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-[#EAF6FC] hover:bg-[#DCE5EB] text-[#123B5D] rounded-xl text-xs font-bold transition-colors"
                  >
                    Speak with Concierge
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="bg-white p-16 rounded-3xl border border-[#DCE5EB] text-center shadow-sm">
            <div className="w-10 h-10 border-4 border-[#55B9E8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xs text-[#718596] font-semibold">Calculating live membership days...</p>
          </div>
        ) : membership ? (
          /* ========================================= */
          /* SECTION A - D: CURRENT ACTIVE MEMBERSHIP CARD */
          /* ========================================= */
          <div className="bg-white rounded-3xl border border-[#DCE5EB] shadow-xl overflow-hidden">
            {/* Top Accent Strip */}
            <div className="h-2.5 bg-gradient-to-r from-[#55B9E8] via-[#123B5D] to-[#55B9E8]" />

            <div className="p-6 sm:p-10 space-y-8">
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#DCE5EB]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#EAF6FC] flex items-center justify-center text-[#55B9E8] shadow-sm">
                    <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#718596] block">
                      Membership ID: <strong className="text-[#123B5D] font-mono">{membership.membership_code}</strong>
                    </span>
                    <h2 className="text-2xl font-black text-[#123B5D] font-['Outfit']">
                      {membership.plan_name}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {renderStatusBadge(membership.status)}
                  {membership.receipt_number && (
                    <button
                      onClick={() => setActiveReceiptNumber(membership.receipt_number!)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F7F9] hover:bg-[#EAF6FC] border border-[#DCE5EB] rounded-xl text-xs font-bold text-[#123B5D] transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#55B9E8]" />
                      <span>View / Print Receipt</span>
                    </button>
                  )}
                </div>
              </div>

              {/* SECTION C & D: REMAINING DAYS & PROGRESS BAR */}
              <div className="bg-[#EAF6FC] p-6 sm:p-8 rounded-2xl border border-[#55B9E8]/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <span className="text-[11px] font-bold text-[#718596] uppercase tracking-wider block">
                      Automatic Expiry Calculation
                    </span>
                    <div className="text-3xl sm:text-4xl font-black text-[#123B5D] font-['Outfit'] mt-1 flex items-center gap-2">
                      <Clock className="w-7 h-7 text-[#55B9E8]" />
                      <span>{membership.remaining_days} Days Remaining</span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[11px] font-bold text-[#718596] uppercase tracking-wider block">
                      Subscription Progress
                    </span>
                    <span className="text-2xl font-black text-[#123B5D] font-mono">
                      {membership.progress_percentage}%
                    </span>
                  </div>
                </div>

                {/* D. Animated Progress Bar */}
                <div className="w-full h-3.5 bg-white rounded-full overflow-hidden p-0.5 border border-[#55B9E8]/30">
                  <div
                    className="h-full bg-gradient-to-r from-[#55B9E8] to-[#123B5D] rounded-full transition-all duration-1000"
                    style={{ width: `${membership.progress_percentage}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-xs font-semibold text-[#183247] mt-3">
                  <span>Start Date: <strong>{membership.formatted_start_date}</strong></span>
                  <span>Expiry Date: <strong>{membership.formatted_expiry_date}</strong></span>
                </div>
              </div>

              {/* Data Grid: Details as specified in prompt */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-[#F5F7F9] border border-[#DCE5EB]/60">
                  <span className="text-[10px] font-bold text-[#718596] uppercase tracking-wider block mb-1">
                    Member Name
                  </span>
                  <span className="font-bold text-[#123B5D] text-sm block truncate">
                    {membership.member_name}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#F5F7F9] border border-[#DCE5EB]/60">
                  <span className="text-[10px] font-bold text-[#718596] uppercase tracking-wider block mb-1">
                    Membership Price
                  </span>
                  <span className="font-black text-[#123B5D] text-sm block">
                    ₹{membership.price_inr.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#F5F7F9] border border-[#DCE5EB]/60">
                  <span className="text-[10px] font-bold text-[#718596] uppercase tracking-wider block mb-1">
                    Payment Status
                  </span>
                  <span className="font-extrabold text-emerald-600 text-sm block uppercase">
                    {membership.payment_status}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#F5F7F9] border border-[#DCE5EB]/60">
                  <span className="text-[10px] font-bold text-[#718596] uppercase tracking-wider block mb-1">
                    Receipt #
                  </span>
                  <span className="font-mono font-bold text-[#183247] text-sm block truncate">
                    {membership.receipt_number || 'Offline Pending'}
                  </span>
                </div>
              </div>

              {/* Included Benefits in Active Plan */}
              {membership.features && membership.features.length > 0 && (
                <div className="pt-4 border-t border-[#DCE5EB]">
                  <span className="text-xs font-bold text-[#123B5D] uppercase tracking-wider block mb-3 font-['Outfit']">
                    Included Club Privileges & Access:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#183247]">
                    {membership.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#55B9E8] shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : !membershipData?.pending_booking ? (
          /* State: No active membership AND no pending booking */
          <div className="bg-white rounded-3xl border border-[#DCE5EB] p-10 text-center shadow-md">
            <div className="w-16 h-16 rounded-full bg-[#EAF6FC] text-[#55B9E8] flex items-center justify-center mx-auto mb-4">
              <Dumbbell className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-[#123B5D] font-['Outfit'] mb-2">
              No Active Membership Found
            </h3>
            <p className="text-xs text-[#718596] max-w-md mx-auto mb-6">
              You do not have an active membership subscription at Aura. Explore our flexible monthly, quarterly, or annual plans to join today.
            </p>

            <button
              onClick={() => navigate('membership')}
              className="px-8 py-3.5 bg-gradient-to-r from-[#55B9E8] to-[#123B5D] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md hover:opacity-95 transition-all"
            >
              Choose a Membership Plan
            </button>
          </div>
        ) : null}

        {/* ========================================= */}
        {/* SECTION E: MEMBERSHIP HISTORY */}
        {/* ========================================= */}
        <div className="bg-white rounded-3xl border border-[#DCE5EB] shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#123B5D] font-['Outfit']">
                Membership History & Invoices
              </h3>
              <p className="text-xs text-[#718596]">Permanent database record of your previous and active subscriptions.</p>
            </div>
          </div>

          {history.length === 0 ? (
            <p className="text-xs text-[#718596] py-6 text-center italic">No prior membership records found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F7F9] text-[#123B5D] font-bold uppercase tracking-wider border-b border-[#DCE5EB]">
                  <tr>
                    <th className="p-3">Plan Name</th>
                    <th className="p-3">Duration</th>
                    <th className="p-3">Amount Paid</th>
                    <th className="p-3">Payment</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE5EB]/60">
                  {history.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F5F7F9]/50 transition-colors">
                      <td className="p-3 font-bold text-[#183247]">
                        {item.plan_name}
                        <span className="block text-[10px] text-[#718596] font-mono">{item.membership_code}</span>
                      </td>
                      <td className="p-3 text-[#718596]">
                        {item.formatted_start_date} to {item.formatted_expiry_date}
                      </td>
                      <td className="p-3 font-bold text-[#123B5D]">
                        ₹{item.price_inr.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700">
                          {item.payment_status}
                        </span>
                      </td>
                      <td className="p-3">
                        {renderStatusBadge(item.status)}
                      </td>
                      <td className="p-3 text-right">
                        {item.receipt_number ? (
                          <button
                            onClick={() => setActiveReceiptNumber(item.receipt_number!)}
                            className="text-[#55B9E8] font-bold hover:underline inline-flex items-center gap-1"
                          >
                            <Printer className="w-3 h-3" />
                            <span>{item.receipt_number}</span>
                          </button>
                        ) : (
                          <span className="text-[#718596] italic">Pending</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ========================================= */}
      {/* SECTION F: RENEW MEMBERSHIP MODAL */}
      {/* ========================================= */}
      {showRenewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#DCE5EB] p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#DCE5EB]">
              <div>
                <span className="text-[10px] font-bold text-[#55B9E8] uppercase tracking-wider block">
                  Seamless Extension
                </span>
                <h3 className="text-xl font-bold text-[#123B5D] font-['Outfit']">
                  Renew or Upgrade Membership
                </h3>
              </div>
              <button
                onClick={() => setShowRenewModal(false)}
                className="text-[#718596] hover:text-[#183247] font-bold text-sm px-2 py-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#718596] my-4 leading-relaxed">
              Renewing your membership seamlessly extends your active expiry date without resetting your fitness streak or deleting previous transaction records.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {plans.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl border border-[#DCE5EB] hover:border-[#55B9E8] flex flex-col justify-between transition-colors bg-[#F5F7F9]"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-[#123B5D]">{p.name}</h4>
                      <span className="text-[10px] font-extrabold text-[#55B9E8]">{p.duration_label}</span>
                    </div>
                    <div className="text-lg font-black text-[#123B5D] font-['Outfit'] my-1">
                      ₹{p.price_inr.toLocaleString('en-IN')}
                    </div>
                    <p className="text-[11px] text-[#718596] line-clamp-2">{p.description}</p>
                  </div>

                  <button
                    onClick={() => {
                      setShowRenewModal(false);
                      navigate('booking', { planId: p.id });
                    }}
                    className="mt-4 w-full py-2.5 bg-[#123B5D] hover:bg-[#183247] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    Select & Pay
                  </button>
                </div>
              ))}
            </div>

            <div className="text-right">
              <button
                onClick={() => setShowRenewModal(false)}
                className="px-5 py-2.5 bg-[#EAF6FC] text-[#123B5D] rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* SECTION G: RECEIPT MODAL */}
      {/* ========================================= */}
      {activeReceiptNumber && (
        <ReceiptModal
          receiptNumber={activeReceiptNumber}
          onClose={() => setActiveReceiptNumber(null)}
        />
      )}
    </div>
  );
};
