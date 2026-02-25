::: {align="center"}
```{=html}
<h1>
```
🚀 Gelişmiş Discord Karşılama Botu (Welcome Bot)
```{=html}
</h1>
```
```{=html}
<p>
```
Discord.js v14, Mongoose ve @napi-rs/canvas ile geliştirilmiş,
interaktif yönetim paneline sahip yüksek performanslı karşılama sistemi.
```{=html}
</p>
```
:::

------------------------------------------------------------------------

## ✨ Özellikler

Bu proje, standart bir karşılama botundan çok daha fazlasını sunar.
Kurumsal seviyede kodlanmış olup büyük sunucularda (10K+ üye) bile sıfır
gecikme ile çalışacak şekilde optimize edilmiştir.

### 🎛️ İnteraktif Yönetim Paneli (Dashboard)

Ayarları ezberlemek yok! `/welcome-setup` komutu ile butonlu, menülü ve
modallı şık bir arayüzden tüm botu yönetin.

### ⚡ Ultra Hızlı Canvas (@napi-rs/canvas)

C++ bağımlılıkları gerektirmeyen, Rust tabanlı şimşek hızında resim
oluşturma motoru.

### 🚦 İşlem Kuyruğu (Queue System)

Sunucuya aynı anda 100 kişi girse bile bot çökmez. Resim çizimlerini
kuyruğa alarak Node.js Event Loop'unu korur.

### 💾 RAM Dostu Caching

Her üyede veritabanına istek atmak yerine önbellek sistemi kullanır.

### 🛡️ Gelişmiş Güvenlik

Fake hesapları (yeni açılmış hesaplar) tespit eder ve otomatik
Kick/Timeout işlemi uygular. Log kanalına bildirir.

### 🌍 Çoklu Dil Desteği (i18n)

Hata ve uyarı mesajlarını Türkçe ve İngilizce olarak dinamik ayarlar.

### 🎨 Tamamen Özelleştirilebilir

Özel arka plan (URL), dinamik HEX tema renkleri ve Webhook (Premium
Görünüm) desteği.

------------------------------------------------------------------------

## 🛠️ Kurulum

### Gereksinimler

-   Node.js (v20 veya üzeri)
-   MongoDB Bağlantı URL'si (Cluster)
-   Discord Geliştirici Portalından alınmış Bot Token'ı

------------------------------------------------------------------------

### 1️⃣ Projeyi Klonlayın

``` bash
git clone https://github.com/KULLANICI_ADIN/PROJE_ADI.git
cd PROJE_ADI
```

------------------------------------------------------------------------

### 2️⃣ Gerekli Paketleri Yükleyin

``` bash
npm install
```

------------------------------------------------------------------------

### 3️⃣ Çevresel Değişkenleri Ayarlayın

Ana dizinde bir `.env` dosyası oluşturun ve içerisine şunları yazın:

``` env
TOKEN=sizin_bot_tokeniniz
MONGO_URI=mongodb+srv://kullanici:sifre@cluster...
CLIENT_ID=botunuzun_id_numarasi
```

------------------------------------------------------------------------

### 4️⃣ Özel Fontu Ekleyin (Opsiyonel ama Önerilir)

Ana dizinde şu klasörü oluşturun:

assets/fonts/

İçine `Poppins-Bold.ttf` dosyasını ekleyin.

------------------------------------------------------------------------

### 5️⃣ Slash Komutlarını Yükleyin

Sadece ilk kurulumda veya komut güncellemelerinde bir kez çalıştırın:

``` bash
node src/deploy-commands.js
```

------------------------------------------------------------------------

### 6️⃣ Botu Başlatın

``` bash
node src/index.js
```

------------------------------------------------------------------------

## 📂 Dosya Yapısı

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

------------------------------------------------------------------------

## 🤝 Katkıda Bulunma

Pull Request'ler (PR) her zaman kabul edilir. Büyük değişiklikler
yapmadan önce lütfen ne değiştirmek istediğinizi tartışmak için bir
"Issue" açın.

------------------------------------------------------------------------

## 📄 Lisans

Bu proje MIT Lisansı ile lisanslanmıştır. Dilediğiniz gibi kullanabilir,
geliştirebilir ve paylaşabilirsiniz.
