import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

/* ─── Page Wrapper with animation ─── */
export function PageTransition({ children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Card ─── */
export function Card({ children, className = '', hover = false, ...props }) {
  const base = hover ? 'card-hover' : 'card';
  return (
    <div className={`${base} p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

/* ─── Stat Card ─── */
export function StatCard({ label, value, sublabel, icon: Icon, color = 'brand', delay = 0 }) {
  const colors = {
    brand: 'from-brand-500 to-violet-500 shadow-brand-500/20',
    emerald: 'from-emerald-500 to-teal-500 shadow-emerald-500/20',
    amber: 'from-amber-500 to-orange-500 shadow-amber-500/20',
    rose: 'from-rose-500 to-pink-500 shadow-rose-500/20',
    sky: 'from-sky-500 to-cyan-500 shadow-sky-500/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card hover className="relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
            {sublabel && <p className="mt-1 text-xs text-slate-500">{sublabel}</p>}
          </div>
          {Icon && (
            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${colors[color]} shadow-md text-white`}>
              <Icon className="w-5 h-5" />
            </div>
          )}
        </div>
        {/* Decorative gradient */}
        <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-gradient-to-br ${colors[color]} opacity-[0.07] blur-xl`} />
      </Card>
    </motion.div>
  );
}

/* ─── Button ─── */
export function Button({ children, variant = 'primary', loading = false, className = '', ...props }) {
  const base =
    variant === 'primary' ? 'btn-primary' :
    variant === 'secondary' ? 'btn-secondary' :
    'btn-ghost';
  return (
    <button className={`${base} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}

/* ─── Input ─── */
export function Input({ label, id, error, className = '', ...props }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <input id={id} className={`input-field ${error ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500' : ''}`} {...props} />
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  );
}

/* ─── Select ─── */
export function Select({ label, id, options, children, className = '', ...props }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <select id={id} className="input-field" {...props}>
        {children ?? options?.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

/* ─── Badge ─── */
export function Badge({ children, variant = 'default', className = '' }) {
  const styles = {
    default: 'bg-slate-100 text-slate-600',
    brand: 'bg-brand-100 text-brand-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-rose-100 text-rose-700',
    info: 'bg-sky-100 text-sky-700',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}

/* ─── Skeleton ─── */
export function Skeleton({ className = '', lines = 1 }) {
  if (lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className={`skeleton h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'} ${className}`} />
        ))}
      </div>
    );
  }
  return <div className={`skeleton ${className}`} />;
}

/* ─── Skeleton Card ─── */
export function SkeletonCard() {
  return (
    <Card className="space-y-4">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </Card>
  );
}

/* ─── Modal ─── */
export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md z-10"
      >
        {title && <h3 className="text-lg font-bold text-slate-900 mb-4">{title}</h3>}
        {children}
      </motion.div>
    </motion.div>
  );
}

/* ─── Empty State ─── */
export function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="text-center py-12">
      {Icon && (
        <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-slate-400" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}
