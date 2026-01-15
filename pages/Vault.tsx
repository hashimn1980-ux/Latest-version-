import React, { useState, useMemo, useRef } from 'react';
import { ASSETS } from '../constants';
import { Language } from '../types';

interface VaultProps {
  language: Language;
}

type Collection = 'POWER' | 'VOYAGE' | 'ESSENCE';

const Vault: React.FC<VaultProps> = ({ language }) => {
  const [selectedNode, setSelectedNode] = useState<Collection | null>(null);
  const [flippedId, setFlippedId] = useState<string | null>(null);

  const archiveWorld = useMemo(() => {
    if (!selectedNode) return [];
    const urls = ASSETS.ARCHIVE[selectedNode] || [];
    return urls.map((url, i) => ({
      id: `${selectedNode}-${i}`,
      src: url,
      collection: selectedNode,
      title: `${selectedNode} Dossier ${String(i + 1).padStart(3, '0')}`,
      metadata: [
        { label: "ID", val: `ANF-${Math.random().toString(36).substr(2, 4).toUpperCase()}` },
        { label: "ZONE", val: selectedNode },
        { label: "AUTH", val: "INSTITUTIONAL" },
        { label: "IMG_HASH", val: Math.random().toString(16).substr(2, 8).toUpperCase() },
        { label: "STATUS", val: "VERIFIED" },
      ]
    }));
  }, [selectedNode]);

  const content = {
    [Language.EN]: {
      title: "THE VAULT",
      subtitle: "Enter the architectural realms of visual sovereignty.",
      exit: "Return to Void",
      tapHint: "Tap to Audit",
      categories: { 
        POWER: "Power", 
        VOYAGE: "Voyage", 
        ESSENCE: "Essence" 
      }
    },
    [Language.AR]: {
      title: "الخزنة",
      subtitle: "ادخل إلى عوالم السيادة البصرية.",
      exit: "العودة للفراغ",
      tapHint: "اضغط للتدقيق",
      categories: { 
        POWER: "القوة", 
        VOYAGE: "الرحلة", 
        ESSENCE: "الأصالة" 
      }
    }
  };

  const txt = content[language];

  const handleCardClick = (id: string) => {
    setFlippedId(flippedId === id ? null : id);
  };

  return (
    <div className="vault-world-system bg-black h-screen overflow-hidden relative">
      <style>{`
        .vault-world-system {
          perspective: 2000px;
          background: radial-gradient(circle at center, #0a1a2a 0%, #050505 100%);
        }

        /* --- STAGE 1: THE VOID (Floating Nodes) --- */
        .nodes-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3rem;
          padding: 8rem 2rem 5rem;
          width: 100%;
          height: 100%;
          overflow-y: auto;
          scrollbar-width: none;
        }
        .nodes-container::-webkit-scrollbar { display: none; }

        @media (min-width: 1024px) {
          .nodes-container {
            flex-direction: row;
            gap: 8rem;
            padding-top: 0;
            overflow-y: hidden;
          }
        }

        .portal-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          cursor: pointer;
          flex-shrink: 0;
        }

        .node-portal {
          position: relative;
          width: clamp(200px, 60vw, 280px);
          aspect-ratio: 1/1;
          border-radius: 50%;
          transform-style: preserve-3d;
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
          border: 1px solid rgba(183, 121, 92, 0.4);
          box-shadow: 0 0 30px rgba(0,0,0,0.8), inset 0 0 20px rgba(183, 121, 92, 0.1);
          background: #000;
        }

        .portal-wrapper:hover .node-portal {
          transform: scale(1.05) translateZ(20px);
          border-color: #B7795C;
          box-shadow: 0 0 60px rgba(183, 121, 92, 0.3), inset 0 0 40px rgba(183, 121, 92, 0.2);
        }

        .node-portal img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: grayscale(0.6) contrast(1.1);
          transition: transform 1.2s ease, filter 0.8s ease;
        }

        .portal-wrapper:hover img {
          filter: grayscale(0);
          transform: scale(1.15);
        }

        .node-label {
          font-family: 'Public Sans', sans-serif;
          font-size: 11px;
          letter-spacing: 0.6em;
          color: #B7795C;
          text-transform: uppercase;
          opacity: 0.7;
          transition: all 0.5s;
        }

        .portal-wrapper:hover .node-label {
          opacity: 1;
          letter-spacing: 0.8em;
          color: white;
        }

        /* --- STAGE 2: THE IMMERSIVE WORLD (Gallery) --- */
        .immersive-gallery {
          position: fixed;
          inset: 0;
          z-index: 50;
          display: flex;
          background: #050505;
          transform-style: preserve-3d;
          
          /* Mobile: Vertical */
          flex-direction: column;
          align-items: center;
          padding: 8rem 0 6rem; /* Padding bottom for last item visibility */
          overflow-x: hidden;
          overflow-y: scroll; /* Force scroll */
          scroll-snap-type: y mandatory;
          -webkit-overflow-scrolling: touch;
        }
        .immersive-gallery::-webkit-scrollbar { display: none; }

        @media (min-width: 1024px) {
          .immersive-gallery {
            flex-direction: row;
            padding: 0 10vw;
            overflow-x: scroll;
            overflow-y: hidden;
            scroll-snap-type: x mandatory;
            align-items: center;
          }
        }

        /* --- CARD FLIP LOGIC --- */
        .dossier-card {
          width: 85vw;
          height: 60vh;
          margin-bottom: 4rem;
          scroll-snap-align: center;
          position: relative;
          perspective: 1500px; /* Deep perspective for flip */
          flex-shrink: 0;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
        }

        @media (min-width: 1024px) {
          .dossier-card {
            width: auto;
            min-width: 55vw;
            height: 70vh;
            margin-bottom: 0;
            margin-right: 12vw;
          }
        }

        .card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          text-align: center;
          transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
        }

        .dossier-card.flipped .card-inner {
          transform: rotateY(180deg);
        }

        .card-front, .card-back {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          border-radius: 2px;
          overflow: hidden;
          box-shadow: 0 15px 35px rgba(0,0,0,0.5);
        }

        /* Front Face */
        .card-front {
          background-color: #050505;
          transform: rotateY(0deg);
          border: 1px solid rgba(183,121,92,0.15);
        }
        
        .dossier-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: grayscale(0.2) contrast(1.1);
        }

        /* Back Face (Data Terminal) */
        .card-back {
          background-color: #0F1720;
          transform: rotateY(180deg);
          display: flex;
          flex-col: column;
          align-items: center;
          justify-content: center;
          border: 1px solid #B7795C;
          background-image: 
            linear-gradient(rgba(183,121,92,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(183,121,92,0.03) 1px, transparent 1px);
          background-size: 20px 20px;
        }

        /* Scanline Overlay on Back */
        .card-back::after {
          content: " ";
          display: block;
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
          z-index: 2;
          background-size: 100% 2px, 3px 100%;
          pointer-events: none;
        }

        /* Light Sweep Effect (Front only) */
        .card-front::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(110deg, transparent 40%, rgba(183, 121, 92, 0.1) 50%, transparent 60%);
          background-size: 200% 100%;
          background-position: 150% 0;
          transition: background-position 1s;
          pointer-events: none;
        }
        .dossier-card:hover .card-front::after {
           background-position: -150% 0;
        }

        .exit-btn {
          position: fixed;
          top: 6rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 150;
          padding: 0.8rem 1.8rem;
          border: 1px solid rgba(183, 121, 92, 0.5);
          color: #B7795C;
          text-transform: uppercase;
          font-size: 10px;
          letter-spacing: 0.4em;
          background: rgba(0,0,0,0.8);
          backdrop-filter: blur(8px);
          cursor: pointer;
          transition: all 0.3s;
        }
        .exit-btn:hover {
          background: #B7795C;
          color: white;
          border-color: #B7795C;
        }

        .floating-anim {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
      `}</style>

      {/* FIXED UI ELEMENTS */}
      {!selectedNode && (
        <div className="absolute inset-0 flex flex-col items-center justify-start pt-24 md:pt-32 px-12 text-center pointer-events-none z-20">
          <h1 className="font-serif text-5xl md:text-8xl text-white tracking-tighter mb-4 animate-fade-in">{txt.title}</h1>
          <p className="text-copper text-[9px] md:text-[11px] uppercase tracking-[0.6em] opacity-60 animate-fade-in" style={{animationDelay: '0.4s'}}>{txt.subtitle}</p>
        </div>
      )}

      {/* THE VOID: PORTAL NODES */}
      {!selectedNode && (
        <div className="nodes-container">
          {(['POWER', 'VOYAGE', 'ESSENCE'] as Collection[]).map((c, i) => (
            <div 
              key={c}
              className={`portal-wrapper animate-fade-in floating-anim`}
              style={{ 
                animationDelay: `${i * 0.3}s`,
                animationDuration: `${5 + i}s`
              }}
              onClick={() => setSelectedNode(c)}
            >
              <div className="node-portal">
                <img 
                  src={c === 'POWER' ? ASSETS.VAULT.NODE_POWER : c === 'VOYAGE' ? ASSETS.VAULT.NODE_VOYAGE : ASSETS.VAULT.NODE_ESSENCE} 
                  alt={c} 
                  loading="lazy"
                />
              </div>
              <span className={`node-label ${language === Language.AR ? 'font-arabic' : ''}`}>{txt.categories[c]}</span>
            </div>
          ))}
        </div>
      )}

      {/* THE IMMERSIVE WORLD: FLIP CARDS */}
      {selectedNode && (
        <>
          <button className={`exit-btn ${language === Language.AR ? 'font-arabic' : ''}`} onClick={() => setSelectedNode(null)}>
            {txt.exit}
          </button>
          
          <div className="immersive-gallery no-scrollbar">
            {archiveWorld.map((item, idx) => (
              <div 
                key={item.id} 
                className={`dossier-card ${flippedId === item.id ? 'flipped' : ''}`}
                onClick={() => handleCardClick(item.id)}
              >
                <div className="card-inner">
                  
                  {/* FRONT: IMAGE */}
                  <div className="card-front">
                    <img src={item.src} alt={item.title} className="dossier-image" loading="eager" />
                    <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                       <span className="font-serif text-white/40 text-4xl">{String(idx + 1).padStart(2, '0')}</span>
                       <span className="text-[9px] text-copper/60 uppercase tracking-[0.2em] border border-copper/20 px-2 py-1 bg-black/40 backdrop-blur-sm">
                         {txt.tapHint}
                       </span>
                    </div>
                  </div>

                  {/* BACK: DATA TERMINAL */}
                  <div className="card-back">
                    <div className="p-8 w-full h-full flex flex-col justify-center relative z-10">
                       <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-copper opacity-50"></div>
                       <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-copper opacity-50"></div>
                       <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-copper opacity-50"></div>
                       <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-copper opacity-50"></div>

                       <h3 className="text-white font-serif text-xl mb-8 italic">{item.title}</h3>
                       
                       <div className="space-y-4 w-full px-4">
                         {item.metadata.map((meta, i) => (
                           <div key={i} className="flex justify-between border-b border-white/5 pb-2">
                             <span className="text-[10px] text-copper uppercase tracking-widest">{meta.label}</span>
                             <span className="text-[10px] text-white/80 font-mono tracking-widest">{meta.val}</span>
                           </div>
                         ))}
                       </div>

                       <div className="mt-12 text-center">
                         <div className="inline-block border border-copper px-4 py-2 text-copper text-[10px] uppercase tracking-[0.3em]">
                           Classified
                         </div>
                       </div>
                    </div>
                  </div>

                </div>
              </div>
            ))}
            
            {/* Scroll Padding for Mobile */}
            <div className="min-h-[10vh] lg:min-w-[10vw]"></div>
          </div>
        </>
      )}

      {/* NOISE & GRAIN OVERLAY */}
      <div className="fixed inset-0 pointer-events-none z-[200] opacity-[0.04]" style={{ backgroundImage: `url('${ASSETS.VAULT.TEXTURE}')` }}></div>
    </div>
  );
};

export default Vault;