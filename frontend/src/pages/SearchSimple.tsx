import React, { useState, useEffect } from 'react';

// --- Helper Functions & Components ---

// API call functions
const searchApi = async (type: 'credentials' | 'systems', params: any) => {
  const response = await fetch(`http://localhost:8000/search/${type}?${new URLSearchParams(params)}`);
  if (!response.ok) {
    throw new Error(`Network response was not ok for ${type}. Is the backend running?`);
  }
  return response.json();
};

// Search Instructions Component
function SearchInstructions() {
  return (
    <div style={styles.instructionsContainer}>
      <h3 style={styles.instructionsTitle}>🔍 Advanced Search Query Language</h3>
      <p style={styles.instructionsText}>
        Enter at least 3 characters to search. Use the following prefixes for targeted searches:
      </p>
      <div style={styles.instructionsGrid}>
        <div style={styles.instructionsColumn}>
          <code style={styles.codeBlock}>domain:google.com</code>
          <code style={styles.codeBlock}>user:admin</code>
          <code style={styles.codeBlock}>password:123456</code>
        </div>
        <div style={styles.instructionsColumn}>
          <code style={styles.codeBlock}>ip:192.168.1.1</code>
          <code style={styles.codeBlock}>country:US</code>
          <code style={styles.codeBlock}>stealer:redline</code>
        </div>
      </div>
      <p style={styles.instructionsText}>Combine terms for more precise results, e.g., <code style={styles.codeExample}>domain:facebook.com stealer:raccoon</code>.</p>
    </div>
  );
}

