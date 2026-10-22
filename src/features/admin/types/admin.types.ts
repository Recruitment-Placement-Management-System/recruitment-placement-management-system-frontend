export interface AdminLoginData{
    email:string;
    password:string;
}

export interface AdminLoginResponse{
    message:string;
    accessToken:string;
    user:AdminUser
}

export type AdminUsersSortField = 'createdAt' | 'fullName' | 'email';
export type AdminUsersSortDirection = 'asc' | 'desc';

export interface AdminUser {
  id: string;
  fullName?: string;
  email: string;
  roles: string[];
  status: string;
  isEmailVerified: boolean;
  phone?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUsersPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface AdminUsersResponse {
  message: string;
  users: AdminUser[];
  pagination: AdminUsersPagination;
}
