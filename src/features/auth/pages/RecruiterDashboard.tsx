import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { logout } from '../../../api/auth.api';
import useAuthStore from '../../../store/auth.store';

import {
  Activity,
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckSquare,
  ChevronDown,
  ClipboardList,
  FileText,
  Filter,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  Bot,
  TrendingUp,
  UserRound,
  ChartNoAxesCombined,
} from 'lucide-react';

type NavigationItem = {
  label: string;
  icon: React.ComponentType<{
    size?: number;
    strokeWidth?: number;
  }>;
  active?: boolean;
  ai?: boolean;
};

type NavigationGroup = {
  section: string;
  items: NavigationItem[];
};

const stats = [
  {
    label: 'ACTIVE JOBS',
    value: '12',
    detail: '+2 this week',
    icon: BriefcaseBusiness,
  },
  {
    label: 'TOTAL APPLICATIONS',
    value: '148',
    detail: '+18 this month',
    icon: FileText,
  },
  {
    label: 'CANDIDATES',
    value: '326',
    detail: '+24 new',
    icon: Users,
  },
  {
    label: 'INTERVIEWS',
    value: '18',
    detail: '6 scheduled today',
    icon: CalendarDays,
  },
];

const pipeline = [
  {
    label: 'Applied',
    count: 148,
    rate: '100%',
    progress: '100%',
    note: 'Initial entries',
  },
  {
    label: 'Screening',
    count: 42,
    rate: '28.4%',
    progress: '28.4%',
    note: 'Resume review',
  },
  {
    label: 'Shortlisted',
    count: 21,
    rate: '50.0%',
    progress: '50%',
    note: 'Lead qualified',
  },
  {
    label: 'Interview',
    count: 18,
    rate: '85.7%',
    progress: '85.7%',
    note: 'In progression',
  },
  {
    label: 'Offer',
    count: 5,
    rate: '27.7%',
    progress: '27.7%',
    note: 'Offers issued',
  },
  {
    label: 'Hired',
    count: 2,
    rate: '40.0%',
    progress: '40%',
    note: 'Signed & seated',
  },
];

const jobs = [
  {
    title: 'Senior Software Engineer',
    department: 'Engineering',
    details: 'Full-time · San Francisco, CA / Remote',
    status: 'Published',
    applicants: 128,
    shortlisted: 19,
    interviews: 7,
  },
  {
    title: 'Frontend Developer',
    department: 'Product & Tech',
    details: 'Full-time · New York, NY',
    status: 'Published',
    applicants: 88,
    shortlisted: 12,
    interviews: 4,
  },
  {
    title: 'Product Designer',
    department: 'Design & UX',
    details: 'Full-time · Austin, TX',
    status: 'Draft',
    applicants: 42,
    shortlisted: 7,
    interviews: 2,
  },
];

const interviews = [
  {
    initials: 'AT',
    name: 'Alex Thompson',
    role: 'Senior Software Engineer',
    time: 'Today · 2:00 PM',
    type: 'Technical Interview',
    color: 'bg-[#087F75]',
  },
  {
    initials: 'EC',
    name: 'Emily Carter',
    role: 'Frontend Developer',
    time: 'Tomorrow · 10:30 AM',
    type: 'Technical Interview',
    color: 'bg-[#426C69]',
  },
  {
    initials: 'MR',
    name: 'Michael Reed',
    role: 'Product Designer',
    time: 'Sep 6 · 3:00 PM',
    type: 'Portfolio Review',
    color: 'bg-[#006B63]',
  },
];

const applications = [
  {
    initials: 'AT',
    name: 'Alex Thompson',
    role: 'Senior Software Engineer',
    time: 'Applied today',
    match: '96%',
    status: 'Under Review',
  },
  {
    initials: 'PS',
    name: 'Priya Sharma',
    role: 'Frontend Developer',
    time: 'Applied today',
    match: '92%',
    status: 'Screening',
  },
  {
    initials: 'MR',
    name: 'Michael Reed',
    role: 'Product Designer',
    time: 'Applied yesterday',
    match: '88%',
    status: 'Shortlisted',
  },
];

