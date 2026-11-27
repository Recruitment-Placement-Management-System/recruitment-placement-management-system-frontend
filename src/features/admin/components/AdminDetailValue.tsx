import { ExternalLink } from 'lucide-react';

export type DetailRecord = Record<string, unknown>;

export const internalDetailKeys = new Set(['id', '_id', '__v', 'createdat', 'updatedat', 'deletedat']);
export const isInternalDetailKey = (key: string) => internalDetailKeys.has(key.toLowerCase());
export const detailLabel = (key: string) => key.replace(/([A-Z])/g, ' $1').replaceAll('_', ' ').replace(/^\w/, (letter) => letter.toUpperCase());

export function formatAdminDate(value: unknown): string {
  if (typeof value !== 'string' && typeof value !== 'number' && !(value instanceof Date)) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }).format(date);
}

function AdminDetailValue({ value, fieldKey }: { value: unknown; fieldKey?: string }) {
  if (value == null || value === '') return <span className="text-[#9A918B]">—</span>;
  if (typeof value === 'string' && /^https?:\/\//i.test(value)) {
    const linkLabel = fieldKey && /(resume|download|document|file|url)/i.test(fieldKey) ? 'Open download' : 'Open link';
    return <a href={value} title={value} target="_blank" rel="noreferrer" className="inline-flex max-w-full items-center gap-1 text-[#A64B30] hover:underline">{linkLabel}<ExternalLink size={13} className="shrink-0"/></a>;
  }
  if (typeof value === 'string' && fieldKey && /(date|at)$/i.test(fieldKey) && !Number.isNaN(Date.parse(value))) return <>{formatAdminDate(value)}</>;
  if (typeof value === 'boolean') return <>{value ? 'Yes' : 'No'}</>;
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-[#9A918B]">—</span>;
    if (value.every((item) => typeof item !== 'object' || item === null)) return <>{value.map(String).join(', ')}</>;
    return <div className="mt-2 space-y-2">{value.map((item, index) => <div key={index} className="rounded-lg border border-[#F0E9E5] bg-white/70 p-3"><AdminDetailValue value={item}/></div>)}</div>;
  }
  if (typeof value === 'object') {
    const object = value as DetailRecord;
    if ('name' in object && Object.keys(object).every((key) => ['id', '_id', 'name'].includes(key))) return <>{String(object.name ?? '—')}</>;
    const entries = Object.entries(object).filter(([key]) => !isInternalDetailKey(key));
    if (!entries.length) return <span className="text-[#9A918B]">—</span>;
    return <dl className="mt-2 space-y-2">{entries.map(([key, nested]) => <div key={key} className="grid gap-1 sm:grid-cols-[minmax(100px,0.7fr)_1.3fr]"><dt className="text-xs font-medium text-[#817A75]">{detailLabel(key)}</dt><dd className="min-w-0 break-words text-sm text-[#302D2B]"><AdminDetailValue value={nested} fieldKey={key}/></dd></div>)}</dl>;
  }
  return <>{String(value).replaceAll('_', ' ')}</>;
}

export default AdminDetailValue;
