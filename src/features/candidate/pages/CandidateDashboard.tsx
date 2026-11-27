import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

import { logout } from '../../../api/auth.api';
import { candidateDashboardApi, type CandidateDashboard as CandidateDashboardData } from '../../../api/candidate-dashboard.api';
import { candidateJobsApi, type CandidateJob } from '../../../api/candidate-jobs.api';
import { candidateProfileApi } from '../../../api/candidate-profile.api';
import useAuthStore from '../../../store/auth.store';
import { CandidateSidebar } from '../components/CandidateSidebar';
import { Navbar } from '../../../components/common/Navbar';
import { Footer } from '../../../components/common/Footer';

import {
  UserRound,
  Search,
  BriefcaseBusiness,
  CalendarDays,
  Mail,
  Bell,
  Settings,
  ChevronRight,
  X,
  Bookmark,
  Clock3,
  MapPin,
  ArrowUpRight,
  CircleAlert,
  LogOut,
  Sparkles,
} from 'lucide-react';

function statusStyle(status: string) {
  if (status === 'shortlisted') return 'border-[#bfe8d2] bg-[#eaf8f0] text-[#168254]';
  if (status === 'rejected' || status === 'withdrawn') return 'border-[#d9deea] bg-[#eff1f5] text-[#64708a]';
  if (status === 'under_review') return 'border-[#d7d1ff] bg-[#f1efff] text-[#5549ed]';
  return 'border-[#d9deea] bg-[#eff1f5] text-[#64708a]';
}
function dateLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
function pretty(value: string) { return value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()); }

function SectionTitle({
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
      <h2 className="text-[17px] font-bold tracking-[-0.4px] text-[#20283a] sm:text-[19px]">
        {title}
      </h2>

      {action && (
        <button
          type="button"
          onClick={onAction}
          className="flex shrink-0 items-center gap-1 text-[12px] font-semibold text-[#5046e5] transition hover:text-[#3930c5]"
        >
          {action}
          <ChevronRight size={15} />
        </button>
      )}
    </div>
  );
}

