
import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Info,
  LockKeyhole,
  Mail,
  Search,
  ListChecks,
  Handshake,
  LoaderCircle,
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

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setIsLoading(true);

    // TODO: Connect to the backend forgot-password API.
    // This timeout is only a temporary UI demonstration.
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
      setMessage(
        'If an account exists for this email, password reset instructions will be sent.',
      );
    }, 600);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setMessage('');
    setSubmitted(false);
  };

  const handleBackToLogin = () => {
    // TODO: Navigate to the login page when routing is configured.
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
            <div className="mb-7">
              <p className="text-[11px] font-bold tracking-[2px] text-[#a9a4ff]">
                ENTERPRISE RECRUITMENT PLATFORM
              </p>
              <h1 className="mt-4 max-w-[500px] text-[36px] font-bold leading-[1.2] tracking-[-1.3px] text-[#f7f8fc] xl:text-[42px]">
                Every great hire starts with the right connection.
              </h1>
              <p className="mt-4 max-w-[480px] text-[15px] leading-7 text-[#b9c4d8]">
                A smarter way to discover talent, streamline recruitment, and
                build teams that move your organization forward.
              </p>
            </div>

            <div className="mt-9 space-y-0">
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
                <LockKeyhole size={18} />
              </div>
              <div>
                <p className="text-[12px] font-semibold text-[#e6eaf5]">
                  Your account, protected
                </p>
                <p className="mt-1 text-[11px] text-[#9caac2]">
                  Secure access to your recruitment workspace
                </p>
              </div>
            </div>
          </div>

          <footer className="relative flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] pt-5 text-[11px] text-[#8d9bb4]">
            <span>© 2026 R&PMS</span>
            <span className="flex gap-5">
              <span>Privacy</span>
              <span>Terms</span>
            </span>
          </footer>
        </aside>

        {/* Forgot password form */}
        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10 sm:py-12">
          <div className="w-full max-w-[440px]">
            {/* Mobile branding */}
            <div className="mb-12 inline-flex rounded-xl bg-[#0d1528] p-3 lg:hidden">
              <BrandLogo />
            </div>

            <div className="mb-8 flex h-[58px] w-[58px] items-center justify-center rounded-2xl border border-[#e6e3ff] bg-gradient-to-br from-[#f4f2ff] to-[#eae8ff] text-[#5046e5] shadow-[0_4px_12px_rgba(80,70,229,0.07)]">
              {submitted ? (
                <CheckCircle2 size={27} strokeWidth={1.8} />
              ) : (
                <LockKeyhole size={26} strokeWidth={1.8} />
              )}
            </div>

            <p className="mb-2 text-[10px] font-bold tracking-[1.8px] text-[#5046e5]">
              ACCOUNT RECOVERY
            </p>

            <h2 className="text-[32px] font-bold leading-tight tracking-[-1.2px] text-[#142039] sm:text-[36px]">
              {submitted ? 'Check your email' : 'Forgot your password?'}
            </h2>

            <p className="mt-3 text-[14px] leading-7 text-[#71809b] sm:text-[15px]">
              {submitted
                ? 'If the email address is registered, you will receive instructions to continue resetting your password.'
                : "Enter the email address associated with your R&PMS account and we'll send you instructions to reset your password."}
            </p>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="mt-9 space-y-5">
                <label className="block">
                  <span className="mb-2 block text-[12px] font-semibold text-[#26344c]">
                    Email address
                  </span>

                  <span className="relative block">
                    <Mail
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#94a5bd]"
                    />
                    <input
                      required
                      type="email"
                      name="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => handleEmailChange(event.target.value)}
                      placeholder="name@company.com"
                      className="h-[49px] w-full rounded-lg border border-[#dce2ec] bg-white pl-11 pr-4 text-[14px] text-[#25334a] shadow-[0_1px_2px_rgba(16,24,40,0.03)] outline-none transition placeholder:text-[#9cafc8] hover:border-[#c7cfe0] focus:border-[#5046e5] focus:ring-4 focus:ring-[#5046e5]/[0.08]"
                    />
                  </span>
                </label>

                {message && (
                  <p
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700"
                  >
                    {message}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="group flex h-[49px] w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#5549ed] to-[#493de0] text-[14px] font-semibold text-white shadow-[0_4px_12px_rgba(80,70,229,0.2)] transition hover:from-[#4b40dc] hover:to-[#3f34cd] focus:outline-none focus:ring-4 focus:ring-[#5046e5]/20 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <LoaderCircle size={17} className="animate-spin" />
                      Sending instructions...
                    </>
                  ) : (
                    <>
                      Send reset instructions
                      <ArrowRight
                        size={17}
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="mt-8 rounded-xl border border-[#dedcff] bg-gradient-to-br from-[#f7f6ff] to-[#f0efff] p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-[#5046e5]">
                    <Info size={19} />
                  </div>
                  <p className="text-[13px] leading-6 text-[#525a75]">
                    {message}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setMessage('');
                  }}
                  className="mt-4 text-[12px] font-semibold text-[#5046e5] hover:underline"
                >
                  Try another email address
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleBackToLogin}
              className="mt-4 flex h-[48px] w-full items-center justify-center gap-2 rounded-lg border border-[#dce2ec] bg-white text-[14px] font-semibold text-[#26344c] transition hover:border-[#c8c5f8] hover:bg-[#faf9ff] hover:text-[#5046e5] focus:outline-none focus:ring-4 focus:ring-[#5046e5]/[0.08]"
            >
              <ArrowLeft size={17} />
              Back to sign in
            </button>

            <div className="mt-8 flex items-start gap-3 rounded-xl border border-[#e0e4ed] bg-gradient-to-br from-[#f4f5f8] to-[#eef0f5] p-4">
              <Info
                size={19}
                className="mt-0.5 shrink-0 text-[#7c8192]"
              />
              <p className="text-[12px] leading-6 text-[#596174]">
                For your security, password reset instructions should only be
                sent to a registered email address. Check your spam folder if
                you don't receive an email.
              </p>
            </div>

            <p className="mt-8 text-center text-[11px] text-[#9aa6ba]">
              © 2026 R&PMS · Recruitment & Placement Management System
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default ForgotPasswordPage;
