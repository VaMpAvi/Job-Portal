const Job = require('../models/job');
const User = require('../models/User');
const { sendApplicationConfirmation, sendEmployerNotification } = require('../utils/emailService');

exports.createJob = async (req, res) => {
  try {
    // Get the employer's information
    const employer = await User.findById(req.user.id);
    if (!employer || employer.role !== 'employer') {
      return res.status(403).json({ error: "Only employers can create jobs" });
    }

    // Create job data with employer's company first
    const jobData = {
      company: employer.company, // Set company first from employer data
      employerId: req.user.id,
      employerName: employer.name,
      ...req.body // Allow override of other fields but not employer-specific ones
    };

    const job = new Job(jobData);
    await job.save();
    res.status(201).json(job);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ 
      error: "Failed to create job",
      details: error.message 
    });
  }
};

exports.getJobs = async (req, res) => {
  try {
    console.log('Received request for jobs with query:', req.query);
    
    const {
      search,
      location,
      company,
      page = 1,
      limit = 10
    } = req.query;

    // Build query
    const query = { status: 'active' };
    console.log('Initial query:', query);

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    // Location filter
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Company filter
    if (company) {
      query.company = { $regex: company, $options: 'i' };
    }

    console.log('Final query:', JSON.stringify(query, null, 2));

    // Calculate skip for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get total count for pagination
    const total = await Job.countDocuments(query);
    console.log('Total matching jobs:', total);

    // Execute query with pagination
    let jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(); // Convert to plain JavaScript objects

    // If user is authenticated, check which jobs they've applied to
    if (req.user) {
      const Application = require('../models/Application');
      const userApplications = await Application.find({
        userId: req.user.id
      }).select('jobId').lean();

      const appliedJobIds = new Set(userApplications.map(app => app.jobId.toString()));
      
      // Add hasApplied field to each job
      jobs = jobs.map(job => ({
        ...job,
        hasApplied: appliedJobIds.has(job._id.toString())
      }));
    }

    console.log(`Found ${jobs.length} jobs`);

    const response = {
      jobs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        hasMore: skip + jobs.length < total
      }
    };

    console.log('Sending response:', JSON.stringify(response, null, 2));
    res.json(response);
  } catch (error) {
    console.error('Error in getJobs:', error);
    res.status(500).json({ 
      error: "Failed to fetch jobs",
      details: error.message
    });
  }
};

// New method to get jobs by employer
exports.getEmployerJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ employerId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching employer jobs:', error);
    res.status(500).json({ error: "Failed to fetch employer jobs" });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, employerId: req.user.id });
    if (!job) {
      return res.status(404).json({ error: "Job not found or unauthorized" });
    }

    // Don't allow updating employerId or employerName
    const { employerId, employerName, ...updateData } = req.body;
    
    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    res.json(updatedJob);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: "Failed to update job" });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, employerId: req.user.id });
    if (!job) {
      return res.status(404).json({ error: "Job not found or unauthorized" });
    }

    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: "Failed to delete job" });
  }
};

exports.getJobById = async (req, res) => {
  try {
    console.log('Fetching job with ID:', req.params.id);
    
    const job = await Job.findById(req.params.id)
      .populate('employerId', 'name company') // Populate employer details
      .lean();

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    console.log('Found job:', job);
    res.json(job);
  } catch (error) {
    console.error('Error in getJobById:', error);
    res.status(500).json({ 
      error: "Failed to fetch job details",
      details: error.message 
    });
  }
};

const applyForJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const userId = req.user.id; // Assuming this comes from auth middleware

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user has already applied
        if (job.applicants.includes(userId)) {
            return res.status(400).json({ message: 'You have already applied for this job' });
        }

        // Add user to applicants
        job.applicants.push(userId);
        await job.save();

        // Get employer details
        const employer = await User.findById(job.employerId);

        // Send confirmation email to applicant
        await sendApplicationConfirmation(user.email, user.name, job.title, job.company);

        // Send notification to employer
        if (employer && employer.email) {
            await sendEmployerNotification(employer.email, user.name, job.title);
        }

        res.status(200).json({ message: 'Application submitted successfully' });
    } catch (error) {
        console.error('Job application error:', error);
        res.status(500).json({ message: 'Error applying for job', error: error.message });
    }
};