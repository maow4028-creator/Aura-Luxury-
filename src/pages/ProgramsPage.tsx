import React, { useEffect, useState } from 'react';
import { Program } from '../types';
import { Clock, BarChart2, Calendar, ArrowRight, Dumbbell } from 'lucide-react';

interface ProgramsPageProps {
  navigate: (page: string, params?: any) => void;
}

export const ProgramsPage: React.FC<ProgramsPageProps> = ({ navigate }) => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  useEffect(() => {
    fetch('/api/gym/programs')
      .then((res) => res.json())
      .then((data) => setPrograms(data.programs || []));
  }, []);

  const categories = ['All', ...Array.from(new Set(programs.map((p) => p.category)))];

  const filtered = activeCategory === 'All'
    ? programs
    : programs.filter((p) => p.category === activeCategory);

  return (
    <div className="bg-white min-h-screen">
      {/* Banner */}
      <section className="bg-gradient-to-b from-[#EAF6FC] to-white py-16 sm:py-20 border-b border-[#DCE5EB]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#55B9E8] block mb-3">
            Tailored Protocols
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-[#123B5D] font-['Outfit'] uppercase">
            SIGNATURE TRAINING PROGRAMS
          </h1>
          <div className="w-16 h-1 bg-[#55B9E8] mx-auto mt-4 rounded-full" />
          <p className="max-w-2xl mx-auto mt-4 text-[#718596] text-base leading-relaxed">
            Periodized science-backed curriculums led by certified biomechanists to ensure progressive overload, fat loss, and athletic endurance.
          </p>

          {/* Categories */}
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

      {/* Programs Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((prog) => (
              <div
                key={prog.id}
                className="group bg-white rounded-3xl overflow-hidden border border-[#DCE5EB] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={prog.image_url}
                    alt={prog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[#123B5D] text-[10px] font-bold uppercase tracking-wider">
                    {prog.category}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-xl font-bold font-['Outfit']">{prog.title}</h3>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs text-[#718596] leading-relaxed mb-6">
                      {prog.description}
                    </p>

                    <div className="space-y-2.5 py-4 border-y border-[#EAF6FC] text-xs text-[#183247]">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#55B9E8] shrink-0" />
                        <span>Duration: <strong>{prog.duration}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BarChart2 className="w-4 h-4 text-[#55B9E8] shrink-0" />
                        <span>Intensity: <strong>{prog.difficulty}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#55B9E8] shrink-0" />
                        <span>Schedule: <strong>{prog.schedule_info}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      onClick={() => navigate('membership')}
                      className="w-full py-3 bg-[#123B5D] hover:bg-[#183247] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Dumbbell className="w-3.5 h-3.5 text-[#55B9E8]" />
                      <span>Join This Program</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
