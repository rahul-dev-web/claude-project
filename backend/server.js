const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Import routes and middleware
const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');
const discordRoutes = require('./routes/discordRoutes');
const errorHandler = require('./middleware/errorHandler');
const { userLimiter, minuteLimiter } = require('./middleware/rateLimit');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
//app.use(userLimiter);
//app.use(minuteLimiter);

// Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/discord', discordRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running ✅' });
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});

module.exports = { app, supabase };