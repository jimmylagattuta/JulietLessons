import { Router } from 'express';
import { Activity } from '../models/Activity.js';
import { SearchFilters } from '../types/index.js';
import { upload } from '../middleware/upload.js';
import { uploadToS3, deleteFromS3 } from '../services/s3.js';

const router = Router();

// In-memory storage (replace with database in production)
// let activities: Activity[] = [
//   {
//     id: '1',
//     title: 'Improvisation Games',
//     description: 'Fun improv exercises to build confidence and creativity',
//     ageGroup: 'Middle',
//     skillLevel: 'Toe Tipper',
//     duration: 30,
//     materials: ['None required'],
//     tags: ['improv', 'creativity', 'teamwork'],
//     requiresScript: 'none',
//     activityType: 'warm-up',
//     playOrCraft: 'More Playing Than Creating',
//     createdAt: new Date('2024-01-01'),
//     updatedAt: new Date('2024-01-01')
//   },
//   {
//     id: '2',
//     title: 'Scene Study Workshop',
//     description: 'In-depth scene analysis and performance practice',
//     ageGroup: 'Older',
//     skillLevel: 'Semi-Pro',
//     duration: 60,
//     materials: ['Scripts', 'Chairs', 'Props'],
//     tags: ['scene-study', 'analysis', 'performance'],
//     requiresScript: 'required',
//     scriptIds: ['1', '2'],
//     activityType: 'main',
//     playOrCraft: 'A Balance of Playing and Creating',
//     createdAt: new Date('2024-01-02'),
//     updatedAt: new Date('2024-01-02')
//   }
// ];

// Get all activities with optional filters
router.get('/', async (req, res) => {
  try {
    const filters: SearchFilters = req.query;
    const query: any = {};

    if (filters.ageGroup) query.ageGroup = filters.ageGroup;
    if (filters.skillLevel) query.skillLevel = filters.skillLevel;
    if (filters.activityType) query.activityType = filters.activityType;
    if (filters.playOrCraft) query.playOrCraft = filters.playOrCraft;
    if (filters.tags) query.tags = { $in: filters.tags };
    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } }
      ];
    }

    const activities = await Activity.find(query);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Get activity by ID
router.get('/:id', async (req, res) => {
  try {
    const activity = await Activity.findOne({ id: req.params.id });
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

// Create new activity
router.post('/', upload.array('files', 10), async (req, res) => {
  try {
    // Parse the activity data from the FormData
    const activityData = JSON.parse(req.body.data);
    
    // Parse materials and tags if they're strings, otherwise use as is
    const materials = typeof activityData.materials === 'string' 
      ? activityData.materials.split(',').map((m: string) => m.trim())
      : activityData.materials || [];
    
    const tags = typeof activityData.tags === 'string'
      ? activityData.tags.split(',').map((t: string) => t.trim())
      : activityData.tags || [];

    // Handle PDF files
    const pdfFiles = [];
    
    // If there are files uploaded through multipart/form-data
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const uploadResult = await uploadToS3(file, 'activities');
        if (uploadResult.success) {
          pdfFiles.push({
            fileName: uploadResult.fileName,
            fileUrl: uploadResult.fileUrl,
            fileSize: file.size,
            uploadedAt: new Date(),
            description: ''
          });
        }
      }
    }

    const activity = new Activity({
      ...activityData,
      materials,
      tags,
      pdfFiles,
      scriptIds: activityData.scriptIds || []
    });

    await activity.save();
    res.status(201).json(activity);
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(400).json({ error: 'Failed to create activity' });
  }
});

// POST /api/activities/:id/upload - Upload PDF files for activity
router.post('/:id/upload', upload.array('pdfFiles', 10), async (req, res) => {
  try {
    const activity = await Activity.findOne({ id: req.params.id });
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const newPdfFiles = [];

    // Upload new files
    for (const file of req.files) {
      const uploadResult = await uploadToS3(file, 'activities');
      if (uploadResult.success) {
        newPdfFiles.push({
          fileName: uploadResult.fileName,
          fileUrl: uploadResult.fileUrl,
          fileSize: file.size,
          uploadedAt: new Date(),
          description: ''
        });
      }
    }

    // Add new PDFs to existing ones
    const updatedActivity = await Activity.findByIdAndUpdate(
      activity._id,
      { 
        $push: { pdfFiles: { $each: newPdfFiles } },
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    res.json(updatedActivity);
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

// Update activity
router.put('/:id', upload.array('files', 10), async (req, res) => {
  try {
    const activity = await Activity.findOne({ id: req.params.id });
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    // Parse the activity data from the FormData
    const activityData = req.body.data ? JSON.parse(req.body.data) : req.body;
    
    // Parse materials and tags if they're strings, otherwise use as is
    const materials = typeof activityData.materials === 'string' 
      ? activityData.materials.split(',').map((m: string) => m.trim())
      : activityData.materials || [];
    
    const tags = typeof activityData.tags === 'string'
      ? activityData.tags.split(',').map((t: string) => t.trim())
      : activityData.tags || [];

    const updateData: any = {
      ...activityData,
      materials,
      tags,
      scriptIds: activityData.scriptIds || []
    };
    
    // If there are files uploaded through multipart/form-data
    if (req.files && Array.isArray(req.files)) {
      const newPdfFiles = [];

      // Upload new files
      for (const file of req.files) {
        const uploadResult = await uploadToS3(file, 'activities');
        if (uploadResult.success) {
          newPdfFiles.push({
            fileName: uploadResult.fileName,
            fileUrl: uploadResult.fileUrl,
            fileSize: file.size,
            uploadedAt: new Date(),
            description: ''
          });
        }
      }

      // Add new files using $push
      if (newPdfFiles.length > 0) {
        updateData.$push = { pdfFiles: { $each: newPdfFiles } };
      }
    }

    // Update the activity
    const updatedActivity = await Activity.findByIdAndUpdate(
      activity._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json(updatedActivity);
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(400).json({ error: 'Failed to update activity' });
  }
});

// Delete activity
router.delete('/:id', async (req, res) => {
  try {
    const activity = await Activity.findOne({ id: req.params.id });
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    // Delete PDF files from S3 if they exist
    if (activity.pdfFiles && activity.pdfFiles.length > 0) {
      for (const pdf of activity.pdfFiles) {
        if (pdf.fileUrl) {
          await deleteFromS3(pdf.fileUrl);
        }
      }
    }

    await Activity.findByIdAndDelete(activity._id);
    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete activity' });
  }
});

export default router;