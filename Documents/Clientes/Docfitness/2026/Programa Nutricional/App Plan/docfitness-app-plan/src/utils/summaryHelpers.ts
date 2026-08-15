export function toInputDate(raw: string | undefined | null): string {
  if (!raw) return '';
  const trimmed = String(raw).trim();
  if (!trimmed) return '';
  
  const hasSlash = trimmed.includes('/');
  const parts = hasSlash ? trimmed.split('/') : trimmed.split('-');
  if (parts.length !== 3) return '';
  
  const dd = parts[0].padStart(2, '0').slice(0, 2);
  const mm = parts[1].padStart(2, '0').slice(0, 2);
  let yy = parts[2].trim();
  if (yy.length === 2) yy = `20${yy}`;
  if (yy.length !== 4) return '';
  
  const yyyy = Number(yy);
  const month = Number(mm);
  const day = Number(dd);
  if (yyyy < 1900 || month < 1 || month > 12 || day < 1 || day > 31) return '';
  
  return `${yy}-${mm}-${dd}`;
}

export function fromInputDate(raw: string | undefined | null): string {
  if (!raw) return '';
  const parts = raw.split('-');
  if (parts.length === 3) {
    const dd = parts[2].padStart(2, '0');
    const mm = parts[1].padStart(2, '0');
    const yy = parts[0].slice(-4);
    return `${dd}/${mm}/${yy}`;
  }
  return raw;
}

export function getProximaConsulta(fechaConsulta: string | undefined | null): string | null {
  const date = toInputDate(fechaConsulta);
  if (!date) return null;
  const next = new Date(date + 'T00:00:00');
  next.setDate(next.getDate() + 28);
  
  const dd = String(next.getDate()).padStart(2, '0');
  const mm = String(next.getMonth() + 1).padStart(2, '0');
  const yyyy = next.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function getFechaActual(fechaConsulta: string | undefined | null): string {
  const date = toInputDate(fechaConsulta);
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}
