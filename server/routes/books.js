import express from 'express';
import {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getBookStats,
} from '../controllers/bookController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getBooks);
router.get('/:id', getBookById);

// Admin routes
router.post('/', protect, admin, createBook);
router.put('/:id', protect, admin, updateBook);
router.delete('/:id', protect, admin, deleteBook);
router.get('/stats/overview', protect, admin, getBookStats);

export default router;
