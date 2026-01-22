import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';

const mockAuthValue = {
  user: null,
  loading: false,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  updateUser: vi.fn(),
  isAuthenticated: false,
  isAdmin: false,
};

describe('Navbar Component', () => {
  it('renders logo', () => {
    render(
      <BrowserRouter>
        <AuthContext.Provider value={mockAuthValue}>
          <Navbar />
        </AuthContext.Provider>
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Library Management/i)).toBeInTheDocument();
  });

  it('shows login and register links when not authenticated', () => {
    render(
      <BrowserRouter>
        <AuthContext.Provider value={mockAuthValue}>
          <Navbar />
        </AuthContext.Provider>
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
    expect(screen.getByText(/Register/i)).toBeInTheDocument();
  });

  it('shows user menu when authenticated', () => {
    const authValueWithUser = {
      ...mockAuthValue,
      user: { name: 'Test User', role: 'user' },
      isAuthenticated: true,
    };
    
    render(
      <BrowserRouter>
        <AuthContext.Provider value={authValueWithUser}>
          <Navbar />
        </AuthContext.Provider>
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Test User/i)).toBeInTheDocument();
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();
  });

  it('shows admin links for admin users', () => {
    const authValueWithAdmin = {
      ...mockAuthValue,
      user: { name: 'Admin User', role: 'admin' },
      isAuthenticated: true,
      isAdmin: true,
    };
    
    render(
      <BrowserRouter>
        <AuthContext.Provider value={authValueWithAdmin}>
          <Navbar />
        </AuthContext.Provider>
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Manage Books/i)).toBeInTheDocument();
    expect(screen.getByText(/Manage Users/i)).toBeInTheDocument();
  });
});
