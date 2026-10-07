import { Navigate,Route,Routes } from "react-router-dom";

import CandidateDashboard from "./features/auth/pages/CandidateDashboard";
import CandidateRegistration from './features/auth/pages/CandidateRegistration';
import EmailVerification from './features/auth/pages/EmailVerification';
import ForgotPassword from './features/auth/pages/ForgotPassword';
import Login from './features/auth/pages/Login';
import RecruiterDashboard from './features/auth/pages/RecruiterDashboard';
import RecruiterRegistration from './features/auth/pages/RecruiterRegistration';
import ResetPassword from './features/auth/pages/ResetPassword';

function App(){
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
      <Route
        path="/candidate/dashboard"
        element={<CandidateDashboard />}
      />

      {/* Recruiter */}
      <Route
        path="/recruiter/dashboard"
        element={<RecruiterDashboard />}
      />

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