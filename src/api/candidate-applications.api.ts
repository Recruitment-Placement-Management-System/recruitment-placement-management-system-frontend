import api from "./axios";

export type CandidateApplicationStatus = "submitted" | "under_review" | "shortlisted" | "rejected" | "withdrawn";
export type CandidateApplication = {
  _id: string;
  jobId: string;
  candidateId: string;
  recruiterId: string;
  candidate: { fullName: string; email: string; phone: string | null };
  resume: { fileName: string; contentType: string; downloadUrl?: string };
  coverLetter: string;
  status: CandidateApplicationStatus;
  submittedAt: string;
  updatedAt: string;
};
export type CandidateApplicationFilters = { page?: number; limit?: number; status?: CandidateApplicationStatus; jobId?: string };

export const candidateApplicationsApi = {
  submit: async (jobId: string, coverLetter: string) => (await api.post<{ application: CandidateApplication }>(`/candidate/applications/jobs/${jobId}`, { coverLetter })).data.application,
  list: async (params: CandidateApplicationFilters = {}) => (await api.get<{ applications: CandidateApplication[]; pagination: { total: number; page: number; limit: number; pages: number } }>("/candidate/applications", { params })).data,
  get: async (applicationId: string) => (await api.get<{ application: CandidateApplication }>(`/candidate/applications/${applicationId}`)).data.application,
  withdraw: async (applicationId: string) => (await api.patch<{ application: CandidateApplication }>(`/candidate/applications/${applicationId}/withdraw`)).data.application,
};
