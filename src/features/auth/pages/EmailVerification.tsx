import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate,useSearchParams } from 'react-router-dom';
import type {
  ChangeEvent,
  ClipboardEvent,
  KeyboardEvent,
} from 'react';
import { Check, MailCheck, Shield } from 'lucide-react';

import { verifyEmail } from '../../../api/auth.api';

const CODE_LENGTH = 6;
const RESEND_DELAY = 45;

function EmailVerificationPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams();

  const [code, setCode] = useState<string[]>(
    Array(CODE_LENGTH).fill(''),
  );
  const [secondsRemaining, setSecondsRemaining] =
    useState(RESEND_DELAY);
  const [emailValue, setEmailValue] = useState(
    searchParams.get('email')||'',
  );
  const [editingEmail, setEditingEmail] = useState(false);
  const [verified, setVerified] = useState(false);

  const [error,setError] = useState('')
  const [isVerifying,setIsVerifying] = useState(false)

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (secondsRemaining <= 0) return;

    const timer = window.setTimeout(() => {
      setSecondsRemaining((previous) => previous - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [secondsRemaining]);

  const handleCodeChange = (
    index: number,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.value
      .replace(/\D/g, '')
      .slice(-1);

    const nextCode = [...code];
    nextCode[index] = value;

    setCode(nextCode);
    setVerified(false);

    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (
      event.key === 'Backspace' &&
      !code[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (
      event.key === 'ArrowRight' &&
      index < CODE_LENGTH - 1
    ) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (
    event: ClipboardEvent<HTMLInputElement>,
  ) => {
    event.preventDefault();

    const pastedCode = event.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, CODE_LENGTH);

    if (!pastedCode) return;

    const nextCode = Array(CODE_LENGTH).fill('');

    pastedCode.split('').forEach((digit, index) => {
      nextCode[index] = digit;
    });

    setCode(nextCode);
    setVerified(false);

    const nextIndex = Math.min(
      pastedCode.length,
      CODE_LENGTH - 1,
    );

    inputRefs.current[nextIndex]?.focus();
  };

  const handleResend = () => {
    if (secondsRemaining > 0) return;

    setCode(Array(CODE_LENGTH).fill(''));
    setVerified(false);
    setSecondsRemaining(RESEND_DELAY);
    inputRefs.current[0]?.focus();

    // Connect this action to the backend resend-verification API.
  };

  const handleVerify = async ()=>{
    const verificationCode = code.join('');

    if(verificationCode.length !== CODE_LENGTH){
      return;
    }

    if(!emailValue){
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setVerified(false);
    setIsVerifying(true)

    try{
      await verifyEmail({email:emailValue,verificationCode})

      setVerified(true)

      setTimeout(() => {
      navigate('/login');
    }, 1200);

    }catch(error:unknown){
       if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message ||
        'Email verification failed. Please try again.';

      setError(message);
    } else {
      setError('Email verification failed. Please try again.');
    }
    }finally{
      setIsVerifying(false)
    }
  }

  const formattedTime = `00:${String(
    secondsRemaining,
  ).padStart(2, '0')}`;

  return (
    <main className="min-h-screen bg-white text-[#171923]">
      <div className="grid min-h-screen lg:grid-cols-[46.1%_53.9%]">
        {/* Left branding panel */}
        <aside className="relative hidden min-h-screen overflow-hidden bg-[#0d1528] px-8 py-10 text-white lg:flex lg:flex-col">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(77,68,225,0.16),transparent_42%),linear-gradient(140deg,#10172a_10%,#0e1628_58%,#111a38)]" />

          {/* Consistent R&PMS branding */}
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="grid h-8 w-8 grid-cols-2 gap-1 rounded-[7px] bg-[#5147e8] p-[6px] shadow-[0_4px_16px_rgba(81,71,232,0.4)]">
                <span className="rounded-[2px] bg-white" />
                <span className="rounded-[2px] bg-white" />
                <span className="rounded-[2px] bg-white" />
                <span className="rounded-[2px] bg-white" />
              </div>

              <span className="text-[23px] font-bold tracking-[-0.8px]">
                R&PMS
              </span>
            </div>

            <p className="mt-2 text-[12px] font-medium tracking-[0.7px] text-[#a8adbf]">
              ENTERPRISE R&PMS
            </p>
          </div>

          {/* Vertically centered promotional content */}
          <div className="relative my-auto w-full max-w-[500px] py-16">
            <h1 className="max-w-[450px] text-[36px] font-bold leading-[1.2] tracking-[-1.2px] text-[#f6f7fb] xl:text-[40px]">
              Secure your enterprise access.
            </h1>

            <p className="mt-6 max-w-[440px] text-[17px] leading-7 text-[#cbd1e3]">
              Verify your identity to access intelligent
              recruitment workflows and manage your recruitment
              journey securely.
            </p>

            <div className="mt-10 flex items-center gap-3 text-[#8f9ab8]">
              <span className="h-1 w-12 rounded-full bg-[#5147e8]" />
              <span className="h-1 w-5 rounded-full bg-[#4a5771]" />
              <span className="h-1 w-2 rounded-full bg-[#4a5771]" />

              <Shield
                className="ml-2 text-[#a7adca]"
                size={22}
                strokeWidth={1.8}
              />
            </div>
          </div>

          <footer className="relative flex flex-wrap items-center justify-between gap-4 border-t border-[#243047] pt-6 text-[12px] font-medium tracking-[0.2px] text-[#9298ad]">
            <span>© 2026 R&PMS. All rights reserved.</span>

            <div className="flex gap-5">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
            </div>
          </footer>
        </aside>

        {/* Verification form */}
        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10 lg:px-12 xl:px-16">
          <div className="w-full max-w-[460px]">
            {/* Mobile branding */}
            <div className="mb-10 flex items-center justify-center gap-3 lg:hidden">
              <div className="grid h-8 w-8 grid-cols-2 gap-1 rounded-[7px] bg-[#5147e8] p-[6px]">
                <span className="rounded-[2px] bg-white" />
                <span className="rounded-[2px] bg-white" />
                <span className="rounded-[2px] bg-white" />
                <span className="rounded-[2px] bg-white" />
              </div>

              <div>
                <p className="text-xl font-bold tracking-[-0.5px] text-[#171923]">
                  R&PMS
                </p>
                <p className="text-[9px] font-medium tracking-[0.7px] text-[#77798a]">
                  ENTERPRISE R&PMS
                </p>
              </div>
            </div>

            <div className="mx-auto flex h-[68px] w-[68px] items-center justify-center rounded-full bg-[#ededff] text-[#5046e5]">
              <MailCheck size={32} strokeWidth={1.8} />
            </div>

            <header className="mt-6 text-center">
              <h2 className="text-[32px] font-bold leading-tight tracking-[-1px] text-[#17191d] sm:text-[36px]">
                Verify your email
              </h2>

              <p className="mx-auto mt-4 max-w-[390px] text-[15px] leading-6 text-[#5e6070]">
                We've sent a verification code to your email
                address. Enter the code below to continue.
              </p>

              {editingEmail ? (
                <form
                  className="mx-auto mt-4 flex max-w-[360px] items-center gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    setEditingEmail(false);
                  }}
                >
                  <input
                    className="min-w-0 flex-1 rounded-lg border border-[#cdd0df] px-3 py-2 text-sm outline-none focus:border-[#5046e5] focus:ring-2 focus:ring-[#5046e5]/10"
                    type="email"
                    value={emailValue}
                    onChange={(event) =>
                      setEmailValue(event.target.value)
                    }
                    aria-label="Email address"
                    required
                  />

                  <button
                    type="submit"
                    className="text-sm font-semibold text-[#4438d6] hover:underline"
                  >
                    Save
                  </button>
                </form>
              ) : (
                <p className="mt-3 break-all text-[15px] font-semibold text-[#252632]">
                  {emailValue}
                </p>
              )}
            </header>

            {/* Six-digit verification code */}
            <div
              className="mt-9 grid grid-cols-6 gap-2.5 sm:gap-3"
              role="group"
              aria-label="Six-digit verification code"
            >
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    inputRefs.current[index] = element;
                  }}
                  className="aspect-square min-w-0 w-full rounded-lg border border-[#cdd0df] bg-white text-center text-xl font-semibold text-[#252632] outline-none transition focus:border-[#5046e5] focus:ring-2 focus:ring-[#5046e5]/15 sm:text-2xl"
                  value={digit}
                  onChange={(event) =>
                    handleCodeChange(index, event)
                  }
                  onKeyDown={(event) =>
                    handleKeyDown(index, event)
                  }
                  onPaste={handlePaste}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  aria-label={`Verification digit ${index + 1}`}
                  autoComplete={index === 0 ? 'one-time-code' : 'off'}
                />
              ))}
            </div>

            {error && (
  <p className="mt-4 text-center text-sm font-medium text-red-600">
    {error}
  </p>
)}

            <button
  type="button"
  onClick={handleVerify}
  disabled={!code.every(Boolean) || isVerifying}
  className="mt-7 h-12 w-full rounded-lg bg-[#5046e5] text-[15px] font-semibold text-white shadow-[0_3px_8px_rgba(80,70,229,0.2)] transition hover:bg-[#443bd0] disabled:cursor-not-allowed disabled:opacity-50"
>
  {isVerifying ? 'Verifying...' : 'Verify email'}
</button>

            {verified && (
              <p className="mt-4 flex items-center justify-center gap-2 text-center text-sm font-semibold text-[#2e8655]">
                <Check size={16} />
                Email verified successfully.
              </p>
            )}

            <div className="mt-7 flex flex-col items-center gap-4 text-sm">
              <button
                type="button"
                onClick={handleResend}
                disabled={secondsRemaining > 0}
                className="font-medium text-[#4438d6] transition hover:underline disabled:cursor-not-allowed disabled:text-[#9292a4]"
              >
                {secondsRemaining > 0
                  ? `Resend code in ${formattedTime}`
                  : 'Resend verification code'}
              </button>

              <button
                type="button"
                onClick={() => setEditingEmail(true)}
                className="font-medium text-[#4438d6] hover:underline"
              >
                Change email address
              </button>
            </div>

            <p className="mt-8 text-center text-[13px] leading-5 text-[#858693]">
              Didn't receive the email? Check your spam or junk
              folder.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default EmailVerificationPage;