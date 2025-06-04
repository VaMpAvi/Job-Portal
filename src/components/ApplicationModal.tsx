import React, { useState } from 'react';
import { Send, X, Loader2 } from 'lucide-react';
import axios from 'axios';

interface ApplicationModalProps {
  jobId: string;
  jobTitle: string;
  onClose: () => void;
  onSuccess: () => void;
  isDarkMode: boolean;
}

const API_URL = 'http://localhost:5000';

export function ApplicationModal({ jobId, jobTitle, onClose, onSuccess, isDarkMode }: ApplicationModalProps) {
  const [formData, setFormData] = useState({
    coverLetter: '',
    resume: ''
  });
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setApplying(true);
      setError('');

      await axios.post(
        `${API_URL}/api/applications/${jobId}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      onSuccess();
      onClose();
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Failed to submit application');
      } else {
        setError('Failed to submit application');
      }
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div 
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full p-6 relative`}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-4">Apply for {jobTitle}</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Cover Letter
            </label>
            <textarea
              required
              value={formData.coverLetter}
              onChange={(e) => setFormData(prev => ({ ...prev, coverLetter: e.target.value }))}
              className={`w-full p-3 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300'
              }`}
              rows={6}
              placeholder="Paste your cover letter here..."
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Resume/CV Link
            </label>
            <input
              type="url"
              required
              value={formData.resume}
              onChange={(e) => setFormData(prev => ({ ...prev, resume: e.target.value }))}
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
              onClick={onClose}
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
} 