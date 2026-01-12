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
  // VOYAGE
  { id: 'v1', collection: 'VOYAGE', src: ASSETS.ARCHIVE.VOYAGE[0], caption: 'Commission 084. Amalfi Coast.', detail: 'Late afternoon light.' },
  { id: 'v2', collection: 'VOYAGE', src: ASSETS.ARCHIVE.VOYAGE[1], caption: 'Commission 055. SoHo.', detail: 'Rain check.' },
  { id: 'v3', collection: 'VOYAGE', src: ASSETS.ARCHIVE.VOYAGE[2], caption: 'Commission 112. Aspen.', detail: 'The Silent Season.' },
  // ESSENCE
  { id: 'e1', collection: 'ESSENCE', src: ASSETS.ARCHIVE.ESSENCE[0], caption: 'Commission 001. Origin.', detail: 'The Iris. Unfiltered.' },
  { id: 'e2', collection: 'ESSENCE', src: ASSETS.ARCHIVE.ESSENCE[1], caption: 'Commission 023. Texture Study.', detail: 'Linen & Time.' },
  { id: 'e3', collection: 'ESSENCE', src: ASSETS.ARCHIVE.ESSENCE[2], caption: 'Commission 067. Metropolis.', detail: 'Reflections in glass.' },
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

  return (
    <div className="min-h-screen pt-32 pb-24" style={{ backgroundColor: '#0B0B0B' }}>
      
      {/* Header */}
      <div className="px-6 md:px-12 mb-20 md:mb-32">
        <h1 className="font-serif text-5xl md:text-8xl text-white mb-6 tracking-tight">
          THE ARCHIVE
        </h1>
        <p className="font-sans text-white/50 text-sm md:text-base uppercase tracking-[0.2em] max-w-xl leading-relaxed">
          Select commissions and visual experiments. <br/>
          <span className="text-copper">Deconstructed reality.</span>
        </p>
      </div>

      {/* Categories / Collections */}
      <div className="px-6 md:px-12 mb-16 flex gap-12 border-b border-white/5 pb-4">
        {(['POWER', 'VOYAGE', 'ESSENCE'] as Collection[]).map((c) => (
          <button
            key={c}
            onClick={() => setActiveCollection(c)}
            className={`
              text-xs uppercase tracking-[0.3em] transition-all duration-300 relative
              ${activeCollection === c ? 'text-white' : 'text-white/30 hover:text-white/60'}
            `}
          >
            {c}
            {activeCollection === c && (
              <span className="absolute -bottom-4 left-0 w-full h-[1px] bg-copper animate-width"></span>
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
           Use the Loupe to verify texture fidelity
         </p>
      </div>

    </div>
  );
};

export default Vault;