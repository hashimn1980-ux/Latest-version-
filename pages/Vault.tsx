import React, { useState, useRef, MouseEvent } from 'react';
import { ASSETS } from '../constants';
import { Language } from '../types';

interface VaultProps {
  language: Language;
}

type Collection = 'POWER' | 'VOYAGE' | 'ESSENCE';

interface ArchiveItem {
  id: string;
  src: string;
  collection: Collection;
  caption: string;
  detail: string;
}

const ITEMS: ArchiveItem[] = [
  // POWER
  { id: 'p1', collection: 'POWER', src: ASSETS.ARCHIVE.POWER[0], caption: 'Commission 102. Teterboro.', detail: 'Pre-flight brief. 0600 hours.' },
  { id: 'p2', collection: 'POWER', src: ASSETS.ARCHIVE.POWER[1], caption: 'Commission 099. The Gala.', detail: 'Before the doors opened.' },
  { id: 'p3', collection: 'POWER', src: ASSETS.ARCHIVE.POWER[2], caption: 'Commission 044. Canary Wharf.', detail: 'Boardroom Monolith.' },
  { id: 'p4', collection: 'POWER', src: ASSETS.ARCHIVE.POWER[3], caption: 'Commission 058. The Summit.', detail: 'Strategy defined.' },
  { id: 'p5', collection: 'POWER', src: ASSETS.ARCHIVE.POWER[4], caption: 'Commission 072. Legacy.', detail: 'Iron and glass.' },
  { id: 'p6', collection: 'POWER', src: ASSETS.ARCHIVE.POWER[5], caption: 'Commission 081. Command.', detail: 'Silent authority.' },
  // VOYAGE (Updated with 18 items)
  { id: 'v1', collection: 'VOYAGE', src: ASSETS.ARCHIVE.VOYAGE[0], caption: 'Commission 084. The Crossing.', detail: 'Open waters.' },
  { id: 'v2', collection: 'VOYAGE', src: ASSETS.ARCHIVE.VOYAGE[1], caption: 'Commission 055. Horizon.', detail: 'Infinite blue.' },
  { id: 'v3', collection: 'VOYAGE', src: ASSETS.ARCHIVE.VOYAGE[2], caption: 'Commission 112. Shoreline.', detail: 'Tidal shift.' },
  { id: 'v4', collection: 'VOYAGE', src: ASSETS.ARCHIVE.VOYAGE[3], caption: 'Commission 118. Sanctuary.', detail: 'Hidden cove.' },
  { id: 'v5', collection: 'VOYAGE', src: ASSETS.ARCHIVE.VOYAGE[4], caption: 'Commission 125. Elevation.', detail: 'Above the clouds.' },
  { id: 'v6', collection: 'VOYAGE', src: ASSETS.ARCHIVE.VOYAGE[5], caption: 'Commission 130. Transit.', detail: 'The journey between.' },
  { id: 'v7', collection: 'VOYAGE', src: ASSETS.ARCHIVE.VOYAGE[6], caption: 'Commission 142. Descent.', detail: 'Arrival protocol.' },
  { id: 'v8', collection: 'VOYAGE', src: ASSETS.ARCHIVE.VOYAGE[7], caption: 'Commission 156. Stillness.', detail: 'Moments of pause.' },
  { id: 'v9', collection: 'VOYAGE', src: ASSETS.ARCHIVE.VOYAGE[8], caption: 'Commission 165. The Ascent.', detail: 'Thin air.' },
  { id: 'v10', collection: 'VOYAGE', src: ASSETS.ARCHIVE.VOYAGE[9], caption: 'Commission 172. Velocity.', detail: 'Static motion.' },
  { id: 'v11', collection: 'VOYAGE', src: ASSETS.ARCHIVE.VOYAGE[10], caption: 'Commission 178. Drift.', detail: 'Controlled chaos.' },
  { id: 'v12', collection: 'VOYAGE', src: ASSETS.ARCHIVE.VOYAGE[11], caption: 'Commission 184. Passage.', detail: 'Through the night.' },
  { id: 'v13', collection: 'VOYAGE', src: ASSETS.ARCHIVE.VOYAGE[12], caption: 'Commission 191. North.', detail: 'True bearing.' },
  { id: 'v14', collection: 'VOYAGE', src: ASSETS.ARCHIVE.VOYAGE[13], caption: 'Commission 199. Arrival.', detail: 'The red carpet.' },
  { id: 'v15', collection: 'VOYAGE', src: ASSETS.ARCHIVE.VOYAGE[14], caption: 'Commission 205. Departure.', detail: 'Wheels up.' },
  { id: 'v16', collection: 'VOYAGE', src: ASSETS.ARCHIVE.VOYAGE[15], caption: 'Commission 212. Orbit.', detail: 'World view.' },
  { id: 'v17', collection: 'VOYAGE', src: ASSETS.ARCHIVE.VOYAGE[16], caption: 'Commission 220. Meridian.', detail: 'Time zones.' },
  { id: 'v18', collection: 'VOYAGE', src: ASSETS.ARCHIVE.VOYAGE[17], caption: 'Commission 228. Apex.', detail: 'Summit reached.' },
  // ESSENCE
  { id: 'e1', collection: 'ESSENCE', src: ASSETS.ARCHIVE.ESSENCE[0], caption: 'Commission 001. Origin.', detail: 'The beginning.' },
  { id: 'e2', collection: 'ESSENCE', src: ASSETS.ARCHIVE.ESSENCE[1], caption: 'Commission 023. Texture.', detail: 'Detail study.' },
  { id: 'e3', collection: 'ESSENCE', src: ASSETS.ARCHIVE.ESSENCE[2], caption: 'Commission 034. Identity.', detail: 'Unspoken words.' },
  { id: 'e4', collection: 'ESSENCE', src: ASSETS.ARCHIVE.ESSENCE[3], caption: 'Commission 045. Heritage.', detail: 'Roots run deep.' },
  { id: 'e5', collection: 'ESSENCE', src: ASSETS.ARCHIVE.ESSENCE[4], caption: 'Commission 056. Light.', detail: 'Shadow play.' },
  { id: 'e6', collection: 'ESSENCE', src: ASSETS.ARCHIVE.ESSENCE[5], caption: 'Commission 067. Spirit.', detail: 'Inner strength.' },
  { id: 'e7', collection: 'ESSENCE', src: ASSETS.ARCHIVE.ESSENCE[6], caption: 'Commission 078. Silence.', detail: 'Quiet confidence.' },
  { id: 'e8', collection: 'ESSENCE', src: ASSETS.ARCHIVE.ESSENCE[7], caption: 'Commission 089. Form.', detail: 'Sculpted time.' },
  { id: 'e9', collection: 'ESSENCE', src: ASSETS.ARCHIVE.ESSENCE[8], caption: 'Commission 092. Soul.', detail: 'Beyond the surface.' },
  { id: 'e10', collection: 'ESSENCE', src: ASSETS.ARCHIVE.ESSENCE[9], caption: 'Commission 104. Presence.', detail: 'Commanding calm.' },
  { id: 'e11', collection: 'ESSENCE', src: ASSETS.ARCHIVE.ESSENCE[10], caption: 'Commission 115. Gravity.', detail: 'Weight of legacy.' },
  { id: 'e12', collection: 'ESSENCE', src: ASSETS.ARCHIVE.ESSENCE[11], caption: 'Commission 128. Reflection.', detail: 'Mirrored self.' },
  { id: 'e13', collection: 'ESSENCE', src: ASSETS.ARCHIVE.ESSENCE[12], caption: 'Commission 137. Depth.', detail: 'Layers of history.' },
  { id: 'e14', collection: 'ESSENCE', src: ASSETS.ARCHIVE.ESSENCE[13], caption: 'Commission 149. Honor.', detail: 'Sacred trust.' },
  { id: 'e15', collection: 'ESSENCE', src: ASSETS.ARCHIVE.ESSENCE[14], caption: 'Commission 163. Truth.', detail: 'Nothing hidden.' },
];

