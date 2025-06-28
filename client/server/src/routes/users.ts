import { Router } from 'express';
import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Subscription } from '../models/Subscription.js';

const router = Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, organization } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      role,
      organization: organization || "No Organization",
      isActive: true
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({ user: userResponse, token });
  } catch (error) {
    res.status(400).json({ error: 'Failed to register user' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password as string);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ user: userResponse, token });
  } catch (error) {
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json(userResponse);
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update allowed fields
    const { firstName, lastName, organization } = req.body;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (organization) user.organization = organization;

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json(userResponse);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update profile' });
  }
});

// Get all users with optional filters
router.get('/', async (req, res) => {
  try {
    const { role, isActive, organization, search } = req.query;
    let query: any = {};

    // Apply filters if provided
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (organization) {
      query.organization = { $regex: organization, $options: 'i' };
    }
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { organization: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user statistics
router.get('/stats', async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get total users
    const totalUsers = await User.countDocuments();

    // Get active users
    const activeUsers = await User.countDocuments({ isActive: true });

    // Get users by role
    const teacherCount = await User.countDocuments({ role: 'teacher' });
    const adminCount = await User.countDocuments({ role: 'admin' });
    const studentCount = await User.countDocuments({ role: 'student' });

    // Get new users this month
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    // Get subscribed users from Subscription collection
    const subscribedUsers = await Subscription.countDocuments({
      status: 'active'
    });

    // Calculate total revenue from Subscription collection
    const usersWithRevenue = await Subscription.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: { $ifNull: ['$totalSpentOnLessons', 0] }
          }
        }
      }
    ]);

    const totalRevenue = usersWithRevenue[0]?.totalRevenue || 0;

    const stats = {
      totalUsers,
      activeUsers,
      teacherCount,
      adminCount,
      studentCount,
      newUsersThisMonth,
      subscribedUsers,
      totalRevenue
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

// Delete user
router.delete('/:userId', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    // Check if the requester is an admin
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete users' });
    }

    const { userId } = req.params;
    const user = await User.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await User.findByIdAndDelete(user._id);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Update user (admin only)
router.put('/:userId', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    // Check if the requester is an admin
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can update users' });
    }

    const { userId } = req.params;
    const user = await User.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update allowed fields
    const { firstName, lastName, email, role, organization, isActive } = req.body;
    
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email.toLowerCase();
    if (role) user.role = role;
    if (organization) user.organization = organization;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json(userResponse);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Toggle user status (admin only)
router.put('/:userId/toggle', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    // Check if the requester is an admin
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can toggle user status' });
    }

    const { userId } = req.params;
    const user = await User.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Toggle the isActive status
    user.isActive = !user.isActive;
    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json(userResponse);
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ error: 'Failed to toggle user status' });
  }
});

export default router; 