import React, { useState, useEffect } from 'react';

import sparkleIcon from '../assets/star.png'; 

export default function Recommendations({ isLoggedIn }) {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/books/')
      .then(res => {
        if (!res.ok) throw new Error('Не вдалося завантажити рекомендації');
        return res.json();
      })
      .then(data => {
        setRecommendations(data.slice(0, 3)); 
        setIsLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  return (
    <section className="py-12 flex flex-col items-center">
      
      <div className="flex items-center justify-center gap-4 mb-12">
        <img 
          src={sparkleIcon} 
          alt="Sparkle" 
          className="w-8 h-8 object-contain mix-blend-multiply" 
        />
        
        <h2 className="text-3xl sm:text-4xl font-bold italic font-serif text-theme-secondary transition-colors duration-500">
          Recommended For You
        </h2>
        
        <img 
          src={sparkleIcon} 
          alt="Sparkle" 
          className="w-8 h-8 object-contain mix-blend-multiply" 
        />
      </div>

      {isLoading && <p className="text-theme-secondary opacity-70 italic">Шукаємо найкращі книги...</p>}
      {error && <p className="text-red-500">Помилка: {error}</p>}

      {!isLoading && !error && (
        <div className="w-full max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recommendations.map((book) => (
              <div 
                key={book.id} 
                className="bg-theme-primary text-theme-secondary rounded-xl p-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full cursor-pointer group border border-theme-secondary/10"
              >
                <h3 className="text-2xl font-serif font-bold mb-2 opacity-90 group-hover:opacity-100 transition-opacity">
                  {book.title}
                </h3>
                <p className="italic mb-4 opacity-70">
                  by {book.author}
                </p>
                <p className="leading-relaxed flex-grow opacity-80 text-sm sm:text-base">
                  {book.description || "Опис для цієї книги з'явиться згодом. Залишайтеся з нами!"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}