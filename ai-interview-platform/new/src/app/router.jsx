import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "../modules/home/Home";
import Login from "../modules/auth/Login";
import Register from '../modules/auth/Register';
import Profile from "../modules/candidate/Profile";
import AdminsHRMyProfile from "../modules/hr/AdminsHRMyProfile";
import InterviewPage from "../modules/candidate/InterviewPage";
import ReportPage from "../modules/candidate/ReportPage";
import InterviewRoom from '../modules/candidate/Interviewroom';

import HRLayout from "../modules/hr/HRLayout";
import HRDashboard from "../modules/hr/HRDashboard";
import ScheduleInterview from "../modules/hr/ScheduleInterview";
import MonitorCandidate from "../modules/hr/MonitorCandidate";
import HRReports from "../modules/hr/HRReports";
import HRInterviewReport from "../modules/hr/HRInterviewReport";
import ManageRoles from "../modules/hr/RoleManagement";
import ManageQuestions from "../modules/hr/QuestionManagement";
import ManageCandidates from "../modules/hr/CandidateList";
import InterviewList from "../modules/hr/InterviewList";
import InterviewDetails from "../modules/hr/InterviewDetails";
import CompletedCandidates from "../modules/hr/CompletedCandidates";
import AiInterviewReport from "../modules/hr/AIInterviewreport";


import AdminLayout from "../modules/admin/AdminLayout";
import AdminDashboard from "../modules/admin/AdminDashboard";
import Candidates from "../modules/admin/Candidates";
import Interviews from "../modules/admin/Interviews";
import Questions from "../modules/admin/Questions";
import AddQuestion from "../modules/admin/AddQuestion";
import Reports from "../modules/admin/Reports";
import Settings from "../modules/admin/Settings";
import HRAccount from "../modules/admin/HRAccount";

import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import InterviewMain from "../modules/candidate/InterviewMain";
import CandidateDashboard from "../modules/candidate/InterviewMainList";
import AIInterviewReport from "../modules/hr/AIInterviewreport";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Candidate Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/candidate-dashboard"
          element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <CandidateDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/interview/:id/live"
          element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <InterviewMain />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/candidate/interview/:id"
          element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <InterviewRoom />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/candidate/report/:id"
          element={
            <ProtectedRoute allowedRoles={['candidate', 'hr']}>
              <ReportPage />
            </ProtectedRoute>
          }
        />

        {/* HR Routes */}
        <Route path="/hr-dashboard" element={<Navigate to="/hr/dashboard" replace />} />

        <Route path="/hr" element={<HRLayout />}>
          <Route index element={<Navigate to="/hr/dashboard" replace />} />
          
          <Route 
            path="dashboard" 
            element={
              <ProtectedRoute allowedRoles={['hr', 'admin']}>
                <HRDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="my-profile" 
            element={
              <ProtectedRoute allowedRoles={['hr', 'admin']}>
                <AdminsHRMyProfile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="schedule-interview" 
            element={
              <ProtectedRoute allowedRoles={['hr', 'admin']}>
                <ScheduleInterview />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="monitor/:id" 
            element={
              <ProtectedRoute allowedRoles={['hr', 'admin']}>
                <MonitorCandidate />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="ai-reports" 
            element={
              <ProtectedRoute allowedRoles={['hr', 'admin']}>
                <AIInterviewReport />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="reports" 
            element={
              <ProtectedRoute allowedRoles={['hr', 'admin']}>
                <HRReports />
              </ProtectedRoute>
            } 
          />
          <Route 
  path="reports/:interviewId/:candidateId" 
  element={
    <ProtectedRoute allowedRoles={['hr', 'admin']}>
      <HRInterviewReport />
    </ProtectedRoute>
  } 
/>
          <Route 
            path="candidates" 
            element={
              <ProtectedRoute allowedRoles={['hr', 'admin']}>
                <ManageCandidates />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="job-roles" 
            element={
              <ProtectedRoute allowedRoles={['hr', 'admin']}>
                <ManageRoles />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="manage-questions" 
            element={
              <ProtectedRoute allowedRoles={['hr', 'admin']}>
                <ManageQuestions />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="interviews" 
            element={
              <ProtectedRoute allowedRoles={['hr', 'admin']}>
                <InterviewList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="interviews/:id" 
            element={
              <ProtectedRoute allowedRoles={['hr', 'admin']}>
                <InterviewDetails />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="completed-candidates" 
            element={
              <ProtectedRoute allowedRoles={['hr', 'admin']}>
                <CompletedCandidates />
              </ProtectedRoute>
            } 
          />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin-dashboard" element={<Navigate to="/admin/dashboard" replace />} />

        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route 
            path="candidates" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Candidates />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="interviews" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Interviews />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="questions" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Questions />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="questions/add" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AddQuestion />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="reports" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Reports />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="settings" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Settings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="hr-accounts" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <HRAccount />
              </ProtectedRoute>
            } 
          />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}