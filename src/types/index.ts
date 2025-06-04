export interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  salary: string;
  employerName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  hasApplied?: boolean;
}

export interface Application {
  _id: string;
  jobId: string | Job;  // Can be either a string (ID) or populated Job object
  userId: string;
  status: 'pending' | 'reviewed' | 'rejected' | 'accepted';
  coverLetter: string;
  resume: string;
  appliedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'jobseeker' | 'employer';
  company?: string;
  token?: string;
}