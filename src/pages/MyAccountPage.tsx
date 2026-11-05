import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, NotificationItem } from '../types';
import {
  User as UserIcon,
  Bell,
  CreditCard,
  Settings,
  ShieldCheck,
  Calendar,
  LogOut,
  Save,
  CheckCircle2,
  AlertCircle,
  FileText,
  Phone,
  Mail,
  Heart,
} from 'lucide-react';

interface MyAccountPageProps {
  navigate: (page: string, params?: any) => void;
}

export const MyAccountPage: React.FC<MyAccountPageProps> = ({ navigate }) => {
  const { user, token, logout, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'notifications'>('overview');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    fitness_goals: '',
    emergency_contact: '',
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [pendingBooking, setPendingBooking] = useState<any>(null);
  const [membershipInfo, setMembershipInfo] = useState<any>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        phone: user.phone || '',
        fitness_goals: user.fitness_goals || '',
        emergency_contact: user.emergency_contact || '',
      });
    }

    if (token) {
      fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((d) => setNotifications(d.notifications || []))
        .catch(() => {});

      fetch('/api/memberships/my-active', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((d) => {
          if (d?.pending_booking) setPendingBooking(d.pending_booking);
          if (d?.membership) setMembershipInfo(d.membership);
        })
        .catch(() => {});
    }
  }, [user, token]);

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#F5F7F9] py-16 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-[#DCE5EB] text-center shadow-lg">
          <UserIcon className="w-12 h-12 text-[#55B9E8] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#123B5D] font-['Outfit'] mb-2">
            Sign In Required
          </h2>
          <p className="text-xs text-[#718596] mb-6">
            Please log in to manage your profile and view notifications.
          </p>
          <button
            onClick={() => navigate('login', { returnTo: 'my-account' })}
            className="w-full py-3 bg-[#123B5D] text-white text-xs font-bold uppercase tracking-wider rounded-xl"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await refreshUser();
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const markNotificationRead = async (id: number) => {
    await fetch(`/api/notifications/${id}/read`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
    );
  };

  return (
    <div className="bg-[#F5F7F9] min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Welcome Header */}
        <div className="bg-white p-8 rounded-3xl border border-[#DCE5EB] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#123B5D] to-[#55B9E8] flex items-center justify-center text-white text-2xl font-black font-['Outfit'] shadow-md">
              {user.full_name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#55B9E8] block">
                  Member Profile
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#EAF6FC] text-[#123B5D] text-[9px] font-bold border border-[#55B9E8]/30">
                  Firebase Connected
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#123B5D] font-['Outfit']">
                WELCOME, {user.full_name}
              </h1>
              <p className="text-xs text-[#718596] mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('my-membership')}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#EAF6FC] hover:bg-[#55B9E8] hover:text-white text-[#123B5D] text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>My Membership</span>
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#DCE5EB] gap-6 text-xs font-bold text-[#718596]">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 transition-colors ${
              activeTab === 'overview'
                ? 'border-b-2 border-[#55B9E8] text-[#123B5D]'
                : 'hover:text-[#183247]'
            }`}
          >
            Overview & Quick Actions
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`pb-3 transition-colors flex items-center gap-1.5 ${
              activeTab === 'notifications'
                ? 'border-b-2 border-[#55B9E8] text-[#123B5D]'
                : 'hover:text-[#183247]'
            }`}
          >
            <span>Club Notifications</span>
            {notifications.filter((n) => !n.is_read).length > 0 && (
              <span className="px-1.5 py-0.5 bg-[#55B9E8] text-white rounded-full text-[9px]">
                {notifications.filter((n) => !n.is_read).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 transition-colors ${
              activeTab === 'settings'
                ? 'border-b-2 border-[#55B9E8] text-[#123B5D]'
                : 'hover:text-[#183247]'
            }`}
          >
            Profile & Settings
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Pending Membership Alert Banner */}
            {pendingBooking && (
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
                    <AlertCircle className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full">
                        Waiting for Approval
                      </span>
                      <span className="text-xs text-[#718596] font-mono">
                        #{pendingBooking.booking_code}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-[#123B5D] font-['Outfit'] mt-1">
                      {pendingBooking.plan_name} — ₹{pendingBooking.amount_inr?.toLocaleString('en-IN')}
                    </h4>
                    <p className="text-xs text-[#718596] mt-0.5">
                      Your offline booking is awaiting verification at the front desk.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate('my-membership')}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm hover:opacity-95 transition-opacity whitespace-nowrap"
                >
                  View in My Membership →
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                onClick={() => navigate('my-membership')}
                className="bg-white p-6 rounded-3xl border border-[#DCE5EB] shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-[#EAF6FC] text-[#55B9E8] flex items-center justify-center mb-4">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#123B5D] font-['Outfit'] mb-1">
                  Active Membership
                </h3>
                <p className="text-xs text-[#718596] leading-relaxed mb-4">
                  Check your remaining days counter, progress bar, and tax receipts.
                </p>
                <span className="text-xs font-bold text-[#55B9E8] hover:underline">
                  Open Membership Dashboard →
                </span>
              </div>

              <div
                onClick={() => navigate('programs')}
                className="bg-white p-6 rounded-3xl border border-[#DCE5EB] shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-[#EAF6FC] text-[#55B9E8] flex items-center justify-center mb-4">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#123B5D] font-['Outfit'] mb-1">
                  Class Timetable
                </h3>
                <p className="text-xs text-[#718596] leading-relaxed mb-4">
                  Explore daily schedules for HIIT, Power Yoga, and Master Trainer sessions.
                </p>
                <span className="text-xs font-bold text-[#55B9E8] hover:underline">
                  View Programs & Schedules →
                </span>
              </div>

              <div
                onClick={() => navigate('contact')}
                className="bg-white p-6 rounded-3xl border border-[#DCE5EB] shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-[#EAF6FC] text-[#55B9E8] flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#123B5D] font-['Outfit'] mb-1">
                  Concierge Support
                </h3>
                <p className="text-xs text-[#718596] leading-relaxed mb-4">
                  Need a personal locker assigned or have a medical freeze request?
                </p>
                <span className="text-xs font-bold text-[#55B9E8] hover:underline">
                  Speak with Concierge →
                </span>
              </div>
            </div>

            {/* Account Info Card */}
            <div className="bg-white p-8 rounded-3xl border border-[#DCE5EB] shadow-sm space-y-4">
              <h3 className="text-base font-bold text-[#123B5D] font-['Outfit']">
                Account Summary
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-[#F5F7F9]">
                  <span className="text-[10px] font-bold text-[#718596] uppercase tracking-wider block">Role</span>
                  <span className="font-bold text-[#123B5D] uppercase">{user.role}</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#F5F7F9]">
                  <span className="text-[10px] font-bold text-[#718596] uppercase tracking-wider block">Fitness Target</span>
                  <span className="font-bold text-[#123B5D]">{user.fitness_goals || 'General Vitality & Conditioning'}</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#F5F7F9]">
                  <span className="text-[10px] font-bold text-[#718596] uppercase tracking-wider block">Phone</span>
                  <span className="font-bold text-[#123B5D]">{user.phone || 'Not recorded'}</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#F5F7F9]">
                  <span className="text-[10px] font-bold text-[#718596] uppercase tracking-wider block">Emergency Contact</span>
                  <span className="font-bold text-[#123B5D]">{user.emergency_contact || 'None registered'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DCE5EB] shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-[#123B5D] font-['Outfit']">
              Notifications & Subscription Alerts
            </h3>
            {notifications.length === 0 ? (
              <p className="text-xs text-[#718596] py-8 text-center italic">
                No notifications at this time.
              </p>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className={`p-4 rounded-2xl border text-xs transition-colors cursor-pointer flex items-start justify-between gap-4 ${
                      n.is_read
                        ? 'bg-[#F5F7F9]/60 border-[#DCE5EB]/60 opacity-80'
                        : 'bg-[#EAF6FC]/50 border-[#55B9E8]/40 ring-1 ring-[#55B9E8]/20'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-[#123B5D] mb-1">{n.title}</h4>
                      <p className="text-[#718596] leading-relaxed">{n.message}</p>
                      <span className="text-[10px] text-[#718596] mt-2 block">
                        {new Date(n.created_at).toLocaleString('en-IN')}
                      </span>
                    </div>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-[#55B9E8] shrink-0 mt-1.5" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white p-8 rounded-3xl border border-[#DCE5EB] shadow-sm max-w-2xl">
            <h3 className="text-lg font-bold text-[#123B5D] font-['Outfit'] mb-6">
              Account Profile Settings
            </h3>

            {saveSuccess && (
              <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div>
                <label className="text-[11px] font-bold text-[#718596] uppercase tracking-wider block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE5EB] text-[#183247] font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#718596] uppercase tracking-wider block mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE5EB] text-[#183247]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#718596] uppercase tracking-wider block mb-1">
                  Primary Fitness Target
                </label>
                <input
                  type="text"
                  value={formData.fitness_goals}
                  onChange={(e) => setFormData({ ...formData, fitness_goals: e.target.value })}
                  placeholder="e.g. Strength Training, Body Fat Reduction, Marathon Prep"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE5EB] text-[#183247]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#718596] uppercase tracking-wider block mb-1">
                  Emergency Contact & Relation
                </label>
                <input
                  type="text"
                  value={formData.emergency_contact}
                  onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                  placeholder="e.g. +91 98765 00000 (Priya - Spouse)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE5EB] text-[#183247]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-[#123B5D] hover:bg-[#183247] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center gap-2"
                >
                  <Save className="w-3.5 h-3.5 text-[#55B9E8]" />
                  <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
