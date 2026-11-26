import { useEffect, useRef, useState, type FormEvent } from "react";
import { isAxiosError } from "axios";
import {
  BadgeCheck,
  Building2,
  Check,
  ExternalLink,
  Globe2,
  MapPin,
  Pencil,
  ShieldCheck,
} from "lucide-react";
import {
  recruiterProfileApi,
  type RecruiterCompany as RecruiterCompanyData,
} from "../../../api/recruiter-profile.api";
import { RecruiterModuleLayout } from "../components/RecruiterModuleLayout";

const fieldClass =
  "mt-1.5 w-full rounded-lg border border-[#E4EAF3] bg-white px-3.5 py-3 text-sm text-[#102039] outline-none transition placeholder:text-[#A2ACB2] focus:border-[#006B63] focus:ring-2 focus:ring-[#006B63]/10";
function apiError(error: unknown, fallback: string) {
  return isAxiosError<{ message?: string }>(error)
    ? error.response?.data?.message || fallback
    : fallback;
}
function statePill(value: string) {
  return value === "active" || value === "verified"
    ? "bg-[#DDF3F0] text-[#006B63]"
    : value === "suspended" || value === "rejected"
      ? "bg-[#FFF0F0] text-[#C34250]"
      : "bg-[#FFF7E8] text-[#9A6816]";
}

export default function RecruiterCompanyPage() {
  const [company, setCompany] = useState<RecruiterCompanyData | null>(null);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
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
  useEffect(() => {
    let active = true;
    recruiterProfileApi
      .getCompany()
      .then((data) => {
        if (active) {
          setCompany(data);
          setName(data.name);
          setLocation(data.location);
          setWebsite(data.website);
        }
      })
      .catch((cause: unknown) => {
        if (active)
          setError(apiError(cause, "Could not load company details."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setToast("");
    try {
      const updated = await recruiterProfileApi.updateCompany({
        name: name.trim(),
        location: location.trim(),
        ...(website.trim() ? { website: website.trim() } : {}),
      });
      setCompany(updated);
      setName(updated.name);
      setLocation(updated.location);
      setWebsite(updated.website);
      showToast("Company details saved.");
    } catch (cause: unknown) {
      setError(apiError(cause, "Could not save company details."));
    } finally {
      setSaving(false);
    }
  };
  return (
    <RecruiterModuleLayout
      title="Company Management"
      context="Recruitment Hub / Company"
      activePage="Company"
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
            Organization settings
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#102039]">
            Company
          </h1>
          <p className="mt-1 text-sm text-[#6C7A7E]">
            Manage the public company details associated with your recruiter
            account.
          </p>
        </div>
        {company && (
          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-full px-3 py-1.5 text-[11px] font-bold capitalize ${statePill(company.status)}`}
            >
              Account {company.status}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold capitalize ${statePill(company.verificationStatus)}`}
            >
              {company.verificationStatus === "verified" && (
                <BadgeCheck size={13} />
              )}
              Company {company.verificationStatus}
            </span>
          </div>
        )}
      </section>
      {loading ? (
        <section className="rounded-xl border border-[#EDF0F5] bg-white p-8 text-sm text-[#7A858F]">
          Loading company details…
        </section>
      ) : (
        company && (
          <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(270px,.8fr)]">
            <form
              onSubmit={save}
              className="rounded-xl border border-[#EDF0F5] bg-white p-5 sm:p-6"
            >
              <div className="mb-5 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#DDF3F0] text-[#006B63]">
                  <Building2 size={20} />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-[#102039]">
                    Company information
                  </h2>
                  <p className="mt-0.5 text-[11px] text-[#849094]">
                    These details are shared with candidates on your job
                    listings.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <label className="block text-xs font-semibold text-[#52606B]">
                  Company name
                  <input
                    required
                    minLength={2}
                    maxLength={160}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Company name"
                    className={fieldClass}
                  />
                </label>
                <label className="block text-xs font-semibold text-[#52606B]">
                  Location
                  <input
                    required
                    minLength={2}
                    maxLength={200}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, region, country"
                    className={fieldClass}
                  />
                </label>
                <label className="block text-xs font-semibold text-[#52606B]">
                  Company website
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://example.com"
                    className={fieldClass}
                  />
                </label>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#006B63] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#00564F] disabled:opacity-60"
                >
                  <Pencil size={15} />
                  {saving ? "Saving…" : "Save company"}
                </button>
              </div>
            </form>
            <aside className="space-y-4">
              <section className="rounded-xl border border-[#EDF0F5] bg-white p-5">
                <h2 className="text-sm font-bold text-[#102039]">
                  Company preview
                </h2>
                <div className="mt-4 flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#E8F5F3] text-[#006B63]">
                    <Building2 size={21} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[#102039]">
                      {name || company.name}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-[#6C7A7E]">
                      <MapPin size={13} />
                      {location || company.location}
                    </p>
                    <a
                      href={website || company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex max-w-full items-center gap-1.5 truncate text-xs font-semibold text-[#006B63] hover:underline"
                    >
                      <Globe2 size={13} />
                      <span className="truncate">
                        {website || company.website}
                      </span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </section>
              <section className="rounded-xl border border-[#D6EDE9] bg-[#F2FAF8] p-5">
                <div className="flex items-center gap-2 text-[#006B63]">
                  <ShieldCheck size={18} />
                  <h2 className="text-sm font-bold">Company verification</h2>
                </div>
                <p className="mt-2 text-xs leading-5 text-[#607377]">
                  Company verification status is managed through the platform
                  review process.
                </p>
                {company.verificationReason && (
                  <p className="mt-3 rounded-lg border border-[#F0D5D8] bg-white px-3 py-2.5 text-xs leading-5 text-[#9C424B]">
                    <strong>Review note:</strong> {company.verificationReason}
                  </p>
                )}
                <p className="mt-3 text-[11px] text-[#738388]">
                  Updated {new Date(company.updatedAt).toLocaleDateString()}
                </p>
              </section>
            </aside>
          </div>
        )
      )}
    </RecruiterModuleLayout>
  );
}
