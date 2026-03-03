const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
<<<<<<< Updated upstream
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
=======
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger/swagger');
const connectDB = require('./infrastructure/database/mongoose');
>>>>>>> Stashed changes

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to Database
connectDB();

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Swagger definition
const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Surveillance Cameras API',
            version: '1.0.0',
            description: 'API for managing surveillance cameras and user authentication',
        },
        servers: [
            {
                url: `http://localhost:${PORT}/api`,
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./routes/*.js'], // Path to the API routes
});

// Routes
<<<<<<< Updated upstream
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userroutes');
const cameraRoutes = require('./routes/cameraRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cameras', cameraRoutes);
=======
app.use('/api/auth', require('./presentation/routes/authRoutes'));
app.use('/api/cameras', require('./presentation/routes/cameraRoutes'));
app.use('/api/users', require('./presentation/routes/userRoutes'));
>>>>>>> Stashed changes

app.get('/', (req, res) => {
    res.send('Surveillance Cameras API is running');
});

<<<<<<< Updated upstream
// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Start Server
=======
>>>>>>> Stashed changes
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📚 Swagger UI available at http://localhost:${PORT}/api-docs`);
});
