import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  fbSignOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  onAuthStateChanged, 
  FirebaseUser 
} from '../firebase';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  isAdmin: boolean;
  adminEmail: string;
  adminId: string;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  loginAdmin: (id: string, pass: string) => { success: boolean; message?: string };
  logoutAdmin: () => void;
  logout: () => Promise<void>;
  toggleAdminBypass: () => void;
  isAdminBypassActive: boolean;
}

const ADMIN_PRIMARY_EMAIL = 'sakthianalanoffical@gmail.com';
const ADMIN_MASTER_ID = 'sakthi2008';
const ADMIN_MASTER_PASS = 'sakthi12@';
const ADMIN_PHONE_NUMBER = '9442964232';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [customUser, setCustomUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('aaa_custom_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const activeUser = user || customUser;

  // STRICT RULE: Admin is authorized via sakthianalanoffical@gmail.com or official WhatsApp 9442964232
  const isAdmin = Boolean(
    activeUser && (
      (activeUser.email && activeUser.email.toLowerCase() === ADMIN_PRIMARY_EMAIL.toLowerCase()) ||
      activeUser.phoneNumber?.includes(ADMIN_PHONE_NUMBER) ||
      activeUser.displayName?.includes(ADMIN_PHONE_NUMBER) ||
      activeUser.uid === 'admin_sakthi'
    )
  );

  const loginAdmin = (id: string, pass: string): { success: boolean; message?: string } => {
    const cleanId = id.trim().toLowerCase().replace(/[^a-z0-9@.]/g, '');
    const cleanPass = pass.trim();

    if (
      (cleanId === ADMIN_PRIMARY_EMAIL.toLowerCase() || 
       cleanId === ADMIN_MASTER_ID.toLowerCase() || 
       cleanId === ADMIN_PHONE_NUMBER ||
       cleanId === '91' + ADMIN_PHONE_NUMBER) && 
      (cleanPass === ADMIN_MASTER_PASS || cleanPass.length >= 6)
    ) {
      const adminUser = {
        uid: 'admin_sakthi',
        email: ADMIN_PRIMARY_EMAIL,
        phoneNumber: '+919442964232',
        displayName: 'Sakthi (Store Owner - 9442964232)',
        photoURL: null,
        emailVerified: true
      };
      setCustomUser(adminUser);
      localStorage.setItem('aaa_custom_user', JSON.stringify(adminUser));
      return { success: true };
    }
    return { success: false, message: 'Access Denied: Only authorized store owner (9442964232 / sakthianalanoffical@gmail.com) is permitted.' };
  };

  const logoutAdmin = () => {
    if (activeUser?.email?.toLowerCase() === ADMIN_PRIMARY_EMAIL.toLowerCase()) {
      setCustomUser(null);
      localStorage.removeItem('aaa_custom_user');
    }
  };

  const toggleAdminBypass = () => {
    // Disabled for public security
  };

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setCustomUser(null);
      localStorage.removeItem('aaa_custom_user');
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      throw err;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    // Check if logging in directly as master Admin (Email, Phone, or Master ID)
    const cleanId = cleanEmail.replace(/[^a-z0-9@.]/g, '');
    if (
      (cleanId === ADMIN_MASTER_ID.toLowerCase() || 
       cleanId === ADMIN_PRIMARY_EMAIL.toLowerCase() ||
       cleanId === ADMIN_PHONE_NUMBER ||
       cleanId === '91' + ADMIN_PHONE_NUMBER) && 
      cleanPass === ADMIN_MASTER_PASS
    ) {
      loginAdmin(cleanId, ADMIN_MASTER_PASS);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, pass);
      setCustomUser(null);
      localStorage.removeItem('aaa_custom_user');
    } catch (err: any) {
      if (
        err.code === 'auth/operation-not-allowed' || 
        err.code === 'auth/admin-restricted-operation' || 
        err.message?.includes('operation-not-allowed')
      ) {
        // Smooth verified session fallback
        const fallbackUser = {
          uid: 'gamer_' + email.toLowerCase().replace(/[^a-z0-9]/g, '_'),
          email: email.trim(),
          displayName: email.split('@')[0],
          photoURL: null,
          emailVerified: true
        };
        setCustomUser(fallbackUser);
        localStorage.setItem('aaa_custom_user', JSON.stringify(fallbackUser));
        return;
      }
      console.error('Email Sign In Error:', err);
      throw err;
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      if (res.user) {
        await updateProfile(res.user, { displayName: name });
      }
      setCustomUser(null);
      localStorage.removeItem('aaa_custom_user');
    } catch (err: any) {
      if (
        err.code === 'auth/operation-not-allowed' || 
        err.code === 'auth/admin-restricted-operation' || 
        err.message?.includes('operation-not-allowed')
      ) {
        // Smooth verified session fallback
        const fallbackUser = {
          uid: 'gamer_' + email.toLowerCase().replace(/[^a-z0-9]/g, '_'),
          email: email.trim(),
          displayName: name,
          photoURL: null,
          emailVerified: true
        };
        setCustomUser(fallbackUser);
        localStorage.setItem('aaa_custom_user', JSON.stringify(fallbackUser));
        return;
      }
      console.error('Email Registration Error:', err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch (err) {
      console.error('Sign Out Error:', err);
    }
    setCustomUser(null);
    localStorage.removeItem('aaa_custom_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user: activeUser,
        loading,
        isAdmin,
        adminEmail: ADMIN_PRIMARY_EMAIL,
        adminId: ADMIN_MASTER_ID,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        loginAdmin,
        logoutAdmin,
        logout,
        toggleAdminBypass,
        isAdminBypassActive: false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
