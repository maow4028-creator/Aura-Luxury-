import React, { useEffect, useState } from 'react';
import { GalleryItem } from '../types';
import { Eye, X } from 'lucide-react';

export const GalleryPage: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  useEffect(() => {
    fetch('/api/gym/gallery')
      .then((res) => res.json())
      .then((data) => setItems(data.gallery || []));
  }, []);

  const categories = ['All', ...Array.from(new Set(items.map((i) => i.category)))];

  const filtered = activeCategory === 'All'
    ? items
    : items.filter((i) => i.category === activeCategory);

  return (
    <div className="bg-white min-h-screen">
      {/* Banner */}
      <section className="bg-gradient-to-b from-[#EAF6FC] to-white py-16 sm:py-20 border-b border-[#DCE5EB]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#55B9E8] block mb-3">
            Atmosphere & Spaces
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-[#123B5D] font-['Outfit'] uppercase">
            AURA CLUB PHOTO GALLERY
          </h1>
          <div className="w-16 h-1 bg-[#55B9E8] mx-auto mt-4 rounded-full" />
          <p className="max-w-2xl mx-auto mt-4 text-[#718596] text-base leading-relaxed">
            Tour our luminous interiors, cutting-edge selectorized machinery, private coaching pods, and eucalyptus recovery spas.
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

      {/* Gallery Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="group relative h-72 rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-300"
              >
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#123B5D]/90 via-[#123B5D]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 text-white">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#55B9E8] mb-1">
                    {item.category}
                  </span>
                  <h4 className="text-base font-bold font-['Outfit']">{item.title}</h4>
                  {item.description && (
                    <p className="text-xs text-[#DCE5EB] mt-1 line-clamp-2">{item.description}</p>
                  )}
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-[#55B9E8] font-bold">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Click to expand</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedItem && (
        <div
          onClick={() => setSelectedItem(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="relative bg-black flex items-center justify-center">
              <img
                src={selectedItem.image_url}
                alt={selectedItem.title}
                className="max-h-[70vh] w-auto object-contain mx-auto"
              />
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 bg-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#55B9E8]">
                  {selectedItem.category}
                </span>
                <h3 className="text-xl font-bold text-[#123B5D] font-['Outfit'] mt-0.5">
                  {selectedItem.title}
                </h3>
                {selectedItem.description && (
                  <p className="text-xs text-[#718596] mt-1">{selectedItem.description}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 bg-[#EAF6FC] hover:bg-[#DCE5EB] text-[#123B5D] text-xs font-bold rounded-xl"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
