import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import {
  Award,
  Bell,
  BriefcaseBusiness,
  Camera,
  Check,
  ChevronRight,
  Code2,
  GraduationCap,
  Languages,
  Link2,
  LogOut,
  Mail,
  MapPin,
  Pencil,
  Plus,
  Sparkles,
  Target,
  Search,
  Settings,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { logout } from "../../../api/auth.api";
import { CandidateSidebar } from "../components/CandidateSidebar";
import { Navbar } from "../../../components/common/Navbar";
import useAuthStore from "../../../store/auth.store";
import {
  candidateProfileApi,
  type CandidateJobPreferences,
  type CandidateProfile,
  type CandidateProfileRecord,
} from "../../../api/candidate-profile.api";

type Kind =
  | "education"
  | "experience"
  | "projects"
  | "certifications"
  | "languages";
type Field = { key: string; label: string; type?: string; wide?: boolean };
type FormValue = string | string[] | boolean | undefined;
type FormValues = Record<string, FormValue>;
type ProfileRecord = Record<string, string | string[] | boolean | undefined>;
const specs: Record<
  Kind,
  {
    title: string;
    icon: typeof Award;
    fields: Field[];
    create: Record<string, unknown>;
  }
> = {
  experience: {
    title: "Experience",
    icon: BriefcaseBusiness,
    fields: [
      { key: "jobTitle", label: "Job title" },
      { key: "companyName", label: "Company" },
      { key: "employmentType", label: "Employment type", type: "employment" },
      { key: "location", label: "Location" },
      { key: "startDate", label: "Start date", type: "date" },
      { key: "endDate", label: "End date", type: "date" },
      { key: "isCurrent", label: "I currently work here", type: "checkbox" },
      {
        key: "description",
        label: "Description",
        type: "textarea",
        wide: true,
      },
    ],
    create: {
      jobTitle: "",
      companyName: "",
      employmentType: "full_time",
      location: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      description: "",
    },
  },
  education: {
    title: "Education",
    icon: GraduationCap,
    fields: [
      { key: "degree", label: "Degree" },
      { key: "institution", label: "Institution" },
      { key: "fieldOfStudy", label: "Field of study" },
      { key: "startDate", label: "Start date", type: "date" },
      { key: "endDate", label: "End date", type: "date" },
      { key: "grade", label: "Grade" },
      {
        key: "description",
        label: "Description",
        type: "textarea",
        wide: true,
      },
    ],
    create: {
      degree: "",
      institution: "",
      fieldOfStudy: "",
      startDate: "",
      endDate: "",
      grade: "",
      description: "",
    },
  },
  projects: {
    title: "Projects",
    icon: Code2,
    fields: [
      { key: "title", label: "Project name" },
      { key: "projectUrl", label: "Project link", type: "url" },
      { key: "repositoryUrl", label: "Repository link", type: "url" },
      {
        key: "technologies",
        label: "Technologies (comma separated)",
        type: "text",
      },
      { key: "startDate", label: "Start date", type: "date" },
      { key: "endDate", label: "End date", type: "date" },
      {
        key: "description",
        label: "Description",
        type: "textarea",
        wide: true,
      },
    ],
    create: {
      title: "",
      projectUrl: "",
      repositoryUrl: "",
      technologies: [],
      startDate: "",
      endDate: "",
      description: "",
    },
  },
  certifications: {
    title: "Certifications",
    icon: Award,
    fields: [
      { key: "name", label: "Certification" },
      { key: "issuingOrganization", label: "Issuing organization" },
      { key: "issueDate", label: "Issue date", type: "date" },
      { key: "expirationDate", label: "Expiration date", type: "date" },
      { key: "credentialId", label: "Credential ID" },
      { key: "credentialUrl", label: "Credential link", type: "url" },
    ],
    create: {
      name: "",
      issuingOrganization: "",
      issueDate: "",
      expirationDate: "",
      credentialId: "",
      credentialUrl: "",
    },
  },
  languages: {
    title: "Languages",
    icon: Languages,
    fields: [
      { key: "name", label: "Language" },
      { key: "proficiency", label: "Proficiency" },
    ],
    create: { name: "", proficiency: "Professional" },
  },
};
const sections: Kind[] = [
  "experience",
  "education",
  "projects",
  "certifications",
  "languages",
];
const inputClass =
  "w-full rounded-xl border border-[#e2e5ef] bg-white px-3.5 py-3 text-sm text-[#252b3b] outline-none transition placeholder:text-[#a0a7b7] focus:border-[#5147e8] focus:ring-4 focus:ring-[#5147e8]/10";
const geoApi = "https://countriesnow.space/api/v0.1/countries";
type GeoCountry = { country: string; iso2?: string };
async function getGeoList(
  path: string,
  body?: Record<string, string>,
): Promise<string[]> {
  const response = await fetch(
    `${geoApi}${path}`,
    body
      ? {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      : undefined,
  );
  if (!response.ok) throw new Error("Location list unavailable");
  const result = await response.json();
  if (result.error) throw new Error(result.msg || "Location list unavailable");
  const data = result.data;
  if (Array.isArray(data))
    return data
      .map((item) =>
        typeof item === "string"
          ? item
          : item.name || item.state || item.country,
      )
      .filter(Boolean);
  if (Array.isArray(data?.states))
    return data.states.map((item: { name: string } | string) =>
      typeof item === "string" ? item : item.name,
    );
  return [];
}
function webUrl(value?: string) {
  if (!value) return undefined;
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}
function clean(item: CandidateProfileRecord): FormValues {
  const out: FormValues = {};
  for (const [key, value] of Object.entries(item)) {
    if (key === "technologies" && Array.isArray(value) && value.every((entry) => typeof entry === "string")) out[key] = value.join(", ");
    else if (typeof value === "string" || typeof value === "boolean") out[key] = value;
    else if (Array.isArray(value) && value.every((entry) => typeof entry === "string")) out[key] = value;
  }
  return out;
}
function apiErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError<{ message?: string }>(error)) return error.response?.data?.message || fallback;
  return fallback;
}
function displayValue(value: FormValue) {
  return typeof value === "string" ? value : Array.isArray(value) ? value.join(", ") : "";
}

