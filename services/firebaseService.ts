// Fix: Use Firebase v8 compatible imports
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

import { Cage, HarvestedCage, Notification, User } from '../types';

// Fix: For Firebase v8, User type is available on the firebase namespace
type FirebaseUser = firebase.User;


// TODO: REPLACE THIS WITH YOUR FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "REPLACE_WITH_YOUR_FIREBASE_API_KEY",
  authDomain: "REPLACE_WITH_YOUR_FIREBASE_AUTH_DOMAIN",
  projectId: "REPLACE_WITH_YOUR_FIREBASE_PROJECT_ID",
  storageBucket: "REPLACE_WITH_YOUR_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "REPLACE_WITH_YOUR_FIREBASE_MESSAGING_SENDER_ID",
  appId: "REPLACE_WITH_YOUR_FIREBASE_APP_ID"
};

// Fix: Use Firebase v8 compatible initialization
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
const auth = firebase.auth();

// --- Authentication Functions ---
// Fix: Use Firebase v8 compatible auth methods
export const signUpWithEmail = (email: string, password: string): Promise<FirebaseUser> => {
    return auth.createUserWithEmailAndPassword(email, password).then(userCredential => userCredential.user as FirebaseUser);
};

export const signInWithEmail = (email: string, password: string): Promise<FirebaseUser> => {
    return auth.signInWithEmailAndPassword(email, password).then(userCredential => userCredential.user as FirebaseUser);
};

export const signOutUser = (): Promise<void> => {
    return auth.signOut();
};

export const onAuthStateChanged = (callback: (user: User | null) => void): (() => void) => {
    return auth.onAuthStateChanged((firebaseUser) => {
        if (firebaseUser) {
            callback({ uid: firebaseUser.uid, email: firebaseUser.email });
        } else {
            callback(null);
        }
    });
};


// --- Firestore Collection References for Collaborative Workspace ---
const WORKSPACE_ID = "thinh_y_farm"; // Hardcoded workspace ID for all users

// Fix: Rewrote getCollection to be Firebase v8 compatible
const getCollection = <T = firebase.firestore.DocumentData>(collectionName: string) => {
    return db.collection('workspaces').doc(WORKSPACE_ID).collection(collectionName) as firebase.firestore.CollectionReference<T>;
};

const cagesCollection = getCollection<Cage>('cages');
const harvestedCollection = getCollection<HarvestedCage>('harvestedCages');
const notificationsCollection = getCollection<Notification>('notifications');


// Real-time listeners
// Fix: Use Firebase v8 compatible queries and listeners
export const onCagesUpdate = (
    callback: (cages: Cage[]) => void, 
    onLoad: () => void
): (() => void) => {
    const q = cagesCollection.orderBy('id');
    const unsubscribe = q.onSnapshot((snapshot) => {
        const cages = snapshot.docs.map(doc => ({ ...doc.data() } as Cage));
        callback(cages);
        onLoad();
    }, (error) => {
        console.error("Error fetching cages: ", error);
        onLoad();
    });
    return unsubscribe;
};

export const onHarvestedCagesUpdate = (callback: (cages: HarvestedCage[]) => void): (() => void) => {
     const q = harvestedCollection.orderBy('harvestDate', 'desc');
    const unsubscribe = q.onSnapshot((snapshot) => {
        const harvestedCages = snapshot.docs.map(doc => ({ ...doc.data() } as HarvestedCage));
        callback(harvestedCages);
    });
    return unsubscribe;
};

export const onNotificationsUpdate = (callback: (notifications: Notification[]) => void): (() => void) => {
     const q = notificationsCollection.orderBy('timestamp', 'desc');
    const unsubscribe = q.onSnapshot((snapshot) => {
        const notifications = snapshot.docs.map(doc => ({ ...doc.data() } as Notification));
        callback(notifications);
    });
    return unsubscribe;
};


// CRUD operations
// Fix: Use Firebase v8 compatible CRUD operations
export const addCageToFirebase = async (cage: Cage) => {
    const cageDocRef = cagesCollection.doc(cage.id);
    await cageDocRef.set(cage);
};

export const updateCageInFirebase = async (cageId: string, updates: Partial<Cage>) => {
    const cageDocRef = cagesCollection.doc(cageId);
    await cageDocRef.update(updates);
};

export const deleteCageFromFirebase = async (cageId: string) => {
    const cageDocRef = cagesCollection.doc(cageId);
    await cageDocRef.delete();
};

export const addHarvestedCageToFirebase = async (harvestedCage: HarvestedCage) => {
    const harvestedDocRef = harvestedCollection.doc(harvestedCage.id);
    await harvestedDocRef.set(harvestedCage);
};

// Notification operations
export const addNotificationToFirebase = async (notification: Notification) => {
    const notificationDocRef = notificationsCollection.doc(notification.id);
    await notificationDocRef.set(notification);
};

export const markNotificationsAsReadInFirebase = async () => {
    const batch = db.batch();
    const q = notificationsCollection.where("read", "==", false);
    const querySnapshot = await q.get();
    querySnapshot.forEach(doc => {
        batch.update(doc.ref, { read: true });
    });
    await batch.commit();
};

export const deleteNotificationsForCageInFirebase = async (cageId: string) => {
    const batch = db.batch();
    const q = notificationsCollection.where("cageId", "==", cageId);
    const querySnapshot = await q.get();
    querySnapshot.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();
};