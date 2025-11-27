require('dotenv').config();
const express = require('express');
const cors = require('cors');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (production-ready)
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Node.js Backend API with PostgreSQL',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /auth/register',
        login: 'POST /auth/login',
        checkEmail: 'GET /auth/check-email/:email'
      },
      users: {
        getAll: 'GET /users',
        getById: 'GET /users/:id',
        create: 'POST /users',
        update: 'PUT /users/:id',
        delete: 'DELETE /users/:id'
      }
    }
  });
});

// API routes
app.use('/auth', authRouter);
app.use('/users', usersRouter);

// Search options endpoint (mock data - can be moved to database later)
app.get('/searchOptions', (req, res) => {
  try {
    const { field } = req.query;
    
    const searchData = {
      marque: ['Toyota', 'Honda', 'BMW', 'Mercedes', 'Audi', 'Nissan', 'Hyundai', 'Kia', 'Ford', 'Chevrolet'],
      modele: ['Camry', 'Civic', 'X3', 'C-Class', 'A4', 'Altima', 'Elantra', 'Sportage', 'Focus', 'Cruze'],
      annee: ['2020', '2021', '2022', '2023', '2024', '2019', '2018', '2017', '2016', '2015']
    };
    
    if (field && searchData[field]) {
      const options = searchData[field].map((value, index) => ({
        id: `${field}_${index + 1}`,
        field: field,
        value: value
      }));
      return res.json({ success: true, data: options });
    }
    
    const allOptions = [];
    Object.keys(searchData).forEach(fieldKey => {
      searchData[fieldKey].forEach((value, index) => {
        allOptions.push({
          id: `${fieldKey}_${index + 1}`,
          field: fieldKey,
          value: value
        });
      });
    });
    
    res.json({ success: true, data: allOptions });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch search options',
      message: error.message
    });
  }
});

app.post('/searchOptions', (req, res) => {
  try {
    const { field, value } = req.body;
    
    if (!field || !value) {
      return res.status(400).json({
        success: false,
        error: 'Field and value are required'
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Search option added successfully',
      data: {
        id: `${field}_${Date.now()}`,
        field: field,
        value: value
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to add search option',
      message: error.message
    });
  }
});

app.delete('/searchOptions/:id', (req, res) => {
  try {
    const { id } = req.params;
    res.json({
      success: true,
      message: 'Search option deleted successfully',
      id: id
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete search option',
      message: error.message
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server with port conflict handling
async function startServer() {
  try {
    // Check if port is available
    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📍 API URL: http://localhost:${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        console.error(`💡 Try using a different port by setting PORT in .env file`);
        process.exit(1);
      } else {
        console.error('❌ Server error:', error.message);
        process.exit(1);
      }
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('\nSIGINT signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Start the server
startServer();
