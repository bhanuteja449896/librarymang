import express from 'express';
import {
  getDashboardStats,
  getPopularBooks,
  getUserActivity,
  getBorrowingTrends,
  getGenreDistribution,
  getOverdueReport,
  getRevenueStats,
  exportAnalyticsReport,
} from '../controllers/analyticsController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// All analytics routes require authentication and admin role
router.use(protect);
router.use(admin);

// Analytics routes
router.get('/dashboard', getDashboardStats);
router.get('/popular-books', getPopularBooks);
router.get('/user-activity', getUserActivity);
router.get('/borrowing-trends', getBorrowingTrends);
router.get('/genre-distribution', getGenreDistribution);
router.get('/overdue-report', getOverdueReport);
router.get('/revenue', getRevenueStats);
router.get('/export', exportAnalyticsReport);

export default router;
