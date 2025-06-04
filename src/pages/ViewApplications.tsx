import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import API from '../api';
import { CheckCircle, XCircle, Send } from 'lucide-react';
import { Dialog } from '@headlessui/react';

interface Application {
  id: string;
  _id?: string;
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
  };
  applicant: {
    id: string;
    name: string;
    email: string;
  };
  coverLetter: string;
  resume: string;
  status: string;
  appliedAt: string;
}

function ViewApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isDarkMode = useStore((state) => state.isDarkMode);
  const [showAssessmentDialog, setShowAssessmentDialog] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [assessmentDetails, setAssessmentDetails] = useState('');
  const [sendingAssessment, setSendingAssessment] = useState(false);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await API.get('/applications/employer/applications');
        setApplications(response.data.applications);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch applications. Please try again later.');
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    if (newStatus === 'assessment') {
      setSelectedApplication({ id: applicationId });
      setShowAssessmentDialog(true);
      return;
    }

    try {
      const response = await API.put(`/applications/${applicationId}/status`, {
        status: newStatus
      });
      
      if (response.data.success) {
        // Update the application in the state
        setApplications(applications.map(app =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        ));
      }
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  const handleAssessmentSubmit = async () => {
    if (!selectedApplication || !assessmentDetails.trim()) return;

    try {
      setSendingAssessment(true);
      
      // First update the UI immediately
      setApplications(applications.map(app =>
        app.id === selectedApplication.id ? { ...app, status: 'assessment' } : app
      ));
      
      // Close the dialog immediately to improve perceived performance
      setShowAssessmentDialog(false);
      
      // Then send the request
      const response = await API.put(`/applications/${selectedApplication.id}/status`, {
        status: 'assessment',
        assessmentDetails
      });
      
      if (!response.data.success) {
        // If the request failed, revert the UI change
        setApplications(applications.map(app =>
          app.id === selectedApplication.id ? { ...app, status: 'pending' } : app
        ));
        throw new Error('Failed to update status');
      }
      
      // Clear the form
      setAssessmentDetails('');
      setSelectedApplication(null);
      
    } catch (error) {
      console.error('Error updating application status:', error);
      // Show error message to user
      alert('Failed to send assessment. Please try again.');
      
    } finally {
      setSendingAssessment(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'assessment':
        return 'bg-blue-100 text-blue-800';
      case 'hired':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderActionButtons = (application: Application) => {
    if (application.status === 'pending') {
      return (
        <button
          onClick={() => handleStatusUpdate(application.id, 'assessment')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          <Send className="w-4 h-4" />
          Send Assessment
        </button>
      );
    }

    if (application.status === 'assessment') {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => handleStatusUpdate(application.id, 'hired')}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          >
            <CheckCircle className="w-4 h-4" />
            Hire
          </button>
          <button
            onClick={() => handleStatusUpdate(application.id, 'rejected')}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            <XCircle className="w-4 h-4" />
            Reject
          </button>
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const pendingApplications = applications.filter(app => 
    ['pending', 'assessment'].includes(app.status.toLowerCase())
  );

  return (
    <div className={`container mx-auto px-4 py-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      <h1 className="text-3xl font-bold mb-8">Job Applications</h1>
      
      {pendingApplications.length === 0 ? (
        <p className="text-center text-gray-500">No pending applications.</p>
      ) : (
        <div className="grid gap-6">
          {pendingApplications.map((application) => (
            <div
              key={application.id}
              className={`p-6 rounded-lg shadow-md ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">{application.job.title}</h2>
                  <p className="text-gray-500">
                    {application.job.company} - {application.job.location}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      application.status
                    )}`}
                  >
                    {application.status}
                  </span>
                  {renderActionButtons(application)}
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold mb-2">Applicant Information</h3>
                <p>{application.applicant.name}</p>
                <p className="text-gray-500">{application.applicant.email}</p>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold mb-2">Cover Letter</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{application.coverLetter}</p>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold mb-2">Resume</h3>
                <a
                  href={application.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600"
                >
                  View Resume
                </a>
              </div>

              <div className="text-sm text-gray-500">
                Applied on: {new Date(application.appliedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assessment Details Dialog */}
      <Dialog
        open={showAssessmentDialog}
        onClose={() => {
          if (!sendingAssessment) {
            setShowAssessmentDialog(false);
            setAssessmentDetails('');
            setSelectedApplication(null);
          }
        }}
        className="relative z-50"
      >
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        {/* Full-screen container to center the panel */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
            <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
              Send Assessment Details
            </Dialog.Title>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assessment Instructions
              </label>
              <textarea
                value={assessmentDetails}
                onChange={(e) => setAssessmentDetails(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                placeholder="Enter assessment details, instructions, or links..."
                disabled={sendingAssessment}
              />
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => {
                  if (!sendingAssessment) {
                    setShowAssessmentDialog(false);
                    setAssessmentDetails('');
                    setSelectedApplication(null);
                  }
                }}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={sendingAssessment}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssessmentSubmit}
                className={`inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  sendingAssessment ? 'opacity-75 cursor-not-allowed' : ''
                }`}
                disabled={!assessmentDetails.trim() || sendingAssessment}
              >
                {sendingAssessment ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Assessment'
                )}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}

export default ViewApplications; 