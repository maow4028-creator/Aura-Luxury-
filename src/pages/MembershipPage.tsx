import React, { useEffect, useState } from 'react';
import { MembershipPlan } from '../types';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, ShieldCheck, Zap, Star, ArrowRight, HelpCircle } from 'lucide-react';

interface MembershipPageProps {
  navigate: (page: string, params?: any) => void;
}

export const MembershipPage: React.FC<MembershipPageProps> = ({ navigate }) => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/plans')
      .then((res) => res.json())
      .then((data) => {
        setPlans(data.plans || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load plans:', err);
        setLoading(false);
      });
  }, []);

  const handleJoinClick = (planId: number) => {
    if (!user) {
      // Redirect to login with return intent
      navigate('login', { returnTo: 'booking', planId });
    } else {
      navigate('booking', { planId });
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Banner */}
      <section className="bg-gradient-to-b from-[#EAF6FC] to-white py-16 sm:py-20 border-b border-[#DCE5EB]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#55B9E8] block mb-3">
            Membership Privileges
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-[#123B5D] font-['Outfit'] uppercase">
            MEMBERSHIP TIERS & PRICING
          </h1>
          <div className="w-16 h-1 bg-[#55B9E8] mx-auto mt-4 rounded-full" />
          <p className="max-w-2xl mx-auto mt-4 text-[#718596] text-base leading-relaxed">
            All prices are in Indian Rupees (₹) inclusive of club amenities, locker privileges, and digital progress tracking.
          </p>
        </div>
      </section>

      {/* Plans Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-4 border-[#55B9E8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm text-[#718596]">Loading membership packages...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {plans.map((plan) => {
                const isPopular = plan.popular_badge === 1;
                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between bg-white transition-all duration-300 ${
                      isPopular
                        ? 'border-2 border-[#55B9E8] shadow-2xl ring-4 ring-[#55B9E8]/10 -translate-y-2'
                        : 'border border-[#DCE5EB] shadow-sm hover:shadow-xl hover:-translate-y-1'
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#55B9E8] text-white text-[10px] font-black uppercase tracking-widest shadow-md">
                        Most Popular Choice
                      </div>
                    )}

                    <div>
                      {/* Plan Header */}
                      <div className="mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#55B9E8] bg-[#EAF6FC] px-2.5 py-1 rounded-md">
                          {plan.duration_label} Pass
                        </span>
                        <h3 className="text-2xl font-black text-[#123B5D] font-['Outfit'] mt-3">
                          {plan.name}
                        </h3>
                        <p className="text-xs text-[#718596] mt-2 leading-relaxed min-h-[36px]">
                          {plan.description}
                        </p>
                      </div>

                      {/* Pricing block in INR */}
                      <div className="py-5 border-y border-[#DCE5EB] my-4">
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-black text-[#123B5D] font-['Outfit']">
                            ₹{plan.price_inr.toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs font-semibold text-[#718596]">
                            / {plan.duration_label}
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                          Zero hidden registration fee
                        </p>
                      </div>

                      {/* Facilities & Benefits */}
                      <div className="space-y-3 mb-8">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#123B5D] block">
                          Included Privileges:
                        </span>
                        {plan.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 text-xs text-[#183247]">
                            <CheckCircle2 className="w-4 h-4 text-[#55B9E8] shrink-0 mt-0.5" />
                            <span className="leading-tight">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Join Button */}
                    <div className="pt-4 border-t border-[#EAF6FC]">
                      <button
                        onClick={() => handleJoinClick(plan.id)}
                        className={`w-full py-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                          isPopular
                            ? 'bg-gradient-to-r from-[#55B9E8] to-[#123B5D] text-white shadow-lg shadow-[#55B9E8]/30 hover:opacity-95'
                            : 'bg-[#123B5D] text-white hover:bg-[#183247]'
                        }`}
                      >
                        <span>Join Now</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Comparison & Guarantees */}
      <section className="py-16 bg-[#F5F7F9] border-t border-[#DCE5EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h3 className="text-2xl font-bold text-[#123B5D] font-['Outfit']">
              FREQUENTLY ASKED MEMBERSHIP QUESTIONS
            </h3>
            <p className="text-xs text-[#718596] mt-2">
              Transparent terms, no lock-ins, and flexible payment options.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto text-sm">
            <div className="bg-white p-6 rounded-2xl border border-[#DCE5EB]">
              <h4 className="font-bold text-[#123B5D] mb-2 font-['Outfit'] flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#55B9E8]" />
                How soon is my membership activated?
              </h4>
              <p className="text-xs text-[#718596] leading-relaxed">
                Online payments via Razorpay (UPI, Cards) activate your membership immediately. Offline cash payments at the front desk are verified and activated by our team upon receipt.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#DCE5EB]">
              <h4 className="font-bold text-[#123B5D] mb-2 font-['Outfit'] flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#55B9E8]" />
                Can I pause my membership if I travel?
              </h4>
              <p className="text-xs text-[#718596] leading-relaxed">
                Yes! Half-Yearly and Annual plans allow membership pause privileges (up to 21 and 45 days respectively) at no surcharge.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#DCE5EB]">
              <h4 className="font-bold text-[#123B5D] mb-2 font-['Outfit'] flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#55B9E8]" />
                Can I renew without losing my history?
              </h4>
              <p className="text-xs text-[#718596] leading-relaxed">
                Absolutely. Your member portal preserves your entire billing and membership history permanently. Renewing seamlessly extends your remaining active days.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#DCE5EB]">
              <h4 className="font-bold text-[#123B5D] mb-2 font-['Outfit'] flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#55B9E8]" />
                Do I receive an official invoice/receipt?
              </h4>
              <p className="text-xs text-[#718596] leading-relaxed">
                Yes, every transaction generates an official computer-verified tax invoice and receipt accessible directly on your "My Membership" page with one-click print functionality.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
