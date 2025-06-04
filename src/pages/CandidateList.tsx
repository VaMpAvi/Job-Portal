import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import API from '../api';
import { CheckCircle, XCircle } from 'lucide-react';

interface Candidate {
  id: string;
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
  status: string;
  appliedAt: string;
}

function CandidateList() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isDarkMode = useStore((state) => state.isDarkMode);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await API.get('/applications/employer/applications');
        // Filter only hired and rejected candidates
        const filteredCandidates = response.data.applications.filter((app: Candidate) =>
          ['hired', 'rejected'].includes(app.status.toLowerCase())
        );
        setCandidates(filteredCandidates);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch candidates. Please try again later.');
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'hired':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'hired':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
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
      <h1 className="text-3xl font-bold mb-8">Candidate List</h1>
      
      {candidates.length === 0 ? (
        <p className="text-center text-gray-500">No candidates found.</p>
      ) : (
        <div className="grid gap-4">
          {candidates.map((candidate) => (
            <div
              key={candidate.id}
              className={`p-4 rounded-lg shadow-md ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              } flex items-center justify-between`}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-semibold">{candidate.applicant.name}</h2>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-500">{candidate.applicant.email}</span>
                </div>
                <p className="text-sm text-gray-500">
                  Applied for: {candidate.job.title} at {candidate.job.company}
                </p>
                <p className="text-sm text-gray-500">
                  Location: {candidate.job.location}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusColor(
                    candidate.status
                  )}`}
                >
                  {getStatusIcon(candidate.status)}
                  {candidate.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CandidateList; 