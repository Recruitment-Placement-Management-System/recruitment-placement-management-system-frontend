import api from "./axios";
import type { CandidateApplicationStatus } from "./candidate-applications.api";
import type { CandidateJob } from "./candidate-jobs.api";

export type CandidateDashboard = {
  profileCompletion: { percentage: number; completedSections: number; totalSections: number };
  applications: {
    total: number;
    statusCounts: Record<CandidateApplicationStatus, number>;
    recent: Array<{
      id: string;
      jobId: string;
      jobTitle: string | null;
      companyName: string | null;
      status: CandidateApplicationStatus;
      submittedAt: string;
    }>;
  };
  recommendedJobs: CandidateJob[];
  upcomingInterviews: never[];
};

export const candidateDashboardApi = {
  get: async () => (await api.get<{ dashboard: CandidateDashboard }>("/candidate/dashboard")).data.dashboard,
};
