import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useGesture } from '@use-gesture/react';
import { ASSETS } from '../constants';
import { Language } from '../types';

interface VaultProps {
  language: Language;
}

type Collection = 'POWER' | 'VOYAGE' | 'ESSENCE';

const DEFAULTS = {
  maxVerticalRotationDeg: 10,
  dragSensitivity: 15,
  enlargeTransitionMs: 500,
  segments: 35
};

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
const normalizeAngle = (d: number) => ((d % 360) + 360) % 360;
const wrapAngleSigned = (deg: number) => {
  const a = (((deg + 180) % 360) + 360) % 360;
  return a - 180;
};
const getDataNumber = (el: HTMLElement, name: string, fallback: number) => {
  const attr = el.dataset[name] ?? el.getAttribute(`data-${name}`);
  const n = attr == null ? NaN : parseFloat(attr);
  return Number.isFinite(n) ? n : fallback;
};

function buildItems(pool: string[], seg: number) {
  const xCols = Array.from({ length: seg }, (_, i) => -37 + i * 2);
  const evenYs = [-4, -2, 0, 2, 4];
  const oddYs = [-3, -1, 1, 3, 5];

  const coords = xCols.flatMap((x, c) => {
    const ys = c % 2 === 0 ? evenYs : oddYs;
    return ys.map(y => ({ x, y, sizeX: 2.2, sizeY: 2.8 })); 
  });

  const totalSlots = coords.length;
  const usedImages = Array.from({ length: totalSlots }, (_, i) => pool[i % pool.length]);

  return coords.map((c, i) => ({
    ...c,
    src: usedImages[i],
    alt: `Archive Item ${i + 1}`
  }));
}

function computeItemBaseRotation(offsetX: number, offsetY: number, sizeX: number, sizeY: number, segments: number) {
  const unit = 360 / segments / 2;
  const rotateY = unit * (offsetX + (sizeX - 1) / 2);
  const rotateX = unit * (offsetY - (sizeY - 1) / 2);
  return { rotateX, rotateY };
}

