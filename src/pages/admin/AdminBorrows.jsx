import { useState, useEffect } from 'react';
import { borrowService } from '../../services/api';
import { toast } from 'react-toastify';
import './Admin.css';

const AdminBorrows = () => {
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchBorrows();
    fetchStats();
  }, []);

  const fetchBorrows = async () => {
    try {
      const data = await borrowService.getAllBorrows({});
      setBorrows(data.borrows || []);
    } catch (error) {
      toast.error('Failed to fetch borrows');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await borrowService.getBorrowStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-container">
      <h1>Borrow Management</h1>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Borrows</h3>
            <p className="stat-value">{stats.totalBorrows}</p>
          </div>
          <div className="stat-card">
            <h3>Active Borrows</h3>
            <p className="stat-value">{stats.activeBorrows}</p>
          </div>
          <div className="stat-card">
            <h3>Overdue Books</h3>
            <p className="stat-value danger">{stats.overdueBorrows}</p>
          </div>
          <div className="stat-card">
            <h3>Total Fines</h3>
            <p className="stat-value">${stats.totalFines}</p>
          </div>
          <div className="stat-card">
            <h3>Unpaid Fines</h3>
            <p className="stat-value danger">${stats.unpaidFines}</p>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Book</th>
              <th>Borrow Date</th>
              <th>Due Date</th>
              <th>Return Date</th>
              <th>Status</th>
              <th>Fine</th>
            </tr>
          </thead>
          <tbody>
            {borrows.map((borrow) => (
              <tr key={borrow._id}>
                <td>{borrow.user.name}</td>
                <td>{borrow.book.title}</td>
                <td>{new Date(borrow.borrowDate).toLocaleDateString()}</td>
                <td>{new Date(borrow.dueDate).toLocaleDateString()}</td>
                <td>
                  {borrow.returnDate
                    ? new Date(borrow.returnDate).toLocaleDateString()
                    : 'Not returned'}
                </td>
                <td>
                  <span className={`status-badge ${borrow.status}`}>
                    {borrow.status.toUpperCase()}
                  </span>
                </td>
                <td>
                  {borrow.fine > 0 ? (
                    <span className={borrow.isPaid ? 'fine-paid' : 'fine-unpaid'}>
                      ${borrow.fine} {borrow.isPaid && '✓'}
                    </span>
                  ) : (
                    '$0'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminBorrows;
