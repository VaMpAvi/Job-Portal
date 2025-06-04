const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const mongoose = require('mongoose');
const { sendAssessmentEmail } = require('../utils/emailService');

exports.submitApplication = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;
    const { coverLetter, resume } = req.body;

    // Check if user has already applied
    const existingApplication = await Application.findOne({ jobId, userId });
    if (existingApplication) {
      return res.status(400).json({ error: "You have already applied for this job" });
    }

    // Check if job exists and is still active
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    if (job.status !== 'active') {
      return res.status(400).json({ error: "This job is no longer accepting applications" });
    }

    const application = new Application({
      jobId,
      userId,
      coverLetter,
      resume,
      status: 'pending'
    });

    await application.save();

    res.status(201).json({ 
      message: "Application submitted successfully",
      application 
    });
  } catch (error) {
    console.error('Error in submitApplication:', error);
    res.status(500).json({ 
      error: "Failed to submit application",
      details: error.message 
    });
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user.id })
      .populate({
        path: 'jobId',
        select: 'title company location salary status requirements description',
        // Don't filter by status - show all jobs the user has applied to
      })
      .sort({ createdAt: -1 });

    // Map the applications to include job status and handle deleted jobs
    const validApplications = applications.map(app => ({
      ...app.toObject(),
      jobId: app.jobId || {
        title: 'Job No Longer Available',
        company: 'N/A',
        location: 'N/A',
        salary: 'N/A',
        status: 'deleted',
        requirements: [],
        description: 'This job posting has been removed.',
        _id: app.jobId
      }
    }));

    res.json(validApplications);
  } catch (error) {
    console.error('Error in getMyApplications:', error);
    res.status(500).json({ 
      error: "Failed to fetch applications",
      details: error.message 
    });
  }
};

exports.getEmployerApplications = async (req, res) => {
  try {
    // First get all jobs posted by this employer
    const employerJobs = await Job.find({ employerId: req.user.id });
    const jobIds = employerJobs.map(job => job._id);

    // Then get all applications for these jobs
    const applications = await Application.find({ jobId: { $in: jobIds } })
      .populate('jobId', 'title company location') // Get job details
      .populate('userId', 'name email') // Get applicant details
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      applications: applications.map(app => ({
        id: app._id.toString(), // For frontend compatibility
        _id: app._id.toString(), // Include the MongoDB _id
        job: {
          id: app.jobId._id,
          title: app.jobId.title,
          company: app.jobId.company,
          location: app.jobId.location
        },
        applicant: {
          id: app.userId._id,
          name: app.userId.name,
          email: app.userId.email
        },
        coverLetter: app.coverLetter,
        resume: app.resume,
        status: app.status,
        appliedAt: app.appliedAt
      }))
    });
  } catch (error) {
    console.error('Error in getEmployerApplications:', error);
    res.status(500).json({ 
      error: "Failed to fetch applications",
      details: error.message 
    });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, assessmentDetails } = req.body;

    const validStatuses = ['pending', 'assessment', 'hired', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({ error: "Invalid application ID format" });
    }

    const application = await Application.findById(applicationId)
      .populate('userId', 'name email')
      .populate('jobId', 'title');

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    const job = await Job.findById(application.jobId._id);

    if (!job) {
      return res.status(404).json({ error: "Associated job not found" });
    }

    if (job.employerId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to update this application" });
    }

    application.status = status;
    await application.save();

    if (status === 'assessment') {
      sendAssessmentEmail(
        application.userId.email,
        application.jobId.title,
        assessmentDetails || 'Please check your email for assessment details.'
      ).catch(error => {});
    }

    const updatedApplication = await Application.findById(applicationId)
      .populate('jobId', 'title company location')
      .populate('userId', 'name email');

    res.json({ 
      success: true,
      message: "Application status updated successfully",
      application: {
        id: updatedApplication._id.toString(),
        _id: updatedApplication._id.toString(),
        job: {
          id: updatedApplication.jobId._id,
          title: updatedApplication.jobId.title,
          company: updatedApplication.jobId.company,
          location: updatedApplication.jobId.location
        },
        applicant: {
          id: updatedApplication.userId._id,
          name: updatedApplication.userId.name,
          email: updatedApplication.userId.email
        },
        status: updatedApplication.status,
        appliedAt: updatedApplication.appliedAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update application status" });
  }
};
