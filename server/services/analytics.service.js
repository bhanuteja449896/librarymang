/**
 * Analytics Service
 * Provides statistical data and metrics for the library management system
 */

const Book = require('../models/Book');
const Borrow = require('../models/Borrow');
const User = require('../models/User');

class AnalyticsService {
  /**
   * Get dashboard statistics
   * @returns {Object} Dashboard metrics
   */
  async getDashboardStats() {
    try {
      const [
        totalBooks,
        totalUsers,
        activeBorrows,
        overdueBorrows,
        totalBorrows,
        availableBooks,
      ] = await Promise.all([
        Book.countDocuments(),
        User.countDocuments({ role: 'user' }),
        Borrow.countDocuments({ status: 'borrowed' }),
        Borrow.countDocuments({ status: 'overdue' }),
        Borrow.countDocuments(),
        Book.aggregate([
          {
            $group: {
              _id: null,
              total: { $sum: '$availableCopies' },
            },
          },
        ]),
      ]);

      const returnRate = totalBorrows > 0
        ? ((totalBorrows - activeBorrows - overdueBorrows) / totalBorrows * 100).toFixed(2)
        : 0;

      return {
        totalBooks,
        totalUsers,
        activeBorrows,
        overdueBorrows,
        totalBorrows,
        availableBooks: availableBooks[0]?.total || 0,
        returnRate: parseFloat(returnRate),
      };
    } catch (error) {
      throw new Error(`Failed to get dashboard stats: ${error.message}`);
    }
  }

  /**
   * Get popular books based on borrow count
   * @param {Number} limit - Number of books to return
   * @returns {Array} Popular books
   */
  async getPopularBooks(limit = 10) {
    try {
      const popularBooks = await Borrow.aggregate([
        {
          $group: {
            _id: '$book',
            borrowCount: { $sum: 1 },
            currentlyBorrowed: {
              $sum: {
                $cond: [{ $eq: ['$status', 'borrowed'] }, 1, 0],
              },
            },
          },
        },
        { $sort: { borrowCount: -1 } },
        { $limit: limit },
        {
          $lookup: {
            from: 'books',
            localField: '_id',
            foreignField: '_id',
            as: 'bookDetails',
          },
        },
        { $unwind: '$bookDetails' },
        {
          $project: {
            _id: '$bookDetails._id',
            title: '$bookDetails.title',
            author: '$bookDetails.author',
            isbn: '$bookDetails.isbn',
            genre: '$bookDetails.genre',
            borrowCount: 1,
            currentlyBorrowed: 1,
            availableCopies: '$bookDetails.availableCopies',
          },
        },
      ]);

      return popularBooks;
    } catch (error) {
      throw new Error(`Failed to get popular books: ${error.message}`);
    }
  }

  /**
   * Get user activity statistics
   * @param {String} userId - User ID (optional)
   * @returns {Object} User activity stats
   */
  async getUserActivity(userId = null) {
    try {
      const matchStage = userId ? { user: require('mongoose').Types.ObjectId(userId) } : {};

      const stats = await Borrow.aggregate([
        { $match: matchStage },
        {
          $facet: {
            borrowStats: [
              {
                $group: {
                  _id: '$status',
                  count: { $sum: 1 },
                },
              },
            ],
            userTopBorrowers: [
              {
                $group: {
                  _id: '$user',
                  totalBorrows: { $sum: 1 },
                  activeBorrows: {
                    $sum: {
                      $cond: [{ $eq: ['$status', 'borrowed'] }, 1, 0],
                    },
                  },
                },
              },
              { $sort: { totalBorrows: -1 } },
              { $limit: 10 },
              {
                $lookup: {
                  from: 'users',
                  localField: '_id',
                  foreignField: '_id',
                  as: 'userDetails',
                },
              },
              { $unwind: '$userDetails' },
              {
                $project: {
                  _id: '$userDetails._id',
                  name: '$userDetails.name',
                  email: '$userDetails.email',
                  totalBorrows: 1,
                  activeBorrows: 1,
                },
              },
            ],
          },
        },
      ]);

      return {
        statusBreakdown: stats[0].borrowStats,
        topBorrowers: stats[0].userTopBorrowers,
      };
    } catch (error) {
      throw new Error(`Failed to get user activity: ${error.message}`);
    }
  }

