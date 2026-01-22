import mongoose from 'mongoose';

const borrowSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    borrowDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    returnDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['borrowed', 'returned', 'overdue'],
      default: 'borrowed',
    },
    fine: {
      type: Number,
      default: 0,
      min: [0, 'Fine cannot be negative'],
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate fine based on overdue days
borrowSchema.methods.calculateFine = function () {
  if (this.returnDate && this.returnDate > this.dueDate) {
    const overdueDays = Math.ceil(
      (this.returnDate - this.dueDate) / (1000 * 60 * 60 * 24)
    );
    this.fine = overdueDays * (process.env.FINE_PER_DAY || 5);
  } else if (!this.returnDate && new Date() > this.dueDate) {
    const overdueDays = Math.ceil(
      (new Date() - this.dueDate) / (1000 * 60 * 60 * 24)
    );
    this.fine = overdueDays * (process.env.FINE_PER_DAY || 5);
    this.status = 'overdue';
  }
  return this.fine;
};

const Borrow = mongoose.model('Borrow', borrowSchema);

export default Borrow;
