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

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

connectDB();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', require('./presentation/routes/authRoutes'));
app.use('/api/cameras', require('./presentation/routes/cameraRoutes'));
app.use('/api/users', require('./presentation/routes/userRoutes'));
app.use('/api/recordings', require('./presentation/routes/recordingRoutes'));
app.use('/api/dashboard', require('./presentation/routes/dashboardRoutes'));
app.use('/api/profile', require('./presentation/routes/profileRoutes'));

app.get('/', (req, res) => {
    res.send('Surveillance Cameras API is running');
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📚 Swagger UI available at http://localhost:${PORT}/api-docs`);
});
