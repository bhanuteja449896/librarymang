import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import BookCard from '../components/BookCard';

const mockBook = {
  _id: '1',
  title: 'Test Book',
  author: 'Test Author',
  genre: 'Fiction',
  isbn: '978-0-1234-5678-9',
  publishedYear: 2020,
  totalCopies: 5,
  availableCopies: 3,
  description: 'A test book description',
};

describe('BookCard Component', () => {
  it('renders book information', () => {
    render(<BookCard book={mockBook} showActions={false} />);
    
    expect(screen.getByText('Test Book')).toBeInTheDocument();
    expect(screen.getByText(/Test Author/i)).toBeInTheDocument();
    expect(screen.getByText(/Fiction/i)).toBeInTheDocument();
    expect(screen.getByText(/978-0-1234-5678-9/i)).toBeInTheDocument();
  });

  it('displays availability correctly', () => {
    render(<BookCard book={mockBook} showActions={false} />);
    
    expect(screen.getByText(/Available: 3 \/ 5/i)).toBeInTheDocument();
  });

  it('shows borrow button for available book', () => {
    const onBorrow = () => {};
    render(<BookCard book={mockBook} onBorrow={onBorrow} isAdmin={false} />);
    
    expect(screen.getByText(/Borrow/i)).toBeInTheDocument();
  });

  it('shows admin actions for admin users', () => {
    const onEdit = () => {};
    const onDelete = () => {};
    render(
      <BookCard 
        book={mockBook} 
        onEdit={onEdit} 
        onDelete={onDelete} 
        isAdmin={true} 
      />
    );
    
    expect(screen.getByText(/Edit/i)).toBeInTheDocument();
    expect(screen.getByText(/Delete/i)).toBeInTheDocument();
  });
});
