import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
<<<<<<< HEAD
import { getFirestore } from 'firebase/firestore';
=======
import { getFirestore, collection, query, where, orderBy } from 'firebase/firestore';
>>>>>>> 8b535ae (Update 3)

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase only if we have the required configuration
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  throw new Error('Firebase configuration is missing. Please check your environment variables.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

<<<<<<< HEAD
// Note: The composite index for the chats collection needs to be created in the Firebase Console
// Create the following index:
// Collection: chats
// Fields to index:
//   - userId (Ascending)
//   - createdAt (Descending)
// This will enable proper querying of chats by userId and sorting by createdAt
=======
// Helper function to create a messages query
export const createMessagesQuery = (chatId: string) => {
  return query(
    collection(db, 'messages'),
    where('chatId', '==', chatId),
    orderBy('timestamp', 'asc')
  );
};

// Helper function to create a chats query
export const createChatsQuery = (userId: string) => {
  return query(
    collection(db, 'chats'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
};
>>>>>>> 8b535ae (Update 3)
