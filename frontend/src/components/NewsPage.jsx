import React, { useState, useEffect } from 'react';

export default function NewsPage({ selectedArticle, setSelectedArticle }) {
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
        setNews(data);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  if (selectedArticle) {
    return (
      <div className="w-full flex-grow flex flex-col bg-theme-background transition-colors duration-500">
        <div className="container mx-auto px-4 py-12 max-w-4xl flex-grow">
          <button 
            onClick={() => setSelectedArticle(null)}
            className="mb-10 flex items-center gap-2 text-theme-secondary hover:opacity-70 transition-opacity font-serif font-medium text-lg"
          >
            &larr; Back to News
          </button>

          <h1 className="text-4xl sm:text-5xl font-bold font-serif mb-6 text-theme-secondary">
            {selectedArticle.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 mb-10 opacity-70 text-sm font-medium text-theme-secondary">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>{selectedArticle.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              <span>{selectedArticle.author || "MarginNotes Team"}</span>
            </div>
          </div>

          <div className="prose prose-lg max-w-none text-theme-secondary opacity-90 leading-relaxed">
            <span dangerouslySetInnerHTML={{ __html: selectedArticle.content || selectedArticle.summary }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex-grow flex flex-col">
      <div className="bg-theme-primary text-theme-secondary py-20 text-center transition-colors duration-500 border-b border-theme-secondary/10">
        <h1 className="text-4xl sm:text-5xl font-bold italic font-serif mb-4">
          Book World News
        </h1>
        <p className="text-lg sm:text-xl opacity-80 font-serif">
          Stay updated with the latest from the literary world
        </p>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-4xl flex-grow">
        {isLoading && <p className="text-center text-theme-secondary italic">Завантажуємо свіжі новини...</p>}
        {error && <p className="text-center text-red-500">Помилка: {error}</p>}

        {!isLoading && !error && (
          <div className="space-y-10">
            {news.map((item) => (
              <div 
                key={item.id} 
                onClick={() => setSelectedArticle(item)}
                className="bg-theme-primary text-theme-secondary rounded-xl p-8 sm:p-10 shadow-sm border border-theme-secondary/10 transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-pointer group"
              >
                <h2 className="text-3xl font-serif font-bold mb-4 opacity-90 group-hover:opacity-100">
                  {item.title}
                </h2>
                
                <div className="flex flex-wrap items-center gap-6 mb-6 opacity-70 text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span>{item.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    <span>{item.author || "MarginNotes Team"}</span>
                  </div>
                </div>

                <div className="leading-relaxed opacity-80 text-lg">
                   <span dangerouslySetInnerHTML={{ __html: item.summary }} />
                </div>

                <div className="mt-6 font-serif font-bold italic opacity-80 group-hover:opacity-100 transition-opacity">
                  Read full article &rarr;
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}