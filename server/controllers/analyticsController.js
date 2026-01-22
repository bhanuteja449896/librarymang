/**
 * Analytics Controller
 * Handles analytics and reporting endpoints
 */

const analyticsService = require('../services/analytics.service');

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/analytics/dashboard
 * @access  Private/Admin
 */
export const getDashboardStats = async (req, res) => {
  try {
    const stats = await analyticsService.getDashboardStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get popular books
 * @route   GET /api/analytics/popular-books
 * @access  Private/Admin
 */
export const getPopularBooks = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    if (limit < 1 || limit > 50) {
      return res.status(400).json({ message: 'Limit must be between 1 and 50' });
    }

    const books = await analyticsService.getPopularBooks(limit);
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get user activity statistics
 * @route   GET /api/analytics/user-activity
 * @access  Private/Admin
 */
export const getUserActivity = async (req, res) => {
  try {
    const userId = req.query.userId || null;
    const stats = await analyticsService.getUserActivity(userId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get borrowing trends
 * @route   GET /api/analytics/borrowing-trends
 * @access  Private/Admin
 */
export const getBorrowingTrends = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    
    if (days < 1 || days > 365) {
      return res.status(400).json({ message: 'Days must be between 1 and 365' });
    }

    const trends = await analyticsService.getBorrowingTrends(days);
    res.json(trends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get genre distribution
 * @route   GET /api/analytics/genre-distribution
 * @access  Private/Admin
 */
export const getGenreDistribution = async (req, res) => {
  try {
    const distribution = await analyticsService.getGenreDistribution();
    res.json(distribution);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get overdue books report
 * @route   GET /api/analytics/overdue-report
 * @access  Private/Admin
 */
export const getOverdueReport = async (req, res) => {
  try {
    const report = await analyticsService.getOverdueReport();
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get revenue statistics
 * @route   GET /api/analytics/revenue
 * @access  Private/Admin
 */
export const getRevenueStats = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    
    if (days < 1 || days > 365) {
      return res.status(400).json({ message: 'Days must be between 1 and 365' });
    }

    const stats = await analyticsService.getRevenueStats(days);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Export analytics report
 * @route   GET /api/analytics/export
 * @access  Private/Admin
 */
export const exportAnalyticsReport = async (req, res) => {
  try {
    const format = req.query.format || 'json';
    
    const [dashboard, popularBooks, trends, distribution, overdueReport, revenue] = await Promise.all([
      analyticsService.getDashboardStats(),
      analyticsService.getPopularBooks(10),
      analyticsService.getBorrowingTrends(30),
      analyticsService.getGenreDistribution(),
      analyticsService.getOverdueReport(),
      analyticsService.getRevenueStats(30),
    ]);

    const report = {
      generatedAt: new Date().toISOString(),
      dashboard,
      popularBooks,
      trends,
      genreDistribution: distribution,
      overdueReport,
      revenue,
    };

    if (format === 'json') {
      res.json(report);
    } else {
      res.status(400).json({ message: 'Unsupported format. Only JSON is supported.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
