import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import api from '../utils/api';

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
      defaults: {
        baseURL: '',
      },
    })),
  },
}));

describe('API Utils', () => {
  it('should create axios instance with correct config', () => {
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: 'http://localhost:5000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  it('should have request and response interceptors', () => {
    const mockInstance = axios.create();
    expect(mockInstance.interceptors.request.use).toHaveBeenCalled();
    expect(mockInstance.interceptors.response.use).toHaveBeenCalled();
  });

  it('should export axios instance', () => {
    expect(api).toBeDefined();
    expect(api.interceptors).toBeDefined();
  });
});
