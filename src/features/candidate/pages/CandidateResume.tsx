import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import {
  Bell,
  Check,
  ChevronRight,
  CircleAlert,
  Clock3,
  Download,
  FileCheck2,
  FileText,
  Lightbulb,
  Link2,
  LogOut,
  Mail,
  Search,
  Settings,
  Sparkles,
  Trash2,
  UploadCloud,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import { logout } from "../../../api/auth.api";
import {
  candidateProfileApi,
  type CandidateResume,
} from "../../../api/candidate-profile.api";
import { CandidateSidebar } from "../components/CandidateSidebar";
import { Navbar } from "../../../components/common/Navbar";
import useAuthStore from "../../../store/auth.store";

type Resume = CandidateResume;
const inputClass =
  "h-[43px] w-full rounded-lg border border-[#dce1ed] bg-white pl-10 pr-4 text-[13px] text-[#26344c] outline-none transition placeholder:text-[#929cb0] focus:border-[#5046e5] focus:ring-4 focus:ring-[#5046e5]/[0.08]";
function formatBytes(bytes: number) {
  if (!bytes) return "File size unavailable";
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
function formatDate(date: string) {
  const value = new Date(date);
  return Number.isNaN(value.getTime())
    ? "Date unavailable"
    : value.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
}
const parsingLabels = {
  pending: "Waiting to process",
  processing: "Processing resume",
  completed: "Parsing complete",
  failed: "Parsing could not complete",
};
function apiErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError<{ message?: string }>(error)) return error.response?.data?.message || fallback;
  return fallback;
}