const Vault: React.FC<VaultProps> = ({ language }) => {
  const [activeCollection, setActiveCollection] = useState<Collection>('VOYAGE');
  
  const rootRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const sphereRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const focusedElRef = useRef<HTMLElement | null>(null);
  const originalTilePositionRef = useRef<{left: number, top: number, width: number, height: number} | null>(null);

  const rotationRef = useRef({ x: 0, y: 0 });
  const startRotRef = useRef({ x: 0, y: 0 });
  const startPosRef = useRef<{x: number, y: number} | null>(null);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const inertiaRAF = useRef<number | null>(null);
  const openingRef = useRef(false);
  const openStartedAtRef = useRef(0);
  const lastDragEndAt = useRef(0);
  const lockedRadiusRef = useRef<number | null>(null);

  const imagesPool = useMemo(() => ASSETS.ARCHIVE[activeCollection] || [], [activeCollection]);
  const items = useMemo(() => buildItems(imagesPool, DEFAULTS.segments), [imagesPool]);

  const applyTransform = (xDeg: number, yDeg: number) => {
    const el = sphereRef.current;
    if (el) {
      el.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${xDeg}deg) rotateY(${yDeg}deg)`;
    }
  };

  const stopInertia = useCallback(() => {
    if (inertiaRAF.current) {
      cancelAnimationFrame(inertiaRAF.current);
      inertiaRAF.current = null;
    }
  }, []);

  const startInertia = useCallback((vx: number, vy: number) => {
    const MAX_V = 1.4;
    let vX = clamp(vx, -MAX_V, MAX_V) * 80;
    let vY = clamp(vy, -MAX_V, MAX_V) * 80;
    let frames = 0;
    const frictionMul = 0.95;
    const stopThreshold = 0.01;
    const maxFrames = 300;
    
    const step = () => {
      vX *= frictionMul;
      vY *= frictionMul;
      if (Math.abs(vX) < stopThreshold && Math.abs(vY) < stopThreshold) {
        inertiaRAF.current = null;
        return;
      }
      if (++frames > maxFrames) {
        inertiaRAF.current = null;
        return;
      }
      const nextX = clamp(rotationRef.current.x - vY / 200, -DEFAULTS.maxVerticalRotationDeg, DEFAULTS.maxVerticalRotationDeg);
      const nextY = wrapAngleSigned(rotationRef.current.y + vX / 200);
      rotationRef.current = { x: nextX, y: nextY };
      applyTransform(nextX, nextY);
      inertiaRAF.current = requestAnimationFrame(step);
    };
    stopInertia();
    inertiaRAF.current = requestAnimationFrame(step);
  }, [stopInertia]);

  useGesture(
    {
      onDragStart: ({ event }) => {
        if (focusedElRef.current) return;
        stopInertia();
        const evt = event as PointerEvent;
        draggingRef.current = true;
        movedRef.current = false;
        startRotRef.current = { ...rotationRef.current };
        startPosRef.current = { x: evt.clientX, y: evt.clientY };
      },
      onDrag: ({ event, last, velocity = [0, 0], direction = [0, 0] }) => {
        if (focusedElRef.current || !draggingRef.current || !startPosRef.current) return;
        const evt = event as PointerEvent;
        const dxTotal = evt.clientX - startPosRef.current.x;
        const dyTotal = evt.clientY - startPosRef.current.y;
        if (!movedRef.current) {
          const dist2 = dxTotal * dxTotal + dyTotal * dyTotal;
          if (dist2 > 16) movedRef.current = true;
        }
        const nextX = clamp(startRotRef.current.x - dyTotal / DEFAULTS.dragSensitivity, -DEFAULTS.maxVerticalRotationDeg, DEFAULTS.maxVerticalRotationDeg);
        const nextY = wrapAngleSigned(startRotRef.current.y + dxTotal / DEFAULTS.dragSensitivity);
        if (rotationRef.current.x !== nextX || rotationRef.current.y !== nextY) {
          rotationRef.current = { x: nextX, y: nextY };
          applyTransform(nextX, nextY);
        }
        if (last) {
          draggingRef.current = false;
          let [vMagX, vMagY] = velocity;
          const [dirX, dirY] = direction;
          let vx = vMagX * dirX;
          let vy = vMagY * dirY;
          if (Math.abs(vx) > 0.005 || Math.abs(vy) > 0.005) startInertia(vx, vy);
          if (movedRef.current) lastDragEndAt.current = performance.now();
          movedRef.current = false;
        }
      }
    },
    { target: mainRef, eventOptions: { passive: true } }
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ro = new ResizeObserver(entries => {
      const cr = entries[0].contentRect;
      const w = Math.max(1, cr.width), h = Math.max(1, cr.height);
      const basis = Math.min(w, h);
      let radius = basis * 1.2;
      radius = clamp(radius, 600, 3000);
      lockedRadiusRef.current = Math.round(radius);

      root.style.setProperty('--radius', `${lockedRadiusRef.current}px`);
      applyTransform(rotationRef.current.x, rotationRef.current.y);
    });
    ro.observe(root);
    return () => ro.disconnect();
  }, []);

  const openItemFromElement = useCallback((el: HTMLElement) => {
    if (openingRef.current) return;
    openingRef.current = true;
    openStartedAtRef.current = performance.now();
    const parent = el.parentElement!;
    focusedElRef.current = el;
    el.setAttribute('data-focused', 'true');
    const offsetX = getDataNumber(parent, 'offsetX', 0);
    const offsetY = getDataNumber(parent, 'offsetY', 0);
    const sizeX = getDataNumber(parent, 'sizeX', 2);
    const sizeY = getDataNumber(parent, 'sizeY', 2);
    const parentRot = computeItemBaseRotation(offsetX, offsetY, sizeX, sizeY, DEFAULTS.segments);
    const parentY = normalizeAngle(parentRot.rotateY);
    const globalY = normalizeAngle(rotationRef.current.y);
    let rotY = -(parentY + globalY) % 360;
    if (rotY < -180) rotY += 360;
    const rotX = -parentRot.rotateX - rotationRef.current.x;
    parent.style.setProperty('--rot-y-delta', `${rotY}deg`);
    parent.style.setProperty('--rot-x-delta', `${rotX}deg`);
    
    const refDiv = document.createElement('div');
    refDiv.className = 'item__image item__image--reference';
    refDiv.style.opacity = '0';
    refDiv.style.transform = `rotateX(${-parentRot.rotateX}deg) rotateY(${-parentRot.rotateY}deg)`;
    parent.appendChild(refDiv);
    void refDiv.offsetHeight;

    const tileR = refDiv.getBoundingClientRect();
    const mainR = mainRef.current?.getBoundingClientRect();
    const frameR = frameRef.current?.getBoundingClientRect();

    if (!mainR || !frameR || tileR.width <= 0 || tileR.height <= 0) {
      openingRef.current = false;
      focusedElRef.current = null;
      parent.removeChild(refDiv);
      return;
    }

    originalTilePositionRef.current = { left: tileR.left, top: tileR.top, width: tileR.width, height: tileR.height };
    el.style.visibility = 'hidden';
    const overlay = document.createElement('div');
    overlay.className = 'enlarge';
    overlay.style.cssText = `position:absolute;left:${frameR.left - mainR.left}px;top:${frameR.top - mainR.top}px;width:${frameR.width}px;height:${frameR.height}px;opacity:0;z-index:1000;will-change:transform,opacity;transform-origin:top left;transition:transform ${DEFAULTS.enlargeTransitionMs}ms cubic-bezier(0.16, 1, 0.3, 1), opacity ${DEFAULTS.enlargeTransitionMs}ms ease;`;
    
    const rawSrc = parent.dataset.src || el.querySelector('img')?.src || '';
    const img = document.createElement('img');
    img.src = rawSrc;
    overlay.appendChild(img);
    viewerRef.current!.appendChild(overlay);

    const tx0 = tileR.left - frameR.left;
    const ty0 = tileR.top - frameR.top;
    const sx0 = tileR.width / frameR.width;
    const sy0 = tileR.height / frameR.height;
    overlay.style.transform = `translate(${tx0}px, ${ty0}px) scale(${sx0}, ${sy0})`;

    setTimeout(() => {
      overlay.style.opacity = '1';
      overlay.style.transform = 'translate(0px, 0px) scale(1, 1)';
      rootRef.current?.setAttribute('data-enlarging', 'true');
    }, 16);
  }, []);

  const closeZoom = useCallback(() => {
    if (performance.now() - openStartedAtRef.current < 250) return;
    const el = focusedElRef.current;
    if (!el) return;
    const parent = el.parentElement!;
    const overlay = viewerRef.current?.querySelector('.enlarge') as HTMLElement;
    if (!overlay) return;
    const refDiv = parent.querySelector('.item__image--reference');
    const originalPos = originalTilePositionRef.current;
    if (!originalPos) {
      overlay.remove();
      if (refDiv) refDiv.remove();
      el.style.visibility = '';
      focusedElRef.current = null;
      rootRef.current?.removeAttribute('data-enlarging');
      openingRef.current = false;
      return;
    }

    const frameR = frameRef.current!.getBoundingClientRect();
    const tx0 = originalPos.left - frameR.left;
    const ty0 = originalPos.top - frameR.top;
    const sx0 = originalPos.width / frameR.width;
    const sy0 = originalPos.height / frameR.height;

    overlay.style.transform = `translate(${tx0}px, ${ty0}px) scale(${sx0}, ${sy0})`;
    overlay.style.opacity = '0';

    setTimeout(() => {
      overlay.remove();
      if (refDiv) refDiv.remove();
      parent.style.setProperty('--rot-y-delta', '0deg');
      parent.style.setProperty('--rot-x-delta', '0deg');
      el.style.visibility = '';
      focusedElRef.current = null;
      rootRef.current?.removeAttribute('data-enlarging');
      openingRef.current = false;
    }, DEFAULTS.enlargeTransitionMs);
  }, []);

  const content = {
    [Language.EN]: {
      title: "THE ARCHIVE",
      description: "Exclusive commissions and visual experiments in sovereignty.",
      categories: { 
        POWER: { label: "POWER", desc: "Structural Authority & Presence" },
        VOYAGE: { label: "VOYAGE", desc: "Cinematic Transit & Flow" },
        ESSENCE: { label: "ESSENCE", desc: "Untouched Originality" }
      },
      scrollHint: "Traverse the Institutional Archive",
      close: "Close Inspection"
    },
    [Language.AR]: {
      title: "الأرشيف",
      description: "تكليفات حصرية وتجارب بصرية في السيادة.",
      categories: { 
        POWER: { label: "الهيبة", desc: "سلطة الهيكل والحضور" },
        VOYAGE: { label: "الرحلة", desc: "التدفق البصري السينمائي" },
        ESSENCE: { label: "الأصالة", desc: "العراقة التي لا تُمَس" }
      },
      scrollHint: "تصفح أرشيف المؤسسة",
      close: "إغلاق المعاينة"
    }
  };

  const txt = content[language];

  return (
    <div 
      ref={rootRef}
      className="vault-dome-root"
      style={{
        '--segments-x': DEFAULTS.segments,
        '--segments-y': DEFAULTS.segments,
      } as React.CSSProperties}
    >
      <style>{`
        .vault-dome-root {
          position: relative;
          width: 100%;
          height: 100vh;
          background: #050505;
          overflow: hidden;
          --radius: 1000px;
          --overlay-blur-color: #050505;
          animation: --engine-rotate 1s linear;
          animation-timeline: scroll(nearest block);
        }

        @keyframes --engine-rotate {
          to { --rotate: 1; }
        }
        
        main.sphere-main {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          touch-action: none;
        }
        
        .stage {
          width: 100%;
          height: 100%;
          display: grid;
          place-items: center;
          perspective: calc(var(--radius) * 2.5);
          perspective-origin: 50% 50%;
        }
        
        .sphere {
          transform-style: preserve-3d;
          transform: translateZ(calc(var(--radius) * -1));
          will-change: transform;
        }
        
        .item {
          --circ: calc(var(--radius) * 3.14159);
          --item-width: calc(var(--circ) / var(--segments-x));
          --item-height: calc(var(--circ) / var(--segments-y));
          width: calc(var(--item-width) * var(--item-size-x));
          height: calc(var(--item-height) * var(--item-size-y));
          position: absolute;
          inset: -999px;
          margin: auto;
          transform-origin: 50% 50%;
          transform-style: preserve-3d;
          backface-visibility: hidden;
          transform: 
            rotateY(calc((360deg / var(--segments-x)) / 2 * (var(--offset-x) + ((var(--item-size-x) - 1) / 2)) + var(--rot-y-delta, 0deg)))
            rotateX(calc((360deg / var(--segments-y)) / 2 * (var(--offset-y) - ((var(--item-size-y) - 1) / 2)) + var(--rot-x-delta, 0deg)))
            translateZ(var(--radius));
          transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .item__image {
          position: absolute;
          inset: 8px;
          border-radius: 4px;
          background: #111;
          overflow: hidden;
          cursor: zoom-in;
          border: 1px solid rgba(183,121,92,0.1);
          transition: border-color 0.4s ease, box-shadow 0.4s ease;
        }
        
        .item__image:hover {
          border-color: #B7795C;
          box-shadow: 0 0 20px rgba(183,121,92,0.2);
        }
        
        .item__image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: grayscale(0.8);
          transition: filter 0.6s ease, transform 1s ease;
        }
        
        .item__image:hover img {
          filter: grayscale(0);
          transform: scale(1.05);
        }
        
        .sphere-overlay {
          position: absolute;
          inset: 0;
          z-index: 5;
          pointer-events: none;
          background-image: radial-gradient(rgba(0,0,0,0) 40%, #050505 100%);
        }
        
        .viewer {
          position: fixed;
          inset: 0;
          z-index: 100;
          pointer-events: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .viewer .scrim {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.9);
          opacity: 0;
          transition: opacity 0.6s ease;
          pointer-events: none;
          backdrop-filter: blur(10px);
        }
        
        .vault-dome-root[data-enlarging='true'] .viewer .scrim {
          opacity: 1;
          pointer-events: all;
        }
        
        .viewer .frame {
          width: 80vw;
          height: 80vh;
          max-width: 1200px;
          pointer-events: none;
        }
        
        .viewer .enlarge {
          border: 1px solid rgba(183,121,92,0.3);
          box-shadow: 0 30px 60px rgba(0,0,0,0.8);
          border-radius: 4px;
          overflow: hidden;
        }
        
        .viewer .enlarge img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .ui-fixed-layer {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 50;
          padding: clamp(2rem, 5vw, 8rem) clamp(1.5rem, 5vw, 4rem);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: opacity 0.5s ease;
        }

        .vault-dome-root[data-enlarging='true'] .ui-fixed-layer {
          opacity: 0;
        }

        .vault-sidebar {
          position: absolute;
          top: clamp(6rem, 15vh, 8rem);
          right: clamp(1.5rem, 5vw, 4rem);
          display: flex;
          flex-direction: column;
          gap: clamp(1.5rem, 4vh, 2.5rem);
          pointer-events: auto;
          align-items: flex-end;
        }

        .cat-item-container {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          position: relative;
        }

        .cat-btn {
          font-size: clamp(9px, 1.5vw, 11px);
          text-transform: uppercase;
          letter-spacing: 0.5em;
          text-align: right;
          color: rgba(255,255,255,0.15);
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          border-right: 2px solid transparent;
          padding-right: clamp(1rem, 3vw, 2rem);
          white-space: nowrap;
          cursor: pointer;
        }

        .cat-btn.active {
          color: white;
          border-right-color: #B7795C;
          transform: translateX(-12px);
          opacity: 1;
        }

        .cat-btn.active::before {
          content: "";
          position: absolute;
          right: 0;
          top: 50%;
          width: 30px;
          height: 1px;
          background: #B7795C;
          transform: scaleX(0);
          transform-origin: right;
          animation: bar-grow 0.6s forwards 0.2s;
        }

        @keyframes bar-grow {
          to { transform: scaleX(1); }
        }

        .cat-desc {
          font-size: 8px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #B7795C;
          opacity: 0;
          transform: translateX(10px);
          transition: all 0.4s ease;
          pointer-events: none;
          margin-top: 4px;
          margin-right: clamp(1rem, 3vw, 2rem);
        }

        .cat-item-container:hover .cat-desc {
          opacity: 0.6;
          transform: translateX(0);
        }
        
        .cat-btn:hover:not(.active) {
          color: rgba(255,255,255,0.7);
          transform: translateX(-6px);
        }

        .scroll-indicator {
          position: absolute;
          bottom: clamp(2rem, 8vh, 4rem);
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          opacity: 0.5;
        }

        .scroll-line-container {
          width: 2px;
          height: 60px;
          background: rgba(255,255,255,0.05);
          position: relative;
          overflow: hidden;
        }

        .scroll-line-active {
          position: absolute;
          top: -100%;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to bottom, transparent, #B7795C, transparent);
          animation: fluid-scroll-line 2.5s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }

        /* NEW: Scroll Progress Gauge */
        .vault-progress-track {
          position: fixed;
          left: 1.5rem;
          top: 50%;
          transform: translateY(-50%);
          width: 1px;
          height: 30vh;
          background: rgba(255,255,255,0.05);
          z-index: 60;
        }

        .vault-progress-fill {
          width: 100%;
          height: 100%;
          background: #B7795C;
          transform-origin: top;
          transform: scaleY(calc(var(--rotate, 0)));
          box-shadow: 0 0 10px rgba(183,121,92,0.5);
          transition: transform 0.1s linear;
        }

        @keyframes fluid-scroll-line {
          0% { top: -100%; }
          60% { top: 100%; }
          100% { top: 100%; }
        }

        @media (max-width: 768px) {
          .vault-sidebar {
            bottom: 11rem;
            top: auto;
            right: 50%;
            transform: translateX(50%);
            flex-direction: row;
            width: 100%;
            justify-content: center;
            gap: 1.5rem;
          }
          .cat-item-container {
            align-items: center;
          }
          .cat-btn {
            border-right: none;
            border-bottom: 2px solid transparent;
            padding-right: 0;
            padding-bottom: 0.5rem;
            text-align: center;
          }
          .cat-btn.active {
             border-bottom-color: #B7795C;
             transform: translateY(-6px);
             padding-right: 0;
          }
          .cat-btn.active::before {
            display: none;
          }
          .cat-desc {
            display: none;
          }
          .vault-progress-track {
             left: auto;
             right: 1.5rem;
             height: 20vh;
          }
        }
      `}</style>

      {/* Persistent Vertical Progress Gauge */}
      <div className="vault-progress-track">
        <div className="vault-progress-fill"></div>
      </div>

      <main ref={mainRef as any} className="sphere-main">
        <div className="stage">
          <div ref={sphereRef} className="sphere">
            {items.map((it, i) => (
              <div
                key={`${activeCollection}-${it.x},${it.y},${i}`}
                className="item"
                data-src={it.src}
                data-offset-x={it.x}
                data-offset-y={it.y}
                data-size-x={it.sizeX}
                data-size-y={it.sizeY}
                style={{
                  '--offset-x': it.x,
                  '--offset-y': it.y,
                  '--item-size-x': it.sizeX,
                  '--item-size-y': it.sizeY,
                } as React.CSSProperties}
              >
                <div
                  className="item__image"
                  onClick={(e) => openItemFromElement(e.currentTarget as HTMLElement)}
                >
                  <img src={it.src} draggable={false} alt={it.alt} loading="lazy" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sphere-overlay" />

        <div className="viewer" ref={viewerRef}>
          <div ref={scrimRef} className="scrim" onClick={closeZoom} />
          <div ref={frameRef} className="frame" />
        </div>
      </main>

      <div className="ui-fixed-layer">
        <div className="vault-intro max-w-2xl">
          <h1 className="font-serif text-6xl md:text-9xl text-white tracking-tighter mb-4">{txt.title}</h1>
          <p className="font-sans text-copper text-[9px] md:text-[11px] uppercase tracking-[0.6em] opacity-60">
            {txt.description}
          </p>
        </div>

        <nav className="vault-sidebar">
          {(['POWER', 'VOYAGE', 'ESSENCE'] as Collection[]).map((c) => (
            <div key={c} className="cat-item-container">
              <button
                onClick={() => setActiveCollection(c)}
                className={`cat-btn ${activeCollection === c ? 'active' : ''} ${language === Language.AR ? 'font-arabic' : 'font-sans'}`}
              >
                {txt.categories[c].label}
              </button>
              <span className={`cat-desc ${language === Language.AR ? 'font-arabic' : 'font-sans'}`}>
                {txt.categories[c].desc}
              </span>
            </div>
          ))}
        </nav>

        <div className="scroll-indicator">
          <div className="scroll-line-container">
            <div className="scroll-line-active"></div>
          </div>
          <span className="text-[7px] md:text-[9px] uppercase tracking-[0.5em] text-white/80">
            {txt.scrollHint}
          </span>
        </div>
      </div>
      
      {/* Film Grain Texture */}
      <div className="fixed inset-0 pointer-events-none z-[200] opacity-[0.03]" style={{ backgroundImage: `url('${ASSETS.VAULT.TEXTURE}')` }}></div>
    </div>
  );
};

export default Vault;