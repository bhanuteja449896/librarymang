/**
 * Book Due Reminder Email Template
 */

module.exports = ({ userName, bookTitle, bookAuthor, dueDate, daysUntilDue, borrowDate }) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Book Due Reminder</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background-color: #f9f9f9;
      border: 1px solid #ddd;
      border-radius: 5px;
      padding: 20px;
    }
    .header {
      background-color: #ff9800;
      color: white;
      padding: 15px;
      border-radius: 5px 5px 0 0;
      margin: -20px -20px 20px -20px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .book-details {
      background-color: white;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .book-details h2 {
      margin-top: 0;
      color: #ff9800;
    }
    .detail-row {
      margin: 10px 0;
      padding: 5px 0;
      border-bottom: 1px solid #eee;
    }
    .detail-label {
      font-weight: bold;
      display: inline-block;
      width: 150px;
    }
    .reminder-box {
      background-color: #fff8e1;
      border: 2px solid #ff9800;
      border-radius: 5px;
      padding: 15px;
      margin: 20px 0;
      text-align: center;
    }
    .days-remaining {
      font-size: 36px;
      color: #ff9800;
      font-weight: bold;
    }
    .footer {
      margin-top: 20px;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📚 Book Due Reminder</h1>
    </div>
    
    <p>Dear ${userName},</p>
    
    <p>This is a friendly reminder that the following book will be due soon:</p>
    
    <div class="book-details">
      <h2>${bookTitle}</h2>
      <div class="detail-row">
        <span class="detail-label">Author:</span>
        <span>${bookAuthor}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Borrowed On:</span>
        <span>${borrowDate}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Due Date:</span>
        <span style="font-weight: bold; color: #ff9800;">${dueDate}</span>
      </div>
    </div>
    
    <div class="reminder-box">
      <p style="margin: 0; font-size: 18px;">Time Remaining:</p>
      <p class="days-remaining">${daysUntilDue}</p>
      <p style="margin: 0; font-size: 18px;">${daysUntilDue === 1 ? 'day' : 'days'}</p>
    </div>
    
    <p><strong>Important Information:</strong></p>
    <ul>
      <li>Please return the book by ${dueDate} to avoid late fees</li>
      <li>Late fees: $${process.env.FINE_PER_DAY || 1} per day after the due date</li>
      <li>You can renew the book if you need more time (subject to availability)</li>
      <li>Return the book to any library branch or use our drop-off box</li>
    </ul>
    
    <p>If you have already returned this book or need to renew it, please log in to your account or contact us.</p>
    
    <p>Thank you for using our library!</p>
    
    <p>Best regards,<br>
    Library Management Team</p>
    
    <div class="footer">
      <p>This is an automated email. Please do not reply to this message.</p>
    </div>
  </div>
</body>
</html>
  `;
};
