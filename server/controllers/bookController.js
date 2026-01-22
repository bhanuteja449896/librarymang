import Book from '../models/Book.js';

/**
 * @desc    Get all books with search and filter
 * @route   GET /api/books
 * @access  Public
 */
export const getBooks = async (req, res) => {
  try {
    const { search, genre, author, page = 1, limit = 10 } = req.query;

    let query = {};

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Filter by genre
    if (genre) {
      query.genre = { $regex: genre, $options: 'i' };
    }

    // Filter by author
    if (author) {
      query.author = { $regex: author, $options: 'i' };
    }

    const books = await Book.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Book.countDocuments(query);

    res.json({
      books,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get single book by ID
 * @route   GET /api/books/:id
 * @access  Public
 */
export const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (book) {
      res.json(book);
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Create a new book
 * @route   POST /api/books
 * @access  Private/Admin
 */
export const createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      isbn,
      genre,
      description,
      publishedYear,
      totalCopies,
      coverImage,
    } = req.body;

    // Check if book with ISBN already exists
    const bookExists = await Book.findOne({ isbn });

    if (bookExists) {
      return res.status(400).json({ message: 'Book with this ISBN already exists' });
    }

    const book = await Book.create({
      title,
      author,
      isbn,
      genre,
      description,
      publishedYear,
      totalCopies,
      availableCopies: totalCopies,
      coverImage,
    });

    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update a book
 * @route   PUT /api/books/:id
 * @access  Private/Admin
 */
export const updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (book) {
      book.title = req.body.title || book.title;
      book.author = req.body.author || book.author;
      book.isbn = req.body.isbn || book.isbn;
      book.genre = req.body.genre || book.genre;
      book.description = req.body.description || book.description;
      book.publishedYear = req.body.publishedYear || book.publishedYear;
      book.coverImage = req.body.coverImage || book.coverImage;

      if (req.body.totalCopies !== undefined) {
        const diff = req.body.totalCopies - book.totalCopies;
        book.totalCopies = req.body.totalCopies;
        book.availableCopies = Math.max(0, book.availableCopies + diff);
      }

      const updatedBook = await book.save();
      res.json(updatedBook);
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete a book
 * @route   DELETE /api/books/:id
 * @access  Private/Admin
 */
export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (book) {
      await book.deleteOne();
      res.json({ message: 'Book removed' });
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get books statistics
 * @route   GET /api/books/stats/overview
 * @access  Private/Admin
 */
export const getBookStats = async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const totalCopies = await Book.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$totalCopies' },
          available: { $sum: '$availableCopies' },
        },
      },
    ]);

    const genreStats = await Book.aggregate([
      {
        $group: {
          _id: '$genre',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({
      totalBooks,
      totalCopies: totalCopies[0]?.total || 0,
      availableCopies: totalCopies[0]?.available || 0,
      borrowedCopies: (totalCopies[0]?.total || 0) - (totalCopies[0]?.available || 0),
      genreStats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
