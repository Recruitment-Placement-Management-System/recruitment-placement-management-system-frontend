
import { useState } from 'react';
import {
  LayoutDashboard,
  UserRound,
  FileText,
  Search,
  BriefcaseBusiness,
  CalendarDays,
  Award,
  Mail,
  Bell,
  Settings,
  CircleHelp,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Bookmark,
  Video,
  Clock3,
  MapPin,
  ArrowUpRight,
  GraduationCap,
  LogOut,
  Sparkles,
} from 'lucide-react';



const navigation = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'My Profile', icon: UserRound },
  { label: 'Resume', icon: FileText },
  { label: 'Find Jobs', icon: Search },
  { label: 'My Applications', icon: BriefcaseBusiness },
  { label: 'Interviews', icon: CalendarDays },
  { label: 'Offers', icon: Award },
  { label: 'Messages', icon: Mail },
  { label: 'Notifications', icon: Bell },
];

const settingsNavigation = [
  { label: 'Settings', icon: Settings },
  { label: 'Help / Support', icon: CircleHelp },
];

const statistics = [
  {
    label: 'Applications',
    value: '6',
    icon: BriefcaseBusiness,
    color: 'text-[#59647d]',
    background: 'bg-[#eef0f5]',
    border: 'border-l-[#8993aa]',
  },
  {
    label: 'Under Review',
    value: '3',
    icon: Clock3,
    color: 'text-[#5549ed]',
    background: 'bg-[#efedff]',
    border: 'border-l-[#5549ed]',
  },
  {
    label: 'Interviews',
    value: '1',
    icon: CalendarDays,
    color: 'text-[#08a878]',
    background: 'bg-[#e6fbf3]',
    border: 'border-l-[#08b889]',
  },
  {
    label: 'Offers',
    value: '1',
    icon: Award,
    color: 'text-[#e69a20]',
    background: 'bg-[#fff5e4]',
    border: 'border-l-[#f2a22b]',
  },
];

const recommendedJobs = [
  {
    id: 'job-1',
    title: 'Senior Software Engineer',
    company: 'TechNova',
    location: 'London',
    workType: 'Full-time',
    match: 94,
    logo: 'T',
    logoColor: 'bg-[#e7edff] text-[#4457bc]',
  },
  {
    id: 'job-2',
    title: 'Product Designer',
    company: 'CloudScale',
    location: 'Remote',
    workType: 'Contract',
    match: 88,
    logo: 'C',
    logoColor: 'bg-[#e1faf3] text-[#07866c]',
  },
];

const recentApplications = [
  {
    id: 'application-1',
    title: 'Lead Frontend Developer',
    company: 'Astra',
    applied: 'Applied 2 days ago',
    status: 'Under Review',
    icon: BriefcaseBusiness,
    statusStyle: 'border-[#d7d1ff] bg-[#f1efff] text-[#5549ed]',
  },
  {
    id: 'application-2',
    title: 'UX Researcher',
    company: 'FinFlow',
    applied: 'Applied 5 days ago',
    status: 'Applied',
    icon: GraduationCap,
    statusStyle: 'border-[#d9deea] bg-[#eff1f5] text-[#64708a]',
  },
];

function BrandLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 grid-cols-2 gap-[4px] rounded-[9px] bg-[#5147e8] p-[8px] shadow-[0_4px_12px_rgba(81,71,232,0.25)]">
        <span className="rounded-[2px] bg-white" />
        <span className="rounded-[2px] bg-white/75" />
        <span className="rounded-[2px] bg-white/75" />
        <span className="rounded-[2px] bg-white" />
      </div>

      <div>
        <p className="text-[21px] font-bold tracking-[-0.7px] text-[#172033]">
          R&PMS
        </p>
        <p className="mt-1 text-[9px] font-semibold tracking-[1.5px] text-[#7c879e]">
          CANDIDATE PORTAL
        </p>
      </div>
    </div>
  );
}

