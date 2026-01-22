import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>📚 Welcome to Library Management System</h1>
        <p className="hero-subtitle">
          Manage your library efficiently with our comprehensive book management system
        </p>
        <div className="hero-buttons">
          <Link to="/books" className="btn btn-primary btn-large">
            Browse Books
          </Link>
          <Link to="/register" className="btn btn-secondary btn-large">
            Get Started
          </Link>
        </div>
      </div>

      <div className="features-section">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📖</div>
            <h3>Book Catalog</h3>
            <p>Browse and search through our extensive collection of books</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔄</div>
            <h3>Borrow & Return</h3>
            <p>Easy borrowing and returning system with due date tracking</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Dashboard</h3>
            <p>Track your borrowed books and borrowing history</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚙️</div>
            <h3>Admin Panel</h3>
            <p>Comprehensive admin tools for managing books and users</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Advanced Search</h3>
            <p>Filter books by title, author, genre, and more</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Fine Management</h3>
            <p>Automatic fine calculation for overdue books</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
