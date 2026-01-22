import express from 'express';
import {
  borrowBook,
  returnBook,
  getMyBorrows,
  getAllBorrows,
  payFine,
  getBorrowStats,
} from '../controllers/borrowController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// User routes
router.post('/', protect, borrowBook);
router.put('/:id/return', protect, returnBook);
router.get('/my-borrows', protect, getMyBorrows);
router.put('/:id/pay-fine', protect, payFine);

// Admin routes
router.get('/', protect, admin, getAllBorrows);
router.get('/stats/overview', protect, admin, getBorrowStats);

export default router;
