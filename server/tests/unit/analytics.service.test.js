/**
 * Analytics Service Unit Tests
 */

const analyticsService = require('../../services/analytics.service');
const Book = require('../../models/Book');
const Borrow = require('../../models/Borrow');
const User = require('../../models/User');

// Mock the models
jest.mock('../../models/Book');
jest.mock('../../models/Borrow');
jest.mock('../../models/User');

describe('Analytics Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.FINE_PER_DAY = '1';
  });

  describe('getDashboardStats', () => {
    it('should return complete dashboard statistics', async () => {
      Book.countDocuments = jest.fn().mockResolvedValue(100);
      User.countDocuments = jest.fn().mockResolvedValue(50);
      Borrow.countDocuments = jest
        .fn()
        .mockResolvedValueOnce(15) // activeBorrows
        .mockResolvedValueOnce(5) // overdueBorrows
        .mockResolvedValueOnce(200); // totalBorrows
      
      Book.aggregate = jest.fn().mockResolvedValue([{ total: 250 }]);

      const stats = await analyticsService.getDashboardStats();

      expect(stats).toEqual({
        totalBooks: 100,
        totalUsers: 50,
        activeBorrows: 15,
        overdueBorrows: 5,
        totalBorrows: 200,
        availableBooks: 250,
        returnRate: expect.any(Number),
      });

      expect(stats.returnRate).toBe(90.0); // (200 - 15 - 5) / 200 * 100
    });

    it('should handle zero borrows', async () => {
      Book.countDocuments = jest.fn().mockResolvedValue(10);
      User.countDocuments = jest.fn().mockResolvedValue(5);
      Borrow.countDocuments = jest.fn().mockResolvedValue(0);
      Book.aggregate = jest.fn().mockResolvedValue([{ total: 20 }]);

      const stats = await analyticsService.getDashboardStats();

      expect(stats.returnRate).toBe(0);
    });

    it('should handle errors gracefully', async () => {
      Book.countDocuments = jest.fn().mockRejectedValue(new Error('Database error'));

      await expect(analyticsService.getDashboardStats()).rejects.toThrow(
        'Failed to get dashboard stats'
      );
    });
  });

  describe('getPopularBooks', () => {
    it('should return popular books sorted by borrow count', async () => {
      const mockAggregateResult = [
        {
          _id: 'book1',
          title: 'Popular Book 1',
          author: 'Author 1',
          isbn: '978-0-123456-78-9',
          genre: 'Fiction',
          borrowCount: 50,
          currentlyBorrowed: 2,
          availableCopies: 3,
        },
        {
          _id: 'book2',
          title: 'Popular Book 2',
          author: 'Author 2',
          isbn: '978-0-123456-79-0',
          genre: 'Science',
          borrowCount: 45,
          currentlyBorrowed: 1,
          availableCopies: 4,
        },
      ];

      Borrow.aggregate = jest.fn().mockResolvedValue(mockAggregateResult);

      const books = await analyticsService.getPopularBooks(10);

      expect(books).toHaveLength(2);
      expect(books[0].borrowCount).toBeGreaterThan(books[1].borrowCount);
      expect(Borrow.aggregate).toHaveBeenCalled();
    });

    it('should respect the limit parameter', async () => {
      Borrow.aggregate = jest.fn().mockResolvedValue([]);

      await analyticsService.getPopularBooks(5);

      const aggregateCalls = Borrow.aggregate.mock.calls[0][0];
      const limitStage = aggregateCalls.find((stage) => stage.$limit !== undefined);
      
      expect(limitStage.$limit).toBe(5);
    });

    it('should handle errors', async () => {
      Borrow.aggregate = jest.fn().mockRejectedValue(new Error('Aggregation error'));

      await expect(analyticsService.getPopularBooks(10)).rejects.toThrow(
        'Failed to get popular books'
      );
    });
  });

  describe('getUserActivity', () => {
    it('should return user activity statistics', async () => {
      const mockResult = [
        {
          borrowStats: [
            { _id: 'borrowed', count: 10 },
            { _id: 'returned', count: 50 },
            { _id: 'overdue', count: 2 },
          ],
          userTopBorrowers: [
            {
              _id: 'user1',
              name: 'John Doe',
              email: 'john@example.com',
              totalBorrows: 20,
              activeBorrows: 3,
            },
          ],
        },
      ];

      Borrow.aggregate = jest.fn().mockResolvedValue(mockResult);

      const stats = await analyticsService.getUserActivity();

      expect(stats).toHaveProperty('statusBreakdown');
      expect(stats).toHaveProperty('topBorrowers');
      expect(stats.statusBreakdown).toHaveLength(3);
      expect(stats.topBorrowers).toHaveLength(1);
    });
  });

  describe('getBorrowingTrends', () => {
    it('should return daily borrowing trends', async () => {
      const mockTrends = [
        {
          date: '2026-01-15',
          totalBorrows: 10,
          returned: 8,
          overdue: 1,
          active: 1,
        },
        {
          date: '2026-01-16',
          totalBorrows: 12,
          returned: 9,
          overdue: 2,
          active: 1,
        },
      ];

      Borrow.aggregate = jest.fn().mockResolvedValue(mockTrends);

      const trends = await analyticsService.getBorrowingTrends(30);

      expect(trends).toHaveLength(2);
      expect(trends[0]).toHaveProperty('date');
      expect(trends[0]).toHaveProperty('totalBorrows');
      expect(trends[0]).toHaveProperty('returned');
      expect(trends[0]).toHaveProperty('overdue');
    });

    it('should respect the days parameter', async () => {
      Borrow.aggregate = jest.fn().mockResolvedValue([]);

      await analyticsService.getBorrowingTrends(7);

      expect(Borrow.aggregate).toHaveBeenCalled();
    });
  });

  describe('getGenreDistribution', () => {
    it('should return genre statistics', async () => {
      const mockDistribution = [
        {
          genre: 'Fiction',
          bookCount: 50,
          totalCopies: 100,
          availableCopies: 60,
          borrowCount: 250,
          utilizationRate: 40,
        },
        {
          genre: 'Science',
          bookCount: 30,
          totalCopies: 60,
          availableCopies: 40,
          borrowCount: 150,
          utilizationRate: 33.33,
        },
      ];

      Book.aggregate = jest.fn().mockResolvedValue(mockDistribution);

      const distribution = await analyticsService.getGenreDistribution();

      expect(distribution).toHaveLength(2);
      expect(distribution[0]).toHaveProperty('genre');
      expect(distribution[0]).toHaveProperty('bookCount');
      expect(distribution[0]).toHaveProperty('borrowCount');
      expect(distribution[0]).toHaveProperty('utilizationRate');
    });

    it('should sort by borrow count', async () => {
      const mockDistribution = [
        { genre: 'Fiction', borrowCount: 250 },
        { genre: 'Science', borrowCount: 150 },
      ];

      Book.aggregate = jest.fn().mockResolvedValue(mockDistribution);

      const distribution = await analyticsService.getGenreDistribution();

      expect(distribution[0].borrowCount).toBeGreaterThan(distribution[1].borrowCount);
    });
  });

  describe('getOverdueReport', () => {
    it('should return overdue books with fine calculations', async () => {
      const mockBorrows = [
        {
          _id: 'borrow1',
          book: {
            _id: 'book1',
            title: 'Overdue Book',
            author: 'Author',
            isbn: '978-0-123456-78-9',
            genre: 'Fiction',
          },
          user: {
            _id: 'user1',
            name: 'John Doe',
            email: 'john@example.com',
          },
          borrowDate: new Date('2026-01-01'),
          dueDate: new Date('2026-01-10'),
          status: 'borrowed',
        },
      ];

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockBorrows),
      };

      Borrow.find = jest.fn().mockReturnValue(mockQuery);

      const report = await analyticsService.getOverdueReport();

      expect(report).toHaveLength(1);
      expect(report[0]).toHaveProperty('daysOverdue');
      expect(report[0]).toHaveProperty('fineAmount');
      expect(report[0].daysOverdue).toBeGreaterThan(0);
    });

    it('should calculate correct fine amounts', async () => {
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

      const mockBorrows = [
        {
          _id: 'borrow1',
          book: {
            _id: 'book1',
            title: 'Book',
            author: 'Author',
            isbn: '123',
            genre: 'Fiction',
          },
          user: { _id: 'user1', name: 'User', email: 'user@example.com' },
          borrowDate: new Date(),
          dueDate: fiveDaysAgo,
          status: 'overdue',
        },
      ];

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockBorrows),
      };

      Borrow.find = jest.fn().mockReturnValue(mockQuery);
      process.env.FINE_PER_DAY = '2';

      const report = await analyticsService.getOverdueReport();

      expect(report[0].daysOverdue).toBe(5);
      expect(parseFloat(report[0].fineAmount)).toBe(10.0); // 5 days * $2
    });
  });

  describe('getRevenueStats', () => {
    it('should calculate total revenue from fines', async () => {
      const mockReturns = [
        {
          returnDate: new Date('2026-01-15'),
          fine: 5.0,
        },
        {
          returnDate: new Date('2026-01-16'),
          fine: 3.0,
        },
        {
          returnDate: new Date('2026-01-17'),
          fine: 2.0,
        },
      ];

      const mockQuery = {
        lean: jest.fn().mockResolvedValue(mockReturns),
      };

      Borrow.find = jest.fn().mockReturnValue(mockQuery);

      const stats = await analyticsService.getRevenueStats(30);

      expect(stats.totalRevenue).toBe('10.00');
      expect(stats.averageFine).toBe('3.33');
      expect(stats.transactionCount).toBe(3);
      expect(stats.dailyBreakdown).toHaveLength(3);
    });

    it('should handle no revenue', async () => {
      const mockQuery = {
        lean: jest.fn().mockResolvedValue([]),
      };

      Borrow.find = jest.fn().mockReturnValue(mockQuery);

      const stats = await analyticsService.getRevenueStats(30);

      expect(stats.totalRevenue).toBe('0.00');
      expect(stats.averageFine).toBe('0.00');
      expect(stats.transactionCount).toBe(0);
      expect(stats.dailyBreakdown).toHaveLength(0);
    });

    it('should group revenue by date', async () => {
      const mockReturns = [
        { returnDate: new Date('2026-01-15'), fine: 5.0 },
        { returnDate: new Date('2026-01-15'), fine: 3.0 },
        { returnDate: new Date('2026-01-16'), fine: 2.0 },
      ];

      const mockQuery = {
        lean: jest.fn().mockResolvedValue(mockReturns),
      };

      Borrow.find = jest.fn().mockReturnValue(mockQuery);

      const stats = await analyticsService.getRevenueStats(30);

      expect(stats.dailyBreakdown).toHaveLength(2);
      const jan15Revenue = stats.dailyBreakdown.find(d => d.date === '2026-01-15');
      expect(parseFloat(jan15Revenue.revenue)).toBe(8.0); // 5 + 3
    });
  });
});
