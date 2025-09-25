import React, { useState, useEffect } from 'react';

// Helper component for individual stat cards
function SimpleStatCard({ title, value, icon }: { title: string, value: string | number, icon: string }) {
  return (
    <div style={{
      background: 'rgba(30, 41, 59, 0.5)',
      border: '1px solid rgba(51, 65, 85, 0.5)',
      borderRadius: '1rem',
      padding: '1.5rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ fontSize: '2rem' }}>{icon}</div>
        <div>
          <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>{title}</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'white' }}>{value}</div>
        </div>
      </div>
    </div>
  );
}

// Helper component for action buttons
function ActionButton({ title, description, icon, onClick }: { title: string, description: string, icon: string, onClick: () => void }) {
  return (
    <button onClick={onClick} style={styles.actionButton}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '1.5rem' }}>{icon}</span>
        <span style={{ fontSize: '1.125rem', fontWeight: '600' }}>{title}</span>
      </div>
      <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
        {description}
      </div>
    </button>
  );
}

// Helper component for recent activity items
function ActivityItem({ type, message, time, color }: { type: string, message: string, time: string, color: string }) {
  return (
    <div style={{ ...styles.activityItem, background: `${color}10`, border: `1px solid ${color}20` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: '500', color }}>{type}</span>
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{time}</span>
      </div>
      <p style={{ fontSize: '0.875rem', color: '#d1d5db', margin: 0 }}>{message}</p>
    </div>
  );
}

// Main Dashboard Component
export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch('http://localhost:8000/stats')
      .then(res => res.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  return (
    <div style={styles.pageContainer}>
      <div style={styles.contentWrapper}>
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={styles.header}>Intelligence Dashboard</h1>
          <p style={styles.subHeader}>Stealer log aggregation and threat intelligence overview</p>
        </div>

        <div style={styles.statsGrid}>
          <SimpleStatCard title="Total Credentials" value={stats ? stats.total_credentials.toLocaleString() : '...'} icon="🔐" />
          <SimpleStatCard title="Infected Systems" value={stats ? stats.total_systems.toLocaleString() : '...'} icon="💻" />
          <SimpleStatCard title="Unique Domains" value={stats ? stats.unique_domains.toLocaleString() : '...'} icon="🌐" />
          <SimpleStatCard title="Stealer Families" value={stats ? (stats.unique_stealers?.toLocaleString() || 'N/A') : '...'} icon="🦠" />
        </div>

        <div style={styles.sectionContainer}>
          <h2 style={styles.sectionTitle}>🚀 Quick Actions</h2>
          <div style={styles.actionsGrid}>
            <ActionButton title="Search Credentials" description="Browse through stolen credentials" icon="🔍" onClick={() => window.location.href = '/search'} />
            <ActionButton title="View Analytics" description="Analyze threat intelligence data" icon="📊" onClick={() => window.location.href = '/analytics'} />
            <ActionButton title="API Documentation" description="Integrate with our REST API" icon="📚" onClick={() => window.location.href = '/api'} />
          </div>
        </div>

        <div style={styles.sectionContainer}>
          <h2 style={styles.sectionTitle}>📈 Recent Intelligence</h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <ActivityItem type="High Risk" message="Banking credentials detected from RedLine stealer" time="2 hours ago" color="#ef4444" />
            <ActivityItem type="Medium Risk" message="Corporate email credentials from Raccoon stealer" time="4 hours ago" color="#f59e0b" />
            <ActivityItem type="Info" message="New stealer variant detected: LummaC2 v4.0" time="6 hours ago" color="#3b82f6" />
          </div>
        </div>
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
    marginBottom: '3rem'
  },
  sectionContainer: {
    background: 'rgba(30, 41, 59, 0.5)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(51, 65, 85, 0.5)',
    borderRadius: '1rem',
    padding: '2rem',
    marginBottom: '2rem'
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '1.5rem'
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem'
  },
  actionButton: {
    background: 'rgba(15, 23, 42, 0.8)',
    border: '1px solid rgba(51, 65, 85, 0.5)',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    color: 'white',
    width: '100%'
  },
  activityItem: {
    padding: '1rem',
    borderRadius: '0.5rem'
  }
};
