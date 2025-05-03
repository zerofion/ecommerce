import express from 'express';
import { auth, db } from '../services/firebase';

interface UserProfile {
  email: string;
  role: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface LoginRequest {
  idToken: string;
}

interface SignupRequest {
  idToken: string;
  user: {
    email: string;
    role: string;
    name: string;
  };
}

const router = express.Router();

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { idToken, user } = req.body as SignupRequest;

    // Verify ID token
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Get user record from Firebase Auth
    const userRecord = await auth.getUser(uid);

    if (userRecord.email === user.email) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    // Create user profile in Firestore
    await db.collection('users').doc(uid).set({
      email: user.email,
      role: user.role,
      name: user.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Set custom claims
    await auth.setCustomUserClaims(uid, {
      role: user.role
    });

    // Generate custom token
    const customToken = await auth.createCustomToken(uid, {
      role: user.role,
      id: uid
    });

    res.status(201).json({
      token: customToken,
      user: {
        email: user.email,
        role: user.role,
        name: user.name
      }
    });

  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Verify token route
router.post('/verify', async (req, res) => {
  try {
    const { idToken } = req.body as LoginRequest;

    // Verify ID token
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Get user profile from Firestore
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const userData = userDoc.data() as UserProfile;

    // Generate new custom token
    const customToken = await auth.createCustomToken(uid, {
      id: uid,
      role: userData.role,
    });

    res.json({
      token: customToken,
      user: {
        email: userData.email,
        name: userData.name
      }
    });

  } catch (error: any) {
    console.error('Verify error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get user profile route
router.get('/user', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;

    // Get user profile from Firestore
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const userData = userDoc.data() as UserProfile;
    res.json({
      user: {
        id: uid,
        email: userData.email,
        role: userData.role,
        name: userData.name
      }
    });

  } catch (error: any) {
    console.error('User profile error:', error);
    res.status(400).json({ error: error.message });
  }
});

export { router as authRouter };
