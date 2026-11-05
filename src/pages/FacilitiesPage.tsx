import React, { useEffect, useState } from 'react';
import { Facility } from '../types';
import { CheckCircle2, ArrowRight } from 'lucide-react';

interface FacilitiesPageProps {
  navigate: (page: string, params?: any) => void;
}

export const FacilitiesPage: React.FC<FacilitiesPageProps> = ({ navigate }) => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  useEffect(() => {
    fetch('/api/gym/facilities')
      .then((res) => res.json())
      .then((data) => setFacilities(data.facilities || []));
  }, []);

  const categories = ['All', ...Array.from(new Set(facilities.map((f) => f.category)))];

  const filtered = activeCategory === 'All'
    ? facilities
    : facilities.filter((f) => f.category === activeCategory);

  return (
    <div className="bg-white min-h-screen">
      {/* Banner */}
      <section className="bg-gradient-to-b from-[#EAF6FC] to-white py-16 sm:py-20 border-b border-[#DCE5EB]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#55B9E8] block mb-3">
            Elite Infrastructure
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-[#123B5D] font-['Outfit'] uppercase">
            WORLD-CLASS GYM FACILITIES
          </h1>
          <div className="w-16 h-1 bg-[#55B9E8] mx-auto mt-4 rounded-full" />
          <p className="max-w-2xl mx-auto mt-4 text-[#718596] text-base leading-relaxed">
            Discover 25,000 square feet of master-crafted training zones, luxury hydrotherapy spas, and competition Olympic platforms.
          </p>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeCategory === cat
                    ? 'bg-[#123B5D] text-white shadow-md'
                    : 'bg-white text-[#183247] border border-[#DCE5EB] hover:border-[#55B9E8]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-3xl overflow-hidden border border-[#DCE5EB] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                <div className="relative h-64 overflow-hidden bg-slate-100">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[#123B5D] text-[11px] font-bold uppercase tracking-wider shadow-sm">
                    {item.category}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-[#123B5D] font-['Outfit'] mb-2 group-hover:text-[#55B9E8] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#718596] leading-relaxed mb-6">
                      {item.description}
                    </p>

                    <div className="space-y-2 mb-6">
                      <span className="text-[10px] font-bold text-[#123B5D] uppercase tracking-wider block">
                        Features & Amenities:
                      </span>
                      {item.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-[#183247]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#55B9E8] shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('membership')}
                    className="w-full py-3 bg-[#EAF6FC] hover:bg-[#55B9E8] hover:text-white text-[#123B5D] rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Book Membership Access</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
