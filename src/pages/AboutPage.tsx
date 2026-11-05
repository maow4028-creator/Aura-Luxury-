import React from 'react';
import { Award, ShieldCheck, Heart, Users, Target, CheckCircle2, ArrowRight } from 'lucide-react';

interface AboutPageProps {
  navigate: (page: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ navigate }) => {
  return (
    <div className="bg-white">
      {/* Page Header Banner */}
      <section className="bg-gradient-to-b from-[#EAF6FC] to-white py-16 sm:py-20 border-b border-[#DCE5EB]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#55B9E8] block mb-3">
            Heritage & Philosophy
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-[#123B5D] font-['Outfit'] uppercase">
            ABOUT AURA LUXURY FITNESS CLUB
          </h1>
          <div className="w-16 h-1 bg-[#55B9E8] mx-auto mt-4 rounded-full" />
          <p className="max-w-2xl mx-auto mt-4 text-[#718596] text-base leading-relaxed">
            Where cutting-edge sports biomechanics meets international five-star hospitality. Discover how we set new milestones in human fitness.
          </p>
        </div>
      </section>

      {/* Main Story & Presentation */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#55B9E8]">
                Established 2014
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#123B5D] font-['Outfit'] leading-tight">
                MORE THAN A GYM. <br />
                A SANCTUARY FOR TRANSFORMATION.
              </h2>
              <p className="text-sm text-[#718596] leading-relaxed">
                Aura was conceived with a clear vision: to dismantle the intimidating, overcrowded gym environment and replace it with a calm, hyper-clean sanctuary designed around individual member achievement.
              </p>
              <p className="text-sm text-[#718596] leading-relaxed">
                Spanning over 25,000 square feet in Bandra West, our facilities feature bespoke equipment from Technogym, acoustic dampening, HEPA-filtered clean air circulation, and certified sports science mentors.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#DCE5EB]">
                <div>
                  <h4 className="text-3xl font-black text-[#123B5D] font-['Outfit']">12+</h4>
                  <p className="text-xs text-[#718596] uppercase tracking-wider font-semibold">Years of Excellence</p>
                </div>
                <div>
                  <h4 className="text-3xl font-black text-[#55B9E8] font-['Outfit']">98.4%</h4>
                  <p className="text-xs text-[#718596] uppercase tracking-wider font-semibold">Goal Retention Rate</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1200&q=80"
                  alt="Aura Gym Floor"
                  className="w-full h-[420px] object-cover"
                />
              </div>
            </div>
          </div>

          {/* Core Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="p-8 rounded-3xl bg-[#F5F7F9] border border-[#DCE5EB]">
              <div className="w-12 h-12 rounded-2xl bg-[#EAF6FC] text-[#55B9E8] flex items-center justify-center mb-6">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#123B5D] font-['Outfit'] mb-3">Our Mission</h3>
              <p className="text-sm text-[#718596] leading-relaxed">
                To empower members through precision fitness science, respectful mentorship, and an uplifting luxury ambiance that stimulates physical and mental longevity.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#F5F7F9] border border-[#DCE5EB]">
              <div className="w-12 h-12 rounded-2xl bg-[#EAF6FC] text-[#55B9E8] flex items-center justify-center mb-6">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#123B5D] font-['Outfit'] mb-3">Our Vision</h3>
              <p className="text-sm text-[#718596] leading-relaxed">
                To remain India's premier international benchmark for private fitness clubs, blending wellness, nutrition, community, and athletic conditioning.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#F5F7F9] border border-[#DCE5EB]">
              <div className="w-12 h-12 rounded-2xl bg-[#EAF6FC] text-[#55B9E8] flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#123B5D] font-['Outfit'] mb-3">Our Values</h3>
              <p className="text-sm text-[#718596] leading-relaxed">
                Integrity, hygiene excellence, science over fads, respectful community, and uncompromising member privacy and safety across all facilities.
              </p>
            </div>
          </div>

          {/* Why Choose Aura Checklist */}
          <div className="bg-[#EAF6FC] p-8 sm:p-12 rounded-3xl border border-[#55B9E8]/30">
            <div className="max-w-3xl mx-auto text-center mb-10">
              <h3 className="text-2xl sm:text-3xl font-bold text-[#123B5D] font-['Outfit']">
                THE AURA ADVANTAGE
              </h3>
              <p className="text-xs text-[#718596] mt-2">
                Every detail is calibrated to eliminate friction and empower performance.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-sm text-[#183247]">
              {[
                'Strict capacity limits to guarantee zero wait times',
                'Italian Technogym Pure Strength & Biostrength gear',
                'Eucalyptus aromatic steam rooms & Scandinavian saunas',
                'Digital membership portal with automatic day tracking',
                'Complimentary InBody 570 clinical composition scans',
                'Private valet parking and secure keyless RFID lockers',
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-[#DCE5EB]/60">
                  <CheckCircle2 className="w-5 h-5 text-[#55B9E8] shrink-0 mt-0.5" />
                  <span className="font-medium text-xs leading-relaxed">{text}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <button
                onClick={() => navigate('membership')}
                className="px-8 py-3.5 bg-gradient-to-r from-[#55B9E8] to-[#123B5D] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md hover:opacity-95 transition-all"
              >
                Explore Membership Tiers
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
