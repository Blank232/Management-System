import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Plus, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { format, parseISO } from "date-fns";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

export default function ExpenseManager() {
  const { transactions = [], setTransactions } = useAppContext();

  const [type, setType] = useState("expense"); // 'income' | 'expense'
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [category, setCategory] = useState("Food");
  const [note, setNote] = useState("");
  const [currentMonth, setCurrentMonth] = useState(
    format(new Date(), "yyyy-MM"),
  );

  const categories = [
    "Food",
    "Fun",
    "Drinks",
    "Memberships",
    "Clothes",
    "Books",
    "Toys",
  ];

  const COLORS = [
    "#38bdf8", // cyan
    "#a78bfa", // violet
    "#f472b6", // pink
    "#fbbf24", // amber
    "#34d399", // emerald
    "#fb923c", // orange
    "#a3e635", // lime
  ];

  const handleAddTransaction = (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) return;

    const newTransaction = {
      id: `txn-${Date.now()}`,
      type,
      amount: parsedAmount,
      date,
      category: type === "expense" ? category : "Income",
      note: note.trim(),
    };

    setTransactions((prev) =>
      [newTransaction, ...prev].sort(
        (a, b) => new Date(b.date) - new Date(a.date),
      ),
    );
    setAmount("");
    setNote("");
  };

  const handleDeleteTransaction = (id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Calculate Totals
  const previousTransactions = transactions.filter(
    (t) => t.date.substring(0, 7) < currentMonth,
  );
  const monthTransactions = transactions.filter(
    (t) => t.date.substring(0, 7) === currentMonth,
  );

  const rolloverBalance = previousTransactions.reduce(
    (acc, curr) => acc + (curr.type === "income" ? curr.amount : -curr.amount),
    0,
  );

  const totalIncome = monthTransactions
    .filter((t) => t.type === "income")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = monthTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const balance = rolloverBalance + totalIncome - totalExpense;

  // Prepare Pie Chart Data
  const expenseByCategory = monthTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});

  const pieData = Object.keys(expenseByCategory)
    .map((key) => ({
      name: key,
      value: expenseByCategory[key],
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-slate-100">Expense Manager</h1>
        <input
          type="month"
          value={currentMonth}
          onChange={(e) => setCurrentMonth(e.target.value)}
          className="bg-slate-900 text-slate-100 px-4 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 font-medium"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center">
          <span className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">
            Rollover
          </span>
          <span
            className={`font-bold text-base md:text-xl ${rolloverBalance >= 0 ? "text-slate-200" : "text-rose-500"}`}
          >
            ${rolloverBalance.toFixed(2)}
          </span>
        </div>
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center">
          <span className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">
            Income
          </span>
          <span className="text-emerald-400 font-bold text-base md:text-xl flex items-center gap-1">
            <TrendingUp size={16} /> ${totalIncome.toFixed(2)}
          </span>
        </div>
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center">
          <span className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">
            Spent
          </span>
          <span className="text-rose-400 font-bold text-base md:text-xl flex items-center gap-1">
            <TrendingDown size={16} /> ${totalExpense.toFixed(2)}
          </span>
        </div>
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center">
          <span className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">
            Balance
          </span>
          <span
            className={`font-bold text-base md:text-xl ${balance >= 0 ? "text-cyan-400" : "text-rose-500"}`}
          >
            ${balance.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Overspending Warning */}
      {balance < 0 && (
        <div className="bg-rose-500/10 border border-rose-500/50 text-rose-300 px-4 py-3 rounded-xl mb-8 font-medium text-sm text-center shadow-sm">
          Warning: You have overspent your earnings by $
          {Math.abs(balance).toFixed(2)}!
        </div>
      )}

      {/* Form to Add Transactions */}
      <form
        onSubmit={handleAddTransaction}
        className="bg-slate-900 p-5 md:p-6 rounded-2xl shadow-sm border border-slate-800 mb-8 flex flex-col space-y-4"
      >
        <div className="flex items-center space-x-6 px-1">
          <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
            <input
              type="radio"
              checked={type === "income"}
              onChange={() => setType("income")}
              className="accent-cyan-500 w-4 h-4"
            />
            <span>Earned</span>
          </label>
          <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
            <input
              type="radio"
              checked={type === "expense"}
              onChange={() => setType("expense")}
              className="accent-cyan-500 w-4 h-4"
            />
            <span>Spent</span>
          </label>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="number"
            step="0.01"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 bg-slate-950 text-slate-100 px-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:border-cyan-500 placeholder-slate-500"
            required
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="flex-1 bg-slate-950 text-slate-100 px-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:border-cyan-500"
            required
          />
        </div>

        {type === "expense" && (
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-slate-950 text-slate-100 px-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:border-cyan-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}

        <input
          type="text"
          placeholder="Tag/Note (optional)..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full bg-slate-950 text-slate-100 px-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:border-cyan-500 placeholder-slate-500"
        />

        <button
          type="submit"
          className="w-full py-3 mt-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-colors flex justify-center items-center gap-2 shadow-sm"
        >
          <Plus size={20} /> Log {type === "income" ? "Earnings" : "Expense"}
        </button>
      </form>

      {/* Pie Chart Visualization */}
      {pieData.length > 0 && (
        <div className="bg-slate-900 p-5 md:p-6 rounded-2xl shadow-sm border border-slate-800 mb-8">
          <h2 className="text-lg font-bold text-slate-200 mb-6">
            Expense Breakdown
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#1e293b",
                    color: "#f1f5f9",
                    borderRadius: "12px",
                  }}
                  itemStyle={{ color: "#cbd5e1" }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div>
        <h2 className="text-lg font-bold text-slate-200 mb-4">
          Recent Transactions
        </h2>
        <div className="space-y-3">
          {monthTransactions.length === 0 ? (
            <div className="text-slate-500 text-center py-8 bg-slate-900 rounded-2xl border border-slate-800 border-dashed">
              No transactions logged for this month.
            </div>
          ) : (
            monthTransactions.map((t) => (
              <div
                key={t.id}
                className="group bg-slate-900 p-4 rounded-2xl border border-slate-800 flex justify-between items-center transition-colors hover:border-slate-700"
              >
                <div className="flex flex-col">
                  <span className="text-slate-200 font-medium text-lg">
                    {t.type === "income" ? "Income" : t.category}
                    {t.note && (
                      <span className="text-slate-500 text-sm ml-2 font-normal">
                        - {t.note}
                      </span>
                    )}
                  </span>
                  <span className="text-slate-500 text-sm mt-0.5">
                    {format(parseISO(t.date), "MMMM do, yyyy")}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`font-bold text-lg ${t.type === "income" ? "text-emerald-400" : "text-slate-200"}`}
                  >
                    {t.type === "income" ? "+" : "-"}${t.amount.toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleDeleteTransaction(t.id)}
                    className="text-slate-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Delete transaction"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
