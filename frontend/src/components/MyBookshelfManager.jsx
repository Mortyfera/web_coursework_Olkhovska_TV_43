import React, { useState, useEffect } from 'react';

export default function MyBookshelfManager({ 
  goBack, 
  setCurrentPage, 
  setSelectedBook, 
  isClubMode = false, 
  clubId = null,
  initialBooks = null,
  onBooksUpdate = null,
  isAdmin = true
}) {
  const [books, setBooks] = useState(initialBooks || []);
  const [isLoading, setIsLoading] = useState(!initialBooks); 
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [catalogBooks, setCatalogBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (isClubMode) {
      if (initialBooks) setBooks(initialBooks);
      setIsLoading(false);
      return; 
    }

    const fetchUserBooks = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Ви не авторизовані. Будь ласка, увійдіть в акаунт.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('http://127.0.0.1:8000/api/bookshelf/', {
          headers: { 'Authorization': `Token ${token}` }
        });
        
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.detail || 'Не вдалося завантажити книги');
        }
        
        const data = await response.json();
        setBooks(data.results || data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserBooks();
  }, [isClubMode, initialBooks]);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/genres/')
      .then(res => res.json())
      .then(data => setGenres(data.results || data))
      .catch(err => console.error('Помилка завантаження жанрів:', err));
  }, []);

  useEffect(() => {
    if (!isModalOpen) return;
    
    setIsSearching(true);
    let url = 'http://127.0.0.1:8000/api/books/';
    if (searchQuery.length >= 2) {
      url += `?search=${searchQuery}`;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setCatalogBooks(data.results || data);
        setIsSearching(false);
      })
      .catch(err => {
        console.error('Помилка пошуку:', err);
        setIsSearching(false);
      });
  }, [searchQuery, isModalOpen]);

  const handleAddBookToShelf = (book) => {
    const isAlreadyOnShelf = books.some(item => {
      const itemBookId = item.book_details ? item.book_details.id : item.id;
      return itemBookId === book.id;
    });

    if (isAlreadyOnShelf) {
      alert('Ця книга вже є на поліці!');
      return;
    }

    const token = localStorage.getItem('token');
    
    if (isClubMode) {
      const currentBookIds = books.map(b => b.id || (b.book_details && b.book_details.id));
      const newBookIds = [...currentBookIds, book.id];

      fetch(`http://127.0.0.1:8000/api/clubs/${clubId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({ book_ids: newBookIds }) 
      })
      .then(res => {
        if (res.ok) {
          const newBooks = [...books, book];
          setBooks(newBooks);
          if (onBooksUpdate) onBooksUpdate(newBooks);
          setIsModalOpen(false);
          setSearchQuery('');
          alert("Книгу успішно додано в клуб!");
        } else {
          alert("Помилка при додаванні книги в клуб.");
        }
      })
      .catch(err => console.error("Помилка:", err));

    } else {
      fetch('http://127.0.0.1:8000/api/bookshelf/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({ book: book.id, status: 'TR' }) 
      })
      .then(async res => {
        if (res.ok) return res.json();
        const err = await res.json().catch(() => ({}));
        throw new Error(Object.entries(err).map(([field, msg]) => `${field}: ${msg}`).join(' | '));
      })
      .then(newShelfItem => {
        setBooks([...books, newShelfItem]);
        setIsModalOpen(false);
        setSearchQuery('');
        alert("Книгу успішно додано!");
      })
      .catch(err => alert(`Не вдалося додати книгу.\nПричина: ${err.message}`));
    }
  };

  const handleRemoveBook = async (e, item) => {
    e.stopPropagation();
    if (!window.confirm('Ви впевнені, що хочете видалити цю книгу з полиці?')) return;

    const token = localStorage.getItem('token');
    
    if (isClubMode) {
      const bookIdToRemove = item.id;
      const newBookIds = books.filter(b => b.id !== bookIdToRemove).map(b => b.id);

      fetch(`http://127.0.0.1:8000/api/clubs/${clubId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({ book_ids: newBookIds })
      })
      .then(res => {
        if (res.ok) {
          const newBooks = books.filter(b => b.id !== bookIdToRemove);
          setBooks(newBooks);
          if (onBooksUpdate) onBooksUpdate(newBooks);
        } else {
          alert("Помилка при видаленні книги.");
        }
      })
      .catch(err => console.error("Помилка:", err));

    } else {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/bookshelf/${item.id}/`, {
          method: 'DELETE',
          headers: { 'Authorization': `Token ${token}` }
        });
        if (!response.ok) throw new Error('Не вдалося видалити книгу з сервера');
        setBooks(books.filter(b => b.id !== item.id));
      } catch (err) {
        alert(`Помилка видалення: ${err.message}`);
      }
    }
  };

  const handleStatusChange = async (e, shelfItemId, newStatus) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/bookshelf/${shelfItemId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const updatedItem = await response.json();
        setBooks(books.map(b => b.id === shelfItemId ? updatedItem : b));
      } else {
        alert("Помилка при оновленні статусу книги.");
      }
    } catch (err) {
      console.error(err);
      alert("Не вдалося з'єднатися з сервером.");
    }
  };

  const getStatusLabel = (statusStr) => {
    switch (statusStr) {
      case 'RD': return 'Прочитано';
      case 'RG': return 'Читаю';
      case 'TR': return 'У планах';
      default: return 'Невідомо';
    }
  };

  const filteredCatalog = catalogBooks.filter(book => {
    if (!selectedGenre) return true;
    return book.genres?.some(g => {
      const genreId = typeof g === 'object' ? g.id : g;
      return genreId.toString() === selectedGenre.toString();
    });
  });

  return (
    <div className="flex-1 w-full h-full overflow-y-auto p-4 sm:p-8 md:p-16 bg-theme-background transition-colors duration-500 relative custom-scrollbar">
      <div className="max-w-6xl mx-auto relative">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-6">
          <div>
            <button 
              onClick={goBack}
              className="text-theme-secondary opacity-60 hover:opacity-100 font-serif transition-opacity mb-2 flex items-center gap-2"
            >
              &larr; До простору
            </button>
            <h2 className="text-4xl font-serif font-bold text-theme-secondary italic transition-colors duration-500">
              {isClubMode ? 'Книжкова полиця клубу' : 'Моя книжкова полиця'}
            </h2>
          </div>
          
          {isAdmin && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2.5 bg-[#4A554E] text-white font-medium rounded-md hover:bg-[#3A453E] transition-colors shadow-md whitespace-nowrap self-start sm:self-auto"
            >
              + Додати книгу
            </button>
          )}
        </div>

        {isLoading && <p className="text-theme-secondary opacity-70 italic font-serif">Завантаження книжок...</p>}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Помилка: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {!isLoading && !error && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {books.length === 0 ? (
              <p className="text-theme-secondary opacity-70 col-span-full font-serif text-lg">
                Полиця поки що порожня.
              </p>
            ) : (
              books.map((item) => {
                const book = isClubMode ? item : (item.book_details || item);

                return (
                  <div 
                    key={isClubMode ? book.id : item.id}
                    onClick={() => {
                      if(setSelectedBook) setSelectedBook(book);
                      if(setCurrentPage) setCurrentPage('book_detail');
                    }}
                    className="bg-theme-primary rounded-xl p-4 sm:p-5 shadow-sm border border-theme-secondary/10 hover:shadow-lg transition-all duration-300 cursor-pointer group hover:-translate-y-1.5 flex flex-col h-full"
                  >
                    <div className="aspect-[2/3] w-full rounded-md mb-4 overflow-hidden relative shadow-md border border-theme-secondary/20 bg-theme-secondary/10">
                      
                      {!isClubMode && item.status && (
                        <div className="absolute top-2 left-2 bg-theme-primary/95 text-theme-secondary text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded shadow-sm z-10 transition-opacity group-hover:opacity-0">
                          {getStatusLabel(item.status)}
                        </div>
                      )}

                      {isAdmin && (
                        <button
                          onClick={(e) => handleRemoveBook(e, item)}
                          className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm z-30 shadow-sm"
                          title="Видалити з полиці"
                        >
                          ✕
                        </button>
                      )}

                      {!isClubMode && (
                        <div className="absolute inset-0 bg-theme-primary/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 gap-2 z-20">
                          <p className="text-theme-secondary font-bold font-serif mb-2 text-sm border-b border-theme-secondary/20 pb-1 w-full text-center">Змінити статус</p>
                          
                          <button 
                            onClick={(e) => handleStatusChange(e, item.id, 'RD')} 
                            className={`w-full py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-colors ${item.status === 'RD' ? 'bg-[#4A554E] text-white shadow-inner' : 'bg-theme-secondary/10 text-theme-secondary hover:bg-theme-secondary hover:text-theme-primary'}`}
                          >
                            Прочитано
                          </button>
                          
                          <button 
                            onClick={(e) => handleStatusChange(e, item.id, 'RG')} 
                            className={`w-full py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-colors ${item.status === 'RG' ? 'bg-[#4A554E] text-white shadow-inner' : 'bg-theme-secondary/10 text-theme-secondary hover:bg-theme-secondary hover:text-theme-primary'}`}
                          >
                            Читаю
                          </button>
                          
                          <button 
                            onClick={(e) => handleStatusChange(e, item.id, 'TR')} 
                            className={`w-full py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-colors ${item.status === 'TR' ? 'bg-[#4A554E] text-white shadow-inner' : 'bg-theme-secondary/10 text-theme-secondary hover:bg-theme-secondary hover:text-theme-primary'}`}
                          >
                            У планах
                          </button>
                        </div>
                      )}

                      {book.cover_image_url ? (
                        <img 
                          src={book.cover_image_url} 
                          alt={book.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-theme-secondary opacity-50 font-serif">
                          Обкладинка
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-auto relative z-10">
                      <h3 className="font-bold font-serif text-base sm:text-lg text-theme-secondary line-clamp-2 leading-tight mb-1 transition-colors duration-500">
                        {book.title}
                      </h3>
                      <p className="text-sm opacity-70 text-theme-secondary truncate transition-colors duration-500">
                        {book.author}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-theme-background w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl flex flex-col border border-theme-secondary/20 overflow-hidden">
            
            <div className="bg-theme-primary px-8 py-5 border-b border-theme-secondary/10 flex justify-between items-center shrink-0">
              <h2 className="text-2xl font-serif font-bold italic text-theme-secondary">Каталог книг</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-theme-secondary opacity-50 hover:opacity-100 text-3xl transition-opacity leading-none"
              >
                &times;
              </button>
            </div>

            <div className="px-8 py-4 bg-theme-secondary/5 flex flex-col sm:flex-row gap-4 shrink-0">
              <input 
                type="text" 
                placeholder="Пошук за назвою чи автором..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-theme-primary border border-theme-secondary/30 rounded-lg px-4 py-2 text-theme-secondary focus:outline-none focus:border-theme-secondary transition-colors"
              />
              
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full sm:w-64 bg-theme-primary border border-theme-secondary/30 rounded-lg px-4 py-2 text-theme-secondary focus:outline-none focus:border-theme-secondary cursor-pointer"
              >
                <option value="">Усі жанри</option>
                {genres.map(genre => (
                  <option key={genre.id} value={genre.id}>{genre.name}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {isSearching ? (
                <p className="text-center text-theme-secondary opacity-70 italic font-serif mt-10">Шукаємо...</p>
              ) : filteredCatalog.length === 0 ? (
                <p className="text-center text-theme-secondary opacity-70 font-serif mt-10 text-lg">За вашим запитом нічого не знайдено.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredCatalog.map(book => (
                    <div key={book.id} className="bg-theme-primary rounded-xl p-4 shadow-sm border border-theme-secondary/10 flex flex-col hover:shadow-md transition-shadow">
                      <div className="aspect-[2/3] rounded-md overflow-hidden mb-3 border border-theme-secondary/20">
                        {book.cover_image_url ? (
                          <img src={book.cover_image_url} alt={book.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-theme-secondary/10 flex items-center justify-center text-theme-secondary text-xs opacity-50">Немає обкладинки</div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col">
                        <h4 className="font-bold font-serif text-theme-secondary line-clamp-2 leading-tight mb-1">{book.title}</h4>
                        <p className="text-xs text-theme-secondary opacity-70 mb-2 truncate">{book.author}</p>
                        
                        {book.genres && book.genres.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3 mt-auto">
                            {book.genres.slice(0, 2).map((g, idx) => {
                              const genreObj = typeof g === 'object' ? g : genres.find(item => item.id === g);
                              const genreName = genreObj ? genreObj.name : `Жанр`;
                              const genreKey = typeof g === 'object' ? g.id : `${g}-${idx}`;

                              return (
                                <span key={genreKey} className="text-[10px] px-1.5 py-0.5 bg-theme-secondary/10 text-theme-secondary rounded">
                                  {genreName}
                                </span>
                              );
                            })}
                          </div>
                        )}
                        
                        <button 
                          onClick={() => handleAddBookToShelf(book)}
                          className="w-full mt-auto py-2 bg-theme-secondary/10 text-theme-secondary font-bold text-sm rounded hover:bg-theme-secondary hover:text-theme-primary transition-colors border border-theme-secondary/20"
                        >
                          Додати на полицю
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}