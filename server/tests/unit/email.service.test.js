/**
 * Email Service Unit Tests
 */

const emailService = require('../../services/email.service');
const emailConfig = require('../../config/email.config');

// Mock nodemailer
jest.mock('nodemailer');
const nodemailer = require('nodemailer');

describe('Email Service', () => {
  let mockTransporter;

  beforeEach(() => {
    // Setup mock transporter
    mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({
        messageId: 'test-message-id',
        response: '250 Message accepted',
      }),
      verify: jest.fn().mockResolvedValue(true),
    };

    nodemailer.createTransport = jest.fn().mockReturnValue(mockTransporter);
    
    // Reset email service configuration
    emailService.isConfigured = true;
    emailService.transporter = mockTransporter;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendEmail', () => {
    it('should send email successfully with valid options', async () => {
      const emailOptions = {
        to: 'user@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>',
      };

      const result = await emailService.sendEmail(emailOptions);

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('test-message-id');
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: 'Test Email',
          html: '<p>Test content</p>',
        })
      );
    });

    it('should handle email sending errors', async () => {
      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP error'));

      const result = await emailService.sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('SMTP error');
    });

    it('should not send email when service is not configured', async () => {
      emailService.isConfigured = false;

      const result = await emailService.sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Email service not configured');
      expect(mockTransporter.sendMail).not.toHaveBeenCalled();
    });

    it('should include text fallback when html is provided', async () => {
      await emailService.sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>Test content</p>',
      });

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.any(String),
        })
      );
    });
  });

  describe('verifyConnection', () => {
    it('should verify connection successfully', async () => {
      const result = await emailService.verifyConnection();
      
      expect(result).toBe(true);
      expect(mockTransporter.verify).toHaveBeenCalled();
    });

    it('should handle verification errors', async () => {
      mockTransporter.verify.mockRejectedValue(new Error('Connection failed'));

      const result = await emailService.verifyConnection();
      
      expect(result).toBe(false);
    });

    it('should throw error when service is not configured', async () => {
      emailService.isConfigured = false;

      await expect(emailService.verifyConnection()).rejects.toThrow('Email service is not configured');
    });
  });

  describe('sendOverdueNotification', () => {
    const mockUser = {
      name: 'John Doe',
      email: 'john@example.com',
    };

    const mockBorrow = {
      book: {
        title: 'Test Book',
        author: 'Test Author',
      },
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      borrowDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
    };

    beforeEach(() => {
      process.env.FINE_PER_DAY = '1';
    });

    it('should send overdue notification with correct fine calculation', async () => {
      const result = await emailService.sendOverdueNotification(mockUser, mockBorrow);

      expect(result.success).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'john@example.com',
          subject: expect.stringContaining('Overdue'),
        })
      );
    });

    it('should calculate fine correctly based on days overdue', async () => {
      process.env.FINE_PER_DAY = '2';
      
      await emailService.sendOverdueNotification(mockUser, mockBorrow);

      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('10.00'); // 5 days * $2
    });

    it('should not send when overdue notifications are disabled', async () => {
      const originalEnabled = emailConfig.notifications.overdueReminder.enabled;
      emailConfig.notifications.overdueReminder.enabled = false;

      const result = await emailService.sendOverdueNotification(mockUser, mockBorrow);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Overdue notifications disabled');
      expect(mockTransporter.sendMail).not.toHaveBeenCalled();

      emailConfig.notifications.overdueReminder.enabled = originalEnabled;
    });
  });

  describe('sendReminderNotification', () => {
    const mockUser = {
      name: 'Jane Doe',
      email: 'jane@example.com',
    };

    const mockBorrow = {
      book: {
        title: 'Upcoming Due Book',
        author: 'Author Name',
      },
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      borrowDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    };

    it('should send reminder notification', async () => {
      const result = await emailService.sendReminderNotification(mockUser, mockBorrow);

      expect(result.success).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'jane@example.com',
          subject: expect.stringContaining('Reminder'),
        })
      );
    });

    it('should include correct days until due', async () => {
      await emailService.sendReminderNotification(mockUser, mockBorrow);

      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('2'); // 2 days until due
    });
  });

  describe('sendBorrowConfirmation', () => {
    const mockUser = {
      name: 'Bob Smith',
      email: 'bob@example.com',
    };

    const mockBorrow = {
      book: {
        title: 'New Book',
        author: 'New Author',
        isbn: '978-0-123456-78-9',
      },
      borrowDate: new Date(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    };

    it('should send borrow confirmation', async () => {
      const result = await emailService.sendBorrowConfirmation(mockUser, mockBorrow);

      expect(result.success).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'bob@example.com',
          subject: expect.stringContaining('Book Borrowed'),
        })
      );
    });

    it('should not send when borrow confirmations are disabled', async () => {
      const originalEnabled = emailConfig.notifications.borrowConfirmation.enabled;
      emailConfig.notifications.borrowConfirmation.enabled = false;

      const result = await emailService.sendBorrowConfirmation(mockUser, mockBorrow);

      expect(result.success).toBe(false);
      expect(mockTransporter.sendMail).not.toHaveBeenCalled();

      emailConfig.notifications.borrowConfirmation.enabled = originalEnabled;
    });
  });

  describe('sendReturnConfirmation', () => {
    const mockUser = {
      name: 'Alice Johnson',
      email: 'alice@example.com',
    };

    it('should send return confirmation for on-time return', async () => {
      const mockBorrow = {
        book: {
          title: 'Returned Book',
          author: 'Author',
        },
        borrowDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        returnDate: new Date(),
      };

      const result = await emailService.sendReturnConfirmation(mockUser, mockBorrow);

      expect(result.success).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'alice@example.com',
          subject: expect.stringContaining('Book Returned'),
        })
      );
    });

    it('should include fine in confirmation for overdue return', async () => {
      const mockBorrow = {
        book: {
          title: 'Overdue Book',
          author: 'Author',
        },
        borrowDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        returnDate: new Date(),
      };

      process.env.FINE_PER_DAY = '1';

      await emailService.sendReturnConfirmation(mockUser, mockBorrow);

      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('3.00'); // 3 days * $1
    });
  });
});
