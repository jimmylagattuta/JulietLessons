import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId()
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'teacher', 'student'],
    required: true
  },
  organization: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLoginAt: {
    type: Date,
    default: Date.now
  },
  stripeCustomerId: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

export interface IUser extends mongoose.Document {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'teacher' | 'student';
  organization: string;
  isActive: boolean;
  lastLoginAt: Date;
  stripeCustomerId?: string;
}

export const User = mongoose.model<IUser>('User', userSchema); 