// Credential Card Component
function CredentialCard({ item }: { item: any }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <h3 style={styles.cardTitle}>👤 {item.username || 'No Username'}</h3>
        <span style={styles.cardId}>ID: {item.id}</span>
      </div>
      <div style={styles.cardBody}>
        <InfoRow label="Password" value={showPassword ? item.password : '••••••••••'} isPassword={true} onToggle={() => setShowPassword(!showPassword)} showPassword={showPassword} />
        <InfoRow label="Domain/Host" value={item.domain || item.host} />
        <InfoRow label="Software" value={item.software} />
        <InfoRow label="Stealer" value={item.stealer_name} />
      </div>
      <div style={styles.cardFooter}>
        <span>Source: {item.filepath?.split('/').pop() || 'Unknown'}</span>
        <span>{new Date(item.created_at).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

// System Card Component
function SystemCard({ item }: { item: any }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <h3 style={styles.cardTitle}>💻 {item.computer_name || 'Unknown System'}</h3>
        <span style={styles.cardId}>ID: {item.id}</span>
      </div>
      <div style={styles.cardBody}>
        <InfoRow label="IP Address" value={item.ip_address} />
        <InfoRow label="Country" value={item.country} />
        <InfoRow label="Machine User" value={item.machine_user} />
        <InfoRow label="Hardware ID" value={item.hardware_id} />
      </div>
      <div style={styles.cardFooter}>
        <span>Log Date: {item.log_date}</span>
      </div>
    </div>
  );
}

// Info Row Helper
function InfoRow({ label, value, isPassword = false, onToggle, showPassword }: any) {
  return (
    <div>
      <span style={styles.infoLabel}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={isPassword && showPassword ? styles.infoValuePassword : styles.infoValue}>
          {value || 'N/A'}
        </span>
        {isPassword && (
          <button onClick={onToggle} style={styles.toggleButton}>
            {showPassword ? '🙈' : '👁️'}
          </button>
        )}
      </div>
    </div>
  );
}

// --- Main Search Component ---
export default function SearchSimple() {
  const [searchType, setSearchType] = useState<'credentials' | 'systems'>('credentials');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [results, setResults] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const limit = 50;

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      setTotal(0);
      setError(null);
      return;
    }

    const handleSearch = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await searchApi(searchType, { q: query, limit, offset: (page - 1) * limit });
        setResults(data.results || []);
        setTotal(data.total || 0);
      } catch (err: any) {
        setError(err.message);
        setResults([]);
        setTotal(0);
      }
      setIsLoading(false);
    };

    const debounce = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(debounce);
  }, [query, page, searchType]);

  return (
    <div style={styles.pageContainer}>
      <div style={styles.contentWrapper}>
        <h1 style={styles.header}>Search Intelligence</h1>
        <p style={styles.subHeader}>Search across {total.toLocaleString()} records. Type to begin.</p>

        <div style={styles.searchControls}>
          <div style={styles.tabContainer}>
            <button
              onClick={() => setSearchType('credentials')}
              style={searchType === 'credentials' ? styles.tabActive : styles.tab}
            >
              🔐 Credentials
            </button>
            <button
              onClick={() => setSearchType('systems')}
              style={searchType === 'systems' ? styles.tabActive : styles.tab}
            >
              💻 Systems
            </button>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder={`Search ${searchType} (e.g., domain:google.com)...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        {query.length < 3 ? (
          <SearchInstructions />
        ) : isLoading ? (
          <div style={styles.loadingText}>Searching...</div>
        ) : results.length > 0 ? (
          <div style={styles.resultsContainer}>
            {results.map((item) =>
              searchType === 'credentials' ? (
                <CredentialCard key={`cred-${item.id}`} item={item} />
              ) : (
                <SystemCard key={`sys-${item.id}`} item={item} />
              )
            )}
          </div>
        ) : (
          <div style={styles.noResults}>No results found for your query.</div>
        )}

        {total > limit && (
          <div style={styles.pagination}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</button>
            <span>Page {page} of {Math.ceil(total / limit)}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / limit)}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Styles ---
const styles: { [key: string]: React.CSSProperties } = {
  pageContainer: {
    minHeight: '100vh',
    padding: '2rem',
    color: 'white',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    background: '#0f172a'
  },
  contentWrapper: {
    maxWidth: '80rem',
    margin: '0 auto'
  },
  header: {
    fontSize: '3rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%)',
    WebkitBackgroundClip: 'text',
    // @ts-ignore
    WebkitTextFillColor: 'transparent'
  },
  subHeader: {
    fontSize: '1.125rem',
    color: '#94a3b8',
    marginBottom: '2rem'
  },
  searchControls: {
    background: 'rgba(30, 41, 59, 0.5)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(51, 65, 85, 0.5)',
    borderRadius: '1rem',
    padding: '1.5rem',
    marginBottom: '2rem'
  },
  tabContainer: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    background: 'rgba(15, 23, 42, 0.8)',
    padding: '0.25rem',
    borderRadius: '0.75rem',
    width: 'fit-content'
  },
  tab: {
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontWeight: '500'
  },
  tabActive: {
    background: '#3b82f6',
    border: 'none',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontWeight: '600',
    boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.25)'
  },
  searchInput: {
    width: '100%',
    padding: '0.75rem 1rem',
    background: 'rgba(15, 23, 42, 0.8)',
    border: '1px solid rgba(51, 65, 85, 0.5)',
    borderRadius: '0.5rem',
    color: 'white',
    fontSize: '1rem'
  },
  errorBox: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '0.75rem',
    padding: '1rem',
    marginBottom: '2rem',
    color: '#f87171'
  },
  loadingText: {
    textAlign: 'center',
    padding: '4rem 0',
    fontSize: '1.25rem',
    color: '#94a3b8'
  },
  noResults: {
    textAlign: 'center',
    padding: '4rem 0',
    fontSize: '1.25rem',
    color: '#94a3b8'
  },
  resultsContainer: {
    display: 'grid',
    gap: '1rem'
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '2rem'
  },
  instructionsContainer: {
    background: 'rgba(30, 41, 59, 0.5)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(51, 65, 85, 0.5)',
    borderRadius: '1rem',
    padding: '2rem',
    textAlign: 'center'
  },
  instructionsTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '1rem'
  },
  instructionsText: {
    color: '#94a3b8',
    marginBottom: '1.5rem'
  },
  instructionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem'
  },
  instructionsColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  codeBlock: {
    background: 'rgba(15, 23, 42, 0.8)',
    padding: '0.5rem 0.75rem',
    borderRadius: '0.25rem',
    fontFamily: 'monospace',
    color: '#d1d5db'
  },
  codeExample: {
    background: 'rgba(15, 23, 42, 0.8)',
    padding: '0.25rem 0.5rem',
    borderRadius: '0.25rem',
    fontFamily: 'monospace',
    color: '#10b981'
  },
  card: {
    background: 'rgba(30, 41, 59, 0.5)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(51, 65, 85, 0.5)',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    transition: 'border-color 0.3s ease'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem'
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: 'white',
    margin: 0
  },
  cardId: {
    fontSize: '0.75rem',
    color: '#64748b'
  },
  cardBody: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '1rem'
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '1rem',
    borderTop: '1px solid rgba(51, 65, 85, 0.3)',
    fontSize: '0.75rem',
    color: '#94a3b8'
  },
  infoLabel: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.25rem',
    display: 'block'
  },
  infoValue: {
    color: 'white',
    fontWeight: '500',
    fontFamily: 'monospace'
  },
  infoValuePassword: {
    color: '#ef4444',
    fontWeight: '500',
    fontFamily: 'monospace'
  },
  toggleButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 0
  }
};
