import { useEffect, useRef, useState, type FormEvent } from "react";
import { isAxiosError } from "axios";
import {
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  Check,
  CircleUserRound,
  Clock3,
  ExternalLink,
  FileText,
  MapPin,
  Globe2,
  ShieldCheck,
} from "lucide-react";
import {
  recruiterProfileApi,
  type RecruiterCompany,
  type RecruiterProfile as RecruiterProfileData,
  type RecruiterVerification,
} from "../../../api/recruiter-profile.api";
import { RecruiterModuleLayout } from "../components/RecruiterModuleLayout";

const fieldClass =
  "mt-1.5 w-full rounded-lg border border-[#E4EAF3] bg-white px-3.5 py-3 text-sm text-[#102039] outline-none transition placeholder:text-[#A2ACB2] focus:border-[#006B63] focus:ring-2 focus:ring-[#006B63]/10";
function statusClass(status: string) {
  return status === "verified" || status === "active"
    ? "bg-[#DDF3F0] text-[#006B63]"
    : status === "rejected" || status === "suspended"
      ? "bg-[#FFF0F0] text-[#C34250]"
      : "bg-[#FFF7E8] text-[#9A6816]";
}
function apiError(error: unknown, fallback: string) {
  return isAxiosError<{ message?: string }>(error)
    ? error.response?.data?.message || fallback
    : fallback;
}

