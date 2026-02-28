export default function Spinner({ size = 'md', full = false }) {
  const dimensions = { sm: 16, md: 32, lg: 48 }[size] || 32;
  const borderWidth = size === 'sm' ? 2 : 3;

  const spinner = (
    <div
      style={{
        width: dimensions,
        height: dimensions,
        borderRadius: '50%',
        border: `${borderWidth}px solid #e2e8f0`,
        borderTopColor: '#0f2540',
        animation: 'spin 0.7s linear infinite',
      }}
    />
  );

  if (full) {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(255,255,255,0.75)', zIndex: 50,
      }}>
        {spinner}
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 40,
    }}>
      {spinner}
    </div>
  );
}
