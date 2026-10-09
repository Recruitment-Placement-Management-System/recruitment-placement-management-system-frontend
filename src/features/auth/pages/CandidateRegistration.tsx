import { registerCandidate } from '../../../api/auth.api';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import type { FormEvent, ReactNode } from 'react';

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
} from 'lucide-react';

type AccountType = 'Candidate' | 'Recruiter';

const insights = [
  {
    title: 'Predictive Matching',
    description: 'AI aligns your skills with top enterprise roles.',
    active: true,
  },
  {
    title: 'Lifecycle Tracking',
    description: 'Real-time visibility into your application status.',
    active: false,
  },
];

function App() {
  const [accountType, setAccountType] =
    useState<AccountType>('Candidate');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');

  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate()

  const handleSubmit = async (
  event: FormEvent<HTMLFormElement>
) => {
  event.preventDefault();

  // Clear previous result before every new submission
  setError('');
  setSubmitted(false);

  if (accountType === 'Recruiter') {
    setError(
      'Please use the recruiter registration page to create a recruiter account.'
    );
    return;
  }

  if (password !== confirmation) {
    setError('Passwords do not match.');
    return;
  }

  if (!acceptedTerms) {
    setError(
      'Please accept the Terms of Service and Privacy Policy.'
    );
    return;
  }

  const formData = new FormData(event.currentTarget);

  const fullName =
    formData.get('fullName')?.toString().trim() ?? '';

  const email =
    formData.get('email')?.toString().trim() ?? '';

  const phone =
    formData.get('phone')?.toString().trim() ?? '';

  try {
    setIsSubmitting(true);

    const response = await registerCandidate({
      fullName,
      email,
      password,
      phone: phone || undefined,
    });

    console.log('Candidate registration response:', response);


    
    
    // SUCCESS
    setError('');
    setSubmitted(true);
    
    setPassword('');
    setConfirmation('');
    setAcceptedTerms(false);
    
    navigate(`/verify-email?email=${encodeURIComponent(email)}`);

  } catch (error: unknown) {
    // ERROR
    setSubmitted(false);

    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message ||
        'Registration failed. Please try again.';

      setError(message);
    } else {
      setError('Registration failed. Please try again.');
    }
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <main className="min-h-screen bg-white text-[#171923]">
      <div className="grid min-h-screen lg:grid-cols-[46.1%_53.9%]">

        {/* Left branding panel */}
        <aside className="relative hidden overflow-hidden bg-[#0d1528] px-10 py-10 text-white lg:flex lg:flex-col xl:px-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(77,68,225,0.16),transparent_42%),linear-gradient(140deg,#10172a_10%,#0e1628_58%,#111a38)]" />

          {/* Brand */}
          <div className="relative flex items-center gap-3">
            <div className="grid h-8 w-8 grid-cols-2 gap-1 rounded-[7px] bg-[#5147e8] p-[6px] shadow-[0_4px_16px_rgba(81,71,232,0.4)]">
              <span className="rounded-[2px] bg-white" />
              <span className="rounded-[2px] bg-white" />
              <span className="rounded-[2px] bg-white" />
              <span className="rounded-[2px] bg-white" />
            </div>

            <span className="text-[23px] font-bold tracking-[-0.8px]">
              R&amp;PMS
            </span>
          </div>

          <p className="relative mt-2 text-[12px] font-medium tracking-[0.7px] text-[#a8adbf]">
            ENTERPRISE R&amp;PMS
          </p>

          {/* Centered promotional content */}
          <div className="relative my-auto w-full max-w-[525px] py-12">
            <h2 className="max-w-[420px] text-[25px] font-semibold leading-[1.3] tracking-[-0.5px] text-[#edf0fb]">
              Elevate your career trajectory with data-driven insights.
            </h2>

            <div className="relative mt-8 space-y-5 border-l border-[#283252] pl-6">
              {insights.map((insight) => (
                <div
                  key={insight.title}
                  className={`relative rounded-lg border px-12 py-4 transition-colors ${
                    insight.active
                      ? 'border-[#3b4563] bg-[#252e46]'
                      : 'border-transparent bg-[#121c36]/75 text-[#858ba0]'
                  }`}
                >
                  <span
                    className={`absolute -left-[30px] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border ${
                      insight.active
                        ? 'border-[#554bf1] bg-[#5147e8]'
                        : 'border-[#2f3a5b] bg-[#18223d]'
                    }`}
                  />

                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ea4bb]">
                    <BarChart3 size={22} strokeWidth={1.8} />
                  </div>

                  <p
                    className={`text-[14px] font-semibold ${
                      insight.active
                        ? 'text-[#e5e8f3]'
                        : 'text-[#969caf]'
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
        <section className="flex min-h-screen items-center justify-center px-8 py-10 sm:px-12 lg:px-10 xl:px-16">
          <div className="w-full max-w-[460px]">

            {/* Account type selector */}
            <div className="mx-auto flex w-fit rounded-[9px] border border-[#dedee7] bg-[#f0f1f5] p-1 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
             {(['Candidate', 'Recruiter'] as AccountType[]).map(
  (type) => (
    <button
      key={type}
      type="button"
      onClick={() => {
        if (type === 'Recruiter') {
          navigate('/recruiter/register');
          return;
        }

        setAccountType('Candidate');
        setError('');
        setSubmitted(false);
      }}
      className={`rounded-[6px] px-[17px] py-[7px] text-[14px] font-semibold transition-all ${
        accountType === type
          ? 'bg-[#5046e5] text-white shadow-[0_2px_4px_rgba(80,70,229,0.25)]'
          : 'text-[#525363] hover:text-[#282936]'
      }`}
    >
      {type}
    </button>
  )
)}
            </div>

            {/* Heading */}
            <header className="mt-6">
              <h1 className="text-[34px] font-bold leading-[1.15] tracking-[-1.1px] text-[#15171b] sm:text-[39px]">
                Create your {accountType.toLowerCase()} account
              </h1>

              <p className="mt-3 max-w-[400px] text-[16px] leading-6 text-[#5e6070]">
                Create your account to discover jobs and manage your
                recruitment journey.
              </p>
            </header>

            {/* Form */}
            <form
              className="mt-6 space-y-4"
              onSubmit={handleSubmit}
            >
              <Field
                label="Full name"
                icon={<UserRound size={20} />}
              >
                <input
                  required
                  minLength={2}
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  className="w-full min-w-0 border-0 bg-transparent py-2.5 pl-10 pr-3 text-sm outline-none"
                />
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label="Phone number"
                  icon={<Phone size={20} />}
                >
                  <input
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="Enter your phone number"
                    className="w-full min-w-0 border-0 bg-transparent py-2.5 pl-10 pr-3 text-sm outline-none"
                  />
                </Field>

                <Field
                  label="Email address"
                  icon={<Mail size={20} />}
                >
                  <input
                    required
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email address"
                    className="w-full min-w-0 border-0 bg-transparent py-2.5 pl-10 pr-3 text-sm outline-none"
                  />
                </Field>
              </div>

              <Field
                label="Password"
                icon={<LockKeyhole size={20} />}
                trailing={
                  <VisibilityButton
                    visible={showPassword}
                    onClick={() =>
                      setShowPassword((current) => !current)
                    }
                  />
                }
              >
                <input
                  required
                  minLength={8}
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Create a password"
                  className="w-full min-w-0 border-0 bg-transparent py-2.5 pl-10 pr-10 text-sm outline-none"
                />
              </Field>

              <p className="-mt-2 text-[13px] leading-5 text-[#656777]">
                Use at least 8 characters with a mix of letters and
                numbers.
              </p>

              <Field
                label="Confirm password"
                icon={<ShieldCheck size={20} />}
                trailing={
                  <VisibilityButton
                    visible={showConfirmation}
                    onClick={() =>
                      setShowConfirmation((current) => !current)
                    }
                  />
                }
              >
                <input
                  required
                  minLength={8}
                  name="confirmPassword"
                  type={showConfirmation ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmation}
                  onChange={(event) =>
                    setConfirmation(event.target.value)
                  }
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
                  onChange={(event) =>
                    setAcceptedTerms(event.target.checked)
                  }
                />

                <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-[4px] border border-[#cdd0df] bg-white text-white transition peer-checked:border-[#5046e5] peer-checked:bg-[#5046e5] peer-focus-visible:ring-2 peer-focus-visible:ring-[#5046e5]">
                  {acceptedTerms && (
                    <Check size={12} strokeWidth={3} />
                  )}
                </span>

                <span>
                  I agree to the{' '}
                  <a
                    href="#terms"
                    className="font-medium text-[#4438d6] hover:underline"
                  >
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a
                    href="#privacy"
                    className="font-medium text-[#4438d6] hover:underline"
                  >
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>

              {/* Error */}
              {error && (
                <p
                  role="alert"
                  className="text-sm font-medium text-red-600"
                >
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-3 h-11 w-full rounded-[7px] bg-[#5046e5] text-[14px] font-semibold text-white shadow-[0_3px_7px_rgba(80,70,229,0.25)] transition hover:bg-[#443bd0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5046e5] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? 'Creating account...'
                  : 'Create account'}
              </button>

              {/* Success */}
              {submitted && (
                <p
                  role="status"
                  className="text-center text-sm font-medium text-[#3a8a5b]"
                >
                  Registration successful. Please verify your
                  email.
                </p>
              )}
            </form>

            <p className="mt-5 text-center text-[15px] text-[#5e6070]">
              Already have an account?{' '}
              <button
                type="button"
                className="font-semibold text-[#4438d6] hover:underline"
              >
                Sign in
              </button>
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
  trailing?: ReactNode;
  children: ReactNode;
};

function Field({
  label,
  icon,
  trailing,
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
    </label>
  );
}

type VisibilityButtonProps = {
  visible: boolean;
  onClick: () => void;
};

function VisibilityButton({
  visible,
  onClick,
}: VisibilityButtonProps) {
  return (
    <button
      type="button"
      aria-label={visible ? 'Hide password' : 'Show password'}
      onClick={onClick}
      className="absolute right-3 flex items-center text-[#7e8092] hover:text-[#5046e5]"
    >
      {visible ? (
        <EyeOff size={20} />
      ) : (
        <Eye size={20} />
      )}
    </button>
  );
}

export default App;