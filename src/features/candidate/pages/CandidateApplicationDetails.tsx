import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CircleAlert,
  Download,
  FileText,
  MapPin,
  X,
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

function errorMessage(error: unknown, fallback: string) {
  return isAxiosError<{ message?: string }>(error)
    ? error.response?.data?.message || fallback
    : fallback;
}
function pretty(status: string) {
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
        month: "long",
        day: "numeric",
      });
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

export default function CandidateApplicationDetailsPage() {
  const { applicationId = "" } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const navigationJob = (location.state as { job?: CandidateJob } | null)?.job;
  const submittedFromNavigation =
    (location.state as { submitted?: boolean } | null)?.submitted === true;
  const [application, setApplication] = useState<CandidateApplication | null>(
    null,
  );
  const [job, setJob] = useState<CandidateJob | null>(navigationJob || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [toast, setToast] = useState(() =>
    submittedFromNavigation ? "Application submitted successfully." : "",
  );
  useEffect(() => {
    let active = true;
    void candidateApplicationsApi
      .get(applicationId)
      .then(async (record) => {
        if (!active) return;
        setApplication(record);
        if (!navigationJob) {
          try {
            const detail = await candidateJobsApi.details(record.jobId);
            if (active) setJob(detail);
          } catch {
            if (active) setJob(null);
          }
        }
      })
      .catch((cause) => {
        if (active)
          setError(errorMessage(cause, "Could not load this application."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [applicationId, navigationJob]);
  useEffect(() => {
    if (submittedFromNavigation)
      navigate(location.pathname, { replace: true, state: null });
  }, [submittedFromNavigation, location.pathname, navigate]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(timer);
  }, [toast]);
  const withdraw = async () => {
    if (!application) return;
    setWithdrawing(true);
    setError("");
    try {
      const updated = await candidateApplicationsApi.withdraw(application._id);
      setApplication(updated);
      setConfirmWithdraw(false);
      setToast("Application withdrawn.");
    } catch (cause) {
      setError(errorMessage(cause, "Could not withdraw this application."));
    } finally {
      setWithdrawing(false);
    }
  };
  const canWithdraw =
    !!application && !["rejected", "withdrawn"].includes(application.status);
  return (
    <CandidatePageLayout
      title="Application Details"
      activePage="My Applications"
    >
      <button
        type="button"
        onClick={() => navigate("/candidate/applications")}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#59647d] hover:text-[#5046e5]"
      >
        <ArrowLeft size={16} />
        Back to applications
      </button>
      {loading ? (
        <div className="grid min-h-[45vh] place-items-center text-sm text-[#7a849a]">
          Loading application…
        </div>
      ) : error && !application ? (
        <section className="rounded-2xl border border-[#e1e3ed] bg-white p-8 text-center">
          <CircleAlert className="mx-auto text-[#c44759]" />
          <h1 className="mt-3 text-lg font-bold text-[#20283a]">
            Application unavailable
          </h1>
          <p className="mt-1 text-sm text-[#7a849a]">{error}</p>
          <button
            type="button"
            onClick={() => navigate("/candidate/applications")}
            className="mt-4 text-sm font-semibold text-[#5046e5]"
          >
            Return to applications
          </button>
        </section>
      ) : (
        application && (
          <>
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-[#f1d1d7] bg-white px-4 py-3 text-sm text-[#ad3a51]"
              >
                {error}
              </div>
            )}
            <section className="flex flex-col justify-between gap-5 rounded-2xl border border-[#e1e3ed] bg-white p-5 sm:flex-row sm:items-start sm:p-7">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold text-[#20283a]">
                    Application Details
                  </h1>
                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-bold ${statusStyle(application.status)}`}
                  >
                    {pretty(application.status)}
                  </span>
                </div>
                <h2 className="mt-4 text-lg font-bold text-[#34405b]">
                  {job?.title || "Job posting"}
                  <span className="font-medium">
                    {" "}
                    at {job?.companyName || "Company details unavailable"}
                  </span>
                </h2>
                <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#59647d]">
                  {job?.location && (
                    <>
                      <MapPin size={15} />
                      {job.location}
                      <span className="mx-1">·</span>
                    </>
                  )}
                  {job
                    ? `${pretty(job.workMode)} · ${pretty(job.employmentType)}`
                    : "Job details are no longer available"}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-lg border border-[#dce1ed] bg-[#f8f9fc] px-3 py-2 text-xs text-[#59647d]">
                    Applied: {dateLabel(application.submittedAt)}
                  </span>
                  <span
                    className={`rounded-lg border border-[#dce1ed] bg-[#f8f9fc] px-3 py-2 text-xs ${statusStyle(application.status)}`}
                  >
                    Status: {pretty(application.status)}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                {job && (
                  <button
                    type="button"
                    onClick={() => navigate(`/candidate/jobs/${job._id}`)}
                    className="rounded-lg border border-[#5046e5] px-4 py-2.5 text-sm font-semibold text-[#5046e5] hover:bg-[#f7f6ff]"
                  >
                    View job
                  </button>
                )}
                {canWithdraw && (
                  <button
                    type="button"
                    onClick={() => setConfirmWithdraw(true)}
                    className="rounded-lg px-4 py-2.5 text-sm font-semibold text-[#bc343e] hover:bg-[#fff3f3]"
                  >
                    Withdraw application
                  </button>
                )}
              </div>
            </section>
            <section className="rounded-2xl border border-[#e1e3ed] bg-white p-5 sm:p-7">
              <h2 className="text-lg font-bold text-[#20283a]">
                Application progress
              </h2>
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {["Submitted", "Under review", "Shortlisted", "Decision"].map(
                  (label, index) => {
                    const currentIndex =
                      application.status === "submitted"
                        ? 0
                        : application.status === "under_review"
                          ? 1
                          : application.status === "shortlisted"
                            ? 2
                            : 3;
                    const done =
                      index < currentIndex ||
                      (application.status === "shortlisted" && index === 2);
                    const active =
                      index === currentIndex &&
                      !["rejected", "withdrawn"].includes(application.status);
                    return (
                      <div key={label} className="relative">
                        <div
                          className={`grid h-9 w-9 place-items-center rounded-full ${done ? "bg-[#5046e5] text-white" : active ? "border-2 border-[#5046e5] text-[#5046e5]" : "border-2 border-[#e1e3ed] text-[#a1a8b7]"}`}
                        >
                          {done ? <Check size={16} /> : index + 1}
                        </div>
                        <p
                          className={`mt-2 text-xs font-semibold ${active || done ? "text-[#5046e5]" : "text-[#8992a5]"}`}
                        >
                          {application.status === "rejected" && index === 3
                            ? "Not selected"
                            : application.status === "withdrawn" && index === 3
                              ? "Withdrawn"
                              : label}
                        </p>
                        {index === 0 && (
                          <p className="mt-1 text-[10px] text-[#8992a5]">
                            {dateLabel(application.submittedAt)}
                          </p>
                        )}
                      </div>
                    );
                  },
                )}
              </div>
            </section>
            <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,.7fr)]">
              <section className="rounded-2xl border border-[#e1e3ed] bg-white p-5 sm:p-7">
                <h2 className="text-lg font-bold text-[#20283a]">
                  Submitted materials
                </h2>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#e1e3ed] p-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#fff0f0] text-[#c44747]">
                      <FileText size={21} />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-[#26344c]">
                        {application.resume.fileName}
                      </p>
                      <p className="mt-1 text-xs text-[#7a849a]">
                        Resume attached to this application
                      </p>
                    </div>
                  </div>
                  {application.resume.downloadUrl && (
                    <a
                      href={application.resume.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5046e5] hover:underline"
                    >
                      <Download size={16} />
                      Download
                    </a>
                  )}
                </div>
                <div className="mt-5 border-t border-[#e9eaf1] pt-5">
                  <h3 className="text-sm font-bold text-[#26344c]">
                    Cover letter
                  </h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#59647d]">
                    {application.coverLetter ||
                      "No cover letter was submitted."}
                  </p>
                </div>
              </section>
              <aside className="space-y-4">
                <section className="rounded-2xl border border-[#d8d4ff] bg-[#f3f1ff] p-5">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={18} className="text-[#5046e5]" />
                    <h2 className="text-sm font-bold text-[#26344c]">
                      Application status
                    </h2>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#59647d]">
                    {application.status === "submitted"
                      ? "Your application has been sent to the hiring team."
                      : application.status === "under_review"
                        ? "The hiring team is reviewing your application."
                        : application.status === "shortlisted"
                          ? "You have been shortlisted. Watch for updates from the hiring team."
                          : application.status === "rejected"
                            ? "This application is closed."
                            : "You withdrew this application."}
                  </p>
                  <p className="mt-3 text-xs text-[#7a849a]">
                    Submitted {dateLabel(application.submittedAt)}
                  </p>
                </section>
                <section className="rounded-2xl border border-[#e1e3ed] bg-white p-5">
                  <h2 className="text-sm font-bold text-[#26344c]">
                    Candidate details
                  </h2>
                  <p className="mt-3 text-sm font-semibold text-[#34405b]">
                    {application.candidate.fullName}
                  </p>
                  <p className="mt-1 text-xs text-[#7a849a]">
                    {application.candidate.email}
                  </p>
                  {application.candidate.phone && (
                    <p className="mt-1 text-xs text-[#7a849a]">
                      {application.candidate.phone}
                    </p>
                  )}
                </section>
              </aside>
            </div>
          </>
        )
      )}
      {confirmWithdraw && application && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-[#182239]/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !withdrawing)
              setConfirmWithdraw(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="withdraw-title"
            className="relative w-full max-w-lg rounded-2xl border border-[#e5e7f0] bg-white p-6 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setConfirmWithdraw(false)}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-lg p-2 text-[#7a849a] hover:bg-[#f3f4f7]"
            >
              <X size={18} />
            </button>
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-[#f2c1c1] bg-[#fff2f2] text-[#bc343e]">
              <CircleAlert size={27} />
            </span>
            <h2
              id="withdraw-title"
              className="mt-4 text-center text-xl font-bold text-[#20283a]"
            >
              Withdraw application?
            </h2>
            <p className="mt-2 text-center text-sm leading-6 text-[#59647d]">
              Are you sure you want to withdraw your application for{" "}
              <strong>{job?.title || "this position"}</strong>? The hiring team
              will no longer consider it.
            </p>
            <div className="mt-5 rounded-xl border border-[#e1e3ed] bg-[#f8f9fc] p-4">
              <p className="text-sm font-bold text-[#26344c]">
                {job?.title || "Job posting"}
              </p>
              <p className="mt-1 text-xs text-[#7a849a]">
                {job?.companyName || "Company details unavailable"} ·{" "}
                {pretty(application.status)}
              </p>
            </div>
            {error && (
              <p role="alert" className="mt-3 text-xs text-[#bc343e]">
                {error}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                disabled={withdrawing}
                onClick={() => setConfirmWithdraw(false)}
                className="rounded-lg border border-[#dce1ed] px-4 py-2.5 text-sm font-semibold text-[#59647d]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={withdrawing}
                onClick={() => void withdraw()}
                className="rounded-lg bg-[#bc252f] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {withdrawing ? "Withdrawing…" : "Withdraw application"}
              </button>
            </div>
          </section>
        </div>
      )}
      {toast && (
        <div
          role="status"
          className="fixed right-5 top-24 z-[80] flex items-center gap-2 rounded-xl border border-[#bee8d2] bg-white px-4 py-3 text-sm font-semibold text-[#168254] shadow-lg"
        >
          <Check size={16} />
          {toast}
        </div>
      )}
    </CandidatePageLayout>
  );
}
