import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, MessageCircle, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Membership Inquiry',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const res = await fetch('/api/gym/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit inquiry');
      }

      setSuccess(data.message || 'Your message has been received! Our concierge will contact you promptly.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'Membership Inquiry',
        message: '',
      });
    } catch (err: any) {
      setError(err.message || 'Error sending message. Please try again or call us directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Banner */}
      <section className="bg-gradient-to-b from-[#EAF6FC] to-white py-16 sm:py-20 border-b border-[#DCE5EB]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#55B9E8] block mb-3">
            Member Concierge Desk
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-[#123B5D] font-['Outfit'] uppercase">
            CONNECT WITH AURA LUXURY FITNESS
          </h1>
          <div className="w-16 h-1 bg-[#55B9E8] mx-auto mt-4 rounded-full" />
          <p className="max-w-2xl mx-auto mt-4 text-[#718596] text-base leading-relaxed">
            Schedule a private club walk-through, discuss custom corporate memberships, or speak with our master training staff.
          </p>
        </div>
      </section>

      {/* Main Contact Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left: Contact Info & Details */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-8 rounded-3xl bg-[#EAF6FC] border border-[#55B9E8]/30 space-y-6">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#55B9E8] block mb-1">
                    Direct Contact Channels
                  </span>
                  <h3 className="text-2xl font-black text-[#123B5D] font-['Outfit']">
                    Get in Touch
                  </h3>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-[#183247]">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#55B9E8] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#123B5D] block">Club Address</span>
                      <span className="text-[#718596] leading-relaxed">
                        Plot 42, Platinum Enclave, Linking Road, Bandra West, Mumbai, Maharashtra 400050
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-[#55B9E8] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#123B5D] block">Telephone</span>
                      <a href="tel:+919152877826" className="text-[#55B9E8] hover:underline block font-semibold">
                        +91 91528 77826 (Mobile Concierge)
                      </a>
                      <a href="tel:+912226408899" className="text-[#718596] hover:underline block">
                        +91 22 2640 8899 (Desk Line)
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-[#55B9E8] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#123B5D] block">Electronic Mail</span>
                      <a href="mailto:concierge@auragym.com" className="text-[#55B9E8] hover:underline font-semibold">
                        concierge@auragym.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-[#55B9E8] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#123B5D] block">Operating Hours</span>
                      <span className="text-[#718596]">Mon – Sat: 05:30 AM – 10:30 PM</span>
                      <span className="text-[#718596] block">Sunday: 07:00 AM – 08:00 PM</span>
                    </div>
                  </div>
                </div>

                {/* Direct WhatsApp Quick Connect */}
                <div className="pt-4 border-t border-[#DCE5EB]">
                  <a
                    href="https://wa.me/919152877826?text=Hello%20Aura%20Concierge,%20I%20would%20like%20to%20inquire%20about%20club%20membership."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Instant WhatsApp Chat (+91 91528 77826)</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right: Contact Form */}
            <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-[#DCE5EB] shadow-lg">
              <h3 className="text-2xl font-bold text-[#123B5D] font-['Outfit'] mb-2">
                Send Us a Message
              </h3>
              <p className="text-xs text-[#718596] mb-6">
                Fill in the details below. Messages are logged directly to our member management system.
              </p>

              {success && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-[#718596] uppercase tracking-wider block mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Vikram Malhotra"
                      className="w-full px-3.5 py-3 rounded-xl border border-[#DCE5EB] focus:outline-none focus:border-[#55B9E8] text-[#183247]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#718596] uppercase tracking-wider block mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. vikram@example.com"
                      className="w-full px-3.5 py-3 rounded-xl border border-[#DCE5EB] focus:outline-none focus:border-[#55B9E8] text-[#183247]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-[#718596] uppercase tracking-wider block mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-3 rounded-xl border border-[#DCE5EB] focus:outline-none focus:border-[#55B9E8] text-[#183247]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#718596] uppercase tracking-wider block mb-1">
                      Subject
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3.5 py-3 rounded-xl border border-[#DCE5EB] focus:outline-none focus:border-[#55B9E8] text-[#183247] bg-white"
                    >
                      <option value="Membership Inquiry">Membership Inquiry</option>
                      <option value="Personal Training Request">Personal Training Request</option>
                      <option value="Private Club Tour Booking">Private Club Tour Booking</option>
                      <option value="Corporate Partnerships">Corporate Partnerships</option>
                      <option value="General Feedback">General Feedback</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#718596] uppercase tracking-wider block mb-1">
                    Your Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about your fitness background, timetable preferences, or specific questions..."
                    className="w-full px-3.5 py-3 rounded-xl border border-[#DCE5EB] focus:outline-none focus:border-[#55B9E8] text-[#183247]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-[#55B9E8] to-[#123B5D] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Submitting Inquiry...' : 'Submit Message'}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Interactive Google Map Embed */}
          <div className="mt-16 rounded-3xl overflow-hidden border border-[#DCE5EB] shadow-lg">
            <div className="p-4 bg-[#F5F7F9] border-b border-[#DCE5EB] flex items-center justify-between text-xs">
              <span className="font-bold text-[#123B5D] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#55B9E8]" />
                Google Maps Location — Bandra West, Mumbai
              </span>
              <a
                href="https://maps.google.com/?q=Linking+Road+Bandra+West+Mumbai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#55B9E8] hover:underline font-bold"
              >
                Open in Google Maps App
              </a>
            </div>
            <iframe
              title="Aura Luxury Gym Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3770.8357488053676!2d72.82967667595304!3d19.060010952811444!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c9135084a923%3A0xc00f07c72e23bdf2!2sLinking%20Rd%2C%20Bandra%20West%2C%20Mumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1714500000000!5m2!1sen!2sin"
              width="100%"
              height="380"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
};
