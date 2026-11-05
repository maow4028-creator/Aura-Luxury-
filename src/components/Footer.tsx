import React from 'react';
import { Dumbbell, MapPin, Phone, Mail, Clock, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  navigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="bg-[#123B5D] text-white pt-16 pb-12 border-t border-[#55B9E8]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Col 1: Brand & About */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#55B9E8] to-white/90 flex items-center justify-center text-[#123B5D] shadow-md">
                <Dumbbell className="w-5 h-5 stroke-[2.4]" />
              </div>
              <div>
                <span className="block text-xl font-black tracking-wider text-white uppercase font-['Outfit']">
                  Aura
                </span>
                <span className="block text-[10px] font-semibold tracking-[0.25em] text-[#55B9E8] uppercase -mt-1">
                  Luxury Fitness
                </span>
              </div>
            </div>
            <p className="text-sm text-[#DCE5EB] leading-relaxed mb-6">
              India’s premier luxury fitness club combining bespoke biomechanical equipment, certified elite coaches, and serene recovery spas. Your transformation begins here.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[#55B9E8] hover:text-[#123B5D] flex items-center justify-center text-white transition-colors"
                aria-label="Instagram"
              >
                <span className="text-xs font-bold">IG</span>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[#55B9E8] hover:text-[#123B5D] flex items-center justify-center text-white transition-colors"
                aria-label="Facebook"
              >
                <span className="text-xs font-bold">FB</span>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[#55B9E8] hover:text-[#123B5D] flex items-center justify-center text-white transition-colors"
                aria-label="YouTube"
              >
                <span className="text-xs font-bold">YT</span>
              </a>
              <a
                href="https://wa.me/919152877826"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-[#55B9E8] text-[#123B5D] flex items-center justify-center font-bold text-xs hover:bg-white transition-colors"
                aria-label="WhatsApp"
              >
                <span>WA</span>
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#55B9E8] mb-5 font-['Outfit']">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm text-[#DCE5EB]">
              <li>
                <button onClick={() => navigate('home')} className="hover:text-white hover:underline transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => navigate('about')} className="hover:text-white hover:underline transition-colors">
                  About Our Heritage
                </button>
              </li>
              <li>
                <button onClick={() => navigate('facilities')} className="hover:text-white hover:underline transition-colors">
                  Club Facilities
                </button>
              </li>
              <li>
                <button onClick={() => navigate('programs')} className="hover:text-white hover:underline transition-colors">
                  Signature Programs
                </button>
              </li>
              <li>
                <button onClick={() => navigate('gallery')} className="hover:text-white hover:underline transition-colors">
                  Photo Gallery
                </button>
              </li>
              <li>
                <button onClick={() => navigate('contact')} className="hover:text-white hover:underline transition-colors">
                  Contact & Concierge
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Membership Tiers */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#55B9E8] mb-5 font-['Outfit']">
              Memberships
            </h4>
            <ul className="space-y-2.5 text-sm text-[#DCE5EB]">
              <li>
                <button onClick={() => navigate('membership')} className="hover:text-white hover:underline transition-colors">
                  Monthly Membership (1 Month)
                </button>
              </li>
              <li>
                <button onClick={() => navigate('membership')} className="hover:text-white hover:underline transition-colors">
                  Quarterly Membership (3 Months)
                </button>
              </li>
              <li>
                <button onClick={() => navigate('membership')} className="hover:text-white hover:underline transition-colors">
                  Half-Yearly Pass (6 Months)
                </button>
              </li>
              <li>
                <button onClick={() => navigate('membership')} className="hover:text-white hover:underline transition-colors">
                  Annual Elite VIP (12 Months)
                </button>
              </li>
              <li>
                <button onClick={() => navigate('my-membership')} className="text-[#55B9E8] hover:text-white font-medium flex items-center gap-1 mt-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Check Active Membership</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Hours */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#55B9E8] mb-5 font-['Outfit']">
              Visit The Club
            </h4>
            <div className="space-y-3.5 text-sm text-[#DCE5EB]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#55B9E8] mt-1 shrink-0" />
                <span>Plot 42, Platinum Enclave, Linking Road, Bandra West, Mumbai 400050</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#55B9E8] shrink-0" />
                <a href="tel:+919152877826" className="hover:text-white">
                  +91 91528 77826 / +91 22 2640 8899
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#55B9E8] shrink-0" />
                <a href="mailto:concierge@auragym.com" className="hover:text-white">
                  concierge@auragym.com
                </a>
              </div>
              <div className="flex items-start gap-2.5 pt-1">
                <Clock className="w-4 h-4 text-[#55B9E8] mt-1 shrink-0" />
                <div>
                  <p className="font-semibold text-white">Mon – Sat: 05:30 AM – 10:30 PM</p>
                  <p className="text-xs text-[#DCE5EB]">Sunday: 07:00 AM – 08:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-xs text-[#DCE5EB]/70 gap-4">
          <p>© {new Date().getFullYear()} Aura Luxury Fitness Club. All Rights Reserved.</p>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('contact')} className="hover:text-white">Privacy Policy</button>
            <button onClick={() => navigate('contact')} className="hover:text-white">Terms & Conditions</button>
            <button onClick={() => navigate('admin')} className="text-[#55B9E8] hover:text-white font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </button>
          </div>
          <p className="flex items-center gap-1">
            Built for Champions with <Heart className="w-3.5 h-3.5 text-[#55B9E8] fill-current" />
          </p>
        </div>
      </div>
    </footer>
  );
};