export default function CandidateProfilePage() {
  const navigate = useNavigate();
  const email = useAuthStore((s) => s.user?.email);
  const logoutUser = useAuthStore((s) => s.logout);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [dialog, setDialog] = useState<{
    kind: Kind;
    index: number | null;
    values: FormValues;
  } | null>(null);
  const [personalOpen, setPersonalOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [preferences, setPreferences] = useState<CandidateJobPreferences | null>(null);
  const [roleDraft, setRoleDraft] = useState("");
  const [locationDraft, setLocationDraft] = useState("");
  const [personal, setPersonal] = useState<Record<string, string>>({});
  const [countries, setCountries] = useState<GeoCountry[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [navSearch, setNavSearch] = useState("");
  const [skill, setSkill] = useState("");
  const [editingSkill, setEditingSkill] = useState<string | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    let active = true;
    candidateProfileApi.get()
      .then((candidateProfile) => {
        if (active) setProfile(candidateProfile);
      })
      .catch(() => {
        if (active) setError("Your profile could not be loaded. Please try again.");
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);
  const act = async (fn: () => Promise<CandidateProfile>) => {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      setProfile(await fn());
      setNotice("Profile updated successfully.");
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setNotice(""), 3200);
      return true;
    } catch (e: unknown) {
      setError(apiErrorMessage(e, "Could not save your changes. Please try again."));
      return false;
    } finally {
      setSaving(false);
    }
  };
  const openItem = (kind: Kind, index: number | null) => {
    const values =
      index === null
        ? clean(specs[kind].create)
        : clean((profile?.[kind] as CandidateProfileRecord[])[index]);
    setDialog({ kind, index, values: { ...values } });
  };
  const saveItem = async () => {
    if (!dialog) return;
    const { kind, index, values } = dialog;
    const payload = { ...values };
    if (kind === "projects")
      payload.technologies = String(payload.technologies || "")
        .split(",")
        .map((x: string) => x.trim())
        .filter(Boolean);
    if (kind === "experience" && payload.isCurrent) payload.endDate = "";
    const ok = await act(() =>
      index === null
        ? candidateProfileApi.add(kind, payload)
        : candidateProfileApi.update(kind, { ...payload, index }),
    );
    if (ok) setDialog(null);
  };
  const deleteItem = async (kind: Kind, index: number) => {
    if (
      !window.confirm(`Remove this ${specs[kind].title.toLowerCase()} record?`)
    )
      return;
    await act(() => candidateProfileApi.remove(kind, { index }));
  };
  const savePersonal = async () => {
    const {
      dateOfBirth,
      gender,
      nationality,
      maritalStatus,
      phone,
      city,
      state,
      country,
      postalCode,
      linkedin,
      github,
      portfolio,
      fullName,
      headline,
      bio,
      ...rest
    } = personal;
    void rest;
    const ok = await act(async () => {
      if (
        fullName !== profile?.fullName ||
        headline !== profile?.headline ||
        bio !== profile?.bio
      ) {
        await candidateProfileApi.updateProfile({ fullName, headline, bio });
      }
      const compact = (values: Record<string, string | undefined>) =>
        Object.fromEntries(
          Object.entries(values).filter(([, value]) => value !== undefined),
        );
      const personalInfo = compact({
        dateOfBirth,
        gender,
        nationality,
        maritalStatus,
        phone,
      });
      const location = compact({ city, state, country, postalCode });
      const contactLinks = compact({
        linkedin: linkedin === undefined ? undefined : webUrl(linkedin) || "",
        github: github === undefined ? undefined : webUrl(github) || "",
        portfolio:
          portfolio === undefined ? undefined : webUrl(portfolio) || "",
      });
      const details: Record<string, unknown> = {};
      if (Object.keys(personalInfo).length) details.personalInfo = personalInfo;
      if (Object.keys(location).length) details.location = location;
      if (Object.keys(contactLinks).length) details.contactLinks = contactLinks;
      if (Object.keys(details).length)
        return candidateProfileApi.personal(details);
      return candidateProfileApi.get();
    });
    if (ok) setPersonalOpen(false);
  };
  const editPersonal = () => {
    setPersonal({
      ...(profile?.personalInfo || {}),
      ...(profile?.location || {}),
      ...(profile?.contactLinks || {}),
      fullName: profile?.fullName || "",
      headline: profile?.headline || "",
      bio: profile?.bio || "",
    } as Record<string, string>);
    setPersonalOpen(true);
    if (!countries.length)
      void getGeoList("/iso")
        .then((items) => setCountries(items.map((country) => ({ country }))))
        .catch(() =>
          setError(
            "Could not load country options. You can still enter a location manually.",
          ),
        );
    if (profile?.location?.country)
      void loadStates(profile.location.country, profile.location.state);
  };
  const editPreferences = () => {
    setPreferences(profile?.jobPreferences ? { ...profile.jobPreferences, preferredRoles: [...profile.jobPreferences.preferredRoles], preferredLocations: [...profile.jobPreferences.preferredLocations], employmentTypes: [...profile.jobPreferences.employmentTypes], workModes: [...profile.jobPreferences.workModes], expectedSalary: profile.jobPreferences.expectedSalary ? { ...profile.jobPreferences.expectedSalary } : null } : {
      preferredRoles: [], preferredLocations: [], employmentTypes: [], workModes: [],
      expectedSalary: null, experienceLevel: null, noticePeriodDays: null,
    });
    setRoleDraft("");
    setLocationDraft("");
    setPreferencesOpen(true);
  };
  const addPreferenceText = (field: "preferredRoles" | "preferredLocations", raw: string) => {
    const value = raw.trim();
    if (!preferences || !value) return;
    const values = preferences[field];
    if (values.some((existing) => existing.toLowerCase() === value.toLowerCase())) {
      setError(`That ${field === "preferredRoles" ? "role" : "location"} is already in your preferences.`);
      return;
    }
    if (values.length >= 30) {
      setError(`You can add up to 30 ${field === "preferredRoles" ? "roles" : "locations"}.`);
      return;
    }
    setPreferences({ ...preferences, [field]: [...values, value] });
    if (field === "preferredRoles") setRoleDraft(""); else setLocationDraft("");
    setError("");
  };
  const savePreferences = async () => {
    if (!preferences) return;
    const salary = preferences.expectedSalary;
    if (salary?.minimum !== null && salary?.minimum !== undefined && salary.maximum !== null && salary.maximum !== undefined && salary.minimum > salary.maximum) {
      setError("Minimum salary cannot be higher than maximum salary.");
      return;
    }
    const hasSalary = salary?.minimum !== null && salary?.minimum !== undefined || salary?.maximum !== null && salary?.maximum !== undefined;
    if (hasSalary && !salary?.currency) { setError("Choose a currency for your salary range."); return; }
    const ok = await act(() => candidateProfileApi.updateJobPreferences({
      ...preferences,
      expectedSalary: hasSalary ? salary : null,
    }));
    if (ok) setPreferencesOpen(false);
  };
  const loadStates = async (country: string, selectedState?: string) => {
    setLocationLoading(true);
    try {
      const next = await getGeoList("/states", { country });
      setStates(next);
      if (selectedState)
        await loadCities(country, selectedState, profile?.location?.city);
    } catch {
      setStates([]);
    } finally {
      setLocationLoading(false);
    }
  };
  const loadCities = async (
    country: string,
    state: string,
    selectedCity?: string,
  ) => {
    setLocationLoading(true);
    try {
      setCities(await getGeoList("/state/cities", { country, state }));
    } catch {
      setCities([]);
    } finally {
      setLocationLoading(false);
    }
    if (selectedCity)
      setPersonal((current) => ({ ...current, city: selectedCity }));
  };
  const skillNames = (profile?.skills || [])
    .map((s) => (typeof s === "string" ? s : s.name || ""))
    .filter(Boolean);
  const complete = [
    profile?.fullName,
    profile?.personalInfo?.dateOfBirth,
    profile?.location?.city,
    skillNames.length,
    profile?.experience.length,
    profile?.education.length,
    profile?.profilePhoto,
  ].filter(Boolean).length;
  const percent = Math.round((complete / 7) * 100);
  const initial = (profile?.fullName || email || "C").slice(0, 1).toUpperCase();
  const navInitials = (email || "CA").slice(0, 2).toUpperCase();
  const navigateTo = (page: string) => {
    setShowProfileMenu(false);
    if (page === "Dashboard") navigate("/candidate/dashboard");
    else if (page === "Resume") navigate("/candidate/resume");
    else if (page === "Find Jobs") navigate("/candidate/jobs");
    else if (page === "Saved Jobs") navigate("/candidate/jobs/saved");
    else if (page === "My Applications") navigate("/candidate/applications");
    else if (page === "My Profile") window.scrollTo({ top: 0, behavior: "smooth" });
    else {
      setNotice(`${page} page navigation will be connected when the route is implemented.`);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setNotice(""), 3200);
    }
  };
  const handleLogout = async () => {
    try { await logout(); }
    catch (logoutError) { console.error("Logout failed:", logoutError); }
    finally { logoutUser(); navigate("/login", { replace: true }); }
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-[#1e2433]">
      <CandidateSidebar
        activePage="My Profile"
        onNavigate={navigateTo}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        profile={{
          name: profile?.fullName || email || "Candidate",
          description: "Candidate profile",
          initials: initial,
        }}
        onProfileClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      />
      <div className="min-h-screen lg:pl-[250px]">
        <Navbar
          title="My Profile"
          onMenuClick={() => setSidebarOpen(true)}
        >
          <div className="relative min-w-0 w-full max-w-[430px]">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8792a9]" />
            <input type="search" value={navSearch} onChange={(event) => setNavSearch(event.target.value)} placeholder="Search jobs, companies, or skills..." aria-label="Search jobs, companies, or skills" className="h-[43px] w-full rounded-lg border border-[#dce1ed] bg-white pl-10 pr-4 text-[13px] text-[#26344c] outline-none transition placeholder:text-[#929cb0] focus:border-[#5046e5] focus:ring-4 focus:ring-[#5046e5]/[0.08]" />
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-3">
            <div className="relative">
              <button type="button" aria-label="Notifications" onClick={() => { setShowNotifications((current) => !current); setShowProfileMenu(false); }} className="relative grid h-10 w-10 place-items-center rounded-lg text-[#66718a] transition hover:bg-[#f1f0ff] hover:text-[#5046e5]">
                <Bell size={20} /><span className="absolute right-2.5 top-2 h-2 w-2 rounded-full border-2 border-white bg-[#f05269]" />
              </button>
              {showNotifications && <div className="absolute right-0 top-12 w-[270px] rounded-xl border border-[#e4e6ef] bg-white p-4 shadow-xl"><p className="text-[13px] font-bold text-[#20283a]">Notifications</p><p className="mt-2 text-[12px] leading-5 text-[#78839a]">Your application and interview updates will appear here.</p></div>}
            </div>
            <button type="button" aria-label="Messages" onClick={() => navigateTo("Messages")} className="grid h-10 w-10 place-items-center rounded-lg text-[#66718a] transition hover:bg-[#f1f0ff] hover:text-[#5046e5]"><Mail size={20} /></button>
            <div className="relative">
              <button type="button" aria-label="Open account menu" onClick={() => { setShowProfileMenu((current) => !current); setShowNotifications(false); }} className="ml-1 grid h-10 w-10 place-items-center rounded-full border-2 border-[#e5e2ff] bg-gradient-to-br from-[#6155f3] to-[#3930b9] text-[12px] font-bold text-white transition hover:ring-4 hover:ring-[#5046e5]/10">{navInitials}</button>
              {showProfileMenu && <div className="absolute right-0 top-12 z-[70] w-48 rounded-xl border border-[#e4e6ef] bg-white p-2 shadow-xl">
                <button type="button" onClick={() => navigateTo("My Profile")} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[12px] text-[#59647d] hover:bg-[#f3f2ff]"><UserRound size={16} />My Profile</button>
                <button type="button" onClick={() => navigateTo("Settings")} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[12px] text-[#59647d] hover:bg-[#f3f2ff]"><Settings size={16} />Settings</button>
                <div className="my-1 border-t border-[#eceef4]" />
                <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[12px] text-[#c44759] hover:bg-red-50"><LogOut size={16} />Sign out</button>
              </div>}
            </div>
          </div>
        </Navbar>
        <main className="mx-auto max-w-[1440px] px-4 py-7 sm:px-7 lg:px-9 lg:py-9">
          {error && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}
          {notice && (
            <div
              role="status"
              className="fixed right-5 top-24 z-[80] flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-5 py-3.5 text-sm font-medium text-emerald-800 shadow-[0_12px_38px_rgba(25,35,65,.18)] sm:right-7"
            >
              <Check size={17} className="text-emerald-600" />
              {notice}
            </div>
          )}
          {busy ? (
            <div className="grid min-h-[50vh] place-items-center text-sm text-[#737b8f]">
              Loading your profile…
            </div>
          ) : (
            profile && (
              <>
                <section className="relative overflow-hidden rounded-3xl border border-[#e1e3ed] bg-white p-6 shadow-[0_8px_28px_rgba(36,43,70,.035)] sm:p-8 lg:p-9">
                  <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-[#f2f0ff] to-transparent" />
                  <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
                    <div className="relative shrink-0">
                      <div className="grid h-28 w-28 place-items-center overflow-hidden rounded-full border-4 border-white bg-[#efedff] text-3xl font-bold text-[#5147e8] shadow-md">
                        {profile.profilePhoto ? (
                          <img
                            src={profile.profilePhoto}
                            alt="Profile"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          initial
                        )}
                      </div>
                      <button
                        onClick={() => photoRef.current?.click()}
                        className="absolute bottom-0 right-0 grid h-9 w-9 place-items-center rounded-full border-2 border-white bg-[#5147e8] text-white shadow"
                        aria-label="Upload profile photo"
                      >
                        <Camera size={16} />
                      </button>
                      <input
                        ref={photoRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file)
                            await act(() =>
                              candidateProfileApi.uploadPhoto(file),
                            );
                          e.target.value = "";
                        }}
                      />
                      {profile.profilePhoto && (
                        <button
                          type="button"
                          onClick={() =>
                            act(() => candidateProfileApi.deletePhoto())
                          }
                          className="absolute -bottom-2 left-0 grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-[#fff0f0] text-[#cc4a58] shadow-sm hover:bg-[#ffe3e5]"
                          title="Delete profile photo"
                          aria-label="Delete profile photo"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                          {profile.fullName || "Your name"}
                        </h1>
                        <span className="rounded-full bg-[#f0edff] px-3 py-1 text-xs font-semibold text-[#5b4bdb]">
                          <Sparkles size={13} className="mr-1 inline" />
                          Candidate profile
                        </span>
                      </div>
                      <p className="mt-2 text-base text-[#667087]">
                        {profile.headline ||
                          "Add a headline to introduce your professional focus."}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#596278]">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin size={15} />
                          {[
                            profile.location?.city,
                            profile.location?.state,
                            profile.location?.country,
                          ]
                            .filter(Boolean)
                            .join(", ") || "Add your location"}
                        </span>
                        {profile.contactLinks?.linkedin ? (
                          <a
                            href={webUrl(profile.contactLinks.linkedin)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-[#5147e8] hover:underline"
                          >
                            <Link2 size={15} />
                            LinkedIn profile
                            <ChevronRight size={14} />
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1.5">
                            <Link2 size={15} />
                            Add contact links
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={editPersonal}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#4338d5] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#352bbd]"
                    >
                      <Pencil size={16} />
                      Edit profile
                    </button>
                  </div>
                  <div className="relative mt-6 border-t border-[#edf0f5] pt-5 text-sm leading-6 text-[#657087]">
                    {profile.bio ||
                      "Add a short professional summary so recruiters can understand your strengths and goals."}
                  </div>
                </section>
                <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,.8fr)]">
                  <div className="space-y-6">
                    <section className="rounded-2xl border border-[#e1e3ed] bg-white p-6 shadow-sm sm:p-7">
                      <div className="mb-5 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[.15em] text-[#858da0]">
                            Your details
                          </p>
                          <h2 className="mt-1 text-xl font-bold">
                            Personal information
                          </h2>
                        </div>
                        <button
                          onClick={editPersonal}
                          aria-label="Edit personal information"
                          className="rounded-lg p-2 text-[#5147e8] hover:bg-[#f2f0ff]"
                        >
                          <Pencil size={18} />
                        </button>
                      </div>
                      <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                        {[
                          ["Date of birth", profile.personalInfo?.dateOfBirth],
                          ["Gender", profile.personalInfo?.gender],
                          ["Nationality", profile.personalInfo?.nationality],
                          [
                            "Marital status",
                            profile.personalInfo?.maritalStatus,
                          ],
                          ["Phone number", profile.personalInfo?.phone],
                          [
                            "Location",
                            [
                              profile.location?.city,
                              profile.location?.state,
                              profile.location?.country,
                              profile.location?.postalCode,
                            ]
                              .filter(Boolean)
                              .join(", "),
                          ],
                          ["LinkedIn", profile.contactLinks?.linkedin],
                          ["GitHub", profile.contactLinks?.github],
                          ["Portfolio", profile.contactLinks?.portfolio],
                        ].map(([label, value]) => (
                          <div key={label} className="min-w-0">
                            <p className="text-xs font-medium text-[#848b9c]">
                              {label}
                            </p>
                            {String(label).includes("LinkedIn") ||
                            label === "GitHub" ||
                            label === "Portfolio" ? (
                              <a
                                className="mt-1 block truncate text-sm font-medium text-[#5147e8]"
                                href={webUrl(value ? String(value) : undefined)}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {value || "Not added"}
                              </a>
                            ) : (
                              <p className="mt-1 truncate text-sm font-semibold text-[#303748]">
                                {value || "Not added"}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                    <section className="rounded-2xl border border-[#e1e3ed] bg-white p-6 shadow-sm sm:p-7">
                      <div className="mb-5 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[.15em] text-[#858da0]">
                            Expertise
                          </p>
                          <h2 className="mt-1 text-xl font-bold">
                            Skills &amp; strengths
                          </h2>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {skillNames.map((name) => (
                          <span
                            key={name}
                            className="group inline-flex items-center gap-2 rounded-full bg-[#f0f2ff] px-3.5 py-2 text-sm font-medium text-[#535e7d]"
                          >
                            {editingSkill === name ? (
                              <input
                                autoFocus
                                className="w-24 bg-transparent outline-none"
                                defaultValue={name}
                                onKeyDown={async (e) => {
                                  if (e.key === "Enter") {
                                    const next = e.currentTarget.value.trim();
                                    if (
                                      next &&
                                      next.toLowerCase() !== name.toLowerCase()
                                    )
                                      await act(() =>
                                        candidateProfileApi.updateSkill(
                                          name,
                                          next,
                                        ),
                                      );
                                    setEditingSkill(null);
                                  }
                                  if (e.key === "Escape") setEditingSkill(null);
                                }}
                                onBlur={() => setEditingSkill(null)}
                              />
                            ) : (
                              name
                            )}
                            <button
                              onClick={() => setEditingSkill(name)}
                              title="Rename skill"
                              className="text-[#8a90a3] opacity-0 group-hover:opacity-100"
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              onClick={() =>
                                act(() => candidateProfileApi.removeSkill(name))
                              }
                              title={`Remove ${name}`}
                              className="text-[#8a90a3] hover:text-red-600"
                            >
                              <X size={14} />
                            </button>
                          </span>
                        ))}
                        <form
                          className="flex gap-2"
                          onSubmit={async (e) => {
                            e.preventDefault();
                            const next = skill.trim();
                            if (!next) return;
                            if (
                              skillNames.some(
                                (n) => n.toLowerCase() === next.toLowerCase(),
                              )
                            ) {
                              setError(
                                "That skill is already on your profile.",
                              );
                              return;
                            }
                            const ok = await act(() =>
                              candidateProfileApi.addSkills([next]),
                            );
                            if (ok) setSkill("");
                          }}
                        >
                          <input
                            value={skill}
                            onChange={(e) => setSkill(e.target.value)}
                            placeholder="Add a skill"
                            className="w-32 rounded-full border border-dashed border-[#c5c9d8] px-3 py-2 text-sm outline-none focus:border-[#5147e8]"
                          />
                          <button
                            className="grid h-9 w-9 place-items-center rounded-full border border-dashed border-[#a7adc0] text-[#5147e8] hover:bg-[#f3f1ff]"
                            aria-label="Add skill"
                          >
                            <Plus size={17} />
                          </button>
                        </form>
                      </div>
                    </section>
                    {sections.slice(0, 3).map((kind) => {
                      const conf = specs[kind];
                      const Icon = conf.icon;
                      const rows = (profile[kind] || []) as ProfileRecord[];
                      return (
                        <section
                          key={kind}
                          className="rounded-2xl border border-[#e1e3ed] bg-white p-6 shadow-sm sm:p-7"
                        >
                          <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f0edff] text-[#5147e8]">
                                <Icon size={19} />
                              </span>
                              <h2 className="text-xl font-bold">
                                {conf.title}
                              </h2>
                            </div>
                            <button
                              onClick={() => openItem(kind, null)}
                              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-[#5147e8] hover:bg-[#f2f0ff]"
                            >
                              <Plus size={17} />
                              Add
                            </button>
                          </div>
                          {rows.length === 0 ? (
                            <p className="rounded-xl bg-[#f8f9fc] p-5 text-sm text-[#80889b]">
                              Add your {conf.title.toLowerCase()} details to
                              strengthen your profile.
                            </p>
                          ) : (
                            <div className="divide-y divide-[#edf0f5]">
                              {rows.map((row, index) => (
                                <div
                                  key={index}
                                  className="group flex gap-3 py-4 first:pt-1"
                                >
                                  <span className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#f5f6fa] text-[#68738d]">
                                    <Icon size={17} />
                                  </span>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                      <div>
                                        <h3 className="font-semibold text-[#2e3546]">
                                          {row.jobTitle ||
                                            row.degree ||
                                            row.title}
                                        </h3>
                                        <p className="mt-0.5 text-sm text-[#626d85]">
                                          {row.companyName ||
                                            row.institution ||
                                            (Array.isArray(row.technologies)
                                              ? row.technologies.join(", ")
                                              : row.technologies)}
                                        </p>
                                      </div>
                                      <div className="flex gap-1">
                                        <button
                                          onClick={() => openItem(kind, index)}
                                          aria-label={`Edit ${conf.title}`}
                                          className="rounded-lg p-2 text-[#858da0] hover:bg-[#f2f0ff] hover:text-[#5147e8]"
                                        >
                                          <Pencil size={15} />
                                        </button>
                                        <button
                                          onClick={() =>
                                            deleteItem(kind, index)
                                          }
                                          aria-label={`Delete ${conf.title}`}
                                          className="rounded-lg p-2 text-[#858da0] hover:bg-red-50 hover:text-red-600"
                                        >
                                          <Trash2 size={15} />
                                        </button>
                                      </div>
                                    </div>
                                    {row.description && (
                                      <p className="mt-2 text-sm leading-6 text-[#737c90]">
                                        {row.description}
                                      </p>
                                    )}
                                    <p className="mt-2 text-xs text-[#858da0]">
                                      {row.isCurrent
                                        ? "Current"
                                        : [row.startDate, row.endDate]
                                            .filter(Boolean)
                                            .join(" – ") ||
                                          row.employmentType ||
                                          ""}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </section>
                      );
                    })}
                    {sections.slice(3).map((kind) => {
                      const conf = specs[kind];
                      const Icon = conf.icon;
                      const rows = (profile[kind] || []) as ProfileRecord[];
                      return (
                        <section
                          key={kind}
                          className="rounded-2xl border border-[#e1e3ed] bg-white p-6 shadow-sm sm:p-7"
                        >
                          <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f0edff] text-[#5147e8]">
                                <Icon size={19} />
                              </span>
                              <h2 className="text-xl font-bold">
                                {conf.title}
                              </h2>
                            </div>
                            <button
                              onClick={() => openItem(kind, null)}
                              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-[#5147e8] hover:bg-[#f2f0ff]"
                            >
                              <Plus size={17} />
                              Add
                            </button>
                          </div>
                          {rows.length === 0 ? (
                            <p className="text-sm text-[#80889b]">
                              No {conf.title.toLowerCase()} added yet.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {rows.map((row, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between rounded-xl bg-[#f8f9fc] px-4 py-3"
                                >
                                  <div>
                                    <p className="text-sm font-semibold">
                                      {row.name}
                                    </p>
                                    <p className="text-xs text-[#737c90]">
                                      {kind === "languages"
                                        ? row.proficiency
                                        : row.issuingOrganization}
                                    </p>
                                  </div>
                                  <div className="flex">
                                    <button
                                      onClick={() => openItem(kind, index)}
                                      className="rounded-lg p-2 text-[#858da0] hover:text-[#5147e8]"
                                    >
                                      <Pencil size={15} />
                                    </button>
                                    <button
                                      onClick={() => deleteItem(kind, index)}
                                      className="rounded-lg p-2 text-[#858da0] hover:text-red-600"
                                    >
                                      <Trash2 size={15} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </section>
                      );
                    })}
                  </div>
                  <aside className="space-y-6">
                    <section className="rounded-2xl border border-[#e1e3ed] bg-white p-6 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[.15em] text-[#858da0]">
                            Profile strength
                          </p>
                          <h2 className="mt-1 text-xl font-bold">
                            {percent}% complete
                          </h2>
                        </div>
                        <div className="grid h-14 w-14 place-items-center rounded-full border-[5px] border-[#e8e5ff] text-sm font-bold text-[#5147e8]">
                          {percent}%
                        </div>
                      </div>
                      <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#eeeef5]">
                        <div
                          className="h-full rounded-full bg-[#5147e8] transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <p className="mt-4 text-sm leading-6 text-[#70798e]">
                        Complete your details to help recruiters discover the
                        full picture of your experience.
                      </p>
                      <div className="mt-5 space-y-3">
                        {[
                          [
                            "Personal information",
                            Boolean(profile.personalInfo?.dateOfBirth),
                          ],
                          ["Work experience", profile.experience.length > 0],
                          ["Education", profile.education.length > 0],
                          ["Skills", skillNames.length > 0],
                          ["Profile photo", Boolean(profile.profilePhoto)],
                        ].map(([label, done]) => (
                          <div
                            key={String(label)}
                            className="flex items-center gap-2.5 text-sm"
                          >
                            <span
                              className={`grid h-5 w-5 place-items-center rounded-full ${done ? "bg-[#efedff] text-[#5147e8]" : "border border-[#cdd1dc] text-transparent"}`}
                            >
                              {done ? <Check size={13} /> : <Check size={12} />}
                            </span>
                            <span
                              className={
                                done ? "text-[#41495b]" : "text-[#8990a0]"
                              }
                            >
                              {label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </section>
                    <section className="rounded-2xl border border-[#e1e3ed] bg-white p-6 shadow-sm">
                      <h2 className="text-lg font-bold">Contact links</h2>
                      <p className="mt-1 text-sm text-[#7c8497]">
                        Share your work with recruiters.
                      </p>
                      <div className="mt-4 space-y-2">
                        {[
                          ["LinkedIn", profile.contactLinks?.linkedin],
                          ["GitHub", profile.contactLinks?.github],
                          ["Portfolio", profile.contactLinks?.portfolio],
                        ].map(([label, url]) => (
                          <a
                            key={label}
                            href={webUrl(url || undefined)}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between rounded-xl border border-[#eceef4] px-3.5 py-3 text-sm hover:border-[#c9c4fa]"
                          >
                            <span className="flex items-center gap-2 font-semibold">
                              <Link2 size={15} className="text-[#5147e8]" />
                              {label}
                            </span>
                            <span className="max-w-[130px] truncate text-xs text-[#8a91a2]">
                              {url || "Add link"}
                            </span>
                            <ChevronRight
                              size={15}
                              className="text-[#969cad]"
                            />
                          </a>
                        ))}
                      </div>
                      <button
                        onClick={editPersonal}
                        className="mt-4 w-full rounded-xl border border-[#5147e8] px-4 py-2.5 text-sm font-semibold text-[#5147e8] hover:bg-[#f6f5ff]"
                      >
                        Edit contact links
                      </button>
                    </section>
                  </aside>
                </div>
                <section className="mt-6 rounded-2xl border border-[#e1e3ed] bg-white p-6 shadow-sm sm:p-7">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f0edff] text-[#5147e8]"><Target size={19}/></span><div><p className="text-xs font-semibold uppercase tracking-[.15em] text-[#858da0]">Career direction</p><h2 className="mt-1 text-xl font-bold">Job preferences</h2></div></div>
                    <button type="button" onClick={editPreferences} className="inline-flex items-center gap-2 rounded-xl border border-[#5147e8] px-4 py-2.5 text-sm font-semibold text-[#5147e8] hover:bg-[#f6f5ff]"><Pencil size={15}/>Edit preferences</button>
                  </div>
                  <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    <div><p className="text-xs font-medium text-[#858da0]">Preferred roles</p><div className="mt-2 flex flex-wrap gap-2">{profile.jobPreferences?.preferredRoles?.length ? profile.jobPreferences.preferredRoles.map((role)=><span key={role} className="rounded-full bg-[#f0f2ff] px-3 py-1.5 text-xs font-medium text-[#535e7d]">{role}</span>) : <span className="text-sm text-[#8990a0]">Not set</span>}</div></div>
                    <div><p className="text-xs font-medium text-[#858da0]">Preferred locations</p><div className="mt-2 flex flex-wrap gap-2">{profile.jobPreferences?.preferredLocations?.length ? profile.jobPreferences.preferredLocations.map((place)=><span key={place} className="rounded-full bg-[#f0f2ff] px-3 py-1.5 text-xs font-medium text-[#535e7d]">{place}</span>) : <span className="text-sm text-[#8990a0]">Not set</span>}</div></div>
                    <div><p className="text-xs font-medium text-[#858da0]">Employment types</p><p className="mt-2 text-sm font-semibold text-[#343b4c]">{profile.jobPreferences?.employmentTypes?.length ? profile.jobPreferences.employmentTypes.map((value)=>value.replaceAll("_"," ").replace(/\b\w/g,(letter)=>letter.toUpperCase())).join(", ") : "Not set"}</p></div>
                    <div><p className="text-xs font-medium text-[#858da0]">Work modes</p><p className="mt-2 text-sm font-semibold text-[#343b4c]">{profile.jobPreferences?.workModes?.length ? profile.jobPreferences.workModes.map((value)=>value === "onsite" ? "On-site" : value[0].toUpperCase()+value.slice(1)).join(", ") : "Not set"}</p></div>
                    <div><p className="text-xs font-medium text-[#858da0]">Expected salary</p><p className="mt-2 text-sm font-semibold text-[#343b4c]">{profile.jobPreferences?.expectedSalary ? `${profile.jobPreferences.expectedSalary.currency || ""} ${[profile.jobPreferences.expectedSalary.minimum,profile.jobPreferences.expectedSalary.maximum].map((value)=>value?.toLocaleString() || "Any").join(" – ")}` : "Not set"}</p></div>
                    <div><p className="text-xs font-medium text-[#858da0]">Experience level · Notice period</p><p className="mt-2 text-sm font-semibold capitalize text-[#343b4c]">{profile.jobPreferences?.experienceLevel?.replaceAll("_"," ") || "Any level"} · {profile.jobPreferences?.noticePeriodDays == null ? "Not set" : `${profile.jobPreferences.noticePeriodDays} days`}</p></div>
                  </div>
                </section>
              </>
            )
          )}
        </main>
      </div>
      {(dialog || personalOpen || preferencesOpen) && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#171a2a]/45 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setDialog(null);
              setPersonalOpen(false);
              setPreferencesOpen(false);
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-[760px] overflow-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-7">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.14em] text-[#858da0]">
                  Profile editor
                </p>
                <h2 className="mt-1 text-xl font-bold">
                  {personalOpen
                    ? "Personal information"
                    : preferencesOpen
                      ? "Job preferences"
                    : `${dialog?.index === null ? "Add" : "Edit"} ${dialog ? specs[dialog.kind].title.toLowerCase().replace(/s$/, "") : ""}`}
                </h2>
              </div>
              <button
                onClick={() => {
                  setDialog(null);
                  setPersonalOpen(false);
                  setPreferencesOpen(false);
                }}
                className="rounded-lg p-2 text-[#7e8699] hover:bg-[#f2f3f7]"
              >
                <X size={19} />
              </button>
            </div>
            {preferencesOpen && error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            {personalOpen ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    {
                      key: "dateOfBirth",
                      label: "Date of birth",
                      type: "date",
                    },
                    { key: "fullName", label: "Full name" },
                    { key: "headline", label: "Professional headline" },
                    { key: "bio", label: "About you", type: "textarea" },
                    { key: "gender", label: "Gender" },
                    { key: "nationality", label: "Nationality" },
                    { key: "maritalStatus", label: "Marital status" },
                    { key: "phone", label: "Phone number", type: "tel" },
                    { key: "city", label: "City" },
                    { key: "state", label: "State / region" },
                    { key: "country", label: "Country" },
                    { key: "postalCode", label: "Postal code" },
                    { key: "linkedin", label: "LinkedIn URL", type: "url" },
                    { key: "github", label: "GitHub URL", type: "url" },
                    { key: "portfolio", label: "Portfolio URL", type: "url" },
                  ].map((f) => (
                    <label
                      key={f.key}
                      className={`text-sm font-medium text-[#596176] ${f.key === "bio" ? "sm:col-span-2" : ""}`}
                    >
                      {f.label}
                      {f.key === "bio" ? (
                        <textarea
                          rows={4}
                          value={personal[f.key] || ""}
                          onChange={(e) =>
                            setPersonal({
                              ...personal,
                              [f.key]: e.target.value,
                            })
                          }
                          className={`${inputClass} mt-1.5 sm:col-span-2`}
                        />
                      ) : f.key === "gender" ? (
                        <select
                          value={personal.gender || ""}
                          onChange={(e) =>
                            setPersonal({ ...personal, gender: e.target.value })
                          }
                          className={`${inputClass} mt-1.5`}
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="non_binary">Non-binary</option>
                          <option value="prefer_not_to_say">
                            Prefer not to say
                          </option>
                          <option value="self_described">Self-described</option>
                        </select>
                      ) : f.key === "maritalStatus" ? (
                        <select
                          value={personal.maritalStatus || ""}
                          onChange={(e) =>
                            setPersonal({
                              ...personal,
                              maritalStatus: e.target.value,
                            })
                          }
                          className={`${inputClass} mt-1.5`}
                        >
                          <option value="">Select status</option>
                          <option value="single">Single</option>
                          <option value="married">Married</option>
                          <option value="divorced">Divorced</option>
                          <option value="widowed">Widowed</option>
                          <option value="prefer_not_to_say">
                            Prefer not to say
                          </option>
                        </select>
                      ) : f.key === "country" ? (
                        <select
                          value={personal.country || ""}
                          onChange={(e) => {
                            const country = e.target.value;
                            setPersonal({
                              ...personal,
                              country,
                              state: "",
                              city: "",
                            });
                            setStates([]);
                            setCities([]);
                            if (country) void loadStates(country);
                          }}
                          className={`${inputClass} mt-1.5`}
                        >
                          <option value="">Select country</option>
                          {personal.country &&
                            !countries.some(
                              (item) => item.country === personal.country,
                            ) && (
                              <option value={personal.country}>
                                {personal.country}
                              </option>
                            )}
                          {countries.map((item) => (
                            <option key={item.country} value={item.country}>
                              {item.country}
                            </option>
                          ))}
                        </select>
                      ) : f.key === "state" ? (
                        <select
                          value={personal.state || ""}
                          disabled={!personal.country || locationLoading}
                          onChange={(e) => {
                            const state = e.target.value;
                            setPersonal({ ...personal, state, city: "" });
                            setCities([]);
                            if (state) void loadCities(personal.country, state);
                          }}
                          className={`${inputClass} mt-1.5 disabled:bg-[#f5f6f9]`}
                        >
                          <option value="">
                            {locationLoading
                              ? "Loading…"
                              : "Select state / region"}
                          </option>
                          {personal.state &&
                            !states.includes(personal.state) && (
                              <option value={personal.state}>
                                {personal.state}
                              </option>
                            )}
                          {states.map((value) => (
                            <option key={value} value={value}>
                              {value}
                            </option>
                          ))}
                        </select>
                      ) : f.key === "city" ? (
                        <select
                          value={personal.city || ""}
                          disabled={!personal.state || locationLoading}
                          onChange={(e) =>
                            setPersonal({ ...personal, city: e.target.value })
                          }
                          className={`${inputClass} mt-1.5 disabled:bg-[#f5f6f9}`}
                        >
                          <option value="">
                            {locationLoading ? "Loading…" : "Select city"}
                          </option>
                          {personal.city && !cities.includes(personal.city) && (
                            <option value={personal.city}>
                              {personal.city}
                            </option>
                          )}
                          {cities.map((value) => (
                            <option key={value} value={value}>
                              {value}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={f.type || "text"}
                          value={personal[f.key] || ""}
                          onChange={(e) =>
                            setPersonal({
                              ...personal,
                              [f.key]: e.target.value,
                            })
                          }
                          className={`${inputClass} mt-1.5`}
                        />
                      )}
                    </label>
                  ))}
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setPersonalOpen(false)}
                    className="rounded-xl border border-[#e2e5ef] px-4 py-2.5 text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={saving}
                    onClick={savePersonal}
                    className="rounded-xl bg-[#4338d5] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                </div>
              </>
            ) : preferencesOpen && preferences ? (
              <>
                <div className="space-y-6">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-semibold text-[#596176]" htmlFor="preferred-role-input">Preferred job roles</label>
                      <form className="mt-2 flex gap-2" onSubmit={(event) => { event.preventDefault(); addPreferenceText("preferredRoles", roleDraft); }}>
                        <input id="preferred-role-input" value={roleDraft} onChange={(event) => setRoleDraft(event.target.value)} placeholder="e.g. Product Designer" className={inputClass}/>
                        <button className="grid h-[43px] w-[46px] shrink-0 place-items-center rounded-lg bg-[#5147e8] text-white hover:bg-[#4037cc]" aria-label="Add preferred role"><Plus size={18}/></button>
                      </form>
                      <div className="mt-3 flex flex-wrap gap-2">{preferences.preferredRoles.map((role)=><span key={role} className="inline-flex items-center gap-1.5 rounded-full bg-[#f0f2ff] px-3 py-1.5 text-xs font-medium text-[#535e7d]">{role}<button type="button" onClick={()=>setPreferences({...preferences,preferredRoles:preferences.preferredRoles.filter((item)=>item!==role)})} aria-label={`Remove ${role}`}><X size={13}/></button></span>)}</div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-[#596176]" htmlFor="preferred-location-input">Preferred locations</label>
                      <form className="mt-2 flex gap-2" onSubmit={(event) => { event.preventDefault(); addPreferenceText("preferredLocations", locationDraft); }}>
                        <input id="preferred-location-input" value={locationDraft} onChange={(event) => setLocationDraft(event.target.value)} placeholder="e.g. Bengaluru or Remote" className={inputClass}/>
                        <button className="grid h-[43px] w-[46px] shrink-0 place-items-center rounded-lg bg-[#5147e8] text-white hover:bg-[#4037cc]" aria-label="Add preferred location"><Plus size={18}/></button>
                      </form>
                      <div className="mt-3 flex flex-wrap gap-2">{preferences.preferredLocations.map((place)=><span key={place} className="inline-flex items-center gap-1.5 rounded-full bg-[#f0f2ff] px-3 py-1.5 text-xs font-medium text-[#535e7d]">{place}<button type="button" onClick={()=>setPreferences({...preferences,preferredLocations:preferences.preferredLocations.filter((item)=>item!==place)})} aria-label={`Remove ${place}`}><X size={13}/></button></span>)}</div>
                    </div>
                  </div>
                  <div className="grid gap-6 border-t border-[#edf0f5] pt-5 sm:grid-cols-2">
                    <fieldset><legend className="text-sm font-semibold text-[#596176]">Employment types</legend><div className="mt-3 grid grid-cols-2 gap-2">{([["full_time","Full-time"],["part_time","Part-time"],["contract","Contract"],["internship","Internship"],["temporary","Temporary"],["freelance","Freelance"]] as const).map(([value,label])=><label key={value} className="flex items-center gap-2 rounded-lg border border-[#eceef4] px-3 py-2.5 text-xs text-[#535c71]"><input type="checkbox" checked={preferences.employmentTypes.includes(value)} onChange={(event)=>setPreferences({...preferences,employmentTypes:event.target.checked?[...preferences.employmentTypes,value]:preferences.employmentTypes.filter((item)=>item!==value)})} className="accent-[#5147e8]"/>{label}</label>)}</div></fieldset>
                    <fieldset><legend className="text-sm font-semibold text-[#596176]">Work modes</legend><div className="mt-3 grid grid-cols-2 gap-2">{([["remote","Remote"],["hybrid","Hybrid"],["onsite","On-site"]] as const).map(([value,label])=><label key={value} className="flex items-center gap-2 rounded-lg border border-[#eceef4] px-3 py-2.5 text-xs text-[#535c71]"><input type="checkbox" checked={preferences.workModes.includes(value)} onChange={(event)=>setPreferences({...preferences,workModes:event.target.checked?[...preferences.workModes,value]:preferences.workModes.filter((item)=>item!==value)})} className="accent-[#5147e8]"/>{label}</label>)}</div></fieldset>
                  </div>
                  <div className="grid gap-4 border-t border-[#edf0f5] pt-5 sm:grid-cols-2 lg:grid-cols-4">
                    <label className="text-sm font-semibold text-[#596176]">Minimum salary<input type="number" min="0" max="1000000000" value={preferences.expectedSalary?.minimum ?? ""} onChange={(event)=>setPreferences({...preferences,expectedSalary:{minimum:event.target.value===""?null:Number(event.target.value),maximum:preferences.expectedSalary?.maximum ?? null,currency:preferences.expectedSalary?.currency ?? null}})} placeholder="Any" className={`${inputClass} mt-1.5`}/></label>
                    <label className="text-sm font-semibold text-[#596176]">Maximum salary<input type="number" min="0" max="1000000000" value={preferences.expectedSalary?.maximum ?? ""} onChange={(event)=>setPreferences({...preferences,expectedSalary:{minimum:preferences.expectedSalary?.minimum ?? null,maximum:event.target.value===""?null:Number(event.target.value),currency:preferences.expectedSalary?.currency ?? null}})} placeholder="Any" className={`${inputClass} mt-1.5`}/></label>
                    <label className="text-sm font-semibold text-[#596176]">Currency<input type="text" maxLength={3} value={preferences.expectedSalary?.currency ?? ""} onChange={(event)=>setPreferences({...preferences,expectedSalary:{minimum:preferences.expectedSalary?.minimum ?? null,maximum:preferences.expectedSalary?.maximum ?? null,currency:event.target.value.replace(/[^a-z]/gi,"").slice(0,3).toUpperCase() || null}})} placeholder="USD" className={`${inputClass} mt-1.5 uppercase`}/></label>
                    <label className="text-sm font-semibold text-[#596176]">Experience level<select value={preferences.experienceLevel ?? ""} onChange={(event)=>setPreferences({...preferences,experienceLevel:(event.target.value || null) as CandidateJobPreferences["experienceLevel"]})} className={`${inputClass} mt-1.5`}><option value="">Any level</option><option value="internship">Internship</option><option value="entry">Entry</option><option value="junior">Junior</option><option value="mid">Mid-level</option><option value="senior">Senior</option><option value="lead">Lead</option><option value="executive">Executive</option></select></label>
                    <label className="text-sm font-semibold text-[#596176]">Notice period (days)<input type="number" min="0" max="365" value={preferences.noticePeriodDays ?? ""} onChange={(event)=>setPreferences({...preferences,noticePeriodDays:event.target.value===""?null:Number(event.target.value)})} placeholder="Not specified" className={`${inputClass} mt-1.5`}/></label>
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={()=>setPreferencesOpen(false)} className="rounded-xl border border-[#e2e5ef] px-4 py-2.5 text-sm font-semibold">Cancel</button><button type="button" disabled={saving} onClick={savePreferences} className="rounded-xl bg-[#4338d5] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Saving..." : "Save preferences"}</button></div>
              </>
            ) : (
              dialog && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {specs[dialog.kind].fields.map((f) => (
                      <label
                        key={f.key}
                        className={`text-sm font-medium text-[#596176] ${f.wide ? "sm:col-span-2" : ""}`}
                      >
                        {f.type === "checkbox" ? (
                          <span className="flex items-center gap-2 pt-2">
                            <input
                              type="checkbox"
                              checked={Boolean(dialog.values[f.key])}
                              onChange={(e) =>
                                setDialog({
                                  ...dialog,
                                  values: {
                                    ...dialog.values,
                                    [f.key]: e.target.checked,
                                  },
                                })
                              }
                            />
                            {f.label}
                          </span>
                        ) : (
                          <>
                            {f.label}
                            {f.type === "textarea" ? (
                              <textarea
                                rows={3}
                                value={displayValue(dialog.values[f.key])}
                                onChange={(e) =>
                                  setDialog({
                                    ...dialog,
                                    values: {
                                      ...dialog.values,
                                      [f.key]: e.target.value,
                                    },
                                  })
                                }
                                className={`${inputClass} mt-1.5`}
                              />
                            ) : (
                              <input
                                type={f.type || "text"}
                                value={displayValue(dialog.values[f.key])}
                                onChange={(e) =>
                                  setDialog({
                                    ...dialog,
                                    values: {
                                      ...dialog.values,
                                      [f.key]: e.target.value,
                                    },
                                  })
                                }
                                className={`${inputClass} mt-1.5`}
                              />
                            )}
                          </>
                        )}
                      </label>
                    ))}
                  </div>
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      onClick={() => setDialog(null)}
                      className="rounded-xl border border-[#e2e5ef] px-4 py-2.5 text-sm font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={saving}
                      onClick={saveItem}
                      className="rounded-xl bg-[#4338d5] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      {saving ? "Saving…" : "Save details"}
                    </button>
                  </div>
                </>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
