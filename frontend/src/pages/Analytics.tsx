import React, { useState, useEffect } from 'react';

// This is a new, self-contained, and functional Analytics page.
// It has no external dependencies and uses inline styles to avoid conflicts.

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

// Main Analytics Component
export default function Analytics() {
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:8000/stats')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok. Is the backend running?');
        }
        return response.json();
      })
      .then(data => setStats(data))
      .catch(err => {
        console.error("Failed to fetch stats:", err);
        setError(err.message);
      });
  }, []);

  return (
    <div style={{ minHeight: '100vh', padding: '2rem', color: 'white' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Analytics Dashboard
          </h1>
          <p style={{ fontSize: '1.125rem', color: '#94a3b8' }}>
            Live intelligence overview of the stealer log database.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            marginBottom: '2rem',
            color: '#f87171'
          }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>Connection Error</h2>
            <p style={{ margin: '0.5rem 0 0 0' }}>{error}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          <SimpleStatCard 
            title="Total Credentials" 
            value={stats ? stats.total_credentials.toLocaleString() : 'Loading...'}
            icon="🔐"
          />
          <SimpleStatCard 
            title="Infected Systems" 
            value={stats ? stats.total_systems.toLocaleString() : 'Loading...'}
            icon="💻"
          />
          <SimpleStatCard 
            title="Unique Domains" 
            value={stats ? stats.unique_domains.toLocaleString() : 'Loading...'}
            icon="🌐"
          />
          <SimpleStatCard 
            title="Stealer Families"
            value={stats ? stats.unique_stealers.toLocaleString() : 'Loading...'}
            icon="🦠"
          />
        </div>

        {/* Placeholder for Charts */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid rgba(51, 65, 85, 0.5)',
          borderRadius: '1rem',
          padding: '4rem 2rem',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>
            Advanced Visualizations
          </h2>
          <p style={{ color: '#94a3b8' }}>
            Charts and geographic maps are currently in development.
          </p>
        </div>

      </div>
    </div>
  );
}
