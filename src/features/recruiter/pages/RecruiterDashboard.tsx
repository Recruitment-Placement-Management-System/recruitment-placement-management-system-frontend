import { useEffect, useMemo, useState } from 'react';
import { recruiterJobsApi, type RecruiterJob } from '../../../api/recruiter-jobs.api';
import { recruiterApplicationsApi, type RecruiterApplication } from '../../../api/recruiter-applications.api';
import { useNavigate } from 'react-router-dom';

import { logout } from '../../../api/auth.api';
import useAuthStore from '../../../store/auth.store';
import { RecruiterSidebar } from '../components/RecruiterSidebar';
import { Navbar } from '../../../components/common/Navbar';
import { Footer } from '../../../components/common/Footer';

import {
  Activity,
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  FileText,
  Filter,
  LogOut,
  MessageSquare,
  Plus,
  Search,
  Settings,
  Users,
  Bot,
  TrendingUp,
  UserRound,
} from 'lucide-react';

const formatStatus = (status: RecruiterApplication['status']) => status.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
const formatDate = (date: string) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(date));
const formatRelativeDate = (date: string) => {
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
  if (days <= 0) return 'Applied today';
  if (days === 1) return 'Applied yesterday';
  return `Applied ${days} days ago`;
};

function SectionHeading({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-[14px] font-bold text-[#102039]">
        {title}
      </h2>

      {action && (
        <button type="button" onClick={onAction} className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#006B63] transition hover:text-[#004F49]">
          {action}

          <ArrowRight size={13} />
        </button>
      )}
    </div>
  );
}

function RecruiterDashboard() {
  const navigate = useNavigate();

  const logoutUser = useAuthStore(
    (state) => state.logout
  );
  const userEmail = useAuthStore((state) => state.user?.email);
  const [jobs, setJobs] = useState<RecruiterJob[]>([]);
  const [applications, setApplications] = useState<RecruiterApplication[]>([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [dashboardError, setDashboardError] = useState('');

  const [showProfileMenu, setShowProfileMenu] =
    useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const loadDashboard = async () => {
      setLoadingDashboard(true);
      setDashboardError('');
      try {
        const [jobPage, applicationPage] = await Promise.all([
          recruiterJobsApi.list({ page: 1, limit: 100, sortBy: 'latest' }),
          recruiterApplicationsApi.list({ page: 1, limit: 100 }),
        ]);
        const [jobPages, applicationPages] = await Promise.all([
          Promise.all(Array.from({ length: Math.max(0, jobPage.pagination.pages - 1) }, (_, index) => recruiterJobsApi.list({ page: index + 2, limit: 100, sortBy: 'latest' }))),
          Promise.all(Array.from({ length: Math.max(0, applicationPage.pagination.pages - 1) }, (_, index) => recruiterApplicationsApi.list({ page: index + 2, limit: 100 }))),
        ]);
        if (!active) return;
        setJobs([...jobPage.jobs, ...jobPages.flatMap((page) => page.jobs)]);
        setApplications([...applicationPage.applications, ...applicationPages.flatMap((page) => page.applications)]);
      } catch (error) {
        console.error('Failed to load recruiter dashboard:', error);
        if (active) setDashboardError('We could not load your recruitment activity. Please refresh the page.');
      } finally {
        if (active) setLoadingDashboard(false);
      }
    };
    void loadDashboard();
    return () => { active = false; };
  }, []);

  const applicationCounts = useMemo(() => ({
    submitted: applications.filter((application) => application.status === 'submitted').length,
    underReview: applications.filter((application) => application.status === 'under_review').length,
    shortlisted: applications.filter((application) => application.status === 'shortlisted').length,
    rejected: applications.filter((application) => application.status === 'rejected').length,
  }), [applications]);
  const stats = [
    { label: 'PUBLISHED JOBS', value: jobs.filter((job) => job.status === 'published').length, detail: `${jobs.length} total jobs`, icon: BriefcaseBusiness },
    { label: 'TOTAL APPLICATIONS', value: applications.length, detail: 'Across your jobs', icon: FileText },
    { label: 'UNIQUE CANDIDATES', value: new Set(applications.map((application) => application.candidateId)).size, detail: 'Have applied', icon: Users },
    { label: 'SHORTLISTED', value: applicationCounts.shortlisted, detail: 'Ready for next step', icon: CalendarDays },
  ];
  const pipeline = [
    { label: 'Submitted', count: applicationCounts.submitted, note: 'New applications' },
    { label: 'Under review', count: applicationCounts.underReview, note: 'In review' },
    { label: 'Shortlisted', count: applicationCounts.shortlisted, note: 'Selected candidates' },
    { label: 'Rejected', count: applicationCounts.rejected, note: 'Closed applications' },
  ].map((stage) => ({ ...stage, progress: applications.length ? `${Math.round((stage.count / applications.length) * 100)}%` : '0%', rate: applications.length ? `${Math.round((stage.count / applications.length) * 100)}%` : '0%' }));
  const recentApplications = [...applications].sort((a, b) => Date.parse(b.submittedAt) - Date.parse(a.submittedAt)).slice(0, 5);
  const jobApplicationCounts = applications.reduce<Record<string, number>>((counts, application) => {
    counts[application.jobId] = (counts[application.jobId] ?? 0) + 1;
    return counts;
  }, {});
  const activeJobs = jobs.filter((job) => job.status === 'published').slice(0, 4);
  const navigateTo = (page: string) => {
    if (page === 'Profile') navigate('/recruiter/profile');
    else if (page === 'Manage Jobs') navigate('/recruiter/jobs');
    else if (page === 'Applications') navigate('/recruiter/applications');
    else if (page === 'Company') navigate('/recruiter/company');
    else if (page === 'Verification') navigate('/recruiter/verification');
    else if (page === 'Verification History') navigate('/recruiter/verification/history');
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      logoutUser();
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FF] text-[#102039]">
      <RecruiterSidebar
        activePage="Dashboard"
        onNavigate={navigateTo}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        profile={{
          name: userEmail ?? 'Recruiter',
          description: 'Recruiter account',
          initials: userEmail?.slice(0, 2).toUpperCase() ?? 'RE',
        }}
      />

      <main className="min-h-screen min-w-0 lg:ml-[250px]">

          {/* Top bar */}

          <Navbar
            title="Recruiter Dashboard"
            context="Recruitment Hub / Overview"
            onMenuClick={() => setSidebarOpen(true)}
            accentClass="hover:bg-[#EDF8F6] hover:text-[#006B63]"
          >
            <div className="relative mx-auto hidden max-w-[470px] min-w-0 flex-1 md:block">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A858F]"
              />

              <input
                placeholder="Search candidates, jobs, applications..."
                className="h-9 w-full rounded-lg border border-[#E4EAF3] bg-[#F0F5FF] pl-9 pr-3 text-[12px] outline-none transition focus:border-[#006B63] focus:ring-2 focus:ring-[#006B63]/10"
              />
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-3">
              <button className="hidden items-center gap-1.5 rounded-lg bg-[#F7F0FF] px-3 py-2 text-[11px] font-semibold text-[#7625B9] sm:flex">
                <Bot size={15} />
                Assistant
              </button>

              <button
                aria-label="Open messages"
                className="relative rounded-lg p-2 text-[#52606B] hover:bg-[#F0F8F7] hover:text-[#006B63]"
              >
                <MessageSquare size={17} />
              </button>

              <button
                aria-label="Notifications"
                className="relative rounded-lg p-2 text-[#52606B] hover:bg-[#F0F8F7] hover:text-[#006B63]"
              >
                <Bell size={17} />

                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#DC4545]" />
              </button>

              {/* Profile menu */}

              <div className="relative">
                <button
                  type="button"
                  aria-label="Open profile menu"
                  aria-expanded={showProfileMenu}
                  onClick={() =>
                    setShowProfileMenu(
                      (current) => !current
                    )
                  }
                  className="grid h-8 w-8 place-items-center rounded-full border border-[#DCE6ED] bg-[#D8E9F7] text-[10px] font-bold text-[#006B63] transition hover:border-[#006B63] hover:ring-2 hover:ring-[#006B63]/10"
                >
                  {userEmail?.slice(0, 2).toUpperCase() ?? 'RE'}
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-[#E4EAF3] bg-white p-1.5 shadow-[0_10px_30px_rgba(16,32,57,0.12)]">

                    <button
                      type="button"
                      onClick={() =>
                        navigate('/recruiter/profile')
                      }
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[12px] font-medium text-[#46545A] transition hover:bg-[#F0F8F7] hover:text-[#006B63]"
                    >
                      <UserRound size={15} />
                      My Profile
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setShowProfileMenu(false)
                      }
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[12px] font-medium text-[#46545A] transition hover:bg-[#F0F8F7] hover:text-[#006B63]"
                    >
                      <Settings size={15} />
                      Settings
                    </button>

                    <div className="my-1 border-t border-[#EEF0F5]" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[12px] font-semibold text-[#D04444] transition hover:bg-[#FFF2F2]"
                    >
                      <LogOut size={15} />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </Navbar>

          <div className="space-y-5 p-4 sm:p-6">

            {/* Welcome and actions */}

            <section className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-[27px] font-bold tracking-tight text-[#102039] sm:text-[30px]">
                    Good morning, {userEmail?.split('@')[0] ?? 'Recruiter'}
                  </h1>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#BFE9E5] px-2.5 py-1 text-[10px] font-bold text-[#006B63]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#008578]" />
                    Live Ops
                  </span>
                </div>

                <p className="mt-1 text-[13px] text-[#52606B]">
                  Here's what's happening with your recruitment activity today.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex h-9 items-center gap-2 rounded-lg border border-[#E5EAF2] bg-white px-3 text-[11px] text-[#46545A]">
                  <span className="h-2 w-2 rounded-full bg-[#006B63]" />
                  Today: {formatDate(new Date().toISOString())}
                </div>

                <button onClick={() => navigate('/recruiter/applications')} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#BFD5D2] bg-white px-3 text-[11px] font-semibold text-[#006B63] transition hover:bg-[#F0F8F7]">
                  <Users size={15} />
                  Find Candidates
                </button>

                <button onClick={() => navigate('/recruiter/jobs')} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#006B63] px-3 text-[11px] font-semibold text-white shadow-sm transition hover:bg-[#00564F]">
                  <Plus size={15} />
                  Create Job
                </button>
              </div>
            </section>

            {/* Statistics */}

            <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;

                return (
                  <article
                    key={stat.label}
                    className="rounded-xl border border-[#EDF0F5] bg-white p-4 shadow-[0_1px_2px_rgba(16,32,57,0.02)]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[11px] font-bold tracking-[0.5px] text-[#46545A]">
                        {stat.label}
                      </p>

                      <div
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                          index === 1
                            ? 'bg-[#E1ECFF] text-[#176A82]'
                            : 'bg-[#BFE9E5] text-[#006B63]'
                        }`}
                      >
                        <Icon size={18} />
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[30px] font-bold leading-none tracking-tight text-[#102039]">
                        {stat.value}
                      </p>

                      <span className="inline-flex items-center gap-1 rounded-md bg-[#BFE9E5] px-2 py-1 text-[10px] font-semibold text-[#006B63]">
                        {index === 3 ? (
                          <CalendarDays size={11} />
                        ) : (
                          <TrendingUp size={11} />
                        )}

                        {stat.detail}
                      </span>
                    </div>
                  </article>
                );
              })}
            </section>

            {/* Application pipeline */}

            <section className="rounded-xl border border-[#EDF0F5] bg-white p-4 sm:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-[13px] font-bold text-[#102039]">
                    Application Pipeline
                  </h2>

                  <p className="mt-0.5 text-[11px] text-[#52606B]">
                    Overall candidate flow across open requisitions
                  </p>
                </div>

                <div className="inline-flex items-center gap-1.5 rounded-lg bg-[#EEF4FF] px-3 py-2 text-[10px] text-[#46545A]">
                  <Filter size={13} />

                    Application total:

                  <span className="font-bold text-[#006B63]">
                    {applications.length}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
                {pipeline.map((stage) => (
                  <div
                    key={stage.label}
                    className="rounded-lg bg-[#EEF4FF] p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <span className="text-[10px] font-medium text-[#46545A]">
                        {stage.label}
                      </span>

                      <span className="text-[10px] font-bold text-[#006B63]">
                        {stage.rate}
                      </span>
                    </div>

                    <p className="mt-2 text-[20px] font-bold text-[#102039]">
                      {stage.count}
                    </p>

                    <div className="mt-2 h-[5px] overflow-hidden rounded-full bg-[#D4E3FF]">
                      <div
                        className="h-full rounded-full bg-[#006B63]"
                        style={{
                          width: stage.progress,
                        }}
                      />
                    </div>

                    <p className="mt-2 text-[10px] text-[#52606B]">
                      {stage.note}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Active jobs and interviews */}

            <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_1fr]">
              <article className="min-w-0 rounded-xl border border-[#EDF0F5] bg-white p-4 sm:p-5">
                <SectionHeading title="Published Jobs" action="Manage Jobs" onAction={() => navigate('/recruiter/jobs')} />
                {dashboardError ? <p className="py-8 text-center text-[12px] text-red-600">{dashboardError}</p> : loadingDashboard ? <p className="py-8 text-center text-[12px] text-[#52606B]">Loading your jobs...</p> : activeJobs.length ? <div className="space-y-2.5">
                  {activeJobs.map((job) => (
                    <div key={job._id} className="rounded-xl bg-[#EEF4FF] p-3.5 transition hover:bg-[#E7F0FF]">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-[12px] font-bold text-[#102039]">{job.title}</h3>
                            <span className="rounded-full bg-[#BFE9E5] px-2 py-0.5 text-[9px] font-semibold text-[#006B63]">Published</span>
                          </div>
                          <p className="mt-1.5 text-[10px] text-[#46545A]">{job.companyName} · {job.employmentType.replaceAll('_', ' ')} · {job.location} · {job.workMode}</p>
                        </div>
                        <button onClick={() => navigate('/recruiter/jobs')} className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-[10px] font-semibold text-[#006B63] shadow-sm transition hover:bg-[#BFE9E5]">View Job</button>
                      </div>
                      <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-semibold text-[#6C7A7E]"><span>{jobApplicationCounts[job._id] ?? 0} applications</span><span>·</span><span>{formatDate(job.createdAt)}</span></div>
                    </div>
                  ))}
                </div> : <p className="py-8 text-center text-[12px] text-[#52606B]">No published jobs yet. Create a job to start receiving applications.</p>}
              </article>

              <article className="min-w-0 rounded-xl border border-[#EDF0F5] bg-white p-4 sm:p-5">
                <SectionHeading title="Interview Scheduling" />
                <div className="grid min-h-40 place-items-center rounded-xl bg-[#EEF4FF] p-5 text-center">
                  <div><CalendarDays size={24} className="mx-auto text-[#8090A5]" /><p className="mt-2 text-[12px] font-semibold text-[#102039]">No interviews scheduled</p><p className="mt-1 max-w-xs text-[11px] text-[#52606B]">Interview scheduling is not available yet. Shortlisted candidates will appear in Applications.</p><button onClick={() => navigate('/recruiter/applications')} className="mt-3 text-[11px] font-semibold text-[#006B63]">Review applications ?</button></div>
                </div>
              </article>
            </section>

            {/* Recent applications and hiring summary */}
            <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_1fr]">
              <article className="min-w-0 rounded-xl border border-[#EDF0F5] bg-white p-4 sm:p-5">
                <SectionHeading title="Recent Applications" action="View Applications" onAction={() => navigate('/recruiter/applications')} />
                {dashboardError ? <p className="py-6 text-center text-[12px] text-red-600">{dashboardError}</p> : loadingDashboard ? <p className="py-6 text-center text-[12px] text-[#52606B]">Loading applications...</p> : recentApplications.length ? <div className="divide-y divide-[#E8ECF5]">
                  {recentApplications.map((application) => {
                    const job = jobs.find((item) => item._id === application.jobId);
                    const initials = application.candidate.fullName.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase();
                    return <div key={application._id} className="flex flex-wrap items-center gap-3 py-3 first:pt-1 last:pb-1">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#DCE8FF] text-[10px] font-bold text-[#006B63]">{initials}</div>
                      <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-[11px] font-bold text-[#102039]">{application.candidate.fullName}</p><span className="rounded-full bg-[#DCE8FF] px-2 py-0.5 text-[9px] text-[#52606B]">{formatStatus(application.status)}</span></div><p className="mt-1 text-[10px] text-[#52606B]">{job?.title ?? 'Job'} · {formatRelativeDate(application.submittedAt)}</p></div>
                      <button onClick={() => navigate('/recruiter/applications')} className="shrink-0 rounded-lg bg-[#EEF4FF] px-3 py-2 text-[10px] font-semibold text-[#102039] transition hover:bg-[#BFE9E5]">Review</button>
                    </div>;
                  })}
                </div> : <p className="py-6 text-center text-[12px] text-[#52606B]">No applications have been submitted yet.</p>}
              </article>

              <article className="rounded-xl border border-[#EDF0F5] bg-white p-4 sm:p-5">
                <div className="mb-4 flex items-center gap-2 text-[#006B63]"><Activity size={16} /><h2 className="text-[12px] font-bold tracking-wide">HIRING ACTIVITY</h2></div>
                <div className="rounded-lg bg-[#EEF4FF] p-3.5"><p className="text-[11px] leading-5 text-[#102039]">{applications.length ? `${applications.length} applications received across ${jobs.length} jobs. ${applicationCounts.shortlisted} candidates are shortlisted for next steps.` : 'Your hiring activity will appear here once candidates apply to your jobs.'}</p></div>
                <div className="mt-3 grid grid-cols-2 gap-2"><div className="rounded-lg bg-[#EEF4FF] p-3"><p className="text-[9px] font-bold tracking-wide text-[#006B63]">DRAFT JOBS</p><p className="mt-1 text-[23px] font-bold leading-none text-[#102039]">{jobs.filter((job) => job.status === 'draft').length}</p><p className="mt-1.5 text-[9px] text-[#7A858F]">Awaiting publication</p></div><div className="rounded-lg bg-[#EEF4FF] p-3"><p className="text-[9px] font-bold tracking-wide text-[#006B63]">SHORTLISTED</p><p className="mt-1 text-[23px] font-bold leading-none text-[#102039]">{applicationCounts.shortlisted}</p><p className="mt-1.5 text-[9px] text-[#7A858F]">Candidates to follow up</p></div></div>
                <button onClick={() => navigate('/recruiter/applications')} className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-[#006B63] text-[11px] font-semibold text-white transition hover:bg-[#00564F]">Review applications<ArrowRight size={14} /></button>
              </article>
            </section>
            <Footer role="Recruiter Portal" status={<><Activity size={12} className="text-[#006B63]" /> All systems operational</>} />
          </div>
        </main>
    </div>
  );
}

export default RecruiterDashboard;


