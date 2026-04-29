import React, { useState, useRef, useEffect } from 'react';

import catIcon from '../assets/user_icon_cat.png'; 
import sparkleIcon from '../assets/star.png';
import myLogo from '../assets/logo_fonless.png';
import el1 from '../assets/el1.png';
import el2 from '../assets/el2.png';
import el3 from '../assets/el3.png';
import el4 from '../assets/el4.png';
import el5 from '../assets/el5.png';
import el6 from '../assets/el6.png';
import el7 from '../assets/el7.png';
import el8 from '../assets/el8.png';
import el9 from '../assets/el9.png';
import el10 from '../assets/el10.png';

const availableStickers = [
  { id: 'cat', src: catIcon, alt: 'Котик' },
  { id: 'sparkle', src: sparkleIcon, alt: 'Зірочка' },
  { id: 'logo', src: myLogo, alt: 'Логотип' },
  { id: 'el1', src: el1, alt: 'Машинка' },
  { id: 'el2', src: el2, alt: 'Читачі' },
  { id: 'el3', src: el3, alt: 'Перо' },
  { id: 'el4', src: el4, alt: 'Блокнот' },
  { id: 'el5', src: el5, alt: 'Дівчина' },
  { id: 'el6', src: el6, alt: 'Книжки' },
  { id: 'el7', src: el7, alt: 'Квітка 1' },
  { id: 'el8', src: el8, alt: 'Квітка 2' },
  { id: 'el9', src: el9, alt: 'Квітка 3' },
  { id: 'el10', src: el10, alt: 'Квітка 4' }
];

const fontOptions = [
  { label: 'Serif (Класика)', value: 'serif' },
  { label: 'Sans-serif (Сучасний)', value: 'sans-serif' },
  { label: 'Monospace (Код)', value: 'monospace' },
  { label: 'Cursive (Рукописний)', value: 'cursive' }
];

const spineColors = ['bg-[#3b4a59]', 'bg-[#8b5cf6]', 'bg-[#d97706]', 'bg-[#2563eb]', 'bg-[#10b981]', 'bg-[#0f766e]', 'bg-[#dc2626]', 'bg-[#6d28d9]', 'bg-[#334155]', 'bg-[#8b5cf6]'];
const spineHeights = ['h-[190px]', 'h-[210px]', 'h-[195px]', 'h-[210px]', 'h-[185px]', 'h-[205px]', 'h-[190px]', 'h-[210px]', 'h-[195px]', 'h-[210px]']; 

