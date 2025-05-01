import express from 'express';
import { auth } from '../services/firebase';
import { User, Role } from '../services/firebase';

const router = express.Router();

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { email, password, role = 'customer' as Role } = req.body;
    
    // Validate input
    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      disabled: false
    });

    // Set custom claims
    await auth.setCustomUserClaims(userRecord.uid, {
      role
    });

    res.status(201).json({
      uid: userRecord.uid,
      email: userRecord.email,
      role
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    // Get user from Firebase Auth
    const userRecord = await auth.getUserByEmail(email);
    
    // Generate custom token
    const customToken = await auth.createCustomToken(userRecord.uid);
    
    res.json({
      token: customToken,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        role: userRecord.customClaims?.role as Role
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Verify token route
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const decodedToken = await auth.verifyIdToken(token);
    const userRecord = await auth.getUser(decodedToken.uid);
    
    res.json({
      uid: userRecord.uid,
      email: userRecord.email,
      role: userRecord.customClaims?.role as Role
    });
  } catch (error: any) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const { uid } = req.query;
    if (!uid) {
      return res.status(400).json({ error: 'UID is required' });
    }

    const userRecord = await auth.getUser(uid as string);
    res.json({
      uid: userRecord.uid,
      email: userRecord.email,
      role: userRecord.customClaims?.role as Role
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(404).json({ error: 'User not found' });
  }
});

export { router as authRouter };
