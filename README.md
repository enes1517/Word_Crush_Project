# 🧩 Word Crush - Kapsamlı Mobil Bulmaca Oyunu (Yazlab 2 - Proje 3)

Word Crush, harfleri birleştirerek kelimeler türettiğiniz; kombolar, market mekanikleri, özel güçler ve yerçekimi simülasyonu içeren, **CQRS** ve **Onion Architecture** prensiplerine sadık kalınarak geliştirilmiş oldukça kapsamlı bir mobil bulmaca oyunudur. 

Bu proje, bir backendin oyun motoru (game engine) gibi kullanıldığı, algoritmik ağırlıklı bir **.NET Core Web API** backend'i ile **React Native (Expo)** kullanılarak tasarlanmış frontend bileşeninden oluşmaktadır.

---

## 🚀 Öne Çıkan Özellikler ve Oyun Mekanikleri

### 1. Dinamik Grid ve Deadlock (Tıkanma) Koruması
* Oyun **6x6**, **8x8** veya **10x10** boyutlarında rastgele harflerden oluşan matrisler (grid) üretir.
* Harfler tamamen rastgele değil, **TDK Türkçe Kullanım Frekanslarına** (A, E, L, R harfleri bol; J, V, F az) göre dağıtılır.
* **Deadlock Engelleme (DFS):** Her hamleden sonra tahtada yapılabilecek geçerli bir hamle olup olmadığı (komşuluk kuralıyla en az 1 kelime) algoritmik olarak taranır. Eğer hamle kalmamışsa, tahta otomatik olarak yeniden karıştırılır (`isReshuffled: true`).

### 2. Akıllı Puanlama ve Kombo Sistemi (Combo Modülü)
* Sadece ana kelime puanlandırmakla kalmaz; seçilen kelimenin içinden çıkan anlamlı alt kelimeler de puan kazanmanızı sağlar. (Örn: "ADANA" kelimesi; "DANA", "ANA", "ADA" gibi alt kelimeler içerdiği için oyuncuya ekstra "Combo" puan çarpanı uygular).
* Minimum kelime uzunluğu **3 harftir**. Her harfin kendi ağırlığına/zorluğuna göre ayrı bir puanı vardır (Örn: J=10, F=7, A=1).

### 3. Yerçekimi Mekaniği (Gravity System)
* Bulunan doğru kelimedeki harfler yok olur (patlar). Boşalan yerlere, Candy Crush tarzında, üstteki harfler fizik kurallarına uygun olarak aşağı doğru kayar. Oluşan yeni boşluklara frekans kurallarına uygun yepyeni harfler düşer.

### 4. Özel Güçler (Power-Ups)
Uzun kelimeler bulan oyuncular ödüllendirilir. Kelime patladığında son harfin yerine bir sembol yerleşir. Oyuncu bu sembole tıkladığında özel patlatmalar gerçekleşir:
* **4 Harfli Kelime:** Satır Temizleme Simgesi Bırakır (`⇆`) - Tıklandığında tüm satır patlar.
* **5 Harfli Kelime:** Alan (Bomba) Simgesi Bırakır (`✹`) - Tıklandığında komşu 8 kare (3x3 alan) patlar.
* **6 Harfli Kelime:** Sütun Temizleme Simgesi Bırakır (`⇅`) - Tıklandığında tüm sütun patlar.
* **7+ Harfli Kelime:** Mega Patlatıcı Simgesi Bırakır (`✪`) - Tıklandığında 2 birim yarıçapındaki devasa bir alan (5x5) patlar.

### 5. Market ve Joker Sistemi
Oyun içinde kazanılan sanal altınlarla (User.TotalGold) çeşitli stratejik avantajlar satın alınabilir:
* 🐟 **Balık (100 Altın):** Rastgele 3 harfi tahtadan siler.
* 🍭 **Lolipop (75 Altın):** Seçilen tek bir harfi patlatır.
* 🔄 **Serbest Değiştirme (125 Altın):** Seçilen 2 komşu harfin yerini değiştirir.
* 🎡 **Tekerlek (200 Altın):** Seçilen harfin bulunduğu hem satırı hem sütunu "artı" şeklinde yok eder.
* 🔀 **Karıştırma (300 Altın):** Mevcut tahtadaki harflerin yerlerini rastgele değiştirir.
* 🎉 **Parti Güçlendirici (400 Altın):** Tahtayı tamamen yeniler.

---

## 🏗️ Backend Mimarisi ve Teknoloji Yığını

### 🛠 Teknolojiler
* **Backend:** C# .NET (ASP.NET Core Web API), CQRS, MediatR, In-Memory Caching (Oyun State Yönetimi).
* **Frontend:** React Native (JS), Expo
* **Veritabanı:** Oyun skorları (Leaderboard) ve Kullanıcı Altın/Hesap bilgileri için Entity Framework Core üzerinden SQL/SQLite/LocalDB kullanımı. Oyun anlık durumu ise RAM üzerinde çalışır.