export default function RecruiterProfilePage() {
  const [profile, setProfile] = useState<RecruiterProfileData | null>(null);
  const [fullName, setFullName] = useState("");
  const [designation, setDesignation] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3200);
  };
  const [verificationHistory, setVerificationHistory] = useState<RecruiterVerification[]>([]);
  const [historyError, setHistoryError] = useState("");
  const [company, setCompany] = useState<RecruiterCompany | null>(null);
  const [companyError, setCompanyError] = useState("");
  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );
  useEffect(() => {
    let active = true;
    recruiterProfileApi
      .getProfile()
      .then((data) => {
        if (active) {
          setProfile(data);
          setFullName(data.fullName);
          setDesignation(data.designation);
        }
      })
      .catch((cause: unknown) => {
        if (active)
          setError(apiError(cause, "Could not load your recruiter profile."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    recruiterProfileApi
      .getVerificationHistory()
      .then((items) => { if (active) setVerificationHistory(items); })
      .catch((cause: unknown) => { if (active) setHistoryError(apiError(cause, "Could not load verification history.")); });
    recruiterProfileApi
      .getCompany()
      .then((data) => { if (active) setCompany(data); })
      .catch((cause: unknown) => { if (active) setCompanyError(apiError(cause, "Could not load company details.")); });
    return () => {
      active = false;
    };
  }, []);
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setToast("");
    try {
      const updated = await recruiterProfileApi.updateProfile({
        fullName: fullName.trim(),
        designation: designation.trim(),
      });
      setProfile(updated);
      showToast("Recruiter profile saved.");
    } catch (cause: unknown) {
      setError(apiError(cause, "Could not save your profile."));
    } finally {
      setSaving(false);
    }
  };
  const status = profile?.verificationStatus || "pending";
  return (
    <RecruiterModuleLayout
      title="Recruiter Profile"
      context="Recruitment Hub / Profile"
      activePage="Profile"
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
            Your recruiter account
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#102039]">
            Profile
          </h1>
          <p className="mt-1 text-sm text-[#6C7A7E]">
            Keep your recruiter details current for your company and candidates.
          </p>
        </div>
        <span
          className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold capitalize ${statusClass(status)}`}
        >
          {status === "verified" ? (
            <BadgeCheck size={14} />
          ) : (
            <Clock3 size={14} />
          )}{" "}
          {status}
        </span>
      </section>
      {loading ? (
        <section className="rounded-xl border border-[#EDF0F5] bg-white p-8 text-sm text-[#7A858F]">
          Loading recruiter profile…
        </section>
      ) : (
        profile && (
          <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(270px,.8fr)]">
            <div className="space-y-5">
            <form
              onSubmit={save}
              className="rounded-xl border border-[#EDF0F5] bg-white p-5 sm:p-6"
            >
              <div className="mb-5 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#DDF3F0] text-[#006B63]">
                  <CircleUserRound size={20} />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-[#102039]">
                    Personal details
                  </h2>
                  <p className="mt-0.5 text-[11px] text-[#849094]">
                    These details identify you as a recruiter.
                  </p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-xs font-semibold text-[#52606B]">
                  Full name
                  <input
                    required
                    minLength={2}
                    maxLength={120}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    className={fieldClass}
                  />
                </label>
                <label className="text-xs font-semibold text-[#52606B]">
                  Job title / designation
                  <input
                    required
                    minLength={2}
                    maxLength={120}
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Talent Acquisition Lead"
                    className={fieldClass}
                  />
                </label>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  disabled={saving}
                  className="rounded-lg bg-[#006B63] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#00564F] disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save profile"}
                </button>
              </div>
            </form>
            <section className="rounded-xl border border-[#EDF0F5] bg-white p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-lg bg-[#DDF3F0] text-[#006B63]"><Building2 size={18}/></span><div><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#8A999D]">Linked organization</p><h2 className="mt-0.5 text-sm font-bold text-[#102039]">Company details</h2></div></div>
                <a href="/recruiter/company" className="text-[11px] font-bold text-[#006B63] hover:underline">Manage company</a>
              </div>
              {companyError ? <p className="mt-4 text-xs text-[#B13D49]">{companyError}</p> : company ? <div className="mt-4 grid gap-4 sm:grid-cols-2"><div><p className="text-[10px] font-semibold uppercase tracking-wide text-[#89969B]">Company</p><p className="mt-1 text-sm font-bold text-[#102039]">{company.name}</p></div><div><p className="text-[10px] font-semibold uppercase tracking-wide text-[#89969B]">Location</p><p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-[#52606B]"><MapPin size={14} className="text-[#006B63]"/>{company.location}</p></div><div><p className="text-[10px] font-semibold uppercase tracking-wide text-[#89969B]">Website</p>{company.website?<a href={company.website} target="_blank" rel="noreferrer" className="mt-1 inline-flex max-w-full items-center gap-1.5 truncate text-sm font-medium text-[#006B63] hover:underline"><Globe2 size={14}/><span className="truncate">{company.website}</span><ExternalLink size={12}/></a>:<p className="mt-1 text-sm text-[#849094]">Not added</p>}</div><div><p className="text-[10px] font-semibold uppercase tracking-wide text-[#89969B]">Company status</p><div className="mt-1.5 flex flex-wrap gap-2"><span className={`rounded-full px-2.5 py-1 text-[9px] font-bold capitalize ${statusClass(company.status)}`}>Account {company.status}</span><span className={`rounded-full px-2.5 py-1 text-[9px] font-bold capitalize ${statusClass(company.verificationStatus)}`}>Verification {company.verificationStatus}</span></div></div></div> : <p className="mt-3 text-xs text-[#849094]">Loading company summary…</p>}
            </section>
            </div>
            <aside className="space-y-4">
              <section className="rounded-xl border border-[#D6EDE9] bg-[#F2FAF8] p-5">
                <div className="flex items-center gap-2 text-[#006B63]">
                  <ShieldCheck size={18} />
                  <h2 className="text-sm font-bold">Verification status</h2>
                </div>
                <p className="mt-2 text-xs leading-5 text-[#607377]">
                  {status === "verified"
                    ? "Your recruiter profile is verified."
                    : status === "rejected"
                      ? "Your verification was declined. Review the notes below and submit updated evidence."
                      : "Submit supporting documents so your recruiter account can be reviewed."}
                </p>
                <a
                  href="/recruiter/verification"
                  className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#006B63] hover:underline"
                >
                  {status === "verified" ? "View verification" : "Submit documents"} <BriefcaseBusiness size={14} />
                </a>
                <a href="/recruiter/verification/history" className="ml-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#006B63] hover:underline">Full history <ExternalLink size={13}/></a>
              </section>
              <section className="rounded-xl border border-[#EDF0F5] bg-white p-5">
                <div className="flex items-center justify-between gap-2"><div><h2 className="text-sm font-bold text-[#102039]">Verification history</h2><p className="mt-0.5 text-[10px] text-[#849094]">Recent requests and reviewer updates</p></div><FileText size={17} className="text-[#006B63]"/></div>
                {historyError ? <p className="mt-3 text-xs text-[#B13D49]">{historyError}</p> : verificationHistory.length === 0 ? <p className="mt-3 rounded-lg bg-[#F7F9FC] p-3 text-xs text-[#849094]">No verification requests submitted yet.</p> : <div className="mt-3 space-y-2.5">{[...verificationHistory].sort((a,b)=>new Date(b.submittedAt).getTime()-new Date(a.submittedAt).getTime()).slice(0,2).map((item)=><div key={item._id} className="rounded-lg border border-[#E8ECF5] p-3"><div className="flex items-center justify-between gap-2"><span className="text-[11px] font-semibold text-[#46545A]">{new Date(item.submittedAt).toLocaleDateString()}</span><span className={`rounded-full px-2 py-1 text-[9px] font-bold capitalize ${statusClass(item.status)}`}>{item.status}</span></div>{item.adminNotes&&<p className="mt-2 text-[10px] leading-4 text-[#6C7A7E]">{item.adminNotes}</p>}<div className="mt-2 flex flex-wrap gap-2">{item.documents.slice(0,2).map((url,index)=><a key={`${item._id}-${index}`} href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[9px] font-semibold text-[#006B63] hover:underline">Evidence {index+1}<ExternalLink size={10}/></a>)}</div></div>)}</div>}
                <a href="/recruiter/verification/history" className="mt-3 inline-flex text-[11px] font-bold text-[#006B63] hover:underline">View complete history <ExternalLink size={12} className="ml-1"/></a>
              </section>
            </aside>
          </div>
        )
      )}
    </RecruiterModuleLayout>
  );
}
