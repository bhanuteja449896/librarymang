/**
 * Email Configuration
 * Configure email transport settings and options
 */

const config = {
  // Email service provider settings
  service: process.env.EMAIL_SERVICE || 'gmail',
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  
  // Authentication credentials
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASSWORD || '',
  },
  
  // Default sender
  from: {
    name: process.env.EMAIL_FROM_NAME || 'Library Management System',
    address: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER || 'noreply@library.com',
  },
  
  // Email sending options
  options: {
    // Maximum number of connection retries
    maxConnections: 5,
    maxMessages: 10,
    
    // Rate limiting
    rateLimit: 10, // max 10 emails per second
    
    // Pool options
    pool: true,
  },
  
  // Feature flags
  enabled: process.env.EMAIL_ENABLED !== 'false', // Default to enabled unless explicitly disabled
  
  // Notification settings
  notifications: {
    overdueReminder: {
      enabled: process.env.OVERDUE_REMINDER_ENABLED !== 'false',
      daysBeforeDue: parseInt(process.env.DAYS_BEFORE_DUE_REMINDER) || 2,
      cronSchedule: process.env.OVERDUE_CRON_SCHEDULE || '0 9 * * *', // Daily at 9 AM
    },
    returnConfirmation: {
      enabled: process.env.RETURN_CONFIRMATION_ENABLED !== 'false',
    },
    borrowConfirmation: {
      enabled: process.env.BORROW_CONFIRMATION_ENABLED !== 'false',
    },
  },
};

module.exports = config;