### 🧩 Servis Katmanı (Services)
Projeyi basit bir API olmaktan çıkaran temel oyun algoritmaları bu klasörde yer alır:
1. `DictionaryService.cs`: TDK sözlüğünü RAM'e (Trie veya HashSet) alıp milisaniyeler içinde doğruluk kontrolü yapar.
2. `GridGeneratorService.cs`: Frekans ve boyut kurallarına göre oyun tahtasını basar.
3. `ScoreCalculator.cs`: Harf ağırlıkları ve Kombo hesaplamalarını yapar.
4. `GravityService.cs`: Patlatılan harfler sonrası koordinatları güncelleyip matrisi aşağı kaydırır.
5. `GridScannerService.cs`: Deadlock (Tıkanıklık) durumlarını tarar.

---

## 🔌 API Endpoint'leri (GameController)

Mobil uygulama ile oyun motorunun iletişim kurduğu ana HTTP uç noktaları:

| Metot | Endpoint | Açıklama |
|---|---|---|
| `GET` | `/api/Game/Generate-Grid/{size}` | Oyun başlatır. 6, 8 veya 10 boyutunda rastgele ve garantili matris döner. Dönüşte bir `gameId` verir. |
| `POST`| `/api/Game/make-move` | `GameId` ve seçilen harflerin `[x,y]` koordinatlarını alır. Kelimeyi doğrular, komboyu hesaplar, yerçekimini uygular ve yeni tahtayı/skoru döner. Özel sembollere (⇆ vb.) tek tıklamayı da yönetir. |
| `POST`| `/api/Game/use-joker` | `JokerType`, `GameId` ve hedef koordinatı alır. Altını düşer ve jokere özel yeteneği matris üzerinde çalıştırıp yeni tahtayı döner. |
| `POST`| `/api/Game/end-game` | Hamle süresi bittiğinde kullanıcının toplam skorunu, bulduğu en uzun kelimeyi ve süresini veritabanına (`GameScore`) kaydeder. |

---

## 📁 Detaylı Proje Dizini

```text
yazlab2/
├── Backend/                 → C# ASP.NET Core API
│   ├── Controllers/         → RESTful API Uç Noktaları (GameController.cs vb.)
│   ├── Entities/            → Veritabanı Modelleri (User, GameScore) ve DTO'lar
│   ├── Repositories/        → EF Core Context, Veri Erişim Katmanı
│   ├── Services/            → Temel Oyun Algoritmaları (Gravity, Grid, Combo)
│   ├── appsettings.json     → DB ve Port yapılandırmaları
│   └── Program.cs           
├── MobileApp/               → React Native (Expo)
│   ├── api/                 → API Çağrıları (Axios/Fetch)
│   ├── components/          → Tekrar kullanılabilir React Bileşenleri
│   ├── screens/             → Uygulama Ekranları (Login, Oyun Alanı, Market)
│   ├── assets/              → Resimler, Fontlar, Sesler
│   └── App.js               → React Native Ana Başlangıç
├── yazlab2.sln              → Backend Proje (Çözüm) Dosyası
└── README.md                → Bu dosya
```

---

## 🚀 Geliştirici Kurulumu ve Çalıştırma Rehberi

Projeyi yerel bilgisayarınızda ayağa kaldırmak için aşağıdaki adımları izleyin:

### 1. Backend API Kurulumu
Backend, oyunun kurallarını ve harf atamalarını bellekte tuttuğu için **önce başlatılmalıdır**.
1. Proje ana dizinini **Visual Studio 2022** ile (veya backend klasörünü) açın. (Alternatif: `yazlab2.sln` üzerinden).
2. `appsettings.json` içerisindeki veritabanı bağlantı dizesini (`ConnectionStrings`) kendi sisteminize göre kontrol edin.
3. Projeyi çalıştırın (`F5`). Swagger arayüzü varsayılan olarak tarayıcıda (`http://localhost:5000` portunda) açılacaktır.

### 2. Frontend Mobil Kurulumu
1. Komut satırını (Terminal/CMD) açıp mobil uygulamanın dizinine girin:
   ```bash
   cd MobileApp
   ```
2. Gerekli node paketlerini indirin:
   ```bash
   npm install
   ```
3. (FİZİKSEL CİHAZ İÇİN ÖNEMLİ): `MobileApp/api/api.js` içerisindeki `BASE_URL` adresini bilgisayarınızın yerel IP adresiyle (örneğin: `http://192.168.x.x:5000/api`) değiştirin.
4. Uygulamayı Expo sunucusuyla başlatın:
   ```bash
   npx expo start
   ```
5. Terminalde çıkan QR kodu telefonunuzdaki **Expo Go** uygulaması (Android/iOS) ile taratarak oyunu oynamaya başlayabilirsiniz.

---

> *Not: Bu proje "Akıllı Kelime Oyunu" gereksinimleri (Yazlab 2) doğrultusunda algoritmik verimlilik, modern mimari ve temiz kod (Clean Code) standartlarına özen gösterilerek hazırlanmıştır.*
