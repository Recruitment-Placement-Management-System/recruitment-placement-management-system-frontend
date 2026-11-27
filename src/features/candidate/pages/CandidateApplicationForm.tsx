import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  FileText,
  MapPin,
} from "lucide-react";
import { candidateApplicationsApi } from "../../../api/candidate-applications.api";
import {
  candidateJobsApi,
  type CandidateJob,
} from "../../../api/candidate-jobs.api";
import {
  candidateProfileApi,
  type CandidateProfile,
  type CandidateResume,
} from "../../../api/candidate-profile.api";
import useAuthStore from "../../../store/auth.store";
import { CandidatePageLayout } from "../components/CandidatePageLayout";

function errorMessage(error: unknown, fallback: string) {
  return isAxiosError<{ message?: string }>(error)
    ? error.response?.data?.message || fallback
    : fallback;
}
const field =
  "mt-1.5 w-full rounded-xl border border-[#dce1ed] bg-white px-4 py-3 text-sm text-[#26344c] outline-none transition placeholder:text-[#929cb0] focus:border-[#5046e5] focus:ring-4 focus:ring-[#5046e5]/[0.08]";

export default function CandidateApplicationFormPage() {
  const { jobId = "" } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const email = useAuthStore((state) => state.user?.email) || "";
  const [job, setJob] = useState<CandidateJob | null>(null);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [resume, setResume] = useState<CandidateResume | null>(null);
  const [step, setStep] = useState(1);
  const [coverLetter, setCoverLetter] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void Promise.allSettled([
      candidateJobsApi.details(jobId),
      candidateProfileApi.get(),
    ])
      .then(async ([jobResult, profileResult]) => {
        if (!active) return;
        if (jobResult.status === "fulfilled") setJob(jobResult.value);
        else
          setError(
            errorMessage(
              jobResult.reason,
              "This job is no longer accepting applications.",
            ),
          );
        if (profileResult.status === "fulfilled") {
          setProfile(profileResult.value);
          setPhone(
            profileResult.value.personalInfo?.phone ||
              profileResult.value.personalInfo?.phoneNumber ||
              "",
          );
          try {
            const currentResume = await candidateProfileApi.getResume();
            if (active) setResume(currentResume);
          } catch {
            if (active) setResume(profileResult.value.resume);
          }
        } else
          setError(
            errorMessage(
              profileResult.reason,
              "Could not load your candidate details.",
            ),
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [jobId]);

  const submit = async () => {
    if (!consent) {
      setError("Please confirm your information before submitting.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      if (profile?.personalInfo?.phone !== phone.trim()) {
        await candidateProfileApi.personal({
          personalInfo: { phone: phone.trim() },
        });
      }
      const application = await candidateApplicationsApi.submit(
        jobId,
        coverLetter.trim(),
      );
      navigate(`/candidate/applications/${application._id}`, {
        replace: true,
        state: { submitted: true },
      });
    } catch (cause) {
      setError(errorMessage(cause, "Could not submit your application."));
    } finally {
      setSubmitting(false);
    }
  };

  const fullName = profile?.fullName || "Candidate";
  const location = profile?.location || {};
  const candidateLocation =
    [location.city, location.state, location.country]
      .filter(Boolean)
      .join(", ") || "Not provided";
  const phoneDigitCount = phone.replace(/\D/g, "").length;
  const phoneValid = phoneDigitCount >= 7 && phoneDigitCount <= 15;

  return (
    <CandidatePageLayout title="Apply for a Job" activePage="Find Jobs">
      <button
        type="button"
        onClick={() => navigate(`/candidate/jobs/${jobId}`)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#59647d] hover:text-[#5046e5]"
      >
        <ArrowLeft size={16} />
        Back to job details
      </button>
      {loading ? (
        <div className="grid min-h-[45vh] place-items-center text-sm text-[#7a849a]">
          Preparing your application…
        </div>
      ) : !job ? (
        <section className="rounded-2xl border border-[#e5e7f0] bg-white p-8 text-center">
          <h1 className="text-lg font-bold text-[#20283a]">
            Application unavailable
          </h1>
          <p className="mt-2 text-sm text-[#7a849a]">
            {error || "This job could not be loaded."}
          </p>
          <button
            type="button"
            onClick={() => navigate("/candidate/jobs")}
            className="mt-5 rounded-lg bg-[#5046e5] px-4 py-2.5 text-sm font-semibold text-white"
          >
            Browse jobs
          </button>
        </section>
      ) : (
        <>
          <section className="flex flex-col justify-between gap-4 rounded-2xl border border-[#e1e3ed] bg-white p-5 sm:flex-row sm:items-center sm:p-6">
            <div className="flex items-center gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#efedff] text-[#5046e5]">
                <BriefcaseBusiness size={22} />
              </span>
              <div>
                <h1 className="text-lg font-bold text-[#20283a] sm:text-xl">
                  {job.title}
                </h1>
                <p className="mt-1 text-sm text-[#59647d]">
                  {job.companyName}
                  <span className="mx-2">·</span>
                  <MapPin size={14} className="inline" /> {job.location}
                </p>
              </div>
            </div>
            <span className="w-fit rounded-full bg-[#efedff] px-3 py-1.5 text-xs font-bold text-[#5046e5]">
              {job.workMode.replaceAll("_", " ")} ·{" "}
              {job.employmentType.replaceAll("_", " ")}
            </span>
          </section>
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {["Your details", "Cover letter", "Review & submit"].map(
              (title, index) => (
                <div key={title} className="flex items-center gap-2 sm:gap-3">
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${step > index ? "bg-[#5046e5] text-white" : "bg-[#e8e9f0] text-[#7a849a]"}`}
                  >
                    {step > index + 1 ? <Check size={15} /> : index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-[11px] font-semibold sm:text-sm ${step === index + 1 ? "text-[#5046e5]" : "text-[#7a849a]"}`}
                    >
                      {title}
                    </p>
                    <div className="mt-2 h-1 rounded-full bg-[#e5e7f0]">
                      <div
                        className={`h-full rounded-full transition-all ${step > index ? "bg-[#5046e5]" : "bg-transparent"}`}
                      />
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>

          {step === 1 && (
            <section className="rounded-2xl border border-[#e1e3ed] bg-white p-5 sm:p-7">
              <h2 className="text-xl font-bold text-[#20283a]">
                Application details
              </h2>
              <p className="mt-1 text-sm text-[#7a849a]">
                Check the resume and contact details that will be shared with
                the hiring team.
              </p>
              <div className="mt-5 rounded-xl border border-[#e1e3ed] bg-[#f8f9fc] p-4 sm:flex sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#efedff] text-[#5046e5]">
                    <FileText size={20} />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[#26344c]">
                      {resume?.fileName || "No resume uploaded"}
                    </p>
                    <p className="mt-1 text-xs text-[#7a849a]">
                      {resume
                        ? `Last updated ${new Date(resume.uploadedAt).toLocaleDateString()}`
                        : "A resume is required to apply."}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/candidate/resume")}
                  className="mt-3 text-xs font-bold text-[#5046e5] hover:underline sm:mt-0"
                >
                  {resume ? "Change resume" : "Upload resume"}
                </button>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <ReadOnly label="Full name" value={fullName} />
                <ReadOnly label="Email address" value={email} />
                <label className="text-[11px] font-semibold text-[#7a849a]">
                  Phone number
                  <input
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    maxLength={32}
                    placeholder="Add your phone number"
                    className={`${field} mt-1.5`}
                  />
                </label>
                <ReadOnly label="Location" value={candidateLocation} />
              </div>
              <p className="mt-2 text-xs text-[#7a849a]">
                This number will also be saved to your profile and used for
                future applications.
              </p>
              {phone.length > 0 && !phoneValid && (
                <p className="mt-2 text-xs text-[#ad3a51]">
                  Enter a valid phone number with 7 to 15 digits.
                </p>
              )}
              {!resume && (
                <p className="mt-4 rounded-lg bg-[#fff8e8] p-3 text-xs text-[#94661b]">
                  Upload a resume from the Resume page before applying. Your
                  latest resume will be attached automatically.
                </p>
              )}
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  disabled={!resume || !phoneValid}
                  onClick={() => {
                    setError("");
                    setStep(2);
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#5046e5] px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continue
                  <ArrowRight size={16} />
                </button>
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="rounded-2xl border border-[#e1e3ed] bg-white p-5 sm:p-7">
              <h2 className="text-xl font-bold text-[#20283a]">
                Cover letter{" "}
                <span className="text-sm font-normal text-[#7a849a]">
                  (optional)
                </span>
              </h2>
              <p className="mt-1 text-sm text-[#7a849a]">
                Tell {job.companyName} why you’re interested in this role.
              </p>
              <textarea
                value={coverLetter}
                onChange={(event) => setCoverLetter(event.target.value)}
                maxLength={5000}
                rows={10}
                placeholder="Write your cover letter here…"
                className={`${field} mt-5 resize-y`}
              />
              <div className="mt-1 flex justify-between text-[11px] text-[#929cb0]">
                <span>Up to 5,000 characters</span>
                <span>{coverLetter.length}/5000</span>
              </div>
              <div className="mt-6 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-lg border border-[#dce1ed] px-4 py-2.5 text-sm font-semibold text-[#59647d]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setStep(3);
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#5046e5] px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Review application
                  <ArrowRight size={16} />
                </button>
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="rounded-2xl border border-[#e1e3ed] bg-white p-5 sm:p-7">
              <h2 className="text-xl font-bold text-[#20283a]">
                Review your application
              </h2>
              <p className="mt-1 text-sm text-[#7a849a]">
                Make sure everything looks right before submitting.
              </p>
              <div className="mt-5 grid gap-4 rounded-xl bg-[#f8f9fc] p-4 sm:grid-cols-2">
                <ReadOnly label="Position" value={job.title} />
                <ReadOnly label="Company" value={job.companyName} />
                <ReadOnly label="Candidate" value={fullName} />
                <ReadOnly label="Email" value={email} />
                <ReadOnly
                  label="Resume"
                  value={resume?.fileName || "Not uploaded"}
                />
              </div>
              <div className="mt-4 rounded-xl border border-[#e5e7f0] p-4">
                <p className="text-xs font-bold text-[#26344c]">Cover letter</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#59647d]">
                  {coverLetter.trim() || "No cover letter added."}
                </p>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="mt-3 text-xs font-bold text-[#5046e5] hover:underline"
                >
                  Edit cover letter
                </button>
              </div>
              <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-[#e5e7f0] p-4 text-sm leading-6 text-[#59647d]">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(event) => setConsent(event.target.checked)}
                  className="mt-1 h-4 w-4 accent-[#5046e5]"
                />
                <span>
                  I confirm that the information in this application is accurate
                  and consent to sharing my profile and resume with{" "}
                  {job.companyName} for recruitment.
                </span>
              </label>
              {error && (
                <p
                  role="alert"
                  className="mt-4 rounded-lg border border-[#f1d1d7] bg-[#fff6f7] px-3 py-2.5 text-xs text-[#ad3a51]"
                >
                  {error}
                </p>
              )}
              <div className="mt-6 flex flex-col-reverse justify-between gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-lg border border-[#dce1ed] px-4 py-2.5 text-sm font-semibold text-[#59647d]"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={submitting || !consent}
                  onClick={() => void submit()}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#5046e5] px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "Submitting…" : "Submit application"}
                  <ArrowRight size={16} />
                </button>
              </div>
            </section>
          )}
        </>
      )}
    </CandidatePageLayout>
  );
}

function ReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-[#7a849a]">{label}</p>
      <p className="mt-1 rounded-lg border border-[#e1e3ed] bg-white px-3.5 py-3 text-sm text-[#34405b]">
        {value || "Not provided"}
      </p>
    </div>
  );
}
