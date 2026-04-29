import React, { useState } from 'react';

const THEMES = [
  { id: 'default', name: 'Vintage Cover', primary: '#FFC7A5', secondary: '#4C5A4E' },
  { id: 'plum-parchment', name: 'Plum and Parchment', primary: '#CAD183', secondary: '#66023C' },
  { id: 'midnight-lamp', name: 'Midnight Lamp', primary: '#003631', secondary: '#FFEDA8' },
  { id: 'chapter-by-the-sea', name: 'Chapter by the Sea', primary: '#FFEBAF', secondary: '#4C9DB0' },
  { id: 'rainy-romance', name: 'Rainy Romance', primary: '#7D99A3', secondary: '#FFCDC1' },
  { id: 'morning-pages', name: 'Morning Pages', primary: '#DEF1E8', secondary: '#EBAE95' },
  { id: 'typewriter-ink', name: 'Typewriter Ink', primary: '#C2D8C4', secondary: '#222222' },
  { id: 'old-library', name: 'Old Library', primary: '#37585B', secondary: '#DDA15E' },
  { id: 'terracotta-tales', name: 'Terracotta Tales', primary: '#E2725B', secondary: '#F7E7CE' },
  { id: 'velvet-bookmark', name: 'Velvet Bookmark', primary: '#CB4154', secondary: '#FAF0E6' },
  { id: 'golden-hour', name: 'Golden Hour', primary: '#FFBF00', secondary: '#EEFAFE' },
  { id: 'olive-grove', name: 'Olive Grove', primary: '#6B8E23', secondary: '#F7E7CE' },
  { id: 'dark-academia', name: 'Dark Academia', primary: '#05472A', secondary: '#ECEAEC' }
];

export default function ThemeModal({ isOpen, onClose, changeTheme }) {
  const [customPrimary, setCustomPrimary] = useState('#FFC7A5');
  const [customSecondary, setCustomSecondary] = useState('#4C5A4E');

  if (!isOpen) return null;

  const applyCustomTheme = () => {
    document.documentElement.style.setProperty('--color-primary', customPrimary);
    document.documentElement.style.setProperty('--color-secondary', customSecondary);
    document.documentElement.style.setProperty('--color-background', '#ffffff');
    onClose();
  };

  const handlePresetSelect = (id) => {
    document.documentElement.style.removeProperty('--color-primary');
    document.documentElement.style.removeProperty('--color-secondary');
    document.documentElement.style.removeProperty('--color-background');
    changeTheme(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      
      <div className="bg-theme-primary text-theme-secondary w-full max-w-3xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] relative">
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 hover:opacity-60 transition-opacity"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <div className="p-8 md:p-10 overflow-y-auto">
          
          <h2 className="text-4xl font-bold italic font-serif mb-8">Customize Your Experience</h2>

          <div className="mb-10">
            <h3 className="text-xl font-serif mb-4">Preset Themes</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handlePresetSelect(t.id)}
                  style={{ backgroundColor: t.primary, color: t.secondary }}
                  className="flex items-center gap-4 p-4 rounded-lg shadow-sm hover:scale-[1.02] transition-transform font-medium"
                >
                  <div 
                    className="w-8 h-8 rounded-full shadow-inner"
                    style={{ backgroundColor: t.secondary }}
                  ></div>
                  <span className="text-lg">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-10 p-6 rounded-lg bg-theme-secondary text-theme-primary">
            <h3 className="text-2xl font-serif mb-6">Custom Theme</h3>
            <div className="flex flex-col sm:flex-row gap-6 items-end">
              <div className="flex-1 w-full">
                <label className="block mb-2 font-medium">Primary Color</label>
                <div className="flex h-12 rounded-md overflow-hidden border border-theme-primary/30">
                  <input 
                    type="color" 
                    value={customPrimary} 
                    onChange={(e) => setCustomPrimary(e.target.value)}
                    className="w-16 h-12 cursor-pointer border-none p-0"
                  />
                  <input 
                    type="text" 
                    value={customPrimary}
                    onChange={(e) => setCustomPrimary(e.target.value)}
                    className="flex-1 px-4 bg-transparent outline-none uppercase"
                  />
                </div>
              </div>
              
              <div className="flex-1 w-full">
                <label className="block mb-2 font-medium">Secondary Color</label>
                <div className="flex h-12 rounded-md overflow-hidden border border-theme-primary/30">
                  <input 
                    type="color" 
                    value={customSecondary} 
                    onChange={(e) => setCustomSecondary(e.target.value)}
                    className="w-16 h-12 cursor-pointer border-none p-0"
                  />
                  <input 
                    type="text" 
                    value={customSecondary}
                    onChange={(e) => setCustomSecondary(e.target.value)}
                    className="flex-1 px-4 bg-transparent outline-none uppercase"
                  />
                </div>
              </div>

              <button 
                onClick={applyCustomTheme}
                className="h-12 px-8 rounded-md bg-theme-primary text-theme-secondary font-bold hover:opacity-90 transition-opacity"
              >
                Apply
              </button>
            </div>
          </div>

          <div>
             <h3 className="text-2xl font-serif mb-4">Account Icon</h3>
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {['Cat', 'Frog', 'Dog', 'Duck'].map((animal) => (
                  <button key={animal} className="flex flex-col items-center justify-center gap-2 p-6 rounded-lg bg-theme-secondary text-theme-primary hover:opacity-80 transition-opacity">
                    <div className="w-12 h-12 border-2 border-theme-primary rounded-full flex items-center justify-center">
                       <span className="text-xs">{animal}</span>
                    </div>
                    <span>{animal}</span>
                  </button>
                ))}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}