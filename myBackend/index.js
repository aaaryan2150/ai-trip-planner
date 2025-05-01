// backend/server.js
import express from 'express';
import destinationRoutes from './routes/destinations.js';
import cors from 'cors';



const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));  
app.use(express.json());

// Routes
app.use('/api/destinations', destinationRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});