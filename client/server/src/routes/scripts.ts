import { Router } from 'express';
import { Script } from '../models/Script.js';
import { SearchFilters } from '../types/index.js';
import { upload } from '../middleware/upload.js';
import { uploadToS3, deleteFromS3 } from '../services/s3.js';

const router = Router();

// In-memory storage (replace with database in production)
// let scripts: Script[] = [
//   {
//     id: '1',
//     title: 'The Mystery of the Missing Cookie',
//     description: 'A light-hearted mystery for young performers',
//     genre: 'mystery',
//     ageGroup: 'Young',
//     characterCount: 4,
//     duration: 15,
//     tags: ['mystery', 'comedy', 'food'],
//     createdAt: new Date('2024-01-01'),
//     updatedAt: new Date('2024-01-01')
//   },
//   {
//     id: '2',
//     title: 'Space Adventure',
//     description: 'An exciting journey through the cosmos',
//     genre: 'fantasy',
//     ageGroup: 'Middle',
//     characterCount: 6,
//     duration: 25,
//     tags: ['space', 'adventure', 'teamwork'],
//     createdAt: new Date('2024-01-02'),
//     updatedAt: new Date('2024-01-02')
//   }
// ];

// Get all scripts with optional filters
router.get('/', async (req, res) => {
  try {
    const filters: SearchFilters = req.query;
    const query: any = {};

    if (filters.genre) query.genre = filters.genre;
    if (filters.ageGroup) query.ageGroup = filters.ageGroup;
    if (filters.tags) query.tags = { $in: filters.tags };
    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } }
      ];
    }

    const scripts = await Script.find(query);
    res.json(scripts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch scripts' });
  }
});

// Get script by ID
router.get('/:id', async (req, res) => {
  try {
    const script = await Script.findById(req.params.id);
    if (!script) {
      return res.status(404).json({ error: 'Script not found' });
    }
    res.json(script);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch script' });
  }
});

// Create new script
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const scriptData = req.body;

    console.log(scriptData);
    let fileUrl;

    if (req.file) {
      fileUrl = await uploadToS3(req.file);
    }

    const script = new Script({
      ...scriptData,
      tags: req.body.tags.split(',').map((tag: string) => tag.trim()),
      fileUrl: fileUrl || ""
    });

    await script.save();
    res.status(201).json(script);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create script' });
  }
});

// POST /api/scripts/:id/upload - Upload PDF file for script
router.post('/:id/upload', upload.single('file'), async (req, res) => {
  try {
    const script = await Script.findOne({ id: req.params.id });
    if (!script) {
      return res.status(404).json({ error: 'Script not found' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Delete old file if exists
    if (script.fileUrl) {
      await deleteFromS3(script.fileUrl!);
    }

    const uploadResult = await uploadToS3(req.file, 'scripts');

    if (!uploadResult.success) {
      return res.status(500).json({ error: uploadResult.error });
    }

    const updatedScript = {
      // ...script,
      fileUrl: uploadResult.fileUrl,
      fileName: uploadResult.fileName,
      updatedAt: new Date()
    };

    await Script.findByIdAndUpdate(script._id, updatedScript, { new: true, runValidators: true });

    res.json(updatedScript);
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Update script
router.put('/:id', upload.single('file'), async (req, res) => {
  try {
    const script = await Script.findOne({ id: req.params.id });
    if (!script) {
      return res.status(404).json({ error: 'Script not found' });
    }

    const updateData = { ...req.body, tags: req.body.tags.split(',').map((tag: string) => tag.trim()) };

    if (req.file) {
      // Delete old file if exists
      if (script.fileUrl) {
        await deleteFromS3(script.fileUrl);
      }
      // Upload new file
      updateData.fileUrl = await uploadToS3(req.file);
    }

    const updatedScript = await Script.findByIdAndUpdate(
      script._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json(updatedScript);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update script' });
  }
});

// Delete script
router.delete('/:id', async (req, res) => {
  try {
    console.log(req.params.id);
    const script = await Script.findOne({ id: req.params.id });
    if (!script) {
      return res.status(404).json({ error: 'Script not found' });
    }

    // Delete file from S3 if exists
    if (script.fileUrl) {
      await deleteFromS3(script.fileUrl);
    }

    await Script.findByIdAndDelete(script._id);
    res.json({ message: 'Script deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete script' });
  }
});

export default router;