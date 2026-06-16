/**
 * Indonesian City-to-Province Mapping for GrosirPJ
 *
 * Comprehensive mapping of Indonesian cities/kabupaten to their provinces.
 * Used for shipping zone lookup and city search functionality.
 *
 * All 34 provinces are covered with major cities and kabupaten.
 */

export interface CityProvince {
  city: string;
  province: string;
}

// All 34 Indonesian provinces and their major cities/kabupaten
// Province names match exactly with the shipping zones used in GrosirPJ
export const CITY_PROVINCE_MAP: CityProvince[] = [
  // ========================
  // DKI Jakarta (6)
  // ========================
  { city: "Jakarta Pusat", province: "DKI Jakarta" },
  { city: "Jakarta Selatan", province: "DKI Jakarta" },
  { city: "Jakarta Barat", province: "DKI Jakarta" },
  { city: "Jakarta Timur", province: "DKI Jakarta" },
  { city: "Jakarta Utara", province: "DKI Jakarta" },
  { city: "Kepulauan Seribu", province: "DKI Jakarta" },

  // ========================
  // Jawa Barat (17)
  // ========================
  { city: "Bandung", province: "Jawa Barat" },
  { city: "Kota Bandung", province: "Jawa Barat" },
  { city: "Kab. Bandung", province: "Jawa Barat" },
  { city: "Bogor", province: "Jawa Barat" },
  { city: "Kota Bogor", province: "Jawa Barat" },
  { city: "Kab. Bogor", province: "Jawa Barat" },
  { city: "Bekasi", province: "Jawa Barat" },
  { city: "Kota Bekasi", province: "Jawa Barat" },
  { city: "Kab. Bekasi", province: "Jawa Barat" },
  { city: "Depok", province: "Jawa Barat" },
  { city: "Tasikmalaya", province: "Jawa Barat" },
  { city: "Kota Tasikmalaya", province: "Jawa Barat" },
  { city: "Cirebon", province: "Jawa Barat" },
  { city: "Kota Cirebon", province: "Jawa Barat" },
  { city: "Sukabumi", province: "Jawa Barat" },
  { city: "Garut", province: "Jawa Barat" },
  { city: "Subang", province: "Jawa Barat" },
  { city: "Karawang", province: "Jawa Barat" },
  { city: "Purwakarta", province: "Jawa Barat" },
  { city: "Cianjur", province: "Jawa Barat" },
  { city: "Sumedang", province: "Jawa Barat" },
  { city: "Majalengka", province: "Jawa Barat" },
  { city: "Kuningan", province: "Jawa Barat" },
  { city: "Indramayu", province: "Jawa Barat" },
  { city: "Pangandaran", province: "Jawa Barat" },
  { city: "Kab. Bandung Barat", province: "Jawa Barat" },
  { city: "Banjar", province: "Jawa Barat" },

  // ========================
  // Jawa Tengah (24)
  // ========================
  { city: "Semarang", province: "Jawa Tengah" },
  { city: "Kota Semarang", province: "Jawa Tengah" },
  { city: "Kab. Semarang", province: "Jawa Tengah" },
  { city: "Solo", province: "Jawa Tengah" },
  { city: "Surakarta", province: "Jawa Tengah" },
  { city: "Magelang", province: "Jawa Tengah" },
  { city: "Kota Magelang", province: "Jawa Tengah" },
  { city: "Pekalongan", province: "Jawa Tengah" },
  { city: "Kota Pekalongan", province: "Jawa Tengah" },
  { city: "Salatiga", province: "Jawa Tengah" },
  { city: "Kendal", province: "Jawa Tengah" },
  { city: "Demak", province: "Jawa Tengah" },
  { city: "Kudus", province: "Jawa Tengah" },
  { city: "Jepara", province: "Jawa Tengah" },
  { city: "Pati", province: "Jawa Tengah" },
  { city: "Rembang", province: "Jawa Tengah" },
  { city: "Blora", province: "Jawa Tengah" },
  { city: "Cilacap", province: "Jawa Tengah" },
  { city: "Banyumas", province: "Jawa Tengah" },
  { city: "Purwokerto", province: "Jawa Tengah" },
  { city: "Tegal", province: "Jawa Tengah" },
  { city: "Kota Tegal", province: "Jawa Tengah" },
  { city: "Brebes", province: "Jawa Tengah" },
  { city: "Klaten", province: "Jawa Tengah" },
  { city: "Boyolali", province: "Jawa Tengah" },
  { city: "Karanganyar", province: "Jawa Tengah" },
  { city: "Wonogiri", province: "Jawa Tengah" },
  { city: "Sukoharjo", province: "Jawa Tengah" },
  { city: "Wonosobo", province: "Jawa Tengah" },
  { city: "Temanggung", province: "Jawa Tengah" },
  { city: "Batang", province: "Jawa Tengah" },
  { city: "Pemalang", province: "Jawa Tengah" },
  { city: "Bumiayu", province: "Jawa Tengah" },

  // ========================
  // DI Yogyakarta (5)
  // ========================
  { city: "Yogyakarta", province: "DI Yogyakarta" },
  { city: "Kota Yogyakarta", province: "DI Yogyakarta" },
  { city: "Sleman", province: "DI Yogyakarta" },
  { city: "Bantul", province: "DI Yogyakarta" },
  { city: "Gunung Kidul", province: "DI Yogyakarta" },
  { city: "Kulon Progo", province: "DI Yogyakarta" },

  // ========================
  // Jawa Timur (24)
  // ========================
  { city: "Surabaya", province: "Jawa Timur" },
  { city: "Malang", province: "Jawa Timur" },
  { city: "Kota Malang", province: "Jawa Timur" },
  { city: "Kab. Malang", province: "Jawa Timur" },
  { city: "Sidoarjo", province: "Jawa Timur" },
  { city: "Gresik", province: "Jawa Timur" },
  { city: "Kediri", province: "Jawa Timur" },
  { city: "Kota Kediri", province: "Jawa Timur" },
  { city: "Blitar", province: "Jawa Timur" },
  { city: "Tulungagung", province: "Jawa Timur" },
  { city: "Jember", province: "Jawa Timur" },
  { city: "Bondowoso", province: "Jawa Timur" },
  { city: "Situbondo", province: "Jawa Timur" },
  { city: "Banyuwangi", province: "Jawa Timur" },
  { city: "Pasuruan", province: "Jawa Timur" },
  { city: "Kota Pasuruan", province: "Jawa Timur" },
  { city: "Probolinggo", province: "Jawa Timur" },
  { city: "Kota Probolinggo", province: "Jawa Timur" },
  { city: "Lumajang", province: "Jawa Timur" },
  { city: "Madiun", province: "Jawa Timur" },
  { city: "Kota Madiun", province: "Jawa Timur" },
  { city: "Magetan", province: "Jawa Timur" },
  { city: "Nganjuk", province: "Jawa Timur" },
  { city: "Ponorogo", province: "Jawa Timur" },
  { city: "Pacitan", province: "Jawa Timur" },
  { city: "Tuban", province: "Jawa Timur" },
  { city: "Bojonegoro", province: "Jawa Timur" },
  { city: "Lamongan", province: "Jawa Timur" },
  { city: "Mojokerto", province: "Jawa Timur" },
  { city: "Jombang", province: "Jawa Timur" },
  { city: "Ngawi", province: "Jawa Timur" },
  { city: "Trenggalek", province: "Jawa Timur" },

  // ========================
  // Aceh (8)
  // ========================
  { city: "Banda Aceh", province: "Aceh" },
  { city: "Sabang", province: "Aceh" },
  { city: "Lhokseumawe", province: "Aceh" },
  { city: "Langsa", province: "Aceh" },
  { city: "Aceh Besar", province: "Aceh" },
  { city: "Aceh Utara", province: "Aceh" },
  { city: "Aceh Selatan", province: "Aceh" },
  { city: "Aceh Timur", province: "Aceh" },
  { city: "Aceh Barat", province: "Aceh" },
  { city: "Sigli", province: "Aceh" },
  { city: "Meulaboh", province: "Aceh" },
  { city: "Kutacane", province: "Aceh" },
  { city: "Subulussalam", province: "Aceh" },
  { city: "Calang", province: "Aceh" },

  // ========================
  // Sumatera Utara (9)
  // ========================
  { city: "Medan", province: "Sumatera Utara" },
  { city: "Kota Medan", province: "Sumatera Utara" },
  { city: "Binjai", province: "Sumatera Utara" },
  { city: "Pematangsiantar", province: "Sumatera Utara" },
  { city: "Tebing Tinggi", province: "Sumatera Utara" },
  { city: "Tanjungbalai", province: "Sumatera Utara" },
  { city: "Sibolga", province: "Sumatera Utara" },
  { city: "Padang Sidempuan", province: "Sumatera Utara" },
  { city: "Deli Serdang", province: "Sumatera Utara" },
  { city: "Langkat", province: "Sumatera Utara" },
  { city: "Serdang Bedagai", province: "Sumatera Utara" },
  { city: "Karo", province: "Sumatera Utara" },
  { city: "Asahan", province: "Sumatera Utara" },
  { city: "Labuhanbatu", province: "Sumatera Utara" },

  // ========================
  // Sumatera Barat (8)
  // ========================
  { city: "Padang", province: "Sumatera Barat" },
  { city: "Kota Padang", province: "Sumatera Barat" },
  { city: "Bukittinggi", province: "Sumatera Barat" },
  { city: "Payakumbuh", province: "Sumatera Barat" },
  { city: "Pariaman", province: "Sumatera Barat" },
  { city: "Solok", province: "Sumatera Barat" },
  { city: "Kota Solok", province: "Sumatera Barat" },
  { city: "Sawahlunto", province: "Sumatera Barat" },
  { city: "Padang Panjang", province: "Sumatera Barat" },
  { city: "Agam", province: "Sumatera Barat" },
  { city: "Tanah Datar", province: "Sumatera Barat" },
  { city: "Pasaman", province: "Sumatera Barat" },
  { city: "Pesisir Selatan", province: "Sumatera Barat" },

  // ========================
  // Riau (8)
  // ========================
  { city: "Pekanbaru", province: "Riau" },
  { city: "Kota Pekanbaru", province: "Riau" },
  { city: "Dumai", province: "Riau" },
  { city: "Bengkalis", province: "Riau" },
  { city: "Kampar", province: "Riau" },
  { city: "Rokan Hulu", province: "Riau" },
  { city: "Rokan Hilir", province: "Riau" },
  { city: "Siak", province: "Riau" },
  { city: "Pelalawan", province: "Riau" },
  { city: "Indragiri Hilir", province: "Riau" },
  { city: "Indragiri Hulu", province: "Riau" },
  { city: "Kuantan Singingi", province: "Riau" },

  // ========================
  // Kepulauan Riau (7)
  // ========================
  { city: "Batam", province: "Kepulauan Riau" },
  { city: "Kota Batam", province: "Kepulauan Riau" },
  { city: "Tanjung Pinang", province: "Kepulauan Riau" },
  { city: "Bintan", province: "Kepulauan Riau" },
  { city: "Karimun", province: "Kepulauan Riau" },
  { city: "Lingga", province: "Kepulauan Riau" },
  { city: "Natuna", province: "Kepulauan Riau" },

  // ========================
  // Jambi (7)
  // ========================
  { city: "Jambi", province: "Jambi" },
  { city: "Kota Jambi", province: "Jambi" },
  { city: "Muaro Jambi", province: "Jambi" },
  { city: "Batanghari", province: "Jambi" },
  { city: "Tanjung Jabung Barat", province: "Jambi" },
  { city: "Tanjung Jabung Timur", province: "Jambi" },
  { city: "Bungo", province: "Jambi" },
  { city: "Tebo", province: "Jambi" },
  { city: "Merangin", province: "Jambi" },
  { city: "Sarolangun", province: "Jambi" },
  { city: "Kerinci", province: "Jambi" },

  // ========================
  // Sumatera Selatan (8)
  // ========================
  { city: "Palembang", province: "Sumatera Selatan" },
  { city: "Kota Palembang", province: "Sumatera Selatan" },
  { city: "Prabumulih", province: "Sumatera Selatan" },
  { city: "Lubuklinggau", province: "Sumatera Selatan" },
  { city: "Pagar Alam", province: "Sumatera Selatan" },
  { city: "Banyuasin", province: "Sumatera Selatan" },
  { city: "Ogan Ilir", province: "Sumatera Selatan" },
  { city: "Ogan Komering Ulu", province: "Sumatera Selatan" },
  { city: "Ogan Komering Ilir", province: "Sumatera Selatan" },
  { city: "Muara Enim", province: "Sumatera Selatan" },
  { city: "Lahat", province: "Sumatera Selatan" },
  { city: "Musi Banyuasin", province: "Sumatera Selatan" },
  { city: "Musi Rawas", province: "Sumatera Selatan" },
  { city: "Kayu Agung", province: "Sumatera Selatan" },

  // ========================
  // Bangka Belitung (6)
  // ========================
  { city: "Pangkal Pinang", province: "Bangka Belitung" },
  { city: "Kota Pangkal Pinang", province: "Bangka Belitung" },
  { city: "Bangka", province: "Bangka Belitung" },
  { city: "Belitung", province: "Bangka Belitung" },
  { city: "Bangka Barat", province: "Bangka Belitung" },
  { city: "Bangka Selatan", province: "Bangka Belitung" },
  { city: "Belitung Timur", province: "Bangka Belitung" },
  { city: "Sungailiat", province: "Bangka Belitung" },
  { city: "Tanjung Pandan", province: "Bangka Belitung" },

  // ========================
  // Bengkulu (6)
  // ========================
  { city: "Bengkulu", province: "Bengkulu" },
  { city: "Kota Bengkulu", province: "Bengkulu" },
  { city: "Rejang Lebong", province: "Bengkulu" },
  { city: "Lebong", province: "Bengkulu" },
  { city: "Kepahiang", province: "Bengkulu" },
  { city: "Bengkulu Utara", province: "Bengkulu" },
  { city: "Bengkulu Selatan", province: "Bengkulu" },
  { city: "Seluma", province: "Bengkulu" },
  { city: "Curup", province: "Bengkulu" },
  { city: "Arga Makmur", province: "Bengkulu" },

  // ========================
  // Lampung (8)
  // ========================
  { city: "Bandar Lampung", province: "Lampung" },
  { city: "Kota Bandar Lampung", province: "Lampung" },
  { city: "Metro", province: "Lampung" },
  { city: "Lampung Tengah", province: "Lampung" },
  { city: "Lampung Selatan", province: "Lampung" },
  { city: "Lampung Utara", province: "Lampung" },
  { city: "Lampung Timur", province: "Lampung" },
  { city: "Lampung Barat", province: "Lampung" },
  { city: "Way Kanan", province: "Lampung" },
  { city: "Tulang Bawang", province: "Lampung" },
  { city: "Pesawaran", province: "Lampung" },
  { city: "Pringsewu", province: "Lampung" },
  { city: "Tanggamus", province: "Lampung" },

  // ========================
  // Bali (9)
  // ========================
  { city: "Denpasar", province: "Bali" },
  { city: "Badung", province: "Bali" },
  { city: "Gianyar", province: "Bali" },
  { city: "Tabanan", province: "Bali" },
  { city: "Buleleng", province: "Bali" },
  { city: "Singaraja", province: "Bali" },
  { city: "Karangasem", province: "Bali" },
  { city: "Klungkung", province: "Bali" },
  { city: "Bangli", province: "Bali" },
  { city: "Jembrana", province: "Bali" },
  { city: "Negara", province: "Bali" },
  { city: "Negara Jembrana", province: "Bali" },
  { city: "Ubud", province: "Bali" },
  { city: "Kuta", province: "Bali" },
  { city: "Sanur", province: "Bali" },

  // ========================
  // Nusa Tenggara Barat (8)
  // ========================
  { city: "Mataram", province: "Nusa Tenggara Barat" },
  { city: "Bima", province: "Nusa Tenggara Barat" },
  { city: "Kota Bima", province: "Nusa Tenggara Barat" },
  { city: "Lombok Barat", province: "Nusa Tenggara Barat" },
  { city: "Lombok Timur", province: "Nusa Tenggara Barat" },
  { city: "Lombok Tengah", province: "Nusa Tenggara Barat" },
  { city: "Lombok Utara", province: "Nusa Tenggara Barat" },
  { city: "Sumbawa", province: "Nusa Tenggara Barat" },
  { city: "Sumbawa Besar", province: "Nusa Tenggara Barat" },
  { city: "Dompu", province: "Nusa Tenggara Barat" },
  { city: "Praya", province: "Nusa Tenggara Barat" },

  // ========================
  // Nusa Tenggara Timur (8)
  // ========================
  { city: "Kupang", province: "Nusa Tenggara Timur" },
  { city: "Kota Kupang", province: "Nusa Tenggara Timur" },
  { city: "Ende", province: "Nusa Tenggara Timur" },
  { city: "Maumere", province: "Nusa Tenggara Timur" },
  { city: "Ruteng", province: "Nusa Tenggara Timur" },
  { city: "Bajawa", province: "Nusa Tenggara Timur" },
  { city: "Larantuka", province: "Nusa Tenggara Timur" },
  { city: "Waingapu", province: "Nusa Tenggara Timur" },
  { city: "Atambua", province: "Nusa Tenggara Timur" },
  { city: "Kefamenanu", province: "Nusa Tenggara Timur" },
  { city: "Labuan Bajo", province: "Nusa Tenggara Timur" },
  { city: "Flores Timur", province: "Nusa Tenggara Timur" },
  { city: "Sikka", province: "Nusa Tenggara Timur" },
  { city: "Manggarai", province: "Nusa Tenggara Timur" },

  // ========================
  // Kalimantan Barat (8)
  // ========================
  { city: "Pontianak", province: "Kalimantan Barat" },
  { city: "Kota Pontianak", province: "Kalimantan Barat" },
  { city: "Singkawang", province: "Kalimantan Barat" },
  { city: "Ketapang", province: "Kalimantan Barat" },
  { city: "Sambas", province: "Kalimantan Barat" },
  { city: "Bengkayang", province: "Kalimantan Barat" },
  { city: "Landak", province: "Kalimantan Barat" },
  { city: "Mempawah", province: "Kalimantan Barat" },
  { city: "Sanggau", province: "Kalimantan Barat" },
  { city: "Sekadau", province: "Kalimantan Barat" },
  { city: "Sintang", province: "Kalimantan Barat" },
  { city: "Kapuas Hulu", province: "Kalimantan Barat" },

  // ========================
  // Kalimantan Tengah (7)
  // ========================
  { city: "Palangka Raya", province: "Kalimantan Tengah" },
  { city: "Kota Palangka Raya", province: "Kalimantan Tengah" },
  { city: "Kapuas", province: "Kalimantan Tengah" },
  { city: "Barito Selatan", province: "Kalimantan Tengah" },
  { city: "Barito Utara", province: "Kalimantan Tengah" },
  { city: "Barito Timur", province: "Kalimantan Tengah" },
  { city: "Murung Raya", province: "Kalimantan Tengah" },
  { city: "Pulang Pisau", province: "Kalimantan Tengah" },
  { city: "Gunung Mas", province: "Kalimantan Tengah" },
  { city: "Katingan", province: "Kalimantan Tengah" },
  { city: "Seruyan", province: "Kalimantan Tengah" },
  { city: "Sukamara", province: "Kalimantan Tengah" },
  { city: "Kotawaringin Barat", province: "Kalimantan Tengah" },
  { city: "Kotawaringin Timur", province: "Kalimantan Tengah" },

  // ========================
  // Kalimantan Selatan (8)
  // ========================
  { city: "Banjarmasin", province: "Kalimantan Selatan" },
  { city: "Kota Banjarmasin", province: "Kalimantan Selatan" },
  { city: "Banjarbaru", province: "Kalimantan Selatan" },
  { city: "Kota Banjarbaru", province: "Kalimantan Selatan" },
  { city: "Kab. Banjar", province: "Kalimantan Selatan" },
  { city: "Martapura", province: "Kalimantan Selatan" },
  { city: "Tanah Laut", province: "Kalimantan Selatan" },
  { city: "Kotabaru", province: "Kalimantan Selatan" },
  { city: "Hulu Sungai Selatan", province: "Kalimantan Selatan" },
  { city: "Hulu Sungai Utara", province: "Kalimantan Selatan" },
  { city: "Hulu Sungai Tengah", province: "Kalimantan Selatan" },
  { city: "Balangan", province: "Kalimantan Selatan" },
  { city: "Tabalong", province: "Kalimantan Selatan" },
  { city: "Kandangan", province: "Kalimantan Selatan" },

  // ========================
  // Kalimantan Timur (8)
  // ========================
  { city: "Samarinda", province: "Kalimantan Timur" },
  { city: "Kota Samarinda", province: "Kalimantan Timur" },
  { city: "Balikpapan", province: "Kalimantan Timur" },
  { city: "Kota Balikpapan", province: "Kalimantan Timur" },
  { city: "Tenggarong", province: "Kalimantan Timur" },
  { city: "Kutai Kartanegara", province: "Kalimantan Timur" },
  { city: "Kutai Barat", province: "Kalimantan Timur" },
  { city: "Kutai Timur", province: "Kalimantan Timur" },
  { city: "Bontang", province: "Kalimantan Timur" },
  { city: "Berau", province: "Kalimantan Timur" },
  { city: "Penajam Paser Utara", province: "Kalimantan Timur" },
  { city: "Paser", province: "Kalimantan Timur" },
  { city: "Mahakam Ulu", province: "Kalimantan Timur" },

  // ========================
  // Kalimantan Utara (5)
  // ========================
  { city: "Tarakan", province: "Kalimantan Utara" },
  { city: "Kota Tarakan", province: "Kalimantan Utara" },
  { city: "Nunukan", province: "Kalimantan Utara" },
  { city: "Malinau", province: "Kalimantan Utara" },
  { city: "Bulungan", province: "Kalimantan Utara" },
  { city: "Tana Tidung", province: "Kalimantan Utara" },
  { city: "Tanjung Selor", province: "Kalimantan Utara" },

  // ========================
  // Sulawesi Utara (7)
  // ========================
  { city: "Manado", province: "Sulawesi Utara" },
  { city: "Kota Manado", province: "Sulawesi Utara" },
  { city: "Bitung", province: "Sulawesi Utara" },
  { city: "Tomohon", province: "Sulawesi Utara" },
  { city: "Kotamobagu", province: "Sulawesi Utara" },
  { city: "Minahasa", province: "Sulawesi Utara" },
  { city: "Minahasa Utara", province: "Sulawesi Utara" },
  { city: "Minahasa Selatan", province: "Sulawesi Utara" },
  { city: "Bolaang Mongondow", province: "Sulawesi Utara" },
  { city: "Bolaang Mongondow Utara", province: "Sulawesi Utara" },
  { city: "Kepulauan Sangihe", province: "Sulawesi Utara" },
  { city: "Kepulauan Talaud", province: "Sulawesi Utara" },

  // ========================
  // Gorontalo (6)
  // ========================
  { city: "Gorontalo", province: "Gorontalo" },
  { city: "Kota Gorontalo", province: "Gorontalo" },
  { city: "Gorontalo Utara", province: "Gorontalo" },
  { city: "Bone Bolango", province: "Gorontalo" },
  { city: "Boalemo", province: "Gorontalo" },
  { city: "Pohuwato", province: "Gorontalo" },
  { city: "Limboto", province: "Gorontalo" },

  // ========================
  // Sulawesi Tengah (7)
  // ========================
  { city: "Palu", province: "Sulawesi Tengah" },
  { city: "Kota Palu", province: "Sulawesi Tengah" },
  { city: "Donggala", province: "Sulawesi Tengah" },
  { city: "Poso", province: "Sulawesi Tengah" },
  { city: "Toli-Toli", province: "Sulawesi Tengah" },
  { city: "Parigi Moutong", province: "Sulawesi Tengah" },
  { city: "Tojo Una-Una", province: "Sulawesi Tengah" },
  { city: "Sigi", province: "Sulawesi Tengah" },
  { city: "Banggai", province: "Sulawesi Tengah" },
  { city: "Banggai Kepulauan", province: "Sulawesi Tengah" },
  { city: "Buol", province: "Sulawesi Tengah" },
  { city: "Morowali", province: "Sulawesi Tengah" },

  // ========================
  // Sulawesi Barat (5)
  // ========================
  { city: "Mamuju", province: "Sulawesi Barat" },
  { city: "Kota Mamuju", province: "Sulawesi Barat" },
  { city: "Majene", province: "Sulawesi Barat" },
  { city: "Mamuju Utara", province: "Sulawesi Barat" },
  { city: "Pasangkayu", province: "Sulawesi Barat" },
  { city: "Polman", province: "Sulawesi Barat" },
  { city: "Polewali Mandar", province: "Sulawesi Barat" },
  { city: "Mamuju Tengah", province: "Sulawesi Barat" },

  // ========================
  // Sulawesi Selatan (8)
  // ========================
  { city: "Makassar", province: "Sulawesi Selatan" },
  { city: "Kota Makassar", province: "Sulawesi Selatan" },
  { city: "Gowa", province: "Sulawesi Selatan" },
  { city: "Takalar", province: "Sulawesi Selatan" },
  { city: "Jeneponto", province: "Sulawesi Selatan" },
  { city: "Bantaeng", province: "Sulawesi Selatan" },
  { city: "Bulukumba", province: "Sulawesi Selatan" },
  { city: "Parepare", province: "Sulawesi Selatan" },
  { city: "Palopo", province: "Sulawesi Selatan" },
  { city: "Pangkajene Kepulauan", province: "Sulawesi Selatan" },
  { city: "Maros", province: "Sulawesi Selatan" },
  { city: "Bone", province: "Sulawesi Selatan" },
  { city: "Soppeng", province: "Sulawesi Selatan" },
  { city: "Wajo", province: "Sulawesi Selatan" },
  { city: "Sidrap", province: "Sulawesi Selatan" },
  { city: "Pinrang", province: "Sulawesi Selatan" },
  { city: "Enrekang", province: "Sulawesi Selatan" },
  { city: "Tana Toraja", province: "Sulawesi Selatan" },
  { city: "Luwu", province: "Sulawesi Selatan" },
  { city: "Luwu Utara", province: "Sulawesi Selatan" },
  { city: "Luwu Timur", province: "Sulawesi Selatan" },

  // ========================
  // Sulawesi Tenggara (7)
  // ========================
  { city: "Kendari", province: "Sulawesi Tenggara" },
  { city: "Kota Kendari", province: "Sulawesi Tenggara" },
  { city: "Konawe", province: "Sulawesi Tenggara" },
  { city: "Konawe Selatan", province: "Sulawesi Tenggara" },
  { city: "Baubau", province: "Sulawesi Tenggara" },
  { city: "Kolaka", province: "Sulawesi Tenggara" },
  { city: "Muna", province: "Sulawesi Tenggara" },
  { city: "Buton", province: "Sulawesi Tenggara" },
  { city: "Wakatobi", province: "Sulawesi Tenggara" },
  { city: "Konawe Utara", province: "Sulawesi Tenggara" },
  { city: "Konawe Kepulauan", province: "Sulawesi Tenggara" },
  { city: "Luwuk", province: "Sulawesi Tenggara" },

  // ========================
  // Maluku (6)
  // ========================
  { city: "Ambon", province: "Maluku" },
  { city: "Kota Ambon", province: "Maluku" },
  { city: "Tual", province: "Maluku" },
  { city: "Maluku Tengah", province: "Maluku" },
  { city: "Seram Bagian Barat", province: "Maluku" },
  { city: "Seram Bagian Timur", province: "Maluku" },
  { city: "Kepler Kepulauan", province: "Maluku" },
  { city: "Banda", province: "Maluku" },
  { city: "Saparua", province: "Maluku" },
  { city: "Masohi", province: "Maluku" },

  // ========================
  // Maluku Utara (6)
  // ========================
  { city: "Ternate", province: "Maluku Utara" },
  { city: "Kota Ternate", province: "Maluku Utara" },
  { city: "Tidore", province: "Maluku Utara" },
  { city: "Kota Tidore Kepulauan", province: "Maluku Utara" },
  { city: "Halmahera Barat", province: "Maluku Utara" },
  { city: "Halmahera Utara", province: "Maluku Utara" },
  { city: "Halmahera Selatan", province: "Maluku Utara" },
  { city: "Halmahera Timur", province: "Maluku Utara" },
  { city: "Halmahera Tengah", province: "Maluku Utara" },
  { city: "Kepulauan Sula", province: "Maluku Utara" },
  { city: "Pulau Morotai", province: "Maluku Utara" },

  // ========================
  // Papua (8)
  // ========================
  { city: "Jayapura", province: "Papua" },
  { city: "Kota Jayapura", province: "Papua" },
  { city: "Merauke", province: "Papua" },
  { city: "Nabire", province: "Papua" },
  { city: "Timika", province: "Papua" },
  { city: "Biak", province: "Papua" },
  { city: "Sentani", province: "Papua" },
  { city: "Sarmi", province: "Papua" },
  { city: "Keerom", province: "Papua" },
  { city: "Waropen", province: "Papua" },
  { city: "Mimika", province: "Papua" },
  { city: "Asmat", province: "Papua" },
  { city: "Yahukimo", province: "Papua" },
  { city: "Wamena", province: "Papua" },
  { city: "Paniai", province: "Papua" },
  { city: "Dogiyai", province: "Papua" },
  { city: "Intan Jaya", province: "Papua" },

  // ========================
  // Papua Barat (7)
  // ========================
  { city: "Sorong", province: "Papua Barat" },
  { city: "Kota Sorong", province: "Papua Barat" },
  { city: "Manokwari", province: "Papua Barat" },
  { city: "Fakfak", province: "Papua Barat" },
  { city: "Kaimana", province: "Papua Barat" },
  { city: "Teluk Bintuni", province: "Papua Barat" },
  { city: "Teluk Wondama", province: "Papua Barat" },
  { city: "Raja Ampat", province: "Papua Barat" },
  { city: "Pegunungan Arfak", province: "Papua Barat" },
  { city: "Sorong Selatan", province: "Papua Barat" },
  { city: "Maybrat", province: "Papua Barat" },
  { city: "Tambrauw", province: "Papua Barat" },
];

