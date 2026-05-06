import React, { useState, useEffect } from 'react';

export default function UserProfile({ goBack }) {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [booksCount, setBooksCount] = useState(0);
  const [userClubs, setUserClubs] = useState([]);
  
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

          const shelfRes = await fetch('http://127.0.0.1:8000/api/bookshelf/', {
            headers: { 'Authorization': `Token ${token}` }
          });
          const shelfData = await shelfRes.json();
          setBooksCount((shelfData.results || shelfData).length);

          const [membersRes, allClubsRes] = await Promise.all([
            fetch('http://127.0.0.1:8000/api/club-members/', { headers: { 'Authorization': `Token ${token}` } }),
            fetch('http://127.0.0.1:8000/api/clubs/', { headers: { 'Authorization': `Token ${token}` } })
          ]);

          const membersData = await membersRes.json();
          const allClubsData = await allClubsRes.json();

          const memberships = (membersData.results || membersData).filter(m => Number(m.user) === currentUserId);
          const allClubs = allClubsData.results || allClubsData;

          const combinedClubs = allClubs.filter(club => {
            const isCreator = Number(club.creator) === currentUserId;
            const isMember = memberships.some(m => Number(m.club) === Number(club.id));
            return isCreator || isMember;
          }).map(club => {
            const isCreator = Number(club.creator) === currentUserId;
            const membership = memberships.find(m => Number(m.club) === Number(club.id));
            
            let roleLabel = "Учасник";
            let roleCode = "MB";

            if (isCreator) {
              roleLabel = "Власник";
              roleCode = "OWNER";
            } else if (membership?.role === 'AD') {
              roleLabel = "Адмін";
              roleCode = "AD";
            }

            return {
              id: club.id,
              name: club.name,
              role: roleLabel,
              roleCode: roleCode
            };
          });

          setUserClubs(combinedClubs);
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
      alert("Паролі не збігаються!"); return;
    }
    alert("Запит на зміну пароля відправлено.");
    setIsChangingPassword(false);
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

            <div className="w-full border-t border-theme-secondary/10 pt-6">
              <h3 className="text-xs uppercase tracking-widest font-bold text-theme-secondary opacity-40 mb-4">Мої Клуби</h3>
              {userClubs.length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {userClubs.map(clubInfo => (
                    <div key={clubInfo.id} className="flex justify-between items-center bg-theme-background/50 p-3 rounded-lg border border-theme-secondary/5 hover:border-theme-secondary/20 transition-all">
                      <span className="font-serif text-theme-secondary truncate mr-2 text-sm">{clubInfo.name}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-bold shrink-0 border ${
                        clubInfo.roleCode === 'OWNER' 
                        ? 'bg-amber-500/10 text-amber-600 border-amber-500/30' 
                        : clubInfo.roleCode === 'AD'
                        ? 'bg-blue-500/10 text-blue-600 border-blue-500/30'
                        : 'bg-theme-secondary/5 text-theme-secondary border-theme-secondary/20'
                      }`}>
                        {clubInfo.role}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm italic opacity-50 text-theme-secondary">Ще не в жодному клубі</p>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-10">
            
            <section>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs uppercase tracking-widest font-bold text-theme-secondary opacity-40">Особисті дані</h3>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="text-sm text-theme-secondary underline opacity-60 hover:opacity-100 transition-opacity">Редагувати</button>
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
                  <input type="password" placeholder="Старий пароль" className="w-full bg-theme-primary border border-theme-secondary/20 rounded-lg p-2 text-theme-secondary outline-none focus:border-theme-secondary" />
                  <input type="password" placeholder="Новий пароль" className="w-full bg-theme-primary border border-theme-secondary/20 rounded-lg p-2 text-theme-secondary outline-none focus:border-theme-secondary" />
                  <input type="password" placeholder="Підтвердіть пароль" className="w-full bg-theme-primary border border-theme-secondary/20 rounded-lg p-2 text-theme-secondary outline-none focus:border-theme-secondary" />
                  <div className="flex gap-4 pt-2">
                    <button onClick={handleChangePassword} className="px-6 py-2 bg-theme-secondary text-theme-primary rounded-lg font-bold hover:opacity-90 transition-opacity">Оновити пароль</button>
                    <button onClick={() => setIsChangingPassword(false)} className="px-6 py-2 text-theme-secondary opacity-60 hover:opacity-100 transition-opacity">Скасувати</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setIsChangingPassword(true)} className="px-6 py-2 border border-theme-secondary/20 text-theme-secondary rounded-lg hover:bg-theme-secondary/5 transition-colors">Змінити пароль</button>
              )}
            </section>

            <section className="pt-10 border-t border-theme-secondary/10">
              <div className="flex items-center justify-between bg-theme-secondary/5 p-8 rounded-3xl transition-colors">
                <div className="text-center md:text-left">
                  <h4 className="text-4xl font-serif text-theme-secondary italic">{booksCount}</h4>
                  <p className="text-sm opacity-60 text-theme-secondary">книг у колекції</p>
                </div>
                <div className="text-center md:text-right">
                  <h4 className="text-4xl font-serif text-theme-secondary italic">{userClubs.length}</h4>
                  <p className="text-sm opacity-60 text-theme-secondary">активних клубів</p>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}