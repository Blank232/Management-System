import React from "react";
import { useAppContext } from "../context/AppContext";
import { LogIn } from "lucide-react";

export default function Login() {
  const { signInWithGoogle } = useAppContext();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="bg-slate-900 p-8 rounded-3xl shadow-lg border border-slate-800 text-center max-w-sm w-full">
        <div className="bg-cyan-500/10 p-4 rounded-full inline-block mb-6 border border-cyan-500/20">
          <LogIn className="w-10 h-10 text-cyan-400" />
        </div>
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Life Tracker</h1>
        <p className="text-slate-400 mb-8 text-sm">
          Sign in to manage your daily tasks, logs, and expenses securely.
        </p>

        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 font-bold py-3 px-6 rounded-xl hover:bg-slate-200 transition-colors shadow-sm"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google Logo"
            className="w-5 h-5"
          />
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
