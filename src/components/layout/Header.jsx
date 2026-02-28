import { useAuth } from '../../hooks/useAuth';

export default function Header({ title }) {
  const { user } = useAuth();

  return (
    <header style={{
      height: 64, background: '#fff',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 36px',
      flexShrink: 0,
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>
      <h1 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.2px', margin: 0 }}>
        {title}
      </h1>
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 11, color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>Logged in as</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', margin: 0, lineHeight: 1.5 }}>{user.email}</p>
          </div>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: '#0f2540', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0,
          }}>
            {user.email?.[0]?.toUpperCase()}
          </div>
        </div>
      )}
    </header>
  );
}
