import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          📚 Library Management
        </Link>

        <ul className="navbar-menu">
          {user ? (
            <>
              <li>
                <Link to="/books">Books</Link>
              </li>
              <li>
                <Link to="/dashboard">Dashboard</Link>
              </li>
              {user.role === 'admin' && (
                <>
                  <li>
                    <Link to="/admin/books">Manage Books</Link>
                  </li>
                  <li>
                    <Link to="/admin/users">Manage Users</Link>
                  </li>
                  <li>
                    <Link to="/admin/borrows">All Borrows</Link>
                  </li>
                </>
              )}
              <li>
                <span className="user-info">👤 {user.name}</span>
              </li>
              <li>
                <button onClick={handleLogout} className="btn-logout">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/register">Register</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
