import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import TopicDetail from './components/TopicDetail';
import GlobalChat from './components/GlobalChat';
import ExploreCourses from './components/ExploreCourses';
import StatsDashboard from './components/StatsDashboard';
import { Client } from '@stomp/stompjs';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(localStorage.getItem('user') || '');
  const [userId, setUserId] = useState(localStorage.getItem('userId') || '');
  const [perfil, setPerfil] = useState(localStorage.getItem('perfil') || '');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'theme-synthwave');
  const [view, setView] = useState(token ? 'dashboard' : 'login');
  const [activeTopicId, setActiveTopicId] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [stompClient, setStompClient] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Custom Cursor states
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [showCustomCursor, setShowCustomCursor] = useState(false);

  useEffect(() => {
    // Check if device supports fine cursor (mouse)
    const mediaQuery = window.matchMedia('(pointer: fine)');
    setShowCustomCursor(mediaQuery.matches);
    
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    
    const handleMouseOver = (e) => {
      const target = e.target;
      if (!target) return;
      const isInteractive = target.closest('a, button, select, input, textarea, .card, [role="button"], .logo');
      setIsHovered(!!isInteractive);
    };

    if (mediaQuery.matches) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseover', handleMouseOver);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  // Apply active theme class to html document element
  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  // WebSocket Connection for Realtime Notifications
  useEffect(() => {
    if (!token) return;

    // Use Native WebSocket wrapper for STOMP to avoid SockJS version mismatch
    const client = new Client({
      brokerURL: `ws://${window.location.host}/ws`,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log('Conectado a WebSocket ForoHub');
      setStompClient(client);
      
      client.subscribe('/topic/topicos', (message) => {
        const nuevoTopico = JSON.parse(message.body);
        showToast('Nuevo Tópico Creado', `"${nuevoTopico.titulo}" por ${nuevoTopico.autor}`);
      });

      client.subscribe('/topic/respuestas', (message) => {
        const nuevaRespuesta = JSON.parse(message.body);
        showToast('Nueva Respuesta Publicada', `En el tópico: "${nuevaRespuesta.tituloTopico}"`);
      });
    };

    client.onStompError = (frame) => {
      console.error('STOMP Error:', frame.headers['message'], frame.body);
    };

    client.activate();

    return () => {
      client.deactivate();
      setStompClient(null);
    };
  }, [token]);

  const [activeChatPartner, setActiveChatPartner] = useState(null);

  const showToast = (title, desc, type = 'success', chatPartner = null) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, desc, type, chatPartner }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  };

  const handleLoginSuccess = (jwtToken, userName, idUsuario, userPerfil) => {
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', userName);
    localStorage.setItem('userId', idUsuario);
    localStorage.setItem('perfil', userPerfil || '');
    setToken(jwtToken);
    setUser(userName);
    setUserId(idUsuario);
    setPerfil(userPerfil || '');
    setView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('perfil');
    setToken('');
    setUser('');
    setUserId('');
    setPerfil('');
    setView('login');
  };

  return (
    <div className="app-container">
      {token && (
        <header>
          <div className="logo" onClick={() => setView('dashboard')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img src="/img/logo-foro-hub.png" alt="ForoHub Logo" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
            <span>ForoHub</span>
          </div>
          <div className="nav-user" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' }}>
            <button
              className="btn"
              onClick={() => setView('dashboard')}
              style={{
                background: view === 'dashboard' || view === 'detail' ? 'rgba(255,255,255,0.05)' : 'transparent',
                border: 'none',
                padding: '0.4rem 0.85rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: view === 'dashboard' || view === 'detail' ? 'var(--primary-color)' : 'var(--text-secondary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              Foro
            </button>
            <button
              className="btn"
              onClick={() => setView('explore-courses')}
              style={{
                background: view === 'explore-courses' ? 'rgba(255,255,255,0.05)' : 'transparent',
                border: 'none',
                padding: '0.4rem 0.85rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: view === 'explore-courses' ? 'var(--primary-color)' : 'var(--text-secondary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              Cursos
            </button>
            <button
              className="btn"
              onClick={() => setView('stats')}
              style={{
                background: view === 'stats' ? 'rgba(255,255,255,0.05)' : 'transparent',
                border: 'none',
                padding: '0.4rem 0.85rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: view === 'stats' ? 'var(--primary-color)' : 'var(--text-secondary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
              Estadísticas
            </button>

            <span style={{ width: '1px', height: '18px', background: 'var(--border-color)', margin: '0 0.5rem' }} />

            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                padding: '0.4rem 0.8rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <option value="theme-synthwave">🌸 Synthwave</option>
              <option value="theme-amber">🔥 Ámbar</option>
              <option value="theme-mint">🍃 Menta</option>
              <option value="theme-sunset">🌇 Atardecer</option>
            </select>
            <button
              className="btn"
              onClick={handleLogout}
              title="Cerrar Sesión"
              style={{
                padding: '0.5rem 0.8rem',
                borderColor: 'rgba(239, 68, 68, 0.3)',
                color: 'var(--danger-color)',
                background: 'rgba(239, 68, 68, 0.05)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </div>
        </header>
      )}

      <main style={{ flex: 1, padding: token ? '2rem' : '0' }}>
        {view === 'login' && (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onNavigateRegister={() => setView('register')}
          />
        )}
        {view === 'register' && (
          <Register
            onNavigateLogin={() => setView('login')}
          />
        )}
        {view === 'dashboard' && (
          <Dashboard
            token={token}
            perfil={perfil}
            showToast={showToast}
            onSelectTopic={(id) => {
              setActiveTopicId(id);
              setView('detail');
            }}
          />
        )}
        {view === 'detail' && (
          <TopicDetail
            token={token}
            topicId={activeTopicId}
            userId={userId}
            showToast={showToast}
            onBack={() => setView('dashboard')}
          />
        )}
        {view === 'explore-courses' && (
          <ExploreCourses
            token={token}
            showToast={showToast}
          />
        )}
        {view === 'stats' && (
          <StatsDashboard
            token={token}
            user={user}
            userId={userId}
            showToast={showToast}
          />
        )}
      </main>

      {/* Toast Notifications Panel */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast ${t.type === 'error' ? 'toast-error' : 'toast-success'}`}
            onClick={() => {
              if (t.chatPartner) {
                setActiveChatPartner(t.chatPartner);
                setIsChatOpen(true);
              }
            }}
            style={{ cursor: t.chatPartner ? 'pointer' : 'default' }}
          >
            <div className="toast-title">
              {t.type === 'error' ? '❌' : '🔔'} {t.title}
            </div>
            <div className="toast-desc">{t.desc}</div>
          </div>
        ))}
      </div>

      {token && (
        <GlobalChat
          stompClient={stompClient}
          token={token}
          user={user}
          isOpen={isChatOpen}
          showToast={showToast}
          activePartner={activeChatPartner}
          onClearActivePartner={() => setActiveChatPartner(null)}
          onClose={() => setIsChatOpen(false)}
        />
      )}

      {token && (
        <button
          className="chat-fab"
          onClick={() => setIsChatOpen((prev) => !prev)}
          title="Abrir Chat"
        >
          💬
        </button>
      )}

      {/* Premium Custom Cursor Follower */}
      {showCustomCursor && (
        <>
          {/* Inner Core Diamond */}
          <div style={{
            position: 'fixed',
            top: mousePos.y,
            left: mousePos.x,
            width: isHovered ? '8px' : '6px',
            height: isHovered ? '8px' : '6px',
            background: 'var(--primary-color)',
            transform: `translate(-50%, -50%) rotate(${isHovered ? '135deg' : '45deg'})`,
            pointerEvents: 'none',
            zIndex: 99999,
            boxShadow: '0 0 8px var(--primary-color), 0 0 16px var(--primary-glow)',
            transition: 'width 0.2s, height 0.2s, transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }} />
          {/* Outer Trailing Diamond Box */}
          <div style={{
            position: 'fixed',
            top: mousePos.y,
            left: mousePos.x,
            width: isHovered ? '28px' : '20px',
            height: isHovered ? '28px' : '20px',
            border: '1.5px solid var(--primary-color)',
            transform: `translate(-50%, -50%) rotate(${isHovered ? '90deg' : '45deg'})`,
            pointerEvents: 'none',
            zIndex: 99998,
            opacity: 0.7,
            boxShadow: isHovered ? '0 0 10px var(--primary-glow)' : 'none',
            transition: 'width 0.25s ease-out, height 0.25s ease-out, transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            willChange: 'top, left'
          }} />
        </>
      )}
    </div>
  );
}

export default App;