function Sidebar({
  activePage,
  onNavigate,
  open,
  onClose,
}: {
  activePage: string;
  onNavigate: (page: string) => void;
  open: boolean;
  onClose: () => void;
}) {
  const renderNavigation = (
    items: typeof navigation,
  ) =>
    items.map(({ label, icon: Icon }) => {
      const active = activePage === label;

      return (
        <button
          key={label}
          type="button"
          onClick={() => {
            onNavigate(label);
            onClose();
          }}
          className={`group flex w-full items-center gap-3 rounded-lg px-3.5 py-3 text-left text-[13px] font-semibold transition ${
            active
              ? 'bg-gradient-to-r from-[#eeecff] to-[#e8e6ff] text-[#5046e5] shadow-sm shadow-[#5046e5]/[0.04]'
              : 'text-[#586178] hover:bg-[#f1f2f8] hover:text-[#5046e5]'
          }`}
        >
          <Icon
            size={19}
            strokeWidth={active ? 2.2 : 1.8}
            className={
              active
                ? 'text-[#5046e5]'
                : 'text-[#929cb0] transition group-hover:text-[#5046e5]'
            }
          />
          <span>{label}</span>

          {label === 'Notifications' && (
            <span className="ml-auto h-2 w-2 rounded-full bg-[#ee596a]" />
          )}
        </button>
      );
    });

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-[#0d1528]/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[250px] flex-col border-r border-[#e5e7f0] bg-[#fbfaff] transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-[84px] shrink-0 items-center justify-between border-b border-[#edeef5] px-5">
          <BrandLogo />

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="rounded-lg p-2 text-[#7c879e] hover:bg-[#f0efff] lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3.5 py-5">
          <div className="space-y-1">{renderNavigation(navigation)}</div>

          <div className="my-5 border-t border-[#e7e8f0]" />

          <div className="space-y-1">
            {renderNavigation(settingsNavigation)}
          </div>
        </nav>

        <div className="border-t border-[#e9eaf2] p-3.5">
          <button
            type="button"
            onClick={() => onNavigate('My Profile')}
            className="flex w-full items-center gap-3 rounded-xl bg-gradient-to-r from-[#f0efff] to-[#f5f5fc] p-3 text-left transition hover:from-[#e9e6ff] hover:to-[#efedff]"
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#6155f3] to-[#3e35c8] text-[13px] font-bold text-white">
              AC
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-bold text-[#202a40]">
                Alex Candidate
              </p>
              <p className="mt-0.5 text-[11px] text-[#78839a]">
                Candidate account
              </p>
            </div>

            <ChevronDown size={15} className="shrink-0 text-[#7b849b]" />
          </button>
        </div>
      </aside>
    </>
  );
}

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
  const [activePage, setActivePage] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notice, setNotice] = useState('');

  const filteredJobs = recommendedJobs.filter((job) => {
    const query = search.toLowerCase().trim();

    return (
      !query ||
      job.title.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query) ||
      job.location.toLowerCase().includes(query)
    );
  });

  const navigateTo = (page: string) => {
    setActivePage(page);

    if (page !== 'Dashboard') {
      setNotice(
        `${page} page navigation will be connected when the route is implemented.`,
      );
    } else {
      setNotice('');
    }
  };

  const toggleSavedJob = (jobId: string) => {
    setSavedJobs((current) =>
      current.includes(jobId)
        ? current.filter((id) => id !== jobId)
        : [...current, jobId],
    );

    const job = recommendedJobs.find((item) => item.id === jobId);

    setNotice(
      savedJobs.includes(jobId)
        ? `${job?.title ?? 'Job'} removed from saved jobs.`
        : `${job?.title ?? 'Job'} added to saved jobs.`,
    );
  };

  const handleApply = (jobTitle: string) => {
    setNotice(
      `The application flow for ${jobTitle} will be connected to the backend.`,
    );
  };

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-[#172033]">
      <Sidebar
        activePage={activePage}
        onNavigate={navigateTo}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="min-h-screen lg:pl-[250px]">
        {/* Top navigation */}
        <header className="sticky top-0 z-30 flex h-[76px] items-center gap-3 border-b border-[#e7e9f1] bg-white/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <button
            type="button"
            aria-label="Open navigation"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-[#66718a] hover:bg-[#f0efff] lg:hidden"
          >
            <Menu size={21} />
          </button>

          <h1 className="hidden shrink-0 text-[20px] font-bold tracking-[-0.5px] text-[#20283a] sm:block">
            {activePage}
          </h1>

          <div className="relative ml-0 w-full max-w-[430px] sm:ml-5">
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
                AC
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
                    onClick={() =>
                      setNotice('Logout will be connected to the authentication API.')
                    }
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[12px] text-[#c44759] hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

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
                onClick={() => setNotice('')}
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
                  Good morning, Alex.
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
                      strokeDasharray={`${2 * Math.PI * 24 * 0.82} ${2 * Math.PI * 24}`}
                    />
                  </svg>
                  <span className="text-[13px] font-bold text-[#263047]">
                    82%
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
          <section className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
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
                  onClick={() =>
                    navigateTo(
                      label === 'Applications' || label === 'Under Review'
                        ? 'My Applications'
                        : label,
                    )
                  }
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
                      {value}
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
                      No recommended jobs match your search.
                    </div>
                  )}

                  {filteredJobs.map((job) => (
                    <article
                      key={job.id}
                      className="rounded-xl border border-[#dedfec] bg-white p-4 shadow-[0_2px_5px_rgba(23,32,51,0.025)] transition hover:border-[#c6c0ff] hover:shadow-md sm:p-5"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[#e4e6ef] ${job.logoColor}`}
                        >
                          <span className="text-[19px] font-bold">
                            {job.logo}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="text-[13px] font-bold leading-5 text-[#263047]">
                            {job.title}
                          </h3>
                          <p className="mt-1 text-[12px] text-[#78839a]">
                            {job.company}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleSavedJob(job.id)}
                          aria-label={
                            savedJobs.includes(job.id)
                              ? 'Remove saved job'
                              : 'Save job'
                          }
                          className={`rounded-md p-1.5 transition ${
                            savedJobs.includes(job.id)
                              ? 'text-[#5046e5]'
                              : 'text-[#929bb0] hover:bg-[#f1f0ff] hover:text-[#5046e5]'
                          }`}
                        >
                          <Bookmark
                            size={18}
                            fill={
                              savedJobs.includes(job.id)
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
                          {job.workType}
                        </span>
                      </div>

                      <div className="mt-5 flex items-center justify-between gap-2 border-t border-[#e7e7f0] pt-4">
                        <span className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-[#f0eaff] to-[#f6edff] px-2.5 py-1.5 text-[10px] font-bold text-[#7940df]">
                          <Sparkles size={12} />
                          {job.match}% match
                        </span>

                        <button
                          type="button"
                          onClick={() => handleApply(job.title)}
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
                  {recentApplications.map(
                    ({
                      id,
                      title,
                      company,
                      applied,
                      status,
                      icon: Icon,
                      statusStyle,
                    }, index) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => navigateTo('My Applications')}
                        className={`flex w-full items-center gap-3.5 px-4 py-4 text-left transition hover:bg-[#fafaff] sm:px-5 ${
                          index > 0 ? 'border-t border-[#e7e7f0]' : ''
                        }`}
                      >
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#f0f1f5] to-[#e3e6ed] text-[#68748d]">
                          <Icon size={18} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[12px] font-bold text-[#263047]">
                            {title}
                          </p>
                          <p className="mt-1 truncate text-[11px] text-[#78839a]">
                            {company} · {applied}
                          </p>
                        </div>

                        <span
                          className={`hidden shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold sm:inline-flex ${statusStyle}`}
                        >
                          {status === 'Under Review' && (
                            <span className="h-1.5 w-1.5 rounded-full bg-[#5549ed]" />
                          )}
                          {status}
                        </span>

                        <ChevronRight
                          size={17}
                          className="shrink-0 text-[#929bb0]"
                        />
                      </button>
                    ),
                  )}
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

                  <h2 className="mt-5 text-[26px] font-bold tracking-[-0.8px] text-[#20283a]">
                    Tomorrow
                  </h2>

                  <p className="mt-1 text-[20px] font-semibold text-[#5c6680]">
                    10:30 AM
                  </p>

                  <p className="mt-1 text-[11px] text-[#8a94a9]">
                    Confirm the time zone in your interview invitation.
                  </p>

                  <div className="mt-5 rounded-xl border border-[#dfe3ed] bg-gradient-to-br from-[#f6f7fa] to-[#eef0f5] p-4">
                    <p className="text-[12px] font-bold leading-5 text-[#30384a]">
                      Technical Interview with TechNova
                    </p>

                    <p className="mt-2 flex items-center gap-2 text-[11px] text-[#67738c]">
                      <BriefcaseBusiness size={14} />
                      Software Engineer role
                    </p>

                    <p className="mt-2 flex items-center gap-2 text-[11px] text-[#67738c]">
                      <Clock3 size={14} />
                      Duration: 45 minutes
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setNotice(
                        'The interview joining link will be available once connected to your interview details API.',
                      )
                    }
                    className="mt-4 flex h-[42px] w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#5549ed] to-[#493de0] text-[12px] font-semibold text-white shadow-[0_4px_12px_rgba(80,70,229,0.18)] transition hover:from-[#4b40dc] hover:to-[#3f34cd] focus:outline-none focus:ring-4 focus:ring-[#5046e5]/20"
                  >
                    <Video size={17} />
                    View interview details
                    <ChevronRight size={15} />
                  </button>

                  <p className="mt-3 text-center text-[10px] leading-5 text-[#8992a6]">
                    Check your interview details before joining.
                  </p>
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

          <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[#e5e7f0] py-5 text-[10px] text-[#8992a6]">
            <p>© 2026 R&PMS · Recruitment & Placement Management System</p>
            <p>Candidate Portal</p>
          </footer>
        </div>
      </div>
    </main>
  );
}

export default CandidateDashboard;
