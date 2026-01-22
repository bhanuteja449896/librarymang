import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Book from '../../models/Book.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Book.deleteMany({});
});

describe('Book Model Test', () => {
  const validBookData = {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '978-0-7432-7356-5',
    genre: 'Fiction',
    publishedYear: 1925,
    totalCopies: 5,
    availableCopies: 5,
  };

  it('should create a book successfully', async () => {
    const book = await Book.create(validBookData);

    expect(book._id).toBeDefined();
    expect(book.title).toBe(validBookData.title);
    expect(book.author).toBe(validBookData.author);
    expect(book.isbn).toBe(validBookData.isbn);
    expect(book.genre).toBe(validBookData.genre);
    expect(book.totalCopies).toBe(validBookData.totalCopies);
    expect(book.availableCopies).toBe(validBookData.availableCopies);
  });

  it('should fail to create book without required fields', async () => {
    const bookWithoutTitle = {
      author: 'F. Scott Fitzgerald',
      isbn: '978-0-7432-7356-5',
      genre: 'Fiction',
    };

    let err;
    try {
      await Book.create(bookWithoutTitle);
    } catch (error) {
      err = error;
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.title).toBeDefined();
  });

  it('should fail to create duplicate ISBN', async () => {
    await Book.create(validBookData);

    let err;
    try {
      await Book.create(validBookData);
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
  });

  it('should set default values correctly', async () => {
    const bookMinimal = {
      title: 'Test Book',
      author: 'Test Author',
      isbn: '978-1-2345-6789-0',
      genre: 'Test',
    };

    const book = await Book.create(bookMinimal);

    expect(book.totalCopies).toBe(1);
    expect(book.availableCopies).toBe(1);
    expect(book.coverImage).toBe('default-book-cover.jpg');
  });

  it('should validate published year range', async () => {
    const futureBook = {
      ...validBookData,
      isbn: '978-1-2345-6789-1',
      publishedYear: 2030,
    };

    let err;
    try {
      await Book.create(futureBook);
    } catch (error) {
      err = error;
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
  });

  it('should trim whitespace from string fields', async () => {
    const bookWithSpaces = {
      ...validBookData,
      isbn: '978-1-2345-6789-2',
      title: '  Test Book  ',
      author: '  Test Author  ',
    };

    const book = await Book.create(bookWithSpaces);

    expect(book.title).toBe('Test Book');
    expect(book.author).toBe('Test Author');
  });

  it('should validate minimum total copies', async () => {
    const bookWithZeroCopies = {
      ...validBookData,
      isbn: '978-1-2345-6789-3',
      totalCopies: 0,
    };

    let err;
    try {
      await Book.create(bookWithZeroCopies);
    } catch (error) {
      err = error;
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
  });

  it('should allow negative available copies validation', async () => {
    const bookWithNegativeAvailable = {
      ...validBookData,
      isbn: '978-1-2345-6789-4',
      availableCopies: -1,
    };

    let err;
    try {
      await Book.create(bookWithNegativeAvailable);
    } catch (error) {
      err = error;
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
  });
});
