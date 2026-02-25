<div align="center">
<h1>🚀 Gelişmiş Discord Karşılama Botu (Welcome Bot)</h1>
<p>Discord.js v14, Mongoose ve @napi-rs/canvas ile geliştirilmiş, interaktif yönetim paneline sahip yüksek performanslı karşılama sistemi.</p>

<img src="https://www.google.com/search?q=https://img.shields.io/badge/Discord.js-v14-blue%3Fstyle%3Dfor-the-badge%26logo%3Ddiscord" alt="Discord.js">
<img src="https://www.google.com/search?q=https://img.shields.io/badge/Node.js-20%2B-green%3Fstyle%3Dfor-the-badge%26logo%3Dnode.js" alt="Node.js">
<img src="https://www.google.com/search?q=https://img.shields.io/badge/MongoDB-Database-47A248%3Fstyle%3Dfor-the-badge%26logo%3Dmongodb" alt="MongoDB">
<img src="https://www.google.com/search?q=https://img.shields.io/badge/License-MIT-yellow%3Fstyle%3Dfor-the-badge" alt="License">
</div>

✨ Özellikler

Bu proje, standart bir karşılama botundan çok daha fazlasını sunar. Kurumsal seviyede kodlanmış olup büyük sunucularda (10K+ üye) bile sıfır gecikme ile çalışacak şekilde optimize edilmiştir.

🎛️ İnteraktif Yönetim Paneli (Dashboard): Ayarları ezberlemek yok! /welcome-setup komutu ile butonlu, menülü ve modallı şık bir arayüzden tüm botu yönetin.

⚡ Ultra Hızlı Canvas (@napi-rs/canvas): C++ bağımlılıkları gerektirmeyen, Rust tabanlı şimşek hızında resim oluşturma motoru.

🚦 İşlem Kuyruğu (Queue System): Sunucuya aynı anda 100 kişi girse bile bot çökmez; resim çizimlerini kuyruğa alarak Node.js Event Loop'unu korur.

💾 RAM Dostu Caching: Her üyede veritabanına istek atmak yerine önbellek sistemi kullanır.

🛡️ Gelişmiş Güvenlik: Fake hesapları (yeni açılmış hesaplar) tespit eder ve otomatik Kick/Timeout işlemi uygular. Log kanalına bildirir.

🌍 Çoklu Dil Desteği (i18n): Hata ve uyarı mesajlarını Türkçe ve İngilizce olarak dinamik ayarlar.

🎨 Tamamen Özelleştirilebilir: Özel arka plan (URL), dinamik HEX tema renkleri ve Webhook (Premium Görünüm) desteği.

🛠️ Kurulum

Gereksinimler

Node.js (v20 veya üzeri)

MongoDB Bağlantı URL'si (Cluster)

Discord Geliştirici Portalından alınmış Bot Token'ı

Adımlar

1. Projeyi Klonlayın:

git clone [https://github.com/KULLANICI_ADIN/PROJE_ADI.git](https://github.com/KULLANICI_ADIN/PROJE_ADI.git)
cd PROJE_ADI


2. Gerekli Paketleri Yükleyin:

npm install


3. Çevresel Değişkenleri Ayarlayın:
Ana dizinde bir .env dosyası oluşturun ve içerisine şunları yazın:

TOKEN=sizin_bot_tokeniniz
MONGO_URI=mongodb+srv://kullanici:sifre@cluster...
CLIENT_ID=botunuzun_id_numarasi


4. Özel Fontu Ekleyin (Opsiyonel ama Önerilir):
Daha şık bir görünüm için ana dizine assets/fonts/ klasörü açıp içine Poppins-Bold.ttf dosyasını ekleyin.

5. Slash Komutlarını Yükleyin:
Sadece ilk kurulumda veya komut güncellemelerinde bir kez çalıştırın:

node src/deploy-commands.js


6. Botu Başlatın:

node src/index.js


📂 Dosya Yapısı

├── assets/
│   └── fonts/             # Özel .ttf font dosyaları
├── src/
│   ├── commands/          # Slash komutları (Yönetim Paneli)
│   ├── events/            # Discord.js Eventleri (Giriş/Çıkış)
│   ├── locales/           # Dil dosyaları (tr.json, en.json)
│   ├── models/            # Mongoose Veritabanı Şemaları
│   ├── utils/             # Canvas, Cache, Dil ve Kuyruk Fonksiyonları
│   ├── deploy-commands.js # Komut yükleyici
│   └── index.js           # Ana başlatıcı
├── .env                   # Gizli ayarlar (GitHub'a yüklenmez!)
├── .gitignore             # Git tarafından yoksayılacaklar
├── package.json           # Proje bağımlılıkları
└── README.md              # Bu dosya


🤝 Katkıda Bulunma

Pull Request'ler (PR) her zaman kabul edilir! Büyük değişiklikler yapmadan önce lütfen ne değiştirmek istediğinizi tartışmak için bir "Issue" açın.

📄 Lisans

Bu proje MIT Lisansı ile lisanslanmıştır. Dilediğiniz gibi kullanabilir, geliştirebilir ve paylaşabilirsiniz.