  /**
   * Get borrowing trends over time
   * @param {Number} days - Number of days to analyze
   * @returns {Array} Daily borrow statistics
   */
  async getBorrowingTrends(days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const trends = await Borrow.aggregate([
        {
          $match: {
            borrowDate: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$borrowDate',
              },
            },
            count: { $sum: 1 },
            returned: {
              $sum: {
                $cond: [{ $eq: ['$status', 'returned'] }, 1, 0],
              },
            },
            overdue: {
              $sum: {
                $cond: [{ $eq: ['$status', 'overdue'] }, 1, 0],
              },
            },
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            date: '$_id',
            totalBorrows: '$count',
            returned: 1,
            overdue: 1,
            active: { $subtract: ['$count', { $add: ['$returned', '$overdue'] }] },
            _id: 0,
          },
        },
      ]);

      return trends;
    } catch (error) {
      throw new Error(`Failed to get borrowing trends: ${error.message}`);
    }
  }

  /**
   * Get genre distribution statistics
   * @returns {Array} Genre statistics
   */
  async getGenreDistribution() {
    try {
      const distribution = await Book.aggregate([
        {
          $group: {
            _id: '$genre',
            count: { $sum: 1 },
            totalCopies: { $sum: '$totalCopies' },
            availableCopies: { $sum: '$availableCopies' },
          },
        },
        {
          $lookup: {
            from: 'borrows',
            let: { genreBooks: '$_id' },
            pipeline: [
              {
                $lookup: {
                  from: 'books',
                  localField: 'book',
                  foreignField: '_id',
                  as: 'bookInfo',
                },
              },
              { $unwind: '$bookInfo' },
              {
                $match: {
                  $expr: { $eq: ['$bookInfo.genre', '$$genreBooks'] },
                },
              },
              {
                $group: {
                  _id: null,
                  borrowCount: { $sum: 1 },
                },
              },
            ],
            as: 'borrowStats',
          },
        },
        {
          $project: {
            genre: '$_id',
            bookCount: '$count',
            totalCopies: 1,
            availableCopies: 1,
            borrowCount: {
              $ifNull: [{ $arrayElemAt: ['$borrowStats.borrowCount', 0] }, 0],
            },
            utilizationRate: {
              $multiply: [
                {
                  $divide: [
                    { $subtract: ['$totalCopies', '$availableCopies'] },
                    '$totalCopies',
                  ],
                },
                100,
              ],
            },
            _id: 0,
          },
        },
        { $sort: { borrowCount: -1 } },
      ]);

      return distribution;
    } catch (error) {
      throw new Error(`Failed to get genre distribution: ${error.message}`);
    }
  }

  /**
   * Get overdue books report
   * @returns {Array} Overdue books with details
   */
  async getOverdueReport() {
    try {
      const now = new Date();
      const overdueBooks = await Borrow.find({
        status: { $in: ['borrowed', 'overdue'] },
        dueDate: { $lt: now },
      })
        .populate('book', 'title author isbn genre')
        .populate('user', 'name email')
        .sort({ dueDate: 1 })
        .lean();

      const finePerDay = parseFloat(process.env.FINE_PER_DAY) || 1;

      return overdueBooks.map((borrow) => {
        const daysOverdue = Math.floor((now - new Date(borrow.dueDate)) / (1000 * 60 * 60 * 24));
        const fineAmount = daysOverdue * finePerDay;

        return {
          borrowId: borrow._id,
          book: {
            id: borrow.book._id,
            title: borrow.book.title,
            author: borrow.book.author,
            isbn: borrow.book.isbn,
            genre: borrow.book.genre,
          },
          user: {
            id: borrow.user._id,
            name: borrow.user.name,
            email: borrow.user.email,
          },
          borrowDate: borrow.borrowDate,
          dueDate: borrow.dueDate,
          daysOverdue,
          fineAmount: fineAmount.toFixed(2),
        };
      });
    } catch (error) {
      throw new Error(`Failed to get overdue report: ${error.message}`);
    }
  }

  /**
   * Get revenue statistics from fines
   * @param {Number} days - Number of days to analyze
   * @returns {Object} Revenue statistics
   */
  async getRevenueStats(days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const returns = await Borrow.find({
        status: 'returned',
        returnDate: { $gte: startDate },
        fine: { $gt: 0 },
      }).lean();

      const totalRevenue = returns.reduce((sum, borrow) => sum + borrow.fine, 0);
      const averageFine = returns.length > 0 ? totalRevenue / returns.length : 0;

      // Group by date
      const dailyRevenue = {};
      returns.forEach((borrow) => {
        const date = new Date(borrow.returnDate).toISOString().split('T')[0];
        dailyRevenue[date] = (dailyRevenue[date] || 0) + borrow.fine;
      });

      return {
        totalRevenue: totalRevenue.toFixed(2),
        averageFine: averageFine.toFixed(2),
        transactionCount: returns.length,
        dailyBreakdown: Object.entries(dailyRevenue).map(([date, amount]) => ({
          date,
          revenue: amount.toFixed(2),
        })),
      };
    } catch (error) {
      throw new Error(`Failed to get revenue stats: ${error.message}`);
    }
  }
}

module.exports = new AnalyticsService();
