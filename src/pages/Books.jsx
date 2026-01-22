import { useState, useEffect } from 'react';
import { bookService, borrowService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BookCard from '../components/BookCard';
import { toast } from 'react-toastify';
import './Books.css';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [author, setAuthor] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchBooks();
  }, [search, genre, author]);

  const fetchBooks = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (genre) params.genre = genre;
      if (author) params.author = author;

      const data = await bookService.getAllBooks(params);
      setBooks(data.books || []);
    } catch (error) {
      toast.error('Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = async (bookId) => {
    try {
      await borrowService.borrowBook(bookId);
      toast.success('Book borrowed successfully!');
      fetchBooks(); // Refresh list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to borrow book');
    }
  };

  if (loading) {
    return <div className="loading">Loading books...</div>;
  }

  return (
    <div className="books-container">
      <h1>Browse Books</h1>
      
      <div className="search-filters">
        <input
          type="text"
          placeholder="Search by title, author, or genre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <input
          type="text"
          placeholder="Filter by genre..."
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="filter-input"
        />
        <input
          type="text"
          placeholder="Filter by author..."
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="filter-input"
        />
      </div>

      {books.length === 0 ? (
        <p className="no-books">No books found</p>
      ) : (
        <div className="books-grid">
          {books.map((book) => (
            <BookCard
              key={book._id}
              book={book}
              onBorrow={user ? handleBorrow : null}
              isAdmin={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Books;
