import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, ExternalLink, Search, ShieldCheck } from 'lucide-react';
import { getAdminVerification, getAdminVerifications, reviewAdminVerification, type AdminVerification, type AdminVerificationType } from '../../../api/admin.api';
import { AdminLayout } from '../components/AdminLayout';
import { AdminToast } from '../components/AdminToast';
import AdminDetailValue, { detailLabel, formatAdminDate, isInternalDetailKey } from '../components/AdminDetailValue';

type VerificationRecord = Record<string, unknown>;
const label = (value: string) => value.replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
export default function AdminVerifications() {
  const { type: pathType, id } = useParams<{ type: AdminVerificationType; id?: string }>();
  const navigate = useNavigate();
  const detailsMode = Boolean(id && pathType);
  const [requests, setRequests] = useState<AdminVerification[]>([]);
  const [record, setRecord] = useState<VerificationRecord | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => { const timer = window.setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 300); return () => window.clearTimeout(timer); }, [searchInput]);
  useEffect(() => {
    if (detailsMode) return;
    let alive = true; setLoading(true); setError('');
    getAdminVerifications({ page, limit: 10, type: typeFilter || undefined, status: statusFilter || undefined, search: search || undefined }).then((result) => { if (alive) { setRequests(result.requests); setTotal(result.total); setPages(result.pages); } }).catch((err: unknown) => { if (alive) setError(axios.isAxiosError(err) ? err.response?.data?.message ?? 'Could not load the verification queue.' : 'Could not load the verification queue.'); }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [detailsMode, page, typeFilter, statusFilter, search]);
  useEffect(() => {
    if (!detailsMode || !id || !pathType) return;
    let alive = true; setLoading(true); setError('');
    getAdminVerification(pathType, id).then((result) => { if (alive) setRecord(result); }).catch((err: unknown) => { if (alive) setError(axios.isAxiosError(err) ? err.response?.data?.message ?? 'Could not load verification details.' : 'Could not load verification details.'); }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [detailsMode, id, pathType]);

  const review = async (status: 'approved' | 'rejected') => {
    if (!id || !pathType) return;
    if (status === 'rejected' && !reason.trim()) { setError('Add a reason before rejecting this verification.'); return; }
    setSaving(true); setError('');
    try { const updated = await reviewAdminVerification(pathType, id, { status, ...(reason.trim() ? { reason: reason.trim() } : {}) }); setRecord(updated); setNotice(`Verification ${status} successfully.`); }
    catch (err) { setError(axios.isAxiosError(err) ? err.response?.data?.message ?? 'Could not submit this verification decision.' : 'Could not submit this verification decision.'); }
    finally { setSaving(false); }
  };

  if (!detailsMode) return <AdminLayout title="Verification Queue" activePage="Verification Queue">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[11px] font-bold tracking-[1.5px] text-[#B95235]">COMPLIANCE</p><h1 className="mt-1 text-3xl font-bold">Verification Queue</h1><p className="mt-2 text-sm text-[#756D68]">Review candidate, recruiter, and company verification submissions.</p></div><span className="rounded-xl bg-white px-4 py-3 text-sm shadow-sm"><strong className="text-xl">{total}</strong><span className="ml-2 text-[#756D68]">requests</span></span></header>
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}<AdminToast message={notice} onClose={() => setNotice('')} />
    <section className="rounded-2xl border border-[#F1E6DF] bg-white p-4 shadow-sm"><div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_180px_180px_auto]"><label className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A918B]"/><input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search by name or email..." className="h-11 w-full rounded-xl border border-[#E5DDD8] bg-[#FBF8F6] pl-10 pr-3 text-sm outline-none focus:border-[#B77A62]"/></label><select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} className="h-11 rounded-xl border border-[#E5DDD8] bg-[#FBF8F6] px-3 text-sm"><option value="">All request types</option><option value="candidate">Candidate</option><option value="recruiter">Recruiter</option><option value="company">Company</option></select><select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="h-11 rounded-xl border border-[#E5DDD8] bg-[#FBF8F6] px-3 text-sm"><option value="">All statuses</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select><button onClick={() => { setSearchInput(''); setTypeFilter(''); setStatusFilter(''); setPage(1); }} className="rounded-xl px-4 text-sm font-semibold text-[#A64B30] hover:bg-[#FCF5F1]">Clear</button></div></section>
    <section className="overflow-hidden rounded-2xl border border-[#F1E6DF] bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="bg-[#FCF5F1] text-[11px] uppercase tracking-wide text-[#756D68]"><tr><th className="px-5 py-4">Requester</th><th className="px-5 py-4">Type</th><th className="px-5 py-4">Submitted</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Action</th></tr></thead><tbody className="divide-y divide-[#F0E9E5]">{!loading && requests.map((request) => <tr key={`${request.type}-${request.id}`} className="hover:bg-[#FCFAF8]"><td className="px-5 py-4"><p className="font-semibold">{request.name}</p><p className="mt-1 text-xs text-[#817A75]">{request.email ?? 'Company submission'}</p></td><td className="px-5 py-4"><span className="rounded-full bg-[#F3E5DE] px-2.5 py-1 text-xs capitalize">{request.type}</span></td><td className="px-5 py-4 text-sm text-[#625A55]">{formatAdminDate(request.submittedAt)}</td><td className="px-5 py-4"><span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold capitalize text-amber-700">{request.status}</span></td><td className="px-5 py-4"><button onClick={() => navigate(`/admin/verifications/${request.type}/${request.id}`)} className="rounded-lg bg-[#C96849] px-3 py-2 text-xs font-semibold text-white">Review</button></td></tr>)}</tbody></table></div>{loading && <p className="py-14 text-center text-sm text-[#817A75]">Loading verification requests...</p>}{!loading && !error && !requests.length && <p className="py-14 text-center text-sm text-[#817A75]">No requests match these filters.</p>}{!loading && pages > 1 && <div className="flex items-center justify-between border-t border-[#F0E9E5] px-5 py-4"><span className="text-xs text-[#817A75]">Page {page} of {pages} · {total} requests</span><div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage((n) => n - 1)} className="rounded-lg border border-[#E5DDD8] px-3 py-2 text-sm disabled:opacity-40">Previous</button><button disabled={page >= pages} onClick={() => setPage((n) => n + 1)} className="rounded-lg border border-[#E5DDD8] px-3 py-2 text-sm disabled:opacity-40">Next</button></div></div>}</section>
  </AdminLayout>;

  const history = Array.isArray(record?.history) ? record.history as VerificationRecord[] : [];
  const documents: unknown[] = Array.isArray(record?.documents) ? record.documents : [];
  const profile = record?.profile && typeof record.profile === 'object' ? record.profile as VerificationRecord : null;
  const currentStatus = String(record?.status ?? 'pending');
  return <AdminLayout title="Verification Details" activePage="Verification Queue">
    <button onClick={() => navigate('/admin/verifications')} className="inline-flex items-center gap-2 text-sm font-semibold text-[#A64B30]"><ArrowLeft size={16}/>Back to verification queue</button>
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}<AdminToast message={notice} onClose={() => setNotice('')} />
    {loading ? <div className="rounded-2xl bg-white py-16 text-center text-sm text-[#817A75]">Loading verification details...</div> : !record ? <div className="rounded-2xl bg-white py-16 text-center text-sm text-[#817A75]">Verification request not found.</div> : <>
      <section className="flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-[#F1E6DF] bg-white p-6 shadow-sm"><div><p className="text-[11px] font-bold uppercase tracking-[1.4px] text-[#B95235]">{label(String(record.type ?? pathType))} verification</p><h1 className="mt-2 text-3xl font-bold">{String(record.name ?? 'Verification request')}</h1><p className="mt-2 text-sm text-[#756D68]">{String(record.email ?? 'Company verification')} · Submitted {record.submittedAt ? formatAdminDate(record.submittedAt) : '—'}</p><span className="mt-3 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold capitalize text-amber-700">{label(currentStatus)}</span></div>{currentStatus === 'pending' && <div className="flex flex-wrap gap-2"><button disabled={saving} onClick={() => void review('approved')} className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Approve verification</button></div>}</section>
      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]"><div className="space-y-5"><section className="rounded-2xl border border-[#F1E6DF] bg-white p-6 shadow-sm"><h2 className="mb-4 text-lg font-bold">Submission details</h2><div className="grid gap-4 sm:grid-cols-2">{Object.entries(record).filter(([key]) => !isInternalDetailKey(key) && !['history', 'profile', 'applicant', 'documents', 'recruiter', 'company'].includes(key)).map(([key, value]) => <div key={key} className="rounded-xl bg-[#FCF5F1] p-4"><p className="text-[10px] font-bold uppercase tracking-wide text-[#817A75]">{detailLabel(key)}</p><div className="mt-2 break-words text-sm text-[#302D2B]"><AdminDetailValue value={value} fieldKey={key}/></div></div>)}</div></section>
        {profile && <section className="rounded-2xl border border-[#F1E6DF] bg-white p-6 shadow-sm"><h2 className="mb-4 text-lg font-bold">Candidate profile snapshot</h2><div className="grid gap-3 sm:grid-cols-2">{Object.entries(profile).filter(([key]) => !isInternalDetailKey(key)).map(([key, value]) => <div key={key} className="rounded-lg bg-[#FCF5F1] p-3"><p className="text-[10px] font-bold uppercase text-[#817A75]">{detailLabel(key)}</p>{typeof value === 'string' && /^https?:\/\//.test(value) ? <a href={value} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-sm text-[#A64B30]">Open document <ExternalLink size={13}/></a> : <div className="mt-1 break-words text-sm text-[#514A46]"><AdminDetailValue value={value} fieldKey={key}/></div>}</div>)}</div></section>}
        {documents.length > 0 && <section className="rounded-2xl border border-[#F1E6DF] bg-white p-6 shadow-sm"><h2 className="mb-4 text-lg font-bold">Submitted documents</h2><div className="space-y-2">{documents.map((item, index) => { const url = typeof item === 'string' ? item : typeof item === 'object' && item && 'url' in item ? String((item as { url: unknown }).url) : ''; return <div key={`${url}-${index}`} className="flex items-center justify-between gap-3 rounded-xl bg-[#FCF5F1] p-3 text-sm"><span className="truncate">{url.split('/').pop() || `Document ${index + 1}`}</span>{url && <a href={url} target="_blank" rel="noreferrer" className="shrink-0 text-[#A64B30]">Open <ExternalLink size={13} className="inline"/></a>}</div>; })}</div></section>}
        {history.length > 0 && <section className="rounded-2xl border border-[#F1E6DF] bg-white p-6 shadow-sm"><h2 className="mb-4 text-lg font-bold">Review history</h2><div className="space-y-4">{history.map((entry, index) => <div key={`${String(entry.date)}-${index}`} className="flex gap-3"><span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#C96849]"/><div><p className="text-sm font-semibold capitalize">{String(entry.action ?? entry.status)}</p><p className="mt-1 text-xs text-[#817A75]">{entry.date ? formatAdminDate(entry.date) : ''}{entry.reviewer && typeof entry.reviewer === 'object' ? ` · ${String((entry.reviewer as VerificationRecord).name ?? '')}` : ''}</p>{Boolean(entry.reason) && <p className="mt-1 text-sm text-[#625A55]">{String(entry.reason)}</p>}</div></div>)}</div></section>}</div>
        <aside className="h-fit rounded-2xl border border-[#F1E6DF] bg-white p-6 shadow-sm"><div className="flex items-center gap-2"><ShieldCheck className="text-[#A64B30]"/><h2 className="text-lg font-bold">Review decision</h2></div><p className="mt-2 text-sm leading-6 text-[#756D68]">Approve the request if the submitted information is sufficient. A reason is required when rejecting.</p>{currentStatus === 'pending' ? <><label className="mt-5 block text-xs font-semibold text-[#514A46]">Decision notes / rejection reason<textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={5} maxLength={2000} placeholder="Add context for this verification decision..." className="mt-2 w-full rounded-xl border border-[#E5DDD8] bg-[#FBF8F6] p-3 text-sm outline-none focus:border-[#B77A62]"/></label><button disabled={saving || !reason.trim()} onClick={() => void review('rejected')} className="mt-3 w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-50">Reject verification</button></> : <p className="mt-5 rounded-xl bg-[#FCF5F1] p-4 text-sm text-[#625A55]">This request has already been {currentStatus}.</p>}
        </aside></div>
    </>}
  </AdminLayout>;
}
