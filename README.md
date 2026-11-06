# 🌿 Kır Bahçesi Çeviri (Cottagecore Çeviri Uygulaması)

Google Gemini API ile güçlendirilmiş, huzurlu yeşil cottagecore temalı, arka planda orman ambiyansı çalan makine çevirisi web uygulaması.

---

## ✨ Özellikler

- **Dil Seçenekleri:** İngilizce, Türkçe, Almanca, Fransızca, İspanyolca, İtalyanca, Rusça, Japonca, Arapça veya Otomatik Dil Algılama.
- **Alan (Domain) Seçimi:**
  - 🌾 Genel (Standart)
  - 📜 Hukuk & Sözleşme
  - 🌿 Tıp & Sağlık
  - ⚙️ Teknik & Bilişim
  - 📖 Edebi & Sanatsal
- **Üslup (Tone) Seçimi:**
  - 🎩 Resmi (Siz Dili)
  - ☕ Gündelik (Samimi, Sen Dili)
- **Zorunlu Terimce (Glossary):**
  - Her satıra `kaynak terim = hedef terim` formatında özel terimler ekleyebilirsiniz. Model bu terimleri çeviride tavizsiz ve tutarlı kullanır.
- **Yalnızca Çeviri Çıktısı:**
  - "İşte çeviri", tırnak işaretleri veya gereksiz açıklamalar içermez; doğrudan ham çeviri metnini üretir.
- **Tek Tıkla Kopyalama:** Çeviriyi anında panoya kopyalayabilme.
- **Orman Ambiyansı:**
  - Web Audio API ile harici dosya indirme gerektirmeksizin tarayıcınızda canlı sentezlenen rüzgar, ağaç yaprakları hışırtısı ve kuş sesleri.
  - Sesi duraklatma/başlatma ve ses düzeyi ayarı mevcuttur.
- **Mobil Uyumlu (Responsive):** Telefonlarda ve tabletlerde rahat kullanım için tek sütuna optimize edilen esnek tasarım.
- **Açıklayıcı Türkçe Hatalar:** Geçersiz API anahtarı, kota aşımı (429) veya internet kesintilerinde kullanıcıya ne yapması gerektiğini bildiren mesajlar.

---

## 🚀 Adım Adım Kurulum ve Çalıştırma Rehberi

Yeni başlayanlar için adım adım çalıştırma:

### 1. Adım: Bağımlılıkları Yükleme
Terminali veya Komut İstemi'ni (CMD / PowerShell) bu proje klasöründe açın ve şu komutu girin:
```bash
npm install
```
*(Bağımlılıklar zaten kurulduysa bu adımı atlayabilirsiniz.)*

---

### 2. Adım: Gemini API Anahtarını Tanımlama
1. Proje ana klasöründeki `.env` dosyasını bir metin düzenleyiciyle açın.
2. [Google AI Studio](https://aistudio.google.com/app/apikey) adresinden ücretsiz edinebileceğiniz API anahtarınızı `GEMINI_API_KEY=` ifadesinin hemen sağına yapıştırın.

Örnek `.env` içeriği:
```env
GEMINI_API_KEY=AIzaSyD-ornek-anahtariniz-buraya-gelecek
PORT=3000
```
> **Önemli:** API anahtarınızın başında veya sonunda boşluk ya da tırnak işareti (`"`) olmamasına dikkat edin. Dosyayı kaydedip kapatın.

---

### 3. Adım: Uygulamayı Başlatma
Terminalde şu komutu çalıştırın:
```bash
npm start
```

Konsolda şu mesajı göreceksiniz:
```text
🌿 Cottagecore Çeviri Sunucusu hazır: http://localhost:3000
```

---

### 4. Adım: Tarayıcıda Açma
Tarayıcınızı (Chrome, Edge, Firefox vb.) açın ve adres çubuğuna şunu yazın:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## ⌨️ İpuçları
- **Hızlı Çeviri:** Metin kutusundayken `Ctrl + Enter` (veya Mac'te `Cmd + Enter`) tuşlarına basarak fareye dokunmadan hızlıca çeviri yapabilirsiniz.
- **Orman Sesi:** Tarayıcıların güvenlik politikası gereği ses sayfaya ilk tıklandığı anda çalmaya başlar; üst çubuktan dilediğiniz zaman duraklatabilir veya sesini kısabilirsiniz.

