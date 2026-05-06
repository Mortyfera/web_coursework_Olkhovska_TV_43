import React from 'react';

export default function BookDetailPage({ book, goBack }) {
  if (!book) return null;

  return (
    <div className="flex-1 w-full h-full overflow-y-auto p-4 sm:p-8 md:p-16 bg-theme-background transition-colors duration-500">
      
      <div className="max-w-5xl mx-auto bg-theme-primary rounded-3xl p-8 sm:p-12 shadow-xl border border-theme-secondary/10 relative transition-colors duration-500">
        
        <button 
          onClick={goBack}
          className="mb-8 md:absolute md:top-8 md:left-10 text-theme-secondary opacity-60 hover:opacity-100 font-serif transition-opacity flex items-center gap-2"
        >
          &larr; Закрити деталі
        </button>

        <div className="flex flex-col md:flex-row gap-10 md:gap-16 md:mt-12">
          
          <div className="w-full md:w-1/3 shrink-0 flex justify-center md:block">
            <div className="w-48 md:w-full aspect-[2/3] rounded-lg overflow-hidden shadow-2xl border border-theme-secondary/20">
              {book.cover_image_url ? (
                <img 
                  src={book.cover_image_url} 
                  alt={book.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-theme-secondary/10 flex items-center justify-center text-theme-secondary font-serif text-center p-4">
                  Немає обкладинки
                </div>
              )}
            </div>
          </div>


          <div className="w-full md:w-2/3 flex flex-col">
            
            <h1 className="text-4xl sm:text-5xl font-bold font-serif italic text-theme-secondary mb-2 transition-colors duration-500">
              {book.title}
            </h1>
            
            <p className="text-xl sm:text-2xl text-theme-secondary opacity-80 font-serif mb-8 border-b border-theme-secondary/20 pb-6 transition-colors duration-500">
              {book.author}
            </p>

            <h3 className="font-bold text-sm sm:text-base text-theme-secondary mb-3 uppercase tracking-wider opacity-60 transition-colors duration-500">
              Опис
            </h3>
            
            <p className="text-base sm:text-lg text-theme-secondary leading-relaxed opacity-90 mb-10 whitespace-pre-wrap transition-colors duration-500">
              {book.description || "На жаль, детальний опис для цієї книги ще не додано."}
            </p>

            <div className="mt-auto">
              <button 
                onClick={() => alert('Тут буде логіка видалення книги з полиці')}
                className="px-6 py-2.5 border border-red-500 text-red-500 font-medium rounded-lg hover:bg-red-500 hover:text-white transition-colors"
              >
                Видалити книгу з полиці
              </button>
            </div>
            
          </div>
        </div>
        
      </div>
    </div>
  );
}