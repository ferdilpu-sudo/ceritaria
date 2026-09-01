import { redirect } from "next/navigation";
import { loginAction } from "@/features/admin/actions/auth-actions";
import { createServerSupabaseClient } from "@/lib/supabase/server";

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export const metadata = { title: "Admin Login", robots: { index: false, follow: false } };

const messages: Record<string, string> = {
  missing: "Email dan password wajib diisi.",
  invalid: "Email atau password salah.",
  unauthorized: "Akun ini bukan admin CERITARIA.",
};

export default async function LoginPage({ searchParams }: Props) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: admin } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (admin) redirect("/admin");
  }

  const { error } = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center p-5">
      <div className="w-full max-w-md rounded-3xl surface p-7">
        <p className="text-xs font-black tracking-[0.2em] text-red-400">CERITARIA</p>
        <h1 className="mt-2 text-3xl font-black">Admin Login</h1>
        {error && (
          <p role="alert" className="mt-5 rounded-xl bg-red-950/50 p-3 text-sm text-red-200">
            {messages[error] ?? "Login gagal."}
          </p>
        )}
        <form action={loginAction} className="mt-7 space-y-5">
          <label className="block">
            Email
            <input type="email" name="email" autoComplete="email" required className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3" />
          </label>
          <label className="block">
            Password
            <input type="password" name="password" autoComplete="current-password" required className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3" />
          </label>
          <button className="min-h-12 w-full rounded-xl bg-[var(--primary)] font-black">Masuk</button>
        </form>
      </div>
    </main>
  );
}
