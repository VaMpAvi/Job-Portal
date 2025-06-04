import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Building2, Clock, BriefcaseIcon, Send, ArrowLeft, Loader2, X } from 'lucide-react';
import { useStore } from '../store';
import axios from 'axios';

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary: string;
  requirements: string[];
  status: string;
  employerName: string;
  createdAt: string;
  employerId: {
    name: string;
    company: string;
  };
}

interface ApplicationFormData {
  coverLetter: string;
  resume: string;
}

const API = axios.create();

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isDarkMode = useStore((state) => state.isDarkMode);
  const currentUser = useStore((state) => state.currentUser);
  
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applicationError, setApplicationError] = useState('');
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [formData, setFormData] = useState<ApplicationFormData>({
    coverLetter: '',
    resume: ''
  });

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        const response = await API.get(`/jobs/${id}`);
        setJob(response.data);
        setError('');
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError('Failed to fetch job details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchJobDetails();
    }
  }, [id]);

  useEffect(() => {
    console.log('Current user:', currentUser);
    console.log('Should show apply button:', currentUser?.role === 'jobseeker');
  }, [currentUser]);

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

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setApplying(true);
      setApplicationError('');

      await API.post(
        `/applications/${id}`,
        formData
      );

      setApplicationSuccess(true);
      setShowApplyModal(false);
    } catch (err) {
      setApplicationError('Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const ApplicationModal = () => {
    const coverLetterRef = useRef<HTMLTextAreaElement>(null);
    const resumeRef = useRef<HTMLInputElement>(null);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div 
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full p-6 relative`}
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={() => setShowApplyModal(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>

          <h2 className="text-2xl font-bold mb-4">Apply for {job?.title}</h2>
          
          {applicationError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {applicationError}
            </div>
          )}

          <form onSubmit={handleApply}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Cover Letter
              </label>
              <textarea
                ref={coverLetterRef}
                required
                value={formData.coverLetter}
                onChange={(e) => {
                  e.preventDefault();
                  setFormData(prev => ({ ...prev, coverLetter: e.target.value }));
                }}
                className={`w-full p-3 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                }`}
                rows={6}
                placeholder="Write your cover letter here..."
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Resume/CV Link
              </label>
              <input
                ref={resumeRef}
                type="url"
                required
                value={formData.resume}
                onChange={(e) => {
                  e.preventDefault();
                  setFormData(prev => ({ ...prev, resume: e.target.value }));
                }}
                className={`w-full p-3 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                }`}
                placeholder="Paste your resume/CV link here"
              />
              <p className="text-sm text-gray-500 mt-1">
                Please provide a link to your resume (Google Drive, Dropbox, etc.)
              </p>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setShowApplyModal(false)}
                className={`px-4 py-2 rounded-lg ${
                  isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={applying}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {applying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Application
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error || 'Job not found'}</p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-500 hover:text-blue-600"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className={`${isDarkMode ? 'text-white' : 'text-gray-900'} max-w-7xl mx-auto px-4`}>
      <button
        onClick={() => navigate(-1)}
        className={`flex items-center mb-4 ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Jobs
      </button>

      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-8 mb-8`}>
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-4">{job.title}</h1>
            <div className="flex items-center text-gray-500 mb-4">
              <Building2 className="w-5 h-5 mr-2" />
              <span className="mr-4">{job.company}</span>
              <MapPin className="w-5 h-5 mr-2" />
              <span>{job.location}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {job.requirements?.slice(0, 2).map((req, index) => (
                <span key={index} className={`px-4 py-2 rounded-full text-sm ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  {req}
                </span>
              ))}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600 mb-2">{job.salary}</div>
            <div className="flex items-center text-gray-500">
              <Clock className="w-5 h-5 mr-2" />
              <span>Posted {formatDate(job.createdAt)}</span>
            </div>
          </div>
        </div>


        {currentUser?.role === 'jobseeker' && (
          <button
            onClick={() => setShowApplyModal(true)}
            className="w-full md:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
          >
            <Send className="w-5 h-5 mr-2" />
            Apply Now
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-8 mb-8`}>
            <h2 className="text-2xl font-bold mb-4">Job Description</h2>
            <p className="mb-6 whitespace-pre-line">{job.description}</p>

            <h3 className="text-xl font-bold mb-4">Requirements</h3>
            <ul className="list-disc pl-6 space-y-2">
              {job.requirements?.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-8`}>
            <h2 className="text-xl font-bold mb-4">Company Overview</h2>
            <div className="flex items-center mb-4">
              <Building2 className="w-12 h-12 text-blue-600 mr-4" />
              <div>
                <h3 className="font-semibold">{job.company}</h3>
                <p className="text-gray-500">{job.location}</p>
              </div>
            </div>
            <p className="text-gray-500">
              Posted by {job.employerName}
            </p>
          </div>
        </div>
      </div>

      {showApplyModal && <ApplicationModal />}

      {applicationSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
          Application submitted successfully!
        </div>
      )}
    </div>
  );
}

export default JobDetails;