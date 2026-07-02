import React, { useState, useEffect, useRef } from 'react';

function GlobalChat({ stompClient, token, user, isOpen, showToast, activePartner, onClearActivePartner, onClose }) {
  const [activeTab, setActiveTab] = useState('general'); // 'general' or 'private'
  
  // LocalStorage-backed state initializers
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('chat_global_msgs');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [privateMessages, setPrivateMessages] = useState(() => {
    const saved = localStorage.getItem(`chat_private_msgs_${user}`);
    return saved ? JSON.parse(saved) : {};
  });

  const [inputValue, setInputValue] = useState('');
  
  // Private messaging states
  const [users, setUsers] = useState([]);
  const [activePrivateUser, setActivePrivateUser] = useState(null);
  const [privateInputValue, setPrivateInputValue] = useState('');
  const [typingUsers, setTypingUsers] = useState({}); // { username: boolean }
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showGlobalClearConfirm, setShowGlobalClearConfirm] = useState(false);

  // Audio Recording states
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const chatEndRef = useRef(null);
  const privateChatEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Keep refs for websocket callbacks
  const activePrivateUserRef = useRef(activePrivateUser);
  useEffect(() => {
    activePrivateUserRef.current = activePrivateUser;
  }, [activePrivateUser]);

  const isOpenRef = useRef(isOpen);
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // Persist Global Chat messages
  useEffect(() => {
    localStorage.setItem('chat_global_msgs', JSON.stringify(messages));
  }, [messages]);

  // Persist Private Chat messages
  useEffect(() => {
    if (user) {
      localStorage.setItem(`chat_private_msgs_${user}`, JSON.stringify(privateMessages));
    }
  }, [privateMessages, user]);

  // Navigate to specific chat if triggered by clicking a Toast
  useEffect(() => {
    if (activePartner) {
      setActiveTab('private');
      setActivePrivateUser(activePartner);
      onClearActivePartner();
    }
  }, [activePartner, onClearActivePartner]);

  // Subscribe to Global Chat
  useEffect(() => {
    if (!stompClient) return;

    const subscription = stompClient.subscribe('/topic/public-chat', (message) => {
      const msg = JSON.parse(message.body);
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [stompClient]);

  // Subscribe to Direct Messages permanently on user queue
  useEffect(() => {
    if (!stompClient || !user) return;

    const channel = `/topic/private-user-${user}`;
    const subscription = stompClient.subscribe(channel, (message) => {
      const msg = JSON.parse(message.body);
      const partner = msg.sender;

      // Mark message as seen if the conversation is currently active and open
      const isChatActive = activePrivateUserRef.current === partner && isOpenRef.current;
      if (isChatActive) {
        stompClient.publish({
          destination: `/topic/seen-user-${partner}`,
          body: JSON.stringify({ reader: user })
        });
        msg.seen = true;
      } else {
        msg.seen = false;
      }

      // Add message to corresponding partner history
      setPrivateMessages((prev) => {
        const userMsgs = prev[partner] || [];
        return {
          ...prev,
          [partner]: [...userMsgs, msg]
        };
      });

      // Show toast if we are not actively viewing this partner's chat
      if (!isChatActive) {
        const contentPreview = msg.isAudio ? '🎤 Nota de Voz / Audio' : msg.content;
        showToast('Mensaje Privado', `De ${partner}: "${contentPreview.slice(0, 30)}${contentPreview.length > 30 ? '...' : ''}"`, 'success', partner);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [stompClient, user, showToast]);

  // Subscribe to own Typing notifications permanently
  useEffect(() => {
    if (!stompClient || !user) return;

    const channel = `/topic/typing-user-${user}`;
    const subscription = stompClient.subscribe(channel, (message) => {
      const payload = JSON.parse(message.body);
      setTypingUsers((prev) => ({
        ...prev,
        [payload.sender]: payload.typing
      }));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [stompClient, user]);

  // Subscribe to own Read Receipt / Seen notifications permanently
  useEffect(() => {
    if (!stompClient || !user) return;

    const channel = `/topic/seen-user-${user}`;
    const subscription = stompClient.subscribe(channel, (message) => {
      const payload = JSON.parse(message.body);
      const reader = payload.reader;

      setPrivateMessages((prev) => {
        const userMsgs = prev[reader] || [];
        const updatedMsgs = userMsgs.map((m) => {
          if (m.sender === user) {
            return { ...m, seen: true };
          }
          return m;
        });
        return {
          ...prev,
          [reader]: updatedMsgs
        };
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [stompClient, user]);

  // When opening a conversation, mark all unread messages as read
  useEffect(() => {
    if (activePrivateUser && stompClient && isOpen) {
      // Send seen notification to partner
      stompClient.publish({
        destination: `/topic/seen-user-${activePrivateUser}`,
        body: JSON.stringify({ reader: user })
      });

      // Mark received messages as seen locally
      setPrivateMessages((prev) => {
        const userMsgs = prev[activePrivateUser] || [];
        const updatedMsgs = userMsgs.map((m) => {
          if (m.sender !== user) {
            return { ...m, seen: true };
          }
          return m;
        });
        return {
          ...prev,
          [activePrivateUser]: updatedMsgs
        };
      });
    }
  }, [activePrivateUser, stompClient, isOpen, user]);

  // Fetch users for direct messages
  useEffect(() => {
    if (!token || !isOpen) return;

    const fetchUsers = async () => {
      try {
        const response = await fetch('/usuario/leaderboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setUsers(data.filter((u) => u.nombre !== user) || []);
        }
      } catch (err) {
        console.error('Error fetching users for chat:', err);
      }
    };

    fetchUsers();
  }, [token, isOpen, user]);

  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  useEffect(() => {
    privateChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [privateMessages, activePrivateUser, activeTab]);

  // Clean up recording and typing timeouts
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

    const handleClearChat = (shouldExport) => {
      if (shouldExport) {
        handleExportChat(activePrivateUser);
      }
      setPrivateMessages((prev) => ({
        ...prev,
        [activePrivateUser]: []
      }));
      setShowClearConfirm(false);
      showToast('Chat Limpiado', `Se ha borrado el historial con ${activePrivateUser}.`, 'success');
    };

    const handleClearGlobalChat = () => {
      setMessages([]);
      localStorage.removeItem('chat_global_msgs');
      setShowGlobalClearConfirm(false);
      showToast('Historial Limpiado', 'Se ha borrado tu copia local del chat global.', 'success');
    };

  const handleSendGlobal = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !stompClient) return;

    stompClient.publish({
      destination: '/app/chat.sendMessage',
      body: JSON.stringify({
        sender: user,
        content: inputValue.trim()
      })
    });
    setInputValue('');
  };

  const handleSendPrivate = (e) => {
    e.preventDefault();
    if (!privateInputValue.trim() || !stompClient || !activePrivateUser) return;

    // Send final "stopped typing" notification
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    stompClient.publish({
      destination: `/topic/typing-user-${activePrivateUser}`,
      body: JSON.stringify({ sender: user, typing: false })
    });

    const dest = `/topic/private-user-${activePrivateUser}`;
    const timestamp = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    const payload = {
      sender: user,
      content: privateInputValue.trim(),
      timestamp,
      seen: false
    };

    stompClient.publish({
      destination: dest,
      body: JSON.stringify(payload)
    });

    // Add self message locally
    setPrivateMessages((prev) => {
      const userMsgs = prev[activePrivateUser] || [];
      return {
        ...prev,
        [activePrivateUser]: [...userMsgs, payload]
      };
    });

    setPrivateInputValue('');
  };

  const handleInputChangePrivate = (e) => {
    setPrivateInputValue(e.target.value);

    // Notify broker that I am typing
    if (stompClient && activePrivateUser) {
      stompClient.publish({
        destination: `/topic/typing-user-${activePrivateUser}`,
        body: JSON.stringify({ sender: user, typing: true })
      });

      // Debounce notifying that I stopped typing
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        stompClient.publish({
          destination: `/topic/typing-user-${activePrivateUser}`,
          body: JSON.stringify({ sender: user, typing: false })
        });
      }, 2000);
    }
  };

  // Export Chat to .txt
  const handleExportChat = (partner) => {
    const chatHistory = privateMessages[partner] || [];
    if (chatHistory.length === 0) {
      showToast('Exportar Chat', 'No hay mensajes para exportar.', 'error');
      return;
    }
    
    let txt = `Historial de Chat Privado entre ${user} y ${partner}\n`;
    txt += `Exportado el: ${new Date().toLocaleString()}\n`;
    txt += `==========================================\n\n`;
    
    chatHistory.forEach((msg) => {
      const body = msg.isAudio ? '[Nota de Voz / Audio]' : msg.content;
      txt += `[${msg.timestamp}] ${msg.sender}: ${body}\n`;
    });

    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat_${partner}_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Chat Exportado', 'Conversación descargada con éxito.', 'success');
  };

  // HTML5 Microphone MediaRecorder API
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (stompClient && activePrivateUserRef.current) {
          stompClient.publish({
            destination: `/topic/typing-user-${activePrivateUserRef.current}`,
            body: JSON.stringify({ sender: user, typing: false })
          });
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          sendAudioMessage(reader.result);
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Notify typing block (acting as recording indicator)
      stompClient.publish({
        destination: `/topic/typing-user-${activePrivateUser}`,
        body: JSON.stringify({ sender: user, typing: true })
      });
    } catch (err) {
      console.error('Microphone error:', err);
      showToast('Error', 'No se pudo acceder al micrófono.', 'error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudioMessage = (base64Audio) => {
    if (!stompClient || !activePrivateUser) return;
    const dest = `/topic/private-user-${activePrivateUser}`;
    const timestamp = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    const payload = {
      sender: user,
      content: base64Audio,
      timestamp,
      isAudio: true,
      seen: false
    };

    stompClient.publish({
      destination: dest,
      body: JSON.stringify(payload)
    });

    setPrivateMessages((prev) => {
      const userMsgs = prev[activePrivateUser] || [];
      return {
        ...prev,
        [activePrivateUser]: [...userMsgs, payload]
      };
    });
  };

  return (
    <div className={`chat-sidebar ${isOpen ? 'open' : 'closed'}`}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>💬 Centro de Mensajes</h3>
          <span style={{ fontSize: '0.75rem', color: stompClient ? 'var(--success-color)' : 'var(--danger-color)' }}>
            ● {stompClient ? 'En línea' : 'Desconectado'}
          </span>
        </div>
        <button className="btn" onClick={onClose} style={{ padding: '0.25rem 0.5rem' }}>✕</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
        <button
          onClick={() => { setActiveTab('general'); setActivePrivateUser(null); }}
          style={{
            flex: 1,
            padding: '1rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'general' ? '2px solid var(--primary-color)' : 'none',
            color: activeTab === 'general' ? 'var(--primary-color)' : 'var(--text-secondary)',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          # General
        </button>
        <button
          onClick={() => setActiveTab('private')}
          style={{
            flex: 1,
            padding: '1rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'private' ? '2px solid var(--primary-color)' : 'none',
            color: activeTab === 'private' ? 'var(--primary-color)' : 'var(--text-secondary)',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          👥 Directos
        </button>
      </div>

      {/* Content Body */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Tab 1: Global Chat */}
        {activeTab === 'general' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1.5rem', overflow: 'hidden' }}>
            {/* Header for General Chat */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                📢 Canal General
              </div>
              <button
                className="btn"
                onClick={() => setShowGlobalClearConfirm(true)}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', color: 'var(--danger-color)', borderColor: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Limpiar historial general local"
              >
                🗑️ Limpiar
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.5rem', marginBottom: '1rem' }}>
              {messages.length === 0 ? (
                <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '80%' }}>
                  👋 ¡Hola! El chat está vacío. Di algo para iniciar la conversación en tiempo real.
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isSelf = msg.sender === user;
                  return (
                    <div key={index} style={{ alignSelf: isSelf ? 'flex-end' : 'flex-start', maxWidth: '85%', display: 'flex', flexDirection: 'column', alignItems: isSelf ? 'flex-end' : 'flex-start' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.15rem' }}>
                        {msg.sender} <span style={{ opacity: 0.6 }}>({msg.timestamp})</span>
                      </div>
                      <div style={{
                        background: isSelf ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.05)',
                        border: isSelf ? 'none' : '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        padding: '0.65rem 0.95rem',
                        borderRadius: isSelf ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                        fontSize: '0.9rem',
                        lineHeight: '1.4',
                        boxShadow: isSelf ? '0 4px 12px var(--primary-glow)' : 'none'
                      }}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendGlobal} style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <input
                type="text"
                placeholder="Escribe un mensaje..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={!stompClient}
                style={{ flex: 1, padding: '0.6rem 1rem' }}
              />
              <button type="submit" className="btn btn-primary" disabled={!stompClient || !inputValue.trim()}>
                Enviar
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Private Direct Messages */}
        {activeTab === 'private' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            
            {/* Contacts list sidebar (if no user is active) */}
            {!activePrivateUser ? (
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>
                  Selecciona un usuario
                </h4>
                {users.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', marginTop: '2rem' }}>No hay otros usuarios registrados para chatear.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {users.map((u, idx) => (
                      <div
                        key={idx}
                        onClick={() => setActivePrivateUser(u.nombre)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.75rem 1rem',
                          borderRadius: '10px',
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid var(--border-color)',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        className="btn-hover"
                      >
                        <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: 'var(--success-color)' }}></div>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.nombre}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{u.perfil}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Active Private Chat conversation view */
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1.5rem', overflow: 'hidden' }}>
                {/* Chat Partner Header with Export Button */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      className="btn"
                      onClick={() => setActivePrivateUser(null)}
                      style={{ padding: '0', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}
                      title="Volver a la lista de chats"
                    >
                      ←
                    </button>
                    <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-primary)' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success-color)', display: 'inline-block' }}></span>
                        {activePrivateUser}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Mensaje Privado</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button
                      className="btn"
                      onClick={() => handleExportChat(activePrivateUser)}
                      style={{ padding: '0.4rem 0.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="Guardar chat (.txt)"
                    >
                      📥
                    </button>
                    <button
                      className="btn"
                      onClick={() => setShowClearConfirm(true)}
                      style={{ padding: '0.4rem 0.5rem', fontSize: '0.9rem', color: 'var(--danger-color)', borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="Limpiar chat"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Private Messages feed */}
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.5rem', marginBottom: '1rem' }}>
                  {!(privateMessages[activePrivateUser]) || privateMessages[activePrivateUser].length === 0 ? (
                    <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      🔒 Los mensajes enviados en esta sala están encriptados en el canal de socket directo. Di hola a {activePrivateUser}.
                    </div>
                  ) : (
                    privateMessages[activePrivateUser].map((msg, index) => {
                      const isSelf = msg.sender === user;
                      return (
                        <div key={index} style={{ alignSelf: isSelf ? 'flex-end' : 'flex-start', maxWidth: '85%', display: 'flex', flexDirection: 'column', alignItems: isSelf ? 'flex-end' : 'flex-start' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.15rem' }}>
                            {msg.sender} <span style={{ opacity: 0.6 }}>({msg.timestamp})</span>
                          </div>
                          <div style={{
                            background: isSelf ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.05)',
                            border: isSelf ? 'none' : '1px solid var(--border-color)',
                            color: 'var(--text-primary)',
                            padding: '0.65rem 0.95rem',
                            borderRadius: isSelf ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                            fontSize: '0.9rem',
                            lineHeight: '1.4',
                            boxShadow: isSelf ? '0 4px 12px var(--primary-glow)' : 'none',
                            textAlign: 'left'
                          }}>
                            {msg.isAudio ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>🎤 Nota de Voz</span>
                                <audio controls src={msg.content} style={{ maxWidth: '240px', height: '40px' }} />
                              </div>
                            ) : (
                              msg.content
                            )}
                          </div>
                          {/* Seen / Read indicators */}
                          {isSelf && (
                            <div style={{ fontSize: '0.7rem', color: msg.seen ? 'var(--primary-color)' : 'var(--text-secondary)', marginTop: '0.15rem', paddingRight: '0.25rem' }}>
                              {msg.seen ? '✓✓ Visto' : '✓ Enviado'}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                  <div ref={privateChatEndRef} />
                </div>

                {/* Typing status indicator */}
                {typingUsers[activePrivateUser] && (
                  <div style={{
                    fontSize: '0.8rem',
                    color: 'var(--primary-color)',
                    fontStyle: 'italic',
                    marginBottom: '0.5rem',
                    textAlign: 'left',
                    opacity: 0.8
                  }}>
                    ✍️ {activePrivateUser} está escribiendo...
                  </div>
                )}

                {/* Input and Actions Bar */}
                <form onSubmit={handleSendPrivate} style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  {/* Microphone recorder button */}
                  <button
                    type="button"
                    className={`btn ${isRecording ? 'btn-danger' : ''}`}
                    onClick={isRecording ? stopRecording : startRecording}
                    style={{
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      background: isRecording ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.03)',
                      borderColor: isRecording ? 'var(--danger-color)' : 'var(--border-color)',
                      color: isRecording ? 'var(--danger-color)' : 'var(--text-primary)',
                      fontSize: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title={isRecording ? "Detener grabación y enviar" : "Grabar Nota de Voz"}
                  >
                    {isRecording ? '🛑' : '🎤'}
                  </button>

                  <input
                    type="text"
                    placeholder={isRecording ? "Grabando audio..." : `Hablar con ${activePrivateUser}...`}
                    value={privateInputValue}
                    onChange={handleInputChangePrivate}
                    disabled={!stompClient || isRecording}
                    style={{ flex: 1, padding: '0.6rem 1rem' }}
                  />
                  <button type="submit" className="btn btn-primary" disabled={!stompClient || !privateInputValue.trim() || isRecording}>
                    Enviar
                  </button>
                </form>
              </div>
            )}

          </div>
        )}

      {showClearConfirm && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-content fade-in" style={{ maxWidth: '400px', textAlign: 'center', padding: '2.25rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--danger-color)' }}>
              🗑️ ¿Limpiar Conversación?
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '2rem' }}>
              Esto eliminará todo el historial con <strong>{activePrivateUser}</strong> de este dispositivo. Te sugerimos exportarlo primero.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button className="btn btn-primary" onClick={() => handleClearChat(true)}>
                📥 Exportar y Limpiar
              </button>
              <button className="btn" style={{ color: 'var(--danger-color)', borderColor: 'rgba(239, 68, 68, 0.2)' }} onClick={() => handleClearChat(false)}>
                🗑️ Solo Limpiar
              </button>
              <button className="btn" onClick={() => setShowClearConfirm(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {showGlobalClearConfirm && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-content fade-in" style={{ maxWidth: '400px', textAlign: 'center', padding: '2.25rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--danger-color)' }}>
              🗑️ ¿Limpiar Canal General?
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '2rem' }}>
              Esto borrará <strong>tu copia local</strong> del historial del canal general en este dispositivo. No afectará los mensajes de otros usuarios.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                className="btn btn-primary"
                style={{ background: 'var(--danger-color)', justifyContent: 'center' }}
                onClick={handleClearGlobalChat}
              >
                🗑️ Confirmar y Limpiar
              </button>
              <button className="btn" style={{ justifyContent: 'center' }} onClick={() => setShowGlobalClearConfirm(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default GlobalChat;
