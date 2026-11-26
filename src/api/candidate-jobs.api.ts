import api from "./axios";
import type { JobEmploymentType, JobExperienceLevel, JobWorkMode, RecruiterJob } from "./recruiter-jobs.api";

export type CandidateJob = RecruiterJob;
export type CandidateJobSearch = {
  page?: number;
  limit?: number;
  q?: string;
  location?: string;
  employmentType?: JobEmploymentType;
  workMode?: JobWorkMode;
  experienceLevel?: JobExperienceLevel;
  skill?: string;
  sortBy?: "latest" | "deadline" | "salary_low_to_high" | "salary_high_to_low";
};
export const candidateJobsApi = {
  browse: async (params: CandidateJobSearch = {}) => (await api.get<{ jobs: CandidateJob[]; pagination: { total: number; page: number; limit: number; pages: number } }>("/candidate/jobs", { params })).data,
  details: async (jobId: string) => (await api.get<{ job: CandidateJob }>(`/candidate/jobs/${jobId}`)).data.job,
  related: async (jobId: string) => (await api.get<{ jobs: CandidateJob[] }>(`/candidate/jobs/${jobId}/related`)).data.jobs,
  saved: async () => (await api.get<{ savedJobs: Array<{ job: CandidateJob; savedAt: string }> }>("/candidate/saved-jobs")).data.savedJobs,
  save: async (jobId: string) => api.post(`/candidate/saved-jobs/${jobId}`),
  unsave: async (jobId: string) => api.delete(`/candidate/saved-jobs/${jobId}`),
};