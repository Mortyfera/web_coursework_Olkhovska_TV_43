import React, { useState, useEffect } from 'react';

const SPINE_COLORS = ['#3A4F5E', '#7E57C2', '#D88A00', '#2B65EC', '#169873', '#008B8B', '#C62828', '#6A1B9A'];

export default function Bookshelf() {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/books/')
      .then(response => {
        if (!response.ok) throw new Error('Не вдалося завантажити книги з бази');
        return response.json();
      })
      .then(data => {
        setBooks(data); 
        setIsLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  return (
    <section className="py-12 flex flex-col items-center min-h-[400px]">
      <h2 className="text-3xl sm:text-4xl font-bold italic font-serif mb-12 text-theme-secondary transition-colors duration-500">
        My Bookshelf
      </h2>
      
      {isLoading && <p className="text-theme-secondary/70 italic">Дістаємо книги з бази...</p>}
      {error && <p className="text-red-500">Помилка: {error}</p>}

      {!isLoading && !error && (
        <div className="relative w-full max-w-4xl mx-auto px-4 flex flex-col items-center">
          
          <div className="flex items-end justify-center gap-1 sm:gap-2 px-4 w-full h-48 sm:h-64 z-10">
            
            {books.length === 0 ? (
              <p className="text-theme-secondary opacity-70 pb-4">Полиця поки що порожня. Додайте книги через адмінку!</p>
            ) : (
              books.slice(0, 10).map((book, index) => (
                <div
                  key={book.id}
                  className="group cursor-pointer flex-1 max-w-[60px] sm:max-w-[80px] h-full rounded-t-sm shadow-md transition-all duration-300 transform hover:-translate-y-4 hover:shadow-xl relative overflow-hidden"
                  style={{ backgroundColor: SPINE_COLORS[index % SPINE_COLORS.length] }}
                >
                  <div className="absolute inset-0 border-l-2 border-white/20"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent w-4"></div>
                  
                  <div className="absolute inset-0 py-4 flex justify-center items-center overflow-hidden">
                    <span 
                      className="text-white text-xs sm:text-sm font-medium tracking-wider opacity-90 group-hover:opacity-100 transition-opacity max-h-full px-1 text-center"
                      style={{ 
                        writingMode: 'vertical-rl', 
                        transform: 'rotate(180deg)' 
                      }}
                    >
                      {book.title}
                    </span>
                  </div>
                </div>
              ))
            )}
            
          </div>

          <div className="w-full h-5 bg-theme-secondary rounded-full shadow-md mt-1 z-10 relative transition-colors duration-500"></div>
          
          <div className="w-[98%] h-2 bg-theme-secondary opacity-40 rounded-full mx-auto mt-1.5 transition-colors duration-500"></div>

        </div>
      )}
    </section>
  );
}