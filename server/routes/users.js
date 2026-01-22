import express from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// All routes are admin only
router.get('/', protect, admin, getUsers);
router.get('/stats/overview', protect, admin, getUserStats);
router.get('/:id', protect, admin, getUserById);
router.put('/:id', protect, admin, updateUser);
router.delete('/:id', protect, admin, deleteUser);

export default router;
