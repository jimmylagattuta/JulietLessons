import express from 'express';
import cors from 'cors';
import activitiesRouter from './routes/activities.js';
import scriptsRouter from './routes/scripts.js';
import lessonsRouter from './routes/lessons.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/activities', activitiesRouter);
app.use('/api/scripts', scriptsRouter);
app.use('/api/lessons', lessonsRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', error);
  
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File size too large' });
  }
  
  if (error.message === 'Only PDF files are allowed!') {
    return res.status(400).json({ error: 'Only PDF files are allowed' });
  }
  
  res.status(500).json({ error: 'Internal server error' });
});

export default app;