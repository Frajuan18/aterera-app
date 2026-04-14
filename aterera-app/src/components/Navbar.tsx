import React from 'react';
import { ChevronDown, StickyNote } from "lucide-react"; // Using StickyNote for a note app vibe

export const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-8 left-0 right-0 flex justify-center px-4 z-50">
      <div className="flex items-center justify-between w-full max-w-5xl h-[64px] px-6 rounded-[20px] border border-white/[0.06] bg-[#0A0A0A]/80 backdrop-blur-xl shadow-2xl">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-b from-[#2A2A2A] to-[#0A0A0A] border border-white/10 shadow-lg">
            <StickyNote className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-semibold text-[18px] tracking-tight font-['Poppins']">Aterera</span>
        </div>
        
        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <button className="flex items-center gap-1.5 text-[14px] font-medium text-[#A1A1A1] hover:text-white transition-all font-['Poppins']">
            Features <ChevronDown className="w-3.5 h-3.5 opacity-50" />
          </button>
          <button className="flex items-center gap-1.5 text-[14px] font-medium text-[#A1A1A1] hover:text-white transition-all font-['Poppins']">
            Templates <ChevronDown className="w-3.5 h-3.5 opacity-50" />
          </button>
          <a href="#" className="text-[14px] font-medium text-[#A1A1A1] hover:text-white transition-all font-['Poppins']">Desktop App</a>
          <a href="#" className="text-[14px] font-medium text-[#A1A1A1] hover:text-white transition-all font-['Poppins']">Pricing</a>
        </div>

        {/* CTA Section */}
        <div className="flex items-center gap-6">
          <button className="text-[14px] font-medium text-[#A1A1A1] hover:text-white transition-all font-['Poppins']">Login</button>
          <button className="relative group active:scale-95 transition-transform font-['Poppins']">
            <div className="absolute -inset-[1px] bg-gradient-to-b from-white/40 to-transparent rounded-[10px]" />
            <div className="relative px-5 py-1.5 rounded-[9px] bg-gradient-to-b from-white via-[#F2F2F2] to-[#D4D4D4] text-black text-[13px] font-bold tracking-tight shadow-xl">
              Join Waitlist
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
};