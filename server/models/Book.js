import mongoose from 'mongoose';
import { validateISBN } from '../utils/isbnValidator.js';

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a book title'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Please provide an author name'],
      trim: true,
    },
    isbn: {
      type: String,
      required: [true, 'Please provide an ISBN'],
      unique: true,
      trim: true,
      validate: {
        validator: function(value) {
          const result = validateISBN(value);
          return result.isValid;
        },
        message: props => {
          const result = validateISBN(props.value);
          return result.message;
        }
      }
    },
    genre: {
      type: String,
      required: [true, 'Please provide a genre'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    publishedYear: {
      type: Number,
      min: [1000, 'Published year must be valid'],
      max: [new Date().getFullYear(), 'Published year cannot be in the future'],
    },
    totalCopies: {
      type: Number,
      required: [true, 'Please provide total copies'],
      min: [1, 'Total copies must be at least 1'],
      default: 1,
    },
    availableCopies: {
      type: Number,
      required: true,
      min: [0, 'Available copies cannot be negative'],
      default: 1,
    },
    coverImage: {
      type: String,
      default: 'default-book-cover.jpg',
    },
  },
  {
    timestamps: true,
  }
);

// Index for search functionality
bookSchema.index({ title: 'text', author: 'text', genre: 'text' });

const Book = mongoose.model('Book', bookSchema);

export default Book;
