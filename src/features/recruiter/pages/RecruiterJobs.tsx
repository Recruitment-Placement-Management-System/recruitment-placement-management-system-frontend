import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { isAxiosError } from "axios";
import {
  BriefcaseBusiness,
  Check,
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  Clock3,
  Eye,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  recruiterJobsApi,
  type JobEmploymentType,
  type JobExperienceLevel,
  type JobStatus,
  type JobWorkMode,
  type RecruiterJob,
  type RecruiterJobFilters,
  type RecruiterJobInput,
} from "../../../api/recruiter-jobs.api";
import { RecruiterModuleLayout } from "../components/RecruiterModuleLayout";

const types: [JobEmploymentType, string][] = [
  ["full_time", "Full-time"],
  ["part_time", "Part-time"],
  ["contract", "Contract"],
  ["internship", "Internship"],
  ["temporary", "Temporary"],
  ["freelance", "Freelance"],
];
const modes: [JobWorkMode, string][] = [
  ["remote", "Remote"],
  ["hybrid", "Hybrid"],
  ["onsite", "On-site"],
];
const levels: [JobExperienceLevel, string][] = [
  ["internship", "Internship"],
  ["entry", "Entry"],
  ["junior", "Junior"],
  ["mid", "Mid-level"],
  ["senior", "Senior"],
  ["lead", "Lead"],
  ["executive", "Executive"],
];
const inputClass =
  "mt-1.5 w-full rounded-lg border border-[#E4EAF3] bg-white px-3.5 py-2.5 text-sm text-[#102039] outline-none transition placeholder:text-[#A2ACB2] focus:border-[#006B63] focus:ring-2 focus:ring-[#006B63]/10";
const initialForm = (): RecruiterJobInput => ({
  title: "",
  description: "",
  responsibilities: [],
  requirements: [],
  skills: [],
  location: "",
  employmentType: "full_time",
  workMode: "onsite",
  experienceLevel: "mid",
  salaryRange: null,
  openings: 1,
  applicationDeadline: null,
});
function apiError(error: unknown, fallback: string) {
  return isAxiosError<{ message?: string }>(error)
    ? error.response?.data?.message || fallback
    : fallback;
}
function label(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
function dateLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
}
function salaryLabel(job: RecruiterJob) {
  const range = job.salaryRange;
  if (!range) return "Salary not specified";
  const fmt = (value: number | null) =>
    value === null
      ? ""
      : new Intl.NumberFormat(undefined, {
          style: "currency",
          currency: range.currency,
          maximumFractionDigits: 0,
        }).format(value);
  return [fmt(range.minimum), fmt(range.maximum)].filter(Boolean).join(" – ");
}

