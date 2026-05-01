const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./config/db');

// Load environment variables
dotenv.config();

// Verify database connection
pool.getConnection()
    .then(connection => {
        console.log('Database connected successfully');
        connection.release();
    })
    .catch(err => {
        console.error('Database connection failed:', err);
    });

const app = express();

// Trust the first proxy (Render's load balancer) for express-rate-limit
app.set('trust proxy', 1);

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files (medical certificates etc.)
app.use('/uploads', express.static('uploads'));

// Routes Placeholder
app.get('/', (req, res) => {
    res.send('Hostel Haven API is running');
});

// Define Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/leaves', require('./routes/leaveRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/student', require('./routes/studentFeaturesRoutes'));
app.use('/api/counsellor', require('./routes/counsellorRoutes'));
app.use('/api/parent', require('./routes/parentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/guard', require('./routes/guardRoutes'));

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
