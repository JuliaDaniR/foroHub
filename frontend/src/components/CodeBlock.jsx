import React, { useState } from 'react';

function CodeBlock({ text }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!text) return null;

  // Split text by code blocks: ```[language]\n[code]\n```
  const parts = text.split(/(```[\s\S]*?```)/g);

  const handleCopy = (codeText, index) => {
    navigator.clipboard.writeText(codeText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div>
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          // Extract language and code content
          const lines = part.slice(3, -3).trim().split('\n');
          const firstLine = lines[0].trim();
          
          // Basic check if first line is a language identifier
          const isLanguage = /^[a-zA-Z0-9+#-]+$/.test(firstLine);
          const language = isLanguage ? firstLine : '';
          const codeContent = isLanguage ? lines.slice(1).join('\n') : lines.join('\n');

          return (
            <div
              key={index}
              style={{
                position: 'relative',
                margin: '1.25rem 0',
                background: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                overflow: 'hidden',
                fontFamily: 'monospace'
              }}
            >
              {/* Top bar with Language and Copy Button */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '0.4rem 1rem',
                  borderBottom: '1px solid var(--border-color)',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)'
                }}
              >
                <span>{language.toUpperCase() || 'CODE'}</span>
                <button
                  onClick={() => handleCopy(codeContent, index)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: copiedIndex === index ? 'var(--success-color)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}
                >
                  {copiedIndex === index ? '✓ Copiado' : '📋 Copiar'}
                </button>
              </div>

              {/* Code display */}
              <pre
                style={{
                  margin: 0,
                  padding: '1rem',
                  overflowX: 'auto',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  color: '#e5c76b', // soft code color
                  textAlign: 'left'
                }}
              >
                <code>{codeContent}</code>
              </pre>
            </div>
          );
        }

        // Render normal text (with simple line breaks support)
        return (
          <p
            key={index}
            style={{
              whiteSpace: 'pre-wrap',
              margin: '0.5rem 0',
              lineHeight: '1.6',
              textAlign: 'left'
            }}
          >
            {part}
          </p>
        );
      })}
    </div>
  );
}

export default CodeBlock;
