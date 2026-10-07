
import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Search,
  ListChecks,
  Handshake,
  LockKeyhole,
  CheckCircle2,
  LoaderCircle,
  ShieldCheck,
} from 'lucide-react';

const features = [
  {
    title: 'Source',
    detail: 'AI-driven candidate discovery',
    Icon: Search,
  },
  {
    title: 'Screen',
    detail: 'Automated skills assessment',
    Icon: ListChecks,
    active: true,
  },
  {
    title: 'Hire',
    detail: 'Seamless onboarding flow',
    Icon: Handshake,
  },
];

function BrandLogo() {
  return (
    <div className="flex items-center gap-3">
      <div
        className="grid h-10 w-10 grid-cols-2 gap-[4px] rounded-[9px] bg-[#5147e8] p-[8px] shadow-[0_4px_12px_rgba(81,71,232,0.3)]"
        aria-hidden="true"
      >
        <span className="rounded-[2px] bg-white" />
        <span className="rounded-[2px] bg-white/75" />
        <span className="rounded-[2px] bg-white/75" />
        <span className="rounded-[2px] bg-white" />
      </div>

      <div>
        <p className="text-[23px] font-bold leading-none tracking-[-0.8px] text-white">
          R&PMS
        </p>
        <p className="mt-1.5 text-[9px] font-semibold tracking-[1.5px] text-[#a9b4cb]">
          ENTERPRISE R&PMS
        </p>
      </div>
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  showPassword,
  onToggle,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  showPassword: boolean;
  onToggle: () => void;
  autoComplete: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[12px] font-semibold text-[#26344c]">
        {label}
      </span>

      <span className="relative block">
        <LockKeyhole
          size={17}
          className="pointer-events-none absolute left-3.5 top-1/2 hidden -translate-y-1/2 text-[#94a5bd] sm:block"
        />

        <input
          required
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          placeholder={
            label === 'New password'
              ? 'Enter your new password'
              : 'Re-enter your new password'
          }
          className="h-[49px] w-full rounded-lg border border-[#dce2ec] bg-white px-4 text-[14px] text-[#25334a] shadow-[0_1px_2px_rgba(16,24,40,0.03)] outline-none transition placeholder:text-[#9cafc8] hover:border-[#c7cfe0] focus:border-[#5046e5] focus:ring-4 focus:ring-[#5046e5]/[0.08] sm:pl-10 sm:pr-11"
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={showPassword ? `Hide ${label}` : `Show ${label}`}
          aria-pressed={showPassword}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#91a3bd] transition hover:text-[#5046e5]"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </span>
    </label>
  );
}

function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const passwordsMatch =
    confirmPassword.length === 0 || password === confirmPassword;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setIsSuccess(false);

    if (password.length < 8) {
      setMessage('Your password must contain at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Your passwords do not match.');
      return;
    }

    setIsLoading(true);

    // TODO: Read the reset token from the URL and call the backend API.
    // Do not mark the password as reset until the API confirms success.
    setTimeout(() => {
      setIsLoading(false);
      setMessage(
        'The form is ready for backend integration. Your password has not been changed.',
      );
    }, 500);
  };

  const handleBackToLogin = () => {
    // TODO: Replace with React Router navigation to the login page.
    window.history.back();
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#172033]">
      <div className="grid min-h-screen lg:grid-cols-[45.5%_54.5%]">
        {/* Left branding panel */}
        <aside className="relative hidden min-h-screen overflow-hidden bg-[#0d1528] px-10 py-9 text-white lg:flex lg:flex-col xl:px-14 2xl:px-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,rgba(80,70,229,0.34),transparent_43%),radial-gradient(circle_at_0%_0%,rgba(64,78,130,0.2),transparent_40%),linear-gradient(125deg,#111a2b_0%,#0d1528_65%,#191d4b_100%)]" />

          <div className="absolute -right-24 top-[30%] h-72 w-72 rounded-full bg-[#5046e5]/10 blur-3xl" />

          <header className="relative">
            <BrandLogo />
          </header>

          <div className="relative my-auto w-full max-w-[590px] py-10">
            <p className="text-[11px] font-bold tracking-[2px] text-[#a9a4ff]">
              ENTERPRISE RECRUITMENT PLATFORM
            </p>

            <h1 className="mt-4 max-w-[510px] text-[36px] font-bold leading-[1.2] tracking-[-1.3px] text-[#f7f8fc] xl:text-[42px]">
              A secure new beginning for your account.
            </h1>

            <p className="mt-4 max-w-[480px] text-[15px] leading-7 text-[#b9c4d8]">
              Choose a strong password to protect your account and get back to
              managing your recruitment workflow.
            </p>

            <div className="mt-10 space-y-0">
              {features.map(({ title, detail, Icon, active }, index) => (
                <div key={title}>
                  <div
                    className={`relative flex items-center gap-5 overflow-hidden rounded-xl border px-5 py-5 transition ${
                      active
                        ? 'border-[#6660e9]/50 bg-gradient-to-r from-[#292b5a]/80 to-[#1b253c]/90 shadow-[0_8px_30px_rgba(0,0,0,0.12)]'
                        : 'border-white/[0.09] bg-white/[0.035]'
                    }`}
                  >
                    {active && (
                      <span className="absolute bottom-0 left-0 top-0 w-[3px] bg-gradient-to-b from-[#b4aaff] to-[#5046e5]" />
                    )}

                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                        active
                          ? 'bg-gradient-to-br from-[#6258ff] to-[#4338ca] text-white shadow-lg shadow-[#5046e5]/20'
                          : 'bg-[#282e5e] text-[#d6d3ff]'
                      }`}
                    >
                      <Icon size={23} strokeWidth={1.9} />
                    </div>

                    <div>
                      <p className="text-[15px] font-semibold text-[#f1f4fc]">
                        {title}
                      </p>
                      <p
                        className={`mt-1 text-[13px] ${
                          active ? 'text-[#b6b0ff]' : 'text-[#a2aec4]'
                        }`}
                      >
                        {detail}
                      </p>
                    </div>
                  </div>

                  {index < features.length - 1 && (
                    <div className="ml-10 h-5 w-px bg-gradient-to-b from-[#59617e] to-[#343c58]" />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-9 flex items-center gap-3 rounded-lg border border-white/[0.07] bg-white/[0.025] px-4 py-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#282e5e] text-[#a9a4ff]">
                <ShieldCheck size={19} />
              </div>
              <div>
                <p className="text-[12px] font-semibold text-[#e6eaf5]">
                  Account security matters
                </p>
                <p className="mt-1 text-[11px] text-[#9caac2]">
                  Use a unique password that you do not share.
                </p>
              </div>
            </div>
          </div>

          <footer className="relative flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] pt-5 text-[11px] text-[#8d9bb4]">
            <span>© 2026 R&PMS</span>
            <span>Recruitment & Placement Management System</span>
          </footer>
        </aside>

        {/* Reset password form */}
        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10 sm:py-12">
          <div className="w-full max-w-[440px]">
            {/* Mobile branding */}
            <div className="mb-12 inline-flex rounded-xl bg-[#0d1528] p-3 lg:hidden">
              <BrandLogo />
            </div>

            <div className="mb-7 flex h-[58px] w-[58px] items-center justify-center rounded-2xl border border-[#e6e3ff] bg-gradient-to-br from-[#f4f2ff] to-[#eae8ff] text-[#5046e5] shadow-[0_4px_12px_rgba(80,70,229,0.07)]">
              <LockKeyhole size={26} strokeWidth={1.8} />
            </div>

            <p className="mb-2 text-[10px] font-bold tracking-[1.8px] text-[#5046e5]">
              ACCOUNT RECOVERY
            </p>

            <h2 className="text-[32px] font-bold leading-tight tracking-[-1.2px] text-[#142039] sm:text-[36px]">
              Create a new password
            </h2>

            <p className="mt-3 text-[14px] leading-7 text-[#71809b] sm:text-[15px]">
              Choose a new password for your R&PMS account.
            </p>

            <form onSubmit={handleSubmit} className="mt-9 space-y-5">
              <PasswordField
                label="New password"
                value={password}
                onChange={(value) => {
                  setPassword(value);
                  setMessage('');
                  setIsSuccess(false);
                }}
                showPassword={showPassword}
                onToggle={() => setShowPassword((current) => !current)}
                autoComplete="new-password"
              />

              <PasswordField
                label="Confirm new password"
                value={confirmPassword}
                onChange={(value) => {
                  setConfirmPassword(value);
                  setMessage('');
                  setIsSuccess(false);
                }}
                showPassword={showConfirmPassword}
                onToggle={() =>
                  setShowConfirmPassword((current) => !current)
                }
                autoComplete="new-password"
              />

              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-[12px] text-red-600">
                  Your passwords do not match.
                </p>
              )}

              <div className="rounded-lg border border-[#e6e8f0] bg-gradient-to-br from-[#f7f8fb] to-[#f0f2f7] p-4">
                <p className="text-[12px] font-semibold text-[#596174]">
                  Password requirements
                </p>
                <ul className="mt-2 space-y-2 text-[12px] text-[#717b90]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2
                      size={15}
                      className={
                        password.length >= 8
                          ? 'text-emerald-600'
                          : 'text-[#a5adbd]'
                      }
                    />
                    At least 8 characters
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2
                      size={15}
                      className={
                        /[A-Za-z]/.test(password) && /\d/.test(password)
                          ? 'text-emerald-600'
                          : 'text-[#a5adbd]'
                      }
                    />
                    Contains letters and numbers
                  </li>
                </ul>
              </div>

              {message && (
                <p
                  role="status"
                  aria-live="polite"
                  className={`rounded-lg border px-3 py-3 text-[12px] leading-5 ${
                    isSuccess
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-[#e2e1ff] bg-[#f3f2ff] text-[#5046e5]'
                  }`}
                >
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading || !passwordsMatch}
                className="flex h-[49px] w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#5549ed] to-[#493de0] text-[14px] font-semibold text-white shadow-[0_4px_12px_rgba(80,70,229,0.2)] transition hover:from-[#4b40dc] hover:to-[#3f34cd] focus:outline-none focus:ring-4 focus:ring-[#5046e5]/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <LoaderCircle size={17} className="animate-spin" />
                    Resetting password...
                  </>
                ) : (
                  'Reset password'
                )}
              </button>
            </form>

            <button
              type="button"
              onClick={handleBackToLogin}
              className="mt-6 flex w-full items-center justify-center gap-2 py-2 text-[13px] font-semibold text-[#5046e5] transition hover:text-[#3930c5] hover:underline"
            >
              <ArrowLeft size={16} />
              Back to sign in
            </button>

            <p className="mt-9 text-center text-[11px] leading-5 text-[#9aa6ba]">
              © 2026 R&PMS · Recruitment & Placement Management System
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default ResetPasswordPage;
