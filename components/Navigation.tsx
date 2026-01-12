import React, { useState, useEffect } from 'react';
import { Page, Language } from '../types';

interface NavigationProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  language: Language;
  onToggleLanguage: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate, language, onToggleLanguage }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const labels = {
    [Language.EN]: { HOME: 'Home', INST: 'The Institution', SERVICES: 'Services', VAULT: 'The Vault', CONC: 'Concierge' },
    [Language.AR]: { HOME: 'الرئيسية', INST: 'المؤسسة', SERVICES: 'الخدمات', VAULT: 'الخزنة', CONC: 'الكونسيرج' },
  };

  const navLinks = [
    { label: labels[language].HOME, page: Page.HOME },
    { label: labels[language].INST, page: Page.INSTITUTION },
    { label: labels[language].SERVICES, page: Page.SERVICES },
    { label: labels[language].VAULT, page: Page.VAULT },
    { label: labels[language].CONC, page: Page.CONCIERGE },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out px-6 md:px-12 py-6 
        ${scrolled ? 'bg-navy border-b border-copper' : 'bg-transparent'}`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between relative">
        
        {/* Logo / Brand Marker (Visible when scrolled) */}
        <div className={`text-gold-foil font-serif font-bold tracking-widest transition-opacity duration-300 ${scrolled ? 'opacity-100' : 'opacity-0'}`}>
          ANEEF
        </div>

        {/* Desktop Menu - Centered */}
        <div className="hidden md:flex gap-12 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
          {navLinks.map((link) => (
            <button
              key={link.page}
              onClick={() => onNavigate(link.page)}
              className={`text-xs uppercase tracking-[0.2em] font-sans transition-all duration-300
                ${currentPage === link.page ? 'text-white border-b border-copper pb-1' : 'text-white/60 hover:text-copper'}
                ${language === Language.AR ? 'font-arabic text-sm' : ''}
              `}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Language Switcher */}
        <button 
          onClick={onToggleLanguage}
          className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-copper hover:text-white transition-colors border border-copper/30 px-3 py-1 rounded-sm"
        >
          <span className={language === Language.EN ? 'text-white font-bold' : 'opacity-50'}>EN</span>
          <span className="w-[1px] h-3 bg-copper/50"></span>
          <span className={language === Language.AR ? 'text-white font-bold font-arabic' : 'opacity-50 font-arabic'}>عربي</span>
        </button>

        {/* Mobile Menu Icon (Absolute Right on mobile) */}
        <button className="md:hidden text-copper ml-4">
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>
    </nav>
  );
};

export default Navigation;