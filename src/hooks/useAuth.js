import { createElement, createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { auth, functions } from '../services/firebase';
import { login as loginService, logout as logoutService } from '../services/auth';

const checkAdminStatus = httpsCallable(functions, 'checkAdminStatus');

const AuthContext = createContext(null);

// AUTH BYPASS — milestone 4
const BYPASS_USER = { uid: 'demo', email: 'demo@opticore.com' };

export function AuthProvider({ children }) {
  // AUTH BYPASS — milestone 4 (re-enable before production)
  const [user, setUser] = useState({ uid: 'demo', email: 'demo@opticore.com' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
  //     if (!firebaseUser) {
  //       setUser(null);
  //       setLoading(false);
  //       return;
  //     }
  //
  //     try {
  //       const result = await checkAdminStatus();
  //       if (!result.data.isAdmin) {
  //         await logoutService();
  //         setUser(null);
  //         setError('Access denied. You are not an admin user.');
  //       } else {
  //         setUser(firebaseUser);
  //         setError('');
  //       }
  //     } catch {
  //       setUser(null);
  //       setError('Failed to verify admin access.');
  //     } finally {
  //       setLoading(false);
  //     }
  //   });
  //
  //   return unsubscribe;
  // }, []);

  async function login(_email, _password) {
    setError('');
    // AUTH BYPASS — milestone 4
    // try {
    //   await loginService(_email, _password);
    // } catch (err) {
    //   const msg = friendlyAuthError(err.code);
    //   setError(msg);
    //   throw new Error(msg);
    // }
  }

  async function logout() {
    // AUTH BYPASS — milestone 4
    // await logoutService();
    // setUser(null);
  }

  return createElement(
    AuthContext.Provider,
    { value: { user, loading, login, logout, error, setError } },
    children
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  // AUTH BYPASS — milestone 4: guarantee user is always the mock object
  return { ...ctx, user: ctx.user || BYPASS_USER };
}

function friendlyAuthError(code) {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    default:
      return 'Login failed. Please try again.';
  }
}
