import api from "./axios";
import type { CandidateApplication, CandidateApplicationStatus } from "./candidate-applications.api";

export type RecruiterApplication = CandidateApplication;
export type RecruiterApplicationStatus = CandidateApplicationStatus;
export type RecruiterApplicationPage = {
  applications: RecruiterApplication[];
  pagination: { total: number; page: number; limit: number; pages: number };
};

export const recruiterApplicationsApi = {
  list: async (params: { page?: number; limit?: number; status?: RecruiterApplicationStatus; jobId?: string } = {}) =>
    (await api.get<RecruiterApplicationPage>("/recruiter/applications", { params })).data,
  get: async (applicationId: string) =>
    (await api.get<{ application: RecruiterApplication }>(`/recruiter/applications/${applicationId}`)).data.application,
  updateStatus: async (applicationId: string, status: Extract<RecruiterApplicationStatus, "under_review" | "shortlisted" | "rejected">) =>
    (await api.patch<{ application: RecruiterApplication }>(`/recruiter/applications/${applicationId}/status`, { status })).data.application,
};
