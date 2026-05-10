import React, { useState, useRef, useEffect } from 'react';
import ClubSettings from './ClubSettings'; 
import BookDetailPage from './BookDetailPage'; 
import MyBookshelfManager from './MyBookshelfManager'; 

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
  const isMember = !!club?.user_role;

  const [activeTab, setActiveTab] = useState('workspace');
  const [selectedBook, setSelectedBook] = useState(null);
  
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [clubBooks, setClubBooks] = useState([]);

  const [members, setMembers] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);

  const [isEditMode, setIsEditMode] = useState(false);
  const [hasCustomDesign, setHasCustomDesign] = useState(false);
  
  const [customBg, setCustomBg] = useState(null);
  const [bgPattern, setBgPattern] = useState('none');
  const [bgColor, setBgColor] = useState('transparent');
  
  const [bookBgColor, setBookBgColor] = useState(''); 
  const [bookTextColor, setBookTextColor] = useState('');
  const [infoBgColor, setInfoBgColor] = useState('');
  const [infoTextColor, setInfoTextColor] = useState('');
  const [shelfColor, setShelfColor] = useState('#4a554e'); 
  const [pollBgColor, setPollBgColor] = useState('');
  const [pollTextColor, setPollTextColor] = useState('');
  const [pollBarColor, setPollBarColor] = useState('');

  const [elements, setElements] = useState([]);
  const [draggingId, setDraggingId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const [meetingData, setMeetingData] = useState({
    topic: 'Обговорення',
    scheduled_at: '',
    location_details: ''
  });

  const [settingsData, setSettingsData] = useState({
    name: '',
    description: '',
    format: 'ON',
    currently_reading: '',
    is_open: true,
    admin_can_edit_design: true,
    admin_can_manage_books: true,
    admin_can_remove_members: false
  });
  
  const containerRef = useRef(null);
  const scrollRef = useRef(null);
  
  const dragPos = useRef({ x: 0, y: 0 });
  const dragStart = useRef({ mouseX: 0, mouseY: 0, scrollX: 0, scrollY: 0, elX: 0, elY: 0 }); 

  useEffect(() => {
    const currentMemberCount = club?.members_details?.length || club?.members_count || 0;

    if (club?.custom_design) {
      const design = club.custom_design;
      
      const updatedElements = (design.elements || []).map(el => {
        if (el.type === 'info' && el.content && el.content.startsWith('Учасників:')) {
          return { ...el, content: `Учасників: ${currentMemberCount}` };
        }
        return el;
      });

      setElements(updatedElements);
      setCustomBg(design.customBg || null);
      setBgPattern(design.bgPattern || 'none');
      setBgColor(design.bgColor || 'transparent');
      
      setBookBgColor(design.bookBgColor || '');
      setBookTextColor(design.bookTextColor || '');
      setInfoBgColor(design.infoBgColor || '');
      setInfoTextColor(design.infoTextColor || '');
      setShelfColor(design.shelfColor || '#4a554e');
      setPollBgColor(design.pollBgColor || '');
      setPollTextColor(design.pollTextColor || '');
      setPollBarColor(design.pollBarColor || '');

      setHasCustomDesign(true);
    } else {
      setElements([
        { id: '1', type: 'header', content: club?.name || 'Назва клубу', x: 60, y: 60, scale: 1, rotation: 0 },
        { id: 'desc', type: 'text', content: club?.description || 'Опис клубу', x: 60, y: 150, scale: 1, rotation: 0 },
        { id: '3', type: 'info_block', x: 60, y: 250, scale: 1, rotation: 0 },
        { id: '2', type: 'book', content: club?.currently_reading || 'Обираємо книгу', x: 60, y: 430, scale: 1, rotation: 0 },
        { id: 'shelf', type: 'bookshelf', x: 450, y: 400, scale: 1, rotation: 0 },
        { id: 'btn_join', type: 'join_button', x: 60, y: 550, scale: 1, rotation: 0 } 
      ]);
      resetElementColors(); 
      setBgPattern('none');
      setBgColor('transparent');
      setCustomBg(null);
      setHasCustomDesign(false);
    }

    if (club?.books) {
      setClubBooks(club.books);
    }

    if (club) {
      setSettingsData({
        name: club.name || '',
        description: club.description || '',
        format: club.format || 'ON',
        currently_reading: club.currently_reading || '',
        is_open: club.is_private !== undefined ? !club.is_private : true,
        admin_can_edit_design: club.admin_can_edit_design !== undefined ? club.admin_can_edit_design : true,
        admin_can_manage_books: club.admin_can_manage_books !== undefined ? club.admin_can_manage_books : true,
        admin_can_remove_members: club.admin_can_remove_members !== undefined ? club.admin_can_remove_members : false,
      });
      
      setMembers(club.members_details || []);
      setJoinRequests(club.join_requests || []);

      const token = localStorage.getItem('token');
      if (token && isAdmin && club?.id) {
        fetch(`http://127.0.0.1:8000/api/clubs/${club.id}/`, {
          headers: { 'Authorization': `Token ${token}` }
        })
        .then(res => res.json())
        .then(data => {
          if (data.join_requests) setJoinRequests(data.join_requests);
          if (data.members_details) setMembers(data.members_details);
        })
        .catch(err => console.error("Помилка завантаження заявок:", err));
      }
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

  const resetElementColors = () => {
    setBookBgColor('');
    setBookTextColor('');
    setInfoBgColor('');
    setInfoTextColor('');
    setShelfColor('#4a554e');
    setPollBgColor('');
    setPollTextColor('');
    setPollBarColor('');
  };

  const handleJoinClub = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Будь ласка, авторизуйтесь, щоб приєднатися до клубу.');
      return;
    }
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/clubs/${club.id}/join/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        }
      });
      
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        alert(data.status || 'Запит успішно оброблено!');
        window.location.reload();
      } else {
        alert(`Помилка: ${data.detail || data.error || 'Не вдалося вступити'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Помилка сервера. Спробуйте пізніше.');
    }
  };

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
    if (!window.confirm("Ви впевнені, що хочете видалити цю книгу з клубу?")) return;
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
        setClubBooks(prev => prev.filter(b => b.id !== bookId));
        setSelectedBook(null);
        setActiveTab('workspace');
      } else {
        alert("Помилка при видаленні книги.");
      }
    })
    .catch(err => console.error("Помилка:", err));
  };

  const handleScheduleMeeting = () => {
    if (!meetingData.scheduled_at || !meetingData.location_details) {
      alert("Будь ласка, вкажіть дату, час та локацію зустрічі.");
      return;
    }

    const token = localStorage.getItem('token');
    const bookId = clubBooks.find(b => b.title === settingsData.currently_reading)?.id || null;

    fetch(`http://127.0.0.1:8000/api/meetings/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      body: JSON.stringify({
        club: club.id,
        book: bookId,
        topic: meetingData.topic || 'Обговорення книги',
        scheduled_at: meetingData.scheduled_at,
        format: settingsData.format,
        location_details: meetingData.location_details
      })
    })
    .then(async res => {
      if (res.ok) {
        alert("Зустріч успішно заплановано!");
        window.location.reload();
      } else {
        const data = await res.json().catch(() => ({}));
        console.error(data);
        alert("Помилка планування зустрічі.");
      }
    })
    .catch(err => console.error("Помилка:", err));
  };

  const handleSaveDesign = () => {
    const designToSave = { 
      elements, customBg, bgPattern, bgColor,
      bookBgColor, bookTextColor, infoBgColor, infoTextColor,
      shelfColor, pollBgColor, pollTextColor, pollBarColor
    };
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

  const handleSaveSettings = () => {
    const token = localStorage.getItem('token');
    
    const dataToSend = { ...settingsData, is_private: !settingsData.is_open };
    delete dataToSend.is_open;

    fetch(`http://127.0.0.1:8000/api/clubs/${club.id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      body: JSON.stringify(dataToSend) 
    })
    .then(res => {
      if (res.ok) {
        alert("Налаштування успішно збережено!");
        setElements(prev => prev.map(el => el.type === 'book' ? { ...el, content: settingsData.currently_reading || 'Обираємо книгу' } : el));
      } else {
        alert("Помилка збереження на сервері.");
      }
    })
    .catch(err => console.error("Помилка мережі:", err));
  };

  const handleRequestAction = (requestId, action) => {
    const token = localStorage.getItem('token');
    fetch(`http://127.0.0.1:8000/api/clubs/${club.id}/requests/${requestId}/process/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      body: JSON.stringify({ action: action })
    })
    .then(res => {
      if (res.ok) {
        alert(action === 'accept' ? 'Учасника прийнято!' : 'Заявку відхилено.');
        setJoinRequests(prev => prev.filter(req => req.id !== requestId));
        window.location.reload();
      } else {
        alert("Помилка обробки заявки.");
      }
    })
    .catch(err => console.error(err));
  };

  const handleRemoveMember = (memberId) => {
    if (!window.confirm("Дійсно видалити цього учасника?")) return;
    const token = localStorage.getItem('token');
    
    fetch(`http://127.0.0.1:8000/api/clubs/${club.id}/members/${memberId}/`, {
      method: 'DELETE',
      headers: { 'Authorization': `Token ${token}` }
    })
    .then(res => {
      if (res.ok) {
        setMembers(prev => prev.filter(m => m.id !== memberId));
      } else {
        alert("Не вдалося видалити учасника.");
      }
    })
    .catch(err => console.error(err));
  };

  const handlePromoteMember = (memberId) => {
    if (!window.confirm("Призначити цього учасника адміністратором?")) return;
    const token = localStorage.getItem('token');
    
    fetch(`http://127.0.0.1:8000/api/clubs/${club.id}/members/${memberId}/promote/`, {
      method: 'POST',
      headers: { 'Authorization': `Token ${token}` }
    })
    .then(res => {
      if (res.ok) {
        alert("Учасника призначено адміністратором!");
        window.location.reload();
      } else {
        alert("Не вдалося змінити роль учасника.");
      }
    })
    .catch(err => console.error(err));
  };

  const handleDemoteMember = (memberId) => {
    if (!window.confirm("Забрати права адміністратора у цього учасника?")) return;
    const token = localStorage.getItem('token');
    
    fetch(`http://127.0.0.1:8000/api/clubs/${club.id}/members/${memberId}/demote/`, {
      method: 'POST',
      headers: { 'Authorization': `Token ${token}` }
    })
    .then(res => {
      if (res.ok) {
        alert("Права адміністратора успішно знято!");
        window.location.reload();
      } else {
        alert("Не вдалося змінити роль учасника.");
      }
    })
    .catch(err => console.error(err));
  };

  const handleDeleteClub = () => {
    if (!window.confirm("Ви впевнені, що хочете видалити цей клуб назавжди? Цю дію неможливо скасувати!")) return;
    
    const token = localStorage.getItem('token');
    
    fetch(`http://127.0.0.1:8000/api/clubs/${club.id}/`, {
      method: 'DELETE',
      headers: { 'Authorization': `Token ${token}` }
    })
    .then(res => {
      if (res.ok || res.status === 204) {
        alert("Клуб успішно видалено.");
        window.location.href = '/'; 
      } else {
        alert("Помилка при видаленні клубу.");
      }
    })
    .catch(err => console.error("Помилка:", err));
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
        const currentMemberCount = club?.members_details?.length || club?.members_count || 0;
        setHasCustomDesign(false);
        setIsEditMode(false);
        setCustomBg(null);
        setBgPattern('none');
        setBgColor('transparent');
        resetElementColors(); 
        setElements([
          { id: '1', type: 'header', content: club?.name || 'Назва клубу', x: 60, y: 60, scale: 1, rotation: 0 },
          { id: 'desc', type: 'text', content: club?.description || 'Опис клубу', x: 60, y: 150, scale: 1, rotation: 0 },
          { id: '3', type: 'info_block', x: 60, y: 250, scale: 1, rotation: 0 },
          { id: '2', type: 'book', content: club?.currently_reading || 'Обираємо книгу', x: 60, y: 430, scale: 1, rotation: 0 },
          { id: 'shelf', type: 'bookshelf', x: 450, y: 400, scale: 1, rotation: 0 },
          { id: 'btn_join', type: 'join_button', x: 60, y: 550, scale: 1, rotation: 0 }
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
  
  const addInfoBlock = () => {
    const pos = getSpawnPos();
    const newId = Date.now().toString();
    setElements([...elements, { 
      id: newId, type: 'info_block', x: pos.x, y: pos.y, scale: 1, rotation: 0 
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

  const addJoinButton = () => {
    const pos = getSpawnPos();
    const newId = Date.now().toString();
    setElements([...elements, { 
      id: newId, type: 'join_button', x: pos.x, y: pos.y, scale: 1, rotation: 0,
      bgColor: '', textColor: ''
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

  const renderBookshelfVisual = (isCanvasElement = false, ringClass = '', baseStyle = {}) => {
    const displayBooks = clubBooks.slice(-10);
    return (
      <div className={`flex flex-col items-center select-none p-2 ${ringClass}`} style={baseStyle}>
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
        
        <div className={`w-[680px] h-[22px] rounded-full mt-[-1px] relative z-20 shadow-md ${!isEditMode ? 'cursor-pointer hover:brightness-110 transition-all' : ''}`} style={{backgroundColor: shelfColor}}></div>
        <div className={`w-[650px] h-[8px] rounded-full mt-1 opacity-80 ${!isEditMode ? 'cursor-pointer' : ''}`} style={{backgroundColor: shelfColor}}></div>
        
        {!isEditMode && isCanvasElement && (
          <div className="absolute -bottom-10 bg-theme-secondary text-theme-primary px-4 py-1.5 rounded-md text-sm font-bold opacity-0 hover:opacity-100 transition-opacity shadow-sm whitespace-nowrap cursor-pointer z-50 pointer-events-none">
            Відкрити всі книги
          </div>
        )}
      </div>
    );
  };

  const renderElement = (el, isSelected) => {
    const ringClass = isEditMode 
      ? `transition-all rounded-lg ${isSelected ? 'ring-2 ring-blue-500 ring-offset-4 ring-offset-transparent' : 'hover:ring-2 hover:ring-theme-secondary/50'}` 
      : '';

    const baseStyle = { transform: `scale(${el.scale || 1}) rotate(${el.rotation || 0}deg)`, transformOrigin: 'top left' };

    switch (el.type) {
      case 'header':
        if (isEditMode) {
          const textStyles = {
            fontSize: `${48}px`, color: el.color || 'var(--color-secondary)', fontFamily: el.fontFamily || 'serif',
            fontWeight: el.fontWeight || 'bold', fontStyle: el.fontStyle || 'italic', textDecoration: el.textDecoration || 'none',
            textAlign: el.textAlign || 'left', width: `${Math.max((el.content || '').length * 28, 200)}px`, ...baseStyle
          };
          return (
            <input 
              type="text" 
              value={el.content || ''} 
              onChange={(e) => updateElement(el.id, { content: e.target.value })}
              className={`bg-transparent border-b-2 border-theme-secondary/50 outline-none drop-shadow-md overflow-hidden p-1 ${ringClass}`}
              style={textStyles}
              onMouseDown={(e) => { e.stopPropagation(); setSelectedId(el.id); }}
              onFocus={() => setSelectedId(el.id)}
            />
          );
        }
        return <h1 className={`font-bold font-serif italic text-theme-secondary drop-shadow-md whitespace-nowrap select-none p-1 ${ringClass}`} style={{ ...baseStyle, fontSize: `${48}px`, color: el.color, fontFamily: el.fontFamily, fontWeight: el.fontWeight, fontStyle: el.fontStyle, textDecoration: el.textDecoration }}>{el.content}</h1>;
      
      case 'book':
        const bookDynStyle = {
          backgroundColor: bookBgColor || 'var(--color-secondary)',
          color: bookTextColor || 'var(--color-primary)'
        };
        const currentReadingText = settingsData.currently_reading || club?.currently_reading || 'Обираємо книгу';
        return (
          <div className={`p-6 shadow-xl border border-theme-primary/20 backdrop-blur-sm bg-opacity-95 select-none rounded-2xl ${ringClass}`} style={{...baseStyle, ...bookDynStyle}}>
            <p className="text-sm opacity-80 mb-2">Зараз читаємо:</p>
            <h3 className="font-bold font-serif text-2xl whitespace-nowrap">{currentReadingText}</h3>
          </div>
        );
      
      case 'info':
      case 'info_block':
        let displayContent = el.content;
        
        if (typeof displayContent === 'string' && displayContent.startsWith('Учасників:')) {
          const liveCount = members.length > 0 ? members.length : (club?.members_details?.length || club?.members_count || 0);
          displayContent = `Учасників: ${liveCount}`;
        }
        
        const infoDynStyle = {
          backgroundColor: infoBgColor || 'transparent',
          color: infoTextColor || 'var(--color-secondary)'
        };

        return (
          <div className={`flex flex-col gap-4 opacity-90 font-medium text-lg select-none p-4 rounded-xl ${ringClass}`} style={{...baseStyle, ...infoDynStyle}}>
             <div className="flex items-center gap-4">
                <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                <span>{members.length > 0 ? members.length : (club?.members_details?.length || club?.members_count || 0)} учасників</span>
             </div>
             <div className="flex items-center gap-4">
                <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <span>Наступна зустріч: {club?.next_meeting || "Не заплановано"}</span>
             </div>
             <div className="flex items-center gap-4">
                <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <span>{club?.location || "Уточнюється"}</span>
             </div>
          </div>
        );

      case 'bookshelf':
        return renderBookshelfVisual(true, ringClass, baseStyle);

      case 'join_button':
        const buttonText = isMember 
          ? "Ви учасник" 
          : (settingsData.is_open ? "Вступити в клуб" : "Подати заявку");
          
        return (
          <div className={`p-2 ${ringClass}`} style={baseStyle}>
            <button 
              onClick={(e) => {
                if (!isEditMode && !isMember) {
                  e.stopPropagation();
                  handleJoinClub();
                }
              }}
              disabled={isMember && !isEditMode}
              className="px-8 py-4 font-bold font-serif text-lg rounded-xl shadow-lg transition-transform hover:scale-105"
              style={{ 
                backgroundColor: el.bgColor || 'var(--color-secondary)', 
                color: el.textColor || 'var(--color-primary)',
                opacity: (isMember && !isEditMode) ? 0.6 : 1,
                cursor: (isMember && !isEditMode) ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {buttonText}
            </button>
          </div>
        );

      case 'poll':
        const totalVotes = (el.options || []).reduce((acc, curr) => acc + curr.votes, 0);
        
        const pollDynStyle = {
          backgroundColor: pollBgColor || 'var(--color-primary)',
          color: pollTextColor || 'var(--color-secondary)'
        };
        const barStyle = {
          backgroundColor: pollBarColor || 'var(--color-secondary)',
          opacity: pollBarColor ? 0.2 : 0.1
        };

        return (
          <div className={`p-6 shadow-xl border border-theme-secondary/20 rounded-xl select-none w-80 ${ringClass}`} style={{...baseStyle, ...pollDynStyle}}>
            <h3 className="font-serif font-bold text-xl mb-4 italic text-center break-words">{el.question}</h3>
            
            <div className="flex flex-col gap-3">
              {(el.options || []).map((opt, i) => {
                const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                return (
                  <div key={i} className="relative w-full rounded-md border border-theme-secondary/20 overflow-hidden">
                    <div className="absolute top-0 left-0 h-full transition-all duration-500" style={{ width: `${percentage}%`, ...barStyle }}></div>
                    
                    <button className="w-full relative z-10 flex justify-between items-center p-3 bg-transparent text-sm cursor-pointer hover:bg-theme-secondary/5 transition-colors">
                      <span className="font-bold font-serif truncate pr-2" style={{color: pollTextColor || 'var(--color-secondary)'}}>{opt.title || 'Порожній варіант'}</span>
                      <span className="shrink-0" style={{color: pollTextColor || 'var(--color-secondary)'}}>{percentage}%</span>
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
              value={el.content || ''} 
              onChange={(e) => updateElement(el.id, { content: e.target.value })}
              className={`bg-transparent border-b-2 border-theme-secondary/50 outline-none drop-shadow-sm resize-none overflow-hidden p-1 ${ringClass}`}
              style={{ ...textStyles, height: `${((el.content || '').split('\n').length + 1) * 28}px` }}
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

  const selectedElement = elements.find(el => el.id === selectedId);
  const maxElY = elements.length > 0 ? Math.max(...elements.map(e => e.y || 0)) : 0;
  const canvasHeight = isEditMode ? Math.max(3000, maxElY + 2000) : Math.max(600, maxElY + 400);

  const ColorInput = ({ label, value, onChange, reset }) => (
    <div className="flex items-center justify-between gap-2 mb-2 bg-theme-background p-2 rounded-md border border-theme-secondary/10">
      <span className="text-sm text-theme-secondary opacity-80 truncate">{label}</span>
      <div className="flex items-center gap-2 shrink-0">
        <input 
          type="color" 
          value={value || '#ffffff'} 
          onChange={(e) => onChange(e.target.value)}
          className="w-7 h-7 rounded cursor-pointer border-0 p-0 bg-transparent"
        />
        <button onClick={reset} className="text-red-500 hover:text-red-600 text-lg" title="Скинути до дефолту">&times;</button>
      </div>
    </div>
  );

  return (
    <div className="w-full h-screen flex flex-col bg-theme-background transition-colors duration-500 overflow-hidden relative">
      
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
        </div>
      </div>

      {activeTab === 'workspace' && (
        <div className="flex flex-1 w-full h-full overflow-hidden relative">
          
          {!isEditMode && !hasCustomDesign ? (
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-16 w-full custom-scrollbar">
              <div className="max-w-4xl mx-auto bg-theme-primary rounded-3xl p-8 sm:p-12 shadow-xl border border-theme-secondary/10">
                
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
                  <h1 className="text-4xl sm:text-5xl font-serif font-bold italic text-theme-secondary">{club?.name}</h1>
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <span className="bg-theme-secondary text-theme-primary text-sm font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shrink-0 w-full text-center">
                      {club?.format_display}
                    </span>
                    {!isMember && !isAdmin && (
                      <button 
                        onClick={handleJoinClub}
                        className="w-full px-6 py-2 bg-theme-secondary text-theme-primary font-bold font-serif rounded-lg shadow-md hover:opacity-90 transition-opacity whitespace-nowrap"
                      >
                        {settingsData.is_open ? "Вступити" : "Подати заявку"}
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-lg opacity-80 text-theme-secondary leading-relaxed mb-10 whitespace-pre-wrap">
                  {club?.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  <div className="space-y-4 text-theme-secondary opacity-80 font-medium">
                    <div className="flex items-center gap-4">
                      <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                      <span>{members.length > 0 ? members.length : (club?.members_details?.length || club?.members_count || 0)} учасників</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      <span>Наступна зустріч: {club?.next_meeting || 'Не заплановано'}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      <span>{club?.location || 'Уточнюється'}</span>
                    </div>
                  </div>

                  <div className="bg-theme-secondary text-theme-primary rounded-2xl p-6 shadow-md flex flex-col justify-center">
                    <p className="text-sm opacity-80 mb-2">Зараз читають:</p>
                    <p className="font-bold font-serif text-2xl">{settingsData.currently_reading || club?.currently_reading || "Обираємо книгу"}</p>
                  </div>
                </div>

                <div className="border-t border-theme-secondary/10 pt-10">
                  <h3 className="text-2xl font-bold italic font-serif text-theme-secondary mb-8 text-center">Книжкова полиця клубу</h3>
                  <div 
                    className="flex justify-center cursor-pointer group relative pb-4"
                    onClick={() => setActiveTab('bookshelf')}
                  >
                    {renderBookshelfVisual(false)}
                    
                    <div className="absolute -bottom-2 bg-theme-secondary text-theme-primary px-4 py-1.5 rounded-md text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-sm whitespace-nowrap pointer-events-none z-50">
                      Перейти до всієї полиці
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {isEditMode && (
                <div className="w-80 shrink-0 h-full bg-theme-primary border-r border-theme-secondary/10 p-6 flex flex-col gap-6 shadow-xl z-40 overflow-y-auto pb-32 custom-scrollbar">
                  
                  {selectedElement && (selectedElement.type === 'text' || selectedElement.type === 'header') && (
                    <div className="bg-theme-secondary/5 p-4 rounded-lg border border-theme-secondary/20 mb-2 shrink-0">
                      <h3 className="font-serif font-bold text-lg text-theme-secondary mb-4 flex justify-between items-center">
                        <span>Текст</span>
                        <button onClick={() => updateElement(selectedElement.id, { scale: 1, rotation: 0 })} className="text-xs opacity-70 underline hover:opacity-100">Скинути розмір</button>
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
                      </h3>

                      <div className="mb-4">
                        <span className="block text-sm text-theme-secondary opacity-80 mb-1">Питання:</span>
                        <input
                          type="text"
                          value={selectedElement.question || ''}
                          onChange={(e) => updateElement(selectedElement.id, { question: e.target.value })}
                          className="w-full bg-theme-background border border-theme-secondary/30 rounded p-2 text-sm text-theme-secondary focus:outline-none focus:border-theme-secondary"
                        />
                      </div>

                      <div className="mb-2">
                        <span className="block text-sm text-theme-secondary opacity-80 mb-2">Варіанти:</span>
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
                              />
                              <button onClick={() => updateElement(selectedElement.id, { options: selectedElement.options.filter((_, i) => i !== idx) })} className="text-red-500 font-bold">×</button>
                            </div>
                          ))}
                        </div>
                        <button onClick={() => updateElement(selectedElement.id, { options: [...(selectedElement.options || []), { title: `Новий варіант`, votes: 0 }] })} className="mt-3 w-full text-xs py-2 border border-theme-secondary/30 rounded-md hover:bg-theme-secondary/10 text-theme-secondary font-bold">+ Додати варіант</button>
                      </div>
                    </div>
                  )}

                  {selectedElement && selectedElement.type === 'join_button' && (
                    <div className="bg-theme-secondary/5 p-4 rounded-lg border border-theme-secondary/20 mb-2 shrink-0">
                      <h3 className="font-serif font-bold text-lg text-theme-secondary mb-4 flex justify-between items-center">
                        <span>Кнопка вступу</span>
                        <button onClick={() => updateElement(selectedElement.id, { scale: 1, rotation: 0 })} className="text-xs opacity-70 underline hover:opacity-100">Скинути розмір</button>
                      </h3>
                      <ColorInput label="Фон кнопки" value={selectedElement.bgColor} onChange={(v) => updateElement(selectedElement.id, { bgColor: v })} reset={() => updateElement(selectedElement.id, { bgColor: '' })} />
                      <ColorInput label="Колір тексту" value={selectedElement.textColor} onChange={(v) => updateElement(selectedElement.id, { textColor: v })} reset={() => updateElement(selectedElement.id, { textColor: '' })} />
                    </div>
                  )}

                  <div className="shrink-0 bg-theme-secondary/5 p-4 rounded-lg border border-theme-secondary/20">
                    <h3 className="font-serif font-bold text-xl text-theme-secondary mb-3">Фон простору</h3>
                    
                    <div className="flex gap-2 mb-3">
                      <button onClick={() => {setBgPattern('dots'); setCustomBg(null);}} className={`flex-1 py-1 border rounded text-sm ${bgPattern === 'dots' ? 'border-theme-secondary bg-theme-secondary/10' : 'border-theme-secondary/20'}`}>Крапки</button>
                      <button onClick={() => {setBgPattern('grid'); setCustomBg(null);}} className={`flex-1 py-1 border rounded text-sm ${bgPattern === 'grid' ? 'border-theme-secondary bg-theme-secondary/10' : 'border-theme-secondary/20'}`}>Сітка</button>
                      <button onClick={() => {setBgPattern('none'); setCustomBg(null);}} className={`flex-1 py-1 border rounded text-sm ${bgPattern === 'none' ? 'border-theme-secondary bg-theme-secondary/10' : 'border-theme-secondary/20'}`}>Чистий</button>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-sm text-theme-secondary opacity-80">Колір:</span>
                      <input 
                        type="color" 
                        value={bgColor === 'transparent' ? '#ffffff' : bgColor} 
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent"
                      />
                    </div>

                    <label className="block w-full text-center bg-theme-secondary text-theme-primary py-2 rounded-md hover:opacity-90 cursor-pointer transition-opacity font-medium text-sm">
                      {customBg ? 'Змінити картинку' : 'Завантажити картинку'}
                      <input type="file" accept="image/*" onChange={handleBgUpload} className="hidden" />
                    </label>
                    
                    {customBg && (
                      <button 
                        onClick={() => setCustomBg(null)} 
                        className="w-full mt-3 text-center text-red-500 hover:text-red-600 py-1 text-sm font-bold border border-red-500/30 rounded"
                      >
                        Видалити картинку
                      </button>
                    )}
                  </div>

                  <div className="shrink-0 bg-theme-secondary/5 p-4 rounded-lg border border-theme-secondary/20">
                    <h3 className="font-serif font-bold text-xl text-theme-secondary mb-4 mt-1">Стилізація елементів</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-bold text-theme-secondary mb-2 text-xs opacity-80 uppercase tracking-wide">"Зараз читаємо"</h4>
                        <ColorInput label="Фон блоку" value={bookBgColor} onChange={setBookBgColor} reset={() => setBookBgColor('')} />
                        <ColorInput label="Колір тексту" value={bookTextColor} onChange={setBookTextColor} reset={() => setBookTextColor('')} />
                      </div>
                      <div>
                        <h4 className="font-bold text-theme-secondary mb-2 text-xs opacity-80 uppercase tracking-wide">"Інфо учасників"</h4>
                        <ColorInput label="Фон блоку" value={infoBgColor} onChange={setInfoBgColor} reset={() => setInfoBgColor('')} />
                        <ColorInput label="Колір тексту" value={infoTextColor} onChange={setInfoTextColor} reset={() => setInfoTextColor('')} />
                      </div>
                      <div>
                        <h4 className="font-bold text-theme-secondary mb-2 text-xs opacity-80 uppercase tracking-wide">Книжкова полиця</h4>
                        <ColorInput label="Колір дерева" value={shelfColor} onChange={setShelfColor} reset={() => setShelfColor('#4a554e')} />
                      </div>
                      <div>
                        <h4 className="font-bold text-theme-secondary mb-2 text-xs opacity-80 uppercase tracking-wide">Опитування</h4>
                        <ColorInput label="Фон блоку" value={pollBgColor} onChange={setPollBgColor} reset={() => setPollBgColor('')} />
                        <ColorInput label="Колір тексту" value={pollTextColor} onChange={setPollTextColor} reset={() => setPollTextColor('')} />
                        <ColorInput label="Колір смужки" value={pollBarColor} onChange={setPollBarColor} reset={() => setPollBarColor('')} />
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <h3 className="font-serif font-bold text-xl text-theme-secondary mb-3 mt-4">Додати елементи</h3>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <button onClick={addText} className="bg-theme-secondary/10 text-theme-secondary py-2 rounded-md font-medium text-sm">+ Текст</button>
                      <label className="text-center bg-theme-secondary/10 text-theme-secondary py-2 rounded-md font-medium text-sm cursor-pointer">
                        + Фото <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                      <button onClick={addInfoBlock} className="bg-theme-secondary/10 text-theme-secondary py-2 rounded-md font-medium text-sm">+ Інфо</button>
                      <button onClick={addPoll} className="bg-theme-secondary/10 text-theme-secondary py-2 rounded-md font-medium text-sm">+ Опитування</button>
                      <button onClick={addBookshelf} className="col-span-2 bg-theme-secondary text-theme-primary py-2 rounded-md font-bold font-serif shadow-sm">+ Полиця</button>
                      <button onClick={addJoinButton} className="col-span-2 bg-[#4A554E] text-white py-2 rounded-md font-bold font-serif shadow-sm hover:bg-[#3A453E] transition-colors">+ Кнопка вступу</button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pb-4">
                      {availableStickers.map(sticker => (
                        <button key={sticker.id} onClick={() => addSticker(sticker)} className="flex flex-col items-center p-3 border border-theme-secondary/20 rounded-lg hover:bg-theme-secondary/10">
                          <img src={sticker.src} alt={sticker.alt} className="w-10 h-10 object-contain mb-2 mix-blend-multiply" />
                          <span className="text-xs text-theme-secondary opacity-80 text-center">{sticker.alt}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-6 border-t border-theme-secondary/20 shrink-0">
                    <button onClick={handleResetDesign} className="w-full text-red-500 hover:text-red-600 font-medium py-2 border border-red-500/20 rounded-lg bg-red-500/5">
                      Скинути дизайн до дефолту
                    </button>
                  </div>
                </div>
              )}

              <div 
                ref={scrollRef} 
                className="flex-1 h-full overflow-auto relative custom-scrollbar"
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
                  {isEditMode && <div className="absolute top-0 left-0 min-w-full min-h-[200vh] pointer-events-none"></div>}
                  
                  {elements.map((el) => {
                    const isSelected = selectedId === el.id;
                    return (
                      <div
                        key={el.id}
                        id={`draggable-${el.id}`}
                        onMouseDown={(e) => handleMouseDown(e, el.id)}
                        onClick={(e) => { e.stopPropagation(); if (!isEditMode && el.type === 'bookshelf') setActiveTab('bookshelf'); }} 
                        style={{
                          position: 'absolute', left: `${el.x}px`, top: `${el.y}px`,
                          cursor: isEditMode ? (draggingId === el.id ? 'grabbing' : 'grab') : (el.type === 'bookshelf' ? 'pointer' : 'default'),
                          zIndex: (draggingId === el.id || isSelected) ? 50 : 10
                        }}
                        className="w-max h-max group"
                      >
                        {isEditMode && isSelected && (
                          <div className="absolute -top-14 left-0 bg-white shadow-lg rounded-md border border-gray-200 flex gap-1 p-1 z-50">
                            <button onMouseDown={(e) => { e.stopPropagation(); updateElement(el.id, { scale: Math.min((el.scale || 1) + 0.1, 4) }); }} className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-bold">+</button>
                            <button onMouseDown={(e) => { e.stopPropagation(); updateElement(el.id, { scale: Math.max((el.scale || 1) - 0.1, 0.4) }); }} className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-bold">-</button>
                            <button onMouseDown={(e) => { e.stopPropagation(); updateElement(el.id, { rotation: (el.rotation || 0) - 15 }); }} className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-bold text-lg">↺</button>
                            <button onMouseDown={(e) => { e.stopPropagation(); updateElement(el.id, { rotation: (el.rotation || 0) + 15 }); }} className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-bold text-lg">↻</button>
                            <button onMouseDown={(e) => { e.stopPropagation(); deleteElement(el.id); }} className="w-8 h-8 flex items-center justify-center bg-red-100 hover:bg-red-200 rounded text-red-600 font-bold ml-1">🗑</button>
                          </div>
                        )}
                        {renderElement(el, isSelected)}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'bookshelf' && (
        <div className="flex-1 h-full overflow-y-auto p-8 sm:p-16 custom-scrollbar relative">
          <button onClick={() => setActiveTab('workspace')} className="absolute top-8 left-8 text-theme-secondary opacity-60 hover:opacity-100 font-serif font-bold transition-opacity z-10">
            &larr; До простору
          </button>
          
          <MyBookshelfManager 
             goBack={() => setActiveTab('workspace')}
             setCurrentPage={(page) => {
               if(page === 'book_detail') setActiveTab('bookDetail');
             }} 
             setSelectedBook={setSelectedBook}
             isClubMode={true}
             clubId={club.id}
             initialBooks={clubBooks}
             isAdmin={isAdmin}
             onBooksUpdate={(updatedBooks) => setClubBooks(updatedBooks)}
          />
        </div>
      )}

      {activeTab === 'bookDetail' && selectedBook && (
         <div className="flex-1 h-full overflow-y-auto custom-scrollbar relative bg-theme-background">
           <BookDetailPage 
              book={selectedBook} 
              goBack={() => { setActiveTab('workspace'); setSelectedBook(null); }} 
           />
           {isAdmin && (
             <div className="absolute top-10 right-10 z-50">
               <button onClick={() => { handleRemoveBook(selectedBook.id); }} className="px-6 py-3 border-2 border-red-500 text-red-500 font-bold rounded-lg hover:bg-red-500 hover:text-white transition-colors bg-theme-primary shadow-sm">
                 Видалити з клубу
               </button>
             </div>
           )}
         </div>
      )}

      {activeTab === 'settings' && isAdmin && (
         <ClubSettings 
            club={club}
            settingsData={settingsData}
            setSettingsData={setSettingsData}
            clubBooks={clubBooks}
            joinRequests={joinRequests}
            members={members}
            isOwner={isOwner}
            handleSaveSettings={handleSaveSettings}
            handleRequestAction={handleRequestAction}
            handleRemoveMember={handleRemoveMember}
            handlePromoteMember={handlePromoteMember}
            handleDemoteMember={handleDemoteMember}
            handleDeleteClub={handleDeleteClub}
            meetingData={meetingData}
            setMeetingData={setMeetingData}
            handleScheduleMeeting={handleScheduleMeeting}
         />
      )}
    </div>
  );
}