export default function CandidateResumePage() {
  const navigate = useNavigate();
  const email = useAuthStore((state) => state.user?.email);
  const logoutUser = useAuthStore((state) => state.logout);
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = (message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3200);
  };
  useEffect(() => {
    let active = true;
    candidateProfileApi.getResume()
      .then((currentResume) => {
        if (active) setResume(currentResume);
      })
      .catch((cause: unknown) => {
        if (active) setError(apiErrorMessage(cause, "Could not load your resume details."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const handleFile = async (file?: File) => {
    if (!file) return;
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (extension !== "pdf" && extension !== "docx") {
      setError("Choose a PDF or DOCX file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Your resume must be 10 MB or smaller.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const profile = await candidateProfileApi.uploadResume(file);
      setResume(profile.resume);
      notify(
        resume
          ? "Resume replaced successfully."
          : "Resume uploaded successfully.",
      );
    } catch (cause: unknown) {
      setError(apiErrorMessage(cause, "Could not upload your resume. Please try again."));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };
  const deleteResume = async () => {
    if (!resume) return;
    setConfirmingDelete(false);
    setError("");
    try {
      await candidateProfileApi.deleteResume();
      setResume(null);
      notify("Resume deleted.");
    } catch (cause: unknown) {
      setError(apiErrorMessage(cause, "Could not delete your resume."));
    }
  };
  const initials = (email || "CA").slice(0, 2).toUpperCase();
  const handleLogout = async () => {
    try {
      await logout();
    } catch (cause) {
      console.error("Logout failed:", cause);
    } finally {
      logoutUser();
      navigate("/login", { replace: true });
    }
  };
  const navTo = (page: string) => {
    setShowProfileMenu(false);
    if (page === "Dashboard") navigate("/candidate/dashboard");
    if (page === "My Profile") navigate("/candidate/profile");
    if (page === "Find Jobs") navigate("/candidate/jobs");
    if (page === "Saved Jobs") navigate("/candidate/jobs/saved");
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-[#1e2433]">
      <CandidateSidebar
        activePage="Resume"
        onNavigate={navTo}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        profile={{
          name: email || "Candidate",
          description: "Candidate account",
          initials,
        }}
        onProfileClick={() => navigate("/candidate/profile")}
      />
      <div className="min-h-screen lg:pl-[250px]">
        <Navbar title="Resume" onMenuClick={() => setSidebarOpen(true)}>
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
              aria-label="Search jobs, companies, or skills"
              className={inputClass}
            />
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-3">
            <div className="relative">
              <button
                type="button"
                aria-label="Notifications"
                onClick={() => {
                  setShowNotifications((value) => !value);
                  setShowProfileMenu(false);
                }}
                className="relative grid h-10 w-10 place-items-center rounded-lg text-[#66718a] transition hover:bg-[#f1f0ff] hover:text-[#5046e5]"
              >
                <Bell size={20} />
                <span className="absolute right-2.5 top-2 h-2 w-2 rounded-full border-2 border-white bg-[#f05269]" />
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-12 z-[70] w-[270px] rounded-xl border border-[#e4e6ef] bg-white p-4 shadow-xl">
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
              className="grid h-10 w-10 place-items-center rounded-lg text-[#66718a] transition hover:bg-[#f1f0ff] hover:text-[#5046e5]"
            >
              <Mail size={20} />
            </button>
            <div className="relative">
              <button
                type="button"
                aria-label="Open account menu"
                onClick={() => {
                  setShowProfileMenu((value) => !value);
                  setShowNotifications(false);
                }}
                className="ml-1 grid h-10 w-10 place-items-center rounded-full border-2 border-[#e5e2ff] bg-gradient-to-br from-[#6155f3] to-[#3930b9] text-[12px] font-bold text-white transition hover:ring-4 hover:ring-[#5046e5]/10"
              >
                {initials}
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 top-12 z-[70] w-48 rounded-xl border border-[#e4e6ef] bg-white p-2 shadow-xl">
                  <button
                    type="button"
                    onClick={() => navTo("My Profile")}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[12px] text-[#59647d] hover:bg-[#f3f2ff]"
                  >
                    <UserRound size={16} />
                    My Profile
                  </button>
                  <button
                    type="button"
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

        <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
          {confirmingDelete ? (
            <div role="alertdialog" aria-label="Confirm resume deletion" className="fixed right-5 top-24 z-[80] w-[calc(100%-2.5rem)] max-w-[360px] rounded-2xl border border-[#f0d5d8] bg-white p-5 shadow-[0_12px_38px_rgba(25,35,65,.2)] sm:right-7">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-50 text-[#bf4654]"><Trash2 size={18}/></span>
                <div><h2 className="text-sm font-bold text-[#292e3b]">Delete this resume?</h2><p className="mt-1 text-xs leading-5 text-[#737c90]">This will remove {resume?.fileName || "your current resume"} from your profile.</p></div>
                <button type="button" aria-label="Close confirmation" onClick={() => setConfirmingDelete(false)} className="ml-auto rounded-md p-1 text-[#9299a9] hover:bg-[#f4f5f8]"><X size={16}/></button>
              </div>
              <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setConfirmingDelete(false)} className="rounded-lg border border-[#e1e3ed] px-3.5 py-2 text-xs font-semibold text-[#555e72] hover:bg-[#f7f8fb]">Keep resume</button><button type="button" onClick={() => void deleteResume()} className="rounded-lg bg-[#c34250] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#a93240]">Delete resume</button></div>
            </div>
          ) : toast && (
            <div
              role="status"
              className="fixed right-5 top-24 z-[80] flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-5 py-3.5 text-sm font-medium text-emerald-800 shadow-[0_12px_38px_rgba(25,35,65,.18)] sm:right-7"
            >
              <Check size={17} className="text-emerald-600" />
              {toast}
            </div>
          )}
          {error && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.15em] text-[#858da0]">
                Candidate documents
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#1e2433]">
                Resume
              </h1>
              <p className="mt-2 text-sm text-[#6c7488]">
                Upload and manage the resume you share with recruiters.
              </p>
            </div>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5147e8] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4037cc] disabled:opacity-60"
            >
              <Upload size={17} />
              {resume ? "Replace resume" : "Upload resume"}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={(event) => void handleFile(event.target.files?.[0])}
            />
          </div>

          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(310px,.8fr)]">
            <div className="space-y-6">
              <section className="relative overflow-hidden rounded-2xl border border-[#cbc9df] bg-white p-5 shadow-sm sm:p-7">
                <div className="absolute inset-x-0 top-0 h-1.5 bg-[#5147e8]" />
                {loading ? (
                  <div className="py-8 text-sm text-[#7a8295]">
                    Loading resume details…
                  </div>
                ) : resume ? (
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl border border-red-100 bg-red-50 text-red-600">
                      <FileText size={34} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="break-all text-lg font-bold text-[#242a39] sm:text-xl">
                          {resume.fileName}
                        </h2>
                        <span className="rounded-full bg-[#efedff] px-2.5 py-1 text-[11px] font-semibold text-[#5147e8]">
                          Current resume
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#69738a]">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 size={14} />
                          Updated {formatDate(resume.uploadedAt)}
                        </span>
                        <span>{formatBytes(resume.fileSize)}</span>
                        <span
                          className={`inline-flex items-center gap-1.5 font-medium ${resume.parsingStatus === "completed" ? "text-[#5147e8]" : resume.parsingStatus === "failed" ? "text-red-600" : "text-[#8a6a16]"}`}
                        >
                          {resume.parsingStatus === "completed" ? (
                            <Check size={14} />
                          ) : (
                            <CircleAlert size={14} />
                          )}
                          {parsingLabels[resume.parsingStatus]}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <a
                        href={resume.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg border border-[#dedfeb] px-3 py-2 text-sm font-semibold text-[#525c73] hover:bg-[#f7f7fb]"
                      >
                        <Download size={15} />
                        Download
                      </a>
                      <button
                        type="button"
                        aria-label="Delete resume"
                        onClick={() => { setToast(""); setConfirmingDelete(true); }}
                        className="grid h-10 w-10 place-items-center rounded-lg border border-[#f0d9dc] text-[#bd4b57] hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-4">
                    <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#f1efff] text-[#5147e8]">
                      <FileCheck2 size={29} />
                    </div>
                    <h2 className="mt-4 text-center text-lg font-bold">
                      No resume uploaded yet
                    </h2>
                    <p className="mx-auto mt-1 max-w-md text-center text-sm text-[#737c90]">
                      Add a current resume so recruiters can review your
                      experience and qualifications.
                    </p>
                  </div>
                )}
              </section>

              <section
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragging(false);
                  void handleFile(event.dataTransfer.files?.[0]);
                }}
                className={`rounded-2xl border-2 border-dashed p-8 text-center transition sm:p-12 ${dragging ? "border-[#5147e8] bg-[#f4f2ff]" : "border-[#c9c8dd] bg-white hover:border-[#938ced]"}`}
              >
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#f0f1f5] text-[#646d84]">
                  <UploadCloud size={29} />
                </div>
                <h2 className="mt-4 text-xl font-bold text-[#252a38]">
                  {uploading
                    ? "Uploading your resume…"
                    : resume
                      ? "Drop a new resume to replace it"
                      : "Drag and drop your resume"}
                </h2>
                <p className="mt-2 text-sm text-[#6f778a]">
                  PDF or DOCX format · Maximum file size 10 MB
                </p>
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => inputRef.current?.click()}
                  className="mt-6 rounded-xl border border-[#c9c8dd] bg-white px-5 py-2.5 text-sm font-semibold text-[#3f4659] hover:border-[#5147e8] hover:text-[#5147e8] disabled:opacity-60"
                >
                  Browse files
                </button>
              </section>
              <section className="rounded-2xl border border-[#e1e3ed] bg-white p-6 shadow-sm sm:p-7">
                <h2 className="text-xl font-bold">Resume details</h2>
                {resume ? (
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-[#858da0]">File name</p>
                      <p className="mt-1 break-all text-sm font-semibold text-[#353c4d]">
                        {resume.fileName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#858da0]">File type</p>
                      <p className="mt-1 text-sm font-semibold text-[#353c4d]">
                        {resume.contentType === "application/pdf"
                          ? "PDF document"
                          : "DOCX document"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#858da0]">File size</p>
                      <p className="mt-1 text-sm font-semibold text-[#353c4d]">
                        {formatBytes(resume.fileSize)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#858da0]">Uploaded</p>
                      <p className="mt-1 text-sm font-semibold text-[#353c4d]">
                        {formatDate(resume.uploadedAt)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-[#777f92]">
                    Resume details will appear here after upload.
                  </p>
                )}
              </section>
            </div>

            <aside className="space-y-6">
              <section className="rounded-2xl border border-[#d7c7fb] bg-gradient-to-br from-[#f2ecff] to-[#f8f7ff] p-6 shadow-sm">
                <div className="flex items-center gap-2 text-[#7139df]">
                  <Sparkles size={21} />
                  <h2 className="text-lg font-bold">Resume checklist</h2>
                </div>
                <p className="mt-2 text-sm leading-6 text-[#697087]">
                  A clear, current resume makes it easier for recruiters to
                  understand your fit.
                </p>
                <div className="mt-5 space-y-4">
                  {[
                    "Keep your resume recent and tailored to the roles you want.",
                    "Use clear section headings and concise descriptions.",
                    "Include measurable outcomes where you can.",
                    "Check that your contact details and links are up to date.",
                  ].map((tip, index) => (
                    <div
                      key={tip}
                      className="flex gap-3 text-sm leading-6 text-[#464d60]"
                    >
                      <span className="mt-0.5 shrink-0 text-[#5147e8]">
                        {index === 0 ? (
                          <Check size={17} />
                        ) : index === 1 ? (
                          <FileText size={17} />
                        ) : index === 2 ? (
                          <CircleAlert size={17} />
                        ) : (
                          <Link2 size={17} />
                        )}
                      </span>
                      {tip}
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-start gap-3 rounded-xl bg-white/80 p-4 text-xs leading-5 text-[#697087]">
                  <Lightbulb
                    size={16}
                    className="mt-0.5 shrink-0 text-[#7b43e5]"
                  />
                  We support PDF and DOCX resumes up to 10 MB. Uploading another
                  file replaces the current resume.
                </div>
              </section>
              <section className="rounded-2xl border border-[#e1e3ed] bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold">How resume parsing works</h2>
                <p className="mt-2 text-sm leading-6 text-[#737c90]">
                  After upload, the system records your resume and reports its
                  parsing status. You can replace or delete the file at any
                  time.
                </p>
                <div className="mt-5 flex items-center gap-3 rounded-xl bg-[#f7f8fb] p-4">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#efedff] text-[#5147e8]">
                    <FileCheck2 size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">
                      {resume
                        ? parsingLabels[resume.parsingStatus]
                        : "Ready for your resume"}
                    </p>
                    <p className="mt-0.5 text-xs text-[#858da0]">
                      {resume
                        ? "Status from your resume record"
                        : "Upload a PDF or DOCX to get started"}
                    </p>
                  </div>
                  <ChevronRight size={16} className="ml-auto text-[#9299a9]" />
                </div>
              </section>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
