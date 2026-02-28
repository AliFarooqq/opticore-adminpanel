import { NavLink, useNavigate } from 'react-router-dom';
import { Building2, Upload, LogOut, Layers } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
  { to: '/suppliers', label: 'Suppliers', icon: Building2 },
  { to: '/import', label: 'Bulk Import', icon: Upload },
];

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <aside style={{
      width: 240, flexShrink: 0, background: '#0f2540',
      display: 'flex', flexDirection: 'column', height: '100%',
    }}>
      {/* Logo */}
      <div style={{ padding: '22px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, background: 'rgba(255,255,255,0.1)',
            borderRadius: 8, display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0,
          }}>
            <Layers size={18} style={{ color: '#93c5fd' }} />
          </div>
          <div>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 15, display: 'block', lineHeight: 1.3 }}>OptiCore</span>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Admin Panel</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 8,
              fontWeight: 500, fontSize: 14, textDecoration: 'none',
              color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
              background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
              transition: 'background 0.15s, color 0.15s',
            })}
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Divider */}
      <div style={{ margin: '0 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }} />

      {/* Logout */}
      <div style={{ padding: 12 }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 8, background: 'none',
            border: 'none', color: 'rgba(255,255,255,0.55)',
            fontWeight: 500, fontSize: 14, cursor: 'pointer',
            transition: 'color 0.15s, background 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; e.currentTarget.style.background = 'none'; }}
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </aside>
  );
}
