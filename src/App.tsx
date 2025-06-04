import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import EmployerDashboard from './pages/EmployerDashboard';
import JobSeekerDashboard from './pages/JobSeekerDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateJob from './pages/CreateJob';
import AppliedJobs from './pages/AppliedJobs';
import ViewApplications from './pages/ViewApplications';
import CandidateList from './pages/CandidateList';
import ManageJobs from './pages/ManageJobs';
import EditJob from './pages/EditJob';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const isDarkMode = useStore((state) => state.isDarkMode);
  const setCurrentUser = useStore((state) => state.setCurrentUser);
  const currentUser = useStore((state) => state.currentUser);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token && !currentUser) {
      const userId = localStorage.getItem('userId');
      const userName = localStorage.getItem('userName');
      const userEmail = localStorage.getItem('userEmail');
      const userRole = localStorage.getItem('role');

      if (userId && userName && userEmail && userRole && (userRole === 'jobseeker' || userRole === 'employer')) {
        const user = {
          _id: userId,
          name: userName,
          email: userEmail,
          role: userRole as 'jobseeker' | 'employer',
          company: localStorage.getItem('userCompany') || undefined,
          token: token
        };
        setCurrentUser(user);
      } else {
        localStorage.clear();
      }
    }
  }, []);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <BrowserRouter>
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/employer/dashboard"
              element={
                <ProtectedRoute allowedRoles={['employer']}>
                  <EmployerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/jobs/create"
              element={
                <ProtectedRoute allowedRoles={['employer']}>
                  <CreateJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/jobs/manage"
              element={
                <ProtectedRoute allowedRoles={['employer']}>
                  <ManageJobs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/jobs/edit/:id"
              element={
                <ProtectedRoute allowedRoles={['employer']}>
                  <EditJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/viewApplications"
              element={
                <ProtectedRoute allowedRoles={['employer']}>
                  <ViewApplications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/candidates"
              element={
                <ProtectedRoute allowedRoles={['employer']}>
                  <CandidateList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/jobseeker/dashboard"
              element={
                <ProtectedRoute allowedRoles={['jobseeker']}>
                  <JobSeekerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobseeker/applications"
              element={
                <ProtectedRoute allowedRoles={['jobseeker']}>
                  <AppliedJobs />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </BrowserRouter>
    </div>
  );
}

export default App;