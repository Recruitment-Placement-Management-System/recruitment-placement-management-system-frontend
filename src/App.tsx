import { Navigate,Route,Routes } from "react-router-dom";

import CandidateDashboard from "./features/auth/pages/CandidateDashboard";
import CandidateRegistration from './features/auth/pages/CandidateRegistration';
import EmailVerification from './features/auth/pages/EmailVerification';
import ForgotPassword from './features/auth/pages/ForgotPassword';
import Login from './features/auth/pages/Login';
import RecruiterDashboard from './features/auth/pages/RecruiterDashboard';
import RecruiterRegistration from './features/auth/pages/RecruiterRegistration';
import ResetPassword from './features/auth/pages/ResetPassword';

import ProtectedRoute from "./features/auth/components/ProctectedRoute";

import { useEffect } from "react";
import { refreshAccessToken } from "./api/refresh.api";
import useAuthStore from "./store/auth.store";

function App(){

  const login = useAuthStore((state)=>state.login);
  const setInitializing = useAuthStore((state)=>state.setInitializing);

   useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await refreshAccessToken();

        login(
          response.accessToken,
          response.user
        );
      } catch {
        // No valid refresh session.
        // User remains logged out.
      } finally {
        setInitializing(false);
      }
    };

    restoreSession();
  }, [login, setInitializing]);
  return(
    <Routes>

      {/*authentication*/}

      <Route path="/login" element={<Login/>} />

      <Route path="/candidate/register" element={<CandidateRegistration/>} />

      <Route
        path="/recruiter/register"
        element={<RecruiterRegistration />}
      />

      <Route
        path="/verify-email"
        element={<EmailVerification />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/reset-password"
        element={<ResetPassword />}
      />

      {/* Candidate */}
      <Route element={<ProtectedRoute allowedRoles={['candidate']}/>}>
      <Route
        path="/candidate/dashboard"
        element={<CandidateDashboard />}
      />
      </Route>

      {/* Recruiter */}
      <Route element={<ProtectedRoute allowedRoles={['recruiter']} />}>
  <Route
    path="/recruiter/dashboard"
    element={<RecruiterDashboard />}
  />
</Route>

      {/* Default */}
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      {/* Unknown route */}
      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  )
}

export default App;