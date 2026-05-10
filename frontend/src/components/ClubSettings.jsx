import React from 'react';

export default function ClubSettings({ 
  club, 
  settingsData, 
  setSettingsData, 
  clubBooks, 
  joinRequests, 
  members, 
  isOwner, 
  handleSaveSettings, 
  handleRequestAction, 
  handleRemoveMember, 
  handlePromoteMember, 
  handleDemoteMember 
}) {
  return (
    <div className="flex-1 h-full overflow-y-auto p-8 sm:p-16 custom-scrollbar">
      <div className="max-w-5xl mx-auto bg-theme-primary rounded-3xl p-10 shadow-lg border border-theme-secondary/10">
        <h2 className="text-4xl font-serif font-bold text-theme-secondary mb-10 italic">Налаштування клубу</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          <div>
            <h3 className="text-xl font-bold text-theme-secondary mb-6 border-b border-theme-secondary/10 pb-2">Загальна інформація</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm text-theme-secondary opacity-80 mb-1">Назва клубу</label>
                <input type="text" value={settingsData.name} onChange={(e) => setSettingsData({...settingsData, name: e.target.value})} className="w-full bg-theme-background border border-theme-secondary/30 rounded p-2 text-theme-secondary focus:outline-none focus:border-theme-secondary" />
              </div>
              <div>
                <label className="block text-sm text-theme-secondary opacity-80 mb-1">Опис</label>
                <textarea value={settingsData.description} onChange={(e) => setSettingsData({...settingsData, description: e.target.value})} className="w-full bg-theme-background border border-theme-secondary/30 rounded p-2 text-theme-secondary focus:outline-none focus:border-theme-secondary h-32 resize-none custom-scrollbar" />
              </div>
              <div>
                <label className="block text-sm text-theme-secondary opacity-80 mb-1">Формат зустрічей</label>
                <select value={settingsData.format} onChange={(e) => setSettingsData({...settingsData, format: e.target.value})} className="w-full bg-theme-background border border-theme-secondary/30 rounded p-2 text-theme-secondary focus:outline-none focus:border-theme-secondary">
                  <option value="ON">Онлайн</option>
                  <option value="OF">Офлайн</option>
                  <option value="HY">Гібрид</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-theme-secondary opacity-80 mb-1">Поточна книга</label>
                <select value={settingsData.currently_reading} onChange={(e) => setSettingsData({...settingsData, currently_reading: e.target.value})} className="w-full bg-theme-background border border-theme-secondary/30 rounded p-2 text-theme-secondary focus:outline-none focus:border-theme-secondary">
                  <option value="">Не обрано</option>
                  {clubBooks.map(book => (<option key={book.id} value={book.title}>{book.title}</option>))}
                </select>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <input type="checkbox" id="isOpenCheckbox" checked={settingsData.is_open} onChange={(e) => setSettingsData({...settingsData, is_open: e.target.checked})} className="w-5 h-5 accent-theme-secondary" />
                <label htmlFor="isOpenCheckbox" className="text-theme-secondary font-medium cursor-pointer">Відкритий клуб (вільний вступ)</label>
              </div>
              {!settingsData.is_open && <p className="text-xs text-theme-secondary opacity-60 mt-[-10px] ml-8">Користувачі зможуть подати заявку на вступ, яку вам потрібно буде схвалити.</p>}
              <button onClick={handleSaveSettings} className="mt-4 w-full bg-theme-secondary text-theme-primary font-bold py-3 rounded-lg hover:opacity-90 transition-opacity shadow-md">Зберегти зміни</button>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-theme-secondary mb-6 border-b border-theme-secondary/10 pb-2">Керування учасниками</h3>
            {!settingsData.is_open && (
              <div className="mb-8">
                <h4 className="font-bold text-theme-secondary mb-3 opacity-80 text-sm uppercase">Нові заявки ({joinRequests.length})</h4>
                {joinRequests.length === 0 ? <p className="text-sm opacity-60 italic text-theme-secondary">Немає нових заявок.</p> : (
                  <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                    {joinRequests.map((req) => (
                      <div key={req.id} className="flex justify-between items-center bg-theme-background border border-theme-secondary/20 p-3 rounded-md">
                        <span className="font-serif font-bold text-theme-secondary">{req.user?.username || req.username || 'Невідомий'}</span>
                        <div className="flex gap-2">
                          <button onClick={() => handleRequestAction(req.id, 'accept')} className="text-green-600 bg-green-100 hover:bg-green-200 px-3 py-1 rounded text-xs font-bold transition-colors">Прийняти</button>
                          <button onClick={() => handleRequestAction(req.id, 'reject')} className="text-red-600 bg-red-100 hover:bg-red-200 px-3 py-1 rounded text-xs font-bold transition-colors">Відхилити</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            <div>
              <h4 className="font-bold text-theme-secondary mb-3 opacity-80 text-sm uppercase">Поточні учасники</h4>
              <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                <div className="flex justify-between items-center bg-theme-secondary/5 border border-theme-secondary/10 p-3 rounded-md">
                  <div><span className="font-serif font-bold text-theme-secondary">{club?.creator_details?.username || 'Admin'}</span><span className="ml-2 text-xs bg-theme-secondary text-white px-2 py-0.5 rounded-full">Власник</span></div>
                </div>
                {members.filter(m => m.username !== club?.creator_details?.username).length === 0 ? <p className="text-sm opacity-60 italic text-theme-secondary mt-2">Більше немає учасників.</p> : (
                  members.filter(m => m.username !== club?.creator_details?.username).map((member) => (
                    <div key={member.id} className="flex justify-between items-center bg-theme-background border border-theme-secondary/10 p-3 rounded-md">
                      <span className="font-serif font-medium text-theme-secondary">{member.username}</span>
                      <div className="flex gap-2 items-center">
                        {member.role === 'AD' ? (
                           <><span className="text-xs font-bold text-theme-secondary opacity-70 mr-2">Адмін</span>{isOwner && <button onClick={() => handleDemoteMember(member.id)} className="text-theme-secondary bg-theme-secondary/10 hover:bg-theme-secondary/20 px-2 py-1 rounded text-xs transition-colors mr-2">↓ Зняти</button>}</>
                        ) : (
                           <>{isOwner && <button onClick={() => handlePromoteMember(member.id)} className="text-theme-secondary bg-theme-secondary/10 hover:bg-theme-secondary/20 px-2 py-1 rounded text-xs transition-colors mr-2">↑ Адмін</button>}</>
                        )}
                        <button onClick={() => handleRemoveMember(member.id)} className="text-red-500 hover:text-red-700 px-2 py-1 rounded text-lg font-bold transition-colors">&times;</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {isOwner && <div className="mt-12 border-t border-red-500/20 pt-6"><button className="w-full py-3 border border-red-500 text-red-500 font-bold rounded-lg hover:bg-red-500 hover:text-white transition-colors">Видалити клуб назавжди</button></div>}
          </div>
          
          {isOwner && (
            <div className="col-span-1 md:col-span-2 border-t border-theme-secondary/10 pt-8 mt-2">
              <h3 className="text-xl font-bold text-theme-secondary mb-4">Права адміністраторів</h3>
              <p className="text-sm opacity-70 mb-6 text-theme-secondary">Оберіть, що дозволено робити адміністраторам клубу (ці налаштування не стосуються власника):</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <label className="flex items-start gap-3 cursor-pointer group">
                   <input type="checkbox" checked={settingsData.admin_can_edit_design} onChange={(e) => setSettingsData({...settingsData, admin_can_edit_design: e.target.checked})} className="w-5 h-5 mt-0.5 accent-theme-secondary checkbox-custom" />
                   <span className="text-theme-secondary font-medium group-hover:opacity-80 transition-opacity">Редагувати дизайн простору клубу</span>
                 </label>
                 <label className="flex items-start gap-3 cursor-pointer group">
                   <input type="checkbox" checked={settingsData.admin_can_manage_books} onChange={(e) => setSettingsData({...settingsData, admin_can_manage_books: e.target.checked})} className="w-5 h-5 mt-0.5 accent-theme-secondary checkbox-custom" />
                   <span className="text-theme-secondary font-medium group-hover:opacity-80 transition-opacity">Керувати полицею (додавати/видаляти книги)</span>
                 </label>
                 <label className="flex items-start gap-3 cursor-pointer group">
                   <input type="checkbox" checked={settingsData.admin_can_remove_members} onChange={(e) => setSettingsData({...settingsData, admin_can_remove_members: e.target.checked})} className="w-5 h-5 mt-0.5 accent-theme-secondary checkbox-custom" />
                   <span className="text-theme-secondary font-medium group-hover:opacity-80 transition-opacity">Видаляти звичайних учасників</span>
                 </label>
              </div>
              <button onClick={handleSaveSettings} className="mt-8 px-8 py-2 bg-theme-secondary/10 border border-theme-secondary/30 text-theme-secondary font-bold rounded-lg hover:bg-theme-secondary hover:text-theme-primary transition-colors shadow-sm">
                Зберегти права
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}