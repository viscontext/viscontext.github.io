import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import { getApps, initializeApp } from "firebase/app";
import { connectFirestoreEmulator, getFirestore, type Firestore } from "firebase/firestore";
import { connectStorageEmulator, getStorage, type FirebaseStorage } from "firebase/storage";

const projectId = "demo-viscontext";
let cachedServices: LocalFirebaseServices | undefined;

export interface LocalFirebaseServices {
  auth: Auth;
  db: Firestore;
  storage: FirebaseStorage;
}

export function isLocalFirebaseHost(): boolean {
  return window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";
}

export function createLocalFirebase(): LocalFirebaseServices | undefined {
  if (!isLocalFirebaseHost()) return undefined;
  if (cachedServices) return cachedServices;

  const app = getApps()[0] ?? initializeApp({
    apiKey: "demo-api-key",
    appId: "demo-viscontext-web",
    authDomain: `${projectId}.firebaseapp.com`,
    projectId,
    storageBucket: `${projectId}.appspot.com`,
  });
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);

  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  connectStorageEmulator(storage, "127.0.0.1", 9199);

  cachedServices = { auth, db, storage };
  return cachedServices;
}