export default function RecruiterJobsPage() {
  const [jobs, setJobs] = useState<RecruiterJob[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<JobStatus | "">("");
  const [employmentType, setEmploymentType] = useState<JobEmploymentType | "">(
    "",
  );
  const [workMode, setWorkMode] = useState<JobWorkMode | "">("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [dialog, setDialog] = useState<
    "create" | "edit" | "details" | "delete" | null
  >(null);
  const [selected, setSelected] = useState<RecruiterJob | null>(null);
  const [form, setForm] = useState<RecruiterJobInput>(initialForm);
  const [skillsText, setSkillsText] = useState("");
  const [responsibilitiesText, setResponsibilitiesText] = useState("");
  const [requirementsText, setRequirementsText] = useState("");
  const [minimumSalary, setMinimumSalary] = useState("");
  const [maximumSalary, setMaximumSalary] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [saving, setSaving] = useState(false);
  const filters = useMemo<RecruiterJobFilters>(
    () => ({
      page,
      limit: 10,
      q: query || undefined,
      status: status || undefined,
      employmentType: employmentType || undefined,
      workMode: workMode || undefined,
      location: location.trim() || undefined,
      sortBy: "latest",
    }),
    [page, query, status, employmentType, workMode, location],
  );
  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await recruiterJobsApi.list(filters);
      setJobs(result.jobs);
      setTotal(result.pagination.total);
      setPages(Math.max(result.pagination.pages, 1));
    } catch (cause) {
      setError(apiError(cause, "Could not load jobs. Please try again."));
    } finally {
      setLoading(false);
    }
  }, [filters]);
  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) return loadJobs();
      return undefined;
    });
    return () => { active = false; };
  }, [loadJobs]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(timer);
  }, [toast]);
  const notify = (message: string) => setToast(message);
  const openForm = (job?: RecruiterJob) => {
    if (job) {
      setSelected(job);
      setForm({
        title: job.title,
        description: job.description,
        responsibilities: job.responsibilities,
        requirements: job.requirements,
        skills: job.skills,
        location: job.location,
        employmentType: job.employmentType,
        workMode: job.workMode,
        experienceLevel: job.experienceLevel,
        salaryRange: job.salaryRange,
        openings: job.openings,
        applicationDeadline: job.applicationDeadline,
      });
      setSkillsText(job.skills.join(", "));
      setResponsibilitiesText(job.responsibilities.join("\n"));
      setRequirementsText(job.requirements.join("\n"));
      setMinimumSalary(job.salaryRange?.minimum?.toString() || "");
      setMaximumSalary(job.salaryRange?.maximum?.toString() || "");
      setCurrency(job.salaryRange?.currency || "USD");
      setDialog("edit");
    } else {
      setSelected(null);
      setForm(initialForm());
      setSkillsText("");
      setResponsibilitiesText("");
      setRequirementsText("");
      setMinimumSalary("");
      setMaximumSalary("");
      setCurrency("USD");
      setDialog("create");
    }
    setError("");
  };
  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const skills = [
      ...new Set(
        skillsText
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      ),
    ];
    const salaryRange =
      minimumSalary || maximumSalary
        ? {
            minimum: minimumSalary ? Number(minimumSalary) : null,
            maximum: maximumSalary ? Number(maximumSalary) : null,
            currency: currency.toUpperCase(),
          }
        : null;
    const payload: RecruiterJobInput = {
      ...form,
      skills,
      responsibilities: responsibilitiesText
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      requirements: requirementsText
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      salaryRange,
      applicationDeadline: form.applicationDeadline || null,
    };
    if (
      salaryRange &&
      salaryRange.minimum !== null &&
      salaryRange.maximum !== null &&
      salaryRange.minimum > salaryRange.maximum
    ) {
      setError("Minimum salary cannot exceed maximum salary.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (dialog === "edit" && selected) {
        await recruiterJobsApi.update(selected._id, payload);
        notify("Job updated successfully.");
      } else {
        await recruiterJobsApi.create(payload);
        notify("Job created as a draft.");
      }
      setDialog(null);
      await loadJobs();
    } catch (cause) {
      setError(
        apiError(
          cause,
          "Could not save this job. Check the required fields and try again.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };
  const togglePublication = async (job: RecruiterJob) => {
    setError("");
    try {
      if (job.status === "published") {
        await recruiterJobsApi.unpublish(job._id);
        notify("Job unpublished.");
      } else {
        await recruiterJobsApi.publish(job._id);
        notify("Job published.");
      }
      await loadJobs();
    } catch (cause) {
      setError(apiError(cause, "Could not update the job publication status."));
    }
  };
  const deleteJob = async () => {
    if (!selected) return;
    setSaving(true);
    setError("");
    try {
      await recruiterJobsApi.remove(selected._id);
      setDialog(null);
      setSelected(null);
      notify("Job deleted.");
      await loadJobs();
    } catch (cause) {
      setError(apiError(cause, "Could not delete this job."));
    } finally {
      setSaving(false);
    }
  };
  const runSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setQuery(search.trim());
  };
  const resetFilters = () => {
    setSearch("");
    setQuery("");
    setLocation("");
    setStatus("");
    setEmploymentType("");
    setWorkMode("");
    setPage(1);
  };
  const closeDialog = () => {
    setDialog(null);
    setError("");
  };
  return (
    <RecruiterModuleLayout
      title="Manage Jobs"
      context="Recruitment Hub / Jobs"
      activePage="Manage Jobs"
    >
      {toast && (
        <div
          role="status"
          className="fixed right-5 top-24 z-[80] flex items-center gap-2 rounded-xl border border-[#BFE9E5] bg-white px-4 py-3 text-sm font-semibold text-[#006B63] shadow-lg sm:right-7"
        >
          <Check size={16} />
          {toast}
        </div>
      )}
      <section className="flex flex-col justify-between gap-4 rounded-xl border border-[#E8ECF5] bg-white p-5 sm:flex-row sm:items-center sm:p-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.15em] text-[#8A999D]">
            Recruitment workspace
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#102039]">
            Manage jobs
          </h1>
          <p className="mt-1 text-sm text-[#6C7A7E]">
            Create openings, review job details, and manage publication status.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openForm()}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#006B63] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#00564F]"
        >
          <Plus size={17} />
          Create job
        </button>
      </section>
      {error && !dialog && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 rounded-lg border border-[#F0D5D8] bg-[#FFF5F5] px-4 py-3 text-sm text-[#B13D49]"
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
      <section className="rounded-xl border border-[#E8ECF5] bg-white p-4 sm:p-5">
        <form
          onSubmit={runSearch}
          className="grid gap-3 lg:grid-cols-[minmax(220px,1.5fr)_repeat(4,minmax(130px,1fr))_auto]"
        >
          <label className="relative block">
            <span className="sr-only">Search jobs</span>
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A999D]"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search title or keywords"
              className={`${inputClass} mt-0 pl-9`}
            />
          </label>
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as JobStatus | "");
              setPage(1);
            }}
            className={`${inputClass} mt-0`}
          >
            <option value="">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <select
            value={employmentType}
            onChange={(event) => {
              setEmploymentType(event.target.value as JobEmploymentType | "");
              setPage(1);
            }}
            className={`${inputClass} mt-0`}
          >
            <option value="">All employment</option>
            {types.map(([value, name]) => (
              <option key={value} value={value}>
                {name}
              </option>
            ))}
          </select>
          <select
            value={workMode}
            onChange={(event) => {
              setWorkMode(event.target.value as JobWorkMode | "");
              setPage(1);
            }}
            className={`${inputClass} mt-0`}
          >
            <option value="">All work modes</option>
            {modes.map(([value, name]) => (
              <option key={value} value={value}>
                {name}
              </option>
            ))}
          </select>
          <input
            value={location}
            onChange={(event) => {
              setLocation(event.target.value);
              setPage(1);
            }}
            placeholder="Filter location"
            className={`${inputClass} mt-0`}
            aria-label="Filter by location"
          />
          <div className="flex gap-2">
            <button className="rounded-lg bg-[#006B63] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#00564F]">
              Search
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-lg border border-[#E4EAF3] px-3 py-2.5 text-sm font-semibold text-[#52606B] hover:bg-[#F7F9FB]"
            >
              Reset
            </button>
          </div>
        </form>
      </section>
      <section className="overflow-hidden rounded-xl border border-[#E8ECF5] bg-white">
        <div className="flex items-center justify-between border-b border-[#EEF0F5] px-5 py-4">
          <div>
            <h2 className="text-sm font-bold text-[#102039]">Job listings</h2>
            <p className="mt-1 text-[11px] text-[#849094]">
              {total} {total === 1 ? "opening" : "openings"} across your company
            </p>
          </div>
          <span className="rounded-full bg-[#F0F5FF] px-3 py-1 text-[11px] font-semibold text-[#52606B]">
            Page {page} of {pages}
          </span>
        </div>
        {loading ? (
          <div className="p-10 text-center text-sm text-[#849094]">
            Loading jobs…
          </div>
        ) : error && !jobs.length ? (
          <div className="p-10 text-center">
            <p className="text-sm font-semibold text-[#52606B]">{error}</p>
            <button
              type="button"
              onClick={() => void loadJobs()}
              className="mt-3 text-xs font-bold text-[#006B63] hover:underline"
            >
              Try again
            </button>
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-14 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#E8F5F3] text-[#006B63]">
              <BriefcaseBusiness size={22} />
            </span>
            <h3 className="mt-4 text-sm font-bold text-[#102039]">
              No jobs found
            </h3>
            <p className="mt-1 max-w-sm text-xs leading-5 text-[#849094]">
              Create your first opening, or change the filters to see other
              jobs.
            </p>
            <button
              type="button"
              onClick={() => openForm()}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#006B63] hover:underline"
            >
              <CirclePlus size={15} />
              Create job
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#EEF0F5]">
            {jobs.map((job) => (
              <article
                key={job._id}
                className="flex flex-col gap-4 px-5 py-4 transition hover:bg-[#FBFDFC] lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#E8F5F3] text-[#006B63]">
                    <BriefcaseBusiness size={19} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-sm font-bold text-[#102039]">
                        {job.title}
                      </h3>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${job.status === "published" ? "bg-[#DDF3F0] text-[#006B63]" : "bg-[#FFF7E8] text-[#9A6816]"}`}
                      >
                        {label(job.status)}
                      </span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#6C7A7E]">
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={12} />
                        {job.location}
                      </span>
                      <span>{label(job.employmentType)}</span>
                      <span>{label(job.workMode)}</span>
                      <span>{label(job.experienceLevel)}</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock3 size={12} />
                        {dateLabel(job.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1.5 line-clamp-1 text-[11px] text-[#849094]">
                      {salaryLabel(job)} · {job.openings}{" "}
                      {job.openings === 1 ? "opening" : "openings"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 pl-[52px] lg:pl-0">
                  <button
                    type="button"
                    onClick={async () => {
                      setError("");
                      try {
                        setSelected(await recruiterJobsApi.get(job._id));
                        setDialog("details");
                      } catch (cause) {
                        setError(
                          apiError(cause, "Could not load job details."),
                        );
                      }
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#E4EAF3] px-3 py-2 text-[11px] font-semibold text-[#52606B] hover:border-[#C8D9D6] hover:text-[#006B63]"
                  >
                    <Eye size={14} />
                    Details
                  </button>
                  <button
                    type="button"
                    onClick={() => openForm(job)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#E4EAF3] px-3 py-2 text-[11px] font-semibold text-[#52606B] hover:border-[#C8D9D6] hover:text-[#006B63]"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void togglePublication(job)}
                    className={`rounded-lg px-3 py-2 text-[11px] font-semibold ${job.status === "published" ? "border border-[#F0D5D8] text-[#B13D49] hover:bg-[#FFF5F5]" : "bg-[#006B63] text-white hover:bg-[#00564F]"}`}
                  >
                    {job.status === "published" ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${job.title}`}
                    onClick={() => {
                      setSelected(job);
                      setDialog("delete");
                      setError("");
                    }}
                    className="grid h-8 w-8 place-items-center rounded-lg text-[#89969B] hover:bg-[#FFF5F5] hover:text-[#B13D49]"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between border-t border-[#EEF0F5] px-5 py-3">
          <p className="text-[11px] text-[#849094]">
            Showing {jobs.length ? (page - 1) * 10 + 1 : 0}–
            {Math.min(page * 10, total)} of {total}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((value) => value - 1)}
              className="grid h-8 w-8 place-items-center rounded-lg border border-[#E4EAF3] text-[#52606B] disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              disabled={page >= pages || loading}
              onClick={() => setPage((value) => value + 1)}
              className="grid h-8 w-8 place-items-center rounded-lg border border-[#E4EAF3] text-[#52606B] disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>
      {dialog && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#102039]/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDialog();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="job-dialog-title"
            className="my-auto max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[#E8ECF5] bg-white shadow-[0_24px_70px_rgba(16,32,57,.24)]"
          >
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-[#EEF0F5] bg-white px-5 py-4 sm:px-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#89969B]">
                  {dialog === "details"
                    ? "Job overview"
                    : dialog === "delete"
                      ? "Remove listing"
                      : dialog === "edit"
                        ? "Update opening"
                        : "New opening"}
                </p>
                <h2
                  id="job-dialog-title"
                  className="mt-1 text-lg font-bold text-[#102039]"
                >
                  {dialog === "details"
                    ? selected?.title
                    : dialog === "delete"
                      ? "Delete this job?"
                      : dialog === "edit"
                        ? "Edit job details"
                        : "Create a job"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeDialog}
                aria-label="Close"
                className="grid h-8 w-8 place-items-center rounded-lg text-[#7A858F] hover:bg-[#F4F6F8]"
              >
                <X size={18} />
              </button>
            </div>
            {dialog === "delete" ? (
              <div className="p-5 sm:p-6">
                <p className="text-sm leading-6 text-[#6C7A7E]">
                  This will permanently remove{" "}
                  <strong className="text-[#102039]">{selected?.title}</strong>.
                  This action cannot be undone.
                </p>
                {error && (
                  <p role="alert" className="mt-3 text-xs text-[#B13D49]">
                    {error}
                  </p>
                )}
                <div className="mt-6 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeDialog}
                    className="rounded-lg border border-[#E4EAF3] px-4 py-2.5 text-sm font-semibold text-[#52606B]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void deleteJob()}
                    className="rounded-lg bg-[#B13D49] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {saving ? "Deleting…" : "Delete job"}
                  </button>
                </div>
              </div>
            ) : dialog === "details" && selected ? (
              <div className="space-y-5 p-5 sm:p-6">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#DDF3F0] px-3 py-1.5 text-[11px] font-bold text-[#006B63]">
                    {label(selected.status)}
                  </span>
                  <span className="rounded-full bg-[#F1F4F7] px-3 py-1.5 text-[11px] font-semibold text-[#52606B]">
                    {label(selected.employmentType)}
                  </span>
                  <span className="rounded-full bg-[#F1F4F7] px-3 py-1.5 text-[11px] font-semibold text-[#52606B]">
                    {label(selected.workMode)}
                  </span>
                </div>
                <div className="grid gap-4 rounded-xl bg-[#F8FAFB] p-4 sm:grid-cols-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-[#89969B]">
                      Location
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#102039]">
                      {selected.location}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-[#89969B]">
                      Experience
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#102039]">
                      {label(selected.experienceLevel)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-[#89969B]">
                      Salary
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#102039]">
                      {salaryLabel(selected)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-[#89969B]">
                      Openings
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#102039]">
                      {selected.openings}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-[#89969B]">
                      Application deadline
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#102039]">
                      {selected.applicationDeadline || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-[#89969B]">
                      Created
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#102039]">
                      {dateLabel(selected.createdAt)}
                    </p>
                  </div>
                </div>
                <DetailSection
                  title="Description"
                  content={selected.description}
                />
                <DetailSection
                  title="Responsibilities"
                  items={selected.responsibilities}
                />
                <DetailSection
                  title="Requirements"
                  items={selected.requirements}
                />
                <div>
                  <h3 className="text-xs font-bold text-[#102039]">Skills</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selected.skills.length ? (
                      selected.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-[#E8F5F3] px-3 py-1.5 text-[11px] font-semibold text-[#006B63]"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-[#849094]">
                        No skills specified
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-2 border-t border-[#EEF0F5] pt-4">
                  <button
                    type="button"
                    onClick={() => openForm(selected)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#006B63] px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    <Pencil size={14} />
                    Edit job
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={submitForm} className="space-y-5 p-5 sm:p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-xs font-semibold text-[#52606B] sm:col-span-2">
                    Job title
                    <input
                      required
                      minLength={3}
                      maxLength={160}
                      value={form.title}
                      onChange={(event) =>
                        setForm({ ...form, title: event.target.value })
                      }
                      placeholder="e.g. Senior Product Designer"
                      className={inputClass}
                    />
                  </label>
                  <label className="block text-xs font-semibold text-[#52606B] sm:col-span-2">
                    Location
                    <input
                      required
                      minLength={2}
                      maxLength={160}
                      value={form.location}
                      onChange={(event) =>
                        setForm({ ...form, location: event.target.value })
                      }
                      placeholder="City, region, or remote"
                      className={inputClass}
                    />
                  </label>
                  <label className="block text-xs font-semibold text-[#52606B]">
                    Employment type
                    <select
                      value={form.employmentType}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          employmentType: event.target
                            .value as JobEmploymentType,
                        })
                      }
                      className={inputClass}
                    >
                      {types.map(([value, name]) => (
                        <option key={value} value={value}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-xs font-semibold text-[#52606B]">
                    Work mode
                    <select
                      value={form.workMode}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          workMode: event.target.value as JobWorkMode,
                        })
                      }
                      className={inputClass}
                    >
                      {modes.map(([value, name]) => (
                        <option key={value} value={value}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-xs font-semibold text-[#52606B]">
                    Experience level
                    <select
                      value={form.experienceLevel}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          experienceLevel: event.target
                            .value as JobExperienceLevel,
                        })
                      }
                      className={inputClass}
                    >
                      {levels.map(([value, name]) => (
                        <option key={value} value={value}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-xs font-semibold text-[#52606B]">
                    Number of openings
                    <input
                      type="number"
                      required
                      min={1}
                      max={1000}
                      value={form.openings}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          openings: Number(event.target.value),
                        })
                      }
                      className={inputClass}
                    />
                  </label>
                  <label className="block text-xs font-semibold text-[#52606B] sm:col-span-2">
                    Job description
                    <textarea
                      required
                      minLength={20}
                      maxLength={12000}
                      rows={5}
                      value={form.description}
                      onChange={(event) =>
                        setForm({ ...form, description: event.target.value })
                      }
                      placeholder="Describe the role, team, and opportunity…"
                      className={inputClass}
                    />
                    <span className="mt-1 block text-right text-[10px] font-normal text-[#9AA5A8]">
                      {form.description.length}/12000
                    </span>
                  </label>
                  <label className="block text-xs font-semibold text-[#52606B] sm:col-span-2">
                    Responsibilities{" "}
                    <span className="font-normal text-[#89969B]">
                      (one per line)
                    </span>
                    <textarea
                      rows={3}
                      value={responsibilitiesText}
                      onChange={(event) =>
                        setResponsibilitiesText(event.target.value)
                      }
                      placeholder="Lead project planning\nCollaborate across teams"
                      className={inputClass}
                    />
                  </label>
                  <label className="block text-xs font-semibold text-[#52606B] sm:col-span-2">
                    Requirements{" "}
                    <span className="font-normal text-[#89969B]">
                      (one per line)
                    </span>
                    <textarea
                      rows={3}
                      value={requirementsText}
                      onChange={(event) =>
                        setRequirementsText(event.target.value)
                      }
                      placeholder="Relevant experience\nStrong communication skills"
                      className={inputClass}
                    />
                  </label>
                  <label className="block text-xs font-semibold text-[#52606B] sm:col-span-2">
                    Skills{" "}
                    <span className="font-normal text-[#89969B]">
                      (comma separated; duplicates are removed)
                    </span>
                    <input
                      value={skillsText}
                      onChange={(event) => setSkillsText(event.target.value)}
                      placeholder="React, TypeScript, UX research"
                      className={inputClass}
                    />
                  </label>
                  <div className="sm:col-span-2">
                    <p className="text-xs font-semibold text-[#52606B]">
                      Salary range{" "}
                      <span className="font-normal text-[#89969B]">
                        (optional)
                      </span>
                    </p>
                    <div className="mt-1.5 grid gap-3 sm:grid-cols-[1fr_1fr_100px]">
                      <input
                        type="number"
                        min={0}
                        value={minimumSalary}
                        onChange={(event) =>
                          setMinimumSalary(event.target.value)
                        }
                        placeholder="Minimum"
                        className="rounded-lg border border-[#E4EAF3] px-3.5 py-2.5 text-sm outline-none focus:border-[#006B63]"
                      />
                      <input
                        type="number"
                        min={0}
                        value={maximumSalary}
                        onChange={(event) =>
                          setMaximumSalary(event.target.value)
                        }
                        placeholder="Maximum"
                        className="rounded-lg border border-[#E4EAF3] px-3.5 py-2.5 text-sm outline-none focus:border-[#006B63]"
                      />
                      <input
                        value={currency}
                        maxLength={3}
                        onChange={(event) =>
                          setCurrency(event.target.value.toUpperCase())
                        }
                        aria-label="Salary currency"
                        className="rounded-lg border border-[#E4EAF3] px-3.5 py-2.5 text-sm uppercase outline-none focus:border-[#006B63]"
                      />
                    </div>
                  </div>
                  <label className="block text-xs font-semibold text-[#52606B]">
                    Application deadline{" "}
                    <span className="font-normal text-[#89969B]">
                      (optional)
                    </span>
                    <input
                      type="date"
                      value={form.applicationDeadline || ""}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          applicationDeadline: event.target.value || null,
                        })
                      }
                      className={inputClass}
                    />
                  </label>
                </div>
                {error && (
                  <p
                    role="alert"
                    className="rounded-lg border border-[#F0D5D8] bg-[#FFF5F5] px-3 py-2.5 text-xs text-[#B13D49]"
                  >
                    {error}
                  </p>
                )}
                <div className="sticky bottom-0 flex justify-end gap-2 border-t border-[#EEF0F5] bg-white pt-4">
                  <button
                    type="button"
                    onClick={closeDialog}
                    className="rounded-lg border border-[#E4EAF3] px-4 py-2.5 text-sm font-semibold text-[#52606B]"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#006B63] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#00564F] disabled:opacity-60"
                  >
                    {saving
                      ? "Saving…"
                      : dialog === "edit"
                        ? "Save changes"
                        : "Create draft"}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
    </RecruiterModuleLayout>
  );
}

function DetailSection({
  title,
  content,
  items,
}: {
  title: string;
  content?: string;
  items?: string[];
}) {
  return (
    <section>
      <h3 className="text-xs font-bold text-[#102039]">{title}</h3>
      {content ? (
        <p className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-[#52606B]">
          {content}
        </p>
      ) : items?.length ? (
        <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm leading-6 text-[#52606B]">
          {items.map((item, index) => (
            <li key={`${index}-${item}`}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-1.5 text-xs text-[#849094]">Not provided</p>
      )}
    </section>
  );
}
