import React, { useState } from 'react';
import { MessageCircle, Phone, X } from 'lucide-react';

export const FloatingWhatsApp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const phoneNumber = '919152877826';
  const prefilledMessage = encodeURIComponent(
    'Hello Aura Concierge, I am interested in exploring a membership at Aura Luxury Fitness Club. Could you please share more details or arrange a private club tour?'
  );

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {isOpen && (
        <div className="mb-3 w-72 bg-white rounded-2xl shadow-2xl border border-[#DCE5EB] p-4 text-[#183247] animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAF6FC]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#55B9E8] flex items-center justify-center text-white font-bold text-xs">
                AL
              </div>
              <div>
                <h5 className="text-xs font-bold text-[#123B5D]">Aura Concierge Desk</h5>
                <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Online Now
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#718596] hover:text-[#183247] p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-[#718596] my-3 leading-relaxed">
            Welcome to Aura. Speak with our member concierge for plan recommendations, private tour bookings, or trainer inquiries.
          </p>

          <div className="space-y-2">
            <a
              href={`https://wa.me/${phoneNumber}?text=${prefilledMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold rounded-xl shadow-md transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Chat on WhatsApp (+91 91528 77826)
            </a>
            <a
              href="tel:+919152877826"
              className="w-full flex items-center justify-center gap-2 py-2 bg-[#EAF6FC] hover:bg-[#DCE5EB] text-[#123B5D] text-xs font-bold rounded-xl transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#55B9E8]" />
              Call Reception Directly
            </a>
          </div>
        </div>
      )}

      {/* Main floating trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-[#25D366]/40 hover:scale-105 transition-all duration-300 focus:outline-none group"
        aria-label="Contact on WhatsApp"
      >
        <MessageCircle className="w-7 h-7 stroke-[2.2]" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#55B9E8] rounded-full border-2 border-white flex items-center justify-center text-[9px] font-black text-white">
          1
        </span>
      </button>
    </div>
  );
};
