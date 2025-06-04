import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2, AlertCircle } from 'lucide-react';
import { useStore } from '../store';
import API from '../api';

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary: string;
  status: 'active' | 'closed' | 'draft';
  requirements: string[];
  createdAt: string;
}

function ManageJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isDarkMode = useStore((state) => state.isDarkMode);
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await API.get('/jobs/employer');
      setJobs(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch jobs. Please try again later.');
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (jobId: string, newStatus: 'active' | 'closed' | 'draft') => {
    try {
      await API.put(`/jobs/${jobId}`, { status: newStatus });
      fetchJobs(); // Refresh the jobs list
    } catch (err) {
      console.error('Error updating job status:', err);
    }
  };

  const handleDelete = async (jobId: string) => {
    try {
      await API.delete(`/jobs/${jobId}`);
      setJobs(jobs.filter(job => job._id !== jobId));
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting job:', err);
    }
  };

  const handleEdit = (jobId: string) => {
    navigate(`/employer/jobs/edit/${jobId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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

  return (
    <div className={`container mx-auto px-4 py-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Jobs</h1>
        <button
          onClick={() => navigate('/employer/jobs/create')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Post New Job
        </button>
      </div>

      {jobs.length === 0 ? (
        <p className="text-center text-gray-500">No jobs posted yet.</p>
      ) : (
        <div className="grid gap-6">
          {jobs.map((job) => (
            <div
              key={job._id}
              className={`p-6 rounded-lg shadow-md ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">{job.title}</h2>
                  <p className="text-gray-500">
                    {job.company} - {job.location}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      job.status
                    )}`}
                  >
                    {job.status}
                  </span>
                  <select
                    value={job.status}
                    onChange={(e) => handleStatusUpdate(job._id, e.target.value as 'active' | 'closed' | 'draft')}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                    } border`}
                  >
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-500">
                  Posted on: {new Date(job.createdAt).toLocaleDateString()}
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleEdit(job._id)}
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>
                  {showDeleteConfirm === job._id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-red-600">Are you sure?</span>
                      <button
                        onClick={() => handleDelete(job._id)}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        Yes, Delete
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowDeleteConfirm(job._id)}
                      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ManageJobs; 