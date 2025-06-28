import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId()
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  ageGroup: {
    type: String,
    enum: ['Young', 'Middle', 'Older'],
    required: true
  },
  skillLevel: {
    type: String,
    enum: ['Toe Tipper', 'Green Horn', 'Semi-Pro', 'Seasoned Veteran'],
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  materials: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true
  }],
  requiresScript: {
    type: String,
    enum: ['none', 'optional', 'required'],
    required: true
  },
  scriptIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Script'
  }],
  activityType: {
    type: String,
    enum: ['warm-up', 'main', 'cool-down', 'game', 'exercise'],
    required: true
  },
  playOrCraft: {
    type: String,
    enum: ['More Playing Than Creating', 'A Balance of Playing and Creating', 'Let us Create And Craft'],
    required: true
  },
  pdfFiles: [{
    fileName: {
      type: String,
      required: true
    },
    fileUrl: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    uploadedAt: {
      type: Date,
      required: true,
      default: Date.now
    },
    description: {
      type: String
    }
  }]
}, {
  timestamps: true
});

export const Activity = mongoose.model('Activity', activitySchema); 