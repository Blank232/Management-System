import React, { createContext, useContext, useState, useEffect } from "react";
import { db, auth, googleProvider } from "../firebase";
import {
  collection,
  onSnapshot,
  query,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  const [transactions, setTransactions] = useState([]);
  const [notes, setNotes] = useState({});
  const [tasks, setTasks] = useState([]);
  const [taskLogs, setTaskLogs] = useState({});

  // --- Authentication ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setAuthError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in with Google", error);
      setAuthError(`Failed to sign in: ${error.code || error.message}`);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setAuthError(null);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  // --- Firestore Data Sync ---
  useEffect(() => {
    if (!user) {
      // Clear data on logout
      setAuthError(null);
      setTransactions([]);
      setTasks([]);
      setTaskLogs({});
      setNotes({});
      return;
    }

    const userRoot = `users/${user.uid}`;

    // Base static tasks - ensure they exist for new users
    const unsubTasks = onSnapshot(
      collection(db, userRoot, "tasks"),
      async (snapshot) => {
        if (snapshot.empty) {
          const batch = writeBatch(db);
          const defaultTask = {
            id: "static-1",
            title: "Workout",
            type: "static",
            recurrence: "daily",
          };
          batch.set(doc(db, userRoot, "tasks", defaultTask.id), defaultTask);
          await batch.commit();
        } else {
          const fetchedTasks = snapshot.docs.map((doc) => doc.data());
          setTasks(fetchedTasks);
        }
      },
    );

    const unsubTransactions = onSnapshot(
      collection(db, userRoot, "transactions"),
      (snapshot) => {
        const fetchedTransactions = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTransactions(
          fetchedTransactions.sort(
            (a, b) => new Date(b.date) - new Date(a.date),
          ),
        );
      },
    );

    const unsubTaskLogs = onSnapshot(
      doc(db, userRoot, "data", "taskLogs"),
      (doc) => {
        setTaskLogs(doc.data() || {});
      },
    );

    const unsubNotes = onSnapshot(doc(db, userRoot, "data", "notes"), (doc) => {
      setNotes(doc.data() || {});
    });

    // Cleanup function
    return () => {
      unsubTasks();
      unsubTransactions();
      unsubTaskLogs();
      unsubNotes();
    };
  }, [user]);

  // --- Firestore Write Functions ---

  const addTransaction = async (newTxn) => {
    if (!user) return;
    await addDoc(collection(db, "users", user.uid, "transactions"), newTxn);
  };

  const deleteTransaction = async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "transactions", id));
  };

  const addTask = async (newTask) => {
    if (!user) return;
    await setDoc(doc(db, "users", user.uid, "tasks", newTask.id), newTask);
  };

  const deleteTask = async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "tasks", id));
  };

  const updateTaskLogs = async (newLogs) => {
    if (!user) return;
    await setDoc(doc(db, "users", user.uid, "data", "taskLogs"), newLogs);
  };

  const updateNotes = async (newNotes) => {
    if (!user) return;
    await setDoc(doc(db, "users", user.uid, "data", "notes"), newNotes);
  };

  const value = {
    user,
    loadingAuth,
    authError,
    signInWithGoogle,
    logout,
    transactions,
    addTransaction,
    deleteTransaction,
    notes,
    updateNotes,
    tasks,
    addTask,
    deleteTask,
    taskLogs,
    updateTaskLogs,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
