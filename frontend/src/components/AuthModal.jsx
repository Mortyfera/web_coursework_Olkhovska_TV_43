import React, { useState, useEffect } from 'react';

export default function AuthModal({ isOpen, onClose, setIsLoggedIn }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setIsEmailSent(false);
      setError('');
      setFormData({ username: '', email: '', password: '' });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!isLoginMode && !formData.email.endsWith('@gmail.com')) {
      setError('Дозволена реєстрація тільки через @gmail.com');
      return;
    }

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
        if (isLoginMode) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('username', data.username);
          setIsLoggedIn(true);
          onClose();
        } else {
          setIsEmailSent(true);
        }
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

        {isEmailSent ? (
          <div className="text-center py-6 animate-fadeIn">
            <div className="text-6xl mb-6">📧</div>
            <h2 className="text-2xl font-serif font-bold italic mb-4">Підтвердіть пошту</h2>
            <p className="opacity-80 mb-8">
              Ми відправили лист на <strong>{formData.email}</strong>. 
              Перейдіть за посиланням у листі, щоб активувати свій акаунт.
            </p>
            <button 
              onClick={onClose}
              className="w-full bg-theme-secondary text-theme-primary font-bold py-3 rounded-lg hover:opacity-90 transition-opacity shadow-md"
            >
              Зрозуміло
            </button>
          </div>
        ) : (
          <>
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
                  <label className="block text-sm font-medium mb-1 opacity-80">Email (тільки Gmail)</label>
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
          </>
        )}
      </div>
    </div>
  );
}