import api from "./axios";

import type {
  AdminLoginData,
  AdminLoginResponse,
  AdminUsersResponse,
  AdminUsersSortDirection,
  AdminUsersSortField,
} from '../features/admin/types/admin.types';

export const adminLogin = async(
    data:AdminLoginData,
):Promise<AdminLoginResponse>=>{
    const response = await api.post('/admin/login',data);
    return response.data;
}

export const getAdminUsers = async (
  page = 1,
  limit = 10,
  sortBy: AdminUsersSortField = 'createdAt',
  sortOrder: AdminUsersSortDirection = 'desc',
  search = '',
): Promise<AdminUsersResponse> => {
  const response = await api.get('/admin/users', {
    params: {
      page,
      limit,
      sortBy,
      sortOrder,
      ...(search.trim() ? { search: search.trim() } : {}),
    },
  });

  return response.data;
};

export type AdminPagination = { total: number; page: number; limit: number; pages: number };
export type AdminVerificationType = 'candidate' | 'recruiter' | 'company';
export type AdminVerificationStatus = 'pending' | 'approved' | 'rejected';
export type AdminVerification = { id: string; type: AdminVerificationType; name: string; email: string | null; submittedAt: string; status: AdminVerificationStatus };

export const getAdminDashboard = async () => (await api.get<{ dashboard: { statistics: Record<string, number | Record<string, number>>; latestVerifications: AdminVerification[] } }>('/admin/dashboard')).data.dashboard;

export const getAdminCandidates = async (params: Record<string, string | number | undefined> = {}) =>
  (await api.get<{ candidates: AdminCandidate[]; pagination: AdminPagination }>('/admin/candidates', { params })).data;
export const getAdminRecruiters = async (params: Record<string, string | number | undefined> = {}) =>
  (await api.get<{ recruiters: AdminRecruiter[]; pagination: AdminPagination }>('/admin/recruiters', { params })).data;
export const getAdminCompanies = async (params: Record<string, string | number | undefined> = {}) =>
  (await api.get<{ companies: AdminCompany[]; pagination: AdminPagination }>('/admin/companies', { params })).data;

export type AdminCandidate = { id: string; fullName: string; email: string; phone: string | null; accountStatus: string; isEmailVerified: boolean; verificationStatus: string; headline: string; location: string | null; registeredAt: string };
export type AdminRecruiter = { id: string; fullName: string; email: string; phone: string | null; designation: string; accountStatus: string; isEmailVerified: boolean; verificationStatus: string; company: { id: string; name: string } | null; registeredAt: string };
export type AdminCompany = { id: string; name: string; location: string; website: string; status: string; verificationStatus: string; recruiterCount: number; registeredAt: string };

export const getAdminEntityDetails = async (type: 'candidates' | 'recruiters' | 'companies', id: string) => {
  const response = await api.get<Record<string, unknown>>(`/admin/${type}/${id}`);
  const key = type === 'candidates' ? 'candidate' : type === 'recruiters' ? 'recruiter' : 'company';
  return response.data[key] as Record<string, unknown>;
};
export const updateAdminEntityStatus = async (type: 'candidates' | 'recruiters' | 'companies', id: string, status: 'active' | 'suspended') =>
  (await api.patch(`/admin/${type}/${id}/status`, { status })).data;

export const getAdminVerifications = async (params: Record<string, string | number | undefined> = {}) =>
  (await api.get<{ requests: AdminVerification[]; total: number; page: number; limit: number; pages: number }>('/admin/verifications', { params })).data;
export const getAdminVerification = async (type: AdminVerificationType, id: string) =>
  (await api.get<{ verification: Record<string, unknown> }>(`/admin/verifications/${type}/${id}`)).data.verification;
export const reviewAdminVerification = async (type: AdminVerificationType, id: string, data: { status: 'approved' | 'rejected'; reason?: string }) =>
  (await api.patch<{ verification: Record<string, unknown> }>(`/admin/verifications/${type}/${id}/review`, data)).data.verification;
