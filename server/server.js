const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const invoiceRoutes = require('./routes/invoices');
const shopRoutes = require('./routes/shop');

const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Configure for tunnel environment
app.set('trust proxy', true);

// Enhanced CORS configuration for tunnels
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://47j0ddf9-3000.inc1.devtunnels.ms',
    process.env.CLIENT_URL
  ].filter(Boolean),
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Forwarded-Proto']
};

// Handle tunnel-specific headers
app.use((req, res, next) => {
  if (req.headers['x-forwarded-proto'] === 'https') {
    req.secure = true;
  }
  next();
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false
}));
app.use(morgan('combined'));
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Billing Invoicer API is running',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/shop', shopRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: `The endpoint ${req.originalUrl} does not exist`
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
  
  if (process.env.CLIENT_URL && process.env.CLIENT_URL.includes('devtunnels.ms')) {
    console.log(`🔗 Tunnel URL: https://47j0ddf9-5000.inc1.devtunnels.ms`);
    console.log(`🌍 Frontend URL: ${process.env.CLIENT_URL}`);
  }
});
