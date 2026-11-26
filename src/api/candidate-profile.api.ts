import api from './axios';

export type CandidateResume = {
  fileName: string;
  contentType: string;
  fileSize: number;
  uploadedAt: string;
  parsingStatus: "pending" | "processing" | "completed" | "failed";
  downloadUrl: string;
};
export type CandidateJobPreferences = {
  preferredRoles: string[];
  preferredLocations: string[];
  employmentTypes: Array<"full_time" | "part_time" | "contract" | "internship" | "temporary" | "freelance">;
  workModes: Array<"remote" | "hybrid" | "onsite">;
  expectedSalary: { minimum: number | null; maximum: number | null; currency: string | null } | null;
  experienceLevel: "internship" | "entry" | "junior" | "mid" | "senior" | "lead" | "executive" | null;
  noticePeriodDays: number | null;
};
export type CandidateProfileRecord = Record<string, unknown>;
export type CandidateProfile = {
  _id: string; fullName: string; profilePhoto: string; headline: string; bio: string;
  location: Record<string, string>; personalInfo: Record<string, string>; contactLinks: Record<string, string>;
  skills: Array<string | { name?: string }>; education: CandidateProfileRecord[]; experience: CandidateProfileRecord[];
  projects: CandidateProfileRecord[]; certifications: CandidateProfileRecord[];
  languages: Array<{ name: string; proficiency: string }>; resume: CandidateResume | null;
  jobPreferences: CandidateJobPreferences;
};
const root = '/candidate/profile';
const send = async (method: 'post' | 'patch' | 'put' | 'delete', path: string, data?: unknown) =>
  (await api.request<{ profile: CandidateProfile }>({ method, url: `${root}${path}`, data })).data.profile;
export const candidateProfileApi = {
  get: async () => (await api.get<{ profile: CandidateProfile }>(root)).data.profile,
  getResume: async () => (await api.get<{ resume: CandidateResume | null }>(`${root}/resume`)).data.resume,
  uploadResume: async (file: File) => {
    const data = new FormData();
    data.append("resume", file);
    return (await api.post<{ profile: CandidateProfile }>(`${root}/resume`, data, { headers: { "Content-Type": "multipart/form-data" } })).data.profile;
  },
  deleteResume: () => send("delete", "/resume"),
  updateProfile: (data: Partial<Pick<CandidateProfile, 'fullName' | 'headline' | 'bio'>>) => send('patch', '', data),
  updateJobPreferences: (data: Partial<CandidateJobPreferences>) => send('patch', '/job-preferences', data),
  personal: (data: unknown) => send('patch', '/personal-information', data),
  addSkills: (skills: string[]) => send('post', '/skills', { skills }),
  updateSkill: (currentSkill: string, newSkill: string) => send('put', '/skills', { currentSkill, newSkill }),
  removeSkill: (skill: string) => send('delete', '/skills', { skill }),
  add: (kind: string, data: unknown) => send('post', `/${kind}`, data),
  update: (kind: string, data: unknown) => send('patch', `/${kind}`, data),
  remove: (kind: string, data: unknown) => send('delete', `/${kind}`, data),
  uploadPhoto: async (file: File) => { const data = new FormData(); data.append('photo', file); return (await api.post<{ profile: CandidateProfile }>(`${root}/photo`, data, { headers: { 'Content-Type': 'multipart/form-data' } })).data.profile; },
  deletePhoto: () => send('delete', '/photo'),
};
