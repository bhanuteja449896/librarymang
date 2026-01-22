/**
 * Book Return Confirmation Email Template
 */

module.exports = ({ userName, bookTitle, bookAuthor, borrowDate, returnDate, dueDate, wasOverdue, daysOverdue, fineAmount }) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Book Return Confirmation</title>
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
      background-color: ${wasOverdue ? '#ff9800' : '#2196f3'};
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
      color: #2196f3;
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
    .success-box {
      background-color: #e8f5e9;
      border-left: 4px solid #4caf50;
      padding: 15px;
      margin: 20px 0;
    }
    .warning-box {
      background-color: #fff3cd;
      border-left: 4px solid #ff9800;
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
      <h1>📖 Book Return Confirmed</h1>
    </div>
    
    <p>Dear ${userName},</p>
    
    <p>Thank you for returning your book! This email confirms that we have received the following book:</p>
    
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
        <span class="detail-label">Returned On:</span>
        <span style="font-weight: bold;">${returnDate}</span>
      </div>
    </div>
    
    ${wasOverdue ? `
    <div class="warning-box">
      <p><strong>⚠️ Overdue Return</strong></p>
      <p>This book was returned <strong>${daysOverdue} day(s)</strong> late.</p>
      <p style="margin: 10px 0;">
        <span style="font-size: 16px;">Fine Amount:</span><br>
        <span class="fine-amount">$${fineAmount}</span>
      </p>
      <p><strong>Please pay the fine at the circulation desk or through your online account.</strong></p>
      <p style="font-size: 14px; margin-top: 15px;">
        Unpaid fines may result in suspension of borrowing privileges.
      </p>
    </div>
    ` : `
    <div class="success-box">
      <p><strong>✅ On-Time Return</strong></p>
      <p>Thank you for returning the book on time! No fines have been assessed.</p>
      <p>Your responsible borrowing helps ensure that library materials are available for all patrons.</p>
    </div>
    `}
    
    <p><strong>What's Next:</strong></p>
    <ul>
      ${wasOverdue ? '<li>Pay any outstanding fines to maintain your borrowing privileges</li>' : ''}
      <li>Browse our catalog for your next great read</li>
      <li>Check your account for current borrowed items</li>
      <li>Leave a review or rating for this book (optional)</li>
    </ul>
    
    <p>We appreciate your use of our library services and look forward to serving you again soon!</p>
    
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
