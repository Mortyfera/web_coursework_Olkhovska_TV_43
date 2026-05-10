import React, { useState, useEffect } from 'react';

export default function UserProfile({ goBack }) {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const [editForm, setEditForm] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    avatar_url: '',
    avatar_zoom: 100,
    avatar_pos_x: 50,
    avatar_pos_y: 50
  });

  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const currentUsername = localStorage.getItem('username');
      if (!token) { setIsLoading(false); return; }

      try {
        const userRes = await fetch('http://127.0.0.1:8000/api/users/', {
          headers: { 'Authorization': `Token ${token}` }
        });
        const users = await userRes.json();
        const usersList = users.results || users;
        const currentUser = usersList.find(u => u.username === currentUsername);

        if (currentUser) {
          setUser(currentUser);
          const currentUserId = Number(currentUser.id);
          setUserId(currentUserId);
          
          setEditForm(prev => ({
            ...prev,
            username: currentUser.username || '',
            first_name: currentUser.first_name || '',
            last_name: currentUser.last_name || '',
            email: currentUser.email || '',
            avatar_url: currentUser.avatar_url || '',
          }));
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError('Помилка завантаження даних.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/users/${userId}/`, {
        method: 'PATCH',
        headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (response.ok) {
        const updated = await response.json();
        setUser(updated);
        setIsEditing(false);
      }
    } catch (err) { setError('Помилка збереження.'); }
    finally { setIsSaving(false); }
  };

  const handleChangePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      alert("Нові паролі не збігаються!"); 
      return;
    }
    if (!passwordForm.old_password || !passwordForm.new_password) {
      alert("Будь ласка, заповніть всі поля.");
      return;
    }

    const token = localStorage.getItem('token');
  
    try {
      const response = await fetch('http://127.0.0.1:8000/api/change-password/', {
        method: 'POST',
        headers: { 
          'Authorization': `Token ${token}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          old_password: passwordForm.old_password,
          new_password: passwordForm.new_password
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert("Пароль успішно змінено!");
        setIsChangingPassword(false);
        setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
      } else {
        alert(`Помилка: ${data.error || 'Не вдалося змінити пароль'}`);
      }
    } catch (err) {
      alert("Помилка з'єднання з сервером.");
    }
  };

  if (isLoading) return <div className="p-20 text-center font-serif text-theme-secondary bg-theme-background h-screen">Завантаження...</div>;

  return (
    <div className="flex-1 w-full h-full overflow-y-auto p-4 sm:p-8 md:p-16 bg-theme-background transition-colors duration-500">
      <div className="max-w-6xl mx-auto bg-theme-primary rounded-3xl p-8 sm:p-12 shadow-xl border border-theme-secondary/10 relative transition-colors duration-500">
        
        <button onClick={goBack} className="mb-8 text-theme-secondary opacity-60 hover:opacity-100 font-serif flex items-center gap-2">&larr; Назад</button>

        <div className="flex flex-col lg:flex-row gap-12">
          
          <div className="lg:w-1/3 flex flex-col items-center lg:items-start">
            <div 
              className="w-48 h-48 rounded-full border-4 border-theme-secondary/20 shadow-inner overflow-hidden mb-6 bg-theme-background"
              style={{
                backgroundImage: `url(${isEditing ? editForm.avatar_url : user?.avatar_url})`,
                backgroundSize: `${editForm.avatar_zoom}%`,
                backgroundPosition: `${editForm.avatar_pos_x}% ${editForm.avatar_pos_y}%`,
                backgroundRepeat: 'no-repeat'
              }}
            >
              {!user?.avatar_url && !editForm.avatar_url && (
                <div className="w-full h-full flex items-center justify-center text-6xl font-serif text-theme-secondary opacity-20">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {isEditing && (
              <div className="w-full space-y-3 mb-6 bg-theme-secondary/5 p-4 rounded-xl">
                <label className="text-[10px] uppercase tracking-widest opacity-60">Масштаб</label>
                <input type="range" name="avatar_zoom" min="100" max="300" value={editForm.avatar_zoom} onChange={handleInputChange} className="w-full accent-theme-secondary cursor-pointer" />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest opacity-60">Позиція X</label>
                    <input type="range" name="avatar_pos_x" min="0" max="100" value={editForm.avatar_pos_x} onChange={handleInputChange} className="w-full accent-theme-secondary cursor-pointer" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest opacity-60">Позиція Y</label>
                    <input type="range" name="avatar_pos_y" min="0" max="100" value={editForm.avatar_pos_y} onChange={handleInputChange} className="w-full accent-theme-secondary cursor-pointer" />
                  </div>
                </div>
              </div>
            )}

            <h2 className="text-3xl font-serif font-bold italic text-theme-secondary mb-1 truncate w-full text-center lg:text-left">{user?.username}</h2>
            <p className="text-theme-secondary opacity-60 font-serif mb-8 transition-colors duration-500">Читач MarginNotes</p>
          </div>

          <div className="flex-1 space-y-10">
            
            <section>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h3 className="text-xs uppercase tracking-widest font-bold text-theme-secondary opacity-40">Особисті дані</h3>
                
                {!isEditing && (
                  <button 
                    onClick={() => setIsEditing(true)} 
                    className="px-6 py-2 bg-[#4A554E] text-white rounded-lg font-medium shadow-md hover:bg-[#3A453E] transition-all"
                  >
                    Редагувати профіль
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-theme-background/30 p-6 rounded-2xl border border-theme-secondary/10 transition-colors">
                  <div className="space-y-2">
                    <label className="text-xs opacity-60 text-theme-secondary">Ім'я</label>
                    <input name="first_name" value={editForm.first_name} onChange={handleInputChange} className="w-full bg-theme-primary border border-theme-secondary/20 rounded-lg p-2 text-theme-secondary outline-none focus:border-theme-secondary transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs opacity-60 text-theme-secondary">Прізвище</label>
                    <input name="last_name" value={editForm.last_name} onChange={handleInputChange} className="w-full bg-theme-primary border border-theme-secondary/20 rounded-lg p-2 text-theme-secondary outline-none focus:border-theme-secondary transition-colors" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs opacity-60 text-theme-secondary">Посилання на аватар (URL)</label>
                    <input name="avatar_url" value={editForm.avatar_url} onChange={handleInputChange} className="w-full bg-theme-primary border border-theme-secondary/20 rounded-lg p-2 text-theme-secondary outline-none focus:border-theme-secondary transition-colors" />
                  </div>
                  <div className="md:col-span-2 flex gap-4 pt-4">
                    <button onClick={handleSave} disabled={isSaving} className="px-6 py-2 bg-[#4A554E] text-white rounded-lg hover:bg-[#3A453E] transition-all disabled:opacity-50">
                      {isSaving ? 'Зберігаємо...' : 'Зберегти зміни'}
                    </button>
                    <button onClick={() => setIsEditing(false)} className="px-6 py-2 border border-theme-secondary/20 text-theme-secondary rounded-lg hover:bg-theme-secondary/5 transition-colors">Скасувати</button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <p className="text-[10px] uppercase opacity-40 text-theme-secondary">Повне ім'я</p>
                    <p className="text-lg font-serif text-theme-secondary">{user?.first_name} {user?.last_name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase opacity-40 text-theme-secondary">Email</p>
                    <p className="text-lg font-serif text-theme-secondary">{user?.email}</p>
                  </div>
                </div>
              )}
            </section>

            <section className="pt-10 border-t border-theme-secondary/10">
              <h3 className="text-xs uppercase tracking-widest font-bold text-theme-secondary opacity-40 mb-6">Безпека</h3>
              {isChangingPassword ? (
                <div className="space-y-4 max-w-md bg-theme-background/30 p-6 rounded-2xl border border-theme-secondary/10 animate-fadeIn">
                  <input 
                    type="password" 
                    name="old_password"
                    value={passwordForm.old_password}
                    onChange={handlePasswordChange}
                    placeholder="Старий пароль" 
                    className="w-full bg-theme-primary border border-theme-secondary/20 rounded-lg p-2 text-theme-secondary outline-none focus:border-theme-secondary" 
                  />
                  <input 
                    type="password" 
                    name="new_password"
                    value={passwordForm.new_password}
                    onChange={handlePasswordChange}
                    placeholder="Новий пароль" 
                    className="w-full bg-theme-primary border border-theme-secondary/20 rounded-lg p-2 text-theme-secondary outline-none focus:border-theme-secondary" 
                  />
                  <input 
                    type="password" 
                    name="confirm_password"
                    value={passwordForm.confirm_password}
                    onChange={handlePasswordChange}
                    placeholder="Підтвердіть пароль" 
                    className="w-full bg-theme-primary border border-theme-secondary/20 rounded-lg p-2 text-theme-secondary outline-none focus:border-theme-secondary" 
                  />
                  <div className="flex gap-4 pt-2">
                    <button onClick={handleChangePassword} className="px-6 py-2 bg-theme-secondary text-theme-primary rounded-lg font-bold hover:opacity-90 transition-opacity">Оновити пароль</button>
                    <button onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
                    }} className="px-6 py-2 text-theme-secondary opacity-60 hover:opacity-100 transition-opacity">Скасувати</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setIsChangingPassword(true)} className="px-6 py-2 border border-theme-secondary/20 text-theme-secondary rounded-lg hover:bg-theme-secondary/5 transition-colors">Змінити пароль</button>
              )}
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}