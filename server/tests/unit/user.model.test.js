import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
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
  await User.deleteMany({});
});

describe('User Model Test', () => {
  it('should create a user successfully', async () => {
    const validUser = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    const user = await User.create(validUser);

    expect(user._id).toBeDefined();
    expect(user.name).toBe(validUser.name);
    expect(user.email).toBe(validUser.email);
    expect(user.password).not.toBe(validUser.password); // Should be hashed
    expect(user.role).toBe('user');
    expect(user.isActive).toBe(true);
  });

  it('should fail to create user without required fields', async () => {
    const userWithoutEmail = new User({ name: 'John', password: 'password123' });
    
    let err;
    try {
      await userWithoutEmail.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.email).toBeDefined();
  });

  it('should fail to create user with invalid email', async () => {
    const invalidUser = {
      name: 'John Doe',
      email: 'invalid-email',
      password: 'password123',
    };

    let err;
    try {
      await User.create(invalidUser);
    } catch (error) {
      err = error;
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
  });

  it('should fail to create duplicate email', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    await User.create(userData);

    let err;
    try {
      await User.create(userData);
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
  });

  it('should hash password before saving', async () => {
    const password = 'password123';
    const user = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password,
    });

    expect(user.password).not.toBe(password);
    expect(user.password.length).toBeGreaterThan(password.length);
  });

  it('should compare password correctly', async () => {
    const password = 'password123';
    const user = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password,
    });

    const savedUser = await User.findById(user._id).select('+password');
    const isMatch = await savedUser.comparePassword(password);
    const isNotMatch = await savedUser.comparePassword('wrongpassword');

    expect(isMatch).toBe(true);
    expect(isNotMatch).toBe(false);
  });

  it('should create admin user with correct role', async () => {
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
    });

    expect(adminUser.role).toBe('admin');
  });

  it('should fail with password less than 6 characters', async () => {
    const user = {
      name: 'John Doe',
      email: 'john@example.com',
      password: '12345',
    };

    let err;
    try {
      await User.create(user);
    } catch (error) {
      err = error;
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.password).toBeDefined();
  });
});
