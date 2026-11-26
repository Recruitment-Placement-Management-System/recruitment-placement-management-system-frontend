import api from "./axios";

export type RecruiterProfile = {
  _id: string;
  userId: string;
  companyId: string;
  fullName: string;
  designation: string;
  verificationStatus: "pending" | "verified" | "rejected";
  createdAt: string;
  updatedAt: string;
};

export type RecruiterCompany = {
  _id: string;
  name: string;
  location: string;
  website: string;
  status: "pending" | "active" | "suspended";
  verificationStatus: "pending" | "verified" | "rejected";
  verificationReason?: string;
  createdAt: string;
  updatedAt: string;
};

export type RecruiterVerification = {
  _id: string;
  status: "pending" | "approved" | "rejected";
  priority: "low" | "normal" | "high";
  documents: string[];
  adminNotes?: string;
  submittedAt: string;
  reviewedAt?: string;
};

export const recruiterProfileApi = {
  getProfile: async () => (await api.get<{ profile: RecruiterProfile }>("/recruiter/profile")).data.profile,
  updateProfile: async (data: Pick<RecruiterProfile, "fullName" | "designation">) => (await api.patch<{ profile: RecruiterProfile }>("/recruiter/profile", data)).data.profile,
  getCompany: async () => (await api.get<{ company: RecruiterCompany }>("/recruiter/company")).data.company,
  updateCompany: async (data: Partial<Pick<RecruiterCompany, "name" | "location" | "website">>) => (await api.patch<{ company: RecruiterCompany }>("/recruiter/company", data)).data.company,
  getVerificationHistory: async () => (await api.get<{ history: RecruiterVerification[] }>("/recruiter/verification/history")).data.history,
  submitVerification: async (files: File[]) => {
    const form = new FormData();
    files.forEach((file) => form.append("documents", file));
    return (await api.post<{ verification: RecruiterVerification }>("/recruiter/verification", form, { headers: { "Content-Type": "multipart/form-data" } })).data.verification;
  },
};
