import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types';

interface ConciergeProps {
  language: Language;
}

const Concierge: React.FC<ConciergeProps> = ({ language }) => {
  const [submitted, setSubmitted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mandate, setMandate] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const mandateOptions = [
    { value: 'audit', label: 'Visual Audit' },
    { value: 'retainer', label: 'Monthly Retainer' },
    { value: 'advisory', label: 'Strategic Advisory' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-navy min-h-screen pt-20 flex flex-col md:flex-row">
      
      {/* Left Column: Info */}
      <div className="w-full md:w-[40%] bg-navy p-12 md:p-24 flex flex-col justify-between border-r border-white/5">
        <div>
          <h1 className="font-serif text-5xl md:text-6xl text-white mb-8 leading-tight">
            Application for <br/><span className="text-copper italic">Visual Audit</span>
          </h1>
          <p className="text-white/80 font-sans text-sm leading-relaxed max-w-sm">
            Membership is by invitation or application only. Please complete the mandate to initiate your dossier review.
          </p>
        </div>

        <div className="mt-16 md:mt-0">
          <div className="mb-8">
            <h4 className="text-copper text-xs uppercase tracking-widest mb-2">Secure Line</h4>
            <p className="text-white font-serif">+971 58 935 3703</p>
          </div>
          <div>
            <h4 className="text-copper text-xs uppercase tracking-widest mb-2">Headquarters</h4>
            <p className="text-white/80 text-sm font-sans">
              EMMAR Square,<br/>
              Dubai Downtown,<br/>
              UAE
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="w-full md:w-[60%] bg-navy-light p-12 md:p-24 flex items-center justify-center relative">
        {!submitted ? (
          <form onSubmit={handleSubmit} className="w-full max-w-md space-y-12">
            
            {/* Input Group */}
            <div className="group">
              <input 
                type="text" 
                placeholder="Full Name" 
                className="w-full bg-transparent border-b border-white/20 py-4 text-white placeholder-white/20 focus:outline-none focus:border-copper transition-colors font-serif text-xl"
                required
              />
            </div>

            <div className="group">
              <input 
                type="email" 
                placeholder="Corporate Email" 
                className="w-full bg-transparent border-b border-white/20 py-4 text-white placeholder-white/20 focus:outline-none focus:border-copper transition-colors font-serif text-xl"
                required
              />
            </div>

            <div className="group">
              <input 
                type="text" 
                placeholder="Company Name" 
                className="w-full bg-transparent border-b border-white/20 py-4 text-white placeholder-white/20 focus:outline-none focus:border-copper transition-colors font-serif text-xl"
              />
            </div>

            <div className="group">
              <input 
                type="text" 
                placeholder="LinkedIn URL" 
                className="w-full bg-transparent border-b border-white/20 py-4 text-white placeholder-white/20 focus:outline-none focus:border-copper transition-colors font-serif text-xl"
              />
            </div>

            {/* Custom Dropdown */}
            <div className="group relative" ref={dropdownRef}>
                <div 
                    className="w-full bg-transparent border-b border-white/20 py-4 text-white/60 cursor-pointer flex justify-between items-center"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                    <span className={mandate ? 'text-white font-serif text-xl' : 'font-serif text-xl'}>
                        {mandate ? mandateOptions.find(o => o.value === mandate)?.label : 'Select Mandate Type'}
                    </span>
                    <span className={`material-symbols-outlined transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`}>keyboard_arrow_down</span>
                </div>
                
                <div className={`absolute top-full left-0 w-full bg-navy border border-copper z-50 transition-all duration-300 origin-top ${dropdownOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'}`}>
                    <ul className="flex flex-col">
                        {mandateOptions.map((opt) => (
                            <li 
                                key={opt.value}
                                className="px-6 py-4 hover:bg-copper/20 text-white font-serif cursor-pointer transition-colors border-b border-white/5 last:border-0"
                                onClick={() => {
                                    setMandate(opt.value);
                                    setDropdownOpen(false);
                                }}
                            >
                                {opt.label}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Luxury Ghost Submit Button (Updated Style) */}
            <button 
              type="submit" 
              className="w-full py-6 border border-copper bg-transparent text-copper hover:bg-copper/20 hover:text-white transition-all duration-500 ease-out uppercase text-xs font-bold tracking-[0.3em] hover:tracking-[0.4em]"
            >
              Submit Mandate
            </button>

          </form>
        ) : (
          <div className="text-center animate-shine">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-2 border-gold-foil mb-8 relative">
              <span className="material-symbols-outlined text-6xl text-gold-foil">verified</span>
              <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-copper"></div>
            </div>
            <h2 className="font-serif text-3xl text-white mb-4">Mandate Received.</h2>
            <p className="text-white/80 font-sans max-w-sm mx-auto leading-relaxed">
              The Directorate will review your profile within 48 hours. Secure communication channels will be established upon approval.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Concierge;