/**
 * Normalize a city name by removing common Indonesian prefixes
 * for search matching purposes.
 *
 * Examples:
 *   "Kota Bandung" → "Bandung"
 *   "Kab. Bandung" → "Bandung"
 *   "Bandung"      → "Bandung" (unchanged)
 */
function normalizeCityName(name: string): string {
  return name
    .replace(/^Kota\s+/i, "")
    .replace(/^Kab\.\s*/i, "")
    .replace(/^Kabupaten\s+/i, "")
    .replace(/^Kab\s+/i, "")
    .trim();
}

/**
 * Search cities by query string.
 *
 * Features:
 * - Case-insensitive matching
 * - Matches city name OR province name
 * - Removes common prefixes for matching (e.g., "Kota Bandung" matches "Bandung")
 * - Sorts results: exact matches first, then city matches, then province matches
 * - Returns unique results (deduplicated by city+province combo)
 *
 * @param query - Search query string
 * @param limit - Maximum number of results to return (default: 20)
 * @returns Array of matching CityProvince objects
 */
export function searchCities(query: string, limit = 20): CityProvince[] {
  if (!query || query.trim().length === 0) return [];

  const normalizedQuery = query.trim().toLowerCase();
  const seen = new Set<string>();
  const results: { entry: CityProvince; priority: number }[] = [];

  for (const entry of CITY_PROVINCE_MAP) {
    // Dedup key: city + province combination
    const dedupKey = `${entry.city}|${entry.province}`;
    if (seen.has(dedupKey)) continue;

    const cityLower = entry.city.toLowerCase();
    const provinceLower = entry.province.toLowerCase();
    const normalizedCity = normalizeCityName(entry.city).toLowerCase();

    // Priority 0: Exact match on city name (highest priority)
    if (
      cityLower === normalizedQuery ||
      normalizedCity === normalizedQuery
    ) {
      seen.add(dedupKey);
      results.push({ entry, priority: 0 });
      continue;
    }

    // Priority 1: City name starts with query
    if (
      cityLower.startsWith(normalizedQuery) ||
      normalizedCity.startsWith(normalizedQuery)
    ) {
      seen.add(dedupKey);
      results.push({ entry, priority: 1 });
      continue;
    }

    // Priority 2: Province name starts with query
    // (ranked above city-contains so searching "Jawa" shows Jawa province cities before "Bajawa")
    if (provinceLower.startsWith(normalizedQuery)) {
      seen.add(dedupKey);
      results.push({ entry, priority: 2 });
      continue;
    }

    // Priority 3: City name contains query (but doesn't start with it)
    if (
      cityLower.includes(normalizedQuery) ||
      normalizedCity.includes(normalizedQuery)
    ) {
      seen.add(dedupKey);
      results.push({ entry, priority: 3 });
      continue;
    }

    // Priority 4: Province name contains query (but doesn't start with it)
    if (provinceLower.includes(normalizedQuery)) {
      seen.add(dedupKey);
      results.push({ entry, priority: 4 });
      continue;
    }
  }

  // Sort by priority (lower number = higher priority), then alphabetically by city
  results.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return a.entry.city.localeCompare(b.entry.city);
  });

  return results.slice(0, limit).map((r) => r.entry);
}

