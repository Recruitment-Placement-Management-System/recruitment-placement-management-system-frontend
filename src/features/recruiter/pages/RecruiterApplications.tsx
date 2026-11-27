import { useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import {
  ArrowDownToLine,
  BriefcaseBusiness,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock3,
  Search,
  UserRound,
  X,
} from "lucide-react";
import {
  recruiterApplicationsApi,
  type RecruiterApplication,
  type RecruiterApplicationStatus,
} from "../../../api/recruiter-applications.api";
import {
  recruiterJobsApi,
  type RecruiterJob,
} from "../../../api/recruiter-jobs.api";
import { RecruiterModuleLayout } from "../components/RecruiterModuleLayout";

const pageSize = 10;
function message(error: unknown, fallback: string) {
  return isAxiosError<{ message?: string }>(error)
    ? error.response?.data?.message || fallback
    : fallback;
}
function pretty(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
function dateLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
}
function statusClass(status: RecruiterApplicationStatus) {
  if (status === "shortlisted") return "bg-[#E5F7EF] text-[#137A54]";
  if (status === "rejected" || status === "withdrawn")
    return "bg-[#F1F2F5] text-[#667085]";
  if (status === "under_review") return "bg-[#FFF4DB] text-[#9A6712]";
  return "bg-[#EAF0FF] text-[#4054B2]";
}

export default function RecruiterApplicationsPage() {
  const [applications, setApplications] = useState<RecruiterApplication[]>([]);
  const [jobs, setJobs] = useState<RecruiterJob[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [selectedDetails, setSelectedDetails] =
    useState<RecruiterApplication | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"" | RecruiterApplicationStatus>("");
  const [jobFilter, setJobFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [detailFailedId, setDetailFailedId] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    let active = true;
    const loadApplications = async () => {
      const firstPage = await recruiterApplicationsApi.list({
        page: 1,
        limit: 100,
      });
      const remainingPages = await Promise.all(
        Array.from(
          { length: Math.max(0, firstPage.pagination.pages - 1) },
          (_, index) =>
            recruiterApplicationsApi.list({ page: index + 2, limit: 100 }),
        ),
      );
      return [
        ...firstPage.applications,
        ...remainingPages.flatMap((result) => result.applications),
      ];
    };
    const loadJobs = async () => {
      const firstPage = await recruiterJobsApi.list({ page: 1, limit: 100 });
      const remainingPages = await Promise.all(
        Array.from(
          { length: Math.max(0, firstPage.pagination.pages - 1) },
          (_, index) => recruiterJobsApi.list({ page: index + 2, limit: 100 }),
        ),
      );
      return [
        ...firstPage.jobs,
        ...remainingPages.flatMap((result) => result.jobs),
      ];
    };
    void Promise.all([loadApplications(), loadJobs()])
      .then(([allApplications, allJobs]) => {
        if (!active) return;
        setApplications(allApplications);
        setJobs(allJobs);
        setSelectedId(allApplications[0]?._id || "");
      })
      .catch((cause) => {
        if (active) setError(message(cause, "Could not load applications."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    let active = true;
    void recruiterApplicationsApi
      .get(selectedId)
      .then((application) => {
        if (active) {
          setSelectedDetails(application);
          setDetailFailedId("");
        }
      })
      .catch((cause) => {
        if (active) {
          setDetailFailedId(selectedId);
          setError(message(cause, "Could not load this application."));
        }
      });
    return () => {
      active = false;
    };
  }, [selectedId]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const jobById = useMemo(
    () => new Map(jobs.map((job) => [job._id, job])),
    [jobs],
  );
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return applications.filter((application) => {
      const job = jobById.get(application.jobId);
      return (
        (!status || application.status === status) &&
        (!jobFilter || application.jobId === jobFilter) &&
        (!needle ||
          `${application.candidate.fullName} ${application.candidate.email} ${job?.title || ""}`
            .toLocaleLowerCase()
            .includes(needle))
      );
    });
  }, [applications, jobById, jobFilter, query, status]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const detailLoading = Boolean(
    selectedId &&
    selectedDetails?._id !== selectedId &&
    detailFailedId !== selectedId,
  );
  const selected =
    (selectedDetails?._id === selectedId ? selectedDetails : null) ||
    applications.find((application) => application._id === selectedId) ||
    null;
  const selectedJob = selected ? jobById.get(selected.jobId) : undefined;
  const counts = useMemo(
    () => ({
      total: applications.length,
      new: applications.filter(
        (application) => application.status === "submitted",
      ).length,
      review: applications.filter(
        (application) => application.status === "under_review",
      ).length,
      shortlisted: applications.filter(
        (application) => application.status === "shortlisted",
      ).length,
    }),
    [applications],
  );

  const changeStatus = async (
    next: Extract<
      RecruiterApplicationStatus,
      "under_review" | "shortlisted" | "rejected"
    >,
  ) => {
    if (!selected) return;
    setSavingStatus(true);
    setError("");
    try {
      const updated = await recruiterApplicationsApi.updateStatus(
        selected._id,
        next,
      );
      setApplications((current) =>
        current.map((application) =>
          application._id === updated._id ? updated : application,
        ),
      );
      setSelectedDetails((current) =>
        current ? { ...current, ...updated, resume: current.resume } : updated,
      );
      setToast(`Application marked ${pretty(next).toLowerCase()}.`);
    } catch (cause) {
      setError(message(cause, "Could not update the application status."));
    } finally {
      setSavingStatus(false);
    }
  };

  return (
    <RecruiterModuleLayout
      title="Applications"
      context="Recruitment Hub / Hiring"
      activePage="Applications"
    >
      <section className="flex flex-col justify-between gap-3 rounded-2xl border border-[#E8ECF5] bg-white p-5 sm:flex-row sm:items-center sm:p-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#89969B]">
            Hiring pipeline
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[#102039]">
            Applications
          </h1>
          <p className="mt-1 text-sm text-[#687983]">
            Review candidates, open their resumes, and update application
            decisions.
          </p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#89969B]"
          />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Search candidates or jobs"
            className="h-10 w-full rounded-lg border border-[#E4EAF3] bg-[#F8FAFC] pl-9 pr-3 text-sm outline-none focus:border-[#006B63] focus:ring-2 focus:ring-[#006B63]/10"
          />
        </div>
      </section>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total applications",
            value: counts.total,
            color: "text-[#102039]",
          },
          {
            label: "New submissions",
            value: counts.new,
            color: "text-[#4054B2]",
          },
          {
            label: "Under review",
            value: counts.review,
            color: "text-[#9A6712]",
          },
          {
            label: "Shortlisted",
            value: counts.shortlisted,
            color: "text-[#137A54]",
          },
        ].map((item) => (
          <article
            key={item.label}
            className="rounded-xl border border-[#E8ECF5] bg-white px-4 py-4"
          >
            <p className="text-xs font-semibold text-[#7A858F]">{item.label}</p>
            <p className={`mt-2 text-2xl font-bold ${item.color}`}>
              {item.value}
            </p>
          </article>
        ))}
      </section>
      <section className="overflow-hidden rounded-2xl border border-[#E8ECF5] bg-white">
        <div className="flex flex-col gap-3 border-b border-[#E8ECF5] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="text-base font-bold text-[#102039]">
              Candidate applications
            </h2>
            <p className="mt-1 text-xs text-[#7A858F]">
              {filtered.length} matching applications
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as typeof status);
                setPage(1);
              }}
              className="rounded-lg border border-[#E4EAF3] bg-white px-3 py-2 text-xs text-[#46545A] outline-none focus:border-[#006B63]"
            >
              <option value="">All statuses</option>
              {(
                [
                  "submitted",
                  "under_review",
                  "shortlisted",
                  "rejected",
                  "withdrawn",
                ] as RecruiterApplicationStatus[]
              ).map((value) => (
                <option key={value} value={value}>
                  {pretty(value)}
                </option>
              ))}
            </select>
            <select
              value={jobFilter}
              onChange={(event) => {
                setJobFilter(event.target.value);
                setPage(1);
              }}
              className="max-w-[220px] rounded-lg border border-[#E4EAF3] bg-white px-3 py-2 text-xs text-[#46545A] outline-none focus:border-[#006B63]"
            >
              <option value="">All jobs</option>
              {jobs.map((job) => (
                <option key={job._id} value={job._id}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>
        </div>
        {error && (
          <div
            role="alert"
            className="mx-4 mt-4 flex items-center gap-2 rounded-lg border border-[#F3D2D2] bg-[#FFF6F6] px-3 py-2.5 text-xs text-[#B43A3A]"
          >
            <CircleAlert size={15} />
            {error}
            <button
              type="button"
              className="ml-auto"
              aria-label="Dismiss error"
              onClick={() => setError("")}
            >
              <X size={14} />
            </button>
          </div>
        )}
        {loading ? (
          <div className="p-12 text-center text-sm text-[#7A858F]">
            Loading applications…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-[#F0F5FF] text-[#006B63]">
              <BriefcaseBusiness size={20} />
            </span>
            <h3 className="mt-3 text-sm font-bold text-[#102039]">
              No applications found
            </h3>
            <p className="mt-1 text-xs text-[#7A858F]">
              New submissions for your jobs will appear here.
            </p>
          </div>
        ) : (
          <div className="grid xl:grid-cols-[minmax(0,1fr)_minmax(360px,.9fr)]">
            <div className="divide-y divide-[#EEF0F5]">
              {visible.map((application) => {
                const job = jobById.get(application.jobId);
                return (
                  <button
                    type="button"
                    key={application._id}
                    onClick={() => {
                      setSelectedId(application._id);
                      setError("");
                    }}
                    className={`flex w-full items-start gap-3 p-4 text-left transition hover:bg-[#F8FAFC] sm:p-5 ${selectedId === application._id ? "bg-[#F0F8F7]" : ""}`}
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#E5F2F0] text-[#006B63]">
                      <UserRound size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center justify-between gap-2">
                        <span className="truncate text-sm font-bold text-[#102039]">
                          {application.candidate.fullName}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusClass(application.status)}`}
                        >
                          {pretty(application.status)}
                        </span>
                      </span>
                      <span className="mt-1 block truncate text-xs text-[#687983]">
                        {job?.title || "Job posting"}
                      </span>
                      <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[#89969B]">
                        <span>{application.candidate.email}</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock3 size={11} />
                          Applied {dateLabel(application.submittedAt)}
                        </span>
                      </span>
                    </span>
                  </button>
                );
              })}
              <div className="flex items-center justify-between px-4 py-3 text-xs text-[#7A858F]">
                <span>
                  Page {page} of {pages}
                </span>
                <span className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((value) => value - 1)}
                    className="grid h-8 w-8 place-items-center rounded-md border border-[#E4EAF3] disabled:opacity-40"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <button
                    type="button"
                    disabled={page >= pages}
                    onClick={() => setPage((value) => value + 1)}
                    className="grid h-8 w-8 place-items-center rounded-md border border-[#E4EAF3] disabled:opacity-40"
                  >
                    <ChevronRight size={15} />
                  </button>
                </span>
              </div>
            </div>
            <aside className="border-t border-[#E8ECF5] bg-[#FBFCFE] p-4 sm:p-5 xl:border-l xl:border-t-0">
              {detailLoading ? (
                <div className="grid min-h-[360px] place-items-center text-sm text-[#7A858F]">
                  Loading candidate details…
                </div>
              ) : selected ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#DDF3F0] text-[#006B63]">
                      <UserRound size={22} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-bold text-[#102039]">
                          {selected.candidate.fullName}
                        </h2>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusClass(selected.status)}`}
                        >
                          {pretty(selected.status)}
                        </span>
                      </div>
                      <p className="mt-1 break-all text-xs text-[#687983]">
                        {selected.candidate.email}
                      </p>
                      {selected.candidate.phone && (
                        <p className="mt-1 text-xs text-[#687983]">
                          {selected.candidate.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#E4EAF3] bg-white p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#89969B]">
                      Applied for
                    </p>
                    <p className="mt-1 text-sm font-bold text-[#102039]">
                      {selectedJob?.title || "Job posting"}
                    </p>
                    <p className="mt-1 text-xs text-[#687983]">
                      {selectedJob?.location || "Location not available"} ·{" "}
                      {selectedJob ? pretty(selectedJob.workMode) : ""}
                    </p>
                    <p className="mt-2 text-[11px] text-[#89969B]">
                      Submitted {dateLabel(selected.submittedAt)}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={selectedDetails?.resume.downloadUrl || undefined}
                      target="_blank"
                      rel="noreferrer"
                      aria-disabled={!selectedDetails?.resume.downloadUrl}
                      className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-semibold ${selectedDetails?.resume.downloadUrl ? "border-[#006B63] bg-white text-[#006B63] hover:bg-[#F0F8F7]" : "pointer-events-none border-[#E4EAF3] text-[#A2ACB2]"}`}
                    >
                      <ArrowDownToLine size={15} />
                      Download resume
                    </a>
                    {selectedDetails?.resume.downloadUrl && (
                      <a
                        href={selectedDetails.resume.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-[#E4EAF3] bg-white px-3 py-2.5 text-center text-xs font-semibold text-[#52616A] hover:bg-[#F8FAFC]"
                      >
                        Preview resume
                      </a>
                    )}
                  </div>
                  <div className="rounded-xl border border-[#E4EAF3] bg-white p-4">
                    <p className="text-xs font-bold text-[#102039]">
                      Cover letter
                    </p>
                    <p className="mt-2 max-h-40 overflow-y-auto whitespace-pre-wrap text-xs leading-5 text-[#596A72]">
                      {selected.coverLetter || "No cover letter submitted."}
                    </p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-bold text-[#102039]">
                      Review decision
                    </p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      <button
                        type="button"
                        disabled={
                          savingStatus ||
                          selected.status === "withdrawn" ||
                          selected.status === "rejected" ||
                          selected.status === "under_review"
                        }
                        onClick={() => void changeStatus("under_review")}
                        className="rounded-lg border border-[#E7C875] bg-[#FFF9E9] px-2 py-2.5 text-xs font-semibold text-[#94640F] disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        Mark reviewing
                      </button>
                      <button
                        type="button"
                        disabled={
                          savingStatus ||
                          selected.status === "withdrawn" ||
                          selected.status === "rejected" ||
                          selected.status === "shortlisted"
                        }
                        onClick={() => void changeStatus("shortlisted")}
                        className="rounded-lg bg-[#087F5B] px-2 py-2.5 text-xs font-semibold text-white hover:bg-[#066b4c] disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        Shortlist
                      </button>
                      <button
                        type="button"
                        disabled={
                          savingStatus ||
                          selected.status === "withdrawn" ||
                          selected.status === "rejected"
                        }
                        onClick={() => void changeStatus("rejected")}
                        className="rounded-lg border border-[#F0CACA] bg-[#FFF5F5] px-2 py-2.5 text-xs font-semibold text-[#B43A3A] hover:bg-[#FFECEC] disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        Reject
                      </button>
                    </div>
                    {selected.status === "withdrawn" && (
                      <p className="mt-2 text-[10px] text-[#89969B]">
                        Withdrawn applications can’t be changed.
                      </p>
                    )}
                    {selected.status === "rejected" && (
                      <p className="mt-2 text-[10px] text-[#89969B]">
                        Rejected applications can’t be reopened.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid min-h-[360px] place-items-center text-center text-sm text-[#89969B]">
                  Select an application to review.
                </div>
              )}
            </aside>
          </div>
        )}
      </section>
      {toast && (
        <div
          role="status"
          className="fixed right-5 top-24 z-[80] flex items-center gap-2 rounded-xl border border-[#BFE9D5] bg-white px-4 py-3 text-sm font-semibold text-[#137A54] shadow-lg"
        >
          <Check size={16} />
          {toast}
        </div>
      )}
    </RecruiterModuleLayout>
  );
}
