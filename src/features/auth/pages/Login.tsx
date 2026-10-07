import { useState } from 'react';
import type { FormEvent } from 'react';
import { Eye, EyeOff, LockKeyhole, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import { login } from '../../../api/auth.api';
import useAuthStore from '../../../store/auth.store';

const lifecycle = [
  { title: 'Candidate Discovery', detail: 'Sourcing and talent pooling' },
  { title: 'Application Management', detail: 'Screening and parsing' },
  { title: 'Interview Process', detail: 'Scheduling and feedback', active: true },
  { title: 'Offer & Placement', detail: 'Closing and onboarding' },
];

function BrandLogo() {
  return (
    <div className="flex items-center gap-3">
      <div
        className="grid h-10 w-10 grid-cols-2 gap-[4px] rounded-[9px] bg-[#5147e8] p-[8px] shadow-[0_4px_12px_rgba(81,71,232,0.25)]"
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

function App() {
  const loginUser = useAuthStore((state)=>state.login);
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setMessage('');
    setIsLoggingIn(true);

    try {
      const response = await login({
        email,
        password,
      });

      console.log('Login response:', response);

      loginUser(response.accessToken,response.user)

      setMessage(response.message);

      const role = response.user.roles[0];

      if (role === 'candidate') {
  navigate('/candidate/dashboard');
} else if (role === 'recruiter') {
  navigate('/recruiter/dashboard');
} else if (role === 'admin') {
  navigate('/admin/dashboard');
}

      // Zustand authentication state will be added here next.
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message ||
          'Login failed. Please try again.';

        setMessage(message);
      } else {
        setMessage('Login failed. Please try again.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleForgotPassword = () => {
    // Navigation will be connected when the forgot-password flow is implemented.
    setMessage('The password reset flow will be connected next.');
  };

  const handleCreateAccount = () => {
    // Navigation is already available through routing.
    setMessage('The registration page will be connected through routing.');
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#172033]">
      <div className="grid min-h-screen lg:grid-cols-[44.5%_55.5%]">
        {/* Left branding panel */}
        <aside className="relative hidden min-h-screen overflow-hidden bg-[#0d1528] px-12 py-10 text-white lg:flex lg:flex-col xl:px-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,rgba(80,70,229,0.30),transparent_42%),radial-gradient(circle_at_0%_0%,rgba(64,78,130,0.15),transparent_40%),linear-gradient(125deg,#111a2b_0%,#0d1528_68%,#151b42_100%)]" />

          <header className="relative">
            <BrandLogo />
          </header>

          <div className="relative my-auto max-w-[460px] py-12">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#343c68] bg-[#1b2340]/70 px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#8178ff]" />
              <span className="text-[10px] font-semibold tracking-[1.4px] text-[#c0c4ff]">
                ONE PLATFORM. EVERY OPPORTUNITY.
              </span>
            </div>

            <h1 className="max-w-[430px] text-[36px] font-bold leading-[1.22] tracking-[-1.3px] text-[#f7f8fc] xl:text-[40px]">
              Connecting talent with opportunity.
            </h1>

            <p className="mt-4 max-w-[410px] text-[14px] leading-7 text-[#b9c4d8] xl:text-[15px]">
              Manage candidates, jobs, applications, interviews, offers, and
              placements through one connected recruitment platform.
            </p>

            <div className="mt-10">
              <p className="text-[10px] font-bold tracking-[1.7px] text-[#8795b1]">
                THE RECRUITMENT LIFECYCLE
              </p>

              <div className="relative mt-6 space-y-6 pl-10">
                <span className="absolute bottom-5 left-[11px] top-3 w-px bg-[#34415d]" />

                {lifecycle.map((item) => (
                  <div
                    key={item.title}
                    className="relative flex items-start"
                  >
                    <span
                      className={`absolute -left-10 top-0.5 grid h-[23px] w-[23px] place-items-center rounded-full border ${
                        item.active
                          ? 'border-[#8178ff] bg-[#5046e5] shadow-[0_0_16px_rgba(80,70,229,0.35)]'
                          : 'border-[#35435f] bg-[#18233a]'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          item.active ? 'bg-white' : 'bg-[#7887a5]'
                        }`}
                      />
                    </span>

                    <div>
                      <p
                        className={`text-[13px] font-semibold ${
                          item.active ? 'text-white' : 'text-[#dce3f0]'
                        }`}
                      >
                        {item.title}
                      </p>

                      <p
                        className={`mt-1 text-[12px] ${
                          item.active ? 'text-[#a7a0ff]' : 'text-[#91a0ba]'
                        }`}
                      >
                        {item.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-9 flex items-center gap-2 text-[11px] text-[#9caac2]">
              <LockKeyhole size={13} />
              <span>Designed for secure recruitment workflows</span>
            </div>
          </div>

          <footer className="relative flex items-center justify-between border-t border-white/[0.08] pt-5 text-[11px] text-[#8d9bb4]">
            <span>© 2026 R&PMS</span>
            <span>Recruitment & Placement Management System</span>
          </footer>
        </aside>

        {/* Login form */}
        <section className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-10 sm:py-12">
          <div className="w-full max-w-[390px]">
            {/* Mobile branding */}
            <div className="mb-10 lg:hidden">
              <div className="inline-flex rounded-xl bg-[#0d1528] p-3">
                <BrandLogo />
              </div>
            </div>

            <header>
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-[#e5e7ff] bg-[#f0efff] text-[#5046e5]">
                <LockKeyhole size={22} strokeWidth={1.8} />
              </div>

              <p className="mb-2 text-[10px] font-bold tracking-[1.8px] text-[#5046e5]">
                YOUR WORKSPACE AWAITS
              </p>

              <h2 className="text-[31px] font-bold leading-tight tracking-[-1.1px] text-[#142039] sm:text-[34px]">
                Welcome back
              </h2>

              <p className="mt-2 text-[14px] leading-6 text-[#71809b]">
                Sign in to access your R&PMS workspace.
              </p>
            </header>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <label className="block">
                <span className="mb-2 block text-[12px] font-semibold text-[#26344c]">
                  Email address
                </span>

                <input
                  required
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setMessage('');
                  }}
                  placeholder="name@company.com"
                  className="h-[47px] w-full rounded-lg border border-[#dce2ec] bg-white px-4 text-[14px] text-[#25334a] shadow-[0_1px_2px_rgba(16,24,40,0.03)] outline-none transition placeholder:text-[#9cafc8] hover:border-[#c7cfe0] focus:border-[#5046e5] focus:ring-4 focus:ring-[#5046e5]/[0.08]"
                />
              </label>

              <label className="block">
                <span className="mb-2 flex items-center justify-between gap-3 text-[12px] font-semibold text-[#26344c]">
                  <span>Password</span>

                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="font-semibold text-[#5046e5] transition hover:text-[#3930c5] hover:underline"
                  >
                    Forgot password?
                  </button>
                </span>

                <span className="relative block">
                  <LockKeyhole
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 hidden -translate-y-1/2 text-[#94a5bd] sm:block"
                  />

                  <input
                    required
                    minLength={8}
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setMessage('');
                    }}
                    placeholder="Enter your password"
                    className="h-[47px] w-full rounded-lg border border-[#dce2ec] bg-white px-4 text-[14px] text-[#25334a] shadow-[0_1px_2px_rgba(16,24,40,0.03)] outline-none transition placeholder:text-[#9cafc8] hover:border-[#c7cfe0] focus:border-[#5046e5] focus:ring-4 focus:ring-[#5046e5]/[0.08] sm:pl-10 sm:pr-11"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                    aria-pressed={showPassword}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#91a3bd] transition hover:text-[#5046e5]"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </span>
              </label>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="group flex h-[47px] w-full items-center justify-center gap-2 rounded-lg bg-[#5046e5] text-[14px] font-semibold text-white shadow-[0_4px_10px_rgba(80,70,229,0.18)] transition hover:bg-[#443bd0] focus:outline-none focus:ring-4 focus:ring-[#5046e5]/20 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoggingIn ? 'Signing in...' : 'Sign in'}

                {!isLoggingIn && (
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                )}
              </button>
            </form>

            {message && (
              <p
                role="status"
                aria-live="polite"
                className="mt-4 rounded-lg border border-[#e2e1ff] bg-[#f3f2ff] px-3 py-2.5 text-center text-[12px] leading-5 text-[#5046e5]"
              >
                {message}
              </p>
            )}

            <div className="my-7 flex items-center gap-3">
              <span className="h-px flex-1 bg-[#e7ebf2]" />
              <span className="text-[10px] font-medium tracking-[1.2px] text-[#9aa6ba]">
                NEW TO R&PMS?
              </span>
              <span className="h-px flex-1 bg-[#e7ebf2]" />
            </div>

            <p className="text-center text-[13px] text-[#66748a]">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={handleCreateAccount}
                className="font-semibold text-[#5046e5] transition hover:text-[#3930c5] hover:underline"
              >
                Create an account
              </button>
            </p>

            <p className="mt-10 text-center text-[11px] leading-5 text-[#9aa6ba]">
              By signing in, you agree to our{' '}
              <span className="cursor-pointer text-[#6c7890] underline underline-offset-2">
                Terms of Service
              </span>{' '}
              and{' '}
              <span className="cursor-pointer text-[#6c7890] underline underline-offset-2">
                Privacy Policy
              </span>
              .
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;