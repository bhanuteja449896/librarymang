import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PrivateRoute from '../components/PrivateRoute';
import { AuthContext } from '../context/AuthContext';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: ({ to }) => <div>Redirected to {to}</div>,
  };
});

describe('PrivateRoute Component', () => {
  const TestComponent = () => <div>Protected Content</div>;

  it('should render children when authenticated', () => {
    render(
      <BrowserRouter>
        <AuthContext.Provider value={{ isAuthenticated: true, user: { role: 'user' } }}>
          <PrivateRoute>
            <TestComponent />
          </PrivateRoute>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should redirect to login when not authenticated', () => {
    render(
      <BrowserRouter>
        <AuthContext.Provider value={{ isAuthenticated: false, user: null }}>
          <PrivateRoute>
            <TestComponent />
          </PrivateRoute>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    expect(screen.getByText(/redirected to \/login/i)).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should render children for admin when adminOnly is false', () => {
    render(
      <BrowserRouter>
        <AuthContext.Provider value={{ isAuthenticated: true, user: { role: 'admin' } }}>
          <PrivateRoute adminOnly={false}>
            <TestComponent />
          </PrivateRoute>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should redirect non-admin user from admin route', () => {
    render(
      <BrowserRouter>
        <AuthContext.Provider value={{ isAuthenticated: true, user: { role: 'user' } }}>
          <PrivateRoute adminOnly={true}>
            <TestComponent />
          </PrivateRoute>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    expect(screen.getByText(/redirected to \//i)).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should allow admin user to access admin route', () => {
    render(
      <BrowserRouter>
        <AuthContext.Provider value={{ isAuthenticated: true, user: { role: 'admin' } }}>
          <PrivateRoute adminOnly={true}>
            <TestComponent />
          </PrivateRoute>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
