import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, deleteDoc, query } from 'firebase/firestore';
import { DayItinerary } from '../types';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCOa0FIsy4MGYmkqG3_cmTOeEqSJ5c6GMo",
    authDomain: "journeyxbook.firebaseapp.com",
    projectId: "journeyxbook",
    storageBucket: "journeyxbook.firebasestorage.app",
    messagingSenderId: "701189543816",
    appId: "1:701189543816:web:7f498e501ebc7babc34c3d",
    measurementId: "G-FVLH8RZWF8"
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
