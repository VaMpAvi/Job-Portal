import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Clock, Loader2, CheckCircle2, XCircle, Clock3, AlertCircle } from 'lucide-react';
import { useStore } from '../store';
import axios from 'axios';
import { Application, Job } from '../types';

const API_URL = 'http://localhost:5000';

interface JobApplication extends Omit<Application, 'jobId'> {
  jobId: Job;
}

function AppliedJobs() {
  const isDarkMode = useStore((state) => state.isDarkMode);
  const navigate = useNavigate();
  
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/applications/my-applications`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setApplications(response.data);
        setError('');
      } catch (err) {
        console.error('Error fetching applications:', err);
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.error || 'Failed to fetch applications');
        } else {
          setError('Failed to fetch applications');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const getStatusIcon = (status: string | undefined) => {
    if (!status) return <AlertCircle className="w-5 h-5 text-gray-500" />;
    
    switch (status.toLowerCase()) {
      case 'hired':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'assessment':
        return <Clock3 className="w-5 h-5 text-blue-500" />;
      case 'pending':
        return <Clock3 className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusStyle = (status: string | undefined) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status.toLowerCase()) {
      case 'hired':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'assessment':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getJobStatusStyle = (status: string | undefined) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'deleted':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Applications</h1>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : applications.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">You haven't applied to any jobs yet.</p>
          <button
            onClick={() => navigate('/jobs')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Browse Jobs
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {applications.map((application) => (
            <div
              key={application._id}
              className={`${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              } p-6 rounded-lg shadow-md`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold mb-2">{application.jobId?.title || 'Job No Longer Available'}</h2>
                  <div className="flex items-center text-gray-500 mb-2">
                    <Building2 className="w-4 h-4 mr-1" />
                    <span className="mr-4">{application.jobId?.company || 'N/A'}</span>
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{application.jobId?.location || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${getStatusStyle(application.status)}`}>
                      {getStatusIcon(application.status)}
                      {(application.status || 'Unknown').charAt(0).toUpperCase() + (application.status || 'Unknown').slice(1)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm ${getJobStatusStyle(application.jobId?.status)}`}>
                      Job {(application.jobId?.status || 'Unknown').charAt(0).toUpperCase() + (application.jobId?.status || 'Unknown').slice(1)}
                    </span>
                    <span className="text-sm text-gray-500">
                      Applied {formatDate(application.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-blue-600">
                    {application.jobId?.salary || 'N/A'}
                  </div>
                  {application.jobId?._id && application.jobId?.status !== 'deleted' && (
                    <button
                      onClick={() => navigate(`/jobs/${application.jobId._id}`)}
                      className="mt-2 text-blue-500 hover:text-blue-600 text-sm"
                    >
                      View Job Details
                    </button>
                  )}
                </div>
              </div>
              {application.jobId?.status === 'closed' && (
                <div className="mt-4 p-4 bg-gray-100 rounded-lg text-gray-700">
                  <h3 className="font-semibold mb-2">Job Description</h3>
                  <p>{application.jobId?.description || 'No description available'}</p>
                  {application.jobId?.requirements && application.jobId.requirements.length > 0 && (
                    <>
                      <h3 className="font-semibold mt-4 mb-2">Requirements</h3>
                      <ul className="list-disc list-inside">
                        {application.jobId.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AppliedJobs; 