import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
/**
 * Initialize Firebase Admin (server-side only)
 * Uses applicationDefault() credentials for production (works with GKE service accounts)
 * Uses minimal config for emulator in development
 */
if (!getApps().length) {
  // Default to emulator in development unless explicitly disabled
  const useEmulator =
    process.env.NODE_ENV === 'development' && process.env.USE_FIREBASE_EMULATOR !== 'false';

  if (useEmulator) {
    // Emulator mode - fake project id
    initializeApp({
      projectId: 'demo-test',
    });

    const emulatorHost = process.env.FIREBASE_EMULATOR_HOST || 'localhost';
    const emulatorPort = process.env.FIREBASE_EMULATOR_PORT || '8081';
    process.env.FIRESTORE_EMULATOR_HOST = `${emulatorHost}:${emulatorPort}`;
  } else {
    // Production mode - uses GOOGLE_APPLICATION_CREDENTIALS or gcloud default credentials
    // Works automatically with GKE service accounts
    try {
      initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || '',
        // credential: admin.credential.applicationDefault(),
      });
    } catch (error) {
      throw error;
    }
  }
}

const adminFirestore = getFirestore(getApps()[0], process.env.FIREBASE_DATABASE_ID || '');

// Configure Firestore settings (best practice)
// ignoreUndefinedProperties: true - automatically removes undefined fields (prevents errors)
// Only call settings() once - check if already configured to avoid errors in Next.js hot reload
try {
  adminFirestore.settings({
    ignoreUndefinedProperties: true,
  });
} catch (error) {
  // Settings already applied (e.g., during hot reload), ignore the error
  if (error instanceof Error && error.message.includes('already been initialized')) {
    // Expected in Next.js development with hot reloading - silently ignore
  } else {
    throw error;
  }
}

export { adminFirestore };
export { Timestamp, FieldValue };
