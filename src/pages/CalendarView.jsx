import React, { useState } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  getDay,
} from "date-fns";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const navigate = useNavigate();
  const { tasks, taskLogs, transactions = [] } = useAppContext();

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const onDateClick = (day) => {
    navigate(`/day/${format(day, "yyyy-MM-dd")}`);
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const rows = [];
  let days = [];
  let day = startDate;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const formattedDate = format(day, "d");
      const cloneDay = day;
      const dateKey = format(day, "yyyy-MM-dd");
      const currentDayOfWeek = getDay(day);

      const dailyLogs = taskLogs[dateKey] || {};

      const todayTasks = tasks.filter(
        (t) =>
          t.recurrence === "daily" ||
          (t.recurrence === "single" && t.specificDate === dateKey) ||
          (t.recurrence === "custom_days" &&
            t.daysOfWeek?.includes(currentDayOfWeek)),
      );

      const totalTasks = todayTasks.length;
      const completedTasks = todayTasks.filter((t) => dailyLogs[t.id]).length;
      const fillPercentage =
        totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      const dayTransactions = transactions.filter((t) => t.date === dateKey);
      const dayNet = dayTransactions.reduce(
        (acc, t) => acc + (t.type === "income" ? t.amount : -t.amount),
        0,
      );

      days.push(
        <div
          className={`h-24 p-2 border-b border-r border-slate-800 cursor-pointer flex flex-col justify-start items-end transition-colors duration-200 relative overflow-hidden
            ${!isSameMonth(day, monthStart) ? "text-slate-600 bg-slate-950" : "text-slate-200 bg-slate-900 hover:bg-slate-800"}
            ${isSameDay(day, new Date()) ? "bg-slate-800 font-bold text-cyan-400 ring-inset ring-2 ring-cyan-500 z-10" : ""}
          `}
          key={day.toString()}
          onClick={() => onDateClick(cloneDay)}
        >
          <div
            className="absolute bottom-0 left-0 w-full bg-cyan-900 opacity-40 transition-all duration-700 ease-in-out z-0"
            style={{ height: `${fillPercentage}%` }}
          >
            {fillPercentage > 0 && (
              <div className="absolute bottom-full left-0 w-full overflow-hidden translate-y-[1px]">
                <svg
                  className="w-[200%] h-3 animate-wave fill-current text-cyan-900"
                  viewBox="0 0 1000 100"
                  preserveAspectRatio="none"
                >
                  <path d="M0,50 C150,100 350,0 500,50 C650,100 850,0 1000,50 L1000,100 L0,100 Z" />
                </svg>
              </div>
            )}
          </div>
          <span className="text-sm relative z-10">{formattedDate}</span>
          {dayNet !== 0 && (
            <div
              className={`text-[11px] absolute bottom-1 left-1 z-10 font-bold tracking-tight ${dayNet > 0 ? "text-emerald-400" : "text-rose-400"}`}
            >
              {dayNet > 0 ? "+" : "-"}${Math.abs(dayNet).toFixed(0)}
            </div>
          )}
        </div>,
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className="grid grid-cols-7" key={day.toString()}>
        {days}
      </div>,
    );
    days = [];
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-6 bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-800">
        <button
          onClick={prevMonth}
          className="px-4 py-2 bg-slate-800 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-cyan-400 transition font-medium"
        >
          &lt; Prev
        </button>
        <h2 className="text-2xl font-bold text-slate-100">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <button
          onClick={nextMonth}
          className="px-4 py-2 bg-slate-800 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-cyan-400 transition font-medium"
        >
          Next &gt;
        </button>
      </div>
      <div className="bg-slate-900 rounded-xl shadow-sm overflow-hidden border-t border-l border-slate-800">
        <div className="grid grid-cols-7 text-center font-semibold text-slate-400 bg-slate-950 border-b border-slate-800 py-3 text-sm uppercase tracking-wider">
          <div className="border-r border-slate-800">Sun</div>
          <div className="border-r border-slate-800">Mon</div>
          <div className="border-r border-slate-800">Tue</div>
          <div className="border-r border-slate-800">Wed</div>
          <div className="border-r border-slate-800">Thu</div>
          <div className="border-r border-slate-800">Fri</div>
          <div>Sat</div>
        </div>
        <div>{rows}</div>
      </div>
    </div>
  );
}
