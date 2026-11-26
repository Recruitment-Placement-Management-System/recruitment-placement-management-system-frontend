import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { isAxiosError } from "axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Bell,
  Bookmark,
  BriefcaseBusiness,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  LogOut,
  Mail,
  MapPin,
  Search,
  Share2,
  Settings,
  UserRound,
  X,
} from "lucide-react";
import { logout } from "../../../api/auth.api";
import {
  candidateJobsApi,
  type CandidateJob,
  type CandidateJobSearch,
} from "../../../api/candidate-jobs.api";
import type {
  JobEmploymentType,
  JobExperienceLevel,
  JobWorkMode,
} from "../../../api/recruiter-jobs.api";
import { CandidateSidebar } from "../components/CandidateSidebar";
import { Navbar } from "../../../components/common/Navbar";
import useAuthStore from "../../../store/auth.store";

const employmentTypes: [JobEmploymentType, string][] = [
  ["full_time", "Full-time"],
  ["part_time", "Part-time"],
  ["contract", "Contract"],
  ["internship", "Internship"],
  ["temporary", "Temporary"],
  ["freelance", "Freelance"],
];
const workModes: [JobWorkMode, string][] = [
  ["remote", "Remote"],
  ["hybrid", "Hybrid"],
  ["onsite", "On-site"],
];
const experienceLevels: [JobExperienceLevel, string][] = [
  ["internship", "Internship"],
  ["entry", "Entry"],
  ["junior", "Junior"],
  ["mid", "Mid-level"],
  ["senior", "Senior"],
  ["lead", "Lead"],
  ["executive", "Executive"],
];
const selectClass =
  "rounded-full border border-[#c9c8dc] bg-white px-4 py-2.5 text-xs font-semibold text-[#424657] outline-none transition hover:border-[#5046e5] focus:ring-2 focus:ring-[#5046e5]/15";
function errorMessage(error: unknown, fallback: string) {
  return isAxiosError<{ message?: string }>(error)
    ? error.response?.data?.message || fallback
    : fallback;
}
function pretty(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
function posted(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently posted";
  const days = Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / 86400000),
  );
  return days === 0
    ? "Posted today"
    : days === 1
      ? "Posted yesterday"
      : `Posted ${days} days ago`;
}
function salary(job: CandidateJob) {
  const range = job.salaryRange;
  if (!range) return "Salary not specified";
  const format = (amount: number | null) =>
    amount === null
      ? ""
      : new Intl.NumberFormat(undefined, {
          style: "currency",
          currency: range.currency,
          maximumFractionDigits: 0,
        }).format(amount);
  const min = format(range.minimum);
  const max = format(range.maximum);
  return min && max ? `${min} – ${max}` : min || max;
}
function CompanyMark({
  name,
  large = false,
}: {
  name: string;
  large?: boolean;
}) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-xl border border-[#e4e5ef] bg-gradient-to-br from-white to-[#eef0fa] font-bold text-[#5046e5] ${large ? "h-16 w-16 text-xl" : "h-12 w-12 text-base"}`}
      aria-label={`${name} logo`}
    >
      {name.trim().charAt(0).toUpperCase() || <Building2 size={20} />}
    </span>
  );
}

