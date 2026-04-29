import React, { useState } from 'react';
import ThemeModal from './ThemeModal'; 

import myLogo from '../assets/logo_fonless.png'; 
import searchIcon from '../assets/icon_search.png';   
import themeIcon from '../assets/icon_themes.png';     
import profileIcon from '../assets/user_icon_cat.png';  
import menuIcon from '../assets/icon_menu.png';       

export default function Navbar({ changeTheme, setCurrentPage, setSelectedArticle, isLoggedIn, setIsLoggedIn, openAuthModal }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false); 

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    setCurrentPage('home');
  };

  return (
    <>
      <ThemeModal isOpen={isThemeModalOpen} onClose={() => setIsThemeModalOpen(false)} changeTheme={changeTheme} />

      <header className="bg-theme-primary text-theme-secondary relative z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            <div className="flex items-center gap-8">
              <div className="flex-shrink-0 flex items-center gap-3 cursor-pointer" onClick={() => setCurrentPage('home')}>
                <img src={myLogo} alt="Margin Notes Logo" className="w-14 h-14 object-contain mix-blend-multiply" />
                <span className="font-bold text-2xl hidden sm:block italic font-serif tracking-wide">MarginNotes</span>
              </div>

              <nav className="hidden md:flex space-x-8">
                <button onClick={() => setCurrentPage('home')} className="hover:opacity-70 transition-opacity font-medium">Головна</button>
                <button onClick={() => { setSelectedArticle(null); setCurrentPage('news'); }} className="hover:opacity-70 transition-opacity font-medium">Новини</button>
                <button onClick={() => setCurrentPage('clubs')} className="hover:opacity-70 transition-opacity font-medium">Книжкові клуби</button>
                
                {isLoggedIn ? (
                  <>
                    <button className="hover:opacity-70 transition-opacity font-medium">Профіль</button>
                    <button onClick={handleLogout} className="hover:opacity-70 transition-opacity font-medium text-red-500">Вийти</button>
                  </>
                ) : (
                  <button onClick={openAuthModal} className="hover:opacity-70 transition-opacity font-medium font-bold">Увійти</button>
                )}
              </nav>
            </div>

            <div className="flex items-center space-x-5">
              <button className="hover:scale-110 transition-transform">
                <img src={searchIcon} alt="Search" className="w-9 h-9 object-contain mix-blend-multiply" />
              </button>
              <button onClick={() => setIsThemeModalOpen(true)} className="hover:scale-110 transition-transform flex items-center" title="Customize Experience">
                <img src={themeIcon} alt="Change Theme" className="w-9 h-9 object-contain mix-blend-multiply" />
              </button>
              
              <button className="hover:scale-110 transition-transform" onClick={!isLoggedIn ? openAuthModal : undefined}>
                <img src={profileIcon} alt="Profile" className="w-8 h-8 object-contain mix-blend-multiply" />
              </button>

              <button className="md:hidden ml-4 hover:scale-110 transition-transform" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                <img src={menuIcon} alt="Menu" className="w-8 h-8 object-contain mix-blend-multiply" />
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}