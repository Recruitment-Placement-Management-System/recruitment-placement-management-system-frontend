import { registerCandidate } from "../../../api/auth.api";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import type { FormEvent, ReactNode } from "react";

import {
  BarChart3,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";

type AccountType = "Candidate" | "Recruiter";

const insights = [
  {
    title: "Predictive Matching",
    description: "AI aligns your skills with top enterprise roles.",
    active: true,
  },
  {
    title: "Lifecycle Tracking",
    description: "Real-time visibility into your application status.",
    active: false,
  },
];

function BrandLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 grid-cols-2 gap-[4px] rounded-[9px] bg-[#5147e8] p-[8px] shadow-[0_4px_12px_rgba(81,71,232,0.3)]" aria-hidden="true">
        <span className="rounded-[2px] bg-white" />
        <span className="rounded-[2px] bg-white/75" />
        <span className="rounded-[2px] bg-white/75" />
        <span className="rounded-[2px] bg-white" />
      </div>
      <div>
        <p className="text-[23px] font-bold leading-none tracking-[-0.8px] text-white">R&amp;PMS</p>
        <p className="mt-1.5 text-[9px] font-semibold tracking-[1.5px] text-[#a9b4cb]">ENTERPRISE R&amp;PMS</p>
      </div>
    </div>
  );
}

