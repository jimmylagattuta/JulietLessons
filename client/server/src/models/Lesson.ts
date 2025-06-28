import mongoose, { Document } from 'mongoose';

export interface ILesson extends Document {
  id: mongoose.Schema.Types.ObjectId;
  title: string;
  description: string;
  ageGroup: 'Young' | 'Middle' | 'Older';
  warmUpId?: string;
  mainActivityIds: string[];
  coolDownId?: string;
  totalDuration: number;
  tags: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const lessonSchema = new mongoose.Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId()
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  ageGroup: {
    type: String,
    required: true,
    enum: ['Young', 'Middle', 'Older']
  },
  warmUpId: {
    type: String,
    required: false
  },
  mainActivityIds: {
    type: [String],
    default: []
  },
  coolDownId: {
    type: String,
    required: false
  },
  totalDuration: {
    type: Number,
    required: true
  },
  tags: {
    type: [String],
    default: []
  },
  createdBy: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export const Lesson = mongoose.model<ILesson>('Lesson', lessonSchema); 