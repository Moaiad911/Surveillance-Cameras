const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger/swagger');
const connectDB = require('./infrastructure/database/mongoose');
const { initWorker } = require('./infrastructure/webrtcService');
const { setupSocketIO } = require('./infrastructure/socketHandler');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/streams', express.static(path.join(__dirname, 'uploads/streams')));

connectDB();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => { res.json(swaggerSpec); });
app.use('/api/auth', require('./presentation/routes/authRoutes'));
app.use('/api/cameras', require('./presentation/routes/cameraRoutes'));
app.use('/api/users', require('./presentation/routes/userRoutes'));
app.use('/api/recordings', require('./presentation/routes/recordingRoutes'));
app.use('/api/dashboard', require('./presentation/routes/dashboardRoutes'));
app.use('/api/profile', require('./presentation/routes/profileRoutes'));
app.use('/api/upload', require('./presentation/routes/uploadRoutes'));
app.use('/api/streams', require('./presentation/routes/streamRoutes'));

app.get('/', (req, res) => res.send('Surveillance Cameras API is running'));

const start = async () => {
  await initWorker();
  setupSocketIO(io);
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📚 Swagger UI available at http://localhost:${PORT}/api-docs`);
  });
};

start();
