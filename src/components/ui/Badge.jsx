const variants = {
  green: 'bg-green-100 text-green-700',
  blue: 'bg-blue-100 text-blue-700',
  red: 'bg-red-100 text-red-700',
  gray: 'bg-slate-100 text-slate-600',
  amber: 'bg-amber-100 text-amber-700',
  purple: 'bg-purple-100 text-purple-700',
};

export default function Badge({ variant = 'gray', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant] || variants.gray} ${className}`}
    >
      {children}
    </span>
  );
}
