import React, { useState, useEffect } from 'react';

export default function NewsSection({ setCurrentPage, setSelectedArticle }) {
  const [news, setNews] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/news/')
      .then(res => {
        if (!res.ok) throw new Error('Не вдалося завантажити новини');
        return res.json();
      })
      .then(data => {
        setNews(data.slice(0, 3)); 
        setIsLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  const formatDateToUkrainian = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; 
      
      return date.toLocaleDateString('uk-UA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <section className="w-full bg-theme-secondary py-16 mt-8 transition-colors duration-500">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-3xl sm:text-4xl font-bold italic font-serif text-center mb-12 text-theme-primary transition-colors duration-500">
          Останні новини книжкового світу
        </h2>

        {isLoading && <p className="text-center text-theme-primary italic opacity-80">Підвантажуємо новини з бази...</p>}
        {error && <p className="text-center text-red-400">Щось пішло не так: {error}</p>}

        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-10">
            {news.map((item) => (
              <div 
                key={item.id}
                onClick={() => {
                  setSelectedArticle(item);
                  setCurrentPage('news');
                }}
                className="bg-theme-primary text-theme-secondary rounded-xl p-8 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col h-full border border-theme-secondary/10 group cursor-pointer"
              >
                <h3 className="text-xl font-serif font-bold mb-3 leading-snug opacity-90 group-hover:opacity-100 transition-opacity">
                  {item.title}
                </h3>
                <p className="text-sm mb-4 opacity-70">
                  {formatDateToUkrainian(item.date)}
                </p>
                <p className="leading-relaxed flex-grow opacity-80">
                  <span dangerouslySetInnerHTML={{ __html: item.summary || item.content?.substring(0, 150) + '...' }} />
                </p>
              </div>
            ))}
          </div>
        )}

        {!isLoading && !error && news.length > 0 && (
          <div className="flex justify-center">
            <button 
              onClick={() => {
                setSelectedArticle(null);
                setCurrentPage('news');
              }}
              className="bg-theme-primary text-theme-secondary font-bold font-serif px-8 py-3 rounded-md hover:opacity-80 transition-all shadow-md"
            >
              Переглянути всі новини
            </button>
          </div>
        )}

      </div>
    </section>
  );
}