import express from 'express';
import cors from 'cors';
import { connectDB } from './config/database.js';
import activityRoutes from './routes/activities.js';
import scriptRoutes from './routes/scripts.js';
import lessonsRoutes from './routes/lessons.js';
import userRoutes from './routes/users.js';
import stripeRoutes from './routes/stripe.js';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/activities', activityRoutes);
app.use('/api/scripts', scriptRoutes);
app.use('/api/lessons', lessonsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stripe', stripeRoutes);

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();