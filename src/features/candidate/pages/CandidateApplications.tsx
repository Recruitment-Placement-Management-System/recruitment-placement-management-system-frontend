import { useCallback, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  MapPin,
} from "lucide-react";
import {
  candidateApplicationsApi,
  type CandidateApplication,
  type CandidateApplicationStatus,
} from "../../../api/candidate-applications.api";
import {
  candidateJobsApi,
  type CandidateJob,
} from "../../../api/candidate-jobs.api";
import { CandidatePageLayout } from "../components/CandidatePageLayout";

const statusFilters: Array<[string, CandidateApplicationStatus | undefined]> = [
  ["All", undefined],
  ["Submitted", "submitted"],
  ["Under review", "under_review"],
  ["Shortlisted", "shortlisted"],
  ["Rejected", "rejected"],
  ["Withdrawn", "withdrawn"],
];
function errorMessage(error: unknown, fallback: string) {
  return isAxiosError<{ message?: string }>(error)
    ? error.response?.data?.message || fallback
    : fallback;
}
function statusStyle(status: CandidateApplicationStatus) {
  return status === "shortlisted"
    ? "bg-[#e7f8ef] text-[#168254]"
    : status === "rejected" || status === "withdrawn"
      ? "bg-[#f1f2f5] text-[#697386]"
      : status === "under_review"
        ? "bg-[#fff5dc] text-[#9a6816]"
        : "bg-[#efedff] text-[#5046e5]";
}
function prettyStatus(status: CandidateApplicationStatus) {
  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
function dateLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
}

export default function CandidateApplicationsPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<
    CandidateApplicationStatus | undefined
  >();
  const [page, setPage] = useState(1);
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [jobs, setJobs] = useState<Record<string, CandidateJob>>({});
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await candidateApplicationsApi.list({
        page,
        limit: 10,
        status,
      });
      setApplications(response.applications);
      setTotal(response.pagination.total);
      setPages(Math.max(1, response.pagination.pages));
      const entries = await Promise.all(
        response.applications.map(async (application) => {
          try {
            return [
              application.jobId,
              await candidateJobsApi.details(application.jobId),
            ] as const;
          } catch {
            return [application.jobId, null] as const;
          }
        }),
      );
      setJobs(
        Object.fromEntries(
          entries.filter(
            (entry): entry is readonly [string, CandidateJob] =>
              entry[1] !== null,
          ),
        ),
      );
    } catch (cause) {
      setError(errorMessage(cause, "Could not load your applications."));
    } finally {
      setLoading(false);
    }
  }, [page, status]);
  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) return load();
    });
    return () => {
      active = false;
    };
  }, [load]);
  const changeStatus = (next?: CandidateApplicationStatus) => {
    setStatus(next);
    setPage(1);
  };
  return (
    <CandidatePageLayout title="My Applications" activePage="My Applications">
      <section>
        <p className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#7a849a]">
          Your job search
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#20283a]">
          My Applications
        </h1>
        <p className="mt-1.5 text-sm text-[#59647d]">
          Track application status and review the details you submitted.
        </p>
      </section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {statusFilters.map(([label, value]) => (
            <button
              key={label}
              type="button"
              onClick={() => changeStatus(value)}
              className={`rounded-full border px-3.5 py-2 text-xs font-semibold transition ${status === value ? "border-[#5046e5] bg-[#5046e5] text-white" : "border-[#dce1ed] bg-white text-[#59647d] hover:border-[#a8a2f5] hover:text-[#5046e5]"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-xs text-[#7a849a]">
          {total} {total === 1 ? "application" : "applications"}
        </p>
      </div>
      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-xl border border-[#f1d1d7] bg-white px-4 py-3 text-sm text-[#ad3a51]"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => void load()}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-2xl border border-[#e5e7f0] bg-white"
            />
          ))}
        </div>
      ) : applications.length ? (
        <div className="space-y-3">
          {applications.map((application) => {
            const job = jobs[application.jobId];
            return (
              <article
                key={application._id}
                className="flex flex-col gap-4 rounded-2xl border border-[#e1e3ed] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#efedff] text-[#5046e5]">
                    <BriefcaseBusiness size={20} />
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-bold text-[#20283a]">
                      {job?.title || "Job posting"}
                    </h2>
                    <p className="mt-1 truncate text-sm text-[#59647d]">
                      {job?.companyName || "Company details unavailable"}
                      {job?.location && (
                        <>
                          <span className="mx-2">·</span>
                          <MapPin size={13} className="inline" /> {job.location}
                        </>
                      )}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusStyle(application.status)}`}
                      >
                        {prettyStatus(application.status)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#7a849a]">
                        <Clock3 size={12} />
                        Applied {dateLabel(application.submittedAt)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#7a849a]">
                        <FileText size={12} />
                        {application.resume.fileName}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/candidate/applications/${application._id}`, {
                      state: { job },
                    })
                  }
                  className="shrink-0 rounded-lg border border-[#dce1ed] px-4 py-2.5 text-sm font-semibold text-[#5046e5] transition hover:border-[#5046e5] hover:bg-[#f7f6ff]"
                >
                  View application
                </button>
              </article>
            );
          })}
        </div>
      ) : (
        <section className="rounded-2xl border border-[#e1e3ed] bg-white px-6 py-14 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-[#efedff] text-[#5046e5]">
            <BriefcaseBusiness size={22} />
          </span>
          <h2 className="mt-4 text-base font-bold text-[#20283a]">
            {status
              ? `No ${prettyStatus(status).toLowerCase()} applications`
              : "You haven’t applied to any jobs yet"}
          </h2>
          <p className="mt-1 text-sm text-[#7a849a]">
            Browse open roles and keep track of every application here.
          </p>
          <button
            type="button"
            onClick={() => navigate("/candidate/jobs")}
            className="mt-5 rounded-lg bg-[#5046e5] px-4 py-2.5 text-sm font-semibold text-white"
          >
            Find jobs
          </button>
        </section>
      )}
      {!loading && applications.length > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
          <span className="text-xs text-[#7a849a]">
            Page {page} of {pages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((value) => value - 1)}
              aria-label="Previous page"
              className="grid h-8 w-8 place-items-center rounded-lg border border-[#dce1ed] text-[#59647d] disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              disabled={page >= pages}
              onClick={() => setPage((value) => value + 1)}
              aria-label="Next page"
              className="grid h-8 w-8 place-items-center rounded-lg border border-[#dce1ed] text-[#59647d] disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </CandidatePageLayout>
  );
}
