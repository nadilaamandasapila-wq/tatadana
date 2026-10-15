import React from 'react';
import { Star } from 'lucide-react';

export function Testimonials() {
  const reviews = [
    {
      name: 'Rian Pratama',
      role: 'Software Engineer di Unicorn Jakarta',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      text: 'Fitur Telegram bot-nya gila sih. Seringkali males catat kalau harus buka app, tapi kalau lewat bot cukup "Kopi 28rb", langsung beres. UI dashboard web-nya juga sangat rapi dan modern.',
      stars: 5,
    },
    {
      name: 'Nadia Salsabila',
      role: 'Owner Bakery & UMKM Bandung',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      text: 'Scan struk belanjanya sangat ngebantu usaha kue saya. Pas belanja bahan di Superindo tinggal foto struk kasir, semua item dan total harga langsung masuk tanpa perlu saya input satu-satu.',
      stars: 5,
    },
    {
      name: 'Dimas Setiawan',
      role: 'Freelance UI/UX Designer',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100',
      text: 'Tampilan oranye dan putihnya terasa sangat clean dan premium, mirip fintech Silicon Valley tapi relevan dengan orang Indo (ngerti istilah ceban, gocap, 1.5jt). Ekspor Excel-nya juga clean banget.',
      stars: 5,
    },
    {
      name: 'Kartika Sari',
      role: 'Ibu Rumah Tangga & Online Seller',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100',
      text: 'Paling suka fitur progress bar visual anggarannya. Pas belanja bulanan langsung tahu kalau kategori belanja sudah 85%, jadi bisa ngerem sebelum akhir bulan tekor.',
      stars: 5,
    },
    {
      name: 'Hendro Gunawan',
      role: 'Konsultan Keuangan Mandiri',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
      text: 'Sebagai perencana keuangan, saya selalu merekomendasikan TataDana ke klien. Fleksibilitas multi-dompet antara cash fisik, rekening bank, dan GoPay membuat audit arus kas sangat akurat.',
      stars: 5,
    },
    {
      name: 'Aisyah Putri',
      role: 'Content Creator Surabaya',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
      text: 'Voice note feature is a lifesaver pas lagi nyetir! Cukup tekan mic di Telegram "Beli bensin 100 ribu", bot langsung catat lengkap dengan stempel jam WIB.',
      stars: 5,
    },
  ];

  return (
    <section className="py-24 bg-slate-50 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
            Kisah Sukses Pengguna
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Dipercaya Ribuan Profesional & UMKM di Indonesia
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            Dengarkan langsung cerita mereka yang berhasil mengendalikan arus kas harian tanpa pusing.
          </p>
        </div>

        {/* Testimonials Masonry Grid */}
        {/* // TODO: ganti dengan testimoni asli */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {Array.from({ length: rev.stars }).map((_, sIdx) => (
                    <Star key={sIdx} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 text-sm leading-relaxed mb-6 italic">
                  &ldquo;{rev.text}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <img
                  src={rev.avatar}
                  alt={rev.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{rev.name}</h4>
                  <p className="text-xs text-slate-500">{rev.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
