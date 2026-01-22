import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../server.js';
import User from '../../models/User.js';
import Book from '../../models/Book.js';

let mongoServer;

beforeAll(async () => {
  // Set required environment variables for tests
  process.env.JWT_SECRET = 'test_jwt_secret_key_for_testing';
  process.env.JWT_EXPIRE = '7d';
  
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
});

describe('Book Routes Integration Tests', () => {
  let adminToken, userToken;

  beforeEach(async () => {
    // Create admin user
    const adminResponse = await request(app).post('/api/auth/register').send({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
    });
    adminToken = adminResponse.body.token;

    // Create regular user
    const userResponse = await request(app).post('/api/auth/register').send({
      name: 'Regular User',
      email: 'user@example.com',
      password: 'password123',
    });
    userToken = userResponse.body.token;
  });

  describe('GET /api/books', () => {
    beforeEach(async () => {
      await Book.create([
        {
          title: 'Book One',
          author: 'Author One',
          isbn: '978-0-1111-1111-1',
          genre: 'Fiction',
          totalCopies: 5,
          availableCopies: 5,
        },
        {
          title: 'Book Two',
          author: 'Author Two',
          isbn: '978-0-2222-2222-2',
          genre: 'Science',
          totalCopies: 3,
          availableCopies: 3,
        },
      ]);
    });

    it('should get all books', async () => {
      const response = await request(app).get('/api/books').expect(200);

      expect(response.body.books).toHaveLength(2);
      expect(response.body.total).toBe(2);
    });

    it('should search books by title', async () => {
      const response = await request(app)
        .get('/api/books?search=Book One')
        .expect(200);

      expect(response.body.books.length).toBeGreaterThanOrEqual(1);
    });

    it('should filter books by genre', async () => {
      const response = await request(app)
        .get('/api/books?genre=Fiction')
        .expect(200);

      expect(response.body.books[0].genre).toBe('Fiction');
    });

    it('should filter books by author', async () => {
      const response = await request(app)
        .get('/api/books?author=Author One')
        .expect(200);

      expect(response.body.books[0].author).toBe('Author One');
    });
  });

  describe('GET /api/books/:id', () => {
    it('should get single book by ID', async () => {
      const book = await Book.create({
        title: 'Test Book',
        author: 'Test Author',
        isbn: '978-0-1111-1111-1',
        genre: 'Fiction',
        totalCopies: 5,
        availableCopies: 5,
      });

      const response = await request(app)
        .get(`/api/books/${book._id}`)
        .expect(200);

      expect(response.body.title).toBe('Test Book');
    });

    it('should return 404 for non-existent book', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/books/${fakeId}`)
        .expect(404);

      expect(response.body.message).toBe('Book not found');
    });
  });

  describe('POST /api/books', () => {
    it('should create book as admin', async () => {
      const bookData = {
        title: 'New Book',
        author: 'New Author',
        isbn: '978-0-1111-1111-1',
        genre: 'Fiction',
        publishedYear: 2020,
        totalCopies: 5,
      };

      const response = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(bookData)
        .expect(201);

      expect(response.body.title).toBe(bookData.title);
      expect(response.body.availableCopies).toBe(bookData.totalCopies);
    });

    it('should fail to create book as regular user', async () => {
      const bookData = {
        title: 'New Book',
        author: 'New Author',
        isbn: '978-0-1111-1111-1',
        genre: 'Fiction',
        totalCopies: 5,
      };

      const response = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${userToken}`)
        .send(bookData)
        .expect(403);

      expect(response.body.message).toBe('Not authorized as admin');
    });

    it('should fail to create book with duplicate ISBN', async () => {
      const bookData = {
        title: 'Book',
        author: 'Author',
        isbn: '978-0-1111-1111-1',
        genre: 'Fiction',
        totalCopies: 5,
      };

      await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(bookData);

      const response = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(bookData)
        .expect(400);

      expect(response.body.message).toBe('Book with this ISBN already exists');
    });
  });

  describe('PUT /api/books/:id', () => {
    it('should update book as admin', async () => {
      const book = await Book.create({
        title: 'Original Title',
        author: 'Original Author',
        isbn: '978-0-1111-1111-1',
        genre: 'Fiction',
        totalCopies: 5,
        availableCopies: 5,
      });

      const response = await request(app)
        .put(`/api/books/${book._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Updated Title' })
        .expect(200);

      expect(response.body.title).toBe('Updated Title');
    });

    it('should update total copies and adjust available copies', async () => {
      const book = await Book.create({
        title: 'Test Book',
        author: 'Test Author',
        isbn: '978-0-1111-1111-1',
        genre: 'Fiction',
        totalCopies: 5,
        availableCopies: 5,
      });

      const response = await request(app)
        .put(`/api/books/${book._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ totalCopies: 10 })
        .expect(200);

      expect(response.body.totalCopies).toBe(10);
      expect(response.body.availableCopies).toBe(10);
    });
  });

  describe('DELETE /api/books/:id', () => {
    it('should delete book as admin', async () => {
      const book = await Book.create({
        title: 'Book to Delete',
        author: 'Author',
        isbn: '978-0-1111-1111-1',
        genre: 'Fiction',
        totalCopies: 5,
        availableCopies: 5,
      });

      const response = await request(app)
        .delete(`/api/books/${book._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.message).toBe('Book removed');

      const deletedBook = await Book.findById(book._id);
      expect(deletedBook).toBeNull();
    });
  });
});
