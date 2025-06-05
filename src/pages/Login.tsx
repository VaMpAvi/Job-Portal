import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { useStore } from "../store";
import API from "../api";
import { Link } from "react-router-dom";
import { User } from "../types";

function Login() {
  const navigate = useNavigate();
  const isDarkMode = useStore((state) => state.isDarkMode);
  const setCurrentUser = useStore((state) => state.setCurrentUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Attempting login...');
      const res = await API.post("/auth/login", { email, password });
      console.log('Login response:', res.data);
      
      const { token, ...userData } = res.data;
      
      // Store user data in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("userId", res.data._id || res.data.id);
      localStorage.setItem("userName", res.data.name);
      localStorage.setItem("userEmail", res.data.email);
      if (res.data.company) {
        localStorage.setItem("userCompany", res.data.company);
      }
      
      // Set current user with correct structure
      const user: User = {
        _id: userData._id || userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        company: userData.company,
        token
      };
      
      console.log('Setting user in store:', user);
      setCurrentUser(user);
      navigate('/');
    } catch (err: any) {
      console.error('Login error:', err.response?.data || err);
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div
        className={`${
          isDarkMode ? "bg-gray-800" : "bg-white"
        } rounded-lg shadow-md p-8`}
      >
        <div className="flex items-center justify-center mb-8">
          <LogIn className="w-12 h-12 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-center mb-8">Welcome Back</h1>
        {error && (
          <div className="bg-red-100 border text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full p-3 rounded-lg ${
                isDarkMode ? "bg-gray-700" : "bg-gray-50"
              } border`}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Password *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full p-3 rounded-lg ${
                isDarkMode ? "bg-gray-700" : "bg-gray-50"
              } border`}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Sign In
          </button>
        </form>
        <p className="mt-4 text-center">
          Don't have an account?{" "}
          <Link to="/register">
            <span className="text-blue-500 hover:text-blue-600">
              Create One
            </span>
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
