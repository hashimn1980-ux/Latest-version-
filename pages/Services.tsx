import React, { useEffect, useState } from 'react';
import { Page, Language } from '../types';

interface ServicesProps {
  onNavigate: (page: Page) => void;
  language: Language;
}

const Services: React.FC<ServicesProps> = ({ onNavigate }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    setTimeout(() => setMounted(true), 100);
  }, []);

  return (
    <div className="bg-navy min-h-screen pt-24 pb-12 px-6 md:px-12 flex flex-col items-center">
      
      {/* Header */}
      <div className={`text-center mb-16 transition-all duration-1000 transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <h1 className="font-serif text-5xl md:text-6xl text-gold-foil uppercase tracking-wider mb-4">Services</h1>
        <div className="w-24 h-px bg-gradient-to-r from-transparent via-copper to-transparent mx-auto"></div>
      </div>

      {/* Split Container */}
      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-stretch">
        
        {/* Card A: COMMISSION */}
        <div 
          className={`
            relative bg-navy-light border border-gold/30 p-12 md:p-16 flex flex-col items-center text-center justify-between
            transition-all duration-500 delay-200 transform group cursor-default
            ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}
            hover:scale-[1.02] hover:border-gold hover:shadow-[0_0_30px_rgba(236,146,19,0.1)]
          `}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="mb-8">
            <span className="material-symbols-outlined text-5xl text-white/80 mb-6 font-thin transition-transform duration-500 group-hover:-translate-y-2 group-hover:text-gold">visibility</span>
            <h2 className="font-serif text-3xl text-white mb-4 group-hover:text-gold-foil transition-colors duration-300">COMMISSION</h2>
            <div className="w-12 h-px bg-white/20 mx-auto mb-6 group-hover:bg-gold/50 transition-colors duration-300"></div>
            <p className="font-sans text-white/70 leading-relaxed max-w-sm mx-auto">
              One session. Beautifully crafted imagery for your brand.
            </p>
          </div>

          <button 
            onClick={() => onNavigate(Page.CONCIERGE)}
            className="px-8 py-4 border border-gold text-white transition-all duration-300 uppercase text-xs font-bold tracking-[0.2em]
            hover:bg-gold hover:text-navy hover:shadow-[0_0_20px_rgba(236,146,19,0.3)] hover:-translate-y-1"
          >
            One-Time Booking
          </button>
        </div>

        {/* Card B: RETAINER */}
        <div 
          className={`
            relative bg-navy-lighter shadow-2xl p-12 md:p-16 flex flex-col items-center text-center justify-between
            transition-all duration-500 delay-400 transform border border-transparent group cursor-default
            ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}
             hover:scale-[1.02] hover:border-gold hover:shadow-[0_0_30px_rgba(236,146,19,0.15)]
          `}
        >
          {/* Gold Accent Overlay */}
          <div className="absolute inset-0 border border-gold/10 pointer-events-none group-hover:border-transparent transition-colors duration-300"></div>
          
          <div className="mb-8">
            <span className="material-symbols-outlined text-5xl text-gold mb-6 font-thin transition-transform duration-500 group-hover:-translate-y-2 group-hover:text-gold-light">diamond</span>
            <h2 className="font-serif text-3xl text-gold-foil mb-4">RETAINER</h2>
            <div className="w-12 h-px bg-gold/40 mx-auto mb-6 group-hover:bg-gold transition-colors duration-300"></div>
            <p className="font-sans text-white/90 leading-relaxed max-w-sm mx-auto">
              Continuous photography and care for your visual presence.
            </p>
          </div>

          <button 
             onClick={() => onNavigate(Page.CONCIERGE)}
             className="px-8 py-4 bg-gradient-to-r from-gold-dark via-gold to-gold-dark text-navy-dark font-bold 
             transition-all duration-300 uppercase text-xs tracking-[0.2em]
             hover:bg-none hover:bg-gold hover:text-navy-dark hover:shadow-[0_0_30px_rgba(191,155,48,0.6)] hover:-translate-y-1"
          >
            Apply for Membership
          </button>
        </div>

      </div>
    </div>
  );
};

export default Services;