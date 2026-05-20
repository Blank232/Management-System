import React, { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  // Load initial data from localStorage or use defaults
  const loadData = (key, defaultValue) => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  };

  const [budget, setBudget] = useState(() => loadData("budget", 0));
  const [transactions, setTransactions] = useState(() =>
    loadData("transactions", []),
  );
  const [notes, setNotes] = useState(() => loadData("notes", {}));

  // Base static tasks
  const defaultTasks = [
    { id: "static-1", title: "Workout", type: "static", recurrence: "daily" },
  ];
  const [tasks, setTasks] = useState(() => loadData("tasks", defaultTasks));

  // Logs track which tasks are completed on which dates
  const [taskLogs, setTaskLogs] = useState(() => loadData("taskLogs", {}));

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem("budget", JSON.stringify(budget));
  }, [budget]);
  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);
  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);
  useEffect(() => {
    localStorage.setItem("taskLogs", JSON.stringify(taskLogs));
  }, [taskLogs]);

  const value = {
    budget,
    setBudget,
    transactions,
    setTransactions,
    notes,
    setNotes,
    tasks,
    setTasks,
    taskLogs,
    setTaskLogs,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
