import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ExternalLink, Search } from 'lucide-react';
import { getAdminCandidates, getAdminCompanies, getAdminRecruiters, updateAdminEntityStatus, type AdminCandidate, type AdminCompany, type AdminRecruiter } from '../../../api/admin.api';
import { AdminLayout } from '../components/AdminLayout';
import { AdminToast } from '../components/AdminToast';

type DirectoryType = 'candidates' | 'recruiters' | 'companies';
type DirectoryRow = AdminCandidate | AdminRecruiter | AdminCompany;
const titleFor: Record<DirectoryType, string> = { candidates: 'Candidates', recruiters: 'Recruiters', companies: 'Companies' };
const isCompany = (row: DirectoryRow): row is AdminCompany => 'recruiterCount' in row;
const isCandidate = (row: DirectoryRow): row is AdminCandidate => 'headline' in row;
const accountStatus = (row: DirectoryRow) => isCompany(row) ? row.status : row.accountStatus;
const setRowStatus = (row: DirectoryRow, status: string): DirectoryRow => isCompany(row) ? { ...row, status } : { ...row, accountStatus: status };

export default function AdminDirectory() {
  const location = useLocation();
  const rawType = location.pathname.split('/').filter(Boolean).at(-1) ?? 'candidates';
  const type = (['candidates', 'recruiters', 'companies'].includes(rawType) ? rawType : 'candidates') as DirectoryType;
  const navigate = useNavigate();
  const [rows, setRows] = useState<DirectoryRow[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => { const timer = window.setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 300); return () => window.clearTimeout(timer); }, [searchInput]);
  useEffect(() => { setPage(1); setSearchInput(''); setStatus(''); setVerificationStatus(''); }, [type]);
  useEffect(() => {
    let alive = true;
    setLoading(true); setError('');
    const params = { page, limit: 10, search: search || undefined, status: status || undefined, verificationStatus: verificationStatus || undefined, sortBy: type === 'companies' ? 'name' : 'createdAt', sortOrder: 'desc' };
    const load = async () => {
      try {
        if (type === 'candidates') { const data = await getAdminCandidates(params); if (alive) { setRows(data.candidates); setTotal(data.pagination.total); setPages(data.pagination.pages); } }
        else if (type === 'recruiters') { const data = await getAdminRecruiters(params); if (alive) { setRows(data.recruiters); setTotal(data.pagination.total); setPages(data.pagination.pages); } }
        else { const data = await getAdminCompanies(params); if (alive) { setRows(data.companies); setTotal(data.pagination.total); setPages(data.pagination.pages); } }
      } catch (err) { if (alive) setError(axios.isAxiosError(err) ? err.response?.data?.message ?? `Could not load ${titleFor[type].toLowerCase()}.` : `Could not load ${titleFor[type].toLowerCase()}.`); }
      finally { if (alive) setLoading(false); }
    };
    void load();
    return () => { alive = false; };
  }, [type, page, search, status, verificationStatus]);

  const changeStatus = async (row: DirectoryRow) => {
    const next = accountStatus(row) === 'active' ? 'suspended' : 'active';
    try {
      await updateAdminEntityStatus(type, row.id, next);
      setRows((current) => current.map((item) => item.id === row.id ? setRowStatus(item, next) : item));
      const singular = type === 'companies' ? 'Company' : type === 'recruiters' ? 'Recruiter' : 'Candidate';
      setNotice(`${singular} account ${next === 'active' ? 'activated' : 'suspended'}.`);
    } catch (err) { setError(axios.isAxiosError(err) ? err.response?.data?.message ?? 'Could not update account status.' : 'Could not update account status.'); }
  };

  return <AdminLayout title={titleFor[type]} activePage={titleFor[type]}>
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[11px] font-bold tracking-[1.5px] text-[#B95235]">ADMIN DIRECTORY</p><h1 className="mt-1 text-3xl font-bold tracking-tight">{titleFor[type]}</h1><p className="mt-2 text-sm text-[#756D68]">Manage registered {titleFor[type].toLowerCase()} and review account status.</p></div><div className="rounded-xl bg-white px-4 py-3 text-sm text-[#625A55] shadow-sm"><strong className="text-xl text-[#302D2B]">{total.toLocaleString()}</strong><span className="ml-2">total</span></div></header>
    <AdminToast message={notice} onClose={() => setNotice('')} />
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    <section className="rounded-2xl border border-[#F1E6DF] bg-white p-4 shadow-sm"><div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_180px_190px_auto]">
      <label className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A918B]"/><input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder={`Search ${titleFor[type].toLowerCase()}...`} className="h-11 w-full rounded-xl border border-[#E5DDD8] bg-[#FBF8F6] pl-10 pr-3 text-sm outline-none focus:border-[#B77A62]"/></label>
      <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="h-11 rounded-xl border border-[#E5DDD8] bg-[#FBF8F6] px-3 text-sm"><option value="">All account statuses</option><option value="active">Active</option><option value={type === 'companies' ? 'pending' : 'pending_verification'}>{type === 'companies' ? 'Pending' : 'Pending verification'}</option><option value="suspended">Suspended</option>{type !== 'companies' && <option value="blocked">Blocked</option>}</select>
      <select value={verificationStatus} onChange={(e) => { setVerificationStatus(e.target.value); setPage(1); }} className="h-11 rounded-xl border border-[#E5DDD8] bg-[#FBF8F6] px-3 text-sm"><option value="">All verification states</option><option value="pending">Pending</option><option value="verified">Verified</option><option value="rejected">Rejected</option>{type !== 'companies' && <option value="not_submitted">Not submitted</option>}</select>
      <button onClick={() => { setSearchInput(''); setSearch(''); setStatus(''); setVerificationStatus(''); setPage(1); }} className="h-11 rounded-xl px-4 text-sm font-semibold text-[#A64B30] hover:bg-[#FCF5F1]">Clear</button>
    </div></section>
    <section className="overflow-hidden rounded-2xl border border-[#F1E6DF] bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left"><thead className="bg-[#FCF5F1] text-[11px] uppercase tracking-wide text-[#756D68]"><tr><th className="px-5 py-4">Name / organization</th><th className="px-5 py-4">Contact</th><th className="px-5 py-4">Account</th><th className="px-5 py-4">Verification</th><th className="px-5 py-4">Registered</th><th className="px-5 py-4">Actions</th></tr></thead><tbody className="divide-y divide-[#F0E9E5]">{!loading && rows.map((row) => {
      const name = isCompany(row) ? row.name : row.fullName;
      const email = 'email' in row ? row.email : '';
      const verify = row.verificationStatus;
      const description = isCompany(row) ? row.location : isCandidate(row) ? row.headline || row.location || 'Candidate profile' : `${row.designation || 'Recruiter'}${row.company ? ` · ${row.company.name}` : ''}`;
      const contactMeta = isCompany(row) ? `${row.recruiterCount} recruiters` : row.phone || 'No phone';
      return <tr key={row.id} className="hover:bg-[#FCFAF8]"><td className="px-5 py-4"><p className="font-semibold">{name}</p><p className="mt-1 text-xs text-[#817A75]">{description}</p></td><td className="px-5 py-4 text-sm text-[#625A55]"><p>{email}</p><p className="mt-1 text-xs text-[#9A918B]">{contactMeta}</p></td><td className="px-5 py-4"><span className="rounded-full bg-[#F3E5DE] px-2.5 py-1 text-xs capitalize text-[#514A46]">{accountStatus(row).replaceAll('_', ' ')}</span></td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs capitalize ${verify === 'verified' ? 'bg-emerald-50 text-emerald-700' : verify === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>{verify.replaceAll('_', ' ')}</span></td><td className="px-5 py-4 text-xs text-[#756D68]">{new Date(row.registeredAt).toLocaleDateString()}</td><td className="px-5 py-4"><div className="flex items-center gap-3"><button onClick={() => navigate(`/admin/${type}/${row.id}`)} className="inline-flex items-center gap-1 text-xs font-semibold text-[#A64B30]">Details <ExternalLink size={13}/></button>{accountStatus(row) !== 'blocked' && <button disabled={loading} onClick={() => void changeStatus(row)} className="text-xs font-semibold text-[#625A55] hover:text-[#A64B30]">{accountStatus(row) === 'active' ? 'Suspend' : 'Activate'}</button>}</div></td></tr>;
    })}</tbody></table></div>{loading && <p className="py-14 text-center text-sm text-[#817A75]">Loading {titleFor[type].toLowerCase()}...</p>}{!loading && !error && rows.length === 0 && <p className="py-14 text-center text-sm text-[#817A75]">No matching {titleFor[type].toLowerCase()} found.</p>}
      {!loading && pages > 1 && <div className="flex items-center justify-between border-t border-[#F0E9E5] px-5 py-4 text-sm"><span className="text-xs text-[#817A75]">Page {page} of {pages} · {total} records</span><div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage((n) => n - 1)} className="rounded-lg border border-[#E5DDD8] px-3 py-2 disabled:opacity-40">Previous</button><button disabled={page >= pages} onClick={() => setPage((n) => n + 1)} className="rounded-lg border border-[#E5DDD8] px-3 py-2 disabled:opacity-40">Next</button></div></div>}
    </section>
  </AdminLayout>;
}