export default function CandidateJobsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { jobId } = useParams<{ jobId: string }>();
  const savedJobsPage = location.pathname === "/candidate/jobs/saved";
  const email = useAuthStore((state) => state.user?.email);
  const logoutUser = useAuthStore((state) => state.logout);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [jobs, setJobs] = useState<CandidateJob[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [filters, setFilters] = useState<CandidateJobSearch>({
    page: 1,
    limit: 10,
    sortBy: "latest",
  });
  const [selected, setSelected] = useState<CandidateJob | null>(null);
  const [related, setRelated] = useState<CandidateJob[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (savedJobsPage) {
        const saved = await candidateJobsApi.saved();
        const query = filters.q?.toLocaleLowerCase();
        const locationQuery = filters.location?.toLocaleLowerCase();
        const filtered = saved.map(({ job }) => job).filter((job) =>
          (!query || `${job.title} ${job.companyName} ${job.skills.join(" ")}`.toLocaleLowerCase().includes(query)) &&
          (!locationQuery || job.location.toLocaleLowerCase().includes(locationQuery)) &&
          (!filters.employmentType || job.employmentType === filters.employmentType) &&
          (!filters.workMode || job.workMode === filters.workMode) &&
          (!filters.experienceLevel || job.experienceLevel === filters.experienceLevel),
        );
        if (filters.sortBy === "salary_low_to_high" || filters.sortBy === "salary_high_to_low") {
          const direction = filters.sortBy === "salary_low_to_high" ? 1 : -1;
          filtered.sort((a, b) => direction * ((a.salaryRange?.minimum ?? Number.MAX_SAFE_INTEGER) - (b.salaryRange?.minimum ?? Number.MAX_SAFE_INTEGER)));
        } else if (filters.sortBy === "deadline") {
          filtered.sort((a, b) => (a.applicationDeadline || "9999").localeCompare(b.applicationDeadline || "9999"));
        } else {
          filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        }
        setTotal(filtered.length);
        setPages(Math.max(1, Math.ceil(filtered.length / 10)));
        setJobs(filtered.slice((page - 1) * 10, page * 10));
      } else {
        const response = await candidateJobsApi.browse({ ...filters, page });
        setJobs(response.jobs);
        setTotal(response.pagination.total);
        setPages(Math.max(response.pagination.pages, 1));
      }
    } catch (cause) {
      setError(errorMessage(cause, "We couldn’t load jobs right now."));
    } finally {
      setLoading(false);
    }
  }, [filters, page, savedJobsPage]);
  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) return loadJobs();
      return undefined;
    });
    return () => {
      active = false;
    };
  }, [loadJobs]);
  useEffect(() => {
    let active = true;
    void candidateJobsApi
      .saved()
      .then((saved) => {
        if (active) setSavedIds(new Set(saved.map(({ job }) => job._id)));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    let active = true;
    void Promise.resolve().then(async () => {
      if (!active) return;
      if (!jobId) {
        setSelected(null);
        setRelated([]);
        setDetailLoading(false);
        return;
      }
      setDetailLoading(true);
      try {
        const job = await candidateJobsApi.details(jobId);
        if (!active) return;
        setSelected(job);
        try {
          const relatedJobs = await candidateJobsApi.related(jobId);
          if (active)
            setRelated(relatedJobs.filter((item) => item._id !== jobId));
        } catch {
          if (active) setRelated([]);
        }
      } catch (cause) {
        if (active) {
          setSelected(null);
          setError(
            errorMessage(
              cause,
              "Could not load this job. It may no longer be available.",
            ),
          );
        }
      } finally {
        if (active) setDetailLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [jobId]);
  useEffect(() => {
    if (jobId || loading || !jobs.length || selected) return;
    let active = true;
    void Promise.resolve().then(() => {
      if (active && jobs[0]) {
        setSelected(jobs[0]);
        if (!savedJobsPage) {
          navigate(`/candidate/jobs/${jobs[0]._id}`, { replace: true });
        }
      }
    });
    return () => { active = false; };
  }, [jobId, jobs, loading, navigate, savedJobsPage, selected]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setFilters((current) => ({
      ...current,
      q: searchInput.trim() || undefined,
      location: locationInput.trim() || undefined,
      page: 1,
    }));
  };
  const updateFilter = <K extends keyof CandidateJobSearch>(
    key: K,
    value: CandidateJobSearch[K] | undefined,
  ) => {
    setPage(1);
    setFilters((current) => ({
      ...current,
      [key]: value || undefined,
      page: 1,
    }));
  };
  const resetFilters = () => {
    setSearchInput("");
    setLocationInput("");
    setPage(1);
    setFilters({ page: 1, limit: 10, sortBy: "latest" });
  };
  const selectJob = (job: CandidateJob) => {
    setError("");
    setSelected(job);
    if (savedJobsPage) {
      void candidateJobsApi.related(job._id)
        .then((items) => setRelated(items.filter((item) => item._id !== job._id)))
        .catch(() => setRelated([]));
    } else {
      navigate(`/candidate/jobs/${job._id}`);
    }
  };
  const toggleSave = async (job: CandidateJob) => {
    const isSaved = savedIds.has(job._id);
    setSavingId(job._id);
    try {
      if (isSaved) {
        await candidateJobsApi.unsave(job._id);
        setSavedIds((current) => {
          const next = new Set(current);
          next.delete(job._id);
          return next;
        });
        setToast("Job removed from saved jobs.");
      } else {
        await candidateJobsApi.save(job._id);
        setSavedIds((current) => new Set(current).add(job._id));
        setToast("Job saved for later.");
      }
    } catch (cause) {
      setError(errorMessage(cause, "Could not update saved jobs."));
    } finally {
      setSavingId("");
    }
  };
  const shareJob = async (job: CandidateJob) => {
    const url = `${window.location.origin}/candidate/jobs/${job._id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: job.title,
          text: `${job.title} at ${job.companyName}`,
          url,
        });
        setToast("Job link shared.");
      } else {
        await navigator.clipboard.writeText(url);
        setToast("Job link copied to clipboard.");
      }
    } catch (cause) {
      if (cause instanceof Error && cause.name !== "AbortError")
        setError("Could not share this job link.");
    }
  };
  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      /* Sign out locally even if the session request fails. */
    } finally {
      logoutUser();
      navigate("/login", { replace: true });
    }
  };
  const initials = (email || "CA").slice(0, 2).toUpperCase();
  const selectedIsSaved = selected ? savedIds.has(selected._id) : false;
  const activeFilters = useMemo(
    () =>
      Boolean(
        filters.q ||
        filters.location ||
        filters.sortBy !== "latest" ||
        filters.employmentType ||
        filters.workMode ||
        filters.experienceLevel ||
        filters.skill,
      ),
    [filters],
  );

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-[#20283a]">
      <CandidateSidebar
        activePage={savedJobsPage ? "Saved Jobs" : "Find Jobs"}
        onNavigate={(target) => {
          if (target === "Dashboard") navigate("/candidate/dashboard");
          else if (target === "My Profile") navigate("/candidate/profile");
          else if (target === "Resume") navigate("/candidate/resume");
          else if (target === "Find Jobs") navigate("/candidate/jobs");
          else if (target === "Saved Jobs") navigate("/candidate/jobs/saved");
        }}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        profile={{
          name: email || "Candidate",
          description: "Candidate profile",
          initials,
        }}
        onProfileClick={() => navigate("/candidate/profile")}
      />
      <main className="min-h-screen min-w-0 lg:ml-[250px]">
        <Navbar
          title={savedJobsPage ? "Saved Jobs" : "Find Jobs"}
          onMenuClick={() => setSidebarOpen(true)}
        >
          <div className="relative min-w-0 w-full max-w-[430px]">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8792a9]"
            />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  setFilters((current) => ({
                    ...current,
                    q: searchInput.trim() || undefined,
                  }));
                  setPage(1);
                }
              }}
              placeholder="Search jobs, companies, or skills..."
              className="h-[43px] w-full rounded-lg border border-[#dce1ed] bg-white pl-10 pr-4 text-[13px] text-[#26344c] outline-none transition placeholder:text-[#929cb0] focus:border-[#5046e5] focus:ring-4 focus:ring-[#5046e5]/[0.08]"
            />
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-3">
            <button type="button" aria-label="Notifications" onClick={() => { setNotificationsOpen((value) => !value); setProfileMenuOpen(false); }} className="relative grid h-10 w-10 place-items-center rounded-lg text-[#66718a] transition hover:bg-[#f1f0ff] hover:text-[#5046e5]"><Bell size={20}/><span className="absolute right-2.5 top-2 h-2 w-2 rounded-full border-2 border-white bg-[#f05269]"/></button>
            <button type="button" aria-label="Messages" onClick={() => navigate("/candidate/dashboard")} className="grid h-10 w-10 place-items-center rounded-lg text-[#66718a] transition hover:bg-[#f1f0ff] hover:text-[#5046e5]"><Mail size={20}/></button>
            <div className="relative">
              <button
                type="button"
                onClick={() => { setProfileMenuOpen((value) => !value); setNotificationsOpen(false); }}
                className="ml-1 grid h-10 w-10 place-items-center rounded-full border-2 border-[#e5e2ff] bg-gradient-to-br from-[#6155f3] to-[#3930b9] text-[12px] font-bold text-white transition hover:ring-4 hover:ring-[#5046e5]/10"
                aria-expanded={profileMenuOpen}
                aria-label="Open account menu"
              >
                {initials}
              </button>
              {profileMenuOpen && (
                <div className="absolute right-0 top-12 z-[70] w-48 rounded-xl border border-[#e4e6ef] bg-white p-2 shadow-xl">
                  <button
                    type="button"
                    onClick={() => navigate("/candidate/profile")}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[12px] text-[#59647d] hover:bg-[#f3f2ff]"
                  >
                    <UserRound size={16}/>My Profile
                  </button>
                  <button type="button" onClick={() => navigate("/candidate/jobs/saved")} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[12px] text-[#59647d] hover:bg-[#f3f2ff]"><Bookmark size={16}/>Saved Jobs</button>
                  <button type="button" onClick={() => navigate("/candidate/profile")} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[12px] text-[#59647d] hover:bg-[#f3f2ff]"><Settings size={16}/>Settings</button>
                  <div className="my-1 border-t border-[#eceef4]" />
                  <button
                    type="button"
                    onClick={() => void handleLogout()}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[12px] text-[#c44759] hover:bg-red-50"
                  >
                    <LogOut size={16}/>Sign out
                  </button>
                </div>
              )}
            </div>
            {notificationsOpen && <div className="absolute right-20 top-[62px] z-[70] w-[270px] rounded-xl border border-[#e4e6ef] bg-white p-4 shadow-xl"><p className="text-[13px] font-bold text-[#20283a]">Notifications</p><p className="mt-2 text-[12px] leading-5 text-[#78839a]">Your application and interview updates will appear here.</p></div>}
          </div>
        </Navbar>
        <div className="space-y-4 p-4 sm:p-5 lg:p-6">
          <section>
            <p className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#7a849a]">
              {savedJobsPage ? "Your bookmarked opportunities" : "Your next opportunity"}
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#20283a] sm:text-3xl">
              {savedJobsPage ? "Saved Jobs" : "Find Jobs"}
            </h1>
            <p className="mt-1.5 text-sm text-[#59647d]">
              {savedJobsPage ? "Pick up where you left off and explore your saved openings." : "Discover roles that fit your skills, experience, and goals."}
            </p>
          </section>
          <form
            onSubmit={submitSearch}
            className="grid gap-1.5 rounded-2xl border border-[#c9c8dc] bg-white p-1.5 shadow-sm md:grid-cols-[1.2fr_1fr_auto]"
          >
            <label className="relative flex items-center">
              <Search size={19} className="absolute left-3 text-[#59647d]" />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search jobs, skills, or companies…"
                className="h-10 w-full rounded-xl bg-transparent pl-10 pr-4 text-sm outline-none placeholder:text-[#7d7e91]"
                aria-label="Search jobs, skills, or companies"
              />
            </label>
            <label className="relative flex items-center border-t border-[#e5e4ef] md:border-l md:border-t-0">
              <MapPin size={19} className="absolute left-3 text-[#59647d]" />
              <input
                value={locationInput}
                onChange={(event) => setLocationInput(event.target.value)}
                placeholder="City, state, or remote"
                className="h-10 w-full rounded-xl bg-transparent pl-10 pr-4 text-sm outline-none placeholder:text-[#7d7e91]"
                aria-label="Location"
              />
            </label>
            <button className="h-10 rounded-xl bg-[#4133d3] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#3326bd]">
              Search Jobs
            </button>
          </form>
          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Filter by job type"
              value={filters.employmentType || ""}
              onChange={(event) =>
                updateFilter(
                  "employmentType",
                  event.target.value
                    ? (event.target.value as JobEmploymentType)
                    : undefined,
                )
              }
              className={selectClass}
            >
              <option value="">Job Type</option>
              {employmentTypes.map(([value, text]) => (
                <option key={value} value={value}>
                  {text}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter by work mode"
              value={filters.workMode || ""}
              onChange={(event) =>
                updateFilter(
                  "workMode",
                  event.target.value
                    ? (event.target.value as JobWorkMode)
                    : undefined,
                )
              }
              className={selectClass}
            >
              <option value="">Work Mode</option>
              {workModes.map(([value, text]) => (
                <option key={value} value={value}>
                  {text}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter by experience"
              value={filters.experienceLevel || ""}
              onChange={(event) =>
                updateFilter(
                  "experienceLevel",
                  event.target.value
                    ? (event.target.value as JobExperienceLevel)
                    : undefined,
                )
              }
              className={selectClass}
            >
              <option value="">Experience</option>
              {experienceLevels.map(([value, text]) => (
                <option key={value} value={value}>
                  {text}
                </option>
              ))}
            </select>
            <select
              aria-label="Sort job listings"
              value={filters.sortBy || "latest"}
              onChange={(event) =>
                updateFilter(
                  "sortBy",
                  event.target.value as CandidateJobSearch["sortBy"],
                )
              }
              className={selectClass}
            >
              <option value="latest">Sort: Latest</option>
              <option value="deadline">Sort: Deadline</option>
              <option value="salary_low_to_high">Salary: Low to high</option>
              <option value="salary_high_to_low">Salary: High to low</option>
            </select>
            {activeFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-full px-3 py-2 text-xs font-semibold text-[#5046e5] hover:bg-[#efedff]"
              >
                Clear filters
              </button>
            )}
          </div>
          {error && (
            <div
              role="alert"
              className="flex items-center justify-between gap-3 rounded-xl border border-[#f1d1d7] bg-white px-4 py-3 text-sm text-[#ad3a51]"
            >
              <span>{error}</span>
              <button
                type="button"
                onClick={() => setError("")}
                aria-label="Dismiss error"
              >
                <X size={16} />
              </button>
            </div>
          )}
          <div className="grid items-start gap-5 xl:grid-cols-[minmax(360px,.85fr)_minmax(0,1.25fr)]">
            <section className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
                <p className="text-sm font-semibold text-[#424657]">
                  {loading
                    ? "Finding jobs…"
                    : `${total} ${total === 1 ? "job" : "jobs"} found`}
                </p>
                <span className="text-xs text-[#5046e5]">
                  {filters.sortBy === "latest"
                    ? "Sorted by latest"
                    : `Sorted by ${filters.sortBy?.replaceAll("_", " ")}`}
                </span>
              </div>
              {loading ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((item) => (
                    <div
                      key={item}
                      className="h-32 animate-pulse rounded-2xl border border-[#e4e3ef] bg-white"
                    />
                  ))}
                </div>
              ) : jobs.length ? (
                <div className="space-y-3">
                  {jobs.map((job) => (
                    <button
                      key={job._id}
                      type="button"
                      onClick={() => selectJob(job)}
                      className={`w-full rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5 ${selected?._id === job._id ? "border-2 border-[#4133d3]" : "border-[#c9c8dc]"}`}
                    >
                      <div className="flex items-start gap-3">
                        <CompanyMark name={job.companyName} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h2 className="truncate text-base font-bold text-[#20283a] sm:text-lg">
                                {job.title}
                              </h2>
                              <p className="mt-1 truncate text-sm text-[#424657]">
                                {job.companyName}
                              </p>
                            </div>
                            <span className="hidden shrink-0 rounded-full bg-[#f0e8ff] px-2.5 py-1 text-[10px] font-bold text-[#7b35df] sm:block">
                              {pretty(job.experienceLevel)}
                            </span>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-[#59647d]">
                            <span className="inline-flex items-center gap-1">
                              <MapPin size={13} />
                              {job.location}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <BriefcaseBusiness size={13} />
                              {pretty(job.workMode)}
                            </span>
                            <span>{pretty(job.employmentType)}</span>
                          </div>
                          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-[#424657]">
                              {salary(job)}
                            </span>
                            <span className="text-[10px] text-[#85899a]">
                              {posted(job.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-[#c9c8dc] bg-white px-5 py-12 text-center">
                  <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-[#efedff] text-[#5046e5]">
                    <Search size={21} />
                  </span>
                  <h2 className="mt-4 text-sm font-bold text-[#20283a]">
                    No matching jobs
                  </h2>
                  <p className="mt-1 text-xs text-[#7a849a]">
                    Try a different search or clear some filters.
                  </p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-4 text-xs font-bold text-[#5046e5] hover:underline"
                  >
                    Clear search and filters
                  </button>
                </div>
              )}
              <div className="mt-4 flex items-center justify-between rounded-xl bg-white px-4 py-3">
                <p className="text-[11px] text-[#7a849a]">
                  Page {page} of {pages}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1 || loading}
                    onClick={() => setPage((value) => value - 1)}
                    aria-label="Previous jobs"
                    className="grid h-8 w-8 place-items-center rounded-lg border border-[#deddea] text-[#59647d] disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    disabled={page >= pages || loading}
                    onClick={() => setPage((value) => value + 1)}
                    aria-label="Next jobs"
                    className="grid h-8 w-8 place-items-center rounded-lg border border-[#deddea] text-[#59647d] disabled:opacity-40"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </section>
            <section className="min-w-0 xl:sticky xl:top-[88px]">
              {detailLoading ? (
                <div className="h-[calc(100dvh-108px)] min-h-[420px] animate-pulse rounded-2xl border border-[#c9c8dc] bg-white" />
              ) : selected ? (
                <JobDetails
                  job={selected}
                  related={related}
                  saved={selectedIsSaved}
                  saving={savingId === selected._id}
                  onSave={() => void toggleSave(selected)}
                  onShare={() => void shareJob(selected)}
                  onSelectRelated={selectJob}
                  onClose={() => navigate("/candidate/jobs")}
                />
              ) : (
                <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#c9c8dc] bg-white px-6 text-center">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#efedff] text-[#5046e5]">
                    <BriefcaseBusiness size={22} />
                  </span>
                  <h2 className="mt-4 text-base font-bold text-[#20283a]">
                    Select a job to see details
                  </h2>
                  <p className="mt-1 max-w-xs text-sm leading-6 text-[#7a849a]">
                    Choose a role from the list to see what the position
                    involves and save it for later.
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
      {toast && (
        <div
          role="status"
          className="fixed right-5 top-24 z-[80] flex items-center gap-2 rounded-xl border border-[#d8d4ff] bg-white px-4 py-3 text-sm font-semibold text-[#5046e5] shadow-lg"
        >
          <Check size={16} />
          {toast}
        </div>
      )}
    </div>
  );
}

function JobDetails({
  job,
  related,
  saved,
  saving,
  onSave,
  onShare,
  onSelectRelated,
  onClose,
}: {
  job: CandidateJob;
  related: CandidateJob[];
  saved: boolean;
  saving: boolean;
  onSave: () => void;
  onShare: () => void;
  onSelectRelated: (job: CandidateJob) => void;
  onClose: () => void;
}) {
  return (
    <div className="flex max-h-[calc(100dvh-120px)] min-h-[420px] flex-col overflow-hidden rounded-2xl border border-[#c9c8dc] bg-white shadow-sm xl:h-[calc(100dvh-100px)] xl:max-h-none">
      <div className="border-b border-[#deddea] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex min-w-0 flex-1 items-start gap-4">
            <CompanyMark name={job.companyName} large />
            <div className="min-w-0">
              <h2 className="text-xl font-bold leading-tight text-[#20283a] sm:text-2xl">
                {job.title}
              </h2>
              <p className="mt-2 text-sm">
                <span className="font-bold text-[#4133d3]">
                  {job.companyName}
                </span>
                <span className="mx-2 text-[#c2c1d1]">•</span>
                <span className="text-[#59647d]">{job.location}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="self-end text-xs font-semibold text-[#5046e5] hover:underline sm:hidden"
          >
            Back to jobs
          </button>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onShare}
            className="inline-flex items-center gap-2 rounded-lg border border-[#c9c8dc] px-3 py-2 text-xs font-semibold text-[#59647d] hover:bg-[#f7f7fb]"
          >
            <Share2 size={15} />
            Share
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={onSave}
            className="inline-flex items-center gap-2 rounded-lg border border-[#c9c8dc] px-3 py-2 text-xs font-semibold text-[#59647d] hover:bg-[#f7f7fb] disabled:opacity-60"
          >
            <Bookmark size={15} fill={saved ? "currentColor" : "none"} />
            {saved ? "Saved" : "Save Job"}
          </button>
        </div>
        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#59647d]">
          <span className="inline-flex items-center gap-1.5">
            <BriefcaseBusiness size={14} />
            {pretty(job.workMode)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock3 size={14} />
            {pretty(job.employmentType)}
          </span>
          <span className="font-semibold text-[#424657]">{salary(job)}</span>
          <span className="inline-flex items-center gap-1.5">
            <Clock3 size={14} />
            {posted(job.createdAt)}
          </span>
        </div>
      </div>
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-5">
        <div>
          <h3 className="border-b border-[#deddea] pb-3 text-lg font-bold text-[#20283a]">
            About the role
          </h3>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#424657]">
            {job.description}
          </p>
        </div>
        <DetailList title="Responsibilities" items={job.responsibilities} />
        <DetailList title="Requirements" items={job.requirements} />
        <div>
          <h3 className="text-base font-bold text-[#20283a]">
            Required skills
          </h3>
          {job.skills.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-[#d9d7eb] bg-[#f7f7fb] px-3 py-1.5 text-xs font-medium text-[#424657]"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-[#7a849a]">
              No specific skills listed.
            </p>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Fact label="Experience" value={pretty(job.experienceLevel)} />
          <Fact label="Openings" value={`${job.openings}`} />
          <Fact
            label="Application deadline"
            value={job.applicationDeadline || "Not specified"}
          />
          <Fact
            label="Posted"
            value={new Date(job.createdAt).toLocaleDateString(undefined, {
              dateStyle: "medium",
            })}
          />
        </div>
        {related.length > 0 && (
          <section>
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-base font-bold text-[#20283a]">
                  Related jobs
                </h3>
                <p className="mt-1 text-xs text-[#7a849a]">
                  Other openings that may interest you
                </p>
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {related.slice(0, 4).map((item) => (
                <button
                  type="button"
                  key={item._id}
                  onClick={() => onSelectRelated(item)}
                  className="flex w-full items-center gap-3 rounded-xl border border-[#e6e5ef] p-3 text-left hover:border-[#aaa5f5] hover:bg-[#fbfaff]"
                >
                  <CompanyMark name={item.companyName} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-bold text-[#20283a]">
                      {item.title}
                    </span>
                    <span className="mt-1 block truncate text-[11px] text-[#7a849a]">
                      {item.companyName} · {item.location}
                    </span>
                  </span>
                  <ExternalLink size={14} className="shrink-0 text-[#929cb0]" />
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
function DetailList({ title, items }: { title: string; items: string[] }) {
  return (
    <section>
      <h3 className="text-base font-bold text-[#20283a]">{title}</h3>
      {items.length ? (
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[#424657]">
          {items.map((item, index) => (
            <li key={`${index}-${item}`}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-[#7a849a]">Not specified.</p>
      )}
    </section>
  );
}
function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#e8e7f0] bg-[#fafafe] p-3">
      <p className="text-[10px] font-bold uppercase tracking-wide text-[#929cb0]">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-[#34405b]">{value}</p>
    </div>
  );
}
