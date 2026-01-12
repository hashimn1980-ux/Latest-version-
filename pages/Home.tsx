import React, { useEffect, useRef, useState } from 'react';
import { Page, Language } from '../types';
import { ASSETS } from '../constants';

interface HomeProps {
  onNavigate: (page: Page) => void;
  language: Language;
}

const Home: React.FC<HomeProps> = ({ onNavigate, language }) => {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    const el = containerRef.current;
    if (el) el.addEventListener('mousemove', handleMouseMove);
    return () => {
      if (el) el.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // --- CONTENT MAPPING ---
  const content = {
    [Language.EN]: {
      tagline: "One Shot... Forever.",
      philHeading: "First impressions form digitally. We search people before we meet them.",
      philBody: "Your digital presence is your moment to shine. Never settle for 'good enough'—it is a strategic loss. We don't make images; we architect a presence that commands respect.",
      cta: "Application for Visual Audit",
      mandateTitle: "THE INSTITUTION",
      mandateSub: "For the Executive. Privacy Guaranteed.",
      mandateLink: "Discover The Mandate",
      archiveTitle: "THE ARCHIVE",
      archiveSub: "Hyper-Realism. Deconstructed Reality.",
      archiveLink: "Enter The Gallery"
    },
    [Language.AR]: {
      tagline: "لقطة واحدة... إلى الأبد",
      philHeading: "نُكوّن انطباعاتنا الأولى رقمياً، نبحث عن الآخرين قبل لقائهم.",
      philBody: "حضورك الرقمي هو لحظتك للتألق. لا ترضَ بـ \"الجيد بما فيه الكفاية\"—فهي خسارة استراتيجية. نحن لا نصنع صوراً؛ بل نهندس حضوراً يفرض الاحترام.",
      cta: "طلب تدقيق بصري",
      mandateTitle: "المؤسسة",
      mandateSub: "للتنفيذيين. خصوصية مضمونة.",
      mandateLink: "اكتشف المؤسسة",
      archiveTitle: "الأرشيف",
      archiveSub: "واقعية فائقة. تفكيك الواقع.",
      archiveLink: "ادخل المعرض"
    }
  };

  const txt = content[language];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section 
        ref={containerRef}
        className="relative h-screen w-full overflow-hidden bg-black flex items-center justify-center"
      >
        {/* Molten Copper Background Simulation */}
        <div className="absolute inset-0 z-0 opacity-80">
           <img 
             src={ASSETS.HOME.HERO_BG}
             className="w-full h-full object-cover blur-sm scale-110 animate-pulse-slow" 
             alt="Molten Copper" 
           />
           {/* Darken overlay */}
           <div className="absolute inset-0 bg-black/30 transition-opacity duration-500"></div>
        </div>

        {/* Torchlight Effect - Increased Radius and Intensity */}
        <div 
          className="absolute inset-0 z-10 pointer-events-none mix-blend-soft-light transition-opacity duration-75"
          style={{
            background: `radial-gradient(900px circle at ${mousePos.x}px ${mousePos.y}px, rgba(183, 121, 92, 0.25) 0%, rgba(15, 40, 68, 0.7) 40%, rgba(15, 40, 68, 1) 100%)`
          }}
        />

        {/* Center Content */}
        <div className="relative z-20 text-center px-4">
          <div className="flex justify-center">
             <img 
               src={ASSETS.LOGO.HOME_HERO} 
               alt="ANEEF Emblem" 
               className="w-80 md:w-[30rem] lg:w-[40rem] h-auto object-contain drop-shadow-2xl" 
             />
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce z-20">
          <div className="w-[1px] h-16 bg-gradient-to-b from-transparent to-copper"></div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="relative py-32 px-6 md:px-12 bg-navy border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          <span className="text-white/40 font-sans text-xs uppercase tracking-[0.2em] mb-8 block">
            {language === Language.AR ? 'الفلسفة' : 'The Philosophy'}
          </span>
          
          <h2 className="font-serif text-2xl md:text-4xl lg:text-5xl text-white leading-tight mb-12">
            {txt.philHeading}
          </h2>
          
          <p className="font-sans text-white/80 text-lg leading-relaxed max-w-2xl mx-auto mb-12">
            {txt.philBody}
          </p>

          {/* CTA BUTTON - Routes to Concierge (Application) */}
          <button 
            onClick={() => onNavigate(Page.CONCIERGE)}
            className="px-10 py-5 border border-copper text-copper hover:bg-copper hover:text-white transition-all duration-500 ease-out text-xs uppercase tracking-[0.25em] font-bold"
          >
            {txt.cta}
          </button>
        </div>
      </section>

      {/* Dual Path Section */}
      <section className="relative h-screen flex flex-col md:flex-row overflow-hidden">
        {/* Left: The Mandate (Institution) */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full relative group cursor-pointer border-b md:border-b-0 md:border-r border-white/10" onClick={() => onNavigate(Page.INSTITUTION)}>
          <div className="absolute inset-0 bg-navy transition-all duration-700 md:group-hover:w-[140%] z-0">
             <div className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay" style={{ backgroundImage: `url('${ASSETS.HOME.MANDATE_BG}')`}}></div>
          </div>
          <div className="absolute inset-0 z-10 flex flex-col justify-center items-center md:items-start p-12 transition-transform duration-500 group-hover:scale-105">
            <h3 className="font-serif text-4xl md:text-5xl text-white mb-4">{txt.mandateTitle}</h3>
            <p className="font-sans text-white/60 text-sm uppercase tracking-widest mb-8">{txt.mandateSub}</p>
            <span className="text-copper text-xs border-b border-copper pb-1">{txt.mandateLink}</span>
          </div>
        </div>

        {/* Right: The Archive (Gallery) */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full relative group cursor-pointer" onClick={() => onNavigate(Page.VAULT)}>
          <div className="absolute inset-0 bg-navy-light transition-all duration-700 md:group-hover:w-[140%] md:group-hover:-translate-x-[20%] z-0">
             <div className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay" style={{ backgroundImage: `url('${ASSETS.HOME.ACCELERATE_BG}')`}}></div>
          </div>
          <div className="absolute inset-0 z-10 flex flex-col justify-center items-center md:items-end p-12 text-right transition-transform duration-500 group-hover:scale-105">
            <h3 className="font-serif text-4xl md:text-5xl text-white mb-4">{txt.archiveTitle}</h3>
            <p className="font-sans text-white/60 text-sm uppercase tracking-widest mb-8">{txt.archiveSub}</p>
            <span className="text-copper text-xs border-b border-copper pb-1">{txt.archiveLink}</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;