import React from 'react';
import { ShieldAlert, Landmark, Menu, X, Sun, Moon, Eye } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode: boolean;
  setDarkMode: (mode: boolean) => void;
  highContrast: boolean;
  setHighContrast: (contrast: boolean) => void;
  fontSizeClass: 'text-sm' | 'text-base' | 'text-lg';
  setFontSizeClass: (size: 'text-sm' | 'text-base' | 'text-lg') => void;
  emergencyCount: number;
}

export default function Header({
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
  highContrast,
  setHighContrast,
  fontSizeClass,
  setFontSizeClass,
  emergencyCount
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const tabs = [
    { id: 'landing', label: 'Home' },
    { id: 'report', label: 'Report Issue' },
    { id: 'dashboard', label: 'Community Hub' },
    { id: 'admin', label: 'Municipal Center' },
    { id: 'analytics', label: 'AI Analytics' }
  ];

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleHighContrast = () => setHighContrast(!highContrast);

  const cycleFontSize = () => {
    if (fontSizeClass === 'text-sm') setFontSizeClass('text-base');
    else if (fontSizeClass === 'text-base') setFontSizeClass('text-lg');
    else setFontSizeClass('text-sm');
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      highContrast 
        ? 'bg-black border-b-2 border-yellow-400 text-white shadow-none' 
        : darkMode 
          ? 'bg-slate-900/80 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-lg' 
          : 'bg-white/85 backdrop-blur-md border-b border-slate-200/80 text-slate-900 shadow-md'
    }`}>
      {/* Flashing Emergency Header Banner */}
      {emergencyCount > 0 && (
        <div className="bg-gradient-to-r from-rose-700 via-red-600 to-rose-700 text-white text-center py-2 px-4 text-xs font-semibold tracking-wide animate-pulse flex items-center justify-center gap-2">
          <ShieldAlert className="h-4 w-4 animate-bounce" />
          <span>EMERGENCY ALERT: {emergencyCount} severe public safety hazards active. Municipal units are currently dispatched.</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('landing')}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 shrink-0 ${
              highContrast 
                ? 'bg-yellow-400 text-black border-2 border-white' 
                : 'bg-indigo-600 text-white shadow-md hover:scale-105'
            }`}>
              {highContrast ? (
                <Landmark className="h-5 w-5" />
              ) : (
                <div className="w-4 h-4 border-2 border-white rounded-sm"></div>
              )}
            </div>
            <div>
              <h1 className={`font-extrabold tracking-tight text-lg leading-none ${
                highContrast ? 'text-yellow-400' : 'text-white'
              }`}>
                CivicSphere <span className={highContrast ? 'text-yellow-400' : 'text-indigo-400'}>AI</span>
              </h1>
              <span className={`text-[9px] uppercase tracking-wider block font-bold mt-1 ${
                highContrast ? 'text-white' : 'text-slate-500 dark:text-slate-400 font-mono'
              }`}>
                Hyperlocal Civic Engine
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    isActive
                      ? highContrast
                        ? 'bg-yellow-400 text-black font-extrabold border border-white'
                        : darkMode
                          ? 'bg-indigo-600 text-white shadow-lg border border-indigo-500/50 shadow-indigo-600/10'
                          : 'bg-slate-100 text-indigo-600 shadow-sm border border-slate-200/50'
                      : highContrast
                        ? 'hover:bg-slate-900 hover:text-yellow-400'
                        : darkMode
                          ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Accessibility & Utility Tools */}
          <div className="hidden md:flex items-center gap-2">
            {/* Font Size Cycle */}
            <button
              onClick={cycleFontSize}
              id="accessibility-font-toggle"
              title="Change Text Size"
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                highContrast 
                  ? 'border border-yellow-400 text-yellow-400 hover:bg-slate-900' 
                  : darkMode 
                    ? 'hover:bg-slate-800 text-slate-300' 
                    : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              <span className="font-bold text-xs">
                {fontSizeClass === 'text-sm' ? 'A-' : fontSizeClass === 'text-base' ? 'A' : 'A+'}
              </span>
            </button>

            {/* High Contrast Mode */}
            <button
              onClick={toggleHighContrast}
              id="accessibility-contrast-toggle"
              title="Toggle High Contrast"
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                highContrast 
                  ? 'bg-yellow-400 text-black font-extrabold border-2 border-white' 
                  : darkMode 
                    ? 'hover:bg-slate-800 text-yellow-400' 
                    : 'hover:bg-slate-100 text-blue-600'
              }`}
            >
              <Eye className="h-4 w-4" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              id="theme-toggle"
              title="Toggle Theme"
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                highContrast 
                  ? 'border border-yellow-400 text-yellow-400 hover:bg-slate-900' 
                  : darkMode 
                    ? 'hover:bg-slate-800 text-yellow-400' 
                    : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleHighContrast}
              className={`p-1.5 rounded-lg ${highContrast ? 'bg-yellow-400 text-black' : 'text-slate-400'}`}
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              id="mobile-menu-toggle"
              className={`p-2 rounded-xl cursor-pointer ${
                highContrast ? 'border border-yellow-400 text-yellow-400' : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className={`md:hidden px-2 pt-2 pb-4 space-y-1 ${
          highContrast ? 'bg-black border-t-2 border-yellow-400' : darkMode ? 'bg-slate-950' : 'bg-slate-50'
        }`}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left px-4 py-2.5 rounded-xl text-base font-medium transition-all ${
                activeTab === tab.id
                  ? highContrast
                    ? 'bg-yellow-400 text-black font-bold'
                    : 'bg-blue-600 text-white'
                  : highContrast
                    ? 'text-white hover:bg-slate-900'
                    : darkMode
                      ? 'text-slate-300 hover:bg-slate-800'
                      : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <div className="flex items-center justify-around pt-4 border-t border-slate-800">
            <button
              onClick={cycleFontSize}
              className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-semibold"
            >
              Font Size: {fontSizeClass === 'text-sm' ? 'Small' : fontSizeClass === 'text-base' ? 'Medium' : 'Large'}
            </button>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg border border-slate-700"
            >
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
