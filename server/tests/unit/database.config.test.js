import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import mongoose from 'mongoose';
import connectDB from '../../config/database.js';

vi.mock('mongoose', () => ({
  default: {
    connect: vi.fn(),
  },
}));

describe('Database Config', () => {
  let consoleLogSpy;
  let consoleErrorSpy;
  let processExitSpy;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    processExitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});
    process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should connect to MongoDB successfully', async () => {
    mongoose.connect.mockResolvedValue({
      connection: { host: 'localhost' },
    });

    await connectDB();

    expect(mongoose.connect).toHaveBeenCalledWith('mongodb://localhost:27017/test');
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('MongoDB Connected')
    );
  });

  it('should handle connection errors', async () => {
    const error = new Error('Connection failed');
    mongoose.connect.mockRejectedValue(error);

    await connectDB();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error: Connection failed')
    );
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  it('should use MONGODB_URI from environment', async () => {
    process.env.MONGODB_URI = 'mongodb://custom:27017/custom-db';
    mongoose.connect.mockResolvedValue({
      connection: { host: 'custom' },
    });

    await connectDB();

    expect(mongoose.connect).toHaveBeenCalledWith('mongodb://custom:27017/custom-db');
  });
});
