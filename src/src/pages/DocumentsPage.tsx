import type { CSSProperties } from 'react';
import type { PlantDocument } from '../types/documents';

interface DocumentsPageProps {
  documents: PlantDocument[];
  theme?: 'dark' | 'light';
}

export default function DocumentsPage({
  documents,
  theme = 'dark',
}: DocumentsPageProps) {
  const categories = Array.from(new Set(documents.map((d) => d.category)));

  return (
    <div>
      <h2
        style={{
          marginTop: 0,
          marginBottom: 8,
          color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
          letterSpacing: '0.5px',
        }}
      >
        DOCUMENTS
      </h2>
      <p
        style={{
          color: '#64748b',
          marginTop: 0,
          marginBottom: 20,
          fontSize: 13,
          letterSpacing: '0.5px',
        }}
      >
        {documents.length} TOTAL
      </p>

      {categories.map((category) => {
        const categoryDocs = documents.filter((d) => d.category === category);

        return (
          <div key={category} style={{ marginBottom: 30 }}>
            <h3
              style={{
                marginBottom: 12,
                fontSize: 16,
                color: '#f97316',
                letterSpacing: '0.5px',
                fontWeight: 800,
              }}
            >
              {category.toUpperCase()} ({categoryDocs.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {categoryDocs.map((doc) => (
                <div key={doc.id} style={getDocCardStyle(theme)}>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 15,
                        marginBottom: 4,
                        color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
                      }}
                    >
                      {doc.title}
                    </div>
                    <div style={{ fontSize: 13, color: '#64748b' }}>
                      {doc.department} • {doc.type}
                    </div>
                    {doc.description && (
                      <div
                        style={{ fontSize: 13, color: '#94a3b8', marginTop: 6 }}
                      >
                        {doc.description}
                      </div>
                    )}
                  </div>

                  <div
                    style={{ display: 'flex', gap: 8, alignItems: 'center' }}
                  >
                    <span style={getStatusBadge(doc.status)}>{doc.status}</span>
                    <button style={viewButtonStyle}>VIEW</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getDocCardStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    background: theme === 'dark' ? '#1e293b' : '#ffffff',
    padding: 16,
    borderRadius: 6,
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  };
}

function getStatusBadge(status: string): CSSProperties {
  const colors: Record<string, { bg: string; color: string; border: string }> =
    {
      CURRENT: { bg: '#d1fae5', color: '#059669', border: '#10b981' },
      REVIEW: { bg: '#fef3c7', color: '#d97706', border: '#f59e0b' },
      ARCHIVED: { bg: '#e2e8f0', color: '#475569', border: '#64748b' },
    };

  const style = colors[status] || colors.CURRENT;

  return {
    padding: '4px 10px',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 800,
    background: style.bg,
    color: style.color,
    border: `1px solid ${style.border}`,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  };
}

const viewButtonStyle: CSSProperties = {
  padding: '6px 14px',
  background: 'rgba(249, 115, 22, 0.1)',
  border: '1px solid #f97316',
  borderRadius: 4,
  color: '#f97316',
  fontSize: 12,
  fontWeight: 800,
  cursor: 'pointer',
  letterSpacing: '0.5px',
  transition: 'all 0.2s',
};
