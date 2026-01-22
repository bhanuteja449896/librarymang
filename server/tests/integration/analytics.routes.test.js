/**
 * Analytics Routes Integration Tests
 */

const request = require('supertest');
const app = require('../../server');
const User = require('../../models/User');
const Book = require('../../models/Book');
const Borrow = require('../../models/Borrow');
const { generateToken } = require('../../utils/jwt');

describe('Analytics Routes', () => {
  let adminToken;
  let userToken;
  let adminUser;
  let normalUser;

  beforeAll(async () => {
    // Set JWT_SECRET for tests
    process.env.JWT_SECRET = 'test_jwt_secret_key_for_testing';

    // Create admin user
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin',
    });

    // Create normal user
    normalUser = await User.create({
      name: 'Normal User',
      email: 'user@test.com',
      password: 'password123',
      role: 'user',
    });

    adminToken = generateToken(adminUser._id);
    userToken = generateToken(normalUser._id);

    // Create some test data
    const book1 = await Book.create({
      title: 'Test Book 1',
      author: 'Author 1',
      isbn: '978-0-123456-78-9',
      genre: 'Fiction',
      publishedYear: 2020,
      totalCopies: 5,
      availableCopies: 3,
    });

    const book2 = await Book.create({
      title: 'Test Book 2',
      author: 'Author 2',
      isbn: '978-0-123456-79-0',
      genre: 'Science',
      publishedYear: 2021,
      totalCopies: 3,
      availableCopies: 2,
    });

    // Create borrow records
    await Borrow.create({
      user: normalUser._id,
      book: book1._id,
      borrowDate: new Date(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: 'borrowed',
    });

    await Borrow.create({
      user: normalUser._id,
      book: book2._id,
      borrowDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      returnDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: 'returned',
      fine: 5.0,
    });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Book.deleteMany({});
    await Borrow.deleteMany({});
  });

  describe('GET /api/analytics/dashboard', () => {
    it('should return dashboard statistics for admin', async () => {
      const res = await request(app)
        .get('/api/analytics/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('totalBooks');
      expect(res.body).toHaveProperty('totalUsers');
      expect(res.body).toHaveProperty('activeBorrows');
      expect(res.body).toHaveProperty('overdueBorrows');
      expect(res.body).toHaveProperty('returnRate');
    });

    it('should deny access to non-admin users', async () => {
      const res = await request(app)
        .get('/api/analytics/dashboard')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
    });

    it('should deny access without authentication', async () => {
      const res = await request(app).get('/api/analytics/dashboard');

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/analytics/popular-books', () => {
    it('should return popular books list', async () => {
      const res = await request(app)
        .get('/api/analytics/popular-books')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should respect the limit parameter', async () => {
      const res = await request(app)
        .get('/api/analytics/popular-books?limit=5')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeLessThanOrEqual(5);
    });

    it('should reject invalid limit values', async () => {
      const res = await request(app)
        .get('/api/analytics/popular-books?limit=100')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('GET /api/analytics/user-activity', () => {
    it('should return user activity statistics', async () => {
      const res = await request(app)
        .get('/api/analytics/user-activity')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('statusBreakdown');
      expect(res.body).toHaveProperty('topBorrowers');
    });

    it('should filter by userId when provided', async () => {
      const res = await request(app)
        .get(`/api/analytics/user-activity?userId=${normalUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
    });
  });

  describe('GET /api/analytics/borrowing-trends', () => {
    it('should return borrowing trends', async () => {
      const res = await request(app)
        .get('/api/analytics/borrowing-trends')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should respect the days parameter', async () => {
      const res = await request(app)
        .get('/api/analytics/borrowing-trends?days=7')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
    });

    it('should reject invalid days values', async () => {
      const res = await request(app)
        .get('/api/analytics/borrowing-trends?days=500')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/analytics/genre-distribution', () => {
    it('should return genre distribution', async () => {
      const res = await request(app)
        .get('/api/analytics/genre-distribution')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/analytics/overdue-report', () => {
    it('should return overdue books report', async () => {
      const res = await request(app)
        .get('/api/analytics/overdue-report')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should include fine calculations', async () => {
      // Create an overdue borrow
      const book = await Book.findOne();
      const pastDue = new Date();
      pastDue.setDate(pastDue.getDate() - 5);

      await Borrow.create({
        user: normalUser._id,
        book: book._id,
        borrowDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        dueDate: pastDue,
        status: 'borrowed',
      });

      const res = await request(app)
        .get('/api/analytics/overdue-report')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty('daysOverdue');
        expect(res.body[0]).toHaveProperty('fineAmount');
      }
    });
  });

  describe('GET /api/analytics/revenue', () => {
    it('should return revenue statistics', async () => {
      const res = await request(app)
        .get('/api/analytics/revenue')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('totalRevenue');
      expect(res.body).toHaveProperty('averageFine');
      expect(res.body).toHaveProperty('transactionCount');
      expect(res.body).toHaveProperty('dailyBreakdown');
    });

    it('should respect the days parameter', async () => {
      const res = await request(app)
        .get('/api/analytics/revenue?days=7')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
    });
  });

  describe('GET /api/analytics/export', () => {
    it('should export complete analytics report', async () => {
      const res = await request(app)
        .get('/api/analytics/export')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('generatedAt');
      expect(res.body).toHaveProperty('dashboard');
      expect(res.body).toHaveProperty('popularBooks');
      expect(res.body).toHaveProperty('trends');
      expect(res.body).toHaveProperty('genreDistribution');
      expect(res.body).toHaveProperty('overdueReport');
      expect(res.body).toHaveProperty('revenue');
    });

    it('should only support JSON format', async () => {
      const res = await request(app)
        .get('/api/analytics/export?format=csv')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(400);
    });
  });
});
