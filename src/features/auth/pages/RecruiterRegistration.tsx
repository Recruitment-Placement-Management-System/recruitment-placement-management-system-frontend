
import { useRef, useState } from 'react';
import type { ChangeEvent, FormEvent, DragEvent } from 'react';
import {
  UserRound,
  BriefcaseBusiness,
  Eye,
  EyeOff,
  Search,
  ListChecks,
  Handshake,
  UploadCloud,
  FileText,
  X,
  ShieldCheck,
  Info,
  LoaderCircle,
  CheckCircle2,
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
  },
  {
    title: 'Hire',
    detail: 'Seamless onboarding flow',
    Icon: Handshake,
  },
];

type RecruiterFormData = {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  jobTitle: string;
  companyName: string;
  companyLocation: string;
  companyWebsite: string;
};

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

function FormField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = true,
  autoComplete,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-[12px] font-semibold text-[#26344c]">
        {label}
        {!required && (
          <span className="ml-1 font-normal text-[#929db0]">(Optional)</span>
        )}
      </span>

      <input
        type={type}
        name={name}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className="h-[44px] w-full rounded-lg border border-[#dce2ec] bg-white px-3.5 text-[13px] text-[#25334a] outline-none transition placeholder:text-[#909bb0] hover:border-[#c7cfe0] focus:border-[#5046e5] focus:ring-4 focus:ring-[#5046e5]/[0.08]"
      />
    </label>
  );
}

