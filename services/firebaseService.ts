import { initializeApp } from 'firebase/app';
import { 
    getFirestore, 
    collection, 
    onSnapshot,
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    writeBatch,
    query,
    orderBy,
    where
} from 'firebase/firestore';
import { Cage, HarvestedCage, Notification } from '../types';

// TODO: REPLACE THIS WITH YOUR FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyBAl0E4wCRqLJup8vsRTc290IAxFgmIizk",
  authDomain: "trangtraicuathinh-y.firebaseapp.com",
  projectId: "trangtraicuathinh-y",
  storageBucket: "trangtraicuathinh-y.firebasestorage.app",
  messagingSenderId: "70469739033",
  appId: "1:70469739033:web:05bf48c1372597fbdb8088"
};

// Check if the config has been filled
export const isFirebaseConfigured = firebaseConfig.projectId !== "YOUR_PROJECT_ID" && firebaseConfig.projectId !== "trangtraicuathinh-y-placeholder";


// Initialize Firebase
let db: any;
if (isFirebaseConfigured) {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
}

// Collection references
const cagesCollection = isFirebaseConfigured ? collection(db, 'cages') : null;
const harvestedCollection = isFirebaseConfigured ? collection(db, 'harvestedCages') : null;
const notificationsCollection = isFirebaseConfigured ? collection(db, 'notifications') : null;


// Real-time listeners
export const onCagesUpdate = (
    callback: (cages: Cage[]) => void, 
    onLoad: () => void
): (() => void) => {
    if (!cagesCollection) return () => {};
    const q = query(cagesCollection, orderBy('id'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const cages = snapshot.docs.map(doc => ({ ...doc.data() } as Cage));
        callback(cages);
        onLoad(); // Signal that initial data has loaded
    }, (error) => {
        console.error("Error fetching cages: ", error);
        onLoad(); // Also signal load on error to not get stuck on loading screen
    });
    return unsubscribe;
};

export const onHarvestedCagesUpdate = (callback: (cages: HarvestedCage[]) => void): (() => void) => {
    if (!harvestedCollection) return () => {};
     const q = query(harvestedCollection, orderBy('harvestDate', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const harvestedCages = snapshot.docs.map(doc => ({ ...doc.data() } as HarvestedCage));
        callback(harvestedCages);
    });
    return unsubscribe;
};

export const onNotificationsUpdate = (callback: (notifications: Notification[]) => void): (() => void) => {
    if (!notificationsCollection) return () => {};
     const q = query(notificationsCollection, orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({ ...doc.data() } as Notification));
        callback(notifications);
    });
    return unsubscribe;
};


// CRUD operations
export const addCageToFirebase = async (cage: Cage) => {
    if (!cagesCollection) return;
    const cageDocRef = doc(db, 'cages', cage.id);
    await setDoc(cageDocRef, cage);
};

export const updateCageInFirebase = async (cageId: string, updates: Partial<Cage>) => {
    if (!cagesCollection) return;
    const cageDocRef = doc(db, 'cages', cageId);
    await updateDoc(cageDocRef, updates);
};

export const deleteCageFromFirebase = async (cageId: string) => {
    if (!cagesCollection) return;
    const cageDocRef = doc(db, 'cages', cageId);
    await deleteDoc(cageDocRef);
};

export const addHarvestedCageToFirebase = async (harvestedCage: HarvestedCage) => {
    if (!harvestedCollection) return;
    const harvestedDocRef = doc(db, 'harvestedCages', harvestedCage.id);
    await setDoc(harvestedDocRef, harvestedCage);
};

// Notification operations
export const addNotificationToFirebase = async (notification: Notification) => {
    if (!notificationsCollection) return;
    const notificationDocRef = doc(db, 'notifications', notification.id);
    await setDoc(notificationDocRef, notification);
};

export const markNotificationsAsReadInFirebase = async () => {
    if (!notificationsCollection) return;
    const batch = writeBatch(db);
    const q = query(notificationsCollection, where("read", "==", false));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docs.forEach(doc => {
            batch.update(doc.ref, { read: true });
        });
        batch.commit();
        unsubscribe(); // Unsubscribe after the first update to avoid continuous writes
    });
};

export const deleteNotificationsForCageInFirebase = async (cageId: string) => {
    if (!notificationsCollection) return;
    const batch = writeBatch(db);
    const q = query(notificationsCollection, where("cageId", "==", cageId));
     const unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        batch.commit();
        unsubscribe();
    });
};

// Data Migration
export const migrateDataToFirebase = async (cages: Cage[], harvestedCages: HarvestedCage[]) => {
    if (!cagesCollection || !harvestedCollection) return;
    
    const batch = writeBatch(db);

    cages.forEach(cage => {
        const cageDocRef = doc(db, 'cages', cage.id);
        batch.set(cageDocRef, cage);
    });

    harvestedCages.forEach(hCage => {
        const harvestedDocRef = doc(db, 'harvestedCages', hCage.id);
        batch.set(harvestedDocRef, hCage);
    });

    await batch.commit();
};