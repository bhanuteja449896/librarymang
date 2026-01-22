import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Borrow from '../../models/Borrow.js';
import Book from '../../models/Book.js';
import User from '../../models/User.js';

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
  await Borrow.deleteMany({});
  await Book.deleteMany({});
  await User.deleteMany({});
});

describe('Borrow Model Test', () => {
  let user, book;

  beforeEach(async () => {
    user = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    });

    book = await Book.create({
      title: 'Test Book',
      author: 'Test Author',
      isbn: '978-0-7432-7356-5',
      genre: 'Fiction',
      totalCopies: 5,
      availableCopies: 5,
    });
  });

  it('should create a borrow record successfully', async () => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const borrow = await Borrow.create({
      user: user._id,
      book: book._id,
      dueDate,
    });

    expect(borrow._id).toBeDefined();
    expect(borrow.user.toString()).toBe(user._id.toString());
    expect(borrow.book.toString()).toBe(book._id.toString());
    expect(borrow.status).toBe('borrowed');
    expect(borrow.fine).toBe(0);
    expect(borrow.isPaid).toBe(false);
  });

  it('should fail to create borrow without required fields', async () => {
    const borrowWithoutBook = {
      user: user._id,
      dueDate: new Date(),
    };

    let err;
    try {
      await Borrow.create(borrowWithoutBook);
    } catch (error) {
      err = error;
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.book).toBeDefined();
  });

  it('should set default borrowDate', async () => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const borrow = await Borrow.create({
      user: user._id,
      book: book._id,
      dueDate,
    });

    expect(borrow.borrowDate).toBeDefined();
    expect(borrow.borrowDate).toBeInstanceOf(Date);
  });

  it('should calculate fine for overdue return', async () => {
    const borrowDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() - 5); // 5 days overdue

    const returnDate = new Date();

    const borrow = await Borrow.create({
      user: user._id,
      book: book._id,
      borrowDate,
      dueDate,
      returnDate,
    });

    const fine = borrow.calculateFine();

    expect(fine).toBeGreaterThan(0);
    expect(borrow.fine).toBe(fine);
  });

  it('should calculate fine for current overdue books', async () => {
    const borrowDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() - 3); // 3 days overdue

    const borrow = await Borrow.create({
      user: user._id,
      book: book._id,
      borrowDate,
      dueDate,
    });

    const fine = borrow.calculateFine();

    expect(fine).toBeGreaterThan(0);
    expect(borrow.status).toBe('overdue');
  });

  it('should not calculate fine if returned on time', async () => {
    const borrowDate = new Date();
    borrowDate.setDate(borrowDate.getDate() - 5);
    
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 9);

    const returnDate = new Date();

    const borrow = await Borrow.create({
      user: user._id,
      book: book._id,
      borrowDate,
      dueDate,
      returnDate,
    });

    const fine = borrow.calculateFine();

    expect(fine).toBe(0);
  });

  it('should populate user and book references', async () => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const borrow = await Borrow.create({
      user: user._id,
      book: book._id,
      dueDate,
    });

    const populatedBorrow = await Borrow.findById(borrow._id)
      .populate('user')
      .populate('book');

    expect(populatedBorrow.user.name).toBe(user.name);
    expect(populatedBorrow.book.title).toBe(book.title);
  });

  it('should validate fine is not negative', async () => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const borrowWithNegativeFine = {
      user: user._id,
      book: book._id,
      dueDate,
      fine: -10,
    };

    let err;
    try {
      await Borrow.create(borrowWithNegativeFine);
    } catch (error) {
      err = error;
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
  });
});
