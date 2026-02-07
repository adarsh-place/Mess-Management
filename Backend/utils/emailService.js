// Function to send menu PDF to all members
const emailMenuPDF = async (emails, pdfBuffer, html) => {
  const subject = 'Mess Menu Timetable';
  const htmlBody = html || '<h2>Mess Menu Timetable</h2><p>Find attached the current menu timetable PDF.</p>';
  for (const email of emails) {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      html: htmlBody,
      attachments: [{ filename: 'menu.pdf', content: pdfBuffer }]
    });
  }
};
const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000, // 10 seconds
  socketTimeout: 10000, // 10 seconds
});

// Function to send email
const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error.message);
    // Don't throw - allow app to continue even if email fails
    return false;
  }
};

// Function to send complaint notification to mess secretary
const sendComplaintNotification = async (secretaryEmail, complaintDetails) => {
  console.log(secretaryEmail);
  const subject = 'New Complaint Received';
  const html = `
    <h2>New Complaint</h2>
    <p><strong>From:</strong> ${complaintDetails.studentName}</p>
    <p><strong>Description:</strong> ${complaintDetails.text}</p>
    ${complaintDetails.imageUrl ? `<p><img src="${complaintDetails.imageUrl}" alt="Complaint Image" style="max-width: 300px;"></p>` : ''}
    <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
  `;

  await sendEmail(secretaryEmail, subject, html);
};

// Function to send notice to all members
const sendNoticeToMembers = async (emails, noticeDetails) => {
  const subject = `Notice: ${noticeDetails.title}`;
  const html = `
    <h2>${noticeDetails.title}</h2>
    <p>${noticeDetails.message}</p>
    <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
  `;

  for (const email of emails) {
    await sendEmail(email, subject, html);
  }
};

// Function to send menu update notification
const sendMenuUpdateNotification = async (emails, menuDetails) => {
  const subject = 'Menu Updated';
  const html = `
    <h2>Menu Updated for ${new Date(menuDetails.date).toLocaleDateString()}</h2>
    <p><strong>Breakfast:</strong> ${menuDetails.breakfast.join(', ')}</p>
    <p><strong>Lunch:</strong> ${menuDetails.lunch.join(', ')}</p>
    <p><strong>Dinner:</strong> ${menuDetails.dinner.join(', ')}</p>
  `;

  for (const email of emails) {
    await sendEmail(email, subject, html);
  }
};

// Function to send complaint reply notification to student
const sendReplyNotification = async (studentEmail, replyDetails) => {
  const subject = 'Reply to Your Complaint';
  const html = `
    <h2>Reply to Your Complaint</h2>
    <p>Hi ${replyDetails.studentName},</p>
    <p><strong>Secretary ${replyDetails.secretaryName} has replied to your complaint:</strong></p>
    <p style="background: #f5f5f5; padding: 15px; border-left: 4px solid #667eea;">
      ${replyDetails.message}
    </p>
    <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
  `;

  await sendEmail(studentEmail, subject, html);
};

module.exports = {
  sendEmail,
  sendComplaintNotification,
  sendReplyNotification,
  sendNoticeToMembers,
  sendMenuUpdateNotification,
  emailMenuPDF,
};