const MagnifierImage: React.FC<{ src: string; caption: string; detail: string }> = ({ src, caption, detail }) => {
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [xy, setXY] = useState({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement>(null);
  const magnifierSize = 150;
  const zoomLevel = 2.5;

  const handleMouseEnter = () => setShowMagnifier(true);
  const handleMouseLeave = () => setShowMagnifier(false);
  
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;
    const elem = imgRef.current;
    const { top, left, width, height } = elem.getBoundingClientRect();
    
    // Calculate cursor position relative to the image
    const x = e.pageX - left - window.scrollX;
    const y = e.pageY - top - window.scrollY;

    // Boundary checks
    if (x < 0 || y < 0 || x > width || y > height) {
      setShowMagnifier(false);
      return;
    }

    setXY({ x, y });
  };

  return (
    <div className="relative group mb-12">
      <div 
        className="relative overflow-hidden cursor-crosshair"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
        <img
          ref={imgRef}
          src={src}
          alt={caption}
          className="w-full h-auto object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
        />

        {/* The Loupe */}
        <div
          style={{
            display: showMagnifier ? 'block' : 'none',
            position: 'absolute',
            pointerEvents: 'none',
            height: `${magnifierSize}px`,
            width: `${magnifierSize}px`,
            top: `${xy.y - magnifierSize / 2}px`,
            left: `${xy.x - magnifierSize / 2}px`,
            opacity: 1,
            border: '1px solid rgba(255, 255, 255, 0.5)',
            backgroundColor: 'black',
            backgroundImage: `url('${src}')`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: `${imgRef.current ? imgRef.current.width * zoomLevel : 0}px ${imgRef.current ? imgRef.current.height * zoomLevel : 0}px`,
            backgroundPositionX: `${-xy.x * zoomLevel + magnifierSize / 2}px`,
            backgroundPositionY: `${-xy.y * zoomLevel + magnifierSize / 2}px`,
            borderRadius: '50%',
            boxShadow: '0 0 20px rgba(0,0,0,0.8)',
            zIndex: 50
          }}
        />
      </div>

      {/* Caption */}
      <div className="mt-4 flex flex-col items-start opacity-60 group-hover:opacity-100 transition-opacity duration-500">
         <span className="font-serif text-white text-lg italic">{detail}</span>
         <span className="font-sans text-copper text-[10px] uppercase tracking-[0.2em]">{caption}</span>
      </div>
    </div>
  );
};

const Vault: React.FC<VaultProps> = ({ language }) => {
  const [activeCollection, setActiveCollection] = useState<Collection>('POWER');

  const filteredItems = ITEMS.filter(item => item.collection === activeCollection);

  // Content configuration for bilingual support
  const content = {
    [Language.EN]: {
      title: "THE ARCHIVE",
      description: (
        <>
          Select commissions and visual experiments. <br/>
          <span className="text-copper">Deconstructed reality.</span>
        </>
      ),
      categories: {
        POWER: "POWER",
        VOYAGE: "VOYAGE",
        ESSENCE: "ESSENCE"
      },
      footer: "Use the Loupe to verify texture fidelity"
    },
    [Language.AR]: {
      title: "الأرشيف",
      description: (
        <>
          مختارات من التكليفات والتجارب البصرية. <br/>
          <span className="text-copper">تفكيك الواقع.</span>
        </>
      ),
      categories: {
        POWER: "الهيبة",
        VOYAGE: "الرحلة",
        ESSENCE: "الأصالة"
      },
      footer: "استخدم العدسة للتحقق من دقة التفاصيل"
    }
  };

  const txt = content[language];

  return (
    <div className="min-h-screen pt-32 pb-24" style={{ backgroundColor: '#0B0B0B' }}>
      
      {/* Header */}
      <div className="px-6 md:px-12 mb-20 md:mb-32">
        <h1 className="font-serif text-5xl md:text-8xl text-white mb-6 tracking-tight">
          {txt.title}
        </h1>
        <p className="font-sans text-white/50 text-sm md:text-base uppercase tracking-[0.2em] max-w-xl leading-relaxed">
          {txt.description}
        </p>
      </div>

      {/* Categories / Collections */}
      <div className="px-6 md:px-12 mb-16 flex gap-12 border-b border-white/5 pb-4 overflow-x-auto no-scrollbar">
        {(['POWER', 'VOYAGE', 'ESSENCE'] as Collection[]).map((c) => (
          <button
            key={c}
            onClick={() => setActiveCollection(c)}
            className={`
              text-xs md:text-sm uppercase tracking-[0.3em] transition-all duration-300 relative whitespace-nowrap pb-2
              ${activeCollection === c ? 'text-white' : 'text-white/30 hover:text-white/60'}
              ${language === Language.AR ? 'font-arabic' : 'font-sans'}
            `}
          >
            {txt.categories[c]}
            {activeCollection === c && (
              <span className="absolute bottom-0 left-0 w-full h-[1px] bg-copper animate-width"></span>
            )}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div className="px-6 md:px-12 max-w-[1800px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-16">
          {filteredItems.map((item) => (
            <MagnifierImage 
              key={item.id} 
              src={item.src} 
              caption={item.caption} 
              detail={item.detail} 
            />
          ))}
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-32 text-center">
         <p className="text-white/20 text-[10px] uppercase tracking-[0.4em]">
           {txt.footer}
         </p>
      </div>

    </div>
  );
};

export default Vault;