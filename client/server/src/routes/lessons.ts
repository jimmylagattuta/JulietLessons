import { Router, Request, Response, NextFunction } from 'express';
import { SearchFilters } from '../types/index.js';
import { Lesson, ILesson } from '../models/Lesson.js';
import jwt from 'jsonwebtoken';

const router = Router();

// Extend Express Request type to include user
interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

// Authentication middleware
const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// GET /api/lessons - Get all saved lessons with optional filtering
router.get('/', async (req, res) => {
  try {
    const filters: SearchFilters = {
      ageGroup: req.query.ageGroup as any,
      search: req.query.search as string,
      tags: req.query.tags ? (req.query.tags as string).split(',') : undefined
    };

    const userId = req.query.userId as string;
    const query: any = {};

    // Filter by user (optional - if not provided, return all lessons)
    if (userId) {
      query.createdBy = userId;
    }

    if (filters.ageGroup) {
      query.ageGroup = filters.ageGroup;
    }

    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
        { tags: { $regex: filters.search, $options: 'i' } }
      ];
    }

    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $all: filters.tags };
    }

    const lessons = await Lesson.find(query);
    res.json(lessons);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
});

// GET /api/lessons/:id - Get single lesson
router.get('/:id', async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    res.json(lesson);
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({ error: 'Failed to fetch lesson' });
  }
});

// POST /api/lessons - Create new saved lesson
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const lessonData = req.body;
    
    // Validate required fields
    if (!lessonData.title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Validate that at least one activity is provided
    const hasActivities = lessonData.warmUpId || 
                         (lessonData.mainActivityIds && lessonData.mainActivityIds.length > 0) || 
                         lessonData.coolDownId;
    
    if (!hasActivities) {
      return res.status(400).json({ error: 'At least one activity must be included in the lesson' });
    }

    const lesson = new Lesson({
      ...lessonData,
      // createdBy: req.user!.userId, // Get user ID from token
      createdBy: lessonData.createdBy, // Get user ID from req.body
      mainActivityIds: lessonData.mainActivityIds || [],
      tags: lessonData.tags || [],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await lesson.save();
    res.status(201).json(lesson);
  } catch (error) {
    console.error('Error creating lesson:', error);
    res.status(500).json({ error: 'Failed to create lesson' });
  }
});

// PUT /api/lessons/:id - Update lesson
router.put('/:id', async (req, res) => {
  try {
    const lessonData = req.body;
    
    // Validate that at least one activity is provided
    const hasActivities = lessonData.warmUpId || 
                         (lessonData.mainActivityIds && lessonData.mainActivityIds.length > 0) || 
                         lessonData.coolDownId;
    
    if (!hasActivities) {
      return res.status(400).json({ error: 'At least one activity must be included in the lesson' });
    }

    const updatedLesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      {
        ...lessonData,
        mainActivityIds: lessonData.mainActivityIds || [],
        tags: lessonData.tags || [],
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!updatedLesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    res.json(updatedLesson);
  } catch (error) {
    console.error('Error updating lesson:', error);
    res.status(500).json({ error: 'Failed to update lesson' });
  }
});

// DELETE /api/lessons/:id - Delete lesson
router.delete('/:id', async (req, res) => {
  try {
    const lesson = await Lesson.findOne({ id: req.params.id });
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // Optional: Check if user owns the lesson (in production, verify from auth token)
    const userId = req.query.userId as string;
    if (userId && lesson.createdBy !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this lesson' });
    }

    await Lesson.findByIdAndDelete(lesson._id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting lesson:', error);
    res.status(500).json({ error: 'Failed to delete lesson' });
  }
});

// GET /api/lessons/:id/activities - Get lesson with populated activity details
router.get('/:id/activities', async (req, res) => {
  try {
    const lesson = await Lesson.findOne({ id: req.params.id });
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // In a real implementation, you would populate the activities from the activities collection
    // For now, we'll return the lesson with activity IDs
    // The frontend can make separate requests to get activity details
    
    res.json(lesson);
  } catch (error) {
    console.error('Error fetching lesson with activities:', error);
    res.status(500).json({ error: 'Failed to fetch lesson with activities' });
  }
});

// POST /api/lessons/:id/duplicate - Duplicate a lesson
router.post('/:id/duplicate', async (req, res) => {
  try {
    const originalLesson = await Lesson.findOne({ id: req.params.id });
    if (!originalLesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const { title, createdBy } = req.body;
    
    if (!title || !createdBy) {
      return res.status(400).json({ error: 'Title and createdBy are required for duplication' });
    }

    const duplicatedLesson = new Lesson({
      ...originalLesson.toObject(),
      _id: undefined, // Remove the _id to create a new document
      title,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await duplicatedLesson.save();
    res.status(201).json(duplicatedLesson);
  } catch (error) {
    console.error('Error duplicating lesson:', error);
    res.status(500).json({ error: 'Failed to duplicate lesson' });
  }
});

export default router;