const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

// Import Routes
const authRoutes = require('./routes/authRoutes');
const pollRoutes = require('./routes/pollRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const menuRoutes = require('./routes/menuRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const allowedEmailsRoutes = require('./routes/allowedEmailsRoutes');
const secretaryMiddleware = require('./middleware/secretaryMiddleware');
const authMiddleware = require('./middleware/authMiddleware');

// Basic Route
app.get('/', (req, res) => {
  res.send('Mess Management System Backend API');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/polls',authMiddleware, pollRoutes);
app.use('/api/complaints',authMiddleware, complaintRoutes);
app.use('/api/feedback',authMiddleware, feedbackRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/notices',authMiddleware, noticeRoutes);
app.use('/api/allowed-emails',authMiddleware, allowedEmailsRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