function CandidateDashboard() {
  const navigate = useNavigate();
  const logoutUser = useAuthStore((state) => state.logout);
  const userEmail = useAuthStore((state) => state.user?.email);

  const [activePage, setActivePage] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [dashboard, setDashboard] = useState<CandidateDashboardData | null>(null);
  const [profileName, setProfileName] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notice, setNotice] = useState('');
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showNotice = (message: string) => {
    setNotice(message);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = message
      ? setTimeout(() => setNotice(''), 3200)
      : null;
  };

  useEffect(() => {
    let active = true;
    void Promise.allSettled([candidateDashboardApi.get(), candidateProfileApi.get(), candidateJobsApi.saved()])
      .then(([dashboardResult, profileResult, savedResult]) => {
        if (!active) return;
        if (dashboardResult.status === 'fulfilled') setDashboard(dashboardResult.value);
        else showNotice('Could not load your dashboard data. Please refresh to try again.');
        if (profileResult.status === 'fulfilled') setProfileName(profileResult.value.fullName || '');
        if (savedResult.status === 'fulfilled') setSavedJobs(new Set(savedResult.value.map(({ job }) => job._id)));
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(
    () => () => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    },
    [],
  );

  const recommendedJobs = dashboard?.recommendedJobs ?? [];
  const recentApplications = dashboard?.applications.recent ?? [];
  const applicationCounts = dashboard?.applications.statusCounts;
  const profilePercentage = dashboard?.profileCompletion.percentage ?? 0;
  const greetingName = profileName.trim().split(/\s+/)[0] || userEmail?.split('@')[0] || 'there';
  const filteredJobs = recommendedJobs.filter((job) => {
    const query = search.toLowerCase().trim();

    return (
      !query ||
      job.title.toLowerCase().includes(query) ||
      job.companyName.toLowerCase().includes(query) ||
      job.location.toLowerCase().includes(query)
    );
  });

  const navigateTo = (page: string) => {
    if (page === 'My Profile') {
      navigate('/candidate/profile');
      return;
    }
    if (page === 'Resume') {
      navigate('/candidate/resume');
      return;
    }
    if (page === 'Find Jobs') {
      navigate('/candidate/jobs');
      return;
    }
    if (page === 'Saved Jobs') {
      navigate('/candidate/jobs/saved');
      return;
    }
    if (page === 'My Applications') {
      navigate('/candidate/applications');
      return;
    }
    setActivePage(page);

    if (page !== 'Dashboard') {
      showNotice(
        `${page} page navigation will be connected when the route is implemented.`,
      );
    } else {
      showNotice('');
    }
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

  const statistics = [
    { label: 'Applications', value: dashboard?.applications.total ?? 0, icon: BriefcaseBusiness, color: 'text-[#59647d]', background: 'bg-[#eef0f5]', border: 'border-l-[#8993aa]' },
    { label: 'Submitted', value: applicationCounts?.submitted ?? 0, icon: Clock3, color: 'text-[#64708a]', background: 'bg-[#eff1f5]', border: 'border-l-[#8993aa]' },
    { label: 'Under Review', value: applicationCounts?.under_review ?? 0, icon: Search, color: 'text-[#5549ed]', background: 'bg-[#efedff]', border: 'border-l-[#5549ed]' },
    { label: 'Shortlisted', value: applicationCounts?.shortlisted ?? 0, icon: CalendarDays, color: 'text-[#08a878]', background: 'bg-[#e6fbf3]', border: 'border-l-[#08b889]' },
    { label: 'Rejected', value: applicationCounts?.rejected ?? 0, icon: X, color: 'text-[#c44759]', background: 'bg-[#fff0f1]', border: 'border-l-[#d85a68]' },
    { label: 'Withdrawn', value: applicationCounts?.withdrawn ?? 0, icon: CircleAlert, color: 'text-[#7a8498]', background: 'bg-[#eff1f5]', border: 'border-l-[#8993aa]' },
  ];

  const toggleSavedJob = async (job: CandidateJob) => {
    const isSaved = savedJobs.has(job._id);
    try {
      if (isSaved) await candidateJobsApi.unsave(job._id);
      else await candidateJobsApi.save(job._id);
      setSavedJobs((current) => {
        const next = new Set(current);
        if (isSaved) next.delete(job._id);
        else next.add(job._id);
        return next;
      });
      showNotice(isSaved ? `${job.title} removed from saved jobs.` : `${job.title} saved for later.`);
    } catch {
      showNotice('Could not update saved jobs. Please try again.');
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-[#172033]">
      <CandidateSidebar
        activePage={activePage}
        onNavigate={navigateTo}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        profile={{
          name: userEmail ?? 'Candidate',
          description: 'Candidate account',
          initials: userEmail?.slice(0, 2).toUpperCase() ?? 'CA',
        }}
        onProfileClick={() => navigateTo('My Profile')}
      />

      <div className="min-h-screen lg:pl-[250px]">
        {/* Top navigation */}
        <Navbar title={activePage} onMenuClick={() => setSidebarOpen(true)}>
          <div className="relative min-w-0 w-full max-w-[430px]">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8792a9]"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search jobs, companies, or skills..."
              aria-label="Search recommended jobs"
              className="h-[43px] w-full rounded-lg border border-[#dce1ed] bg-white pl-10 pr-4 text-[13px] text-[#26344c] outline-none transition placeholder:text-[#929cb0] focus:border-[#5046e5] focus:ring-4 focus:ring-[#5046e5]/[0.08]"
            />
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-3">
            <div className="relative">
              <button
                type="button"
                aria-label="Notifications"
                onClick={() => {
                  setShowNotifications((current) => !current);
                  setShowProfileMenu(false);
                }}
                className="relative grid h-10 w-10 place-items-center rounded-lg text-[#66718a] transition hover:bg-[#f1f0ff] hover:text-[#5046e5]"
              >
                <Bell size={20} />
                <span className="absolute right-2.5 top-2 h-2 w-2 rounded-full border-2 border-white bg-[#f05269]" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 w-[270px] rounded-xl border border-[#e4e6ef] bg-white p-4 shadow-xl">
                  <p className="text-[13px] font-bold text-[#20283a]">
                    Notifications
                  </p>

                  <p className="mt-2 text-[12px] leading-5 text-[#78839a]">
                    Your application and interview updates will appear here.
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              aria-label="Messages"
              onClick={() => navigateTo('Messages')}
              className="grid h-10 w-10 place-items-center rounded-lg text-[#66718a] transition hover:bg-[#f1f0ff] hover:text-[#5046e5]"
            >
              <Mail size={20} />
            </button>

            <div className="relative">
              <button
                type="button"
                aria-label="Open account menu"
                onClick={() => {
                  setShowProfileMenu((current) => !current);
                  setShowNotifications(false);
                }}
                className="ml-1 grid h-10 w-10 place-items-center rounded-full border-2 border-[#e5e2ff] bg-gradient-to-br from-[#6155f3] to-[#3930b9] text-[12px] font-bold text-white transition hover:ring-4 hover:ring-[#5046e5]/10"
              >
                {userEmail?.slice(0, 2).toUpperCase() ?? 'CA'}
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 top-12 w-48 rounded-xl border border-[#e4e6ef] bg-white p-2 shadow-xl">
                  <button
                    type="button"
                    onClick={() => navigateTo('My Profile')}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[12px] text-[#59647d] hover:bg-[#f3f2ff]"
                  >
                    <UserRound size={16} />
                    My Profile
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateTo('Settings')}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[12px] text-[#59647d] hover:bg-[#f3f2ff]"
                  >
                    <Settings size={16} />
                    Settings
                  </button>

                  <div className="my-1 border-t border-[#eceef4]" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[12px] text-[#c44759] hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </Navbar>

        {/* Main dashboard content */}
        <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {notice && (
            <div
              role="status"
              className="mb-5 flex items-start justify-between gap-3 rounded-lg border border-[#dcd9ff] bg-gradient-to-r from-[#f2f0ff] to-white px-4 py-3 text-[12px] text-[#5046e5]"
            >
              <span>{notice}</span>

              <button
                type="button"
                onClick={() => showNotice('')}
                aria-label="Dismiss message"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {activePage !== 'Dashboard' && (
            <div className="mb-5 rounded-xl border border-[#e2e4ed] bg-white p-5">
              <p className="text-[14px] font-semibold text-[#26344c]">
                {activePage}
              </p>

              <p className="mt-1 text-[12px] leading-5 text-[#78839a]">
                This navigation item is ready for routing. Its page and API
                integration can be added next.
              </p>

              <button
                type="button"
                onClick={() => navigateTo('Dashboard')}
                className="mt-3 text-[12px] font-semibold text-[#5046e5] hover:underline"
              >
                Return to dashboard
              </button>
            </div>
          )}

          {/* Welcome and profile completion */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_310px]">
            <section className="relative flex min-h-[155px] flex-col justify-center overflow-hidden rounded-xl border border-[#dcd9f4] bg-gradient-to-br from-white via-[#fbfaff] to-[#f0eeff] px-6 py-7 shadow-[0_2px_5px_rgba(23,32,51,0.025)] sm:px-9">
              <div className="absolute -right-12 -top-20 h-56 w-56 rounded-full bg-[#5046e5]/[0.05] blur-3xl" />

              <div className="relative">
                <p className="mb-2 text-[10px] font-bold tracking-[1.7px] text-[#5046e5]">
                  YOUR CAREER JOURNEY
                </p>

                <h2 className="text-[25px] font-bold tracking-[-0.9px] text-[#20283a] sm:text-[29px]">
                  Good morning, {greetingName}.
                </h2>

                <p className="mt-2 text-[13px] leading-6 text-[#69748d] sm:text-[15px]">
                  Here's what's happening with your job search today.
                </p>
              </div>
            </section>

            <section className="rounded-xl border border-[#deddf0] bg-white p-5 shadow-[0_2px_5px_rgba(23,32,51,0.025)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-[14px] font-bold text-[#263047]">
                    Profile Completion
                  </h2>

                  <p className="mt-1 text-[12px] text-[#79839a]">
                    Stand out to recruiters
                  </p>
                </div>

                <div className="relative grid h-[58px] w-[58px] shrink-0 place-items-center">
                  <svg
                    viewBox="0 0 60 60"
                    className="absolute inset-0 h-full w-full -rotate-90"
                    aria-hidden="true"
                  >
                    <circle
                      cx="30"
                      cy="30"
                      r="24"
                      fill="none"
                      stroke="#eeedff"
                      strokeWidth="6"
                    />

                    <circle
                      cx="30"
                      cy="30"
                      r="24"
                      fill="none"
                      stroke="#5549ed"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 24 * (profilePercentage / 100)} ${2 * Math.PI * 24}`}
                    />
                  </svg>

                  <span className="text-[13px] font-bold text-[#263047]">
                    {loading ? '—' : `${profilePercentage}%`}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigateTo('My Profile')}
                className="mt-5 flex h-[39px] w-full items-center justify-center gap-2 rounded-lg border border-[#dcd9f0] bg-gradient-to-r from-[#fafaff] to-[#f3f2ff] text-[12px] font-semibold text-[#4b40d7] transition hover:border-[#b9b3fa] hover:from-[#f1efff] hover:to-[#eae8ff]"
              >
                Complete your profile
                <ArrowUpRight size={15} />
              </button>
            </section>
          </div>

          {/* Application statistics */}
          <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 2xl:grid-cols-6 xl:gap-4">
            {statistics.map(
              ({
                label,
                value,
                icon: Icon,
                color,
                background,
                border,
              }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => navigateTo('My Applications')}
                  className={`group relative overflow-hidden rounded-xl border border-[#e0e2ec] border-l-[4px] ${border} bg-white p-4 text-left shadow-[0_2px_4px_rgba(23,32,51,0.025)] transition hover:-translate-y-0.5 hover:shadow-md sm:p-5`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`grid h-8 w-8 place-items-center rounded-lg ${background} ${color}`}
                    >
                      <Icon size={17} />
                    </div>

                    <span className={`text-[12px] font-semibold ${color}`}>
                      {label}
                    </span>
                  </div>

                  <div className="mt-3 flex items-end justify-between">
                    <p className="text-[32px] font-bold leading-none tracking-[-1px] text-[#20283a]">
                      {loading ? '—' : value}
                    </p>

                    <ChevronRight
                      size={17}
                      className="text-[#a0a8b9] transition group-hover:translate-x-0.5 group-hover:text-[#5046e5]"
                    />
                  </div>
                </button>
              ),
            )}
          </section>

          {/* Dashboard columns */}
          <div className="mt-7 grid grid-cols-1 items-start gap-7 2xl:grid-cols-[minmax(0,1fr)_330px]">
            <div className="min-w-0 space-y-8">
              {/* Recommended jobs */}
              <section>
                <SectionTitle
                  title="Recommended for you"
                  action="View all jobs"
                  onAction={() => navigateTo('Find Jobs')}
                />

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {filteredJobs.length === 0 && (
                    <div className="rounded-xl border border-[#e0e2ec] bg-white p-6 text-[13px] text-[#78839a] lg:col-span-2">
                      {loading ? 'Loading recommended jobs…' : 'No recommended jobs match your search.'}
                    </div>
                  )}

                  {filteredJobs.map((job) => (
                    <article
                      key={job._id}
                      className="rounded-xl border border-[#dedfec] bg-white p-4 shadow-[0_2px_5px_rgba(23,32,51,0.025)] transition hover:border-[#c6c0ff] hover:shadow-md sm:p-5"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[#e4e6ef] bg-[#e7edff] text-[#4457bc]"
                        >
                          <span className="text-[19px] font-bold">
                            {job.companyName.trim().charAt(0).toUpperCase() || 'C'}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="text-[13px] font-bold leading-5 text-[#263047]">
                            {job.title}
                          </h3>

                          <p className="mt-1 text-[12px] text-[#78839a]">
                            {job.companyName}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => void toggleSavedJob(job)}
                          aria-label={
                            savedJobs.has(job._id)
                              ? 'Remove saved job'
                              : 'Save job'
                          }
                          className={`rounded-md p-1.5 transition ${
                            savedJobs.has(job._id)
                              ? 'text-[#5046e5]'
                              : 'text-[#929bb0] hover:bg-[#f1f0ff] hover:text-[#5046e5]'
                          }`}
                        >
                          <Bookmark
                            size={18}
                            fill={
                              savedJobs.has(job._id)
                                ? 'currentColor'
                                : 'none'
                            }
                          />
                        </button>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#eff1f5] px-2.5 py-1.5 text-[10px] font-medium text-[#566178]">
                          <MapPin size={12} />
                          {job.location}
                        </span>

                        <span className="rounded-md bg-[#eff1f5] px-2.5 py-1.5 text-[10px] font-medium text-[#566178]">
                          {pretty(job.workMode)} · {pretty(job.employmentType)}
                        </span>
                      </div>

                      <div className="mt-5 flex items-center justify-between gap-2 border-t border-[#e7e7f0] pt-4">
                        <span className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-[#f0eaff] to-[#f6edff] px-2.5 py-1.5 text-[10px] font-bold text-[#7940df]">
                          <Sparkles size={12} />
                          Recommended
                        </span>

                        <button
                          type="button"
                          onClick={() => navigate(`/candidate/jobs/${job._id}/apply`)}
                          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[12px] font-bold text-[#5046e5] transition hover:bg-[#f0efff]"
                        >
                          Apply
                          <ArrowUpRight size={14} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              {/* Recent applications */}
              <section>
                <SectionTitle
                  title="Recent Applications"
                  action="View all"
                  onAction={() => navigateTo('My Applications')}
                />

                <div className="overflow-hidden rounded-xl border border-[#dedfec] bg-white shadow-[0_2px_5px_rgba(23,32,51,0.025)]">
                  {recentApplications.length === 0 ? <p className="px-5 py-8 text-center text-[12px] text-[#78839a]">{loading ? 'Loading applications…' : 'Your recent applications will appear here.'}</p> : recentApplications.map((application, index) => (
                    <button
                      key={application.id}
                      type="button"
                      onClick={() => navigate(`/candidate/applications/${application.id}`)}
                      className={`flex w-full items-center gap-3.5 px-4 py-4 text-left transition hover:bg-[#fafaff] sm:px-5 ${index > 0 ? 'border-t border-[#e7e7f0]' : ''}`}
                    >
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#f0f1f5] to-[#e3e6ed] text-[#68748d]"><BriefcaseBusiness size={18}/></div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12px] font-bold text-[#263047]">{application.jobTitle || 'Job posting'}</p>
                        <p className="mt-1 truncate text-[11px] text-[#78839a]">{application.companyName || 'Company'} · Applied {dateLabel(application.submittedAt)}</p>
                      </div>
                      <span className={`hidden shrink-0 items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold sm:inline-flex ${statusStyle(application.status)}`}>{pretty(application.status)}</span>
                      <ChevronRight size={17} className="shrink-0 text-[#929bb0]"/>
                    </button>
                  ))}
                </div>
              </section>
            </div>

            {/* Upcoming interview */}
            <aside className="space-y-5">
              <section className="overflow-hidden rounded-xl border border-[#dedfec] bg-white shadow-[0_2px_5px_rgba(23,32,51,0.025)]">
                <div className="h-1.5 bg-gradient-to-r from-[#08b889] via-[#13c99b] to-[#54dfb7]" />

                <div className="p-5 sm:p-6">
                  <div className="flex items-center gap-2 text-[#08a878]">
                    <CalendarDays size={19} />
                    <span className="text-[11px] font-bold tracking-[1px]">
                      UPCOMING INTERVIEW
                    </span>
                  </div>

                  <div className="mt-5 rounded-xl border border-dashed border-[#dfe3ed] bg-[#fafbfe] px-4 py-8 text-center">
                    <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[#e6fbf3] text-[#08a878]"><CalendarDays size={20}/></span>
                    <p className="mt-3 text-[13px] font-semibold text-[#30384a]">No upcoming interviews</p>
                    <p className="mt-1 text-[11px] leading-5 text-[#8a94a9]">Scheduled interviews will appear here.</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigateTo('My Applications')}
                    className="mt-4 flex h-[42px] w-full items-center justify-center gap-2 rounded-lg border border-[#dcd9f0] bg-white text-[12px] font-semibold text-[#5046e5] transition hover:bg-[#f7f6ff]"
                  >
                    View applications
                    <ChevronRight size={15} />
                  </button>
                </div>
              </section>

              {/* Profile tip */}
              <section className="rounded-xl border border-[#dedafc] bg-gradient-to-br from-[#f4f2ff] via-white to-[#eeecff] p-5">
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#e7e3ff] text-[#5046e5]">
                    <Sparkles size={17} />
                  </div>

                  <h3 className="text-[13px] font-bold text-[#30304f]">
                    Stand out to recruiters
                  </h3>
                </div>

                <p className="mt-3 text-[12px] leading-6 text-[#727b96]">
                  Complete your profile and keep your resume up to date to
                  improve your visibility to recruiters.
                </p>

                <button
                  type="button"
                  onClick={() => navigateTo('Resume')}
                  className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-[#5046e5] hover:underline"
                >
                  Update your resume
                  <ChevronRight size={14} />
                </button>
              </section>
            </aside>
          </div>

          <Footer role="Candidate Portal" />
        </div>
      </div>
    </main>
  );
}

export default CandidateDashboard;

