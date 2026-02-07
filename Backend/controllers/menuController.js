const Menu = require('../models/Menu');
const User = require('../models/User');
const { sendMenuUpdateNotification, emailMenuPDF } = require('../utils/emailService');
const { generateMenuPDF } = require('../utils/menuPdf');
// @desc    Email menu PDF to all users
// @access  Private (Secretary)
exports.emailMenu = async (req, res) => {
  try {
    const menu = await Menu.find()
    
    const days = menu[0].days;
    const timings = menu[0].timings || ["", "", ""];
    const pdfBuffer = await generateMenuPDF(days, timings);
    
    const allUsers = await User.find({ role: 'student' });
    const emails = allUsers.map(u => u.email);
    
    // Add timings row below headers
    // const timings = menu[0].timings || ["", "", ""];
    // let html = '<h2>Mess Menu Timetable</h2><table border="1" cellpadding="5" cellspacing="0">';
    // html += '<tr><th>Day</th><th>Breakfast</th><th>Lunch</th><th>Dinner</th></tr>';
    // html += `<tr><td></td><td><b>${timings[0]}</b></td><td><b>${timings[1]}</b></td><td><b>${timings[2]}</b></td></tr>`;
    // Object.keys(days).forEach(day => {
    //   html += `<tr><td>${day}</td><td>${days[day][0]}</td><td>${days[day][1]}</td><td>${days[day][2]}</td></tr>`;
    // });
    // html += '</table>';

    let html = '';
    // Send PDF and HTML table to all
    console.log(html);
    await emailMenuPDF(emails, pdfBuffer, html);
    res.status(200).json({ message: 'Menu PDF emailed to everyone!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// @desc    Get current/upcoming menu
// @access  Public
exports.getMenu = async (req, res) => {
  try {
    const menu = await Menu.find();
    res.status(200).json(menu[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update menu
// @access  Private (Secretary)
exports.updateMenu = async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(400).json({ message: 'data are required' });
    }

    let menu = await Menu.findOne({});
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }
    
    menu.days = data.days;
    menu.updatedAt = Date.now();
    menu.timings = data.timings;
    await menu.save();

    res.status(200).json({ message: 'Menu updated successfully', menu });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