function App() {
  const [accountType, setAccountType] = useState<AccountType>("Candidate");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [didSubmit, setDidSubmit] = useState(false);

  const navigate = useNavigate();
  const normalizedName = fullName.trim();
  const normalizedEmail = email.trim();
  const nameError = !normalizedName
    ? "Full name is required."
    : normalizedName.length < 2
      ? "Enter at least 2 characters."
      : "";
  const emailError = !normalizedEmail
    ? "Email is required."
    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
      ? "Enter a valid email address."
      : "";
  const phoneDigits = phone.replace(/\D/g, "");
  const phoneError =
    phone.trim() &&
    (!/^[+()\d\s.-]+$/.test(phone.trim()) ||
      phoneDigits.length < 10 ||
      phoneDigits.length > 15)
      ? "Enter a valid phone number"
      : "";
  const passwordError = !password
    ? "Password is required."
    : password.length < 8
      ? "Use at least 8 characters."
      : !/[A-Za-z]/.test(password) || !/\d/.test(password)
        ? "Include at least one letter and one number."
        : "";
  const confirmationError = !confirmation
    ? "Please confirm your password."
    : password !== confirmation
      ? "Passwords do not match."
      : "";
  const showError = (value: string) => Boolean(value || didSubmit);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setDidSubmit(true);
    setError("");
    setSubmitted(false);

    if (accountType === "Recruiter") {
      setError(
        "Please use the recruiter registration page to create a recruiter account.",
      );
      return;
    }

    if (
      nameError ||
      emailError ||
      phoneError ||
      passwordError ||
      confirmationError ||
      !acceptedTerms
    )
      return;

    try {
      setIsSubmitting(true);

      await registerCandidate({
        fullName: normalizedName,
        email: normalizedEmail,
        password,
        phone: phone.trim() || undefined,
      });
      // SUCCESS
      setError("");
      setSubmitted(true);

      setPassword("");
      setConfirmation("");
      setAcceptedTerms(false);

      navigate(`/verify-email?email=${encodeURIComponent(normalizedEmail)}`);
    } catch (error: unknown) {
      // ERROR
      setSubmitted(false);

      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message ||
          "Registration failed. Please try again.";

        setError(message);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="register-page min-h-screen bg-[#f8fafc] text-[#172033]">
      <div className="grid min-h-screen lg:grid-cols-[42%_58%]">
        {/* Left branding panel */}
        <aside className="relative hidden overflow-hidden bg-[#0d1528] px-10 py-10 text-white lg:flex lg:flex-col xl:px-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(77,68,225,0.16),transparent_42%),linear-gradient(140deg,#10172a_10%,#0e1628_58%,#111a38)]" />

          <header className="relative">
            <BrandLogo />
          </header>

          {/* Centered promotional content */}
          <div className="relative my-auto w-full max-w-[525px] py-12">
            <h2 className="max-w-[1000px] text-[25px] font-semibold leading-[1.3] tracking-[-0.5px] text-[#edf0fb]">
              Elevate your career trajectory with data-driven insights.
            </h2>

            <div className="relative mt-8 space-y-5 border-l border-[#283252] pl-6">
              {insights.map((insight) => (
                <div
                  key={insight.title}
                  className={`relative rounded-lg border px-12 py-4 transition-colors ${
                    insight.active
                      ? "border-[#3b4563] bg-[#252e46]"
                      : "border-transparent bg-[#121c36]/75 text-[#858ba0]"
                  }`}
                >
                  <span
                    className={`absolute -left-[30px] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border ${
                      insight.active
                        ? "border-[#554bf1] bg-[#5147e8]"
                        : "border-[#2f3a5b] bg-[#18223d]"
                    }`}
                  />

                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ea4bb]">
                    <BarChart3 size={22} strokeWidth={1.8} />
                  </div>

                  <p
                    className={`text-[14px] font-semibold ${
                      insight.active ? "text-[#e5e8f3]" : "text-[#969caf]"
                    }`}
                  >
                    {insight.title}
                  </p>

                  <p className="mt-1 text-[14px] leading-5">
                    {insight.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="relative flex items-center justify-between gap-4 text-[12px] font-medium tracking-[0.35px] text-[#9298ad]">
            <span>© 2026 R&amp;PMS</span>

            <div className="flex gap-5">
              <a href="#privacy" className="hover:text-white">
                Privacy
              </a>

              <a href="#terms" className="hover:text-white">
                Terms
              </a>
            </div>
          </div>
        </aside>

        {/* Registration panel */}
        <section className="flex min-h-screen items-start justify-center px-5 py-8 sm:px-8 lg:px-8 xl:px-12">
          <div className="w-full max-w-[650px]">
            <div className="mb-6 lg:hidden">
              <div className="inline-flex rounded-xl bg-[#0d1528] p-3">
                <BrandLogo />
              </div>
            </div>

            {/* Account type selector */}
            <div className="mx-auto mb-6 flex w-fit rounded-lg border border-[#e1e5ee] bg-[#eef0f5] p-1">
              {(["Candidate", "Recruiter"] as AccountType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    if (type === "Recruiter") {
                      navigate("/recruiter/register", { viewTransition: true });
                      return;
                    }

                    setAccountType("Candidate");
                    setError("");
                    setSubmitted(false);
                  }}
                  className={`rounded-md px-3.5 py-2 text-[12px] font-semibold transition ${
                    accountType === type
                      ? "bg-white text-[#42465a] shadow-sm"
                      : "text-[#697186] hover:text-[#42465a]"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Heading */}
            <header>
              <h1 className="text-[29px] font-bold leading-tight tracking-[-1px] text-[#142039] sm:text-[32px]">
                Create your {accountType.toLowerCase()} account
              </h1>

              <p className="mt-2 max-w-[400px] text-[13px] leading-6 text-[#71809b] sm:text-[14px]">
                Create your account to discover jobs and manage your recruitment
                journey.
              </p>
            </header>

            {/* Form */}
            <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
              <Field
                label="Full name"
                icon={<UserRound size={20} />}
                errorId="fullName-error"
                error={showError(fullName) ? nameError : ""}
              >
                <input
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(event) => {
                    setFullName(event.target.value);
                    setError("");
                  }}
                  aria-invalid={Boolean(showError(fullName) && nameError)}
                  aria-describedby="fullName-error"
                  placeholder="Enter your full name"
                  className="w-full min-w-0 border-0 bg-transparent py-2.5 pl-10 pr-3 text-sm outline-none"
                />
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label="Phone number"
                  icon={<Phone size={20} />}
                  errorId="phone-error"
                  error={showError(phone) ? phoneError : ""}
                >
                  <input
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(event) => {
                      setPhone(event.target.value);
                      setError("");
                    }}
                    aria-invalid={Boolean(showError(phone) && phoneError)}
                    aria-describedby="phone-error"
                    placeholder="Enter your phone number"
                    className="w-full min-w-0 border-0 bg-transparent py-2.5 pl-10 pr-3 text-sm outline-none"
                  />
                </Field>

                <Field
                  label="Email address"
                  icon={<Mail size={20} />}
                  errorId="email-error"
                  error={showError(email) ? emailError : ""}
                >
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setError("");
                    }}
                    aria-invalid={Boolean(showError(email) && emailError)}
                    aria-describedby="email-error"
                    placeholder="Enter your email address"
                    className="w-full min-w-0 border-0 bg-transparent py-2.5 pl-10 pr-3 text-sm outline-none"
                  />
                </Field>
              </div>

              <Field
                label="Password"
                icon={<LockKeyhole size={20} />}
                errorId="password-error"
                error={showError(password) ? passwordError : ""}
                trailing={
                  <VisibilityButton
                    visible={showPassword}
                    onClick={() => setShowPassword((current) => !current)}
                  />
                }
              >
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                  aria-invalid={Boolean(showError(password) && passwordError)}
                  aria-describedby="password-error password-guidance"
                  placeholder="Create a password"
                  className="w-full min-w-0 border-0 bg-transparent py-2.5 pl-10 pr-10 text-sm outline-none"
                />
              </Field>

              <p
                id="password-guidance"
                className="-mt-2 text-[13px] leading-5 text-[#656777]"
              >
                Use at least 8 characters with a mix of letters and numbers.
              </p>

              <Field
                label="Confirm password"
                icon={<ShieldCheck size={20} />}
                errorId="confirmPassword-error"
                error={showError(confirmation) ? confirmationError : ""}
                trailing={
                  <VisibilityButton
                    visible={showConfirmation}
                    onClick={() => setShowConfirmation((current) => !current)}
                  />
                }
              >
                <input
                  name="confirmPassword"
                  type={showConfirmation ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmation}
                  onChange={(event) => {
                    setConfirmation(event.target.value);
                    setError("");
                  }}
                  aria-invalid={Boolean(
                    showError(confirmation) && confirmationError,
                  )}
                  aria-describedby="confirmPassword-error"
                  placeholder="Re-enter your password"
                  className="w-full min-w-0 border-0 bg-transparent py-2.5 pl-10 pr-10 text-sm outline-none"
                />
              </Field>

              {/* Terms checkbox */}
              <label className="flex cursor-pointer items-start gap-3 pt-2 text-[14px] leading-5 text-[#626474]">
                <input
                  className="peer sr-only"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(event) => {
                    setAcceptedTerms(event.target.checked);
                    setError("");
                  }}
                />

                <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-[4px] border border-[#cdd0df] bg-white text-white transition peer-checked:border-[#5046e5] peer-checked:bg-[#5046e5] peer-focus-visible:ring-2 peer-focus-visible:ring-[#5046e5]">
                  {acceptedTerms && <Check size={12} strokeWidth={3} />}
                </span>

                <span>
                  I agree to the{" "}
                  <a
                    href="#terms"
                    className="font-medium text-[#4438d6] hover:underline"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#privacy"
                    className="font-medium text-[#4438d6] hover:underline"
                  >
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>
              <p role="alert" className="-mt-2 min-h-4 text-xs leading-4 text-red-600">
                {error || (didSubmit && !acceptedTerms
                  ? 'Please accept the Terms of Service and Privacy Policy.'
                  : '\u00a0')}
              </p>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-11 w-full rounded-[7px] bg-[#5046e5] text-[14px] font-semibold text-white shadow-[0_3px_7px_rgba(80,70,229,0.25)] transition hover:bg-[#443bd0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5046e5] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Creating account..." : "Create account"}
              </button>

              {/* Success */}
              {submitted && (
                <p
                  role="status"
                  className="text-center text-sm font-medium text-[#3a8a5b]"
                >
                  Registration successful. Please verify your email.
                </p>
              )}
            </form>

            <p className="mt-5 text-center text-[15px] text-[#5e6070]">
              Already have an account?{" "}
              <a
                href="/login"
                className="font-semibold text-[#5046e5] hover:underline"
              >
                Sign in
              </a>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

type FieldProps = {
  label: string;
  icon: ReactNode;
  errorId: string;
  trailing?: ReactNode;
  error?: string;
  children: ReactNode;
};

function Field({
  label,
  icon,
  errorId,
  trailing,
  error,
  children,
}: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-[14px] font-semibold text-[#202127]">
        {label}
      </span>

      <span className="relative flex items-center rounded-[7px] border border-[#cdd0df] bg-white transition focus-within:border-[#5046e5] focus-within:ring-2 focus-within:ring-[#5046e5]/10">
        <span className="pointer-events-none absolute left-3 flex items-center text-[#7e8092]">
          {icon}
        </span>

        {children}

        {trailing}
      </span>
      <span id={errorId} className="mt-1.5 block min-h-4 text-xs leading-4 text-red-600">
        {error || '\u00a0'}
      </span>
    </label>
  );
}

type VisibilityButtonProps = {
  visible: boolean;
  onClick: () => void;
};

function VisibilityButton({ visible, onClick }: VisibilityButtonProps) {
  return (
    <button
      type="button"
      aria-label={visible ? "Hide password" : "Show password"}
      onClick={onClick}
      className="absolute right-3 flex items-center text-[#7e8092] hover:text-[#5046e5]"
    >
      {visible ? <EyeOff size={20} /> : <Eye size={20} />}
    </button>
  );
}

export default App;
