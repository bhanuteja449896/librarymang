import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../server.js';
import User from '../../models/User.js';
import Book from '../../models/Book.js';
import Borrow from '../../models/Borrow.js';

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
  await User.deleteMany({});
  await Book.deleteMany({});
  await Borrow.deleteMany({});
});

describe('Borrow Routes Integration Tests', () => {
  let userToken, book;

  beforeEach(async () => {
    // Create user
    const userResponse = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'user@example.com',
      password: 'password123',
    });
    userToken = userResponse.body.token;

    // Create book
    book = await Book.create({
      title: 'Test Book',
      author: 'Test Author',
      isbn: '978-0-1111-1111-1',
      genre: 'Fiction',
      totalCopies: 5,
      availableCopies: 5,
    });
  });

  describe('POST /api/borrows', () => {
    it('should borrow a book', async () => {
      const response = await request(app)
        .post('/api/borrows')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ bookId: book._id })
        .expect(201);

      expect(response.body.book._id).toBe(book._id.toString());
      expect(response.body.status).toBe('borrowed');

      // Check book available copies decreased
      const updatedBook = await Book.findById(book._id);
      expect(updatedBook.availableCopies).toBe(4);
    });

    it('should fail to borrow unavailable book', async () => {
      book.availableCopies = 0;
      await book.save();

      const response = await request(app)
        .post('/api/borrows')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ bookId: book._id })
        .expect(400);

      expect(response.body.message).toBe('Book is not available');
    });

    it('should fail to borrow already borrowed book', async () => {
      await request(app)
        .post('/api/borrows')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ bookId: book._id });

      const response = await request(app)
        .post('/api/borrows')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ bookId: book._id })
        .expect(400);

      expect(response.body.message).toBe('You already borrowed this book');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/borrows')
        .send({ bookId: book._id })
        .expect(401);

      expect(response.body.message).toBe('Not authorized, no token');
    });
  });

  describe('GET /api/borrows/my-borrows', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/borrows')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ bookId: book._id });
    });

    it('should get user borrow history', async () => {
      const response = await request(app)
        .get('/api/borrows/my-borrows')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].book.title).toBe('Test Book');
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/borrows/my-borrows?status=borrowed')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].status).toBe('borrowed');
    });
  });

  describe('PUT /api/borrows/:id/return', () => {
    let borrowId;

    beforeEach(async () => {
      const borrowResponse = await request(app)
        .post('/api/borrows')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ bookId: book._id });

      borrowId = borrowResponse.body._id;
    });

    it('should return a book', async () => {
      const response = await request(app)
        .put(`/api/borrows/${borrowId}/return`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.status).toBe('returned');
      expect(response.body.returnDate).toBeDefined();

      // Check book available copies increased
      const updatedBook = await Book.findById(book._id);
      expect(updatedBook.availableCopies).toBe(5);
    });

    it('should calculate fine for overdue return', async () => {
      // Update borrow to be overdue
      const borrow = await Borrow.findById(borrowId);
      borrow.dueDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000); // 5 days ago
      await borrow.save();

      const response = await request(app)
        .put(`/api/borrows/${borrowId}/return`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.fine).toBeGreaterThan(0);
    });

    it('should fail to return already returned book', async () => {
      await request(app)
        .put(`/api/borrows/${borrowId}/return`)
        .set('Authorization', `Bearer ${userToken}`);

      const response = await request(app)
        .put(`/api/borrows/${borrowId}/return`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);

      expect(response.body.message).toBe('Book already returned');
    });
  });

  describe('PUT /api/borrows/:id/pay-fine', () => {
    let borrowId;

    beforeEach(async () => {
      const borrowResponse = await request(app)
        .post('/api/borrows')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ bookId: book._id });

      borrowId = borrowResponse.body._id;

      // Make it overdue and return
      const borrow = await Borrow.findById(borrowId);
      borrow.dueDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
      await borrow.save();

      await request(app)
        .put(`/api/borrows/${borrowId}/return`)
        .set('Authorization', `Bearer ${userToken}`);
    });

    it('should pay fine', async () => {
      const response = await request(app)
        .put(`/api/borrows/${borrowId}/pay-fine`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.borrow.isPaid).toBe(true);
    });

    it('should fail to pay already paid fine', async () => {
      await request(app)
        .put(`/api/borrows/${borrowId}/pay-fine`)
        .set('Authorization', `Bearer ${userToken}`);

      const response = await request(app)
        .put(`/api/borrows/${borrowId}/pay-fine`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);

      expect(response.body.message).toBe('Fine already paid');
    });
  });
});
