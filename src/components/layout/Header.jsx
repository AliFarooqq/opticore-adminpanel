import { useContext } from 'react';
import { Menu } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { SidebarContext } from './Layout';

export default function Header({ title }) {
  const { user } = useAuth();
  const { setIsOpen } = useContext(SidebarContext);

  return (
    <header
      className="admin-header"
      style={{
        height: 64, background: '#fff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 36px',
        flexShrink: 0,
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Hamburger — visible on mobile only via CSS */}
        <button
          className="sidebar-hamburger"
          onClick={() => setIsOpen(v => !v)}
          style={{
            display: 'none',
            alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, borderRadius: 8,
            border: 'none', background: 'none',
            color: '#64748b', cursor: 'pointer', padding: 0,
          }}
        >
          <Menu size={22} />
        </button>
        <h1 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.2px', margin: 0 }}>
          {title}
        </h1>
      </div>

      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Email text — hidden on mobile via CSS */}
          <div className="header-user-text" style={{ textAlign: 'right' }}>
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