const navigation: NavigationGroup[] = [
  {
    section: 'MAIN',
    items: [
      {
        label: 'Dashboard',
        icon: LayoutDashboard,
        active: true,
      },
      {
        label: 'Manage Jobs',
        icon: BriefcaseBusiness,
      },
      {
        label: 'Applications',
        icon: ClipboardList,
      },
      {
        label: 'Candidates',
        icon: Users,
      },
      {
        label: 'Interviews',
        icon: CalendarDays,
      },
      {
        label: 'Offers',
        icon: ShieldCheck,
      },
      {
        label: 'Placements',
        icon: CheckSquare,
      },
    ],
  },
  {
    section: 'AI & INSIGHTS',
    items: [
      {
        label: 'AI Matching',
        icon: Users,
        ai: true,
      },
      {
        label: 'AI Assistant',
        icon: Bot,
        ai: true,
      },
      {
        label: 'Analytics',
        icon: ChartNoAxesCombined,
      },
    ],
  },
  {
    section: 'COMMUNICATION',
    items: [
      {
        label: 'Chats',
        icon: MessageSquare,
      },
      {
        label: 'Notifications',
        icon: Bell,
      },
    ],
  },
  {
    section: 'COMPANY',
    items: [
      {
        label: 'Company',
        icon: Building2,
      },
      {
        label: 'Profile',
        icon: UserRound,
      },
    ],
  },
];

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#5147E8] text-white shadow-sm">
        <span className="grid grid-cols-2 gap-[3px]">
          <span className="h-[7px] w-[7px] rounded-[1px] bg-white" />
          <span className="h-[7px] w-[7px] rounded-[1px] bg-white" />
          <span className="h-[7px] w-[7px] rounded-[1px] bg-white" />
          <span className="h-[7px] w-[7px] rounded-[1px] bg-white" />
        </span>
      </div>

      <div>
        <div className="flex items-center gap-1.5">
          <span className="text-[17px] font-bold tracking-tight text-[#102039]">
            R&PMS
          </span>

          <span className="rounded bg-[#BFE9E5] px-1.5 py-0.5 text-[9px] font-bold text-[#006B63]">
            ENT
          </span>
        </div>

        <p className="text-[9px] font-semibold tracking-wide text-[#687782]">
          R&PMS
        </p>
      </div>
    </div>
  );
}

