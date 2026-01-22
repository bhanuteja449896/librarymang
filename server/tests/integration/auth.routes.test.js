import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../server.js';
import User from '../../models/User.js';

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
});

describe('Auth Routes Integration Tests', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body.name).toBe(userData.name);
      expect(response.body.email).toBe(userData.email);
      expect(response.body.role).toBe('user');
    });

    it('should fail to register with existing email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      await request(app).post('/api/auth/register').send(userData);

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.message).toBe('User already exists');
    });

    it('should register admin user', async () => {
      const adminData = {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(adminData)
        .expect(201);

      expect(response.body.role).toBe('admin');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });
    });

    it('should login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'password123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body.email).toBe('john@example.com');
    });

    it('should fail to login with wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should fail to login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'notfound@example.com',
          password: 'password123',
        })
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should fail to login with deactivated account', async () => {
      const user = await User.findOne({ email: 'john@example.com' });
      user.isActive = false;
      await user.save();

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'password123',
        })
        .expect(401);

      expect(response.body.message).toBe('Account is deactivated');
    });
  });

  describe('GET /api/auth/me', () => {
    let token;

    beforeEach(async () => {
      const response = await request(app).post('/api/auth/register').send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });
      token = response.body.token;
    });

    it('should get current user profile', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.email).toBe('john@example.com');
      expect(response.body.name).toBe('John Doe');
    });

    it('should fail without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.message).toBe('Not authorized, no token');
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401);

      expect(response.body.message).toBe('Not authorized, token failed');
    });
  });

  describe('PUT /api/auth/profile', () => {
    let token;

    beforeEach(async () => {
      const response = await request(app).post('/api/auth/register').send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });
      token = response.body.token;
    });

    it('should update user profile', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'John Updated',
          email: 'johnupdated@example.com',
        })
        .expect(200);

      expect(response.body.name).toBe('John Updated');
      expect(response.body.email).toBe('johnupdated@example.com');
    });

    it('should update password', async () => {
      await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          password: 'newpassword123',
        })
        .expect(200);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'newpassword123',
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('token');
    });
  });
});
