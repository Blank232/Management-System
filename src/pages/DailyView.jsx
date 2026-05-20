import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { format, parseISO, getDay } from "date-fns";

export default function DailyView() {
  const { date } = useParams();
  const navigate = useNavigate();
  const {
    tasks,
    setTasks,
    taskLogs,
    setTaskLogs,
    notes,
    setNotes,
    transactions = [],
    setTransactions,
  } = useAppContext();

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [recurrenceType, setRecurrenceType] = useState("daily"); // 'daily', 'single', 'custom'
  const [selectedDays, setSelectedDays] = useState({
    0: false,
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
  });

  // Transaction States
  const [txnType, setTxnType] = useState("expense");
  const [txnAmount, setTxnAmount] = useState("");
  const [txnCategory, setTxnCategory] = useState("Food");
  const [txnNote, setTxnNote] = useState("");
  const categories = [
    "Food",
    "Fun",
    "Drinks",
    "Memberships",
    "Clothes",
    "Books",
    "Toys",
  ];

  let displayDate = date;
  let currentDayOfWeek = 0;
  try {
    const parsedDate = parseISO(date);
    currentDayOfWeek = getDay(parsedDate);
    displayDate = format(parsedDate, "EEEE, MMMM do, yyyy");
  } catch (e) {
    console.error("Invalid date format", e);
  }

  const dailyLogs = taskLogs[date] || {};

  const toggleTask = (taskId) => {
    setTaskLogs((prev) => ({
      ...prev,
      [date]: {
        ...prev[date],
        [taskId]: !prev[date]?.[taskId],
      },
    }));
  };

  const handleNoteChange = (e) => {
    setNotes((prev) => ({
      ...prev,
      [date]: e.target.value,
    }));
  };

  const handleDeleteTask = (taskIdToDelete) => {
    setTasks((prevTasks) =>
      prevTasks.filter((task) => task.id !== taskIdToDelete),
    );
    // Also clean up logs for this task for data hygiene
    setTaskLogs((prevLogs) => {
      const newLogs = { ...prevLogs };
      for (const logDate in newLogs) {
        if (newLogs[logDate][taskIdToDelete]) {
          delete newLogs[logDate][taskIdToDelete];
        }
      }
      return newLogs;
    });
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    let newTask = {
      id: `custom-${Date.now()}`,
      title: newTaskTitle.trim(),
      type: "custom",
    };

    if (recurrenceType === "daily") {
      newTask.recurrence = "daily";
    } else if (recurrenceType === "single") {
      newTask.recurrence = "single";
      newTask.specificDate = date;
    } else {
      // custom
      newTask.recurrence = "custom_days";
      newTask.daysOfWeek = Object.keys(selectedDays)
        .filter((dayIndex) => selectedDays[dayIndex])
        .map(Number);
      if (newTask.daysOfWeek.length === 0) {
        return; // Don't add a task that never occurs
      }
    }

    setTasks((prev) => [...prev, newTask]);
    setNewTaskTitle("");
  };

  // Filter transactions for this specific day
  const todaysTransactions = transactions.filter((t) => t.date === date);

  const handleAddTransaction = (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(txnAmount);
    if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) return;

    const newTransaction = {
      id: `txn-${Date.now()}`,
      type: txnType,
      amount: parsedAmount,
      date,
      category: txnType === "expense" ? txnCategory : "Income",
      note: txnNote.trim(),
    };

    setTransactions((prev) =>
      [newTransaction, ...prev].sort(
        (a, b) => new Date(b.date) - new Date(a.date),
      ),
    );
    setTxnAmount("");
    setTxnNote("");
  };

  const handleDeleteTransaction = (id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const todayTasks = tasks.filter(
    (t) =>
      t.recurrence === "daily" ||
      (t.recurrence === "single" && t.specificDate === date) ||
      (t.recurrence === "custom_days" &&
        t.daysOfWeek?.includes(currentDayOfWeek)),
  );

  const totalTasks = todayTasks.length;
  const completedTasks = todayTasks.filter((t) => dailyLogs[t.id]).length;
  const fillPercentage =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="relative min-h-screen w-full bg-slate-950 overflow-hidden flex flex-col">
      {/* Water Fill Background */}
      <div
        className="absolute bottom-0 left-0 w-full bg-cyan-900 opacity-40 transition-all duration-1000 ease-in-out z-0"
        style={{ height: `${fillPercentage}%` }}
      >
        {fillPercentage > 0 && (
          <div className="absolute bottom-full left-0 w-full overflow-hidden translate-y-[1px]">
            <svg
              className="w-[200%] h-10 md:h-12 animate-wave fill-current text-cyan-900"
              viewBox="0 0 1000 100"
              preserveAspectRatio="none"
            >
              <path d="M0,50 C150,100 350,0 500,50 C650,100 850,0 1000,50 L1000,100 L0,100 Z" />
            </svg>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center p-4 bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-slate-800">
        <button
          onClick={() => navigate("/")}
          className="p-2 mr-4 text-slate-400 hover:text-cyan-400 transition bg-slate-800 rounded-full shadow-sm hover:bg-slate-700"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-100">{displayDate}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 max-w-lg mx-auto w-full flex-1 flex flex-col">
        <h2 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">
          Tasks
        </h2>
        <div className="space-y-3 mb-8">
          {todayTasks.map((task) => {
            const isCompleted = !!dailyLogs[task.id];
            return (
              <div
                key={task.id}
                className={`group flex items-center space-x-4 p-4 rounded-2xl shadow-sm transition-all duration-300 border
                  ${isCompleted ? "bg-slate-800/50 border-cyan-500/50" : "bg-slate-900 border-slate-800 hover:border-cyan-500/50 hover:shadow-md"}
                `}
              >
                <label className="flex flex-1 items-center space-x-4 cursor-pointer">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      className="peer appearance-none w-7 h-7 border-2 border-slate-600 rounded-lg checked:bg-cyan-500 checked:border-cyan-500 transition-colors bg-slate-800"
                      checked={isCompleted}
                      onChange={() => toggleTask(task.id)}
                    />
                    <div className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                    </div>
                  </div>
                  <span
                    className={`text-lg font-medium transition-all duration-300 ${isCompleted ? "line-through text-slate-500" : "text-slate-200"}`}
                  >
                    {task.id === "static-1" && currentDayOfWeek === 0
                      ? "Rest"
                      : task.title}
                  </span>
                </label>
                {task.type === "custom" && (
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-2 text-slate-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    aria-label={`Delete task ${task.title}`}
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            );
          })}

          {/* Add Task Form */}
          <form
            onSubmit={handleAddTask}
            className="mt-4 p-4 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col space-y-4"
          >
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Add new task..."
                className="flex-1 bg-slate-800 text-slate-100 placeholder-slate-500 px-4 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-500"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
              />
              <button
                type="submit"
                className="p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
              >
                <Plus size={24} />
              </button>
            </div>
            <div className="flex items-center justify-between space-x-4 px-1">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 text-sm text-slate-400 cursor-pointer">
                  <input
                    type="radio"
                    name="recurrence"
                    checked={recurrenceType === "daily"}
                    onChange={() => setRecurrenceType("daily")}
                    className="accent-cyan-500"
                  />
                  <span>Every Day</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-slate-400 cursor-pointer">
                  <input
                    type="radio"
                    name="recurrence"
                    checked={recurrenceType === "single"}
                    onChange={() => setRecurrenceType("single")}
                    className="accent-cyan-500"
                  />
                  <span>Only Today</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-slate-400 cursor-pointer">
                  <input
                    type="radio"
                    name="recurrence"
                    checked={recurrenceType === "custom"}
                    onChange={() => setRecurrenceType("custom")}
                    className="accent-cyan-500"
                  />
                  <span>Custom</span>
                </label>
              </div>
            </div>
            {recurrenceType === "custom" && (
              <div className="flex items-center justify-center space-x-2 pt-1">
                {["S", "M", "T", "W", "T", "F", "S"].map((label, index) => (
                  <label
                    key={index}
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <span className="text-xs text-slate-400 mb-1">{label}</span>
                    <input
                      type="checkbox"
                      checked={!!selectedDays[index]}
                      onChange={() =>
                        setSelectedDays((prev) => ({
                          ...prev,
                          [index]: !prev[index],
                        }))
                      }
                      className="w-6 h-6 appearance-none bg-slate-800 border-2 border-slate-700 rounded-md checked:bg-cyan-500 checked:border-cyan-500 transition"
                    />
                  </label>
                ))}
              </div>
            )}
          </form>
        </div>

        <h2 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider mt-8">
          Transactions
        </h2>
        <div className="space-y-3 mb-8">
          {todaysTransactions.length === 0 && (
            <div className="text-slate-500 text-sm text-center p-4 bg-slate-900/50 rounded-2xl border border-slate-800/50 border-dashed">
              No transactions today.
            </div>
          )}
          {todaysTransactions.map((t) => (
            <div
              key={t.id}
              className="group flex items-center justify-between p-4 bg-slate-900 rounded-2xl shadow-sm border border-slate-800 transition-colors hover:border-slate-700"
            >
              <div className="flex flex-col">
                <span className="text-slate-200 font-medium">
                  {t.type === "income" ? "Income" : t.category}
                </span>
                {t.note && (
                  <span className="text-slate-500 text-xs">{t.note}</span>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <span
                  className={`font-bold ${t.type === "income" ? "text-emerald-400" : "text-slate-200"}`}
                >
                  {t.type === "income" ? "+" : "-"}₹{t.amount.toFixed(2)}
                </span>
                <button
                  onClick={() => handleDeleteTransaction(t.id)}
                  className="text-slate-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          <form
            onSubmit={handleAddTransaction}
            className="mt-4 p-4 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col space-y-4"
          >
            <div className="flex items-center space-x-4 px-1">
              <label className="flex items-center space-x-2 text-sm text-slate-400 cursor-pointer">
                <input
                  type="radio"
                  checked={txnType === "income"}
                  onChange={() => setTxnType("income")}
                  className="accent-cyan-500"
                />
                <span>Earned</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-slate-400 cursor-pointer">
                <input
                  type="radio"
                  checked={txnType === "expense"}
                  onChange={() => setTxnType("expense")}
                  className="accent-cyan-500"
                />
                <span>Spent</span>
              </label>
            </div>
            <div className="flex space-x-3">
              <input
                type="number"
                step="0.01"
                placeholder="Amount"
                value={txnAmount}
                onChange={(e) => setTxnAmount(e.target.value)}
                className="w-1/2 bg-slate-800 text-slate-100 px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-500 placeholder-slate-500"
                required
              />
              {txnType === "expense" && (
                <select
                  value={txnCategory}
                  onChange={(e) => setTxnCategory(e.target.value)}
                  className="w-1/2 bg-slate-800 text-slate-100 px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-500"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="flex space-x-3">
              <input
                type="text"
                placeholder="Note (optional)"
                value={txnNote}
                onChange={(e) => setTxnNote(e.target.value)}
                className="flex-1 bg-slate-800 text-slate-100 px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-500 placeholder-slate-500"
              />
              <button
                type="submit"
                className="p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors flex items-center justify-center min-w-[40px]"
              >
                <Plus size={20} />
              </button>
            </div>
          </form>
        </div>

        <h2 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">
          Notes
        </h2>
        <textarea
          className="w-full flex-1 p-5 rounded-2xl shadow-sm border border-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none bg-slate-900 text-slate-200 leading-relaxed placeholder-slate-600"
          placeholder="Jot down stuff for today..."
          value={notes[date] || ""}
          onChange={handleNoteChange}
        />
      </div>
    </div>
  );
}
