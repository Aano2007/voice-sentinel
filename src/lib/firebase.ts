import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });
const githubProvider = new GithubAuthProvider();

// ─── Save user profile to Firestore ──────────────────────────────────────────
// Uses merge:true so existing users are never overwritten on re-login
async function saveUserToFirestore(user: User, extra?: { displayName?: string }) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  await setDoc(
    ref,
    {
      uid: user.uid,
      email: user.email,
      displayName: extra?.displayName ?? user.displayName ?? "",
      photoURL: user.photoURL ?? "",
      provider: user.providerData[0]?.providerId ?? "email",
      // Only set createdAt on first write
      ...(snap.exists() ? {} : { createdAt: serverTimestamp() }),
      lastLoginAt: serverTimestamp(),
    },
    { merge: true }
  );
}

// ─── Auth helpers ─────────────────────────────────────────────────────────────

export const registerWithEmail = async (
  email: string,
  password: string,
  displayName: string
) => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  await saveUserToFirestore(credential.user, { displayName });
  return credential.user;
};

export const signInWithEmail = async (email: string, password: string) => {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  await saveUserToFirestore(credential.user);
  return credential.user;
};

export const signInWithGoogle = async () => {
  const credential = await signInWithPopup(auth, googleProvider);
  await saveUserToFirestore(credential.user);
  return credential.user;
};

export const signInWithGithub = async () => {
  const credential = await signInWithPopup(auth, githubProvider);
  await saveUserToFirestore(credential.user);
  return credential.user;
};

export const resetPassword = (email: string) =>
  sendPasswordResetEmail(auth, email);

export const logout = () => signOut(auth);

export const onAuthChange = (cb: (user: User | null) => void) =>
  onAuthStateChanged(auth, cb);

export const uploadProfilePhoto = async (file: File): Promise<string> => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  const ext = file.name.split(".").pop();
  const path = `avatars/${user.uid}/profile.${ext}`;
  const snap = await uploadBytes(storageRef(storage, path), file);
  const url = await getDownloadURL(snap.ref);
  await updateProfile(user, { photoURL: url });
  await setDoc(doc(db, "users", user.uid), { photoURL: url }, { merge: true });
  return url;
};

export type { User };
