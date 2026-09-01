import React, { useState } from 'react'
import { Sparkles, Shield, UtensilsCrossed, Menu, X, ChevronRight } from 'lucide-react'

export default function Navbar({ currentView, onNavigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const scrollToSection = (id) => {
    setMobileMenuOpen(false)
    if (currentView !== 'student') {
      onNavigate('student')
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 50)
    } else {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleSwitchView = (view) => {
    setMobileMenuOpen(false)
    onNavigate(view)
  }

  return (
    <header className="w-full bg-[#F7F5EE]/95 backdrop-blur-md sticky top-0 z-50 border-b border-[#E8E4DA]/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => handleSwitchView('student')}
          className="flex items-center space-x-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#E8EFEA] border border-[#D1E0D7] flex items-center justify-center text-xl shadow-xs group-hover:scale-105 transition-transform">
            🥗
          </div>
          <div>
            <span className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-[#1C1F1B] group-hover:text-[#2D5A43] transition-colors">
              Smart Canteen
            </span>
          </div>
          {currentView === 'admin' && (
            <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider bg-[#1C1F1B] text-amber-300 px-2.5 py-0.5 rounded-full">
              Staff Admin
            </span>
          )}
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-[15px] font-medium text-[#5F655E]">
          {currentView === 'student' ? (
            <>
              <button
                onClick={() => scrollToSection('menu-browse')}
                className="hover:text-[#1C1F1B] transition-colors cursor-pointer"
              >
                Menu
              </button>
              <button
                onClick={() => scrollToSection('menu-browse')}
                className="hover:text-[#1C1F1B] transition-colors cursor-pointer"
              >
                What should I eat?
              </button>
              <button
                onClick={() => scrollToSection('top-picks')}
                className="hover:text-[#1C1F1B] transition-colors cursor-pointer"
              >
                How it ranks
              </button>
            </>
          ) : (
            <button
              onClick={() => handleSwitchView('student')}
              className="hover:text-[#1C1F1B] transition-colors cursor-pointer flex items-center space-x-1.5"
            >
              <UtensilsCrossed className="w-4 h-4 text-[#2D5A43]" />
              <span>Student Live Menu</span>
            </button>
          )}
        </nav>

        {/* Desktop Actions & Admin Switch */}
        <div className="hidden md:flex items-center space-x-3">
          {/* Admin Switch Link */}
          <button
            onClick={() => handleSwitchView(currentView === 'admin' ? 'student' : 'admin')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition cursor-pointer ${
              currentView === 'admin'
                ? 'bg-[#1C1F1B] text-amber-300 shadow-sm'
                : 'bg-white border border-[#DCD6CA] text-[#555C54] hover:text-[#1C1F1B] hover:bg-[#F2EFE9]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{currentView === 'admin' ? 'Staff Portal (Active)' : 'Staff Admin'}</span>
          </button>

          {currentView === 'student' ? (
            <button
              onClick={() => scrollToSection('menu-browse')}
              className="inline-flex items-center space-x-2 bg-[#2D5A43] hover:bg-[#234735] active:scale-[0.98] text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all shadow-sm cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Get a pick</span>
            </button>
          ) : (
            <button
              onClick={() => handleSwitchView('student')}
              className="inline-flex items-center space-x-2 bg-white border border-[#DCD6CA] hover:bg-[#F2EFE9] text-[#1C1F1B] px-5 py-2.5 rounded-full text-sm font-medium transition-all shadow-sm cursor-pointer"
            >
              <UtensilsCrossed className="w-4 h-4 text-[#7A8078]" />
              <span>Exit Admin</span>
            </button>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center space-x-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-2xl bg-white border border-[#E0DBD0] text-[#1C1F1B] hover:bg-[#F2EFE9] transition"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAF8F5] border-b border-[#E8E4DA] px-4 py-6 space-y-4 animate-slideUp">
          <div className="space-y-1">
            {currentView === 'student' ? (
              <>
                <button
                  onClick={() => scrollToSection('menu-browse')}
                  className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-white text-sm font-medium text-[#1C1F1B] transition flex items-center justify-between"
                >
                  <span>Browse Menu</span>
                  <ChevronRight className="w-4 h-4 text-[#8C928B]" />
                </button>
                <button
                  onClick={() => scrollToSection('menu-browse')}
                  className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-white text-sm font-medium text-[#1C1F1B] transition flex items-center justify-between"
                >
                  <span>What should I eat?</span>
                  <ChevronRight className="w-4 h-4 text-[#8C928B]" />
                </button>
                <button
                  onClick={() => scrollToSection('top-picks')}
                  className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-white text-sm font-medium text-[#1C1F1B] transition flex items-center justify-between"
                >
                  <span>Top AI Picks</span>
                  <ChevronRight className="w-4 h-4 text-[#8C928B]" />
                </button>
              </>
            ) : (
              <button
                onClick={() => handleSwitchView('student')}
                className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-white text-sm font-medium text-[#1C1F1B] transition flex items-center justify-between"
              >
                <span>Switch to Student Menu</span>
                <ChevronRight className="w-4 h-4 text-[#8C928B]" />
              </button>
            )}
          </div>

          <div className="pt-3 border-t border-[#EAE6DD] flex flex-col gap-2">
            <button
              onClick={() => handleSwitchView(currentView === 'admin' ? 'student' : 'admin')}
              className="w-full py-2.5 px-4 rounded-xl border border-[#DCD6CA] bg-white text-xs font-semibold text-[#1C1F1B] flex items-center justify-center space-x-2"
            >
              <Shield className="w-4 h-4 text-[#2D5A43]" />
              <span>{currentView === 'admin' ? 'Switch to Student View' : 'Staff Admin Login'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