/**
 * Get the province for a given city name.
 * Returns the province name or null if not found.
 *
 * Handles common prefix variations (Kota, Kab., etc.)
 */
export function getProvinceForCity(cityName: string): string | null {
  if (!cityName) return null;

  const normalizedInput = normalizeCityName(cityName).toLowerCase();

  for (const entry of CITY_PROVINCE_MAP) {
    const normalizedEntry = normalizeCityName(entry.city).toLowerCase();
    if (normalizedEntry === normalizedInput) {
      return entry.province;
    }
  }

  // Fallback: try direct match without normalization
  const directMatch = CITY_PROVINCE_MAP.find(
    (entry) => entry.city.toLowerCase() === cityName.toLowerCase()
  );
  return directMatch?.province ?? null;
}

/**
 * Get all cities for a given province name.
 * Returns an array of city names.
 */
export function getCitiesForProvince(provinceName: string): string[] {
  if (!provinceName) return [];

  return CITY_PROVINCE_MAP.filter(
    (entry) => entry.province.toLowerCase() === provinceName.toLowerCase()
  ).map((entry) => entry.city);
}

/**
 * Get all unique province names from the map.
 * Useful for populating province dropdowns.
 */
export function getAllProvinces(): string[] {
  const provinces = new Set(CITY_PROVINCE_MAP.map((entry) => entry.province));
  return Array.from(provinces).sort();
}
