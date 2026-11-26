import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { isAxiosError } from "axios";
import {
  BadgeCheck,
  Check,
  CircleAlert,
  Clock3,
  ExternalLink,
  FileText,
  ShieldCheck,
  Trash2,
  UploadCloud,
} from "lucide-react";
import {
  recruiterProfileApi,
  type RecruiterProfile,
  type RecruiterVerification as VerificationRequest,
} from "../../../api/recruiter-profile.api";
import { RecruiterModuleLayout } from "../components/RecruiterModuleLayout";

type Props = { historyOnly?: boolean };
function apiError(error: unknown, fallback: string) {
  return isAxiosError<{ message?: string }>(error)
    ? error.response?.data?.message || fallback
    : fallback;
}
function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
}
function statusTone(status: string) {
  return status === "approved" || status === "verified"
    ? "bg-[#DDF3F0] text-[#006B63]"
    : status === "rejected"
      ? "bg-[#FFF0F0] text-[#C34250]"
      : "bg-[#FFF7E8] text-[#9A6816]";
}

export default function RecruiterVerificationPage({
  historyOnly = false,
}: Props) {
  const [profile, setProfile] = useState<RecruiterProfile | null>(null);
  const [history, setHistory] = useState<VerificationRequest[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3200);
  };
  const sortedHistory = useMemo(
    () =>
      [...history].sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
      ),
    [history],
  );
  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );
  useEffect(() => {
    let active = true;
    Promise.all([
      recruiterProfileApi.getProfile(),
      recruiterProfileApi.getVerificationHistory(),
    ])
      .then(([recruiter, requests]) => {
        if (active) {
          setProfile(recruiter);
          setHistory(requests);
        }
      })
      .catch((cause: unknown) => {
        if (active)
          setError(
            apiError(
              cause,
              "Could not load recruiter verification information.",
            ),
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const addFiles = (incoming: FileList | File[]) => {
    setError("");
    const next = Array.from(incoming);
    if (!next.length) return;
    if (files.length + next.length > 5) {
      setError("Upload no more than five verification documents.");
      return;
    }
    const allowed = new Set(["application/pdf", "image/jpeg", "image/png"]);
    const invalid = next.find((file) => !allowed.has(file.type));
    if (invalid) {
      setError(
        `${invalid.name} is not a supported file. Choose PDF, JPEG, or PNG.`,
      );
      return;
    }
    const tooLarge = next.find((file) => file.size > 10 * 1024 * 1024);
    if (tooLarge) {
      setError(`${tooLarge.name} exceeds the 10 MB limit.`);
      return;
    }
    setFiles((current) => [...current, ...next]);
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!files.length) {
      setError("Add at least one supporting document.");
      return;
    }
    setSubmitting(true);
    setError("");
    setToast("");
    try {
      const request = await recruiterProfileApi.submitVerification(files);
      setHistory((current) => [
        request,
        ...current.filter((item) => item._id !== request._id),
      ]);
      setProfile((current) =>
        current ? { ...current, verificationStatus: "pending" } : current,
      );
      setFiles([]);
      showToast("Verification submitted for review.");
    } catch (cause: unknown) {
      setError(apiError(cause, "Could not submit verification documents."));
    } finally {
      setSubmitting(false);
    }
  };

  const status = profile?.verificationStatus || "pending";
  const pendingRequest = sortedHistory.find(
    (item) => item.status === "pending" && item.documents.length > 0,
  );
  return (
    <RecruiterModuleLayout
      title={historyOnly ? "Verification History" : "Recruiter Verification"}
      context="Recruitment Hub / Trust & Safety"
      activePage={historyOnly ? "Verification History" : "Verification"}
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
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-[#F0D5D8] bg-[#FFF5F5] px-4 py-3 text-sm text-[#B13D49]"
        >
          {error}
        </div>
      )}
      <section className="flex flex-col justify-between gap-4 rounded-xl border border-[#E8ECF5] bg-white p-5 sm:flex-row sm:items-center sm:p-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.15em] text-[#8A999D]">
            Recruiter trust &amp; safety
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#102039]">
            {historyOnly ? "Verification history" : "Recruiter verification"}
          </h1>
          <p className="mt-1 text-sm text-[#6C7A7E]">
            Submit business evidence and follow the review status for your
            recruiter account.
          </p>
        </div>
        {profile && (
          <span
            className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold capitalize ${statusTone(status)}`}
          >
            {status === "verified" ? (
              <BadgeCheck size={14} />
            ) : status === "rejected" ? (
              <CircleAlert size={14} />
            ) : (
              <Clock3 size={14} />
            )}
            Recruiter {status}
          </span>
        )}
      </section>
      {loading ? (
        <section className="rounded-xl border border-[#EDF0F5] bg-white p-8 text-sm text-[#7A858F]">
          Loading verification information…
        </section>
      ) : (
        <div
          className={`grid items-start gap-5 ${historyOnly ? "" : "xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,.8fr)]"}`}
        >
          {!historyOnly && (
            <div className="space-y-5">
              <section className="rounded-xl border border-[#D6EDE9] bg-[#F2FAF8] p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white text-[#006B63]">
                    <ShieldCheck size={20} />
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-[#102039]">
                      Why verify your recruiter account?
                    </h2>
                    <p className="mt-1 text-xs leading-5 text-[#607377]">
                      Verification helps confirm your association with the
                      company and supports candidate trust in your job postings.
                    </p>
                  </div>
                </div>
              </section>
              {status === "verified" ? (
                <section className="rounded-xl border border-[#BFE9E5] bg-white p-6">
                  <div className="flex items-center gap-3 text-[#006B63]">
                    <BadgeCheck size={22} />
                    <h2 className="text-base font-bold">
                      Your recruiter account is verified
                    </h2>
                  </div>
                  <p className="mt-2 text-sm text-[#6C7A7E]">
                    No additional documents are needed right now.
                  </p>
                </section>
              ) : pendingRequest ? (
                <section className="rounded-xl border border-[#F0DFBC] bg-[#FFFCF4] p-6">
                  <div className="flex items-center gap-3 text-[#9A6816]">
                    <Clock3 size={21} />
                    <h2 className="text-sm font-bold">
                      Documents are under review
                    </h2>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[#7C725D]">
                    Your request submitted{" "}
                    {formatDate(pendingRequest.submittedAt)} is pending. You can
                    follow its progress in the history panel.
                  </p>
                </section>
              ) : (
                <form
                  onSubmit={submit}
                  className="rounded-xl border border-[#EDF0F5] bg-white p-5 sm:p-6"
                >
                  <div className="mb-5">
                    <h2 className="text-sm font-bold text-[#102039]">
                      Submit verification documents
                    </h2>
                    <p className="mt-1 text-xs text-[#849094]">
                      Upload one to five supporting documents. PDF, JPEG, and
                      PNG are accepted, up to 10 MB each.
                    </p>
                  </div>
                  <div
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(event) => {
                      event.preventDefault();
                      setDragging(false);
                      addFiles(event.dataTransfer.files);
                    }}
                    className={`rounded-xl border-2 border-dashed p-7 text-center transition ${dragging ? "border-[#006B63] bg-[#EDF8F6]" : "border-[#D7E1E5] bg-[#FBFCFE] hover:border-[#91C8C2]"}`}
                  >
                    <UploadCloud size={28} className="mx-auto text-[#006B63]" />
                    <p className="mt-3 text-sm font-bold text-[#102039]">
                      Drop evidence files here
                    </p>
                    <p className="mt-1 text-xs text-[#7A858F]">
                      or select files from your device
                    </p>
                    <label className="mt-4 inline-flex cursor-pointer rounded-lg border border-[#B8DAD6] bg-white px-4 py-2 text-xs font-bold text-[#006B63] hover:bg-[#F0F8F7]">
                      Browse files
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                        className="sr-only"
                        onChange={(event) => {
                          if (event.target.files) addFiles(event.target.files);
                          event.currentTarget.value = "";
                        }}
                      />
                    </label>
                  </div>
                  {files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {files.map((file, index) => (
                        <div
                          key={`${file.name}-${file.lastModified}`}
                          className="flex items-center gap-3 rounded-lg border border-[#E8ECF5] px-3 py-2.5"
                        >
                          <FileText
                            size={16}
                            className="shrink-0 text-[#006B63]"
                          />
                          <span className="min-w-0 flex-1 truncate text-xs font-semibold text-[#46545A]">
                            {file.name}
                          </span>
                          <span className="text-[10px] text-[#849094]">
                            {(file.size / 1024 / 1024).toFixed(1)} MB
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setFiles((current) =>
                                current.filter(
                                  (_, fileIndex) => fileIndex !== index,
                                ),
                              )
                            }
                            aria-label={`Remove ${file.name}`}
                            className="rounded-md p-1 text-[#889499] hover:bg-[#FFF0F0] hover:text-[#C34250]"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-5 flex justify-end">
                    <button
                      disabled={submitting || files.length === 0}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#006B63] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#00564F] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitting ? "Submitting…" : "Submit for verification"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
          <section className="rounded-xl border border-[#EDF0F5] bg-white p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-[#102039]">
                  {historyOnly ? "All submissions" : "Submission history"}
                </h2>
                <p className="mt-1 text-[11px] text-[#849094]">
                  Status and reviewer notes from previous requests.
                </p>
              </div>
              {!historyOnly && (
                <a
                  href="/recruiter/verification/history"
                  className="text-[11px] font-bold text-[#006B63] hover:underline"
                >
                  View all
                </a>
              )}
            </div>
            {sortedHistory.length === 0 ? (
              <div className="rounded-lg bg-[#F7F9FC] p-5 text-center">
                <FileText size={22} className="mx-auto text-[#9AA6AC]" />
                <p className="mt-2 text-xs font-semibold text-[#52606B]">
                  No submissions yet
                </p>
                <p className="mt-1 text-[11px] text-[#89969B]">
                  Your verification requests will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {(historyOnly ? sortedHistory : sortedHistory.slice(0, 3)).map(
                  (item) => (
                    <article
                      key={item._id}
                      className="rounded-lg border border-[#E8ECF5] p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold text-[#102039]">
                            Verification request
                          </p>
                          <p className="mt-1 text-[10px] text-[#849094]">
                            Submitted {formatDate(item.submittedAt)}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${statusTone(item.status)}`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-[#6C7A7E]">
                        <span className="rounded bg-[#F0F5FF] px-2 py-1 capitalize">
                          {item.priority} priority
                        </span>
                        <span>
                          {item.documents.length} document
                          {item.documents.length === 1 ? "" : "s"}
                        </span>
                        {item.reviewedAt && (
                          <span>Reviewed {formatDate(item.reviewedAt)}</span>
                        )}
                      </div>
                      {item.adminNotes && (
                        <p className="mt-3 rounded-lg bg-[#F7F9FC] p-3 text-xs leading-5 text-[#52606B]">
                          <strong>Reviewer note:</strong> {item.adminNotes}
                        </p>
                      )}
                      {item.documents.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.documents.map((url, index) => (
                            <a
                              key={`${item._id}-${index}`}
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-md border border-[#E4EAF3] px-2.5 py-1.5 text-[10px] font-semibold text-[#006B63] hover:bg-[#F0F8F7]"
                            >
                              Evidence {index + 1}
                              <ExternalLink size={11} />
                            </a>
                          ))}
                        </div>
                      )}
                    </article>
                  ),
                )}
              </div>
            )}
          </section>
        </div>
      )}
    </RecruiterModuleLayout>
  );
}
