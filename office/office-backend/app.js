const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const docRoutes = require('./routes/documents');
const logRoutes = require('./routes/logs');
const adminRoutes = require('./routes/admin');
const documents = require('./routes/documents');
// deployment
const app = express();

// CORS configuration for production
const corsOptions = {
  origin: [
    'http://localhost:3500',
    'http://localhost:3001', 
    'https://office-registration-sigma.vercel.app',
    'https://office-registration-frontend.vercel.app',
    'https://office-registration-frontend-*.vercel.app', // Allow preview deployments
    'https://office-registration-sigma-*.vercel.app' // Allow preview deployments for actual frontend
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/documents', docRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/documents', documents);

// Add a simple health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running successfully' });
});

module.exports = app;
