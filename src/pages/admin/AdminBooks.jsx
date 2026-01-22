import { useState, useEffect } from 'react';
import { bookService } from '../../services/api';
import { toast } from 'react-toastify';
import BookCard from '../../components/BookCard';
import './Admin.css';

const AdminBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editBook, setEditBook] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    genre: '',
    description: '',
    publishedYear: '',
    totalCopies: 1,
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const data = await bookService.getAllBooks({});
      setBooks(data.books || []);
    } catch (error) {
      toast.error('Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editBook) {
        await bookService.updateBook(editBook._id, formData);
        toast.success('Book updated successfully');
      } else {
        await bookService.createBook(formData);
        toast.success('Book created successfully');
      }
      setShowModal(false);
      setEditBook(null);
      resetForm();
      fetchBooks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (book) => {
    setEditBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      genre: book.genre,
      description: book.description || '',
      publishedYear: book.publishedYear || '',
      totalCopies: book.totalCopies,
    });
    setShowModal(true);
  };

  const handleDelete = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await bookService.deleteBook(bookId);
        toast.success('Book deleted successfully');
        fetchBooks();
      } catch (error) {
        toast.error('Failed to delete book');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      isbn: '',
      genre: '',
      description: '',
      publishedYear: '',
      totalCopies: 1,
    });
  };

  const openCreateModal = () => {
    setEditBook(null);
    resetForm();
    setShowModal(true);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Manage Books</h1>
        <button onClick={openCreateModal} className="btn btn-primary">
          Add New Book
        </button>
      </div>

      <div className="books-grid">
        {books.map((book) => (
          <BookCard
            key={book._id}
            book={book}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isAdmin={true}
          />
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editBook ? 'Edit Book' : 'Add New Book'}</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="title"
                placeholder="Title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="author"
                placeholder="Author"
                value={formData.author}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="isbn"
                placeholder="ISBN"
                value={formData.isbn}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="genre"
                placeholder="Genre"
                value={formData.genre}
                onChange={handleInputChange}
                required
              />
              <textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
              />
              <input
                type="number"
                name="publishedYear"
                placeholder="Published Year"
                value={formData.publishedYear}
                onChange={handleInputChange}
                min="1000"
                max={new Date().getFullYear()}
              />
              <input
                type="number"
                name="totalCopies"
                placeholder="Total Copies"
                value={formData.totalCopies}
                onChange={handleInputChange}
                required
                min="1"
              />
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">
                  {editBook ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBooks;
