import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  Search,
  Building2,
  Badge,
  BaggageClaim,
  Settings,
} from "lucide-react";
import { useStore } from "../store";

function Home() {
  const isDarkMode = useStore((state) => state.isDarkMode);
  const currentUser = useStore((state) => state.currentUser);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
  }, []);

  return (
    <div className={`${isDarkMode ? "text-white" : "text-gray-900"}`}>
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">
          {currentUser
            ? `Welcome, ${currentUser.name}!`
            : "Find Your Dream Job Today"}
        </h1>

        {role === "jobseeker" && (
          <p className="text-xl mb-8">
             Connect with top employers and opportunities
          </p>
        )}

        {/* Only employers can see the Post a Job button */}
        {role === "employer" && (
          <p className="text-xl mb-8">
            Engage with top-tier candidates and streamline your hiring process
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
        {/* Cards for jobseekers */}
        {role === "jobseeker" && (
          <>
            <Link to="/jobs" className="block w-full">
              <Card
                icon={<Search className="w-12 h-12 text-blue-600 mb-4" />}
                title="Search Jobs"
                text="Browse through thousands of job listings from top companies."
                isDarkMode={isDarkMode}
              />
            </Link>
            <Link to="/jobseeker/applications" className="block w-full">
              <Card
                icon={<Briefcase className="w-12 h-12 text-blue-600 mb-4" />}
                title="Applied Jobs"
                text="Track your job applications and their current status."
                isDarkMode={isDarkMode}
              />
            </Link>
          </>
        )}

        {/* Cards for employers */}
        {role === "employer" && (
          <>
            <Link to="/employer/viewApplications" className="block w-full">
              <Card
                icon={<Building2 className="w-12 h-12 text-blue-600 mb-4" />}
                title="View Applications"
                text="Manage your job postings and view applicant statistics."
                isDarkMode={isDarkMode}
              />
            </Link>
            <Link to="/employer/jobs/create" className="block w-full">
              <Card
                icon={<Briefcase className="w-12 h-12 text-blue-600 mb-4" />}
                title="Post a Job"
                text="Create a new job listing and reach potential candidates."
                isDarkMode={isDarkMode}
              />
            </Link>
            <Link to="/employer/candidates" className="block w-full">
              <Card
                icon={<Badge className="w-12 h-12 text-blue-600 mb-4" />}
                title="Candidate List"
                text="View all hired and rejected candidates."
                isDarkMode={isDarkMode}
              />
            </Link>
            <Link to="/employer/jobs/manage" className="block w-full">
              <Card
                icon={<Settings className="w-12 h-12 text-blue-600 mb-4" />}
                title="Manage Jobs"
                text="Update or remove your job postings."
                isDarkMode={isDarkMode}
              />
            </Link>
          </>
        )}

        {/* Show search jobs to non-logged in users */}
        {!role && (
          <>
            <Link to="/jobs" className="block w-full">
              <Card
                icon={<Search className="w-12 h-12 text-blue-600 mb-4" />}
                title="Search Jobs"
                text="Browse through thousands of job listings from top companies."
                isDarkMode={isDarkMode}
              />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

type CardProps = {
  icon: React.ReactNode;
  title: string;
  text: string;
  isDarkMode: boolean;
};

function Card({ icon, title, text, isDarkMode }: CardProps) {
  return (
    <div
      className={`${
        isDarkMode
          ? "bg-gray-800 hover:bg-gray-700"
          : "bg-white hover:bg-gray-50"
      } p-6 rounded-lg shadow-md text-center transition h-full`}
    >
      <div className="flex justify-center">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-500">{text}</p>
    </div>
  );
}

export default Home;