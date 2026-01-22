import Borrow from '../models/Borrow.js';
import Book from '../models/Book.js';
import User from '../models/User.js';
import emailService from '../services/email.service.js';

/**
 * @desc    Borrow a book
 * @route   POST /api/borrows
 * @access  Private
 */
export const borrowBook = async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.user._id;

    // Check if book exists and is available
    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({ message: 'Book is not available' });
    }

    // Check if user already borrowed this book
    const existingBorrow = await Borrow.findOne({
      user: userId,
      book: bookId,
      status: { $in: ['borrowed', 'overdue'] },
    });

    if (existingBorrow) {
      return res.status(400).json({ message: 'You already borrowed this book' });
    }

    // Calculate due date
    const borrowDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (parseInt(process.env.MAX_BORROW_DAYS) || 14));

    // Create borrow record
    const borrow = await Borrow.create({
      user: userId,
      book: bookId,
      borrowDate,
      dueDate,
    });

    // Update book available copies
    book.availableCopies -= 1;
    await book.save();

    // Update user borrowed books
    await User.findByIdAndUpdate(userId, {
      $push: { borrowedBooks: borrow._id },
    });

    const populatedBorrow = await Borrow.findById(borrow._id)
      .populate('book', 'title author isbn')
      .populate('user', 'name email');

    // Send borrow confirmation email
    try {
      await emailService.sendBorrowConfirmation(populatedBorrow.user, populatedBorrow);
    } catch (emailError) {
      console.error('Failed to send borrow confirmation email:', emailError.message);
      // Don't fail the request if email fails
    }

    res.status(201).json(populatedBorrow);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Return a book
 * @route   PUT /api/borrows/:id/return
 * @access  Private
 */
export const returnBook = async (req, res) => {
  try {
    const borrow = await Borrow.findById(req.params.id);

    if (!borrow) {
      return res.status(404).json({ message: 'Borrow record not found' });
    }

    // Check if user owns this borrow
    if (borrow.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (borrow.status === 'returned') {
      return res.status(400).json({ message: 'Book already returned' });
    }

    // Update borrow record
    borrow.returnDate = new Date();
    borrow.status = 'returned';
    borrow.calculateFine();
    await borrow.save();

    // Update book available copies
    const book = await Book.findById(borrow.book);
    if (book) {
      book.availableCopies += 1;
      await book.save();
    }

    // Remove from user borrowed books
    await User.findByIdAndUpdate(borrow.user, {
      $pull: { borrowedBooks: borrow._id },
    });

    const populatedBorrow = await Borrow.findById(borrow._id)
      .populate('book', 'title author isbn')
      .populate('user', 'name email');

    // Send return confirmation email
    try {
      await emailService.sendReturnConfirmation(populatedBorrow.user, populatedBorrow);
    } catch (emailError) {
      console.error('Failed to send return confirmation email:', emailError.message);
      // Don't fail the request if email fails
    }

    res.json(populatedBorrow);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get user's borrow history
 * @route   GET /api/borrows/my-borrows
 * @access  Private
 */
export const getMyBorrows = async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = { user: req.user._id };
    
    if (status) {
      query.status = status;
    }

    const borrows = await Borrow.find(query)
      .populate('book', 'title author isbn coverImage')
      .sort({ createdAt: -1 });

    // Update overdue status
    for (let borrow of borrows) {
      if (borrow.status === 'borrowed' && new Date() > borrow.dueDate) {
        borrow.calculateFine();
        await borrow.save();
      }
    }

    res.json(borrows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all borrows (admin)
 * @route   GET /api/borrows
 * @access  Private/Admin
 */
export const getAllBorrows = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let query = {};
    if (status) {
      query.status = status;
    }

    const borrows = await Borrow.find(query)
      .populate('book', 'title author isbn')
      .populate('user', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Borrow.countDocuments(query);

    res.json({
      borrows,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Pay fine
 * @route   PUT /api/borrows/:id/pay-fine
 * @access  Private
 */
export const payFine = async (req, res) => {
  try {
    const borrow = await Borrow.findById(req.params.id);

    if (!borrow) {
      return res.status(404).json({ message: 'Borrow record not found' });
    }

    // Check if user owns this borrow
    if (borrow.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (borrow.fine === 0) {
      return res.status(400).json({ message: 'No fine to pay' });
    }

    if (borrow.isPaid) {
      return res.status(400).json({ message: 'Fine already paid' });
    }

    borrow.isPaid = true;
    await borrow.save();

    res.json({ message: 'Fine paid successfully', borrow });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get borrow statistics
 * @route   GET /api/borrows/stats/overview
 * @access  Private/Admin
 */
export const getBorrowStats = async (req, res) => {
  try {
    const totalBorrows = await Borrow.countDocuments();
    const activeBorrows = await Borrow.countDocuments({ status: { $in: ['borrowed', 'overdue'] } });
    const overdueBorrows = await Borrow.countDocuments({ status: 'overdue' });
    
    const totalFines = await Borrow.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$fine' },
          unpaid: {
            $sum: {
              $cond: [{ $eq: ['$isPaid', false] }, '$fine', 0]
            }
          }
        }
      }
    ]);

    res.json({
      totalBorrows,
      activeBorrows,
      overdueBorrows,
      returnedBorrows: totalBorrows - activeBorrows,
      totalFines: totalFines[0]?.total || 0,
      unpaidFines: totalFines[0]?.unpaid || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
