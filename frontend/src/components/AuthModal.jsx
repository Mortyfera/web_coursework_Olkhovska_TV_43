import React, { useState } from 'react';

export default function AuthModal({ isOpen, onClose, setIsLoggedIn }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const url = isLoginMode 
      ? 'http://127.0.0.1:8000/api/login/' 
      : 'http://127.0.0.1:8000/api/register/';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        setIsLoggedIn(true);
        onClose();
      } else {
        setError(data.error || 'Помилка. Перевірте введені дані.');
      }
    } catch (err) {
      setError('Помилка з\'єднання з сервером');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-theme-primary text-theme-secondary p-8 rounded-2xl shadow-2xl w-full max-w-md border border-theme-secondary/10 relative">
        
        <button onClick={onClose} className="absolute top-4 right-5 text-2xl opacity-60 hover:opacity-100 transition-opacity">
          &times;
        </button>

        <h2 className="text-3xl font-serif font-bold italic text-center mb-8">
          {isLoginMode ? 'З поверненням!' : 'Приєднатися до нас'}
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1 opacity-80">Ім'я користувача</label>
            <input 
              type="text" 
              name="username"
              required 
              value={formData.username}
              onChange={handleChange}
              className="w-full bg-theme-background border border-theme-secondary/30 rounded-lg px-4 py-2.5 focus:outline-none focus:border-theme-secondary transition-colors"
            />
          </div>

          {!isLoginMode && (
            <div>
              <label className="block text-sm font-medium mb-1 opacity-80">Email</label>
              <input 
                type="email" 
                name="email"
                required 
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-theme-background border border-theme-secondary/30 rounded-lg px-4 py-2.5 focus:outline-none focus:border-theme-secondary transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1 opacity-80">Пароль</label>
            <input 
              type="password" 
              name="password"
              required 
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-theme-background border border-theme-secondary/30 rounded-lg px-4 py-2.5 focus:outline-none focus:border-theme-secondary transition-colors"
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-theme-secondary text-theme-primary font-bold font-serif py-3 rounded-lg hover:opacity-90 transition-opacity mt-6 shadow-md"
          >
            {isLoginMode ? 'Увійти' : 'Зареєструватися'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm opacity-80">
          {isLoginMode ? "Ще не маєте акаунту? " : "Вже зареєстровані? "}
          <button 
            onClick={() => { setIsLoginMode(!isLoginMode); setError(''); }}
            className="font-bold underline hover:text-theme-secondary transition-colors"
          >
            {isLoginMode ? 'Створіть його тут' : 'Увійдіть'}
          </button>
        </div>
      </div>
    </div>
  );
}