import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Building2, Clock, Loader2 } from 'lucide-react';
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
  hasApplied: boolean;
}

interface PaginationInfo {
  total: number;
  page: number;
  pages: number;
  hasMore: boolean;
}

// Define API URL explicitly
const API_URL = 'http://localhost:5000';

function Jobs() {
  const isDarkMode = useStore((state) => state.isDarkMode);
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [company, setCompany] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    pages: 1,
    hasMore: false
  });

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchJobs = async (page = 1) => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching jobs...');

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });

      if (debouncedSearch) params.append('search', debouncedSearch);
      if (location) params.append('location', location);
      if (company) params.append('company', company);

      const url = `${API_URL}/api/jobs?${params}`;
      console.log('Fetching from URL:', url);

      // Add authorization header if token exists
      const token = localStorage.getItem('token');
      const config = token ? {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      } : {};

      const response = await axios.get(url, config);
      console.log('API Response:', response.data);

      if (response.data && Array.isArray(response.data.jobs)) {
        // Debug log for jobs data
        console.log('Jobs with hasApplied field:', response.data.jobs.map((job: Job) => ({
          title: job.title,
          hasApplied: job.hasApplied
        })));
        
        setJobs(response.data.jobs);
        setPagination(response.data.pagination || {
          total: response.data.jobs.length,
          page: 1,
          pages: 1,
          hasMore: false
        });
      } else {
        console.error('Invalid response format:', response.data);
        setError('Invalid data format received from server');
      }
    } catch (err) {
      console.error('Error details:', err);
      if (axios.isAxiosError(err)) {
        setError(`Failed to fetch jobs: ${err.response?.data?.error || err.message}`);
      } else {
        setError('Failed to fetch jobs. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch jobs when search params change
  useEffect(() => {
    console.log('Search params changed, fetching jobs...');
    fetchJobs(1);
  }, [debouncedSearch, location, company]);

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
    <div className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Find Your Next Opportunity</h1>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className={`flex items-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-2 shadow-md`}>
              <Search className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full bg-transparent focus:outline-none ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} shadow-md`}
            />
            <input
              type="text"
              placeholder="Company..."
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} shadow-md`}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-8">No jobs found matching your criteria.</div>
      ) : (
        <>
          <div className="grid gap-6">
            {jobs.map(job => (
              <Link
                key={job._id}
                to={`/jobs/${job._id}`}
                className={`${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} p-6 rounded-lg shadow-md transition`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold mb-2">{job.title}</h2>
                      {job.hasApplied && (
                        <span className="px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-800">
                          ✓ Applied
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-gray-500 mb-2">
                      <Building2 className="w-4 h-4 mr-1" />
                      <span className="mr-4">{job.company}</span>
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {job.requirements?.map((req, index) => (
                        <span key={index} className={`px-3 py-1 rounded-full text-sm ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-blue-600">{job.salary}</div>
                    <div className="flex items-center text-gray-500 mt-2">
                      <Clock className="w-4 h-4 mr-1" />
                      <span className="text-sm">Posted {formatDate(job.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => fetchJobs(page)}
                  className={`px-4 py-2 rounded ${
                    pagination.page === page
                      ? 'bg-blue-500 text-white'
                      : isDarkMode
                      ? 'bg-gray-700 hover:bg-gray-600'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Jobs;