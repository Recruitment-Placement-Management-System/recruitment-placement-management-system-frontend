import { create } from 'zustand';

export type RecruiterRegistrationDraft = {
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

const emptyDraft: RecruiterRegistrationDraft = {
  fullName: '', phone: '', email: '', password: '', confirmPassword: '',
  jobTitle: '', companyName: '', companyLocation: '', companyWebsite: '',
};

type RecruiterRegistrationState = {
  form: RecruiterRegistrationDraft;
  companyDocument: File | null;
  termsAccepted: boolean;
  setForm: (value: RecruiterRegistrationDraft | ((current: RecruiterRegistrationDraft) => RecruiterRegistrationDraft)) => void;
  setCompanyDocument: (file: File | null) => void;
  setTermsAccepted: (accepted: boolean) => void;
  updateEmail: (email: string) => void;
  clearDraft: () => void;
};

const useRecruiterRegistrationStore = create<RecruiterRegistrationState>((set) => ({
  form: { ...emptyDraft },
  companyDocument: null,
  termsAccepted: false,
  setForm: (value) => set((state) => ({ form: typeof value === 'function' ? value(state.form) : value })),
  setCompanyDocument: (companyDocument) => set({ companyDocument }),
  setTermsAccepted: (termsAccepted) => set({ termsAccepted }),
  updateEmail: (email) => set((state) => ({ form: { ...state.form, email } })),
  clearDraft: () => set({ form: { ...emptyDraft }, companyDocument: null, termsAccepted: false }),
}));

export default useRecruiterRegistrationStore;
