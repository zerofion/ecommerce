require('dotenv').config();

export const config = {
  port: process.env.PORT || 3002,
  environment: process.env.NODE_ENV || 'development',
  firebase: {
    credential: {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    }
  }
};
