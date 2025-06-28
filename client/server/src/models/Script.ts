import mongoose from 'mongoose';

const scriptSchema = new mongoose.Schema({
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
  genre: {
    type: String,
    required: true,
    trim: true
  },
  ageGroup: {
    type: String,
    enum: ['Young', 'Middle', 'Older'],
    required: true
  },
  characterCount: {
    type: Number,
    required: true,
    min: 1
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  tags: [{
    type: String,
    trim: true
  }],
  fileUrl: {
    type: String
  },
  fileName: {
    type: String
  }
}, {
  timestamps: true
});

export const Script = mongoose.model('Script', scriptSchema); 