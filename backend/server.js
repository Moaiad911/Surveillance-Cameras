const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger/swagger');
const connectDB = require('./infrastructure/database/mongoose');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to Database
connectDB();

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/auth', require('./presentation/routes/authRoutes'));
app.use('/api/cameras', require('./presentation/routes/cameraRoutes'));
app.use('/api/users', require('./presentation/routes/userRoutes'));
app.use('/api/recordings', require('./presentation/routes/recordingRoutes'));

app.get('/', (req, res) => {
    res.send('Surveillance Cameras API is running');
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📚 Swagger UI available at http://localhost:${PORT}/api-docs`);
});
