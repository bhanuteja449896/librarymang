import { useState, useEffect } from 'react';
import { borrowService } from '../services/api';
import { toast } from 'react-toastify';
import './Dashboard.css';

const Dashboard = () => {
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchBorrows();
  }, [filter]);

  const fetchBorrows = async () => {
    try {
      const status = filter !== 'all' ? filter : null;
      const data = await borrowService.getMyBorrows(status);
      setBorrows(data);
    } catch (error) {
      toast.error('Failed to fetch borrow history');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (borrowId) => {
    try {
      await borrowService.returnBook(borrowId);
      toast.success('Book returned successfully!');
      fetchBorrows();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to return book');
    }
  };

  const handlePayFine = async (borrowId) => {
    try {
      await borrowService.payFine(borrowId);
      toast.success('Fine paid successfully!');
      fetchBorrows();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to pay fine');
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <h1>My Dashboard</h1>

      <div className="filter-buttons">
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={filter === 'borrowed' ? 'active' : ''}
          onClick={() => setFilter('borrowed')}
        >
          Borrowed
        </button>
        <button
          className={filter === 'returned' ? 'active' : ''}
          onClick={() => setFilter('returned')}
        >
          Returned
        </button>
        <button
          className={filter === 'overdue' ? 'active' : ''}
          onClick={() => setFilter('overdue')}
        >
          Overdue
        </button>
      </div>

      {borrows.length === 0 ? (
        <p className="no-data">No borrow records found</p>
      ) : (
        <div className="borrow-list">
          {borrows.map((borrow) => (
            <div key={borrow._id} className={`borrow-card ${borrow.status}`}>
              <div className="borrow-info">
                <h3>{borrow.book.title}</h3>
                <p>Author: {borrow.book.author}</p>
                <p>ISBN: {borrow.book.isbn}</p>
                <p>Borrowed: {new Date(borrow.borrowDate).toLocaleDateString()}</p>
                <p>Due: {new Date(borrow.dueDate).toLocaleDateString()}</p>
                {borrow.returnDate && (
                  <p>Returned: {new Date(borrow.returnDate).toLocaleDateString()}</p>
                )}
                <p className="status-badge">{borrow.status.toUpperCase()}</p>
                {borrow.fine > 0 && (
                  <p className="fine-amount">
                    Fine: ${borrow.fine} {borrow.isPaid && '(Paid)'}
                  </p>
                )}
              </div>
              <div className="borrow-actions">
                {borrow.status !== 'returned' && (
                  <button onClick={() => handleReturn(borrow._id)} className="btn btn-primary">
                    Return Book
                  </button>
                )}
                {borrow.fine > 0 && !borrow.isPaid && (
                  <button onClick={() => handlePayFine(borrow._id)} className="btn btn-warning">
                    Pay Fine
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
