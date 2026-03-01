import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const { login, user, error, setError } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate('/ivl-suppliers', { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    return () => setError('');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e) {
    e.preventDefault();
    // AUTH BYPASS — milestone 4 (re-enable before production)
    navigate('/ivl-suppliers', { replace: true });
    // setLoading(true);
    // try {
    //   await login(email, password);
    // } catch {
    //   // error handled by useAuth
    // } finally {
    //   setLoading(false);
    // }
  }

  return (
    <div className="flex min-h-screen">

      {/* ── Left panel ── */}
      <div style={{ width: 480, flexShrink: 0, background: '#fff', display: 'flex', flexDirection: 'column', padding: '48px 56px', boxShadow: '4px 0 40px rgba(15,37,64,0.07)', position: 'relative', zIndex: 10 }}>

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0f2540] rounded-[10px] flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"/>
              <polyline points="2 17 12 22 22 17"/>
              <polyline points="2 12 12 17 22 12"/>
            </svg>
          </div>
          <div>
            <p className="text-[15px] font-bold text-slate-900 leading-tight">OptiCore</p>
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">Admin Panel</p>
          </div>
        </div>

        {/* Form area — vertically centered */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

          <h1 className="text-[32px] font-bold text-slate-900 leading-tight mb-2">Welcome back</h1>
          <p className="text-[14px] text-slate-500 mb-8">Sign in to manage your lens catalog.</p>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl mb-6" style={{ padding: '12px 16px' }}>
              <svg className="text-red-600 shrink-0 mt-0.5" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span className="text-[13px] text-red-600">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@opticore.com"
                autoComplete="email"
                // required {/* AUTH BYPASS — milestone 4 */}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  height: 52,
                  padding: '0 20px',
                  fontSize: 14,
                  color: '#0f172a',
                  background: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: 12,
                  outline: 'none',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onFocus={e => { e.target.style.borderColor = '#1a3a5c'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 4px rgba(26,58,92,0.08)'; }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  // required {/* AUTH BYPASS — milestone 4 */}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    height: 52,
                    padding: '0 48px 0 20px',
                    fontSize: 14,
                    color: '#0f172a',
                    background: '#f8fafc',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: 12,
                    outline: 'none',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#1a3a5c'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 4px rgba(26,58,92,0.08)'; }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: 54,
                marginTop: 4,
                background: loading ? '#0f2540' : '#0f2540',
                color: '#fff',
                fontWeight: 600,
                fontSize: 15,
                borderRadius: 12,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.55 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'background 0.15s, box-shadow 0.15s, transform 0.1s',
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = '#163150'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(15,37,64,0.25)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}}
              onMouseLeave={e => { e.currentTarget.style.background = '#0f2540'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Signing in…
                </>
              ) : 'Sign In'}
            </button>

          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-1.5 text-[12px] text-slate-400">
          <span className="w-[7px] h-[7px] rounded-full bg-green-500 shrink-0" />
          All systems operational &nbsp;·&nbsp; © {new Date().getFullYear()} OptiCore
        </div>

      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 relative overflow-hidden bg-[#0f2540]">
        <img
          src="https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=1600&auto=format&fit=crop&q=80"
          alt="Optical eyewear"
          className="absolute inset-0 w-full h-full object-cover opacity-55"
          style={{ filter: 'saturate(0.9)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f2540]/85 via-[#0f2540]/45 to-[#1a3a5c]/30" />


      </div>

    </div>
  );
}