export default function ClubDetailPage({ club, goBack }) {
  const currentUsername = localStorage.getItem('username');
  const isOwner = club?.creator_details?.username === currentUsername;
  const isStaff = club?.user_role === 'AD';
  
  const isAdmin = isOwner || isStaff;

  const [activeTab, setActiveTab] = useState('workspace');
  const [selectedBook, setSelectedBook] = useState(null);
  
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [clubBooks, setClubBooks] = useState([]);

  const [isEditMode, setIsEditMode] = useState(false);
  const [hasCustomDesign, setHasCustomDesign] = useState(false);
  
  const [customBg, setCustomBg] = useState(null);
  const [bgPattern, setBgPattern] = useState('dots'); 
  const [bgColor, setBgColor] = useState('transparent');
  
  const [elements, setElements] = useState([]);
  const [draggingId, setDraggingId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  // ОНОВЛЕННЯ: Стейт для форми налаштувань
  const [settingsData, setSettingsData] = useState({
    name: '',
    description: '',
    format: 'ON',
    is_open: true
  });
  
  const containerRef = useRef(null);
  const scrollRef = useRef(null);
  
  const dragPos = useRef({ x: 0, y: 0 });
  const dragStart = useRef({ mouseX: 0, mouseY: 0, scrollX: 0, scrollY: 0, elX: 0, elY: 0 }); 

  useEffect(() => {
    if (club?.custom_design) {
      const design = club.custom_design;
      setElements(design.elements || []);
      setCustomBg(design.customBg || null);
      setBgPattern(design.bgPattern || 'dots');
      setBgColor(design.bgColor || 'transparent');
      setHasCustomDesign(true);
    } else {
      setElements([
        { id: '1', type: 'header', content: club?.name || 'Назва клубу', x: 50, y: 50, scale: 1, rotation: 0 },
        { id: '2', type: 'book', content: club?.currently_reading || 'Поточна книга', x: 50, y: 150, scale: 1, rotation: 0 },
        { id: '3', type: 'info', content: `Учасників: ${club?.members_count || 0}`, x: 50, y: 350, scale: 1, rotation: 0 }
      ]);
      setHasCustomDesign(false);
    }

    if (club?.books) {
      setClubBooks(club.books);
    }

    // Заповнюємо форму налаштувань поточними даними
    if (club) {
      setSettingsData({
        name: club.name || '',
        description: club.description || '',
        format: club.format || 'ON',
        is_open: club.is_open !== undefined ? club.is_open : true
      });
    }
  }, [club]);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      fetch(`http://127.0.0.1:8000/api/books/?search=${searchQuery}`)
        .then(res => res.json())
        .then(data => {
          setSearchResults(data.results || data || []);
        })
        .catch(err => console.error("Помилка пошуку:", err));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleAddBook = (bookToAdd) => {
    const currentBookIds = clubBooks.map(b => b.id);
    if (currentBookIds.includes(bookToAdd.id)) {
      alert("Ця книга вже є на полиці клубу!");
      return;
    }
    const newBookIds = [...currentBookIds, bookToAdd.id];
    const token = localStorage.getItem('token');

    fetch(`http://127.0.0.1:8000/api/clubs/${club.id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      body: JSON.stringify({ book_ids: newBookIds })
    })
    .then(res => {
      if (res.ok) {
        setClubBooks([...clubBooks, bookToAdd]);
        setIsAddBookModalOpen(false);
        setSearchQuery('');
      } else {
        alert("Помилка при додаванні книги.");
      }
    })
    .catch(err => console.error("Помилка:", err));
  };

  const handleRemoveBook = (bookId) => {
    if (!window.confirm("Ви впевнені, що хочете видалити цю книгу з полиці клубу?")) return;

    const newBookIds = clubBooks.filter(b => b.id !== bookId).map(b => b.id);
    const token = localStorage.getItem('token');

    fetch(`http://127.0.0.1:8000/api/clubs/${club.id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      body: JSON.stringify({ book_ids: newBookIds })
    })
    .then(res => {
      if (res.ok) {
        setClubBooks(clubBooks.filter(b => b.id !== bookId));
      } else {
        alert("Помилка при видаленні книги.");
      }
    })
    .catch(err => console.error("Помилка:", err));
  };

  const handleSaveDesign = () => {
    const designToSave = { elements, customBg, bgPattern, bgColor };
    const token = localStorage.getItem('token');
    
    fetch(`http://127.0.0.1:8000/api/clubs/${club.id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      body: JSON.stringify({ custom_design: designToSave })
    })
    .then(res => {
      if (res.ok) {
        setIsEditMode(false);
        setSelectedId(null);
        setHasCustomDesign(true);
      } else {
        alert("Помилка збереження на сервері. Перевірте, чи ви увійшли в акаунт адміністратора.");
      }
    })
    .catch(err => console.error("Помилка мережі:", err));
  };

  // ОНОВЛЕННЯ: Функція збереження налаштувань клубу
  const handleSaveSettings = () => {
    const token = localStorage.getItem('token');
    
    fetch(`http://127.0.0.1:8000/api/clubs/${club.id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      body: JSON.stringify(settingsData)
    })
    .then(res => {
      if (res.ok) {
        alert("Налаштування успішно збережено!");
      } else {
        alert("Помилка збереження на сервері.");
      }
    })
    .catch(err => console.error("Помилка мережі:", err));
  };

  const handleResetDesign = () => {
    const token = localStorage.getItem('token');
    fetch(`http://127.0.0.1:8000/api/clubs/${club.id}/`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      body: JSON.stringify({ custom_design: null })
    })
    .then(res => {
      if (res.ok) {
        setHasCustomDesign(false);
        setIsEditMode(false);
        setCustomBg(null);
        setBgPattern('dots');
        setBgColor('transparent');
        setElements([
          { id: '1', type: 'header', content: club?.name || 'Назва клубу', x: 50, y: 50, scale: 1, rotation: 0 },
          { id: '2', type: 'book', content: club?.currently_reading || 'Поточна книга', x: 50, y: 150, scale: 1, rotation: 0 },
          { id: '3', type: 'info', content: `Учасників: ${club?.members_count || 0}`, x: 50, y: 350, scale: 1, rotation: 0 }
        ]);
      }
    });
  };

  const handleMouseDown = (e, id) => {
    if (!isEditMode) return;
    e.stopPropagation();
    setSelectedId(id);

    const currentEl = elements.find(item => item.id === id);
    if (!currentEl) return;

    dragStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      scrollX: scrollRef.current ? scrollRef.current.scrollLeft : 0,
      scrollY: scrollRef.current ? scrollRef.current.scrollTop : 0,
      elX: currentEl.x,
      elY: currentEl.y
    };

    setDraggingId(id);
    dragPos.current = { x: currentEl.x, y: currentEl.y };
  };

  const handleMouseMove = (e) => {
    if (!draggingId || !isEditMode) return;

    if (scrollRef.current) {
        const rect = scrollRef.current.getBoundingClientRect();
        const buffer = 60; 
        const scrollSpeed = 20;

        if (e.clientY > rect.bottom - buffer) {
            scrollRef.current.scrollTop += scrollSpeed;
        } else if (e.clientY < rect.top + buffer) {
            scrollRef.current.scrollTop -= scrollSpeed;
        }

        if (e.clientX > rect.right - buffer) {
            scrollRef.current.scrollLeft += scrollSpeed;
        } else if (e.clientX < rect.left + buffer) {
            scrollRef.current.scrollLeft -= scrollSpeed;
        }
    }

    const currentScrollX = scrollRef.current ? scrollRef.current.scrollLeft : 0;
    const currentScrollY = scrollRef.current ? scrollRef.current.scrollTop : 0;

    const deltaX = (e.clientX - dragStart.current.mouseX) + (currentScrollX - dragStart.current.scrollX);
    const deltaY = (e.clientY - dragStart.current.mouseY) + (currentScrollY - dragStart.current.scrollY);

    const newX = dragStart.current.elX + deltaX;
    const newY = dragStart.current.elY + deltaY;

    dragPos.current = { x: newX, y: newY };

    const el = document.getElementById(`draggable-${draggingId}`);
    if (el) {
      el.style.left = `${newX}px`;
      el.style.top = `${newY}px`;
      el.style.willChange = 'left, top';
    }
  };

  const handleMouseUp = () => {
    if (draggingId) {
      setElements(prev => prev.map(el => 
        el.id === draggingId ? { ...el, x: dragPos.current.x, y: dragPos.current.y } : el
      ));
      const el = document.getElementById(`draggable-${draggingId}`);
      if (el) el.style.willChange = 'auto';
      setDraggingId(null);
    }
  };

  const deselectElement = () => {
    if (isEditMode && !draggingId) setSelectedId(null);
  };

  const getSpawnPos = () => {
    const scrollY = scrollRef.current ? scrollRef.current.scrollTop : 0;
    const scrollX = scrollRef.current ? scrollRef.current.scrollLeft : 0;
    const clientHeight = scrollRef.current ? scrollRef.current.clientHeight : 800;
    const clientWidth = scrollRef.current ? scrollRef.current.clientWidth : 800;
    
    const jitter = Math.floor(Math.random() * 40) - 20; 
    
    return { 
        x: scrollX + (clientWidth / 2) - 100 + jitter, 
        y: scrollY + (clientHeight / 2) - 100 + jitter 
    };
  };

  const addSticker = (sticker) => {
    const pos = getSpawnPos();
    const newId = Date.now().toString();
    setElements([...elements, { id: newId, type: 'image', src: sticker.src, alt: sticker.alt, x: pos.x, y: pos.y, scale: 1, rotation: 0 }]);
    setSelectedId(newId);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const pos = getSpawnPos();
        const newId = Date.now().toString();
        setElements([...elements, { 
          id: newId, type: 'image', src: reader.result, alt: 'Завантажене фото', x: pos.x, y: pos.y, scale: 1, rotation: 0 
        }]);
        setSelectedId(newId);
      };
      reader.readAsDataURL(file);
    }
  };

  const addText = () => {
    const pos = getSpawnPos();
    const newId = Date.now().toString();
    setElements([...elements, { 
      id: newId, type: 'text', content: 'Твій текст', x: pos.x, y: pos.y, scale: 1, rotation: 0,
      color: '#F4E7D3', fontFamily: 'serif', fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', textAlign: 'left'
    }]);
    setSelectedId(newId);
  };

  const addBookshelf = () => {
    const pos = getSpawnPos();
    const newId = Date.now().toString();
    setElements([...elements, { 
      id: newId, type: 'bookshelf', x: pos.x, y: pos.y, scale: 1, rotation: 0
    }]);
    setSelectedId(newId);
  };

  const addPoll = () => {
    const pos = getSpawnPos();
    const newId = Date.now().toString();
    setElements([...elements, { 
      id: newId, type: 'poll', x: pos.x, y: pos.y, scale: 1, rotation: 0,
      question: 'Що читаємо наступним?',
      options: [
        { title: 'Прекрасний новий світ', votes: 12 },
        { title: '1984', votes: 8 },
        { title: 'Таємна історія', votes: 4 }
      ]
    }]);
    setSelectedId(newId);
  };

  const updateElement = (id, changes) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...changes } : el));
  };

  const deleteElement = (id) => {
    setElements(prev => prev.filter(el => el.id !== id));
    setSelectedId(null);
  };

  const handleBgUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomBg(reader.result);
        setBgPattern('none');
      };
      reader.readAsDataURL(file);
    }
  };

  const selectedElement = elements.find(el => el.id === selectedId);

  const renderElement = (el, isSelected) => {
    const ringClass = isEditMode 
      ? `transition-all rounded-lg ${isSelected ? 'ring-2 ring-blue-500 ring-offset-4 ring-offset-transparent' : 'hover:ring-2 hover:ring-theme-secondary/50'}` 
      : '';

    const baseStyle = { transform: `scale(${el.scale || 1}) rotate(${el.rotation || 0}deg)`, transformOrigin: 'top left' };

    switch (el.type) {
      case 'header':
        return <h1 className={`font-bold font-serif italic text-theme-secondary drop-shadow-md whitespace-nowrap select-none p-1 ${ringClass}`} style={{ ...baseStyle, fontSize: `${48}px` }}>{el.content}</h1>;
      
      case 'book':
        return (
          <div className={`bg-theme-secondary text-theme-primary p-6 shadow-xl border border-theme-primary/20 backdrop-blur-sm bg-opacity-95 select-none ${ringClass}`} style={baseStyle}>
            <p className="text-sm opacity-80 mb-2">Зараз читаємо:</p>
            <h3 className="font-bold font-serif text-xl whitespace-nowrap">{el.content}</h3>
          </div>
        );
      
      case 'info':
        return (
          <div className={`bg-theme-primary text-theme-secondary p-4 shadow-lg border border-theme-secondary/20 text-center font-medium backdrop-blur-sm bg-opacity-90 select-none whitespace-nowrap ${ringClass}`} style={baseStyle}>
            {el.content}
          </div>
        );

      case 'bookshelf':
        const displayBooks = clubBooks.slice(-10);
        
        return (
          <div className={`flex flex-col items-center select-none drop-shadow-xl p-2 ${ringClass}`} style={baseStyle}>
            <div className="flex items-end justify-center gap-[6px] px-6 relative z-10 w-[660px] h-[220px]">
              {displayBooks.length > 0 ? (
                displayBooks.map((book, idx) => (
                  <div 
                    key={book.id || idx} 
                    onClick={(e) => {
                      if (!isEditMode) {
                        e.stopPropagation(); 
                        setSelectedBook(book);
                        setActiveTab('bookDetail');
                      }
                    }}
                    className={`w-[58px] ${spineHeights[idx % spineHeights.length]} ${spineColors[idx % spineColors.length]} rounded-[2px] shadow-[-3px_0_6px_rgba(0,0,0,0.2)] flex items-center justify-center shrink-0 border-l border-white/10 relative overflow-hidden ${!isEditMode ? 'cursor-pointer hover:-translate-y-4 hover:shadow-xl hover:brightness-110 transition-all duration-300 z-20' : ''}`}
                  >
                    <span 
                      className="text-white/90 text-[14px] font-serif font-medium truncate w-full text-center tracking-wide px-1.5 drop-shadow-sm"
                      style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', maxHeight: '95%' }}
                    >
                      {book.title}
                    </span>
                  </div>
                ))
              ) : (
                <div className="h-40 flex items-end justify-center px-8 pb-4 w-full">
                  <span className="text-theme-secondary/50 font-serif italic text-base">Полиця порожня</span>
                </div>
              )}
            </div>
            
            <div className={`w-[680px] h-[22px] bg-[#4a554e] rounded-full mt-[-1px] relative z-20 shadow-md ${!isEditMode ? 'cursor-pointer hover:brightness-110 transition-all' : ''}`}></div>
            <div className={`w-[650px] h-[8px] bg-[#b4baba] rounded-full mt-1 opacity-80 ${!isEditMode ? 'cursor-pointer' : ''}`}></div>
            
            {!isEditMode && (
              <div className="absolute -bottom-10 bg-theme-secondary text-theme-primary px-4 py-1.5 rounded-md text-sm font-bold opacity-0 hover:opacity-100 transition-opacity shadow-sm whitespace-nowrap cursor-pointer z-50 pointer-events-none">
                Відкрити всі книги
              </div>
            )}
          </div>
        );

      case 'poll':
        const totalVotes = (el.options || []).reduce((acc, curr) => acc + curr.votes, 0);
        return (
          <div className={`bg-theme-primary text-theme-secondary p-6 shadow-xl border border-theme-secondary/20 rounded-xl select-none w-80 ${ringClass}`} style={baseStyle}>
            <h3 className="font-serif font-bold text-xl mb-4 italic text-center break-words">{el.question}</h3>
            
            <div className="flex flex-col gap-3">
              {(el.options || []).map((opt, i) => {
                const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                return (
                  <div key={i} className="relative w-full">
                    <div className="absolute top-0 left-0 h-full bg-theme-secondary/10 rounded-md transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                    <button className="w-full relative z-10 flex justify-between items-center p-3 rounded-md border border-theme-secondary/20 bg-transparent text-sm cursor-pointer hover:border-theme-secondary transition-colors">
                      <span className="font-bold font-serif truncate pr-2">{opt.title || 'Порожній варіант'}</span>
                      <span className="shrink-0">{percentage}%</span>
                    </button>
                  </div>
                )
              })}
            </div>
            
            {!isEditMode && (
              <p className="text-xs text-center opacity-60 mt-4">
                Дедлайн: скоро <br/> (Всього голосів: {totalVotes})
              </p>
            )}
            {isEditMode && (
              <p className="text-xs text-center opacity-50 mt-4 italic">
                *Налаштуйте варіанти в лівому меню
              </p>
            )}
          </div>
        );
      
      case 'text':
        const textStyles = {
          fontSize: `${24}px`, color: el.color || '#F4E7D3', fontFamily: el.fontFamily || 'serif',
          fontWeight: el.fontWeight || 'normal', fontStyle: el.fontStyle || 'normal', textDecoration: el.textDecoration || 'none',
          textAlign: el.textAlign || 'left', width: 'max-content', minWidth: '200px', ...baseStyle
        };

        if (isEditMode) {
          return (
            <textarea 
              value={el.content} 
              onChange={(e) => updateElement(el.id, { content: e.target.value })}
              className={`bg-transparent border-b-2 border-theme-secondary/50 outline-none drop-shadow-sm resize-none overflow-hidden p-1 ${ringClass}`}
              style={{ ...textStyles, height: `${(el.content.split('\n').length + 1) * 28}px` }}
              onMouseDown={(e) => { e.stopPropagation(); setSelectedId(el.id); }}
              onFocus={() => setSelectedId(el.id)}
            />
          );
        }
        return <div style={textStyles} className={`drop-shadow-sm whitespace-pre-wrap select-none p-1 ${ringClass}`}>{el.content}</div>;

      case 'image':
        return <img src={el.src} alt={el.alt} draggable="false" className={`object-contain drop-shadow-lg select-none p-1 ${ringClass}`} style={{ width: `${96}px`, height: `${96}px`, ...baseStyle }} />;
      
      default:
        return null;
    }
  };

  const getBackgroundStyle = () => {
    let styles = { backgroundColor: bgColor };
    if (customBg) {
      styles.backgroundImage = `url(${customBg})`;
      styles.backgroundSize = 'cover';
      styles.backgroundPosition = 'center';
      styles.backgroundAttachment = 'fixed'; 
    }
    return styles;
  };

  const getPatternClass = () => {
    if (customBg) return '';
    if (bgPattern === 'dots') return 'bg-[radial-gradient(circle,var(--color-secondary)_1px,transparent_1px)] bg-[size:20px_20px] opacity-90';
    if (bgPattern === 'grid') return 'bg-[linear-gradient(to_right,var(--color-secondary)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-secondary)_1px,transparent_1px)] bg-[size:24px_24px] opacity-10';
    return '';
  };

  const maxElY = elements.length > 0 ? Math.max(...elements.map(e => e.y || 0)) : 0;
  const canvasHeight = isEditMode ? Math.max(3000, maxElY + 2000) : Math.max(600, maxElY + 400);

  return (
    <div className="w-full h-screen flex flex-col bg-theme-background transition-colors duration-500 overflow-hidden relative">
      
      {/* ШАПКА */}
      <div className="bg-theme-primary border-b border-theme-secondary/10 px-8 py-4 flex justify-between items-center z-50 shadow-sm shrink-0">
        <div className="flex items-center gap-8">
          <button onClick={goBack} className="text-theme-secondary hover:opacity-70 font-serif font-medium flex items-center gap-2">
            &larr; Назад
          </button>
          
          <div className="flex items-center gap-6 border-l border-theme-secondary/20 pl-8">
            <button 
              onClick={() => { setActiveTab('workspace'); setIsEditMode(false); }}
              className={`font-serif font-bold text-lg transition-colors ${activeTab === 'workspace' ? 'text-theme-secondary border-b-2 border-theme-secondary' : 'text-theme-secondary/60 hover:text-theme-secondary'}`}
            >
              Простір клубу
            </button>
            
            {/* ОНОВЛЕННЯ: Вкладки Полиця більше немає в меню! */}
            
            {/* ОНОВЛЕННЯ: Нова вкладка Налаштування тільки для адмінів */}
            {isAdmin && (
              <button 
                onClick={() => { setActiveTab('settings'); setIsEditMode(false); }}
                className={`font-serif font-bold text-lg transition-colors ${activeTab === 'settings' ? 'text-theme-secondary border-b-2 border-theme-secondary' : 'text-theme-secondary/60 hover:text-theme-secondary'}`}
              >
                Налаштування
              </button>
            )}
          </div>
        </div>

        <div>
          {isAdmin && activeTab === 'workspace' && (
            <button 
              onClick={isEditMode ? handleSaveDesign : () => setIsEditMode(true)}
              className={`px-6 py-2 rounded-md font-bold font-serif transition-colors shadow-md ${
                isEditMode ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-theme-secondary text-theme-primary hover:opacity-80'
              }`}
            >
              {isEditMode ? 'Зберегти дизайн' : 'Редагувати простір'}
            </button>
          )}

          {isAdmin && activeTab === 'bookshelf' && (
            <button 
              onClick={() => setIsAddBookModalOpen(true)}
              className="px-6 py-2 rounded-md font-bold font-serif bg-theme-secondary text-theme-primary hover:opacity-80 transition-opacity shadow-md"
            >
              + Додати книгу
            </button>
          )}
        </div>
      </div>

      {/* ПРОСТІР (РОБОЧА ДОШКА) */}
      {activeTab === 'workspace' && (
        <div className="flex flex-1 overflow-hidden relative">
          
          {isEditMode && (
            <div className="w-80 shrink-0 h-full bg-theme-primary border-r border-theme-secondary/10 p-6 flex flex-col gap-6 shadow-xl z-40 overflow-y-auto pb-32">
              
              {selectedElement && selectedElement.type === 'text' && (
                <div className="bg-theme-secondary/5 p-4 rounded-lg border border-theme-secondary/20 mb-2 shrink-0">
                  <h3 className="font-serif font-bold text-lg text-theme-secondary mb-4 flex justify-between items-center">
                    <span>Текст</span>
                    <button onClick={() => updateElement(selectedElement.id, { scale: 1, rotation: 0 })} className="text-xs opacity-70 underline hover:opacity-100">Скинути розмір/кут</button>
                  </h3>

                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-sm text-theme-secondary opacity-80">Колір:</span>
                    <input 
                      type="color" 
                      value={selectedElement.color || '#F4E7D3'} 
                      onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent"
                    />
                  </div>

                  <div className="mb-4">
                    <span className="block text-sm text-theme-secondary opacity-80 mb-1">Шрифт:</span>
                    <select 
                      value={selectedElement.fontFamily || 'serif'}
                      onChange={(e) => updateElement(selectedElement.id, { fontFamily: e.target.value })}
                      className="w-full bg-theme-background border border-theme-secondary/30 rounded p-1.5 text-sm text-theme-secondary"
                    >
                      {fontOptions.map(font => <option key={font.value} value={font.value}>{font.label}</option>)}
                    </select>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <button 
                      onClick={() => updateElement(selectedElement.id, { fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold' })}
                      className={`flex-1 py-1 rounded font-bold border ${selectedElement.fontWeight === 'bold' ? 'bg-theme-secondary text-theme-primary border-theme-secondary' : 'bg-theme-background text-theme-secondary border-theme-secondary/30 hover:bg-theme-secondary/10'}`}
                    >B</button>
                    <button 
                      onClick={() => updateElement(selectedElement.id, { fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic' })}
                      className={`flex-1 py-1 rounded italic border ${selectedElement.fontStyle === 'italic' ? 'bg-theme-secondary text-theme-primary border-theme-secondary' : 'bg-theme-background text-theme-secondary border-theme-secondary/30 hover:bg-theme-secondary/10'}`}
                    >I</button>
                    <button 
                      onClick={() => updateElement(selectedElement.id, { textDecoration: selectedElement.textDecoration === 'underline' ? 'none' : 'underline' })}
                      className={`flex-1 py-1 rounded underline border ${selectedElement.textDecoration === 'underline' ? 'bg-theme-secondary text-theme-primary border-theme-secondary' : 'bg-theme-background text-theme-secondary border-theme-secondary/30 hover:bg-theme-secondary/10'}`}
                    >U</button>
                  </div>

                  <div className="flex gap-2 mb-2">
                    <button 
                      onClick={() => updateElement(selectedElement.id, { textAlign: 'left' })}
                      className={`flex-1 py-1 text-sm rounded border ${selectedElement.textAlign === 'left' ? 'bg-theme-secondary text-theme-primary border-theme-secondary' : 'bg-theme-background text-theme-secondary border-theme-secondary/30 hover:bg-theme-secondary/10'}`}
                    >Left</button>
                    <button 
                      onClick={() => updateElement(selectedElement.id, { textAlign: 'center' })}
                      className={`flex-1 py-1 text-sm rounded border ${selectedElement.textAlign === 'center' ? 'bg-theme-secondary text-theme-primary border-theme-secondary' : 'bg-theme-background text-theme-secondary border-theme-secondary/30 hover:bg-theme-secondary/10'}`}
                    >Center</button>
                    <button 
                      onClick={() => updateElement(selectedElement.id, { textAlign: 'right' })}
                      className={`flex-1 py-1 text-sm rounded border ${selectedElement.textAlign === 'right' ? 'bg-theme-secondary text-theme-primary border-theme-secondary' : 'bg-theme-background text-theme-secondary border-theme-secondary/30 hover:bg-theme-secondary/10'}`}
                    >Right</button>
                  </div>
                </div>
              )}

              {selectedElement && selectedElement.type === 'poll' && (
                <div className="bg-theme-secondary/5 p-4 rounded-lg border border-theme-secondary/20 mb-2 shrink-0">
                  <h3 className="font-serif font-bold text-lg text-theme-secondary mb-4 flex justify-between items-center">
                    <span>Опитування</span>
                    <button onClick={() => updateElement(selectedElement.id, { scale: 1, rotation: 0 })} className="text-xs opacity-70 underline hover:opacity-100">Скинути розмір/кут</button>
                  </h3>

                  <div className="mb-4">
                    <span className="block text-sm text-theme-secondary opacity-80 mb-1">Питання:</span>
                    <input
                      type="text"
                      value={selectedElement.question || ''}
                      onChange={(e) => updateElement(selectedElement.id, { question: e.target.value })}
                      className="w-full bg-theme-background border border-theme-secondary/30 rounded p-2 text-sm text-theme-secondary focus:outline-none focus:border-theme-secondary"
                      placeholder="Введіть питання..."
                    />
                  </div>

                  <div className="mb-2">
                    <span className="block text-sm text-theme-secondary opacity-80 mb-2">Варіанти відповідей:</span>
                    <div className="flex flex-col gap-2">
                      {(selectedElement.options || []).map((opt, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input
                            type="text"
                            value={opt.title}
                            onChange={(e) => {
                              const newOptions = [...selectedElement.options];
                              newOptions[idx].title = e.target.value;
                              updateElement(selectedElement.id, { options: newOptions });
                            }}
                            className="flex-1 bg-theme-background border border-theme-secondary/30 rounded p-1.5 text-sm text-theme-secondary focus:outline-none focus:border-theme-secondary min-w-0"
                            placeholder="Варіант..."
                          />
                          <button
                            onClick={() => {
                              const newOptions = selectedElement.options.filter((_, i) => i !== idx);
                              updateElement(selectedElement.id, { options: newOptions });
                            }}
                            className="text-red-500 hover:text-red-700 px-2 font-bold transition-colors"
                            title="Видалити варіант"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => {
                        const newOptions = [...(selectedElement.options || []), { title: `Новий варіант`, votes: 0 }];
                        updateElement(selectedElement.id, { options: newOptions });
                      }}
                      className="mt-3 w-full text-xs py-2 border border-theme-secondary/30 rounded-md hover:bg-theme-secondary/10 text-theme-secondary font-bold transition-colors"
                    >
                      + Додати варіант
                    </button>
                  </div>
                </div>
              )}

              <div className="shrink-0">
                <h3 className="font-serif font-bold text-xl text-theme-secondary mb-3">Фон простору</h3>
                
                <div className="flex gap-2 mb-3">
                  <button onClick={() => {setBgPattern('dots'); setCustomBg(null);}} className={`flex-1 py-1 border rounded text-sm ${bgPattern === 'dots' ? 'border-theme-secondary bg-theme-secondary/10' : 'border-theme-secondary/20'}`}>Крапки</button>
                  <button onClick={() => {setBgPattern('grid'); setCustomBg(null);}} className={`flex-1 py-1 border rounded text-sm ${bgPattern === 'grid' ? 'border-theme-secondary bg-theme-secondary/10' : 'border-theme-secondary/20'}`}>Сітка</button>
                  <button onClick={() => {setBgPattern('none'); setCustomBg(null);}} className={`flex-1 py-1 border rounded text-sm ${bgPattern === 'none' ? 'border-theme-secondary bg-theme-secondary/10' : 'border-theme-secondary/20'}`}>Чистий</button>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <span className="text-sm text-theme-secondary opacity-80">Колір фону:</span>
                  <input 
                    type="color" 
                    value={bgColor === 'transparent' ? '#ffffff' : bgColor} 
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent"
                  />
                </div>

                <label className="block w-full text-center bg-theme-secondary/10 text-theme-secondary py-2 rounded-md border border-theme-secondary/20 hover:bg-theme-secondary/20 cursor-pointer transition-colors font-medium text-sm">
                  Завантажити картинку фону
                  <input type="file" accept="image/*" onChange={handleBgUpload} className="hidden" />
                </label>
              </div>

              <div className="shrink-0">
                <h3 className="font-serif font-bold text-xl text-theme-secondary mb-3 mt-4">Елементи</h3>
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button onClick={addText} className="bg-theme-secondary/10 text-theme-secondary py-2 rounded-md border border-theme-secondary/20 hover:bg-theme-secondary/20 transition-colors font-medium text-sm">
                    + Текст
                  </button>
                  <label className="text-center bg-theme-secondary/10 text-theme-secondary py-2 rounded-md border border-theme-secondary/20 hover:bg-theme-secondary/20 transition-colors font-medium text-sm cursor-pointer">
                    + Фото
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  <button onClick={addBookshelf} className="col-span-2 bg-theme-secondary text-theme-primary py-2 rounded-md font-bold font-serif hover:opacity-90 transition-opacity shadow-sm">
                    + Книжкова полиця
                  </button>
                  <button onClick={addPoll} className="col-span-2 bg-theme-secondary/10 text-theme-secondary py-2 rounded-md font-medium text-sm border border-theme-secondary/20 hover:bg-theme-secondary/20 transition-colors">
                    + Опитування
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 pb-4">
                  {availableStickers.map(sticker => (
                    <button 
                      key={sticker.id}
                      onClick={() => addSticker(sticker)}
                      className="flex flex-col items-center justify-center p-3 border border-theme-secondary/20 rounded-lg hover:bg-theme-secondary/10 transition-colors"
                    >
                      <img src={sticker.src} alt={sticker.alt} className="w-10 h-10 object-contain mb-2 mix-blend-multiply" />
                      <span className="text-xs text-theme-secondary opacity-80 text-center">{sticker.alt}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mt-auto pt-6 border-t border-theme-secondary/20 shrink-0">
                <button onClick={handleResetDesign} className="w-full text-red-500 hover:text-red-600 font-medium py-2">
                  Скинути до дефолту
                </button>
              </div>
            </div>
          )}

          <div 
            ref={scrollRef} 
            className="flex-1 h-full overflow-auto relative"
            style={getBackgroundStyle()}
          >
            <div 
              ref={containerRef}
              style={{ minHeight: `${canvasHeight}px` }}
              className={`w-full relative ${getPatternClass()} ${isEditMode ? 'select-none' : ''}`}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onClick={deselectElement}
            >
              {isEditMode && (
                <div className="absolute top-0 left-0 min-w-full min-h-[200vh] pointer-events-none"></div>
              )}
              
              {elements.map((el) => {
                const isSelected = selectedId === el.id;
                return (
                  <div
                    key={el.id}
                    id={`draggable-${el.id}`}
                    onMouseDown={(e) => handleMouseDown(e, el.id)}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isEditMode && el.type === 'bookshelf') {
                        setActiveTab('bookshelf');
                      }
                    }} 
                    style={{
                      position: 'absolute',
                      left: `${el.x}px`,
                      top: `${el.y}px`,
                      cursor: isEditMode 
                        ? (draggingId === el.id ? 'grabbing' : 'grab') 
                        : (el.type === 'bookshelf' ? 'pointer' : 'default'),
                      zIndex: (draggingId === el.id || isSelected) ? 50 : 10
                    }}
                    className="w-max h-max group"
                  >
                    
                    {isEditMode && isSelected && (
                      <div className="absolute -top-14 left-0 bg-white shadow-lg rounded-md border border-gray-200 flex gap-1 p-1 z-50">
                        <button 
                          onMouseDown={(e) => { e.stopPropagation(); updateElement(el.id, { scale: Math.min((el.scale || 1) + 0.2, 5) }); }}
                          className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-bold"
                        >+</button>
                        <button 
                          onMouseDown={(e) => { e.stopPropagation(); updateElement(el.id, { scale: Math.max((el.scale || 1) - 0.2, 0.3) }); }}
                          className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-bold"
                        >-</button>
                        
                        <button 
                          onMouseDown={(e) => { e.stopPropagation(); updateElement(el.id, { rotation: (el.rotation || 0) - 15 }); }}
                          className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-bold text-lg"
                          title="Повернути вліво"
                        >↺</button>
                        <button 
                          onMouseDown={(e) => { e.stopPropagation(); updateElement(el.id, { rotation: (el.rotation || 0) + 15 }); }}
                          className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-bold text-lg"
                          title="Повернути вправо"
                        >↻</button>

                        <button 
                          onMouseDown={(e) => { e.stopPropagation(); deleteElement(el.id); }}
                          className="w-8 h-8 flex items-center justify-center bg-red-100 hover:bg-red-200 rounded text-red-600 font-bold ml-1"
                        >🗑</button>
                      </div>
                    )}

                    {renderElement(el, isSelected)}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ВКЛАДКА ПОЛИЦІ (Список усіх обкладинок) */}
      {activeTab === 'bookshelf' && (
        <div className="flex-1 h-full overflow-y-auto p-8 sm:p-16">
          <div className="max-w-6xl mx-auto relative">
            
            {/* Кнопка повернення до простору */}
            <button 
              onClick={() => setActiveTab('workspace')}
              className="absolute -top-4 left-0 text-theme-secondary opacity-60 hover:opacity-100 font-serif font-bold transition-opacity"
            >
              &larr; До простору
            </button>

            <h2 className="text-4xl font-serif font-bold text-theme-secondary mb-10 italic mt-8">Книжкова полиця клубу</h2>
            
            {clubBooks.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {clubBooks.map(book => (
                  <div 
                    key={book.id} 
                    onClick={() => { setSelectedBook(book); setActiveTab('bookDetail'); }}
                    className="bg-theme-primary rounded-xl p-4 shadow-sm border border-theme-secondary/10 hover:shadow-lg transition-all cursor-pointer group hover:-translate-y-1"
                  >
                    <div className="aspect-[2/3] bg-theme-secondary/10 rounded-lg mb-4 overflow-hidden relative">
                      {book.cover_image_url ? (
                        <img src={book.cover_image_url} alt={book.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-theme-secondary opacity-50 font-serif">Обкладинка</div>
                      )}
                      
                      {isAdmin && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleRemoveBook(book.id); }}
                          className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-bold hover:bg-red-600 shadow-md"
                          title="Видалити з полиці"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                    <h3 className="font-bold font-serif text-lg text-theme-secondary line-clamp-1">{book.title}</h3>
                    <p className="text-sm opacity-70 text-theme-secondary">{book.author}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-theme-primary rounded-2xl border border-theme-secondary/10 border-dashed">
                <p className="text-xl font-serif text-theme-secondary opacity-70 mb-4">Полиця поки порожня.</p>
                {isAdmin && (
                  <button 
                    onClick={() => setIsAddBookModalOpen(true)}
                    className="px-6 py-2 rounded-md font-bold font-serif bg-theme-secondary text-theme-primary hover:opacity-80 transition-opacity shadow-md"
                  >
                    Додати першу книгу
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ДЕТАЛІ КНИГИ */}
      {activeTab === 'bookDetail' && selectedBook && (
        <div className="flex-1 h-full overflow-y-auto p-8 sm:p-16">
          <div className="max-w-4xl mx-auto bg-theme-primary rounded-3xl p-10 shadow-lg border border-theme-secondary/10 relative">
            
            <button 
              onClick={() => { setActiveTab('workspace'); setSelectedBook(null); }}
              className="absolute top-6 left-8 text-theme-secondary opacity-60 hover:opacity-100 font-serif font-bold transition-opacity"
            >
              &larr; Закрити деталі
            </button>

            <div className="mt-8 flex flex-col md:flex-row gap-12">
              <div className="w-full md:w-1/3 shrink-0">
                <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-theme-secondary/20">
                   {selectedBook.cover_image_url ? (
                      <img src={selectedBook.cover_image_url} alt={selectedBook.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-theme-secondary/10 flex items-center justify-center text-theme-secondary font-serif">Немає обкладинки</div>
                    )}
                </div>
              </div>

              <div className="w-full md:w-2/3 flex flex-col">
                <h1 className="text-4xl sm:text-5xl font-bold font-serif italic text-theme-secondary mb-2">
                  {selectedBook.title}
                </h1>
                <p className="text-2xl text-theme-secondary opacity-80 font-serif mb-8 border-b border-theme-secondary/10 pb-6">
                  {selectedBook.author}
                </p>

                <h3 className="font-bold text-lg text-theme-secondary mb-2 uppercase tracking-wide opacity-50">Опис</h3>
                <p className="text-lg text-theme-secondary leading-relaxed opacity-90 mb-8 whitespace-pre-wrap">
                  {selectedBook.description || "На жаль, детальний опис для цієї книги ще не додано."}
                </p>

                {isAdmin && (
                  <div className="mt-auto pt-8 flex gap-4">
                    <button 
                      onClick={() => {
                        handleRemoveBook(selectedBook.id);
                        if (clubBooks.find(b => b.id === selectedBook.id)) {
                          setActiveTab('workspace');
                        }
                      }}
                      className="px-6 py-3 border-2 border-red-500 text-red-500 font-bold rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                    >
                      Видалити книгу з клубу
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ОНОВЛЕННЯ: ВКЛАДКА НАЛАШТУВАННЯ КЛУБУ */}
      {activeTab === 'settings' && isAdmin && (
        <div className="flex-1 h-full overflow-y-auto p-8 sm:p-16">
          <div className="max-w-4xl mx-auto bg-theme-primary rounded-3xl p-10 shadow-lg border border-theme-secondary/10">
            <h2 className="text-4xl font-serif font-bold text-theme-secondary mb-10 italic">Налаштування клубу</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              
              {/* Секція 1: Інформація про клуб */}
              <div>
                <h3 className="text-xl font-bold text-theme-secondary mb-6 border-b border-theme-secondary/10 pb-2">Загальна інформація</h3>
                
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm text-theme-secondary opacity-80 mb-1">Назва клубу</label>
                    <input 
                      type="text" 
                      value={settingsData.name}
                      onChange={(e) => setSettingsData({...settingsData, name: e.target.value})}
                      className="w-full bg-theme-background border border-theme-secondary/30 rounded p-2 text-theme-secondary focus:outline-none focus:border-theme-secondary" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-theme-secondary opacity-80 mb-1">Опис</label>
                    <textarea 
                      value={settingsData.description}
                      onChange={(e) => setSettingsData({...settingsData, description: e.target.value})}
                      className="w-full bg-theme-background border border-theme-secondary/30 rounded p-2 text-theme-secondary focus:outline-none focus:border-theme-secondary h-32 resize-none" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-theme-secondary opacity-80 mb-1">Формат зустрічей</label>
                    <select 
                      value={settingsData.format}
                      onChange={(e) => setSettingsData({...settingsData, format: e.target.value})}
                      className="w-full bg-theme-background border border-theme-secondary/30 rounded p-2 text-theme-secondary focus:outline-none focus:border-theme-secondary"
                    >
                      <option value="ON">Онлайн</option>
                      <option value="OF">Офлайн</option>
                      <option value="HY">Гібрид (Онлайн + Офлайн)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3 mt-2">
                    <input 
                      type="checkbox" 
                      id="isOpenCheckbox"
                      checked={settingsData.is_open}
                      onChange={(e) => setSettingsData({...settingsData, is_open: e.target.checked})}
                      className="w-5 h-5 accent-theme-secondary"
                    />
                    <label htmlFor="isOpenCheckbox" className="text-theme-secondary font-medium cursor-pointer">
                      Відкритий клуб (вільний вступ)
                    </label>
                  </div>
                  {!settingsData.is_open && (
                    <p className="text-xs text-theme-secondary opacity-60 mt-[-10px] ml-8">
                      Користувачі зможуть подати заявку на вступ, яку вам потрібно буде схвалити.
                    </p>
                  )}

                  <button 
                    onClick={handleSaveSettings}
                    className="mt-4 w-full bg-theme-secondary text-theme-primary font-bold py-3 rounded-lg hover:opacity-90 transition-opacity shadow-md"
                  >
                    Зберегти зміни
                  </button>
                </div>
              </div>

              {/* Секція 2: Керування учасниками (Mockup) */}
              <div>
                <h3 className="text-xl font-bold text-theme-secondary mb-6 border-b border-theme-secondary/10 pb-2">Керування учасниками</h3>
                
                {!settingsData.is_open && (
                  <div className="mb-8">
                    <h4 className="font-bold text-theme-secondary mb-3 opacity-80 text-sm uppercase">Нові заявки (2)</h4>
                    <div className="flex flex-col gap-2">
                      {['Iryna Koval', 'Oleh Shevchenko'].map((name, i) => (
                        <div key={i} className="flex justify-between items-center bg-theme-background border border-theme-secondary/20 p-3 rounded-md">
                          <span className="font-serif font-bold text-theme-secondary">{name}</span>
                          <div className="flex gap-2">
                            <button className="text-green-600 bg-green-100 hover:bg-green-200 px-3 py-1 rounded text-xs font-bold transition-colors">Прийняти</button>
                            <button className="text-red-600 bg-red-100 hover:bg-red-200 px-3 py-1 rounded text-xs font-bold transition-colors">Відхилити</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-bold text-theme-secondary mb-3 opacity-80 text-sm uppercase">Поточні учасники</h4>
                  <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2">
                    {/* Fake admin */}
                    <div className="flex justify-between items-center bg-theme-secondary/5 border border-theme-secondary/10 p-3 rounded-md">
                      <div>
                        <span className="font-serif font-bold text-theme-secondary">{currentUsername || 'Admin'}</span>
                        <span className="ml-2 text-xs bg-theme-secondary text-theme-primary px-2 py-0.5 rounded-full">Власник</span>
                      </div>
                    </div>
                    
                    {/* Fake members */}
                    {['Maxym', 'Olena', 'Kyrylo', 'Nastya'].map((name, i) => (
                      <div key={i} className="flex justify-between items-center bg-theme-background border border-theme-secondary/10 p-3 rounded-md">
                        <span className="font-serif font-medium text-theme-secondary">{name}</span>
                        <div className="flex gap-2">
                          <button className="text-theme-secondary bg-theme-secondary/10 hover:bg-theme-secondary/20 px-2 py-1 rounded text-xs transition-colors" title="Зробити адміністратором">↑ Адмін</button>
                          <button className="text-red-500 hover:text-red-700 px-2 py-1 rounded text-lg font-bold transition-colors" title="Видалити з клубу">×</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-12 border-t border-red-500/20 pt-6">
                  <button className="w-full py-3 border border-red-500 text-red-500 font-bold rounded-lg hover:bg-red-500 hover:text-white transition-colors">
                    Видалити клуб назавжди
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* МОДАЛКА ДОДАВАННЯ КНИГИ */}
      {isAddBookModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-theme-primary text-theme-secondary p-8 rounded-2xl shadow-2xl w-full max-w-lg border border-theme-secondary/10 relative flex flex-col max-h-[80vh]">
            <button 
              onClick={() => { setIsAddBookModalOpen(false); setSearchQuery(''); }} 
              className="absolute top-4 right-5 text-2xl opacity-60 hover:opacity-100 transition-opacity"
            >
              &times;
            </button>
            <h2 className="text-2xl font-serif font-bold italic text-center mb-6 shrink-0">Додати книгу в клуб</h2>
            
            <div className="mb-4 shrink-0">
              <input 
                type="text" 
                placeholder="Введіть назву книги або автора..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-theme-background border border-theme-secondary/30 rounded-lg px-4 py-3 focus:outline-none focus:border-theme-secondary transition-colors"
              />
            </div>

            <div className="flex-grow overflow-y-auto pr-2 mb-6 min-h-[200px]">
              {searchQuery.length > 2 ? (
                searchResults.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {searchResults.map(book => (
                      <div key={book.id} className="flex items-center justify-between p-3 bg-theme-background rounded-lg border border-theme-secondary/10">
                        <div>
                          <h4 className="font-bold font-serif text-theme-secondary">{book.title}</h4>
                          <p className="text-sm opacity-70 text-theme-secondary">{book.author}</p>
                        </div>
                        <button 
                          onClick={() => handleAddBook(book)}
                          className="px-4 py-1.5 bg-theme-secondary text-theme-primary rounded font-bold hover:opacity-90 transition-opacity text-sm"
                        >
                          Додати
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center opacity-70 mt-8">Книг не знайдено...</p>
                )
              ) : (
                <p className="text-center opacity-70 mt-8">Почніть вводити назву (мінімум 3 літери)...</p>
              )}
            </div>
            
            <button 
              onClick={() => { setIsAddBookModalOpen(false); setSearchQuery(''); }}
              className="w-full bg-theme-secondary/10 text-theme-secondary border border-theme-secondary/20 font-bold font-serif py-3 rounded-lg hover:bg-theme-secondary/20 transition-colors shadow-sm shrink-0"
            >
              Закрити
            </button>
          </div>
        </div>
      )}

    </div>
  );
}