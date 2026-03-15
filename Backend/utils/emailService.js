const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground' // redirect URL
);
oauth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });

const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

// Function to send email using Gmail API
const sendEmail = async (to, subject, html, pdfBuffer) => {
  try {
    let messageParts = [
      `From: ${process.env.SECY_MAIL}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: multipart/mixed; boundary="boundary"',
      '',
      '--boundary',
      'Content-Type: text/html; charset=UTF-8',
      '',
      html,
    ];
    if (pdfBuffer) {
      const pdfBase64 = pdfBuffer.toString('base64');
      messageParts.push('--boundary');
      messageParts.push('Content-Type: application/pdf; name="menu.pdf"');
      messageParts.push('Content-Disposition: attachment; filename="menu.pdf"');
      messageParts.push('Content-Transfer-Encoding: base64');
      messageParts.push('');
      messageParts.push(pdfBase64);
    }
    messageParts.push('--boundary--');
    const rawMessage = Buffer.from(messageParts.join('\r\n')).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: rawMessage,
      },
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error.message);
    return false;
  }
};

// Function to send menu PDF to all members
const emailMenuPDF = async (email, pdfBuffer, html) => {
  const subject = 'Mess Menu Timetable';
  const htmlBody = html || '<h2>Mess Menu Timetable</h2><p>Find attached the current menu timetable PDF.</p>';
  sendEmail(email, subject, htmlBody, pdfBuffer);
};

// Function to send complaint notification to mess secretary
const sendComplaintNotification = async (email, complaintDetails) => {
  const subject = 'New Complaint Received';
  const html = `
    <h2>New Complaint</h2>
    <p><strong>From:</strong> ${complaintDetails.studentName}</p>
    <p><strong>Description:</strong> ${complaintDetails.text}</p>
    ${complaintDetails.imageUrl ? `<p><img src="${complaintDetails.imageUrl}" alt="Complaint Image" style="max-width: 300px;"></p>` : ''}
    <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
  `;

  await sendEmail(email, subject, html);
};

// Function to send notice to all members
const sendNoticeToMembers = async (emails, noticeDetails) => {
  const subject = `Notice: ${noticeDetails.title}`;
  const html = `
    <h2>${noticeDetails.title}</h2>
    <p>${noticeDetails.message}</p>
    <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
  `;

  // Send all emails simultaneously
  const emailPromises = emails.map(email => sendEmail(email, subject, html));
  
  // Wait for all to finish (or use Promise.allSettled to ignore individual fails)
  await Promise.allSettled(emailPromises);
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
  emailMenuPDF,
};
