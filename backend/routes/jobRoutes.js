const express = require('express');
const router = express.Router();
const { createJob, getJobs, getEmployerJobs, updateJob, deleteJob, getJobById } = require('../controllers/jobController');
const { verifyToken, checkRole } = require('../middleware/auth');

// Create optional auth middleware
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    // If there's a token, verify it
    verifyToken(req, res, next);
  } else {
    // If no token, continue without setting req.user
    next();
  }
};

// Public routes with optional auth
router.get('/', optionalAuth, getJobs);

// Employer routes (protected)
router.post('/', verifyToken, checkRole('employer'), createJob);
router.get('/employer', verifyToken, checkRole('employer'), getEmployerJobs);
router.put('/:id', verifyToken, checkRole('employer'), updateJob);
router.delete('/:id', verifyToken, checkRole('employer'), deleteJob);

// This needs to be last since it's a catch-all for IDs
router.get('/:id', optionalAuth, getJobById);

module.exports = router;