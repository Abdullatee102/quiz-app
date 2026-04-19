import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../firebaseConfig';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // --- STATE ---
      user: null,
      profile: null,
      loading: true,
      error: null,
      hasFinishedOnboarding: false,
      biometricEnabled: false,
      profileImage: null,
      _hasHydrated: false, 

      // --- ACTIONS ---
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      setBiometricEnabled: (value) => set({ biometricEnabled: value }),

      // Initialize Auth Listener
      initialize: () => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            set({ 
              user: firebaseUser, 
              profileImage: firebaseUser.photoURL 
            });
            await get().fetchProfile(firebaseUser.uid);
          } else {
            set({ user: null, profile: null, profileImage: null });
          }
          set({ loading: false });
        });
        return unsubscribe;
      },

      setHasFinishedOnboarding: (value) => set({ hasFinishedOnboarding: value }),

      saveUserIdentity: async (email) => {
        await AsyncStorage.setItem('lastUserEmail', email);
      },

      fetchProfile: async (uid) => {
        try {
          const docRef = doc(db, "users", uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            set({ profile: docSnap.data() });
          }
        } catch (err) {
          console.error("Profile fetch error:", err.message);
        }
      },

      // Google Auth Implementation
      googleLogin: async (idToken) => {
        const credential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(auth, credential);
      },

      googleAuth: async (idToken) => {
        try {
          const credential = GoogleAuthProvider.credential(idToken);
          const userCredential = await signInWithCredential(auth, credential);
          return userCredential.user;
        } catch (error) {
          throw error;
        }
      },

      // Sign Up (Email/Pass)
      signUp: async (email, password, fullName) => {
        set({ loading: true, error: null });
        try {
          const res = await createUserWithEmailAndPassword(auth, email, password);
          await setDoc(doc(db, "users", res.user.uid), {
            uid: res.user.uid,
            fullName,
            email,
            createdAt: new Date().toISOString(),
            authType: 'email'
          });
          return { success: true };
        } catch (err) {
          set({ error: err.message, loading: false });
          return { success: false, msg: err.message };
        }
      },

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          await signInWithEmailAndPassword(auth, email, password);
          return { success: true };
        } catch (err) {
          set({ error: err.message, loading: false });
          return { success: false, msg: err.message };
        }
      },

      logout: async () => {
        try {
          await signOut(auth);
          set({ user: null, profile: null, profileImage: null });
        } catch (err) {
          set({ error: err.message });
        }
      },

      forgotPassword: async (email) => {
        try {
          await sendPasswordResetEmail(auth, email);
          return { success: true };
        } catch (err) {
          return { success: false, msg: err.message };
        }
      },

      verifyAccount: async () => {
        try {
          if (auth.currentUser) {
            await sendEmailVerification(auth.currentUser);
            return { success: true };
          }
        } catch (err) {
          return { success: false, msg: err.message };
        }
      },

      githubLogin: () => {
        console.log("GitHub login UI pressed - not yet implemented");
      }
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        hasFinishedOnboarding: state.hasFinishedOnboarding,
        biometricEnabled: state.biometricEnabled 
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.setHasHydrated(true);
      },
    }
  )
);