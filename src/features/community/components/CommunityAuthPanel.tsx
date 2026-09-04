"use client";

import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

interface Props {
  onAuthenticated: () => void;
}

export function CommunityAuthPanel({ onAuthenticated }: Props) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const supabase = createBrowserSupabaseClient();

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName.trim() } },
      });
      if (error) setMessage(error.message);
      else if (data.session) onAuthenticated();
      else setMessage("Akun dibuat. Cek email untuk konfirmasi, lalu masuk.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
      else onAuthenticated();
    }
    setBusy(false);
  }

  return (
    <div className="surface rounded-2xl p-4 sm:p-5">
      <p className="font-black">Masuk untuk ikut ngobrol</p>
      <p className="mt-1 text-sm leading-6 text-zinc-400">Komentar tetap bisa dibaca tanpa akun.</p>
      <form onSubmit={submit} className="mt-4 space-y-3">
        {mode === "signup" && (
          <input
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            minLength={2}
            maxLength={32}
            required
            placeholder="Nama tampil"
            className="w-full rounded-xl border border-[var(--border)] bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-red-500"
          />
        )}
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          placeholder="Email"
          className="w-full rounded-xl border border-[var(--border)] bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-red-500"
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={6}
          required
          placeholder="Password"
          className="w-full rounded-xl border border-[var(--border)] bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-red-500"
        />
        {message && <p className="text-sm text-amber-300">{message}</p>}
        <button disabled={busy} className="min-h-11 w-full rounded-xl bg-red-600 px-4 text-sm font-black text-white disabled:opacity-60">
          {busy ? "Memproses..." : mode === "signin" ? "Masuk" : "Buat akun"}
        </button>
      </form>
      <button
        type="button"
        onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setMessage(""); }}
        className="mt-3 min-h-11 text-sm font-bold text-zinc-400 hover:text-white"
      >
        {mode === "signin" ? "Belum punya akun? Daftar" : "Sudah punya akun? Masuk"}
      </button>
    </div>
  );
}
