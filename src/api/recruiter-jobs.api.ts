import api from "./axios";

export type JobStatus = "draft" | "published";
export type JobEmploymentType = "full_time" | "part_time" | "contract" | "internship" | "temporary" | "freelance";
export type JobWorkMode = "remote" | "hybrid" | "onsite";
export type JobExperienceLevel = "internship" | "entry" | "junior" | "mid" | "senior" | "lead" | "executive";

export type RecruiterJob = {
  _id: string;
  recruiterId: string;
  companyId: string;
  companyName: string;
  title: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  skills: string[];
  location: string;
  employmentType: JobEmploymentType;
  workMode: JobWorkMode;
  experienceLevel: JobExperienceLevel;
  salaryRange: { minimum: number | null; maximum: number | null; currency: string } | null;
  openings: number;
  applicationDeadline: string | null;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
};

export type RecruiterJobInput = Omit<RecruiterJob, "_id" | "recruiterId" | "companyId" | "companyName" | "status" | "createdAt" | "updatedAt">;
export type RecruiterJobFilters = {
  page?: number;
  limit?: number;
  q?: string;
  location?: string;
  employmentType?: JobEmploymentType;
  workMode?: JobWorkMode;
  experienceLevel?: JobExperienceLevel;
  status?: JobStatus;
  sortBy?: "latest" | "deadline" | "salary_low_to_high" | "salary_high_to_low";
};

export const recruiterJobsApi = {
  list: async (filters: RecruiterJobFilters = {}) =>
    (await api.get<{ jobs: RecruiterJob[]; pagination: { total: number; page: number; limit: number; pages: number } }>("/recruiter/jobs", { params: filters })).data,
  get: async (id: string) => (await api.get<{ job: RecruiterJob }>(`/recruiter/jobs/${id}`)).data.job,
  create: async (data: RecruiterJobInput) => (await api.post<{ job: RecruiterJob }>("/recruiter/jobs", data)).data.job,
  update: async (id: string, data: Partial<RecruiterJobInput>) => (await api.patch<{ job: RecruiterJob }>(`/recruiter/jobs/${id}`, data)).data.job,
  remove: async (id: string) => api.delete(`/recruiter/jobs/${id}`),
  publish: async (id: string) => (await api.patch<{ job: RecruiterJob }>(`/recruiter/jobs/${id}/publish`)).data.job,
  unpublish: async (id: string) => (await api.patch<{ job: RecruiterJob }>(`/recruiter/jobs/${id}/unpublish`)).data.job,
};
