import { PackageOpen } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  icon: Icon = PackageOpen,
  title = 'Nothing here yet',
  description,
  actionLabel,
  onAction,
}) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '64px 24px', textAlign: 'center',
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: '#f1f5f9', display: 'flex',
        alignItems: 'center', justifyContent: 'center', marginBottom: 16,
      }}>
        <Icon size={24} style={{ color: '#94a3b8' }} />
      </div>
      <h3 style={{ fontSize: 15, fontWeight: 600, color: '#374151', margin: '0 0 6px 0' }}>{title}</h3>
      {description && (
        <p style={{ fontSize: 13, color: '#94a3b8', maxWidth: 300, margin: '0 0 16px 0', lineHeight: 1.6 }}>
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <div style={{ marginTop: 16 }}>
          <Button onClick={onAction}>{actionLabel}</Button>
        </div>
      )}
    </div>
  );
}
