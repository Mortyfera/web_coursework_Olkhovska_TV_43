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
import BookDetailPage from './components/BookDetailPage';
import MyBookshelfManager from './components/MyBookshelfManager';
import UserProfile from './components/UserProfile';
import CreateClubPage from './components/CreateClubPage';

const ActivationPage = ({ uid, token, setCurrentPage }) => {
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Активуємо ваш акаунт...');

  useEffect(() => {
    const activate = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/activate/${uid}/${token}/`);
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.status);
        } else {
          setStatus('error');
          setMessage(data.error || 'Помилка активації.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Не вдалося з’єднатися з сервером.');
      }
    };
    activate();
  }, [uid, token]);

  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-theme-background">
      <div className="max-w-md w-full bg-theme-primary p-10 rounded-3xl shadow-xl border border-theme-secondary/10 text-center">
        <h2 className="text-3xl font-serif font-bold italic text-theme-secondary mb-6">Активація профілю</h2>
        <p className={`text-lg mb-8 ${status === 'error' ? 'text-red-500' : 'text-theme-secondary opacity-80'}`}>
          {message}
        </p>
        {status !== 'processing' && (
          <button 
            onClick={() => setCurrentPage('home')}
            className="px-8 py-3 bg-theme-secondary text-theme-primary rounded-xl font-bold hover:opacity-90 transition-opacity"
          >
            На головну
          </button>
        )}
      </div>
    </div>
  );
};

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const customPrimary = localStorage.getItem('customPrimary');
    const customSecondary = localStorage.getItem('customSecondary');

    if (savedTheme === 'custom' && customPrimary && customSecondary) {
      document.documentElement.style.setProperty('--color-primary', customPrimary);
      document.documentElement.style.setProperty('--color-secondary', customSecondary);
    }
  }, []);

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'default');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token')); 
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedClub, setSelectedClub] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);

  const [activationParams, setActivationParams] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);

    const path = window.location.pathname;
    if (path.startsWith('/activate/')) {
      const parts = path.split('/');
      if (parts.length >= 4) {
        setActivationParams({ uid: parts[2], token: parts[3] });
        setCurrentPage('activate');
        window.history.replaceState({}, document.title, "/");
      }
    }
  }, [theme]);

  const changeTheme = (themeName) => {
    setTheme(themeName);
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('theme', themeName);
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
                <Bookshelf 
                  setCurrentPage={setCurrentPage} 
                  setSelectedBook={setSelectedBook} 
                />
              </div>
              <div className="mt-8">
                <Recommendations 
                  isLoggedIn={isLoggedIn} 
                  setCurrentPage={setCurrentPage}
                  setSelectedBook={setSelectedBook}
                />
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

        {currentPage === 'book_detail' && (
          <BookDetailPage book={selectedBook} goBack={() => setCurrentPage('home')} />
        )}

        {currentPage === 'my_bookshelf_manager' && (
          <MyBookshelfManager 
            goBack={() => setCurrentPage('home')} 
            setCurrentPage={setCurrentPage}
            setSelectedBook={setSelectedBook}
          />
        )}

        {currentPage === 'profile' && (
          <UserProfile 
            goBack={() => setCurrentPage('home')} 
            changeTheme={changeTheme} 
          />
        )}

        {currentPage === 'activate' && activationParams && (
          <ActivationPage 
            uid={activationParams.uid} 
            token={activationParams.token} 
            setCurrentPage={setCurrentPage} 
          />
        )}

        {currentPage === 'create_club' && (
          <CreateClubPage 
            goBack={() => setCurrentPage('clubs')} 
            setCurrentPage={setCurrentPage} 
            setSelectedClub={setSelectedClub} 
          />
        )}
      </main>

      {currentPage !== 'club_detail' && currentPage !== 'activate' && <Footer />}
    </div>
  );
}

export default App;