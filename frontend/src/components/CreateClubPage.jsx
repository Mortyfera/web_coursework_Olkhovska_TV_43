import React, { useState, useEffect } from 'react';

export default function CreateClubPage({ goBack, setCurrentPage, setSelectedClub }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    format: 'ON',
    is_private: false,
    genres: []
  });

  const [availableGenres, setAvailableGenres] = useState([]);
  const [isLoadingGenres, setIsLoadingGenres] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/genres/');
        if (response.ok) {
          const data = await response.json();
          setAvailableGenres(data.results || data);
        }
      } catch (err) {
        console.error('Помилка завантаження жанрів:', err);
      } finally {
        setIsLoadingGenres(false);
      }
    };

    fetchGenres();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'is_private') {
      setFormData(prev => ({ ...prev, [name]: value === 'true' }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const toggleGenre = (genreId) => {
    setFormData(prev => {
      const isSelected = prev.genres.includes(genreId);
      if (isSelected) {
        return { ...prev, genres: prev.genres.filter(id => id !== genreId) };
      } else {
        return { ...prev, genres: [...prev.genres, genreId] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Ви повинні бути авторизовані, щоб створити клуб.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/clubs/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        if (setSelectedClub) setSelectedClub(data);
        setCurrentPage('club_detail');
      } else {
        const errorMessages = Object.entries(data)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join(' | ');
        setError(`Помилка створення: ${errorMessages || 'Перевірте правильність даних.'}`);
      }
    } catch (err) {
      setError('Не вдалося з\'єднатися з сервером. Спробуйте пізніше.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 w-full h-full overflow-y-auto p-4 sm:p-8 md:p-16 bg-theme-background transition-colors duration-500 custom-scrollbar">
      <div className="max-w-4xl mx-auto bg-theme-primary rounded-3xl p-8 sm:p-12 shadow-xl border border-theme-secondary/10 relative transition-colors duration-500">
        
        <button 
          onClick={goBack} 
          className="mb-8 text-theme-secondary opacity-60 hover:opacity-100 font-serif flex items-center gap-2 transition-opacity"
        >
          &larr; Назад до клубів
        </button>

        <h1 className="text-4xl sm:text-5xl font-bold font-serif italic text-theme-secondary mb-2 transition-colors duration-500">
          Створити клуб
        </h1>
        <p className="text-theme-secondary opacity-60 font-serif mb-10 transition-colors duration-500">
          Об'єднайте однодумців та читайте разом
        </p>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest font-bold text-theme-secondary opacity-60">Назва клубу <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required
              placeholder="Наприклад: Читачі Опівночі"
              className="w-full bg-theme-background/50 border border-theme-secondary/20 rounded-xl p-4 text-theme-secondary outline-none focus:border-theme-secondary focus:ring-1 focus:ring-theme-secondary transition-all text-base sm:text-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest font-bold text-theme-secondary opacity-60">Опис <span className="text-red-500">*</span></label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              required
              rows="4"
              placeholder="Про що цей клуб? Які книги ви плануєте читати?"
              className="w-full bg-theme-background/50 border border-theme-secondary/20 rounded-xl p-4 text-theme-secondary outline-none focus:border-theme-secondary focus:ring-1 focus:ring-theme-secondary transition-all resize-none text-base sm:text-lg custom-scrollbar"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-bold text-theme-secondary opacity-60">Формат зустрічей</label>
              <div className="relative">
                <select 
                  name="format" 
                  value={formData.format} 
                  onChange={handleChange}
                  className="w-full bg-theme-background/50 border border-theme-secondary/20 rounded-xl p-4 text-theme-secondary outline-none focus:border-theme-secondary focus:ring-1 focus:ring-theme-secondary transition-all cursor-pointer appearance-none text-base sm:text-lg"
                >
                  <option value="ON">Онлайн (Zoom, Discord тощо)</option>
                  <option value="OF">Офлайн (Зустрічі наживо)</option>
                  <option value="HY">Гібрид (Мішаний формат)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-theme-secondary opacity-60">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-bold text-theme-secondary opacity-60">Тип доступу</label>
              <div className="relative">
                <select 
                  name="is_private" 
                  value={formData.is_private ? "true" : "false"} 
                  onChange={handleChange}
                  className="w-full bg-theme-background/50 border border-theme-secondary/20 rounded-xl p-4 text-theme-secondary outline-none focus:border-theme-secondary focus:ring-1 focus:ring-theme-secondary transition-all cursor-pointer appearance-none text-base sm:text-lg"
                >
                  <option value="false">Публічний клуб (вступ без обмежень)</option>
                  <option value="true">Приватний клуб (вступ за запрошенням)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-theme-secondary opacity-60">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-theme-secondary/10">
            <label className="text-xs uppercase tracking-widest font-bold text-theme-secondary opacity-60">Улюблені жанри клубу</label>
            
            {isLoadingGenres ? (
              <p className="text-sm italic opacity-50 text-theme-secondary">Завантаження жанрів...</p>
            ) : availableGenres.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {availableGenres.map(genre => {
                  const isSelected = formData.genres.includes(genre.id);
                  return (
                    <button
                      type="button"
                      key={genre.id}
                      onClick={() => toggleGenre(genre.id)}
                      className={`px-4 py-2 rounded-full text-sm transition-all border ${
                        isSelected 
                          ? 'bg-theme-secondary text-theme-primary border-theme-secondary shadow-md' 
                          : 'bg-theme-primary/50 text-theme-secondary border-theme-secondary/30 hover:border-theme-secondary'
                      }`}
                    >
                      {genre.name}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm italic opacity-50 text-theme-secondary">Жанри не знайдені.</p>
            )}
          </div>

          <div className="pt-8 flex flex-col md:flex-row gap-4 border-t border-theme-secondary/10">
            <button 
              type="submit" 
              disabled={isSubmitting || !formData.name || !formData.description}
              className="px-8 py-4 bg-[#4A554E] text-white rounded-xl font-bold text-lg hover:bg-[#3A453E] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md w-full md:w-auto order-1 md:order-2"
            >
              {isSubmitting ? 'Створення...' : 'Створити клуб'}
            </button>
            <button 
              type="button"
              onClick={goBack}
              className="px-8 py-4 border border-theme-secondary/20 text-theme-secondary rounded-xl hover:bg-theme-secondary/5 transition-colors w-full md:w-auto order-2 md:order-1"
            >
              Скасувати
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}