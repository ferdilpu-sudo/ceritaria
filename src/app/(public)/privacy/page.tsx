export default function PrivacyPage() {
  return (
    <article className="shell max-w-3xl py-12">
      <h1 className="text-4xl font-black">Kebijakan Privasi</h1>
      <div className="prose-ceritaria mt-7">
        <p>
          CERITARIA dapat memproses data teknis dasar seperti alamat IP, jenis perangkat,
          halaman yang dikunjungi, referrer, dan data penggunaan untuk mengoperasikan,
          mengamankan, serta memahami penggunaan situs.
        </p>
        <p>
          CERITARIA dapat menggunakan layanan pihak ketiga seperti YouTube, Google Analytics,
          dan Google AdSense. Ketika layanan tersebut aktif atau digunakan, penyedia terkait
          dapat menggunakan cookie, web beacon, alamat IP, atau pengenal lain sesuai kebijakan
          mereka.
        </p>
        <p>
          Vendor pihak ketiga, termasuk Google, dapat menggunakan cookie untuk menayangkan dan
          mengukur iklan berdasarkan kunjungan pengguna ke CERITARIA atau situs lain. Google dan
          partnernya juga dapat menggunakan cookie periklanan untuk menayangkan iklan yang lebih
          relevan sesuai pengaturan pengguna.
        </p>
        <p>
          Pengguna dapat mengatur atau menonaktifkan personalisasi iklan melalui
          {" "}
          <a
            href="https://adssettings.google.com/"
            rel="noreferrer"
            target="_blank"
          >
            Pengaturan Iklan Google
          </a>.
        </p>
        <p>
          CERITARIA tidak menjual data pribadi pengguna. Data administratif dan data operasional
          hanya diproses melalui layanan yang diperlukan untuk menjalankan situs, sesuai tujuan
          masing-masing layanan dan ketentuan yang berlaku.
        </p>
        <p>
          Untuk pertanyaan privasi, permintaan terkait data, atau informasi lebih lanjut,
          pengguna dapat menghubungi CERITARIA melalui halaman Kontak.
        </p>
      </div>
    </article>
  );
}
