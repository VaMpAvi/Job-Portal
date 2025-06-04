# Job Portal Application

A full-stack job portal application built with React, Node.js, Express, and MongoDB.

## Features

- User authentication (Job seekers and Employers)
- Job posting and management
- Job application system
- Application tracking
- Profile management
- Dark mode support

## Tech Stack

### Frontend
- React
- React Router
- Tailwind CSS
- Zustand (State Management)
- Axios

### Backend
- Node.js
- Express
- MongoDB
- JWT Authentication
- Nodemailer

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd job-portal
```

2. Install dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Environment Setup

Create a .env file in the backend directory with the following variables:
```env
MONGODB_URI=mongodb://localhost:27017/JobPortal
JWT_SECRET=your_jwt_secret
PORT=5000
EMAIL_APP_PASSWORD=your_email_app_password
```

4. Start the application
```bash
# Start backend server (from backend directory)
npm start

# Start frontend development server (from frontend directory)
npm run dev
```

## API Documentation

### Authentication Routes
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user

### Job Routes
- GET /api/jobs - Get all jobs
- POST /api/jobs - Create a new job (Employer only)
- PUT /api/jobs/:id - Update a job (Employer only)
- DELETE /api/jobs/:id - Delete a job (Employer only)

### Application Routes
- POST /api/applications/:jobId - Submit job application
- GET /api/applications - Get user's applications
- PUT /api/applications/:id - Update application status (Employer only)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
