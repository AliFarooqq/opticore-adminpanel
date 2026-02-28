import Spinner from './Spinner';
import EmptyState from './EmptyState';

export default function Table({ columns, data, loading, emptyMessage = 'No data found.' }) {
  if (loading) return <Spinner />;

  if (!data || data.length === 0) {
    return <EmptyState title={emptyMessage} />;
  }

  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
            {columns.map(col => (
              <th
                key={col.key}
                style={{
                  textAlign: 'left',
                  padding: '14px 24px',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  whiteSpace: 'nowrap',
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={row.id || i}
              style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.1s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              {columns.map(col => (
                <td
                  key={col.key}
                  style={{
                    padding: '15px 24px',
                    color: '#374151',
                    fontSize: 14,
                    verticalAlign: 'middle',
                  }}
                >
                  {col.render ? col.render(row) : (row[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
