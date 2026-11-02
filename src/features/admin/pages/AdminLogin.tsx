import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from 'lucide-react';

import { adminLogin } from '../../../api/admin.api';
import useAuthStore from '../../../store/auth.store';

function AdminLogin() {
  const navigate = useNavigate();

  const loginUser = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [didSubmit, setDidSubmit] = useState(false);
  const normalizedEmail = email.trim();
  const emailError = !normalizedEmail
    ? 'Email is required.'
    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
      ? 'Enter a valid email address.'
      : '';
  const passwordError = password ? '' : 'Password is required.';

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setMessage('');
    setDidSubmit(true);
    if (!normalizedEmail || emailError || !password) return;

    setIsLoading(true);

    try {
      const response = await adminLogin({
        email: normalizedEmail,
        password,
      });

      loginUser(
        response.accessToken,
        response.user
      );

      navigate('/admin/dashboard');
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && !error.response) {
        setMessage('Unable to reach the server. Check your connection and try again.');
      } else if (
        axios.isAxiosError(error) &&
        typeof error.response?.data?.message === 'string'
      ) {
        setMessage(error.response.data.message);
      } else {
        setMessage('Unable to sign in. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7] px-4 py-10 text-[#302D2B]">

      <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center">

        {/* Login Card */}
        <div className="w-full max-w-[560px] rounded-[22px] border border-[#E7E1DD] bg-white px-8 py-11 shadow-[0_8px_30px_rgba(60,45,35,0.08)] sm:px-12">

          {/* Logo */}
          <div className="flex flex-col items-center">

            <div className="flex h-[60px] w-[60px] items-center justify-center rounded-[15px] bg-[#DD7655] text-2xl font-bold text-white">
              R
            </div>

            {/* Brand */}
            <div className="mt-5 flex items-center gap-2">
              <span className="text-[21px] font-bold tracking-[-0.5px] text-[#292625]">
                R&amp;PMS
              </span>

              <span className="rounded-[5px] bg-[#FBEDE8] px-2 py-1 text-[12px] font-bold tracking-[0.8px] text-[#C85F40]">
                ADMIN CONSOLE
              </span>
            </div>

            <h1 className="mt-5 text-center text-[32px] font-bold tracking-[-1px] text-[#302D2B]">
              Admin Sign In
            </h1>

            {/* <p className="mt-2 text-center text-[17px] text-[#817A75]">
              Sign in to access the R&amp;PMS administration console.
            </p> */}
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="mt-9"
          >

            {/* Email */}
            <div>
              <label
                htmlFor="admin-email"
                className="mb-2 block text-[15px] font-semibold text-[#403C39]"
              >
                ADMIN EMAIL <span className="text-[#DD7655]">*</span>
              </label>

              <div className="relative">
                <Mail
                  size={20}
                  strokeWidth={1.8}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#817A75]"
                />

                <input
                  id="admin-email"
                  type="email"
                  placeholder="admin@rpms.com"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setMessage('');
                  }}
                  required
                  aria-invalid={Boolean((email || didSubmit) && emailError)}
                  aria-describedby="admin-email-tip"
                  className="h-[54px] w-full rounded-[10px] border border-[#DED8D4] bg-white pl-12 pr-4 text-[16px] text-[#302D2B] outline-none transition placeholder:text-[#8E8883] focus:border-[#DD7655] focus:ring-2 focus:ring-[#DD7655]/10"
                />
              </div>
              {(email || didSubmit) && emailError && (
                <p id="admin-email-tip" className="mt-1.5 text-sm text-red-600">
                  {emailError}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="mt-6">
              <label
                htmlFor="admin-password"
                className="mb-2 block text-[15px] font-semibold text-[#403C39]"
              >
                PASSWORD <span className="text-[#DD7655]">*</span>
              </label>

              <div className="relative">
                <LockKeyhole
                  size={20}
                  strokeWidth={1.8}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#817A75]"
                />

                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setMessage('');
                  }}
                  required
                  aria-invalid={Boolean((password || didSubmit) && passwordError)}
                  aria-describedby="admin-password-tip"
                  className="h-[54px] w-full rounded-[10px] border border-[#DED8D4] bg-white pl-12 pr-12 text-[16px] text-[#302D2B] outline-none transition placeholder:text-[#8E8883] focus:border-[#DD7655] focus:ring-2 focus:ring-[#DD7655]/10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#817A75] transition hover:text-[#DD7655]"
                  aria-label={
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showPassword ? (
                    <EyeOff size={20} strokeWidth={1.8} />
                  ) : (
                    <Eye size={20} strokeWidth={1.8} />
                  )}
                </button>
              </div>
              {(password || didSubmit) && passwordError && (
                <p id="admin-password-tip" className="mt-1.5 text-sm text-red-600">
                  {passwordError}
                </p>
              )}
            </div>

            {/* Remember / Forgot */}
            <div className="mt-6 flex items-center justify-between">

              <label className="flex cursor-pointer items-center gap-2 text-[15px] text-[#403C39]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) =>
                    setRememberMe(event.target.checked)
                  }
                  className="h-[22px] w-[22px] cursor-pointer accent-[#DD7655]"
                />

                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[15px] font-medium text-[#DD7655] transition hover:text-[#C85F40]"
              >
                Forgot password?
              </button>

            </div>

            {/* Error */}
            {message && (
              <div role="alert" aria-live="polite" className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {message}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-7 flex h-[54px] w-full items-center justify-center gap-3 rounded-[10px] bg-[#DD7655] text-[17px] font-semibold text-white transition hover:bg-[#D36B4B] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                'Signing in...'
              ) : (
                <>
                  Sign In to Admin Console
                  <ArrowRight size={21} />
                </>
              )}
            </button>

          </form>

          {/* Divider */}
          <div className="my-7 h-px bg-[#E8E2DE]" />

          {/* Security Notice */}
          <div className="flex items-start justify-center gap-3 rounded-[10px] border border-[#F4C9BB] bg-[#FFF1EC] px-4 py-4 text-center">

            <ShieldCheck
              size={21}
              strokeWidth={1.8}
              className="mt-0.5 shrink-0 text-[#C85F40]"
            />

            <p className="text-[14px] leading-5 text-[#756D68]">
              <span className="font-semibold text-[#C85F40]">
                Authorized administrators only.
              </span>{' '}
              Administrative activity is securely monitored and logged.
            </p>

          </div>

        </div>

        {/* Footer */}
        <p className="mt-9 text-center text-[14px] text-[#817A75]">
          R&amp;PMS Admin Console • © 2026 R&amp;PMS. All rights reserved.
        </p>

      </div>
    </div>
  );
}

export default AdminLogin;
