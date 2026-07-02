import React, { useState, useEffect } from 'react';
import CodeBlock from './CodeBlock';

function TopicDetail({ token, topicId, userId, showToast, onBack }) {
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newReply, setNewReply] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [summary, setSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Edit Topic states
  const [isEditingTopic, setIsEditingTopic] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editMessage, setEditMessage] = useState('');

  // Edit Reply states
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editReplyMessage, setEditReplyMessage] = useState('');

  const handleSummarize = async () => {
    setLoadingSummary(true);
    setSummary('');
    try {
      const response = await fetch('/ai/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          titulo: topic.titulo,
          mensaje: topic.mensaje,
          respuestas: topic.respuestas ? topic.respuestas.map(r => `${r.nombreAutor}: ${r.mensaje}`) : []
        })
      });
      if (response.ok) {
        const data = await response.json();
        setSummary(data.resumen);
        showToast('Resumen Generado', 'La IA ha condensado el hilo de conversación.', 'success');
      } else {
        throw new Error('Error al conectar con el servicio de IA.');
      }
    } catch (err) {
      showToast('Error', err.message, 'error');
    } finally {
      setLoadingSummary(false);
    }
  };

  const fetchTopicDetail = async () => {
    try {
      const response = await fetch(`/topico/detalle/${topicId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('No se pudo cargar el detalle del tópico.');
      }

      const data = await response.json();
      setTopic(data);
      // Initialize edit fields
      setEditTitle(data.titulo || '');
      setEditMessage(data.mensaje || '');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopicDetail();
  }, [topicId, token]);

  const handlePostReply = async (e) => {
    e.preventDefault();
    if (!newReply.trim()) return;

    setSubmittingReply(true);
    const autorId = localStorage.getItem('userId');

    try {
      const response = await fetch('/respuesta/registrar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          mensaje: newReply,
          autorId: parseInt(autorId),
          topicoId: topicId,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al registrar la respuesta.');
      }

      setNewReply('');
      fetchTopicDetail(); // Refresh list
      showToast('Respuesta Enviada', 'Tu respuesta ha sido publicada en el hilo.', 'success');
    } catch (err) {
      showToast('Error', err.message, 'error');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleSaveTopicEdit = async () => {
    if (!editTitle.trim() || !editMessage.trim()) {
      showToast('Campos vacíos', 'El título y el mensaje no pueden estar vacíos.', 'error');
      return;
    }

    try {
      const response = await fetch('/topico/actualizar', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: topic.id,
          titulo: editTitle,
          mensaje: editMessage
        })
      });

      if (response.ok) {
        showToast('Tópico Actualizado', 'Los cambios se han guardado correctamente.', 'success');
        setIsEditingTopic(false);
        fetchTopicDetail();
      } else {
        throw new Error('No se pudo actualizar el tópico.');
      }
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleSaveReplyEdit = async (replyId) => {
    if (!editReplyMessage.trim()) {
      showToast('Campo vacío', 'La respuesta no puede estar vacía.', 'error');
      return;
    }

    try {
      const response = await fetch('/respuesta/actualizar', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: replyId,
          mensaje: editReplyMessage
        })
      });

      if (response.ok) {
        showToast('Respuesta Actualizada', 'Los cambios en tu respuesta se han guardado.', 'success');
        setEditingReplyId(null);
        fetchTopicDetail();
      } else {
        throw new Error('No se pudo actualizar la respuesta.');
      }
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleMarkAsSolution = async (replyId) => {
    try {
      const response = await fetch(`/respuesta/solucion/${replyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'No se pudo marcar como solución.');
      }

      fetchTopicDetail();
      showToast('Solución Aceptada', 'Has marcado esta respuesta como la solución.', 'success');
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const executeDeleteTopic = async () => {
    try {
      const response = await fetch(`/topico/eliminar/${topicId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el tópico.');
      }

      showToast('Tópico Eliminado', 'El tópico fue eliminado correctamente.', 'success');
      onBack();
    } catch (err) {
      showToast('Error', err.message, 'error');
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const formatCategoryName = (cat) => {
    if (!cat) return '';
    return cat.replace(/_/g, ' ');
  };

  const parseSummaryToHtml = (text) => {
    if (!text) return '';
    let html = text.replace(/###\s*(.*)/g, '<h4 style="font-size: 1.1rem; font-weight: 800; margin-bottom: 0.75rem; color: var(--primary-color); display: flex; align-items: center; gap: 0.5rem;">$1</h4>');
    html = html.replace(/\*\*(.*?):\*\*/g, '<strong style="color: var(--text-primary); font-weight: 700;">$1:</strong>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return html.split('\n').map(line => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('<h4')) return trimmed;
      return `<p style="margin: 0.5rem 0; line-height: 1.6; font-size: 0.95rem; color: var(--text-secondary);">${trimmed}</p>`;
    }).filter(Boolean).join('');
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Cargando detalles...</div>;
  if (error) return <div className="card" style={{ color: 'var(--danger-color)' }}>⚠️ Error: {error}</div>;
  if (!topic) return null;

  const currentUsername = localStorage.getItem('user');
  const isAuthor = currentUsername === topic.autor;

  return (
    <div className="fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <button className="btn" onClick={onBack} style={{ marginBottom: '1.5rem' }}>
        ← Volver al Foro
      </button>

      {/* Main Topic Post */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        {isEditingTopic ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
            <h4 style={{ margin: 0, fontWeight: 800 }}>✏️ Editar Tópico</h4>
            <div className="form-group">
              <label>Título</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Mensaje</label>
              <textarea
                rows="8"
                value={editMessage}
                onChange={(e) => setEditMessage(e.target.value)}
                required
              ></textarea>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setIsEditingTopic(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleSaveTopicEdit}>
                Guardar Cambios
              </button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  📚 {formatCategoryName(topic.nombreCategoria)} • Creado por <strong>{topic.autor}</strong> en {topic.fechaCreacion}
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--text-primary)' }}>
                  {topic.titulo}
                </h2>
              </div>
              {isAuthor && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn" onClick={() => setIsEditingTopic(true)} title="Editar tópico">
                    ✏️ Editar
                  </button>
                  <button className="btn" onClick={() => setShowDeleteConfirm(true)} style={{ color: 'var(--danger-color)', borderColor: 'rgba(239, 68, 68, 0.2)' }} title="Eliminar tópico">
                    🗑️ Eliminar
                  </button>
                </div>
              )}
            </div>
            <div style={{ color: 'var(--text-primary)', fontSize: '1.05rem', lineHeight: '1.7', textAlign: 'left' }}>
              <CodeBlock text={topic.mensaje} />
            </div>
          </>
        )}
      </div>

      {/* AI Summary Section */}
      <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
        {summary ? (
          <div className="card" style={{
            background: 'radial-gradient(circle at top right, var(--primary-glow), transparent), var(--bg-glass)',
            borderColor: 'var(--primary-color)',
            borderLeft: '4px solid var(--primary-color)',
            padding: '1.5rem',
            position: 'relative'
          }}>
            <button className="btn" onClick={() => setSummary('')} style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>✕ Cerrar</button>
            <div
              style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: '1.6', marginTop: '0.5rem' }}
              dangerouslySetInnerHTML={{ __html: parseSummaryToHtml(summary) }}
            />
          </div>
        ) : (
          <button
            className="btn"
            onClick={handleSummarize}
            disabled={loadingSummary}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px dashed var(--primary-color)',
              color: 'var(--primary-color)',
              width: '100%',
              justifyContent: 'center',
              padding: '1rem'
            }}
          >
            {loadingSummary ? '🤖 Analizando hilo y generando resumen...' : '✨ Resumir Hilo con IA'}
          </button>
        )}
      </div>

      {/* Answers/Replies Section */}
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', textAlign: 'left' }}>
        Respuestas ({topic.respuestas ? topic.respuestas.length : 0})
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
        {(!topic.respuestas || topic.respuestas.length === 0) ? (
          <div style={{ color: 'var(--text-secondary)', padding: '1.5rem', textAlign: 'center', background: 'rgba(255,255,255,0.01)', borderRadius: '12px' }}>
            Nadie ha respondido a este tópico todavía. ¡Inicia el debate escribiendo una respuesta abajo!
          </div>
        ) : (
          topic.respuestas.map((reply) => {
            const isReplyAuthor = currentUsername === reply.nombreAutor;
            const isEditingThisReply = editingReplyId === reply.id;
            return (
              <div
                key={reply.id}
                className="card fade-in"
                style={{
                  background: reply.solucion ? 'rgba(16, 185, 129, 0.05)' : 'radial-gradient(circle at top right, var(--primary-glow), transparent), var(--bg-glass)',
                  borderColor: reply.solucion ? 'var(--success-color)' : 'var(--border-color)',
                  padding: '1.25rem',
                  textAlign: 'left'
                }}
              >
                {isEditingThisReply ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h4 style={{ margin: 0, fontWeight: 800 }}>✏️ Editar Respuesta</h4>
                    <div className="form-group">
                      <textarea
                        rows="4"
                        value={editReplyMessage}
                        onChange={(e) => setEditReplyMessage(e.target.value)}
                        required
                      ></textarea>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button className="btn" onClick={() => setEditingReplyId(null)}>
                        Cancelar
                      </button>
                      <button className="btn btn-primary" onClick={() => handleSaveReplyEdit(reply.id)}>
                        Guardar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Por <strong>{reply.nombreAutor}</strong> ({reply.perfilAutor.replace('ROLE_', '')}) • {reply.fechaCreacion}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {isReplyAuthor && (
                          <button
                            className="btn"
                            onClick={() => {
                              setEditingReplyId(reply.id);
                              setEditReplyMessage(reply.mensaje);
                            }}
                            style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem' }}
                            title="Editar mi respuesta"
                          >
                            ✏️
                          </button>
                        )}
                        {reply.solucion ? (
                          <span style={{ color: 'var(--success-color)', fontWeight: 700, fontSize: '0.85rem' }}>
                            ✔ Solución Aceptada
                          </span>
                        ) : (
                          isAuthor && !isReplyAuthor && (
                            <button
                              className="btn"
                              onClick={() => handleMarkAsSolution(reply.id)}
                              style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', color: 'var(--success-color)', borderColor: 'rgba(16, 185, 129, 0.2)' }}
                            >
                              ✓ Marcar como Solución
                            </button>
                          )
                        )}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: '0.5rem' }}>
                      <CodeBlock text={reply.mensaje} />
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Reply Form */}
      <div className="card" style={{ textAlign: 'left' }}>
        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Escribe una respuesta</h4>
        <form onSubmit={handlePostReply}>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <textarea
              rows="4"
              placeholder="Comparte tu conocimiento o haz una pregunta aclaratoria..."
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              required
            ></textarea>
          </div>
          <button type="submit" className="btn btn-primary" disabled={submittingReply}>
            {submittingReply ? 'Publicando...' : 'Responder'}
          </button>
        </form>
      </div>

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content fade-in" style={{ maxWidth: '400px', textAlign: 'center', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--danger-color)' }}>🗑️ ¿Eliminar Tópico?</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
              Esta acción es irreversible y borrará permanentemente este tópico del foro.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button className="btn btn-primary" style={{ background: 'var(--danger-color)', justifyContent: 'center' }} onClick={executeDeleteTopic}>
                Confirmar y Eliminar
              </button>
              <button className="btn" style={{ justifyContent: 'center' }} onClick={() => setShowDeleteConfirm(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TopicDetail;
