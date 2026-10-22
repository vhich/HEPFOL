"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = getSupabaseBrowserClient();

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert("Check your email for the confirmation link!");
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    const origin = window.location.origin; // Automatically detects http://localhost:3000 or https://hepfol-frontend.onrender.com

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-center ">Sign in to Hepfol</h2>

        <form onSubmit={handleEmailSignUp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium ">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-indigo-600 rounded-md hover:bg-indigo-700 transition"
          >
            {loading ? "Processing..." : "Sign Up / Sign In"}
          </button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="grow border-t border-gray-300"></div>
          <span className="shrink mx-4 text-gray-400 text-sm">Or</span>
          <div className="grow border-t border-gray-300"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition flex items-center justify-center gap-2"
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
}
