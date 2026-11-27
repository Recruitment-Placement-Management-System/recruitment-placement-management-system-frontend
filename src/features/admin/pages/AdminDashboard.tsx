import { useEffect, useState } from 'react';
import { ArrowRight, BriefcaseBusiness, Building2, ClipboardList, ShieldCheck, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAdminDashboard, type AdminVerification } from '../../../api/admin.api';
import { AdminLayout } from '../components/AdminLayout';

type DashboardData = Awaited<ReturnType<typeof getAdminDashboard>>;
const tiles = [
  { key: 'totalUsers', label: 'Total users', icon: Users },
  { key: 'candidates', label: 'Candidates', icon: Users },
  { key: 'recruiters', label: 'Recruiters', icon: BriefcaseBusiness },
  { key: 'companies', label: 'Companies', icon: Building2 },
  { key: 'activeJobs', label: 'Active jobs', icon: BriefcaseBusiness },
  { key: 'applications', label: 'Applications', icon: ClipboardList },
  { key: 'verificationQueue', label: 'Pending verifications', icon: ShieldCheck },
] as const;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let alive = true;
    getAdminDashboard().then((data) => { if (alive) setDashboard(data); }).catch((err: unknown) => {
      console.error('Unable to load admin dashboard:', err);
      if (alive) setError('Could not load platform statistics. Please refresh and try again.');
    }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);
  const stats = dashboard?.statistics;
  const value = (key: string) => typeof stats?.[key] === 'number' ? stats[key] as number : 0;
  const pending = typeof stats?.pendingVerifications === 'object' ? stats.pendingVerifications : {};
  const navigateToVerification = (request: AdminVerification) => navigate(`/admin/verifications/${request.type}/${request.id}`);

  return <AdminLayout title="Admin Dashboard" activePage="Dashboard">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[11px] font-bold tracking-[1.5px] text-[#B95235]">PLATFORM OVERVIEW</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Admin Dashboard</h1><p className="mt-2 text-sm text-[#756D68]">Monitor users, recruitment activity, companies, and verification workflows.</p></div><span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#514A46] shadow-sm">Platform administration</span></header>
    <section className="flex flex-wrap gap-3 rounded-2xl border border-[#F1E6DF] bg-white p-5 shadow-sm"><div className="mr-auto"><p className="text-lg font-bold">Good to see you, Admin.</p><p className="mt-1 text-sm text-[#756D68]">Here is the latest activity across R&amp;PMS.</p></div><span className="self-center rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">● Services operational</span></section>
    <div className="flex flex-wrap gap-2">{[
      ['Review Verification Queue', '/admin/verifications', ShieldCheck], ['Manage Candidates', '/admin/candidates', Users], ['Manage Recruiters', '/admin/recruiters', BriefcaseBusiness], ['Review Companies', '/admin/companies', Building2],
    ].map(([label, path, Icon]) => <button key={String(label)} onClick={() => navigate(String(path))} className="inline-flex items-center gap-2 rounded-xl bg-[#C96849] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#AC5237]"><Icon size={16} />{String(label)}<ArrowRight size={15} /></button>)}</div>
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{tiles.map(({ key, label, icon: Icon }) => <article key={key} className="rounded-2xl border border-[#F1E6DF] bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-wide text-[#756D68]">{label}</p><span className="rounded-lg bg-[#FBEDE8] p-2 text-[#B95235]"><Icon size={18} /></span></div><p className="mt-5 text-3xl font-bold">{loading ? '—' : value(key).toLocaleString()}</p><p className="mt-1 text-xs text-[#817A75]">Current platform total</p></article>)}</section>
    <section className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
      <article className="rounded-2xl border border-[#F1E6DF] bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-lg font-bold">Verification queue</h2><p className="mt-1 text-xs text-[#817A75]">Latest requests requiring review</p></div><button onClick={() => navigate('/admin/verifications')} className="text-sm font-semibold text-[#A64B30]">View queue →</button></div><div className="mb-4 grid grid-cols-3 gap-2">{(['candidates', 'recruiters', 'companies'] as const).map((key) => <div key={key} className="rounded-xl bg-[#FCF5F1] p-3"><p className="text-[10px] font-bold uppercase text-[#756D68]">{key}</p><p className="mt-1 text-xl font-bold">{typeof pending[key] === 'number' ? pending[key] : 0}</p></div>)}</div>{loading ? <p className="py-5 text-center text-sm text-[#817A75]">Loading verification activity...</p> : (dashboard?.latestVerifications ?? []).length ? <div className="divide-y divide-[#F0E9E5]">{dashboard?.latestVerifications.map((request) => <button key={`${request.type}-${request.id}`} onClick={() => navigateToVerification(request)} className="flex w-full flex-wrap items-center gap-3 py-3 text-left hover:bg-[#FCFAF8]"><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{request.name}</span><span className="mt-1 block text-xs capitalize text-[#817A75]">{request.type} · {request.email ?? 'No email'}</span></span><span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold capitalize text-amber-700">{request.status}</span></button>)}</div> : <p className="py-6 text-center text-sm text-[#817A75]">No verification requests are waiting for review.</p>}</article>
      <article className="rounded-2xl border border-[#F1E6DF] bg-white p-5 shadow-sm"><h2 className="text-lg font-bold">Recruitment overview</h2><p className="mt-1 text-xs text-[#817A75]">Platform activity totals from the admin API</p><div className="mt-5 space-y-4">{[['Active jobs', value('activeJobs')], ['Applications', value('applications')], ['Interviews', value('interviews')]].map(([label, count]) => <div key={String(label)} className="flex items-center justify-between border-b border-[#F0E9E5] pb-3"><span className="text-sm text-[#625A55]">{label}</span><strong className="text-lg">{loading ? '—' : Number(count).toLocaleString()}</strong></div>)}</div><p className="mt-4 text-xs leading-5 text-[#817A75]">Recruitment analytics beyond these totals are not exposed by the current admin API.</p></article>
    </section>
  </AdminLayout>;
}
