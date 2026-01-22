/**
 * Book Borrow Confirmation Email Template
 */

module.exports = ({ userName, bookTitle, bookAuthor, bookIsbn, borrowDate, dueDate }) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Book Borrowed Confirmation</title>
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
      background-color: #4caf50;
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
      color: #4caf50;
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
    .info-box {
      background-color: #e8f5e9;
      border-left: 4px solid #4caf50;
      padding: 15px;
      margin: 20px 0;
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
      <h1>✅ Book Borrowed Successfully</h1>
    </div>
    
    <p>Dear ${userName},</p>
    
    <p>Thank you for borrowing from our library! This email confirms that you have successfully borrowed the following book:</p>
    
    <div class="book-details">
      <h2>${bookTitle}</h2>
      <div class="detail-row">
        <span class="detail-label">Author:</span>
        <span>${bookAuthor}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">ISBN:</span>
        <span>${bookIsbn}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Borrowed On:</span>
        <span>${borrowDate}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Due Date:</span>
        <span style="font-weight: bold; color: #4caf50;">${dueDate}</span>
      </div>
    </div>
    
    <div class="info-box">
      <p><strong>📋 Important Reminders:</strong></p>
      <ul style="margin: 10px 0;">
        <li>Please return the book by ${dueDate}</li>
        <li>Late fees apply at $${process.env.FINE_PER_DAY || 1} per day after the due date</li>
        <li>You can renew the book if needed (subject to availability)</li>
        <li>Take good care of the book and report any damage immediately</li>
      </ul>
    </div>
    
    <p><strong>How to Return:</strong></p>
    <ul>
      <li>Visit any of our library branches during business hours</li>
      <li>Use our 24/7 book drop-off box</li>
      <li>Ensure you receive a return confirmation</li>
    </ul>
    
    <p>We hope you enjoy reading this book! If you have any questions or concerns, please don't hesitate to contact us.</p>
    
    <p>Happy Reading!</p>
    
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
