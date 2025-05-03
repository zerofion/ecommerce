import express from 'express';
import { auth, db } from '../services/firebase';

interface UserProfile {
  email: string;
  roles: string[];
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface LoginRequest {
  idToken: string;
  role: string;
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

    const userDoc = await db.collection('users').doc(uid).get();

    if (userDoc.exists) {
      const userData = userDoc.data() as UserProfile;
      if (userData.roles.includes(user.role)) {
        return res.status(409).json({ error: 'User with this role already exists' });
      }
      userData.roles.push(user.role);
      await db.collection('users').doc(uid).update({
        roles: userData.roles
      });
    } else {
      // Create user profile in Firestore
      await db.collection('users').doc(uid).set({
        email: user.email,
        roles: [user.role],
        name: user.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

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
    const { idToken, role } = req.body as LoginRequest;

    // Verify ID token
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Get user profile from Firestore
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const userData = userDoc.data() as UserProfile;

    if (!userData.roles.includes(role)) {
      return res.status(403).json({ error: 'User role mismatch' });
    }

    // Generate new custom token
    const customToken = await auth.createCustomToken(uid, {
      id: uid,
      role,
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


export { router as authRouter };
