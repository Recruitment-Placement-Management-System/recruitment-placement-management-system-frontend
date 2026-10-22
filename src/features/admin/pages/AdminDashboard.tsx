import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Search,
  ShieldCheck,
  UserCog,
  Users,
  X,
} from 'lucide-react';

import { getAdminUsers } from '../../../api/admin.api';
import { logout } from '../../../api/auth.api';
import useAuthStore from '../../../store/auth.store';

import type {
  AdminUser,
  AdminUsersPagination,
  AdminUsersSortDirection,
  AdminUsersSortField,
} from '../types/admin.types';

function AdminDashboard() {
  const navigate = useNavigate();

  const logoutUser = useAuthStore((state) => state.logout);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] =
    useState<AdminUsersPagination | null>(null);

  const [page, setPage] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [sortBy, setSortBy] = useState<AdminUsersSortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<AdminUsersSortDirection>('desc');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;

    const loadUsers = async () => {
      setIsLoading(true);

      try {
        const response = await getAdminUsers(page, 10, sortBy, sortOrder, search);

        if (cancelled) {
          return;
        }

        setUsers(response.users);
        setPagination(response.pagination);
        setError('');
      } catch (error: unknown) {
        if (cancelled) {
          return;
        }

        console.error('Failed to load users:', error);

        if (axios.isAxiosError(error)) {
          setError(
            error.response?.data?.message ||
              'Failed to load users.'
          );
        } else {
          setError('Failed to load users.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadUsers();

    return () => {
      cancelled = true;
    };
  }, [page, search, sortBy, sortOrder]);

  const handleLogout = async () => {
    try {
      await logout();

      logoutUser();

      navigate('/admin/login', {
        replace: true,
      });
    } catch (error) {
      console.error('Logout failed:', error);

      setError('Logout failed. Please try again.');
    }
  };

  const handlePageChange = (newPage: number) => {
    setIsLoading(true);
    setPage(newPage);
  };

  const handleSortByChange = (newSortBy: AdminUsersSortField) => {
    setSortBy(newSortBy);
    setPage(1);
  };

  const handleSortOrderChange = () => {
    setSortOrder((current) => current === 'asc' ? 'desc' : 'asc');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#FBF7F4] text-[#302D2B]">

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-screen w-[230px] border-r border-[#E9E1DC] bg-white lg:block">

        {/* Brand */}
        <div className="flex h-[72px] items-center gap-3 border-b border-[#E9E1DC] px-5">

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#DD7655] text-sm font-bold text-white">
            R
          </div>

          <div>
            <p className="text-[17px] font-bold leading-5 text-[#292625]">
              R&amp;PMS
            </p>

            <p className="text-[10px] font-bold tracking-[1px] text-[#756D68]">
              ADMIN CONSOLE
            </p>
          </div>

        </div>

        {/* Navigation */}
        <nav className="px-3 py-5">

          <p className="px-3 text-[10px] font-bold uppercase tracking-wide text-[#8A817C]">
            Overview
          </p>

          <button
            type="button"
            className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#514A46] hover:bg-[#F8F1ED]"
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>

          <p className="mt-6 px-3 text-[10px] font-bold uppercase tracking-wide text-[#8A817C]">
            User Management
          </p>

          <button
            type="button"
            className="mt-2 flex w-full items-center gap-3 rounded-lg bg-[#F7E9E3] px-3 py-2.5 text-sm font-semibold text-[#B95235]"
          >
            <Users size={18} />
            Users
          </button>

          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#514A46] hover:bg-[#F8F1ED]"
          >
            <UserCog size={18} />
            Candidates
          </button>

          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#514A46] hover:bg-[#F8F1ED]"
          >
            <BriefcaseBusiness size={18} />
            Recruiters
          </button>

          <p className="mt-6 px-3 text-[10px] font-bold uppercase tracking-wide text-[#8A817C]">
            Verification
          </p>

          <button
            type="button"
            className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#514A46] hover:bg-[#F8F1ED]"
          >
            <ShieldCheck size={18} />
            Verification Queue
          </button>

          <p className="mt-6 px-3 text-[10px] font-bold uppercase tracking-wide text-[#8A817C]">
            Recruitment
          </p>

          <button
            type="button"
            className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#514A46] hover:bg-[#F8F1ED]"
          >
            <BriefcaseBusiness size={18} />
            Jobs
          </button>

          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#514A46] hover:bg-[#F8F1ED]"
          >
            <ClipboardList size={18} />
            Applications
          </button>

          <p className="mt-6 px-3 text-[10px] font-bold uppercase tracking-wide text-[#8A817C]">
            Insights
          </p>

          <button
            type="button"
            className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#514A46] hover:bg-[#F8F1ED]"
          >
            <BarChart3 size={18} />
            Analytics
          </button>

          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#514A46] hover:bg-[#F8F1ED]"
          >
            <FileText size={18} />
            Reports
          </button>

        </nav>

        {/* Admin */}
        <div className="absolute bottom-0 left-0 w-full border-t border-[#E9E1DC] p-3">

          <div className="flex items-center gap-3 rounded-lg bg-[#F8F1ED] px-3 py-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#DD7655] text-white">
              <UserCog size={18} />
            </div>

            <div>
              <p className="text-sm font-semibold text-[#302D2B]">
                Admin
              </p>

              <p className="text-[11px] text-[#817A75]">
                System Administrator
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#756D68] hover:bg-[#F8F1ED]"
          >
            <LogOut size={17} />
            Logout
          </button>

        </div>

      </aside>

      {/* Main Area */}
      <div className="lg:ml-[230px]">

        {/* Top Header */}
        <header className="sticky top-0 z-10 flex h-[72px] items-center justify-between border-b border-[#E9E1DC] bg-white px-5 lg:px-8">

          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#817A75]">
              Admin Console
            </span>

            <span className="text-[#C0B8B3]">
              /
            </span>

            <span className="font-medium text-[#302D2B]">
              Users
            </span>
          </div>

          <div className="flex items-center gap-4">

            <button
              type="button"
              className="relative text-[#625A55]"
            >
              <Bell size={19} />

              <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#DD7655]" />
            </button>

            <div className="hidden h-6 w-px bg-[#E5DED9] sm:block" />

            <div className="flex items-center gap-2">

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#DD7655] text-white">
                <UserCog size={17} />
              </div>

              <span className="hidden text-sm font-semibold sm:block">
                Admin
              </span>

            </div>

          </div>

        </header>

        {/* Content */}
        <main className="p-5 lg:p-8">

          {/* Page Heading */}
          <div className="mb-7">

            <h1 className="text-[30px] font-bold tracking-[-0.7px] text-[#302D2B]">
              Users
            </h1>

            <p className="mt-1 text-sm text-[#756D68]">
              Manage and monitor all users registered on the R&amp;PMS platform.
            </p>

          </div>

          {/* Stats */}
          <div className="mb-7 grid grid-cols-1 gap-4 md:grid-cols-3">

            <div className="rounded-xl border border-[#EEE5E0] bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <p className="text-xs font-semibold uppercase tracking-wide text-[#756D68]">
                  Total Users
                </p>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FBEDE8] text-[#C85F40]">
                  <Users size={18} />
                </div>

              </div>

              <p className="mt-5 text-[32px] font-bold text-[#292625]">
                {pagination?.total ?? 0}
              </p>

              <p className="mt-1 text-xs text-[#817A75]">
                Platform total directory
              </p>

            </div>

            <div className="rounded-xl border border-[#EEE5E0] bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <p className="text-xs font-semibold uppercase tracking-wide text-[#756D68]">
                  Current Page
                </p>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FBEDE8] text-[#C85F40]">
                  <FileText size={18} />
                </div>

              </div>

              <p className="mt-5 text-[32px] font-bold text-[#292625]">
                {pagination?.page ?? 1}
              </p>

              <p className="mt-1 text-xs text-[#817A75]">
                Currently viewing
              </p>

            </div>

            <div className="rounded-xl border border-[#EEE5E0] bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <p className="text-xs font-semibold uppercase tracking-wide text-[#756D68]">
                  Total Pages
                </p>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FBEDE8] text-[#C85F40]">
                  <BarChart3 size={18} />
                </div>

              </div>

              <p className="mt-5 text-[32px] font-bold text-[#292625]">
                {pagination?.pages ?? 0}
              </p>

              <p className="mt-1 text-xs text-[#817A75]">
                10 users per page
              </p>

            </div>

          </div>

          {/* Users Card */}
          <section className="overflow-hidden rounded-xl border border-[#EEE5E0] bg-white shadow-sm">

            {/* Card Header */}
            <div className="flex flex-col gap-4 border-b border-[#EEE5E0] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-lg font-semibold text-[#302D2B]">
                  User Directory
                </h2>

                <p className="mt-1 text-xs text-[#817A75]">
                  View registered candidates, recruiters and administrators.
                </p>
              </div>

              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                <label className="relative block min-w-0 flex-1 sm:w-[240px] sm:flex-none">
                  <Search
                    size={17}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9A918B]"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Search name or email..."
                    aria-label="Search users by name or email"
                    className="h-10 w-full rounded-lg border border-[#E5DDD8] bg-[#FBF8F6] pl-10 pr-9 text-sm text-[#302D2B] outline-none transition placeholder:text-[#9A918B] focus:border-[#B77A62] focus:bg-white focus:ring-2 focus:ring-[#B77A62]/15"
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={() => setSearchInput('')}
                      aria-label="Clear search"
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[#817A75] hover:bg-[#EEE7E2] hover:text-[#302D2B] focus-visible:outline-2 focus-visible:outline-[#9B5D45]"
                    >
                      <X size={15} aria-hidden="true" />
                    </button>
                  )}
                </label>

                <label className="flex h-10 items-center gap-2 rounded-lg border border-[#E5DDD8] bg-white px-3 text-sm text-[#514A46] focus-within:border-[#B77A62] focus-within:ring-2 focus-within:ring-[#B77A62]/15">
                  <span className="text-[#817A75]">Sort</span>
                  <select
                    value={sortBy}
                    onChange={(event) => handleSortByChange(event.target.value as AdminUsersSortField)}
                    aria-label="Sort users by"
                    className="min-w-0 bg-transparent font-medium outline-none"
                  >
                    <option value="createdAt">Date</option>
                    <option value="fullName">Name</option>
                    <option value="email">Email</option>
                  </select>
                </label>

                <button
                  type="button"
                  onClick={handleSortOrderChange}
                  aria-label={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                  className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-[#E5DDD8] bg-white px-3 text-sm font-medium text-[#514A46] transition hover:border-[#D9C5BA] hover:bg-[#FCF5F1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B5D45]"
                >
                  <ArrowDownUp size={15} aria-hidden="true" />
                  <span>
                    {sortOrder === 'asc'
                      ? sortBy === 'createdAt' ? 'Oldest first' : 'A-Z'
                      : sortBy === 'createdAt' ? 'Newest first' : 'Z-A'}
                  </span>
                </button>
              </div>

            </div>

            {/* Error */}
            {error && (
              <div className="mx-5 mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Loading */}
            {isLoading && (
              <div className="px-6 py-16 text-center text-sm text-[#817A75]">
                Loading users...
              </div>
            )}

            {/* Empty */}
            {!isLoading && !error && users.length === 0 && (
              <div className="px-6 py-16 text-center text-sm text-[#817A75]">
                {search ? 'No users match your search.' : 'No users found.'}
              </div>
            )}

            {/* Table */}
            {!isLoading && !error && users.length > 0 && (
              <div className="overflow-x-auto">

                <table className="min-w-[850px] w-full text-left">

                  <thead>
                    <tr className="bg-[#FCF5F1] text-xs uppercase tracking-wide text-[#756D68]">

                      <th className="px-5 py-4 font-semibold">
                        User
                      </th>

                      <th className="px-5 py-4 font-semibold">
                        Role
                      </th>

                      <th className="px-5 py-4 font-semibold">
                        Email
                      </th>

                      <th className="px-5 py-4 font-semibold">
                        Status
                      </th>

                      <th className="px-5 py-4 font-semibold">
                        Verification
                      </th>

                      <th className="px-5 py-4 font-semibold">
                        Registered
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-[#F0E9E5] last:border-b-0 hover:bg-[#FCFAF8]"
                      >

                        {/* User */}
                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F3E5DE] text-xs font-bold text-[#B95235]">
                              {(user.fullName || user.email)
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <p className="text-sm font-medium text-[#302D2B]">
                                {user.fullName || 'User'}
                              </p>

                              <p className="mt-0.5 text-xs text-[#9A918B]">
                                {user.phone || 'No phone number'}
                              </p>
                            </div>

                          </div>

                        </td>

                        {/* Role */}
                        <td className="px-5 py-4">

                          <div className="flex flex-wrap gap-1">

                            {user.roles.map((role) => (
                              <span
                                key={role}
                                className="rounded-full bg-[#EEE7E2] px-2.5 py-1 text-xs font-medium capitalize text-[#514A46]"
                              >
                                {role}
                              </span>
                            ))}

                          </div>

                        </td>

                        {/* Email */}
                        <td className="px-5 py-4 text-sm text-[#625A55]">
                          {user.email}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">

                          <span className="inline-flex items-center gap-2 text-xs font-medium capitalize text-[#403C39]">

                            <span
                              className={`h-2 w-2 rounded-full ${
                                user.status === 'active'
                                  ? 'bg-emerald-500'
                                  : user.status === 'pending_verification'
                                    ? 'bg-amber-500'
                                    : 'bg-red-500'
                              }`}
                            />

                            {user.status.replaceAll('_', ' ')}

                          </span>

                        </td>

                        {/* Verification */}
                        <td className="px-5 py-4">

                          <span
                            className={
                              user.isEmailVerified
                                ? 'text-xs font-medium text-emerald-600'
                                : 'text-xs font-medium text-amber-600'
                            }
                          >
                            {user.isEmailVerified
                              ? 'Verified'
                              : 'Pending'}
                          </span>

                        </td>

                        {/* Created */}
                        <td className="px-5 py-4 text-xs text-[#756D68]">
                          {new Date(
                            user.createdAt
                          ).toLocaleDateString()}
                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>
            )}

            {/* Pagination */}
            {!isLoading &&
              !error &&
              pagination &&
              pagination.pages > 0 && (
                <div className="flex flex-col gap-4 border-t border-[#EEE5E0] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                  <p className="text-xs text-[#817A75]">
                    Showing{' '}
                    <span className="font-medium text-[#514A46]">
                      {(pagination.page - 1) *
                        pagination.limit +
                        1}
                    </span>{' '}
                    –{' '}
                    <span className="font-medium text-[#514A46]">
                      {Math.min(
                        pagination.page *
                          pagination.limit,
                        pagination.total
                      )}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium text-[#514A46]">
                      {pagination.total}
                    </span>{' '}
                    users
                  </p>

                  <div className="flex items-center gap-2">

                    <button
                      type="button"
                      disabled={page === 1}
                      onClick={() =>
                        handlePageChange(page - 1)
                      }
                      className="flex h-9 items-center gap-1 rounded-lg border border-[#E1D9D4] px-3 text-xs font-medium text-[#514A46] hover:bg-[#F8F1ED] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft size={15} />
                      Previous
                    </button>

                    <span className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-[#DD7655] px-3 text-xs font-semibold text-white">
                      {pagination.page}
                    </span>

                    <button
                      type="button"
                      disabled={
                        page === pagination.pages
                      }
                      onClick={() =>
                        handlePageChange(page + 1)
                      }
                      className="flex h-9 items-center gap-1 rounded-lg border border-[#E1D9D4] px-3 text-xs font-medium text-[#514A46] hover:bg-[#F8F1ED] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                      <ChevronRight size={15} />
                    </button>

                  </div>

                </div>
              )}

          </section>

        </main>

      </div>

    </div>
  );
}

export default AdminDashboard;
