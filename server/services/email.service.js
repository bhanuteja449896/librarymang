/**
 * Email Service
 * Handles all email sending operations using nodemailer
 */

const nodemailer = require('nodemailer');
const emailConfig = require('../config/email.config');
const overdueTemplate = require('../templates/email/overdue.template');
const reminderTemplate = require('../templates/email/reminder.template');
const borrowTemplate = require('../templates/email/borrow.template');
const returnTemplate = require('../templates/email/return.template');

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter
   */
  initializeTransporter() {
    try {
      if (!emailConfig.enabled) {
        console.log('Email service is disabled');
        return;
      }

      if (!emailConfig.auth.user || !emailConfig.auth.pass) {
        console.warn('Email credentials not configured. Email service will not work.');
        return;
      }

      this.transporter = nodemailer.createTransport({
        service: emailConfig.service,
        host: emailConfig.host,
        port: emailConfig.port,
        secure: emailConfig.secure,
        auth: emailConfig.auth,
        pool: emailConfig.options.pool,
        maxConnections: emailConfig.options.maxConnections,
        maxMessages: emailConfig.options.maxMessages,
        rateLimit: emailConfig.options.rateLimit,
      });

      this.isConfigured = true;
      console.log('Email service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize email service:', error.message);
      this.isConfigured = false;
    }
  }

  /**
   * Verify email connection
   */
  async verifyConnection() {
    if (!this.isConfigured) {
      throw new Error('Email service is not configured');
    }

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email service verification failed:', error.message);
      return false;
    }
  }

  /**
   * Send email
   * @param {Object} options - Email options
   * @param {string} options.to - Recipient email
   * @param {string} options.subject - Email subject
   * @param {string} options.html - HTML content
   * @param {string} options.text - Plain text content
   */
  async sendEmail({ to, subject, html, text }) {
    if (!this.isConfigured) {
      console.warn('Email service not configured. Email not sent.');
      return { success: false, message: 'Email service not configured' };
    }

    try {
      const mailOptions = {
        from: `${emailConfig.from.name} <${emailConfig.from.address}>`,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      
      return {
        success: true,
        messageId: info.messageId,
        response: info.response,
      };
    } catch (error) {
      console.error('Failed to send email:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send overdue book notification
   * @param {Object} user - User object
   * @param {Object} borrow - Borrow record with book details
   */
  async sendOverdueNotification(user, borrow) {
    if (!emailConfig.notifications.overdueReminder.enabled) {
      return { success: false, message: 'Overdue notifications disabled' };
    }

    const daysOverdue = Math.floor(
      (new Date() - new Date(borrow.dueDate)) / (1000 * 60 * 60 * 24)
    );

    const fineAmount = daysOverdue * (process.env.FINE_PER_DAY || 1);

    const emailContent = overdueTemplate({
      userName: user.name,
      bookTitle: borrow.book.title,
      bookAuthor: borrow.book.author,
      dueDate: new Date(borrow.dueDate).toLocaleDateString(),
      daysOverdue,
      fineAmount: fineAmount.toFixed(2),
      borrowDate: new Date(borrow.borrowDate).toLocaleDateString(),
    });

    return await this.sendEmail({
      to: user.email,
      subject: `Overdue Book: ${borrow.book.title}`,
      html: emailContent,
    });
  }

  /**
   * Send reminder notification (before due date)
   * @param {Object} user - User object
   * @param {Object} borrow - Borrow record with book details
   */
  async sendReminderNotification(user, borrow) {
    if (!emailConfig.notifications.overdueReminder.enabled) {
      return { success: false, message: 'Reminder notifications disabled' };
    }

    const daysUntilDue = Math.ceil(
      (new Date(borrow.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
    );

    const emailContent = reminderTemplate({
      userName: user.name,
      bookTitle: borrow.book.title,
      bookAuthor: borrow.book.author,
      dueDate: new Date(borrow.dueDate).toLocaleDateString(),
      daysUntilDue,
      borrowDate: new Date(borrow.borrowDate).toLocaleDateString(),
    });

    return await this.sendEmail({
      to: user.email,
      subject: `Reminder: ${borrow.book.title} due in ${daysUntilDue} days`,
      html: emailContent,
    });
  }

  /**
   * Send borrow confirmation
   * @param {Object} user - User object
   * @param {Object} borrow - Borrow record with book details
   */
  async sendBorrowConfirmation(user, borrow) {
    if (!emailConfig.notifications.borrowConfirmation.enabled) {
      return { success: false, message: 'Borrow confirmations disabled' };
    }

    const emailContent = borrowTemplate({
      userName: user.name,
      bookTitle: borrow.book.title,
      bookAuthor: borrow.book.author,
      bookIsbn: borrow.book.isbn,
      borrowDate: new Date(borrow.borrowDate).toLocaleDateString(),
      dueDate: new Date(borrow.dueDate).toLocaleDateString(),
    });

    return await this.sendEmail({
      to: user.email,
      subject: `Book Borrowed: ${borrow.book.title}`,
      html: emailContent,
    });
  }

  /**
   * Send return confirmation
   * @param {Object} user - User object
   * @param {Object} borrow - Borrow record with book details
   */
  async sendReturnConfirmation(user, borrow) {
    if (!emailConfig.notifications.returnConfirmation.enabled) {
      return { success: false, message: 'Return confirmations disabled' };
    }

    const wasOverdue = new Date(borrow.returnDate) > new Date(borrow.dueDate);
    const daysOverdue = wasOverdue
      ? Math.floor((new Date(borrow.returnDate) - new Date(borrow.dueDate)) / (1000 * 60 * 60 * 24))
      : 0;
    const fineAmount = daysOverdue * (process.env.FINE_PER_DAY || 1);

    const emailContent = returnTemplate({
      userName: user.name,
      bookTitle: borrow.book.title,
      bookAuthor: borrow.book.author,
      borrowDate: new Date(borrow.borrowDate).toLocaleDateString(),
      returnDate: new Date(borrow.returnDate).toLocaleDateString(),
      dueDate: new Date(borrow.dueDate).toLocaleDateString(),
      wasOverdue,
      daysOverdue,
      fineAmount: fineAmount.toFixed(2),
    });

    return await this.sendEmail({
      to: user.email,
      subject: `Book Returned: ${borrow.book.title}`,
      html: emailContent,
    });
  }
}

// Export singleton instance
module.exports = new EmailService();
