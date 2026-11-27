import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-react';
import { getAdminEntityDetails, updateAdminEntityStatus } from '../../../api/admin.api';
import { AdminLayout } from '../components/AdminLayout';
import { AdminToast } from '../components/AdminToast';
import AdminDetailValue, { detailLabel, isInternalDetailKey } from '../components/AdminDetailValue';

const plural = (value: string) => value === 'candidate' ? 'candidates' : value === 'recruiter' ? 'recruiters' : 'companies';
const display = (value: unknown): string => value == null || value === '' ? '—' : typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value).replaceAll('_', ' ');
export default function AdminEntityDetails() {
  const { type: rawType = 'candidate', id = '' } = useParams<{ type: string; id: string }>();
  const entityType = rawType === 'recruiters' ? 'recruiter' : rawType === 'companies' ? 'company' : 'candidate';
  const directory = plural(entityType);
  const navigate = useNavigate();
  const [record, setRecord] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    let alive = true;
    getAdminEntityDetails(directory, id).then((data) => { if (alive) setRecord(data); }).catch((err: unknown) => { if (alive) setError(axios.isAxiosError(err) ? err.response?.data?.message ?? 'Could not load this record.' : 'Could not load this record.'); }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [directory, id]);
  const setAccountStatus = async (status: 'active' | 'suspended') => {
    setSaving(true); setError('');
    try { await updateAdminEntityStatus(directory, id, status); setRecord((current) => current ? { ...current, [entityType === 'company' ? 'status' : 'accountStatus']: status } : current); setNotice(`Account ${status === 'active' ? 'activated' : 'suspended'} successfully.`); }
    catch (err) { setError(axios.isAxiosError(err) ? err.response?.data?.message ?? 'Could not update status.' : 'Could not update status.'); }
    finally { setSaving(false); }
  };
  const title = String(record?.fullName ?? record?.name ?? `${entityType[0].toUpperCase()}${entityType.slice(1)} details`);
  const sections = record ? Object.entries(record).filter(([key]) => !isInternalDetailKey(key) && !['profile', 'recruiters', 'updatedAt'].includes(key)) : [];
  return <AdminLayout title={`${entityType[0].toUpperCase()}${entityType.slice(1)} Details`} activePage={entityType === 'company' ? 'Companies' : `${entityType[0].toUpperCase()}${entityType.slice(1)}s`}>
    <button onClick={() => navigate(`/admin/${directory}`)} className="inline-flex items-center gap-2 text-sm font-semibold text-[#A64B30]"><ArrowLeft size={16}/>Back to {directory}</button>
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}<AdminToast message={notice} onClose={() => setNotice('')} />
    {loading ? <div className="rounded-2xl bg-white py-16 text-center text-sm text-[#817A75]">Loading record...</div> : !record ? <div className="rounded-2xl bg-white py-16 text-center text-sm text-[#817A75]">Record not found.</div> : <>
      <section className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-[#F1E6DF] bg-white p-6 shadow-sm"><div><p className="text-[11px] font-bold uppercase tracking-[1.4px] text-[#B95235]">{entityType} profile</p><h1 className="mt-2 text-3xl font-bold">{title}</h1><p className="mt-2 text-sm text-[#756D68]">{String(record.email ?? record.website ?? '')}</p><span className="mt-4 inline-flex rounded-full bg-[#FBEDE8] px-3 py-1 text-xs font-semibold capitalize text-[#A64B30]">{display(record.verificationStatus)}</span></div><div className="flex gap-2">{(record.accountStatus ?? record.status) !== 'blocked' && <button disabled={saving} onClick={() => void setAccountStatus((record.accountStatus ?? record.status) === 'active' ? 'suspended' : 'active')} className="rounded-xl border border-[#E5DDD8] px-4 py-2 text-sm font-semibold text-[#514A46] disabled:opacity-50">{(record.accountStatus ?? record.status) === 'active' ? 'Suspend account' : 'Activate account'}</button>}<button onClick={() => navigate('/admin/verifications')} className="rounded-xl bg-[#C96849] px-4 py-2 text-sm font-semibold text-white">Verification queue</button></div></section>
      <section className="rounded-2xl border border-[#F1E6DF] bg-white p-6 shadow-sm"><h2 className="mb-5 text-lg font-bold">Account information</h2><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{sections.map(([key, value]) => <div key={key} className="min-w-0 rounded-xl bg-[#FCF5F1] p-4"><p className="text-[10px] font-bold uppercase tracking-wide text-[#817A75]">{detailLabel(key)}</p><div className="mt-2 break-words text-sm font-medium text-[#302D2B]">{key === 'company' && value && typeof value === 'object' ? String((value as Record<string, unknown>).name ?? '—') : <AdminDetailValue value={value} fieldKey={key}/>}</div></div>)}</div></section>
      {entityType !== 'recruiter' && record.profile && typeof record.profile === 'object' && <section className="rounded-2xl border border-[#F1E6DF] bg-white p-6 shadow-sm"><h2 className="mb-5 text-lg font-bold">Profile information</h2><div className="grid gap-4 sm:grid-cols-2">{Object.entries(record.profile as Record<string, unknown>).filter(([key]) => !isInternalDetailKey(key)).map(([key, value]) => <div key={key} className="min-w-0 rounded-xl bg-[#FCF5F1] p-4"><p className="text-[10px] font-bold uppercase tracking-wide text-[#817A75]">{detailLabel(key)}</p><div className="mt-2 break-words text-sm text-[#514A46]"><AdminDetailValue value={value} fieldKey={key}/></div></div>)}</div></section>}
      {Array.isArray(record.recruiters) && <section className="rounded-2xl border border-[#F1E6DF] bg-white p-6 shadow-sm"><h2 className="mb-4 text-lg font-bold">Recruiters at this company</h2><div className="divide-y divide-[#F0E9E5]">{(record.recruiters as Record<string, unknown>[]).map((person) => <div key={String(person.id)} className="flex flex-wrap justify-between gap-2 py-3"><span className="font-semibold">{String(person.fullName ?? person.name)}</span><span className="text-sm text-[#756D68]">{String(person.email ?? '')} · {String(person.designation ?? '')}</span></div>)}</div></section>}
      <aside className="flex items-start gap-3 rounded-xl border border-[#F0D8CE] bg-[#FCF5F1] p-4 text-sm text-[#625A55]"><ShieldAlert size={18} className="mt-0.5 shrink-0 text-[#A64B30]"/><p>Administrative changes are recorded by the backend. Use the verification queue to review and approve or reject submitted verification requests.</p><CheckCircle2 size={17} className="ml-auto shrink-0 text-emerald-700"/></aside>
    </>}
  </AdminLayout>;
}
