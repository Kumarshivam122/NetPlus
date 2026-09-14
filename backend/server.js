const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const supabase = require('./db/supabase');

dotenv.config(); // Load backend/.env
dotenv.config({ path: path.join(__dirname, '../.env') }); // Load root .env (does not overwrite existing)

const app = express();
const PORT = process.env.PORT || 5000;

// Request logging (morgan integrates with winston)
const morganFormat = process.env.NODE_ENV !== 'production' ? 'dev' : 'combined';
app.use(morgan(morganFormat, { stream: { write: message => logger.info(message.trim()) } }));

// Security Headers
app.use(helmet());

// CORS Configuration
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? (process.env.FRONTEND_URL ? [process.env.FRONTEND_URL, 'https://net-plus-neon.vercel.app', 'https://netplus-seven.vercel.app', 'https://net-plus-seven.vercel.app'] : ['https://net-plus-neon.vercel.app', 'https://netplus-seven.vercel.app', 'https://net-plus-seven.vercel.app']) 
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'https://net-plus-neon.vercel.app', 'https://netplus-seven.vercel.app', 'https://net-plus-seven.vercel.app'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use('/api', limiter); // Apply to API routes

// Payload Optimization
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const couponRoutes = require('./routes/couponRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/upload', uploadRoutes);

// Handle 404 for API routes not found
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'API Route Not Found' });
});

// Serve Frontend if in production and built
const frontendDistPath = path.join(__dirname, '../frontend/dist');
if (process.env.NODE_ENV === 'production' && fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// Global Error Handler
app.use(errorHandler);

// Connect to Supabase and start server
const server = app.listen(PORT, async () => {
  try {
    const { error } = await supabase.from('users').select('id').limit(1);
    if (error && error.code !== 'PGRST116') throw error;
    logger.info(`✅ Connected to Supabase. 🚀 Server running on port ${PORT}`);
  } catch (err) {
    logger.error('❌ Error connecting to Supabase: ' + err.message);
  }
});

// Graceful Shutdown
const gracefulShutdown = () => {
  logger.info('Received kill signal, shutting down gracefully');
  server.close(async () => {
    logger.info('Closed out remaining connections');
    try {
      logger.info('Supabase client shutdown complete');
      process.exit(0);
    } catch (err) {
      logger.error('Error during shutdown', err);
      process.exit(1);
    }
  });

  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