function SectionHeading({
  title,
  action,
}: {
  title: string;
  action?: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-[14px] font-bold text-[#102039]">
        {title}
      </h2>

      {action && (
        <button className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#006B63] transition hover:text-[#004F49]">
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

  const [showProfileMenu, setShowProfileMenu] =
    useState(false);

  const handleLogout = async () => {
    try {
      await logout();

      logoutUser();

      navigate('/login', {
        replace: true,
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FF] text-[#102039]">
      <div className="flex min-h-screen">

        {/* Sidebar */}

        <aside className="hidden w-[245px] shrink-0 flex-col border-r border-[#E8ECF5] bg-white lg:flex">
          <div className="border-b border-[#EEF0F5] px-5 py-5">
            <Brand />
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4">
            {navigation.map((group) => (
              <div
                key={group.section}
                className="mb-5"
              >
                <p className="mb-2 px-2 text-[10px] font-bold tracking-[0.7px] text-[#84909A]">
                  {group.section}
                </p>

                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.label}
                        className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] transition ${
                          item.active
                            ? 'bg-[#BFE9E5] font-semibold text-[#006B63]'
                            : 'text-[#46545A] hover:bg-[#F0F8F7] hover:text-[#006B63]'
                        }`}
                      >
                        <Icon
                          size={17}
                          strokeWidth={1.8}
                        />

                        <span>{item.label}</span>

                        {item.ai &&
                          item.label ===
                            'AI Matching' && (
                            <span className="ml-auto rounded-full bg-[#F1E5FF] px-1.5 py-0.5 text-[9px] font-bold text-[#8B27CB]">
                              AI
                            </span>
                          )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="border-t border-[#E8ECF5] p-3">
            <button className="mb-3 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] text-[#46545A] hover:bg-[#F0F8F7]">
              <Settings size={17} />
              Settings
            </button>

            <div className="flex items-center gap-2 rounded-lg bg-[#F0F5FF] p-2">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#D8E9F7] text-[11px] font-bold text-[#006B63]">
                SJ
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-bold">
                  Sarah Johnson
                </p>

                <p className="truncate text-[10px] text-[#687782]">
                  Recruiter · TechNova
                </p>
              </div>

              <ChevronDown
                size={15}
                className="text-[#687782]"
              />
            </div>
          </div>
        </aside>

        {/* Main area */}

        <main className="min-w-0 flex-1">

          {/* Top bar */}

          <header className="sticky top-0 z-10 flex h-[60px] items-center gap-4 border-b border-[#E8ECF5] bg-white/95 px-4 backdrop-blur sm:px-6">
            <div className="min-w-0 shrink-0">
              <p className="text-[10px] text-[#7A858F]">
                Recruitment Hub / Overview
              </p>

              <p className="text-[13px] font-bold">
                Recruiter Dashboard
              </p>
            </div>

            <div className="relative mx-auto hidden max-w-[470px] flex-1 md:block">
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
                  SJ
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-[#E4EAF3] bg-white p-1.5 shadow-[0_10px_30px_rgba(16,32,57,0.12)]">

                    <button
                      type="button"
                      onClick={() =>
                        setShowProfileMenu(false)
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
          </header>

          <div className="space-y-5 p-4 sm:p-6">

            {/* Welcome and actions */}

            <section className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-[27px] font-bold tracking-tight text-[#102039] sm:text-[30px]">
                    Good morning, Sarah
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
                  Today: Oct 14, 2024
                </div>

                <button className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#BFD5D2] bg-white px-3 text-[11px] font-semibold text-[#006B63] transition hover:bg-[#F0F8F7]">
                  <Users size={15} />
                  Find Candidates
                </button>

                <button className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#006B63] px-3 text-[11px] font-semibold text-white shadow-sm transition hover:bg-[#00564F]">
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

                  Aggregate Conversion:

                  <span className="font-bold text-[#006B63]">
                    14.8%
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
                <SectionHeading
                  title="Active Jobs"
                  action="Manage Jobs"
                />

                <div className="space-y-2.5">
                  {jobs.map((job) => (
                    <div
                      key={job.title}
                      className="rounded-xl bg-[#EEF4FF] p-3.5 transition hover:bg-[#E7F0FF]"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-[12px] font-bold text-[#102039]">
                              {job.title}
                            </h3>

                            <span
                              className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                                job.status === 'Published'
                                  ? 'bg-[#BFE9E5] text-[#006B63]'
                                  : 'bg-[#DCE8FF] text-[#42617D]'
                              }`}
                            >
                              <span className="mr-1">
                                ●
                              </span>

                              {job.status}
                            </span>
                          </div>

                          <p className="mt-1.5 text-[10px] text-[#46545A]">
                            {job.department} · {job.details}
                          </p>
                        </div>

                        <button className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-[10px] font-semibold text-[#006B63] shadow-sm transition hover:bg-[#BFE9E5]">
                          View Job
                        </button>
                      </div>

                      <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-semibold text-[#6C7A7E]">
                        <span>
                          {job.applicants} applied
                        </span>

                        <span>·</span>

                        <span>
                          {job.shortlisted} shortlisted
                        </span>

                        <span>·</span>

                        <span>
                          {job.interviews} interviews
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="min-w-0 rounded-xl border border-[#EDF0F5] bg-white p-4 sm:p-5">
                <SectionHeading
                  title="Upcoming Interviews"
                  action="View All"
                />

                <div className="space-y-2.5">
                  {interviews.map((interview) => (
                    <div
                      key={interview.name}
                      className="flex items-center gap-2.5 rounded-xl bg-[#EEF4FF] p-3"
                    >
                      <div
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-[10px] font-bold text-white ${interview.color}`}
                      >
                        {interview.initials}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-bold text-[#102039]">
                          {interview.name}
                        </p>

                        <p className="truncate text-[10px] text-[#52606B]">
                          {interview.role}
                        </p>

                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <span className="text-[9px] font-semibold text-[#006B63]">
                            {interview.time}
                          </span>

                          <span className="rounded bg-[#DCE8FF] px-1.5 py-0.5 text-[9px] text-[#52606B]">
                            {interview.type}
                          </span>
                        </div>
                      </div>

                      <button className="shrink-0 rounded-md bg-white px-2 py-1.5 text-[10px] font-semibold text-[#102039] hover:bg-[#BFE9E5]">
                        Details
                      </button>
                    </div>
                  ))}
                </div>
              </article>
            </section>

            {/* Recent applications and AI insights */}

            <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_1fr]">
              <article className="min-w-0 rounded-xl border border-[#EDF0F5] bg-white p-4 sm:p-5">
                <SectionHeading
                  title="Recent Applications"
                  action="View Applications"
                />

                <div className="divide-y divide-[#E8ECF5]">
                  {applications.map((application) => (
                    <div
                      key={application.name}
                      className="flex flex-wrap items-center gap-3 py-3 first:pt-1 last:pb-1"
                    >
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#DCE8FF] text-[10px] font-bold text-[#006B63]">
                        {application.initials}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[11px] font-bold text-[#102039]">
                            {application.name}
                          </p>

                          <span className="rounded-full bg-[#BFE9E5] px-2 py-0.5 text-[9px] font-bold text-[#006B63]">
                            {application.match} match
                          </span>

                          <span className="rounded-full bg-[#DCE8FF] px-2 py-0.5 text-[9px] text-[#52606B]">
                            {application.status}
                          </span>
                        </div>

                        <p className="mt-1 text-[10px] text-[#52606B]">
                          {application.role} · {application.time}
                        </p>
                      </div>

                      <button className="shrink-0 rounded-lg bg-[#EEF4FF] px-3 py-2 text-[10px] font-semibold text-[#102039] transition hover:bg-[#BFE9E5]">
                        Review
                      </button>
                    </div>
                  ))}
                </div>
              </article>

              {/* Purple is intentionally limited to AI insights */}

              <article className="rounded-xl border border-[#F0E7FA] bg-[#FAF5FF] p-4 sm:p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[#7625B9]">
                    <Sparkles size={16} />

                    <h2 className="text-[12px] font-bold tracking-wide">
                      AI RECRUITMENT INSIGHT
                    </h2>
                  </div>

                  <span className="rounded-full bg-[#F0DFFF] px-2 py-1 text-[9px] font-bold text-[#7625B9]">
                    AI MATCH ENGINE
                  </span>
                </div>

                <div className="rounded-lg border border-[#F1E9F9] bg-white p-3.5">
                  <p className="text-[11px] leading-5 text-[#102039]">
                    “12 candidates have a profile match above 90% for your
                    Senior Software Engineer position.”
                  </p>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-white p-3">
                    <p className="text-[9px] font-bold tracking-wide text-[#8B27CB]">
                      AVG MATCH
                    </p>

                    <p className="mt-1 text-[23px] font-bold leading-none text-[#42106D]">
                      94%
                    </p>

                    <p className="mt-1.5 text-[9px] text-[#7A858F]">
                      High precision model
                    </p>
                  </div>

                  <div className="rounded-lg bg-white p-3">
                    <p className="text-[9px] font-bold tracking-wide text-[#8B27CB]">
                      HIGH MATCHES
                    </p>

                    <p className="mt-1 text-[23px] font-bold leading-none text-[#42106D]">
                      12
                    </p>

                    <p className="mt-1.5 text-[9px] text-[#7A858F]">
                      Ready for review
                    </p>
                  </div>
                </div>

                <button className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-[#8422CC] text-[11px] font-semibold text-white transition hover:bg-[#701BB0]">
                  <Sparkles size={14} />
                  View AI Matches
                  <ArrowRight size={14} />
                </button>
              </article>
            </section>

            <footer className="flex flex-wrap items-center justify-between gap-2 py-1 text-[10px] text-[#84909A]">
              <span>
                © 2026 R&PMS · Enterprise Recruitment Platform
              </span>

              <span className="flex items-center gap-1">
                <Activity
                  size={12}
                  className="text-[#006B63]"
                />

                All systems operational
              </span>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

export default RecruiterDashboard;