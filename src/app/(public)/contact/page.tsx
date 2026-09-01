import { getOptionalPublicEnv } from "@/lib/env";

export default function ContactPage() {
  const { contactEmail } = getOptionalPublicEnv();

  return (
    <article className="shell max-w-3xl py-12">
      <h1 className="text-4xl font-black">Kontak</h1>
      <div className="prose-ceritaria mt-7">
        <p>Untuk pertanyaan mengenai CERITARIA, kerja sama, koreksi konten, atau permintaan terkait hak cipta, hubungi kanal resmi kami.</p>
        {contactEmail ? (
          <p>Email: <a className="text-red-400 underline" href={`mailto:${contactEmail}`}>{contactEmail}</a></p>
        ) : (
          <p className="rounded-xl border border-amber-700/50 bg-amber-950/30 p-4 text-amber-100">Pemilik situs perlu mengisi NEXT_PUBLIC_CONTACT_EMAIL sebelum peluncuran publik.</p>
        )}
      </div>
    </article>
  );
}
