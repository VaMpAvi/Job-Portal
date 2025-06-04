const express = require('express');
const router = express.Router();
const { submitApplication, getMyApplications, getEmployerApplications, updateApplicationStatus } = require('../controllers/applicationController');
const { verifyToken, checkRole } = require('../middleware/auth');

// Job seeker routes
router.post('/:jobId', verifyToken, checkRole('jobseeker'), submitApplication);
router.get('/my-applications', verifyToken, checkRole('jobseeker'), getMyApplications);

// Employer routes
router.get('/employer/applications', verifyToken, checkRole('employer'), getEmployerApplications);
router.put('/:applicationId/status', verifyToken, checkRole('employer'), updateApplicationStatus);

module.exports = router;