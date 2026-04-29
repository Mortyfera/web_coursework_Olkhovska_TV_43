import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Bookshelf from './components/Bookshelf';
import Recommendations from './components/Recommendations';
import NewsSection from './components/NewsSection';
import Footer from './components/Footer';
import NewsPage from './components/NewsPage';
import BookClubsPage from './components/BookClubsPage';
import ClubDetailPage from './components/ClubDetailPage';
import AuthModal from './components/AuthModal';

function App() {
  const [theme, setTheme] = useState('default');
  
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token')); 
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedClub, setSelectedClub] = useState(null);

  const changeTheme = (themeName) => {
    setTheme(themeName);
    document.documentElement.setAttribute('data-theme', themeName);
  };

  return (
    <div className="min-h-screen flex flex-col bg-theme-background transition-colors duration-500">
      <div className="h-2 w-full bg-theme-secondary transition-colors duration-500"></div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        setIsLoggedIn={setIsLoggedIn} 
      />

      <Navbar 
        changeTheme={changeTheme} 
        setCurrentPage={setCurrentPage} 
        setSelectedArticle={setSelectedArticle} 
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        openAuthModal={() => setIsAuthModalOpen(true)}
      />

      <main className="flex-grow flex flex-col">
        {currentPage === 'home' && (
          <>
            <div className="container mx-auto px-4 pb-20">
              <div className="mt-8"> 
                <Bookshelf />
              </div>
              <div className="mt-8">
                <Recommendations isLoggedIn={isLoggedIn} />
              </div>
            </div>
            <NewsSection 
              setCurrentPage={setCurrentPage} 
              setSelectedArticle={setSelectedArticle} 
            />
          </>
        )}

        {currentPage === 'news' && (
          <NewsPage selectedArticle={selectedArticle} setSelectedArticle={setSelectedArticle} />
        )}

        {currentPage === 'clubs' && (
          <BookClubsPage setSelectedClub={setSelectedClub} setCurrentPage={setCurrentPage} />
        )}

        {currentPage === 'club_detail' && (
          <ClubDetailPage club={selectedClub} goBack={() => setCurrentPage('clubs')} />
        )}
      </main>

      {currentPage !== 'club_detail' && <Footer />}
    </div>
  );
}

export default App;