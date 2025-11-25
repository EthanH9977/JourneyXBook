import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, deleteDoc, query, collectionGroup, writeBatch } from 'firebase/firestore';
import { DayItinerary } from '../types';

// Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Types
export interface FirebaseFile {
    id: string;
    name: string;
}

// --- MAIN SERVICE FUNCTIONS ---

export const loginAndListFiles = async (username: string): Promise<{ userFolderId: string, files: FirebaseFile[], isMock: boolean }> => {
    try {
        // List all documents (files) for this user
        const userDocRef = collection(db, 'users', username, 'itineraries');
        const querySnapshot = await getDocs(userDocRef);

        const files: FirebaseFile[] = [];
        querySnapshot.forEach((doc) => {
            files.push({
                id: doc.id,
                name: `${doc.id}.json` // Add .json extension for consistency
            });
        });

        return {
            userFolderId: username, // Use username as the "folder ID"
            files,
            isMock: false
        };
    } catch (error) {
        console.error('Firebase login error:', error);
        throw new Error('Failed to connect to Firebase');
    }
};

export const loadFromFirebase = async (username: string, fileId: string): Promise<DayItinerary[]> => {
    try {
        const docRef = doc(db, 'users', username, 'itineraries', fileId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data().data as DayItinerary[];
        } else {
            throw new Error('File not found');
        }
    } catch (error) {
        console.error('Firebase load error:', error);
        throw error;
    }
};

export const saveToFirebase = async (
    username: string,
    data: DayItinerary[],
    fileName: string,
    existingFileId: string | null
): Promise<string> => {
    try {
        const fileId = existingFileId || fileName.replace('.json', '');
        const docRef = doc(db, 'users', username, 'itineraries', fileId);

        await setDoc(docRef, {
            data: data,
            updatedAt: new Date().toISOString()
        });

        return fileId;
    } catch (error) {
        console.error('Firebase save error:', error);
        throw new Error('Failed to save to Firebase');
    }
};

export const deleteFromFirebase = async (username: string, fileId: string): Promise<void> => {
    try {
        const docRef = doc(db, 'users', username, 'itineraries', fileId);
        await deleteDoc(docRef);
    } catch (error) {
        console.error('Firebase delete error:', error);
        throw new Error('Failed to delete from Firebase');
    }
};

// --- ADMIN FUNCTIONS ---

export interface UserSummary {
    username: string;
    itineraryCount: number;
    lastUpdated: string;
    itineraries: { id: string; name: string; updatedAt?: string }[];
}

export const getAllUsersWithItineraries = async (): Promise<UserSummary[]> => {
    try {
        // Use collectionGroup to find all itineraries across all users
        // Note: This requires a Firestore index if you add complex sorting/filtering,
        // but for basic fetching it might work. If 'itineraries' is the collection ID.
        const itinerariesQuery = query(collectionGroup(db, 'itineraries'));
        const querySnapshot = await getDocs(itinerariesQuery);

        const userMap = new Map<string, UserSummary>();

        querySnapshot.forEach((docSnap) => {
            // Parent path is users/{username}/itineraries
            // doc.ref.parent.parent?.id should be the username
            const userDoc = docSnap.ref.parent.parent;
            if (!userDoc) return;

            const username = userDoc.id;
            const data = docSnap.data();
            const updatedAt = data.updatedAt || new Date().toISOString();

            if (!userMap.has(username)) {
                userMap.set(username, {
                    username,
                    itineraryCount: 0,
                    lastUpdated: updatedAt,
                    itineraries: []
                });
            }

            const userSummary = userMap.get(username)!;
            userSummary.itineraryCount++;
            userSummary.itineraries.push({
                id: docSnap.id,
                name: data.metadata?.title || docSnap.id,
                updatedAt
            });

            // Keep track of the latest update
            if (updatedAt > userSummary.lastUpdated) {
                userSummary.lastUpdated = updatedAt;
            }
        });

        return Array.from(userMap.values()).sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated));
    } catch (error) {
        console.error('Admin list users error:', error);
        throw new Error('Failed to list users');
    }
};

export const deleteUserData = async (username: string): Promise<void> => {
    try {
        // 1. Delete all itineraries
        const itinerariesRef = collection(db, 'users', username, 'itineraries');
        const snapshot = await getDocs(itinerariesRef);

        const batch = writeBatch(db);
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        await batch.commit();

        // 2. Try to delete the user document itself (if it exists)
        // Even if it's a phantom doc, this is safe to try
        const userDocRef = doc(db, 'users', username);
        await deleteDoc(userDocRef);

    } catch (error) {
        console.error('Admin delete user error:', error);
        throw new Error('Failed to delete user data');
    }
};
