import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ReceiptModal } from '../components/ReceiptModal';
import {
  ShieldCheck,
  Users,
  CreditCard,
  AlertTriangle,
  Clock,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  Calendar,
  Settings,
  Edit3,
  Trash2,
  RefreshCw,
  Printer,
  ChevronRight,
  TrendingUp,
  UserCheck,
  FileText,
  DollarSign,
  Phone,
  Mail,
  Lock,
  ArrowRight,
  KeyRound,
  Filter,
  Check,
  ExternalLink,
} from 'lucide-react';

interface AdminDashboardPageProps {
  navigate: (page: string, params?: any) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ navigate }) => {
  const { user, token, login, logout, signInWithFirebase } = useAuth();

  // Tab state: default to 'bookings' for immediate booking management!
  const [activeTab, setActiveTab] = useState<'bookings' | 'overview' | 'members' | 'payments' | 'plans' | 'logs'>('bookings');

  // Live Data states
  const [stats, setStats] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Booking filters & search
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState<'ALL' | 'PENDING_APPROVAL' | 'CONFIRMED' | 'CANCELLED'>('ALL');

  // Member search & filter
  const [memberSearch, setMemberSearch] = useState('');
  const [memberFilter, setMemberFilter] = useState('');

  // Modals
  const [showAddBookingModal, setShowAddBookingModal] = useState(false);
  const [showEditBookingModal, setShowEditBookingModal] = useState(false);
  const [selectedBookingForEdit, setSelectedBookingForEdit] = useState<any | null>(null);
  const [extendModalMember, setExtendModalMember] = useState<any | null>(null);
  const [extendDays, setExtendDays] = useState(30);
  const [extendNotes, setExtendNotes] = useState('Admin VIP Extension');
  const [activeReceiptNumber, setActiveReceiptNumber] = useState<string | null>(null);

  // Dedicated Approve & Reject Modal States
  const [bookingToApprove, setBookingToApprove] = useState<any | null>(null);
  const [approvalPaymentMethod, setApprovalPaymentMethod] = useState('Cash at Front Desk');
  const [approvalStartDate, setApprovalStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [approvalNotes, setApprovalNotes] = useState('Payment verified at front desk by admin');
  const [approvingLoading, setApprovingLoading] = useState(false);

  const [bookingToReject, setBookingToReject] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Payment not received at front desk');
  const [rejectingLoading, setRejectingLoading] = useState(false);

  // New Plan modal
  const [newPlanModal, setNewPlanModal] = useState(false);
  const [planForm, setPlanForm] = useState({
    name: '',
    duration_months: 1,
    duration_label: '1 Month',
    price_inr: 2999,
    description: '',
    features_input: 'Club access\nLocker access\nSteam room',
    popular_badge: false,
  });

  // Admin In-Page Login Form State
  const [adminLoginForm, setAdminLoginForm] = useState({
    email: 'maow4028@gmail.com',
    password: '',
  });
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState<string | null>(null);

  // Add Booking Form State
  const [addBookingForm, setAddBookingForm] = useState<{
    memberMode: 'existing' | 'new';
    user_id: string;
    full_name: string;
    email: string;
    phone: string;
    plan_id: string;
    amount_inr: string;
    payment_method: string;
    payment_status: 'PAID' | 'PENDING';
    booking_status: 'CONFIRMED' | 'PENDING_APPROVAL';
    start_date: string;
    admin_notes: string;
  }>({
    memberMode: 'existing',
    user_id: '',
    full_name: '',
    email: '',
    phone: '',
    plan_id: '',
    amount_inr: '',
    payment_method: 'Cash at Desk',
    payment_status: 'PAID',
    booking_status: 'CONFIRMED',
    start_date: new Date().toISOString().split('T')[0],
    admin_notes: 'Created via Admin Portal',
  });
  const [creatingBooking, setCreatingBooking] = useState(false);

  // Load all admin data
  const loadAdminData = async () => {
    if (!token || user?.role !== 'admin') return;
    setLoading(true);
    try {
      const [resStats, resBookings, resMembers, resPayments, resPlans, resLogs] = await Promise.all([
        fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/admin/bookings?status=${bookingStatusFilter}&search=${encodeURIComponent(bookingSearch)}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/admin/members?search=${encodeURIComponent(memberSearch)}&status=${memberFilter}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/admin/payments', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/plans'),
        fetch('/api/admin/activity-logs', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const [statsData, bookingsData, membersData, paymentsData, plansData, logsData] = await Promise.all([
        resStats.json(),
        resBookings.json(),
        resMembers.json(),
        resPayments.json(),
        resPlans.json(),
        resLogs.json(),
      ]);

      setStats(statsData.stats || null);
      setBookings(bookingsData.bookings || []);
      setMembers(membersData.members || []);
      setPayments(paymentsData.payments || []);
      setPlans(plansData.plans || []);
      setLogs(logsData.logs || []);

      // If adding booking form has no plan selected yet, default to first plan
      if (plansData.plans && plansData.plans.length > 0 && !addBookingForm.plan_id) {
        setAddBookingForm((prev) => ({
          ...prev,
          plan_id: String(plansData.plans[0].id),
          amount_inr: String(plansData.plans[0].price_inr),
        }));
      }

      // If adding booking form has no user selected yet, default to first member
      if (membersData.members && membersData.members.length > 0 && !addBookingForm.user_id) {
        setAddBookingForm((prev) => ({
          ...prev,
          user_id: String(membersData.members[0].id),
        }));
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [token, user?.role, bookingSearch, bookingStatusFilter, memberSearch, memberFilter]);

  // Handle in-page admin login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginLoading(true);
    setAdminLoginError(null);

    try {
      // 1. Try Firebase Auth first
      try {
        const loggedInUser = await signInWithFirebase(adminLoginForm.email, adminLoginForm.password);
        if (loggedInUser.role !== 'admin') {
          throw new Error('Access denied: Account does not have administrator privileges.');
        }
        return;
      } catch (fbErr: any) {
        console.warn('Firebase login attempt fallback to local server:', fbErr.message);
      }

      // 2. Local Database Auth fallback
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminLoginForm.email,
          password: adminLoginForm.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please verify credentials.');
      }

      if (data.user?.role !== 'admin') {
        throw new Error('Access denied: User account is not an authorized administrator.');
      }

      login(data.token, data.user);
    } catch (err: any) {
      setAdminLoginError(err.message || 'Failed to authenticate administrator.');
    } finally {
      setAdminLoginLoading(false);
    }
  };

  // Quick autofill & sign-in for the requested admin credentials
  const handleQuickAdminLogin = () => {
    setAdminLoginForm({
      email: 'maow4028@gmail.com',
      password: '202020',
    });
  };

  // ==========================================
  // BOOKING ACTION HANDLERS
  // ==========================================

  // Open dedicated Approval Modal
  const handleOpenApproveModal = (b: any) => {
    setBookingToApprove(b);
    setApprovalPaymentMethod(b.payment_method === 'offline' ? 'Cash at Front Desk' : b.payment_method || 'Cash at Front Desk');
    setApprovalStartDate(new Date().toISOString().split('T')[0]);
    setApprovalNotes(`Approved and verified at front desk by admin (${user?.full_name || 'Admin'})`);
  };

  // Submit Approval
  const handleConfirmApprove = async () => {
    if (!bookingToApprove) return;
    setApprovingLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingToApprove.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          payment_method: approvalPaymentMethod,
          start_date: approvalStartDate,
          notes: approvalNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert(`✓ Membership Activated Successfully!\nBooking Code: ${bookingToApprove.booking_code}\nOfficial Tax Receipt: ${data.receipt_number}\nActive Validity Until: ${data.expiry_date}`);
      setBookingToApprove(null);
      loadAdminData();
    } catch (err: any) {
      alert(`Approval Error: ${err.message}`);
    } finally {
      setApprovingLoading(false);
    }
  };

  // Open dedicated Rejection Modal
  const handleOpenRejectModal = (b: any) => {
    setBookingToReject(b);
    setRejectionReason('Payment not received at front desk');
  };

  // Submit Rejection
  const handleConfirmReject = async () => {
    if (!bookingToReject) return;
    setRejectingLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingToReject.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: rejectionReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert(`✓ Booking #${bookingToReject.booking_code} has been rejected and cancelled. Member has been notified.`);
      setBookingToReject(null);
      loadAdminData();
    } catch (err: any) {
      alert(`Rejection Error: ${err.message}`);
    } finally {
      setRejectingLoading(false);
    }
  };

  // Delete booking
  const handleDeleteBooking = async (bookingId: number, bookingCode: string) => {
    if (!confirm(`Are you sure you want to permanently delete booking ${bookingCode}?`)) return;
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert(data.message || 'Booking deleted successfully.');
      loadAdminData();
    } catch (err: any) {
      alert(`Deletion Error: ${err.message}`);
    }
  };

  // Open Edit Booking modal
  const handleOpenEditBooking = (b: any) => {
    setSelectedBookingForEdit({
      ...b,
      amount_inr: String(b.amount_inr),
    });
    setShowEditBookingModal(true);
  };

  // Submit Edit Booking
  const handleSaveEditBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForEdit) return;

    try {
      const res = await fetch(`/api/admin/bookings/${selectedBookingForEdit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          booking_status: selectedBookingForEdit.booking_status,
          payment_status: selectedBookingForEdit.payment_status,
          payment_method: selectedBookingForEdit.payment_method,
          admin_notes: selectedBookingForEdit.admin_notes,
          amount_inr: selectedBookingForEdit.amount_inr,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert('Booking updated successfully.');
      setShowEditBookingModal(false);
      setSelectedBookingForEdit(null);
      loadAdminData();
    } catch (err: any) {
      alert(`Update Error: ${err.message}`);
    }
  };

  // Submit Add New Booking from Admin End
  const handleCreateBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingBooking(true);

    try {
      const payload: any = {
        plan_id: Number(addBookingForm.plan_id),
        amount_inr: Number(addBookingForm.amount_inr),
        payment_method: addBookingForm.payment_method,
        payment_status: addBookingForm.payment_status,
        booking_status: addBookingForm.booking_status,
        start_date: addBookingForm.start_date,
        admin_notes: addBookingForm.admin_notes,
      };

      if (addBookingForm.memberMode === 'existing') {
        if (!addBookingForm.user_id) {
          throw new Error('Please select an existing member from the list.');
        }
        payload.user_id = Number(addBookingForm.user_id);
      } else {
        if (!addBookingForm.full_name || !addBookingForm.email) {
          throw new Error('Full Name and Email are required for registering a new member.');
        }
        payload.full_name = addBookingForm.full_name;
        payload.email = addBookingForm.email;
        payload.phone = addBookingForm.phone;
      }

      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert(
        `✓ ${data.message}\n` +
          `Booking Code: ${data.booking_code}\n` +
          (data.receipt_number ? `Tax Receipt: ${data.receipt_number}\n` : '') +
          (data.expiry_date ? `Active Until: ${data.expiry_date}` : '')
      );

      setShowAddBookingModal(false);
      // Reset form
      setAddBookingForm((prev) => ({
        ...prev,
        full_name: '',
        email: '',
        phone: '',
        admin_notes: 'Created via Admin Portal',
      }));

      loadAdminData();
    } catch (err: any) {
      alert(`Booking Creation Error: ${err.message}`);
    } finally {
      setCreatingBooking(false);
    }
  };

  // Extend Membership validity
  const handleExtendMembership = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extendModalMember) return;
    try {
      const res = await fetch(`/api/admin/memberships/${extendModalMember.id}/extend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          days: extendDays,
          notes: extendNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert(data.message);
      setExtendModalMember(null);
      loadAdminData();
    } catch (err: any) {
      alert(`Extension Error: ${err.message}`);
    }
  };

  // Create New Membership Plan
  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const features = planForm.features_input.split('\n').filter((f) => f.trim().length > 0);
      const res = await fetch('/api/admin/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: planForm.name,
          duration_months: Number(planForm.duration_months),
          duration_label: planForm.duration_label,
          price_inr: Number(planForm.price_inr),
          description: planForm.description,
          features,
          popular_badge: planForm.popular_badge,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert('Plan added successfully to database.');
      setNewPlanModal(false);
      loadAdminData();
    } catch (err: any) {
      alert(`Plan Creation Error: ${err.message}`);
    }
  };

  // =========================================================================
  // ACCESS CONTROL GATE: Show Dedicated Admin Login when not authenticated
  // =========================================================================
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-[85vh] flex items-center justify-center bg-[#F5F7F9] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-[#DCE5EB] shadow-2xl space-y-6">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#123B5D] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#123B5D]/20 mb-3 border border-[#55B9E8]/30">
              <ShieldCheck className="w-8 h-8 text-[#55B9E8]" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-black uppercase tracking-wider mb-2">
              <Lock className="w-3 h-3" />
              <span>Restricted Access • Administrators Only</span>
            </div>
            <h2 className="text-2xl font-black text-[#123B5D] font-['Outfit'] uppercase">
              EXECUTIVE ADMIN PORTAL
            </h2>
            <p className="text-xs text-[#718596] mt-1">
              Sign in with verified club administrator credentials to view and manage all bookings and memberships.
            </p>
          </div>

          {/* Quick Credential Box */}
          <div className="p-4 rounded-2xl bg-[#EAF6FC] border border-[#55B9E8]/40 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-[11px] uppercase tracking-wider text-[#123B5D] flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#55B9E8]" />
                <span>Authorized Admin Credentials</span>
              </span>
              <button
                type="button"
                onClick={handleQuickAdminLogin}
                className="text-[10px] font-bold text-[#55B9E8] hover:underline uppercase"
              >
                Autofill
              </button>
            </div>
            <div className="font-mono text-[11px] text-[#183247] space-y-0.5">
              <div>Email: <strong>maow4028@gmail.com</strong></div>
              <div>Password: <strong>202020</strong></div>
            </div>
          </div>

          {adminLoginError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{adminLoginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
            <div>
              <label className="text-[10px] font-extrabold text-[#718596] uppercase tracking-wider block mb-1">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#718596] absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={adminLoginForm.email}
                  onChange={(e) => setAdminLoginForm({ ...adminLoginForm, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DCE5EB] font-medium text-[#183247] focus:outline-none focus:border-[#55B9E8]"
                  placeholder="admin@auragym.com"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-extrabold text-[#718596] uppercase tracking-wider block mb-1">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#718596] absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={adminLoginForm.password}
                  onChange={(e) => setAdminLoginForm({ ...adminLoginForm, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DCE5EB] font-medium text-[#183247] focus:outline-none focus:border-[#55B9E8]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={adminLoginLoading}
              className="w-full py-3 bg-[#123B5D] hover:bg-[#183247] text-white font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              {adminLoginLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating Admin...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Admin Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-[#DCE5EB] text-center">
            <button
              onClick={() => navigate('home')}
              className="text-xs text-[#718596] hover:text-[#183247] font-semibold"
            >
              ← Return to Aura Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // ADMIN DASHBOARD PORTAL (Only visible when user is admin)
  // =========================================================================
  const pendingBookingsCount = bookings.filter((b) => b.booking_status === 'PENDING_APPROVAL').length;
  const confirmedBookingsCount = bookings.filter((b) => b.booking_status === 'CONFIRMED').length;
  const totalRevenueCalculated = bookings
    .filter((b) => b.payment_status === 'PAID')
    .reduce((acc, curr) => acc + (curr.amount_inr || 0), 0);

  return (
    <div className="bg-[#F5F7F9] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Executive Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DCE5EB] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#123B5D] text-white flex items-center justify-center shadow-md">
              <ShieldCheck className="w-8 h-8 text-[#55B9E8]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#55B9E8] block">
                  Club Executive Admin Portal
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase tracking-wider">
                  Admin Verified
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#123B5D] font-['Outfit'] uppercase">
                MEMBERSHIP & BOOKINGS CONTROL
              </h1>
              <p className="text-xs text-[#718596] mt-0.5">
                Logged in as: <strong className="text-[#123B5D]">{user.email}</strong> ({user.full_name})
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowAddBookingModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#55B9E8] to-[#123B5D] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md hover:opacity-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Add New Booking</span>
            </button>

            <button
              onClick={loadAdminData}
              title="Refresh Live Data"
              className="p-2.5 bg-[#EAF6FC] hover:bg-[#DCE5EB] text-[#123B5D] rounded-xl text-xs font-bold transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={logout}
              className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
            >
              Logout Admin
            </button>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex overflow-x-auto border-b border-[#DCE5EB] gap-2 pb-1 text-xs font-bold text-[#718596]">
          {[
            {
              id: 'bookings',
              label: `Bookings Management (${bookings.length})`,
              badge: pendingBookingsCount > 0 ? `${pendingBookingsCount} Pending` : undefined,
              badgeColor: 'bg-amber-500 text-white animate-pulse',
            },
            { id: 'overview', label: 'Executive Metrics' },
            { id: 'members', label: `Member Directory (${members.length})` },
            { id: 'payments', label: `Payment History (${payments.length})` },
            { id: 'plans', label: `Plan Management (${plans.length})` },
            { id: 'logs', label: 'Audit Trail' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-[#123B5D] text-white shadow-sm font-extrabold'
                  : 'bg-white text-[#718596] hover:text-[#183247] hover:bg-[#EAF6FC]'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${tab.badgeColor}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: BOOKINGS MANAGEMENT (Primary Requested Feature) */}
        {/* ========================================================================= */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-[#DCE5EB] shadow-sm">
                <span className="text-[10px] font-extrabold text-[#718596] uppercase tracking-wider block">
                  Total Bookings
                </span>
                <div className="text-2xl sm:text-3xl font-black text-[#123B5D] font-['Outfit'] mt-1">
                  {bookings.length}
                </div>
                <span className="text-[10px] text-[#718596] mt-1 block">Registered in database</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border-2 border-amber-300 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider block">
                    Pending Desk Approvals
                  </span>
                  {pendingBookingsCount > 0 && (
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                  )}
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-600 font-['Outfit'] mt-1">
                  {pendingBookingsCount}
                </div>
                <span className="text-[10px] text-amber-700 font-semibold mt-1 block">Awaiting desk payment verification</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-[#DCE5EB] shadow-sm">
                <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider block">
                  Active / Confirmed
                </span>
                <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-['Outfit'] mt-1">
                  {confirmedBookingsCount}
                </div>
                <span className="text-[10px] text-[#718596] mt-1 block">Active club memberships</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-[#DCE5EB] shadow-sm">
                <span className="text-[10px] font-extrabold text-[#718596] uppercase tracking-wider block">
                  Total Bookings Value
                </span>
                <div className="text-2xl sm:text-3xl font-black text-[#123B5D] font-['Outfit'] mt-1">
                  ₹{totalRevenueCalculated.toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-[#718596] mt-1 block">Processed payments</span>
              </div>
            </div>

            {/* Pending Approvals Attention Banner */}
            {pendingBookingsCount > 0 && (
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
                    <AlertTriangle className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 text-[10px] font-black uppercase tracking-wider">
                        Action Required
                      </span>
                      <span className="text-xs font-bold text-[#123B5D]">
                        {pendingBookingsCount} Offline Payment{pendingBookingsCount > 1 ? 's' : ''} Awaiting Desk Approval
                      </span>
                    </div>
                    <p className="text-xs text-[#718596] mt-1 leading-relaxed">
                      Members who chose <strong>Pay at Gym Desk</strong> are waiting for administrative confirmation. You can review their payment details, approve and activate their membership with instant tax receipt generation, or reject invalid requests with a notification.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-stretch md:self-auto shrink-0">
                  <button
                    onClick={() => setBookingStatusFilter('PENDING_APPROVAL')}
                    className="flex-1 md:flex-initial px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm whitespace-nowrap text-center"
                  >
                    View Pending Only ({pendingBookingsCount})
                  </button>
                </div>
              </div>
            )}

            {/* Filter & Action Toolbar */}
            <div className="bg-white p-6 rounded-3xl border border-[#DCE5EB] shadow-sm space-y-4">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                {/* Search Bar */}
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 text-[#718596] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Search by member name, email, phone, or booking code..."
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DCE5EB] text-xs text-[#183247] focus:outline-none focus:border-[#55B9E8]"
                  />
                </div>

                {/* Status Filter Buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                  <button
                    onClick={() => setBookingStatusFilter('ALL')}
                    className={`px-3 py-2 rounded-xl font-bold transition-colors ${
                      bookingStatusFilter === 'ALL'
                        ? 'bg-[#123B5D] text-white'
                        : 'bg-[#F5F7F9] text-[#718596] hover:text-[#183247]'
                    }`}
                  >
                    All ({bookings.length})
                  </button>

                  <button
                    onClick={() => setBookingStatusFilter('PENDING_APPROVAL')}
                    className={`px-3 py-2 rounded-xl font-bold transition-colors flex items-center gap-1.5 ${
                      bookingStatusFilter === 'PENDING_APPROVAL'
                        ? 'bg-amber-500 text-white'
                        : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Pending ({pendingBookingsCount})</span>
                  </button>

                  <button
                    onClick={() => setBookingStatusFilter('CONFIRMED')}
                    className={`px-3 py-2 rounded-xl font-bold transition-colors ${
                      bookingStatusFilter === 'CONFIRMED'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                    }`}
                  >
                    Confirmed ({confirmedBookingsCount})
                  </button>

                  <button
                    onClick={() => setBookingStatusFilter('CANCELLED')}
                    className={`px-3 py-2 rounded-xl font-bold transition-colors ${
                      bookingStatusFilter === 'CANCELLED'
                        ? 'bg-rose-600 text-white'
                        : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                    }`}
                  >
                    Cancelled
                  </button>
                </div>

                {/* + Add New Booking Trigger */}
                <button
                  onClick={() => setShowAddBookingModal(true)}
                  className="px-4 py-2.5 bg-[#123B5D] hover:bg-[#183247] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4 text-[#55B9E8]" />
                  <span>+ Add Booking</span>
                </button>
              </div>

              {/* Bookings Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F5F7F9] text-[#123B5D] uppercase tracking-wider font-extrabold border-b border-[#DCE5EB]">
                    <tr>
                      <th className="p-3">Booking Code</th>
                      <th className="p-3">Member Details</th>
                      <th className="p-3">Plan & Duration</th>
                      <th className="p-3">Amount (₹)</th>
                      <th className="p-3">Payment Mode</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DCE5EB]/70">
                    {bookings.map((b) => {
                      const isPending = b.booking_status === 'PENDING_APPROVAL';
                      const isConfirmed = b.booking_status === 'CONFIRMED';
                      const isCancelled = b.booking_status === 'CANCELLED';

                      return (
                        <tr
                          key={b.id}
                          className={`hover:bg-[#F5F7F9]/60 transition-colors ${
                            isPending ? 'bg-amber-50/40' : ''
                          }`}
                        >
                          {/* Booking Code & Timestamp */}
                          <td className="p-3">
                            <span className="font-mono font-bold text-[#123B5D] block">
                              {b.booking_code}
                            </span>
                            <span className="text-[10px] text-[#718596] block">
                              {new Date(b.created_at).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </td>

                          {/* Member info */}
                          <td className="p-3">
                            <div className="font-bold text-[#183247]">{b.full_name}</div>
                            <div className="text-[11px] text-[#718596]">{b.email}</div>
                            {b.phone && <div className="text-[10px] text-[#718596]">{b.phone}</div>}
                          </td>

                          {/* Plan */}
                          <td className="p-3">
                            <span className="font-bold text-[#183247] block">{b.plan_name}</span>
                            <span className="text-[10px] text-[#55B9E8] font-bold block">
                              {b.duration_label || `${b.duration_months} Months`}
                            </span>
                          </td>

                          {/* Amount */}
                          <td className="p-3 font-black text-[#123B5D]">
                            ₹{b.amount_inr?.toLocaleString('en-IN')}
                          </td>

                          {/* Payment Mode & Status */}
                          <td className="p-3">
                            <span className="text-xs font-semibold text-[#183247] block capitalize">
                              {b.payment_method || 'Offline'}
                            </span>
                            <span
                              className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase mt-0.5 ${
                                b.payment_status === 'PAID'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {b.payment_status || 'PENDING'}
                            </span>
                          </td>

                          {/* Booking Status Badge */}
                          <td className="p-3">
                            {isPending && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-300">
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                                <span>Waiting Approval</span>
                              </span>
                            )}
                            {isConfirmed && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Active / Confirmed</span>
                              </span>
                            )}
                            {isCancelled && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-800 border border-rose-300">
                                <XCircle className="w-3 h-3 text-rose-600" />
                                <span>Cancelled</span>
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* 1-Click Approve (for pending bookings) */}
                              {isPending && (
                                <button
                                  onClick={() => handleOpenApproveModal(b)}
                                  title="Approve offline booking & issue membership receipt"
                                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold uppercase transition-colors shadow-sm flex items-center gap-1"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Approve</span>
                                </button>
                              )}

                              {isPending && (
                                <button
                                  onClick={() => handleOpenRejectModal(b)}
                                  title="Reject or decline this booking"
                                  className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-bold uppercase transition-colors flex items-center gap-1"
                                >
                                  <XCircle className="w-3 h-3 text-rose-600" />
                                  <span>Reject</span>
                                </button>
                              )}

                              {/* Edit details */}
                              <button
                                onClick={() => handleOpenEditBooking(b)}
                                title="Edit booking details"
                                className="p-1.5 bg-[#F5F7F9] hover:bg-[#EAF6FC] text-[#123B5D] rounded-lg transition-colors"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDeleteBooking(b.id, b.booking_code)}
                                title="Delete booking record"
                                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {bookings.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-[#718596] italic">
                          No bookings matching your search query or filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: OVERVIEW & METRICS */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-[#DCE5EB] shadow-sm">
                <span className="text-xs font-bold text-[#718596] uppercase tracking-wider block">Total Members</span>
                <div className="text-3xl font-black text-[#123B5D] font-['Outfit'] mt-1">{stats?.total_members || 0}</div>
                <span className="text-[10px] text-[#718596] mt-1 block">Registered in Aura system</span>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-[#DCE5EB] shadow-sm">
                <span className="text-xs font-bold text-[#718596] uppercase tracking-wider block">Active Memberships</span>
                <div className="text-3xl font-black text-emerald-600 font-['Outfit'] mt-1">{stats?.active_memberships || 0}</div>
                <span className="text-[10px] text-[#718596] mt-1 block">Currently on gym floor</span>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-[#DCE5EB] shadow-sm">
                <span className="text-xs font-bold text-[#718596] uppercase tracking-wider block">Pending Approvals</span>
                <div className="text-3xl font-black text-amber-500 font-['Outfit'] mt-1">{stats?.pending_approvals || 0}</div>
                <span className="text-[10px] text-[#718596] mt-1 block">Waiting for front desk</span>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-[#DCE5EB] shadow-sm">
                <span className="text-xs font-bold text-[#718596] uppercase tracking-wider block">Total Revenue</span>
                <div className="text-3xl font-black text-[#123B5D] font-['Outfit'] mt-1">₹{(stats?.total_revenue_inr || 0).toLocaleString('en-IN')}</div>
                <span className="text-[10px] text-[#718596] mt-1 block">Lifetime verified collections</span>
              </div>
            </div>

            {/* Quick Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                onClick={() => {
                  setActiveTab('bookings');
                  setShowAddBookingModal(true);
                }}
                className="bg-white p-6 rounded-3xl border border-[#DCE5EB] shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-[#EAF6FC] text-[#55B9E8] flex items-center justify-center mb-3">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <h4 className="font-bold text-sm text-[#123B5D]">Add New Member Booking</h4>
                <p className="text-xs text-[#718596] mt-1">Create bookings for walk-ins or existing members and activate memberships directly.</p>
              </div>

              <div
                onClick={() => {
                  setActiveTab('bookings');
                  setBookingStatusFilter('PENDING_APPROVAL');
                }}
                className="bg-white p-6 rounded-3xl border border-[#DCE5EB] shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-[#123B5D]">Review Desk Approvals</h4>
                <p className="text-xs text-[#718596] mt-1">Verify cash and POS payments made at the front desk to activate memberships.</p>
              </div>

              <div
                onClick={() => setActiveTab('members')}
                className="bg-white p-6 rounded-3xl border border-[#DCE5EB] shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-[#EAF6FC] text-[#123B5D] flex items-center justify-center mb-3">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-[#123B5D]">Member Validity Extensions</h4>
                <p className="text-xs text-[#718596] mt-1">Extend membership validity (+30, +60 days) for VIP members or medical freezes.</p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: MEMBER DIRECTORY */}
        {/* ========================================================================= */}
        {activeTab === 'members' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DCE5EB] shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="w-full sm:w-auto flex-1 max-w-md relative">
                <Search className="w-4 h-4 text-[#718596] absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search by name, email, phone, or membership code..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DCE5EB] text-xs text-[#183247] focus:outline-none focus:border-[#55B9E8]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={memberFilter}
                  onChange={(e) => setMemberFilter(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-[#DCE5EB] text-xs text-[#183247] bg-white"
                >
                  <option value="">All Statuses</option>
                  <option value="ACTIVE">Active Only</option>
                  <option value="EXPIRED">Expired Only</option>
                  <option value="NONE">No Membership</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F7F9] text-[#123B5D] uppercase tracking-wider font-bold border-b border-[#DCE5EB]">
                  <tr>
                    <th className="p-3">Member</th>
                    <th className="p-3">Plan / Code</th>
                    <th className="p-3">Validity</th>
                    <th className="p-3">Remaining</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE5EB]">
                  {members.map((m) => (
                    <tr key={m.id} className="hover:bg-[#F5F7F9]/50 transition-colors">
                      <td className="p-3 font-semibold text-[#183247]">
                        {m.full_name}
                        <span className="block text-[11px] text-[#718596] font-normal">{m.email}</span>
                        {m.phone && <span className="block text-[10px] text-[#718596]">{m.phone}</span>}
                      </td>
                      <td className="p-3">
                        {m.plan_name ? (
                          <div>
                            <span className="font-bold text-[#183247]">{m.plan_name}</span>
                            <span className="block text-[10px] text-[#55B9E8] font-mono">{m.membership_code}</span>
                          </div>
                        ) : (
                          <span className="text-[#718596] italic">None</span>
                        )}
                      </td>
                      <td className="p-3 text-[#718596]">
                        {m.start_date && m.expiry_date ? (
                          <span>
                            {m.start_date} to {m.expiry_date}
                          </span>
                        ) : (
                          <span>—</span>
                        )}
                      </td>
                      <td className="p-3">
                        {m.membership_status === 'ACTIVE' ? (
                          <span className="font-black text-emerald-600">{m.remaining_days} Days</span>
                        ) : (
                          <span className="text-[#718596]">—</span>
                        )}
                      </td>
                      <td className="p-3">
                        {m.membership_status ? (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              m.membership_status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : m.membership_status === 'EXPIRED'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {m.membership_status}
                          </span>
                        ) : (
                          <span className="text-[#718596] italic">No Plan</span>
                        )}
                      </td>
                      <td className="p-3 text-right space-x-2">
                        {m.membership_status && (
                          <button
                            onClick={() => {
                              setExtendModalMember(m);
                              setExtendDays(30);
                            }}
                            className="px-2.5 py-1 bg-[#EAF6FC] hover:bg-[#55B9E8] hover:text-white text-[#123B5D] rounded-lg text-[11px] font-bold transition-colors"
                          >
                            + Extend Days
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: PAYMENTS & TAX INVOICES */}
        {/* ========================================================================= */}
        {activeTab === 'payments' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DCE5EB] shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-[#123B5D] font-['Outfit']">
              All Payment Transactions & Tax Invoices
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F7F9] text-[#123B5D] uppercase tracking-wider font-bold border-b border-[#DCE5EB]">
                  <tr>
                    <th className="p-3">Receipt #</th>
                    <th className="p-3">Member</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Payment Gateway</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Date</th>
                    <th className="p-3 text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE5EB]">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-[#F5F7F9]/50 transition-colors">
                      <td className="p-3 font-mono font-bold text-[#123B5D]">{p.receipt_number}</td>
                      <td className="p-3">
                        <div className="font-semibold text-[#183247]">{p.full_name}</div>
                        <div className="text-[10px] text-[#718596]">{p.email}</div>
                      </td>
                      <td className="p-3 font-black text-[#123B5D]">₹{p.amount_inr?.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-[#718596]">{p.payment_gateway}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                          {p.payment_status}
                        </span>
                      </td>
                      <td className="p-3 text-[#718596]">
                        {new Date(p.payment_date).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setActiveReceiptNumber(p.receipt_number)}
                          className="text-[#55B9E8] font-bold hover:underline inline-flex items-center gap-1"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: MEMBERSHIP PLANS MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'plans' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DCE5EB] shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#123B5D] font-['Outfit']">Membership Plans & Pricing</h3>
                <p className="text-xs text-[#718596]">Manage plan tiers, features, and public prices.</p>
              </div>
              <button
                onClick={() => setNewPlanModal(true)}
                className="px-4 py-2 bg-[#123B5D] hover:bg-[#183247] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Plan</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {plans.map((p) => (
                <div key={p.id} className="p-5 rounded-2xl border border-[#DCE5EB] bg-[#F5F7F9] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-[#123B5D]">{p.name}</h4>
                      <span className="text-[10px] font-black text-[#55B9E8] uppercase">{p.duration_label}</span>
                    </div>
                    <div className="text-xl font-black text-[#123B5D] font-['Outfit'] my-2">
                      ₹{p.price_inr?.toLocaleString('en-IN')}
                    </div>
                    <p className="text-[11px] text-[#718596] mb-3 line-clamp-2">{p.description}</p>
                  </div>
                  <div className="pt-2 border-t border-[#DCE5EB] text-[10px] font-semibold text-emerald-600">
                    ✓ Active on website
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: AUDIT TRAIL */}
        {/* ========================================================================= */}
        {activeTab === 'logs' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DCE5EB] shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-[#123B5D] font-['Outfit']">Admin Activity Logs</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F7F9] text-[#123B5D] uppercase tracking-wider font-bold border-b border-[#DCE5EB]">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE5EB]">
                  {logs.map((l) => (
                    <tr key={l.id} className="hover:bg-[#F5F7F9]/50">
                      <td className="p-3 font-mono text-[11px] text-[#718596]">{l.created_at}</td>
                      <td className="p-3 font-bold text-[#123B5D]">{l.action}</td>
                      <td className="p-3 text-[#183247]">{l.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD NEW BOOKING FROM ADMIN END */}
      {/* ========================================================================= */}
      {showAddBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#DCE5EB] p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#DCE5EB]">
              <div>
                <span className="text-[10px] font-extrabold text-[#55B9E8] uppercase tracking-wider block">
                  Admin Direct Booking
                </span>
                <h3 className="text-xl font-black text-[#123B5D] font-['Outfit'] uppercase">
                  ADD NEW MEMBERSHIP BOOKING
                </h3>
              </div>
              <button
                onClick={() => setShowAddBookingModal(false)}
                className="text-[#718596] hover:text-[#183247] font-bold text-sm px-2 py-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBookingSubmit} className="mt-5 space-y-4 text-xs">
              {/* Member Selection Mode */}
              <div className="p-1 bg-[#F5F7F9] rounded-xl flex gap-1 border border-[#DCE5EB]">
                <button
                  type="button"
                  onClick={() => setAddBookingForm({ ...addBookingForm, memberMode: 'existing' })}
                  className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${
                    addBookingForm.memberMode === 'existing'
                      ? 'bg-white text-[#123B5D] shadow-sm'
                      : 'text-[#718596] hover:text-[#183247]'
                  }`}
                >
                  Existing Registered Member
                </button>
                <button
                  type="button"
                  onClick={() => setAddBookingForm({ ...addBookingForm, memberMode: 'new' })}
                  className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${
                    addBookingForm.memberMode === 'new'
                      ? 'bg-white text-[#123B5D] shadow-sm'
                      : 'text-[#718596] hover:text-[#183247]'
                  }`}
                >
                  Register New Walk-In Member
                </button>
              </div>

              {/* Mode A: Existing Member Selection */}
              {addBookingForm.memberMode === 'existing' ? (
                <div>
                  <label className="text-[10px] font-extrabold text-[#718596] uppercase tracking-wider block mb-1">
                    Select Member *
                  </label>
                  <select
                    required
                    value={addBookingForm.user_id}
                    onChange={(e) => setAddBookingForm({ ...addBookingForm, user_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE5EB] font-medium text-[#183247] bg-white"
                  >
                    <option value="">-- Choose Member --</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.full_name} ({m.email}) - {m.membership_status || 'No Active Plan'}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                /* Mode B: Register New Member inputs */
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-[#EAF6FC]/50 border border-[#55B9E8]/30">
                  <div>
                    <label className="text-[10px] font-bold text-[#718596] uppercase tracking-wider block mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={addBookingForm.full_name}
                      onChange={(e) => setAddBookingForm({ ...addBookingForm, full_name: e.target.value })}
                      placeholder="e.g. Arjun Kapoor"
                      className="w-full px-3 py-2 rounded-xl border border-[#DCE5EB] font-medium text-[#183247] bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#718596] uppercase tracking-wider block mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={addBookingForm.email}
                      onChange={(e) => setAddBookingForm({ ...addBookingForm, email: e.target.value })}
                      placeholder="arjun@example.com"
                      className="w-full px-3 py-2 rounded-xl border border-[#DCE5EB] font-medium text-[#183247] bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#718596] uppercase tracking-wider block mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={addBookingForm.phone}
                      onChange={(e) => setAddBookingForm({ ...addBookingForm, phone: e.target.value })}
                      placeholder="+91 98765 00000"
                      className="w-full px-3 py-2 rounded-xl border border-[#DCE5EB] font-medium text-[#183247] bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Plan & Amount selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-extrabold text-[#718596] uppercase tracking-wider block mb-1">
                    Membership Plan *
                  </label>
                  <select
                    required
                    value={addBookingForm.plan_id}
                    onChange={(e) => {
                      const pId = e.target.value;
                      const selected = plans.find((p) => String(p.id) === pId);
                      setAddBookingForm({
                        ...addBookingForm,
                        plan_id: pId,
                        amount_inr: selected ? String(selected.price_inr) : addBookingForm.amount_inr,
                      });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE5EB] font-medium text-[#183247] bg-white"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.duration_label}) - ₹{p.price_inr?.toLocaleString('en-IN')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-extrabold text-[#718596] uppercase tracking-wider block mb-1">
                    Amount Payable (₹ INR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={addBookingForm.amount_inr}
                    onChange={(e) => setAddBookingForm({ ...addBookingForm, amount_inr: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE5EB] font-bold text-[#123B5D]"
                  />
                </div>
              </div>

              {/* Start Date & Payment Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-extrabold text-[#718596] uppercase tracking-wider block mb-1">
                    Membership Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={addBookingForm.start_date}
                    onChange={(e) => setAddBookingForm({ ...addBookingForm, start_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE5EB] text-[#183247] font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-extrabold text-[#718596] uppercase tracking-wider block mb-1">
                    Payment Method *
                  </label>
                  <select
                    value={addBookingForm.payment_method}
                    onChange={(e) => setAddBookingForm({ ...addBookingForm, payment_method: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE5EB] font-medium text-[#183247] bg-white"
                  >
                    <option value="Cash at Desk">Cash at Front Desk</option>
                    <option value="Card POS Machine">Card POS Machine (Debit/Credit)</option>
                    <option value="UPI / QR Code">UPI / QR Code (GPay / PhonePe / Paytm)</option>
                    <option value="Net Banking / NEFT">Net Banking / Direct Transfer</option>
                    <option value="Online Razorpay">Online Payment (Razorpay)</option>
                    <option value="Complimentary / VIP">Complimentary / VIP Staff Override</option>
                  </select>
                </div>
              </div>

              {/* Payment Status & Membership Activation Toggle */}
              <div className="p-4 rounded-2xl bg-[#F5F7F9] border border-[#DCE5EB] space-y-2">
                <label className="text-[10px] font-extrabold text-[#123B5D] uppercase tracking-wider block">
                  Payment Status & Activation
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="payment_status_radio"
                      checked={addBookingForm.payment_status === 'PAID'}
                      onChange={() =>
                        setAddBookingForm({
                          ...addBookingForm,
                          payment_status: 'PAID',
                          booking_status: 'CONFIRMED',
                        })
                      }
                      className="accent-[#55B9E8]"
                    />
                    <span className="font-bold text-emerald-700">
                      Payment Received (Instant Active Membership + Generate Tax Receipt)
                    </span>
                  </label>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="payment_status_radio"
                      checked={addBookingForm.payment_status === 'PENDING'}
                      onChange={() =>
                        setAddBookingForm({
                          ...addBookingForm,
                          payment_status: 'PENDING',
                          booking_status: 'PENDING_APPROVAL',
                        })
                      }
                      className="accent-[#55B9E8]"
                    />
                    <span className="font-bold text-amber-700">
                      Payment Pending (Save as Waiting for Desk Approval)
                    </span>
                  </label>
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="text-[10px] font-extrabold text-[#718596] uppercase tracking-wider block mb-1">
                  Administrator Notes
                </label>
                <input
                  type="text"
                  value={addBookingForm.admin_notes}
                  onChange={(e) => setAddBookingForm({ ...addBookingForm, admin_notes: e.target.value })}
                  placeholder="e.g. Approved by Desk Manager, Reference #12345"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE5EB] text-[#183247]"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#DCE5EB] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddBookingModal(false)}
                  className="px-5 py-2.5 bg-[#F5F7F9] hover:bg-[#DCE5EB] text-[#123B5D] rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creatingBooking}
                  className="px-6 py-2.5 bg-[#123B5D] hover:bg-[#183247] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-md flex items-center gap-2"
                >
                  {creatingBooking ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating Booking...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-[#55B9E8]" />
                      <span>Create Booking & Issue Membership</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT BOOKING MODAL */}
      {/* ========================================================================= */}
      {showEditBookingModal && selectedBookingForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#DCE5EB] p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#DCE5EB]">
              <div>
                <span className="text-[10px] font-extrabold text-[#55B9E8] uppercase tracking-wider block">
                  Booking #{selectedBookingForEdit.booking_code}
                </span>
                <h3 className="text-lg font-black text-[#123B5D] font-['Outfit']">
                  Edit Booking Details
                </h3>
              </div>
              <button
                onClick={() => setShowEditBookingModal(false)}
                className="text-[#718596] hover:text-[#183247] font-bold text-sm px-2 py-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditBooking} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold text-[#718596] uppercase tracking-wider block mb-1">
                  Member
                </label>
                <div className="p-3 bg-[#F5F7F9] rounded-xl font-bold text-[#123B5D]">
                  {selectedBookingForEdit.full_name} ({selectedBookingForEdit.email})
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[#718596] uppercase tracking-wider block mb-1">
                    Booking Status
                  </label>
                  <select
                    value={selectedBookingForEdit.booking_status}
                    onChange={(e) =>
                      setSelectedBookingForEdit({
                        ...selectedBookingForEdit,
                        booking_status: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#DCE5EB] bg-white font-semibold"
                  >
                    <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#718596] uppercase tracking-wider block mb-1">
                    Payment Status
                  </label>
                  <select
                    value={selectedBookingForEdit.payment_status}
                    onChange={(e) =>
                      setSelectedBookingForEdit({
                        ...selectedBookingForEdit,
                        payment_status: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#DCE5EB] bg-white font-semibold"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PAID">PAID</option>
                    <option value="REFUNDED">REFUNDED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[#718596] uppercase tracking-wider block mb-1">
                    Amount (₹ INR)
                  </label>
                  <input
                    type="number"
                    value={selectedBookingForEdit.amount_inr}
                    onChange={(e) =>
                      setSelectedBookingForEdit({
                        ...selectedBookingForEdit,
                        amount_inr: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#DCE5EB] font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#718596] uppercase tracking-wider block mb-1">
                    Payment Method
                  </label>
                  <input
                    type="text"
                    value={selectedBookingForEdit.payment_method || ''}
                    onChange={(e) =>
                      setSelectedBookingForEdit({
                        ...selectedBookingForEdit,
                        payment_method: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#DCE5EB]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#718596] uppercase tracking-wider block mb-1">
                  Admin Notes
                </label>
                <textarea
                  rows={2}
                  value={selectedBookingForEdit.admin_notes || ''}
                  onChange={(e) =>
                    setSelectedBookingForEdit({
                      ...selectedBookingForEdit,
                      admin_notes: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#DCE5EB]"
                />
              </div>

              <div className="pt-3 border-t border-[#DCE5EB] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditBookingModal(false)}
                  className="px-4 py-2 bg-[#F5F7F9] hover:bg-[#DCE5EB] text-[#123B5D] rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#123B5D] hover:bg-[#183247] text-white rounded-xl font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EXTEND MEMBERSHIP MODAL */}
      {/* ========================================================================= */}
      {extendModalMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#DCE5EB] p-6 sm:p-8">
            <h3 className="text-lg font-bold text-[#123B5D] font-['Outfit'] mb-2">Extend Membership Validity</h3>
            <p className="text-xs text-[#718596] mb-4">
              Member: <strong className="text-[#123B5D]">{extendModalMember.full_name}</strong>
            </p>

            <form onSubmit={handleExtendMembership} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold text-[#718596] uppercase tracking-wider block mb-1">
                  Additional Days to Grant
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[15, 30, 60].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setExtendDays(d)}
                      className={`py-2 rounded-xl font-bold transition-colors ${
                        extendDays === d ? 'bg-[#123B5D] text-white' : 'bg-[#F5F7F9] text-[#718596]'
                      }`}
                    >
                      +{d} Days
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#718596] uppercase tracking-wider block mb-1">
                  Reason / Notes
                </label>
                <input
                  type="text"
                  required
                  value={extendNotes}
                  onChange={(e) => setExtendNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#DCE5EB] text-[#183247]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setExtendModalMember(null)}
                  className="px-4 py-2 bg-[#F5F7F9] text-[#123B5D] rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#123B5D] text-white rounded-xl font-bold uppercase tracking-wider"
                >
                  Confirm Extension
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: NEW MEMBERSHIP PLAN MODAL */}
      {/* ========================================================================= */}
      {newPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#DCE5EB] p-6 sm:p-8">
            <h3 className="text-lg font-bold text-[#123B5D] font-['Outfit'] mb-4">Add Membership Plan</h3>
            <form onSubmit={handleCreatePlan} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-[#718596] uppercase tracking-wider block mb-1">Plan Name</label>
                <input
                  type="text"
                  required
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  placeholder="e.g. Diamond Annual VIP"
                  className="w-full px-3 py-2 rounded-xl border border-[#DCE5EB]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[#718596] uppercase tracking-wider block mb-1">Duration (Months)</label>
                  <input
                    type="number"
                    required
                    value={planForm.duration_months}
                    onChange={(e) => setPlanForm({ ...planForm, duration_months: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#DCE5EB]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#718596] uppercase tracking-wider block mb-1">Price (₹ INR)</label>
                  <input
                    type="number"
                    required
                    value={planForm.price_inr}
                    onChange={(e) => setPlanForm({ ...planForm, price_inr: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#DCE5EB]"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#718596] uppercase tracking-wider block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#DCE5EB]"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewPlanModal(false)}
                  className="px-4 py-2 bg-[#F5F7F9] text-[#123B5D] rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#123B5D] text-white rounded-xl font-bold uppercase tracking-wider"
                >
                  Create Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: APPROVE PENDING MEMBERSHIP MODAL */}
      {/* ========================================================================= */}
      {bookingToApprove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-emerald-200 p-6 sm:p-8 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#DCE5EB]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider block">
                    Verify & Activate
                  </span>
                  <h3 className="text-lg font-black text-[#123B5D] font-['Outfit'] uppercase">
                    Approve Pending Membership
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setBookingToApprove(null)}
                className="text-[#718596] hover:text-[#183247] font-bold text-sm px-2 py-1"
              >
                ✕
              </button>
            </div>

            {/* Member and Booking Preview */}
            <div className="my-4 p-4 rounded-2xl bg-[#F5F7F9] border border-[#DCE5EB] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#718596]">Booking Reference:</span>
                <span className="font-mono font-bold text-[#123B5D]">{bookingToApprove.booking_code}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#718596]">Member Name:</span>
                <span className="font-bold text-[#183247]">{bookingToApprove.full_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#718596]">Member Contact:</span>
                <span className="text-[#183247]">{bookingToApprove.email} {bookingToApprove.phone && `• ${bookingToApprove.phone}`}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#DCE5EB]/60">
                <span className="text-[#718596]">Plan & Duration:</span>
                <span className="font-bold text-[#123B5D]">{bookingToApprove.plan_name} ({bookingToApprove.duration_label || `${bookingToApprove.duration_months} Months`})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#718596]">Amount Payable:</span>
                <span className="font-black text-emerald-700 text-sm">₹{bookingToApprove.amount_inr?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleConfirmApprove();
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="text-[10px] font-bold text-[#718596] uppercase tracking-wider block mb-1">
                  Confirmed Payment Method
                </label>
                <select
                  value={approvalPaymentMethod}
                  onChange={(e) => setApprovalPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#DCE5EB] bg-white font-semibold text-[#183247]"
                >
                  <option value="Cash at Front Desk">Cash at Front Desk</option>
                  <option value="Card POS Machine">Card POS Machine (Debit/Credit)</option>
                  <option value="UPI / QR Code">UPI / QR Code (GPay / PhonePe / Paytm)</option>
                  <option value="Bank Transfer / NEFT">Bank Transfer / NEFT</option>
                  <option value="Complimentary / VIP">Complimentary / VIP Override</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#718596] uppercase tracking-wider block mb-1">
                  Membership Start Date
                </label>
                <input
                  type="date"
                  required
                  value={approvalStartDate}
                  onChange={(e) => setApprovalStartDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#DCE5EB] font-medium text-[#183247]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#718596] uppercase tracking-wider block mb-1">
                  Desk Verification Note
                </label>
                <input
                  type="text"
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#DCE5EB] text-[#183247]"
                  placeholder="e.g. Cash received at reception desk"
                />
              </div>

              <div className="pt-3 border-t border-[#DCE5EB] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setBookingToApprove(null)}
                  className="px-4 py-2.5 bg-[#F5F7F9] hover:bg-[#DCE5EB] text-[#123B5D] rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={approvingLoading}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold uppercase tracking-wider transition-colors shadow-md flex items-center gap-2"
                >
                  {approvingLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Activating...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Confirm & Activate Membership</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: REJECT PENDING MEMBERSHIP MODAL */}
      {/* ========================================================================= */}
      {bookingToReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-rose-200 p-6 sm:p-8 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#DCE5EB]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-rose-600 uppercase tracking-wider block">
                    Decline Request
                  </span>
                  <h3 className="text-lg font-black text-[#123B5D] font-['Outfit'] uppercase">
                    Reject Pending Membership
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setBookingToReject(null)}
                className="text-[#718596] hover:text-[#183247] font-bold text-sm px-2 py-1"
              >
                ✕
              </button>
            </div>

            {/* Member Preview */}
            <div className="my-4 p-4 rounded-2xl bg-rose-50/50 border border-rose-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[#718596]">Booking Reference:</span>
                <span className="font-mono font-bold text-[#123B5D]">{bookingToReject.booking_code}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#718596]">Member Name:</span>
                <span className="font-bold text-[#183247]">{bookingToReject.full_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#718596]">Plan:</span>
                <span className="font-bold text-[#123B5D]">{bookingToReject.plan_name} (₹{bookingToReject.amount_inr?.toLocaleString('en-IN')})</span>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleConfirmReject();
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="text-[10px] font-bold text-[#718596] uppercase tracking-wider block mb-2">
                  Select Common Reason
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    'Payment not received at front desk',
                    'Member requested cancellation',
                    'Duplicate booking submitted',
                    'Incorrect contact details',
                  ].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRejectionReason(r)}
                      className={`p-2.5 rounded-xl border text-left text-[11px] font-medium transition-colors ${
                        rejectionReason === r
                          ? 'border-rose-400 bg-rose-50 text-rose-800 font-bold'
                          : 'border-[#DCE5EB] bg-[#F5F7F9] text-[#718596] hover:text-[#183247]'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#718596] uppercase tracking-wider block mb-1">
                  Rejection Reason / Message (Visible to Member)
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#DCE5EB] text-[#183247]"
                  placeholder="Enter specific reason for rejecting this booking..."
                />
              </div>

              <div className="pt-3 border-t border-[#DCE5EB] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setBookingToReject(null)}
                  className="px-4 py-2.5 bg-[#F5F7F9] hover:bg-[#DCE5EB] text-[#123B5D] rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rejectingLoading}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold uppercase tracking-wider transition-colors shadow-md flex items-center gap-2"
                >
                  {rejectingLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Rejecting...</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      <span>Confirm Rejection</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: RECEIPT / TAX INVOICE MODAL */}
      {/* ========================================================================= */}
      {activeReceiptNumber && (
        <ReceiptModal
          receiptNumber={activeReceiptNumber}
          onClose={() => setActiveReceiptNumber(null)}
        />
      )}
    </div>
  );
};
