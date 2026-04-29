import React, { useState, useEffect } from 'react';

export default function BookClubsPage({ setSelectedClub, setCurrentPage }) {
  const [clubs, setClubs] = useState([]);
  const [filteredClubs, setFilteredClubs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Всі');

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/clubs/')
      .then(res => {
        if (!res.ok) throw new Error('Не вдалося завантажити книжкові клуби');
        return res.json();
      })
      .then(data => {
        setClubs(data);
        setFilteredClubs(data);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    let result = clubs;
    if (activeFilter !== 'Всі') {
      result = result.filter(club => club.format_display === activeFilter);
    }
    if (searchQuery.trim() !== '') {
      result = result.filter(club => 
        club.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        club.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredClubs(result);
  }, [searchQuery, activeFilter, clubs]);

  const filters = ['Всі', 'Офлайн', 'Онлайн', 'Гібрид'];

  return (
    <div className="w-full flex-grow flex flex-col bg-theme-background transition-colors duration-500 pb-20">
      
      <div className="bg-theme-primary text-theme-secondary py-16 text-center transition-colors duration-500 border-b border-theme-secondary/10">
        <h1 className="text-5xl font-bold italic font-serif mb-4">
          Книжкові клуби
        </h1>
        <p className="text-xl opacity-80 font-serif mb-8">
          Знайдіть свою читацьку спільноту або створіть власну
        </p>
        <button className="bg-theme-secondary text-theme-primary font-serif px-6 py-3 rounded-md hover:opacity-80 transition-all shadow-md flex items-center gap-2 mx-auto">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Створити власний клуб
        </button>
      </div>

      <div className="container mx-auto px-4 mt-8 max-w-6xl">
        
        <div className="relative mb-6">
          <svg className="w-6 h-6 absolute left-4 top-1/2 transform -translate-y-1/2 text-theme-secondary opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input 
            type="text" 
            placeholder="Пошук книжкових клубів..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-theme-primary text-theme-secondary border border-theme-secondary/40 rounded-lg py-4 pl-14 pr-4 focus:outline-none focus:border-theme-secondary transition-colors text-lg"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeFilter === filter 
                  ? 'bg-theme-secondary text-theme-primary shadow-md' 
                  : 'bg-theme-primary text-theme-secondary border border-theme-secondary/20 hover:border-theme-secondary/60'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {isLoading && <p className="text-center text-theme-secondary italic">Завантажуємо клуби...</p>}
        {error && <p className="text-center text-red-500">Помилка: {error}</p>}

        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredClubs.map(club => (
              <div key={club.id} className="bg-theme-primary text-theme-secondary rounded-xl p-8 shadow-sm border border-theme-secondary/10 flex flex-col h-full">
                
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-3xl font-serif font-bold opacity-90">{club.name}</h2>
                  <span className="bg-theme-secondary text-theme-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {club.format_display}
                  </span>
                </div>
                
                <p className="opacity-80 leading-relaxed mb-6 flex-grow text-lg">
                  {club.description}
                </p>

                <div className="space-y-3 mb-6 opacity-80 font-medium">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                    <span>{club.members_count} учасників</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <span>Наступна зустріч: {club.next_meeting}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    <span>{club.location}</span>
                  </div>
                </div>

                <div className="bg-theme-secondary text-theme-primary rounded-lg p-5 mb-6">
                  <p className="text-sm opacity-80 mb-1">Зараз читають:</p>
                  <p className="font-bold font-serif text-xl">{club.currently_reading}</p>
                </div>

                <button 
                  onClick={() => {
                    setSelectedClub(club);
                    setCurrentPage('club_detail');
                  }}
                  className="w-full bg-theme-secondary text-theme-primary font-serif font-bold py-3 rounded-md hover:opacity-80 transition-opacity"
                >
                  Увійти в простір клубу
                </button>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}