import React, { useEffect, useState } from 'react';
import { MembershipPlan, Facility, Program, Trainer, GalleryItem, Testimonial, OpeningHour } from '../types';
import {
  Dumbbell,
  ArrowRight,
  ShieldCheck,
  Award,
  Sparkles,
  Users,
  Clock,
  Star,
  CheckCircle2,
  ChevronRight,
  Eye,
  MapPin,
  Phone,
  Mail,
  Zap,
} from 'lucide-react';

interface HomePageProps {
  navigate: (page: string, params?: any) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [hours, setHours] = useState<OpeningHour[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  useEffect(() => {
    fetch('/api/plans').then((r) => r.json()).then((d) => setPlans(d.plans || []));
    fetch('/api/gym/facilities').then((r) => r.json()).then((d) => setFacilities(d.facilities || []));
    fetch('/api/gym/programs').then((r) => r.json()).then((d) => setPrograms(d.programs || []));
    fetch('/api/gym/trainers').then((r) => r.json()).then((d) => setTrainers(d.trainers || []));
    fetch('/api/gym/gallery').then((r) => r.json()).then((d) => setGallery(d.gallery || []));
    fetch('/api/gym/testimonials').then((r) => r.json()).then((d) => setTestimonials(d.testimonials || []));
    fetch('/api/gym/opening-hours').then((r) => r.json()).then((d) => setHours(d.hours || []));
  }, []);

  return (
    <div className="bg-white">
      {/* ========================================= */}
      {/* A. HERO SECTION */}
      {/* ========================================= */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#EAF6FC] via-white to-white">
        {/* Subtle Luxury Gradient Background Elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#55B9E8]/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-0 -ml-20 w-80 h-80 rounded-full bg-[#123B5D]/5 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF6FC] border border-[#55B9E8]/30 text-xs font-bold uppercase tracking-wider text-[#123B5D] shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-[#55B9E8]" />
                <span>Premier Luxury Fitness Sanctuary</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#123B5D] tracking-tight leading-[1.1] font-['Outfit'] uppercase">
                YOUR FITNESS JOURNEY <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#55B9E8] to-[#123B5D]">
                  STARTS HERE.
                </span>
              </h1>

              <p className="text-lg text-[#718596] max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Build strength, improve your lifestyle and achieve your fitness goals with professional training and world-class facilities in a pristine, white-and-sky-blue sanctuary.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  onClick={() => navigate('membership')}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-[#55B9E8] to-[#123B5D] hover:opacity-95 shadow-xl shadow-[#55B9E8]/25 hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <span>Explore Memberships</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  onClick={() => navigate('contact')}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-[#123B5D] bg-white hover:bg-[#F5F7F9] border-2 border-[#DCE5EB] hover:border-[#55B9E8] transition-all duration-200 shadow-sm"
                >
                  Contact Us
                </button>
              </div>

              {/* Metric Highlights */}
              <div className="pt-8 border-t border-[#DCE5EB] grid grid-cols-3 gap-6 text-center lg:text-left">
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-[#123B5D] font-['Outfit']">25,000+</div>
                  <div className="text-xs text-[#718596] font-medium uppercase tracking-wider">Sq. Ft. Luxury Floor</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-[#55B9E8] font-['Outfit']">100%</div>
                  <div className="text-xs text-[#718596] font-medium uppercase tracking-wider">Technogym Gear</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-[#123B5D] font-['Outfit']">14+</div>
                  <div className="text-xs text-[#718596] font-medium uppercase tracking-wider">Elite Master Coaches</div>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                  <img
                    src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80"
                    alt="Aura Luxury Gym Arena"
                    className="w-full h-[450px] object-cover hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#123B5D]/80 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <span className="px-2.5 py-1 rounded-full bg-[#55B9E8] text-white text-[10px] font-extrabold uppercase tracking-widest inline-block mb-2">
                      Flagship Club
                    </span>
                    <h3 className="text-xl font-bold font-['Outfit']">Bandra West, Mumbai</h3>
                    <p className="text-xs text-[#DCE5EB] mt-1">
                      Designed with natural daylight, pure filtered air, and eucalyptus steam rooms.
                    </p>
                  </div>
                </div>

                {/* Floating Rating Badge */}
                <div className="absolute -bottom-5 -left-5 bg-white p-4 rounded-2xl shadow-xl border border-[#DCE5EB] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EAF6FC] flex items-center justify-center text-[#55B9E8]">
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-sm font-black text-[#123B5D]">
                      <span>4.9 / 5.0</span>
                      <span className="text-xs font-normal text-[#718596]">(850+ Reviews)</span>
                    </div>
                    <div className="text-[11px] text-[#718596]">Highest Rated Luxury Club</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* B. ABOUT OUR GYM SECTION */}
      {/* ========================================= */}
      <section className="py-20 bg-[#F5F7F9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#55B9E8] block mb-2">
              About Our Heritage
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#123B5D] font-['Outfit']">
              A NEW STANDARD IN WELLNESS & PERFORMANCE
            </h2>
            <div className="w-16 h-1 bg-[#55B9E8] mx-auto mt-4 rounded-full" />
            <p className="mt-4 text-[#718596] text-base leading-relaxed">
              Founded over 12 years ago, Aura Luxury Fitness Club has pioneered science-based athletic conditioning coupled with refined five-star hospitality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-[#DCE5EB] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-[#EAF6FC] text-[#55B9E8] flex items-center justify-center mb-6">
                <Award className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-xl font-bold text-[#123B5D] mb-3 font-['Outfit']">Our Vision</h3>
              <p className="text-sm text-[#718596] leading-relaxed">
                To elevate fitness from an obligation to a luxurious daily ritual, giving you the stamina, vitality, and mental sharpness to conquer your goals.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-[#DCE5EB] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-[#EAF6FC] text-[#55B9E8] flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-xl font-bold text-[#123B5D] mb-3 font-['Outfit']">Our Mission</h3>
              <p className="text-sm text-[#718596] leading-relaxed">
                Providing personalized biomechanical training, restorative recovery spaces, and evidence-backed nutritional guidance in a friendly, pristine setting.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-[#DCE5EB] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-[#EAF6FC] text-[#55B9E8] flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-xl font-bold text-[#123B5D] mb-3 font-['Outfit']">Why Choose Aura</h3>
              <p className="text-sm text-[#718596] leading-relaxed">
                Zero overcrowding, RFID smart lockers, Italian Technogym gear, certified masters coaches, and custom progress tracking on your personal membership portal.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => navigate('about')}
              className="inline-flex items-center gap-2 text-sm font-bold text-[#123B5D] hover:text-[#55B9E8] transition-colors"
            >
              <span>Read Full Club Story & Values</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* C. GYM FACILITIES PREVIEW */}
      {/* ========================================= */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#55B9E8] block mb-2">
                World-Class Amenities
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#123B5D] font-['Outfit']">
                ENGINEERED FOR EXCELLENCE
              </h2>
            </div>
            <button
              onClick={() => navigate('facilities')}
              className="mt-4 md:mt-0 flex items-center gap-1.5 text-sm font-bold text-[#55B9E8] hover:text-[#123B5D] transition-colors"
            >
              <span>Explore All 8 Facilities</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {facilities.slice(0, 4).map((facility) => (
              <div
                key={facility.id}
                className="group bg-white rounded-3xl overflow-hidden border border-[#DCE5EB] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img
                    src={facility.image_url}
                    alt={facility.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#123B5D] text-[10px] font-bold uppercase tracking-wider">
                    {facility.category}
                  </span>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[#123B5D] mb-2 font-['Outfit'] group-hover:text-[#55B9E8] transition-colors">
                      {facility.title}
                    </h3>
                    <p className="text-xs text-[#718596] leading-relaxed mb-4 line-clamp-2">
                      {facility.description}
                    </p>
                  </div>

                  <ul className="space-y-1.5 pt-3 border-t border-[#EAF6FC] text-[11px] text-[#183247]">
                    {facility.features.slice(0, 2).map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#55B9E8] shrink-0" />
                        <span className="truncate">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* D. TRAINING PROGRAMS PREVIEW */}
      {/* ========================================= */}
      <section className="py-20 bg-[#EAF6FC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#55B9E8] block mb-2">
              Transformative Disciplines
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#123B5D] font-['Outfit']">
              SIGNATURE TRAINING PROGRAMS
            </h2>
            <div className="w-16 h-1 bg-[#55B9E8] mx-auto mt-4 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {programs.slice(0, 3).map((prog) => (
              <div
                key={prog.id}
                className="bg-white rounded-3xl overflow-hidden border border-[#DCE5EB] shadow-md hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={prog.image_url}
                    alt={prog.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#55B9E8] bg-[#123B5D]/80 px-2 py-0.5 rounded-md">
                      {prog.category}
                    </span>
                    <h3 className="text-xl font-bold font-['Outfit'] mt-1">{prog.title}</h3>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-[#718596] leading-relaxed mb-4">
                    {prog.description}
                  </p>

                  <div className="pt-4 border-t border-[#EAF6FC] flex items-center justify-between text-xs text-[#183247]">
                    <span className="font-semibold">{prog.duration}</span>
                    <span className="text-[#55B9E8] font-bold">{prog.difficulty}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => navigate('programs')}
              className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-[#123B5D] bg-white border border-[#DCE5EB] hover:border-[#55B9E8] shadow-sm transition-all"
            >
              View All Programs & Schedules
            </button>
          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* E. PROFESSIONAL TRAINERS */}
      {/* ========================================= */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#55B9E8] block mb-2">
              World-Class Mentorship
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#123B5D] font-['Outfit']">
              MEET OUR MASTER TRAINERS
            </h2>
            <div className="w-16 h-1 bg-[#55B9E8] mx-auto mt-4 rounded-full" />
            <p className="mt-4 text-[#718596] text-sm">
              Certified biomechanists, Olympians, and conditioning specialists committed to your physical evolution.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {trainers.map((trainer) => (
              <div
                key={trainer.id}
                className="bg-white rounded-3xl overflow-hidden border border-[#DCE5EB] shadow-sm hover:shadow-xl transition-all duration-300 text-center flex flex-col"
              >
                <div className="relative h-64 overflow-hidden bg-slate-100">
                  <img
                    src={trainer.image_url}
                    alt={trainer.name}
                    className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold text-[#123B5D]">
                    {trainer.experience}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[#123B5D] font-['Outfit']">{trainer.name}</h3>
                    <p className="text-xs font-semibold text-[#55B9E8] mb-2">{trainer.role}</p>
                    <p className="text-xs text-[#718596] line-clamp-3 leading-relaxed mb-4">
                      {trainer.bio}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#EAF6FC] flex items-center justify-between text-xs text-[#718596]">
                    <span className="text-[11px] font-medium text-[#183247]">{trainer.specialization}</span>
                    {trainer.instagram && (
                      <span className="text-[#55B9E8] font-bold">{trainer.instagram}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* F. MEMBERSHIP PREVIEW */}
      {/* ========================================= */}
      <section className="py-20 bg-gradient-to-b from-[#F5F7F9] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#55B9E8] block mb-2">
              Transparent Investment
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#123B5D] font-['Outfit']">
              SELECT YOUR MEMBERSHIP TIER
            </h2>
            <div className="w-16 h-1 bg-[#55B9E8] mx-auto mt-4 rounded-full" />
            <p className="mt-4 text-[#718596] text-sm">
              All plans include complete club floor access, luxury lockers, steam chambers, and our digital member dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 border ${
                  plan.popular_badge
                    ? 'border-[#55B9E8] ring-2 ring-[#55B9E8]/20 shadow-xl'
                    : 'border-[#DCE5EB] shadow-sm hover:shadow-lg'
                }`}
              >
                {plan.popular_badge === 1 && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#55B9E8] text-white text-[10px] font-black uppercase tracking-widest shadow-md">
                    Most Popular
                  </span>
                )}

                <div>
                  <h3 className="text-xl font-bold text-[#123B5D] font-['Outfit'] mb-1">
                    {plan.name}
                  </h3>
                  <div className="text-xs font-semibold text-[#718596] uppercase tracking-wider mb-4">
                    Duration: {plan.duration_label}
                  </div>

                  <div className="flex items-baseline gap-1 my-4 pb-4 border-b border-[#DCE5EB]">
                    <span className="text-3xl sm:text-4xl font-black text-[#123B5D] font-['Outfit']">
                      ₹{plan.price_inr.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-medium text-[#718596]">/ {plan.duration_label}</span>
                  </div>

                  <p className="text-xs text-[#718596] leading-relaxed mb-6">
                    {plan.description}
                  </p>

                  <div className="space-y-2.5 mb-8">
                    {plan.features.slice(0, 4).map((f, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-[#183247]">
                        <CheckCircle2 className="w-4 h-4 text-[#55B9E8] shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => navigate('booking', { planId: plan.id })}
                  className={`w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    plan.popular_badge
                      ? 'bg-gradient-to-r from-[#55B9E8] to-[#123B5D] text-white shadow-md shadow-[#55B9E8]/30 hover:opacity-95'
                      : 'bg-[#EAF6FC] text-[#123B5D] hover:bg-[#55B9E8] hover:text-white'
                  }`}
                >
                  Join Now
                </button>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => navigate('membership')}
              className="inline-flex items-center gap-2 text-sm font-bold text-[#123B5D] hover:text-[#55B9E8] transition-colors"
            >
              <span>View Full Membership Comparison</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* G. GYM GALLERY PREVIEW & LIGHTBOX */}
      {/* ========================================= */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#55B9E8] block mb-2">
                Visual Experience
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#123B5D] font-['Outfit']">
                CLUB GALLERY & INTERIORS
              </h2>
            </div>
            <button
              onClick={() => navigate('gallery')}
              className="mt-4 md:mt-0 flex items-center gap-1.5 text-sm font-bold text-[#55B9E8] hover:text-[#123B5D]"
            >
              <span>Open Full Gallery</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {gallery.slice(0, 4).map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedImage(item)}
                className="group relative h-60 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all"
              >
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <div className="text-center p-3">
                    <Eye className="w-6 h-6 mx-auto mb-1 text-[#55B9E8]" />
                    <span className="text-xs font-bold block">{item.title}</span>
                    <span className="text-[10px] text-[#DCE5EB] uppercase tracking-wider">{item.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Image Lightbox Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl">
            <img
              src={selectedImage.image_url}
              alt={selectedImage.title}
              className="w-full max-h-[75vh] object-contain bg-black"
            />
            <div className="p-6 bg-white flex items-center justify-between">
              <div>
                <h4 className="text-lg font-bold text-[#123B5D] font-['Outfit']">{selectedImage.title}</h4>
                <p className="text-xs text-[#718596]">{selectedImage.description || selectedImage.category}</p>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="px-4 py-2 bg-[#EAF6FC] hover:bg-[#DCE5EB] text-[#123B5D] text-xs font-bold rounded-xl"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* H. TESTIMONIALS */}
      {/* ========================================= */}
      <section className="py-20 bg-[#F5F7F9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#55B9E8] block mb-2">
              Member Stories
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#123B5D] font-['Outfit']">
              TESTIMONIALS & REVIEWS
            </h2>
            <div className="w-16 h-1 bg-[#55B9E8] mx-auto mt-4 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((item) => (
              <div
                key={item.id}
                className="bg-white p-8 rounded-3xl border border-[#DCE5EB] shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-4">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-[#183247] italic leading-relaxed mb-6">
                    "{item.review_text}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-[#EAF6FC]">
                  <img
                    src={item.image_url}
                    alt={item.member_name}
                    className="w-11 h-11 rounded-full object-cover border-2 border-[#55B9E8]"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-[#123B5D]">{item.member_name}</h4>
                    <p className="text-[11px] text-[#718596]">{item.role_or_title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* I. OPENING HOURS & J. CONTACT PREVIEW */}
      {/* ========================================= */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Opening Hours Schedule */}
            <div className="lg:col-span-5 bg-[#EAF6FC] p-8 sm:p-10 rounded-3xl border border-[#55B9E8]/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#55B9E8] text-white flex items-center justify-center">
                  <Clock className="w-5 h-5 stroke-[2.4]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#123B5D] font-['Outfit']">Weekly Opening Hours</h3>
                  <p className="text-xs text-[#718596]">Always accessible for your active lifestyle</p>
                </div>
              </div>

              <div className="space-y-3">
                {hours.map((h) => (
                  <div
                    key={h.id}
                    className="flex items-center justify-between py-2 border-b border-[#DCE5EB]/60 text-xs text-[#183247]"
                  >
                    <span className="font-bold">{h.day_of_week}</span>
                    <span className="text-[#123B5D] font-mono">
                      {h.is_closed ? 'Closed' : `${h.open_time} - ${h.close_time}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location & Quick Contact */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#55B9E8] block">
                Concierge & Location
              </span>
              <h2 className="text-3xl font-extrabold text-[#123B5D] font-['Outfit']">
                EXPERIENCE AURA IN PERSON
              </h2>
              <p className="text-sm text-[#718596] leading-relaxed">
                Situated in the prestigious heart of Bandra West, Aura offers valet parking, seamless check-in, and private tour inductions.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-[#F5F7F9] border border-[#DCE5EB] flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#55B9E8] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#123B5D] block">Club Address</span>
                    <span className="text-[#718596]">Plot 42, Linking Road, Bandra West, Mumbai 400050</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#F5F7F9] border border-[#DCE5EB] flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#55B9E8] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#123B5D] block">Direct Concierge</span>
                    <span className="text-[#718596]">+91 91528 77826 / +91 22 2640 8899</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-4">
                <button
                  onClick={() => navigate('contact')}
                  className="px-6 py-3.5 bg-[#123B5D] hover:bg-[#183247] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Book Private Club Tour
                </button>
                <button
                  onClick={() => navigate('membership')}
                  className="px-6 py-3.5 bg-[#55B9E8] hover:bg-[#48a8d6] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-md shadow-[#55B9E8]/30"
                >
                  Join Today
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
