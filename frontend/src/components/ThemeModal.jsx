import React, { useState } from 'react';

import catIcon from '../assets/user_icon_cat.png';
import frogIcon from '../assets/user_icon_frog.png';
import dogIcon from '../assets/user_icon_dog.png';
import duckIcon from '../assets/user_icon_duck.png';

const THEMES = [
  { id: 'default', name: 'Слива та пергамент', primary: '#CAD183', secondary: '#66023C' },
  { id: 'vintage-cover', name: 'Вінтажна обкладинка', primary: '#FFC7A5', secondary: '#4C5A4E' },
  { id: 'peach-garden', name: 'Персиковий сад', primary: '#f8eec2', secondary: '#d8918f' },
  { id: 'chapter-by-the-sea', name: 'Розділ біля моря', primary: '#FFEBAF', secondary: '#4C9DB0' },
  { id: 'rainy-romance', name: 'Дощова романтика', primary: '#7D99A3', secondary: '#FFCDC1' },
  { id: 'morning-pages', name: 'Ранкові сторінки', primary: '#DEF1E8', secondary: '#EBAE95' },
  { id: 'typewriter-ink', name: 'Чорнило машинки', primary: '#C2D8C4', secondary: '#222222' },
  { id: 'pink-skies', name: 'Рожеве небо', primary: '#f2aebc', secondary: '#3d5d91' },
  { id: 'fey-garden', name: 'Сад фей', primary: '#f8cac4', secondary: '#447a5f' },
  { id: 'wisteria-breeze', name: 'Бриз вістерії', primary: '#283f76', secondary: '#2c9fc7' },
  { id: 'lavander-bloom', name: 'Цвіт лаванди', primary: '#2c0415', secondary: '#b175a5' },
  { id: 'olive-grove', name: 'Оливковий гай', primary: '#6B8E23', secondary: '#FFCDC1' },
  { id: 'dark-academia', name: 'Темна академія', primary: '#05472A', secondary: '#ECEAEC' }
];

const ICONS = [
  { id: 'cat', label: 'Кіт', src: catIcon },
  { id: 'frog', label: 'Жаба', src: frogIcon },
  { id: 'dog', label: 'Пес', src: dogIcon },
  { id: 'duck', label: 'Качка', src: duckIcon },
];

export default function ThemeModal({ isOpen, onClose, changeTheme }) {
  const [customPrimary, setCustomPrimary] = useState(() => localStorage.getItem('customPrimary') || '#FFC7A5');
  const [customSecondary, setCustomSecondary] = useState(() => localStorage.getItem('customSecondary') || '#4C5A4E');
  const [activeIcon, setActiveIcon] = useState(() => localStorage.getItem('accountIcon') || 'cat');

  if (!isOpen) return null;

  const applyCustomTheme = () => {
    localStorage.setItem('theme', 'custom');
    localStorage.setItem('customPrimary', customPrimary);
    localStorage.setItem('customSecondary', customSecondary);

    document.documentElement.style.setProperty('--color-primary', customPrimary);
    document.documentElement.style.setProperty('--color-secondary', customSecondary);
    
    if (changeTheme) changeTheme('custom');
    alert("Тему збережено!");
  };

  const handlePresetSelect = (themeId) => {
    localStorage.removeItem('customPrimary');
    localStorage.removeItem('customSecondary');
    localStorage.setItem('theme', themeId);
    
    document.documentElement.style.removeProperty('--color-primary');
    document.documentElement.style.removeProperty('--color-secondary');
    
    if (changeTheme) changeTheme(themeId);
  };

  const handleIconSelect = (iconId) => {
    setActiveIcon(iconId);
    localStorage.setItem('accountIcon', iconId);
    window.dispatchEvent(new CustomEvent('accountIconChanged', { detail: iconId }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-theme-primary text-theme-secondary w-full max-w-3xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] relative">
        <button onClick={onClose} className="absolute top-6 right-6 hover:opacity-60 transition-opacity">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <div className="p-8 md:p-10 overflow-y-auto custom-scrollbar">
          <h2 className="text-4xl font-bold italic font-serif mb-8">Налаштування</h2>

          <div className="mb-10">
            <h3 className="text-xl font-serif mb-4">Готові теми</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handlePresetSelect(t.id)}
                  style={{ backgroundColor: t.primary, color: t.secondary }}
                  className="flex items-center gap-4 p-4 rounded-lg shadow-sm hover:scale-[1.02] transition-transform font-medium"
                >
                  <div className="w-8 h-8 rounded-full shadow-inner" style={{ backgroundColor: t.secondary }}></div>
                  <span className="text-lg">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-10 p-6 rounded-lg bg-theme-secondary text-theme-primary">
            <h3 className="text-2xl font-serif mb-6">Власна тема</h3>
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block mb-2 font-medium">Основний колір</label>
                <div className="flex h-12 rounded-md overflow-hidden border border-theme-primary/30 bg-theme-primary/10">
                  <input type="color" value={customPrimary} onChange={(e) => setCustomPrimary(e.target.value)} className="w-16 h-12 cursor-pointer border-none p-0 bg-transparent" />
                  <input type="text" value={customPrimary} onChange={(e) => setCustomPrimary(e.target.value)} className="flex-1 px-4 bg-transparent outline-none uppercase text-theme-primary w-full" />
                </div>
              </div>
              <div className="flex-1 w-full">
                <label className="block mb-2 font-medium">Вторинний колір</label>
                <div className="flex h-12 rounded-md overflow-hidden border border-theme-primary/30 bg-theme-primary/10">
                  <input type="color" value={customSecondary} onChange={(e) => setCustomSecondary(e.target.value)} className="w-16 h-12 cursor-pointer border-none p-0 bg-transparent" />
                  <input type="text" value={customSecondary} onChange={(e) => setCustomSecondary(e.target.value)} className="flex-1 px-4 bg-transparent outline-none uppercase text-theme-primary w-full" />
                </div>
              </div>
              <button onClick={applyCustomTheme} className="w-full md:w-auto h-12 px-8 rounded-md bg-theme-primary text-theme-secondary font-bold hover:scale-105 transition-all">
                Зберегти
              </button>
            </div>
          </div>

          <div>
             <h3 className="text-2xl font-serif mb-4">Іконка профілю</h3>
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {ICONS.map((animal) => (
                  <button key={animal.id} onClick={() => handleIconSelect(animal.id)}
                    className={`flex flex-col items-center justify-center gap-3 p-6 rounded-lg bg-theme-secondary text-theme-primary transition-all duration-300 ${activeIcon === animal.id ? 'ring-4 ring-theme-primary scale-105' : 'hover:opacity-80'}`}
                  >
                    <div className="w-16 h-16 flex items-center justify-center mix-blend-multiply">
                       <img src={animal.src} alt={animal.label} className="w-full h-full object-contain" />
                    </div>
                    <span className="font-medium text-lg">{animal.label}</span>
                  </button>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}