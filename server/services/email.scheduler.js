/**
 * Email Scheduler
 * Handles scheduled email notifications for overdue books and reminders
 */

const cron = require('node-cron');
const emailService = require('./email.service');
const emailConfig = require('../config/email.config');
const Borrow = require('../models/Borrow');
const User = require('../models/User');

class EmailScheduler {
  constructor() {
    this.jobs = [];
    this.isRunning = false;
  }

  /**
   * Start all scheduled jobs
   */
  start() {
    if (this.isRunning) {
      console.log('Email scheduler is already running');
      return;
    }

    if (!emailConfig.enabled) {
      console.log('Email service disabled - scheduler not started');
      return;
    }

    // Schedule overdue and reminder checks
    const cronSchedule = emailConfig.notifications.overdueReminder.cronSchedule;
    console.log(`Starting email scheduler with cron: ${cronSchedule}`);

    const job = cron.schedule(cronSchedule, async () => {
      await this.checkAndSendNotifications();
    });

    this.jobs.push(job);
    this.isRunning = true;
    console.log('Email scheduler started successfully');

    // Run once on startup
    this.checkAndSendNotifications();
  }

  /**
   * Stop all scheduled jobs
   */
  stop() {
    this.jobs.forEach(job => job.stop());
    this.jobs = [];
    this.isRunning = false;
    console.log('Email scheduler stopped');
  }

  /**
   * Check for books that need notifications and send emails
   */
  async checkAndSendNotifications() {
    try {
      console.log('Checking for books requiring notifications...');
      
      const now = new Date();
      const daysBeforeDue = emailConfig.notifications.overdueReminder.daysBeforeDue;
      const reminderDate = new Date();
      reminderDate.setDate(now.getDate() + daysBeforeDue);

      // Find all active borrows
      const activeBorrows = await Borrow.find({
        status: 'borrowed'
      }).populate('book').populate('user');

      let overdueCount = 0;
      let reminderCount = 0;
      let errorCount = 0;

      for (const borrow of activeBorrows) {
        try {
          const dueDate = new Date(borrow.dueDate);
          
          // Check if overdue
          if (dueDate < now) {
            console.log(`Sending overdue notification for book: ${borrow.book.title} to ${borrow.user.email}`);
            await emailService.sendOverdueNotification(borrow.user, borrow);
            overdueCount++;
          }
          // Check if reminder should be sent
          else if (dueDate <= reminderDate && dueDate > now) {
            // Check if reminder was already sent (optional: add a flag to Borrow model)
            console.log(`Sending reminder for book: ${borrow.book.title} to ${borrow.user.email}`);
            await emailService.sendReminderNotification(borrow.user, borrow);
            reminderCount++;
          }
        } catch (error) {
          console.error(`Error sending notification for borrow ${borrow._id}:`, error.message);
          errorCount++;
        }
      }

      console.log(`Notification check complete:
        - Overdue notifications sent: ${overdueCount}
        - Reminder notifications sent: ${reminderCount}
        - Errors: ${errorCount}
        - Total active borrows checked: ${activeBorrows.length}
      `);

    } catch (error) {
      console.error('Error in notification scheduler:', error.message);
    }
  }

  /**
   * Manually trigger notification check (for testing)
   */
  async triggerManualCheck() {
    console.log('Manual notification check triggered');
    await this.checkAndSendNotifications();
  }
}

// Export singleton instance
module.exports = new EmailScheduler();