function PasswordField({
  label,
  name,
  value,
  onChange,
  visible,
  onToggle,
  placeholder,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  visible: boolean;
  onToggle: () => void;
  placeholder: string;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-[12px] font-semibold text-[#26344c]">
        {label}
      </span>

      <span className="relative block">
        <input
          required
          minLength={8}
          type={visible ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={(event) => onChange(name, event.target.value)}
          autoComplete={
            name === 'password' ? 'new-password' : 'new-password'
          }
          placeholder={placeholder}
          className="h-[44px] w-full rounded-lg border border-[#dce2ec] bg-white px-3.5 pr-11 text-[13px] text-[#25334a] outline-none transition placeholder:text-[#909bb0] hover:border-[#c7cfe0] focus:border-[#5046e5] focus:ring-4 focus:ring-[#5046e5]/[0.08]"
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#91a3bd] transition hover:text-[#5046e5]"
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </span>
    </label>
  );
}

function SectionHeading({ children }: { children: string }) {
  return (
    <div className="mb-4 border-b border-[#d7dbea] pb-2">
      <h3 className="text-[10px] font-bold tracking-[1px] text-[#626b80]">
        {children}
      </h3>
    </div>
  );
}

function RecruiterRegistrationPage() {
  const [accountType, setAccountType] = useState<'candidate' | 'recruiter'>(
    'recruiter',
  );

  const [form, setForm] = useState<RecruiterFormData>({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    jobTitle: '',
    companyName: '',
    companyLocation: '',
    companyWebsite: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [companyDocument, setCompanyDocument] = useState<File | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'info'>('info');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const passwordsMatch =
    form.confirmPassword.length === 0 ||
    form.password === form.confirmPassword;

  const updateField = (name: string, value: string) => {
    setForm((current) => ({ ...current, [name]: value }));
    setMessage('');
  };

  const validateDocument = (file: File): boolean => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
    ];

    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      setMessage('Please upload a PDF, JPG, or PNG document.');
      setMessageType('error');
      return false;
    }

    if (file.size > maxSize) {
      setMessage('The document must be smaller than 5 MB.');
      setMessageType('error');
      return false;
    }

    setCompanyDocument(file);
    setMessage('');
    return true;
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      validateDocument(file);
    }

    // Allows selecting the same file again after removing it.
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      validateDocument(file);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');

    if (form.password.length < 8) {
      setMessage('Your password must contain at least 8 characters.');
      setMessageType('error');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setMessage('Your passwords do not match.');
      setMessageType('error');
      return;
    }

    if (!termsAccepted) {
      setMessage('Please accept the Terms of Service and Privacy Policy.');
      setMessageType('error');
      return;
    }

    if (!companyDocument) {
      setMessage('Please upload a company verification document.');
      setMessageType('error');
      return;
    }

    setIsLoading(true);

    // TODO: Connect to the recruiter registration API.
    // Send the registration fields and document using FormData
    // if the backend supports multipart/form-data uploads.
    setIsLoading(false);
    setMessage(
      'Form validation passed. Backend registration and document upload are not connected yet.',
    );
    setMessageType('info');
  };

  const handleAccountTypeChange = (type: 'candidate' | 'recruiter') => {
    setAccountType(type);

    // TODO: Navigate to the relevant registration page.
    if (type === 'candidate') {
      setMessage('Candidate registration page navigation is not connected yet.');
      setMessageType('info');
    } else {
      setMessage('');
    }
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#172033]">
      <div className="grid min-h-screen lg:grid-cols-[42%_58%] xl:grid-cols-[42%_58%]">
        {/* Branding panel */}
        <aside className="relative hidden min-h-screen overflow-hidden bg-[#0d1528] px-10 py-9 text-white lg:flex lg:flex-col xl:px-11 2xl:px-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,rgba(80,70,229,0.30),transparent_45%),radial-gradient(circle_at_0%_0%,rgba(64,78,130,0.2),transparent_40%),linear-gradient(125deg,#111a2b_0%,#0d1528_65%,#191d4b_100%)]" />

          <div className="absolute -left-24 top-[20%] h-64 w-64 rounded-full bg-[#5046e5]/10 blur-3xl" />

          <header className="relative">
            <BrandLogo />
          </header>

          <div className="relative my-auto max-w-[490px] py-12">
            <p className="text-[10px] font-bold tracking-[2px] text-[#a9a4ff]">
              BUILT FOR BETTER HIRING
            </p>

            <h1 className="mt-4 text-[35px] font-bold leading-[1.2] tracking-[-1.2px] text-[#f7f8fc] xl:text-[40px]">
              Connecting talent with opportunity.
            </h1>

            <p className="mt-4 max-w-[440px] text-[14px] leading-7 text-[#b9c4d8] xl:text-[15px]">
              Streamline your hiring process, discover top-tier candidates, and
              build your dream team with our enterprise recruitment platform.
            </p>

            <div className="mt-10 space-y-0">
              {features.map(({ title, detail, Icon }, index) => (
                <div key={title}>
                  <div className="flex items-center gap-4 rounded-xl border border-white/[0.09] bg-gradient-to-r from-white/[0.06] to-white/[0.025] px-4 py-4">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                        index === 1
                          ? 'bg-gradient-to-br from-[#6258ff] to-[#4338ca] text-white shadow-lg shadow-[#5046e5]/20'
                          : 'bg-[#282e5e] text-[#d6d3ff]'
                      }`}
                    >
                      <Icon size={21} strokeWidth={1.9} />
                    </div>

                    <div>
                      <p className="text-[14px] font-semibold text-[#f1f4fc]">
                        {title}
                      </p>
                      <p className="mt-1 text-[12px] text-[#a2aec4]">
                        {detail}
                      </p>
                    </div>
                  </div>

                  {index < features.length - 1 && (
                    <div className="ml-9 h-4 w-px bg-gradient-to-b from-[#59617e] to-[#343c58]" />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-7 flex items-start gap-3 rounded-xl border border-[#625ce0]/20 bg-gradient-to-r from-[#292b5a]/50 to-[#1b253c]/50 p-4">
              <ShieldCheck
                size={20}
                className="mt-0.5 shrink-0 text-[#aaa4ff]"
              />
              <div>
                <p className="text-[12px] font-semibold text-[#e6eaf5]">
                  Trust starts with verification
                </p>
                <p className="mt-1 text-[11px] leading-5 text-[#a2aec4]">
                  Recruiter accounts are reviewed to help maintain a reliable
                  hiring environment.
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

        {/* Registration form */}
        <section className="flex min-h-screen items-start justify-center px-5 py-8 sm:px-8 lg:px-8 xl:px-12">
          <div className="w-full max-w-[650px]">
            <div className="mb-6 lg:hidden">
              <div className="inline-flex rounded-xl bg-[#0d1528] p-3">
                <BrandLogo />
              </div>
            </div>

            {/* Account type selector */}
            <div className="mb-6 inline-flex rounded-lg border border-[#e1e5ee] bg-[#eef0f5] p-1">
              <button
                type="button"
                onClick={() => handleAccountTypeChange('candidate')}
                className={`flex items-center gap-2 rounded-md px-3.5 py-2 text-[12px] font-semibold transition ${
                  accountType === 'candidate'
                    ? 'bg-white text-[#42465a] shadow-sm'
                    : 'text-[#697186] hover:text-[#42465a]'
                }`}
              >
                <UserRound size={15} />
                Candidate
              </button>

              <button
                type="button"
                onClick={() => handleAccountTypeChange('recruiter')}
                className={`flex items-center gap-2 rounded-md px-3.5 py-2 text-[12px] font-semibold transition ${
                  accountType === 'recruiter'
                    ? 'bg-gradient-to-r from-[#5549ed] to-[#493de0] text-white shadow-sm'
                    : 'text-[#697186] hover:text-[#42465a]'
                }`}
              >
                <BriefcaseBusiness size={15} />
                Recruiter
              </button>
            </div>

            <header className="mb-6">
              <h2 className="text-[29px] font-bold leading-tight tracking-[-1px] text-[#142039] sm:text-[32px]">
                Create your recruiter account
              </h2>
              <p className="mt-2 text-[13px] leading-6 text-[#71809b] sm:text-[14px]">
                Set up your recruiter account and submit your company details
                for verification.
              </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Account information */}
              <section>
                <SectionHeading>ACCOUNT INFORMATION</SectionHeading>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    label="Full name"
                    name="fullName"
                    value={form.fullName}
                    onChange={updateField}
                    placeholder="Jane Doe"
                    autoComplete="name"
                  />

                  <FormField
                    label="Phone number"
                    name="phone"
                    value={form.phone}
                    onChange={updateField}
                    placeholder="+91 98765 43210"
                    type="tel"
                    autoComplete="tel"
                  />
                </div>

                <div className="mt-4">
                  <FormField
                    label="Work email"
                    name="email"
                    value={form.email}
                    onChange={updateField}
                    placeholder="jane.doe@company.com"
                    type="email"
                    autoComplete="email"
                  />
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <PasswordField
                    label="Password"
                    name="password"
                    value={form.password}
                    onChange={updateField}
                    visible={showPassword}
                    onToggle={() => setShowPassword((current) => !current)}
                    placeholder="At least 8 characters"
                  />

                  <PasswordField
                    label="Confirm password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={updateField}
                    visible={showConfirmPassword}
                    onToggle={() =>
                      setShowConfirmPassword((current) => !current)
                    }
                    placeholder="Re-enter password"
                  />
                </div>

                {form.confirmPassword.length > 0 && !passwordsMatch && (
                  <p className="mt-2 text-[11px] text-red-600">
                    Passwords do not match.
                  </p>
                )}
              </section>

              {/* Professional information */}
              <section>
                <SectionHeading>PROFESSIONAL INFORMATION</SectionHeading>

                <FormField
                  label="Job title / Designation"
                  name="jobTitle"
                  value={form.jobTitle}
                  onChange={updateField}
                  placeholder="Senior Technical Recruiter"
                />

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    label="Company name"
                    name="companyName"
                    value={form.companyName}
                    onChange={updateField}
                    placeholder="Acme Corp"
                  />

                  <FormField
                    label="Company HQ / Location"
                    name="companyLocation"
                    value={form.companyLocation}
                    onChange={updateField}
                    placeholder="Trivandrum, Kerala"
                  />
                </div>

                <div className="mt-4">
                  <FormField
                    label="Company website"
                    name="companyWebsite"
                    value={form.companyWebsite}
                    onChange={updateField}
                    placeholder="https://www.company.com"
                    type="url"
                    required={false}
                  />
                </div>
              </section>

              {/* Company verification */}
              <section>
                <SectionHeading>COMPANY VERIFICATION</SectionHeading>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {companyDocument ? (
                  <div className="flex items-center gap-3 rounded-xl border border-[#d8d5ff] bg-gradient-to-r from-[#f8f7ff] to-[#f0efff] p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#e5e2ff] text-[#5046e5]">
                      <FileText size={20} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-semibold text-[#303750]">
                        {companyDocument.name}
                      </p>
                      <p className="mt-1 text-[11px] text-[#7b8499]">
                        {(companyDocument.size / (1024 * 1024)).toFixed(2)} MB
                        · Ready for upload
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCompanyDocument(null)}
                      aria-label="Remove company document"
                      className="rounded-md p-2 text-[#7b8499] transition hover:bg-white hover:text-red-600"
                    >
                      <X size={17} />
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={(event) => {
                      event.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`rounded-xl border-2 border-dashed p-6 text-center transition ${
                      isDragging
                        ? 'border-[#5046e5] bg-[#f0efff]'
                        : 'border-[#d4d1e8] bg-gradient-to-br from-white to-[#fafaff] hover:border-[#a7a1f5]'
                    }`}
                  >
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#f0eeff] to-[#e5e2ff] text-[#5046e5]">
                      <UploadCloud size={21} />
                    </div>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-3 text-[12px] font-semibold text-[#293247] hover:text-[#5046e5]"
                    >
                      Click to upload or drag and drop
                    </button>

                    <p className="mt-2 text-[11px] leading-5 text-[#7b8499]">
                      Upload a document that verifies your association with the
                      company.
                      <br />
                      Supported formats: PDF, JPG or PNG · Maximum 5 MB.
                    </p>
                  </div>
                )}

                <div className="mt-3 flex items-start gap-2 rounded-lg border border-[#e0e4ed] bg-gradient-to-r from-[#f4f5f8] to-[#eef0f5] px-3 py-3">
                  <Info
                    size={16}
                    className="mt-0.5 shrink-0 text-[#7c8192]"
                  />
                  <p className="text-[11px] leading-5 text-[#596174]">
                    Your recruiter account will be reviewed before full
                    recruiter access is granted.
                  </p>
                </div>
              </section>

              {/* Terms */}
              <div>
                <label className="flex cursor-pointer items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(event) =>
                      setTermsAccepted(event.target.checked)
                    }
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[#5046e5] focus:ring-[#5046e5]"
                  />
                  <span className="text-[11px] leading-5 text-[#596174]">
                    I agree to the{' '}
                    <a
                      href="/terms"
                      className="font-medium text-[#5046e5] hover:underline"
                    >
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a
                      href="/privacy"
                      className="font-medium text-[#5046e5] hover:underline"
                    >
                      Privacy Policy
                    </a>
                    .
                  </span>
                </label>
              </div>

              {message && (
                <div
                  role="status"
                  aria-live="polite"
                  className={`flex items-start gap-2 rounded-lg border px-3 py-3 text-[12px] leading-5 ${
                    messageType === 'error'
                      ? 'border-red-200 bg-red-50 text-red-700'
                      : 'border-[#dcd9ff] bg-[#f4f3ff] text-[#5046e5]'
                  }`}
                >
                  {messageType === 'error' ? (
                    <Info size={16} className="mt-0.5 shrink-0" />
                  ) : (
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                  )}
                  <p>{message}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="flex h-[46px] w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#5549ed] to-[#493de0] text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(80,70,229,0.18)] transition hover:from-[#4b40dc] hover:to-[#3f34cd] focus:outline-none focus:ring-4 focus:ring-[#5046e5]/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <LoaderCircle size={16} className="animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create recruiter account'
                )}
              </button>
            </form>

            <p className="mt-5 pb-3 text-center text-[12px] text-[#69748a]">
              Already have an account?{' '}
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

export default RecruiterRegistrationPage;
