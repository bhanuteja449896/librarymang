/**
 * Email Scheduler Unit Tests
 */

const emailScheduler = require('../../services/email.scheduler');
const emailService = require('../../services/email.service');
const emailConfig = require('../../config/email.config');
const Borrow = require('../../models/Borrow');

jest.mock('../../services/email.service');
jest.mock('../../models/Borrow');
jest.mock('node-cron');

describe('Email Scheduler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    emailScheduler.isRunning = false;
    emailScheduler.jobs = [];
  });

  describe('start', () => {
    it('should start the scheduler successfully', () => {
      const originalEnabled = emailConfig.enabled;
      emailConfig.enabled = true;

      emailScheduler.start();

      expect(emailScheduler.isRunning).toBe(true);

      emailConfig.enabled = originalEnabled;
    });

    it('should not start if already running', () => {
      emailScheduler.isRunning = true;

      const consoleSpy = jest.spyOn(console, 'log');
      emailScheduler.start();

      expect(consoleSpy).toHaveBeenCalledWith('Email scheduler is already running');
      consoleSpy.mockRestore();
    });

    it('should not start if email service is disabled', () => {
      const originalEnabled = emailConfig.enabled;
      emailConfig.enabled = false;

      const consoleSpy = jest.spyOn(console, 'log');
      emailScheduler.start();

      expect(consoleSpy).toHaveBeenCalledWith('Email service disabled - scheduler not started');
      expect(emailScheduler.isRunning).toBe(false);

      emailConfig.enabled = originalEnabled;
      consoleSpy.mockRestore();
    });
  });

  describe('stop', () => {
    it('should stop all scheduled jobs', () => {
      const mockJob = { stop: jest.fn() };
      emailScheduler.jobs = [mockJob];
      emailScheduler.isRunning = true;

      emailScheduler.stop();

      expect(mockJob.stop).toHaveBeenCalled();
      expect(emailScheduler.jobs).toEqual([]);
      expect(emailScheduler.isRunning).toBe(false);
    });
  });

  describe('checkAndSendNotifications', () => {
    beforeEach(() => {
      process.env.FINE_PER_DAY = '1';
    });

    it('should send overdue notifications for overdue books', async () => {
      const pastDueDate = new Date();
      pastDueDate.setDate(pastDueDate.getDate() - 5); // 5 days ago

      const mockBorrow = {
        _id: 'borrow123',
        book: {
          title: 'Overdue Book',
          author: 'Test Author',
        },
        user: {
          email: 'user@example.com',
          name: 'Test User',
        },
        dueDate: pastDueDate,
        status: 'borrowed',
      };

      Borrow.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue([mockBorrow]),
        }),
      });

      emailService.sendOverdueNotification = jest.fn().mockResolvedValue({ success: true });

      await emailScheduler.checkAndSendNotifications();

      expect(emailService.sendOverdueNotification).toHaveBeenCalledWith(
        mockBorrow.user,
        mockBorrow
      );
    });

    it('should send reminder notifications for books due soon', async () => {
      const upcomingDueDate = new Date();
      upcomingDueDate.setDate(upcomingDueDate.getDate() + 2); // 2 days from now

      const mockBorrow = {
        _id: 'borrow456',
        book: {
          title: 'Soon Due Book',
          author: 'Test Author',
        },
        user: {
          email: 'user@example.com',
          name: 'Test User',
        },
        dueDate: upcomingDueDate,
        status: 'borrowed',
      };

      Borrow.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue([mockBorrow]),
        }),
      });

      emailService.sendReminderNotification = jest.fn().mockResolvedValue({ success: true });

      await emailScheduler.checkAndSendNotifications();

      expect(emailService.sendReminderNotification).toHaveBeenCalledWith(
        mockBorrow.user,
        mockBorrow
      );
    });

    it('should not send notifications for books not yet due', async () => {
      const futureDueDate = new Date();
      futureDueDate.setDate(futureDueDate.getDate() + 10); // 10 days from now

      const mockBorrow = {
        _id: 'borrow789',
        book: {
          title: 'Future Due Book',
          author: 'Test Author',
        },
        user: {
          email: 'user@example.com',
          name: 'Test User',
        },
        dueDate: futureDueDate,
        status: 'borrowed',
      };

      Borrow.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue([mockBorrow]),
        }),
      });

      emailService.sendOverdueNotification = jest.fn();
      emailService.sendReminderNotification = jest.fn();

      await emailScheduler.checkAndSendNotifications();

      expect(emailService.sendOverdueNotification).not.toHaveBeenCalled();
      expect(emailService.sendReminderNotification).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully for individual borrows', async () => {
      const pastDueDate = new Date();
      pastDueDate.setDate(pastDueDate.getDate() - 5);

      const mockBorrow = {
        _id: 'borrow123',
        book: {
          title: 'Overdue Book',
          author: 'Test Author',
        },
        user: {
          email: 'user@example.com',
          name: 'Test User',
        },
        dueDate: pastDueDate,
        status: 'borrowed',
      };

      Borrow.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue([mockBorrow]),
        }),
      });

      emailService.sendOverdueNotification = jest.fn().mockRejectedValue(
        new Error('Email send failed')
      );

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await emailScheduler.checkAndSendNotifications();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error sending notification'),
        expect.any(String)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle empty borrow list', async () => {
      Borrow.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue([]),
        }),
      });

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      await emailScheduler.checkAndSendNotifications();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Notification check complete')
      );

      consoleLogSpy.mockRestore();
    });
  });

  describe('triggerManualCheck', () => {
    it('should manually trigger notification check', async () => {
      Borrow.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue([]),
        }),
      });

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      await emailScheduler.triggerManualCheck();

      expect(consoleLogSpy).toHaveBeenCalledWith('Manual notification check triggered');

      consoleLogSpy.mockRestore();
    });
  });
});
