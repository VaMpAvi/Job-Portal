const nodemailer = require('nodemailer');

// Create a reusable transporter object using connection pooling
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'avinash.banyal@somaiya.edu',
        pass: process.env.EMAIL_APP_PASSWORD || ''
    },
    tls: {
        rejectUnauthorized: false
    },
    pool: true, // Use pooled connections
    maxConnections: 5, // Maximum number of simultaneous connections
    maxMessages: 100 // Maximum number of messages per connection
});

// Function to send assessment email
const sendAssessmentEmail = async (to, jobTitle, assessmentDetails = 'Please check your dashboard for assessment details.') => {
    const mailOptions = {
        from: '"Job Portal" <avinash.banyal@somaiya.edu>',
        to: to,
        subject: `Assessment Required for ${jobTitle}`,
        html: `
            <h2>Assessment Required for Your Job Application</h2>
            <p>Dear Applicant,</p>
            <p>Your application for the position of <strong>${jobTitle}</strong> has moved to the assessment phase.</p>
            <h3>Assessment Details:</h3>
            <p>${assessmentDetails}</p>
            <p>Please complete the assessment at your earliest convenience.</p>
            <p>Best regards,<br>Job Portal Team</p>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        throw error;
    }
};

// Function to send welcome email
const sendWelcomeEmail = async (userEmail, userName) => {
    const mailOptions = {
        from: '"Job Portal" <avinash.banyal@somaiya.edu>',
        to: userEmail,
        subject: 'Welcome to Job Portal',
        html: `
            <h1>Welcome to Job Portal!</h1>
            <p>Dear ${userName},</p>
            <p>Thank you for registering with our Job Portal. We're excited to have you on board!</p>
            <p>You can now:</p>
            <ul>
                <li>Browse available jobs</li>
                <li>Create your profile</li>
                <li>Apply for positions</li>
            </ul>
            <p>Best regards,<br>Job Portal Team</p>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        throw error;
    }
};

// Function to send job application confirmation
const sendApplicationConfirmation = async (userEmail, userName, jobTitle, companyName) => {
    const mailOptions = {
        from: '"Job Portal" <avinash.banyal@somaiya.edu>',
        to: userEmail,
        subject: 'Job Application Confirmation',
        html: `
            <h1>Application Submitted Successfully!</h1>
            <p>Dear ${userName},</p>
            <p>Your application for the position of <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been successfully submitted.</p>
            <p>We will review your application and get back to you soon.</p>
            <p>Best regards,<br>Job Portal Team</p>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        throw error;
    }
};

// Function to send employer notification
const sendEmployerNotification = async (employerEmail, applicantName, jobTitle) => {
    const mailOptions = {
        from: '"Job Portal" <avinash.banyal@somaiya.edu>',
        to: employerEmail,
        subject: 'New Job Application Received',
        html: `
            <h1>New Application Alert!</h1>
            <p>Hello,</p>
            <p>You have received a new application for the position of <strong>${jobTitle}</strong>.</p>
            <p>Applicant Name: ${applicantName}</p>
            <p>Please login to your dashboard to review the application.</p>
            <p>Best regards,<br>Job Portal Team</p>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        throw error;
    }
};

module.exports = {
    sendAssessmentEmail,
    sendWelcomeEmail,
    sendApplicationConfirmation,
    sendEmployerNotification
}; 