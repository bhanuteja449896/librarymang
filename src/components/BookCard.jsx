import './BookCard.css';

const BookCard = ({ book, onBorrow, onEdit, onDelete, isAdmin, showActions = true }) => {
  return (
    <div className="book-card">
      <div className="book-cover">
        <img 
          src={book.coverImage || '/default-book-cover.jpg'} 
          alt={book.title}
          onError={(e) => {
            e.target.src = '/vite.svg'; // Fallback image
          }}
        />
      </div>
      <div className="book-details">
        <h3>{book.title}</h3>
        <p className="book-author">by {book.author}</p>
        <p className="book-genre">Genre: {book.genre}</p>
        <p className="book-year">Published: {book.publishedYear}</p>
        <p className="book-isbn">ISBN: {book.isbn}</p>
        <p className="book-availability">
          Available: {book.availableCopies} / {book.totalCopies}
        </p>
        {book.description && (
          <p className="book-description">{book.description}</p>
        )}
        {showActions && (
          <div className="book-actions">
            {!isAdmin && book.availableCopies > 0 && onBorrow && (
              <button onClick={() => onBorrow(book._id)} className="btn btn-primary">
                Borrow
              </button>
            )}
            {isAdmin && (
              <>
                {onEdit && (
                  <button onClick={() => onEdit(book)} className="btn btn-secondary">
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button onClick={() => onDelete(book._id)} className="btn btn-danger">
                    Delete
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookCard;
