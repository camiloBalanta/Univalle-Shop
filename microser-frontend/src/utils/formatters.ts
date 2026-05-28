import { UserRole } from '../types/domain';

export function formatMoney(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function formatDate(value?: string) {
  if (!value) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function roleLabel(role?: UserRole | string) {
  const labels: Record<string, string> = {
    estudiante: 'Estudiante',
    docente: 'Profesor',
    administrativo: 'Administrativo',
  };
  return labels[role || ''] || 'Invitado';
}

export function roleAccent(role?: UserRole) {
  if (role === 'docente') return 'from-slate-900 to-campus-600';
  if (role === 'administrativo') return 'from-brand-700 to-slate-900';
  return 'from-campus-600 to-brand-600';
}

export function initials(value?: string) {
  return (value || 'US').slice(0, 2).toUpperCase();
}
