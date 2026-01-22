/**
 * Overdue Book Email Template
 */

module.exports = ({ userName, bookTitle, bookAuthor, dueDate, daysOverdue, fineAmount, borrowDate }) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Overdue Book Notification</title>
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
      background-color: #d32f2f;
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
      color: #d32f2f;
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
    .warning {
      background-color: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 5px;
      padding: 15px;
      margin: 20px 0;
    }
    .fine-amount {
      font-size: 24px;
      color: #d32f2f;
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
      <h1>⚠️ Overdue Book Notification</h1>
    </div>
    
    <p>Dear ${userName},</p>
    
    <p>This is a notification that the following book is now <strong>overdue</strong>:</p>
    
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
        <span>${dueDate}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Days Overdue:</span>
        <span style="color: #d32f2f; font-weight: bold;">${daysOverdue} day(s)</span>
      </div>
    </div>
    
    <div class="warning">
      <p><strong>⚠️ Fine Accumulated:</strong></p>
      <p class="fine-amount">$${fineAmount}</p>
      <p style="margin: 5px 0; font-size: 14px;">
        Fine continues to accumulate at the rate of $${process.env.FINE_PER_DAY || 1} per day until the book is returned.
      </p>
    </div>
    
    <p><strong>Action Required:</strong></p>
    <ul>
      <li>Please return the book as soon as possible to avoid additional fines</li>
      <li>Visit the library during business hours or use our drop-off box</li>
      <li>Pay any accumulated fines at the circulation desk</li>
    </ul>
    
    <p>If you have already returned this book, please disregard this email. If you have any questions or need to renew the book, please contact us.</p>
    
    <p>Thank you for your cooperation.</p>
    
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
