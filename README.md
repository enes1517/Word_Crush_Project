# 🧩 Word Crush - Akıllı Kelime Oyunu (Yazlab 2 Proje 3)

Word Crush, harfleri birleştirerek kelimeler türettiğiniz; kombolar, market mekanikleri, özel güçler ve yerçekimi simülasyonu içeren kapsamlı bir mobil bulmaca oyunudur. 

Proje, oyun motoru (game engine) mantığı ile tasarlanmış **C# .NET Core Web API** backend'i ve **React Native (Expo)** kullanılarak tasarlanmış frontend bileşeninden oluşmaktadır. Bütün algoritmalar In-Memory cache üzerinde yüksek performanslı çalışacak şekilde tasarlanmıştır.

---

## 🚀 Oyun Mekanikleri ve Algoritmalar

### 1. Dinamik Grid Yönetimi ve Tıkanıklık Kontrolü
* Oyun tahtası isteğe bağlı olarak **6x6**, **8x8** veya **10x10** boyutlarında rastgele (`GridGeneratorService.cs`) üretilir.
* Harfler tamamen rastgele üretilmez. **TDK harf kullanım frekanslarına** göre (A, E, L gibi harfler sık; J, V, F nadir) havuzdan çekilir.
* **Deadlock Engelleme (DFS):** `GridScannerService.cs` tarafından her hamle sonrası tahtada seçilebilecek en az bir kelime kaldığı doğrulanır. Eğer hamle yoksa, oyuncuyu kilitlememek için tahta otomatik olarak yeniden karıştırılır.

### 2. Akıllı Puanlama, Kombo ve Yerçekimi (Gravity)
* Seçilen kelimenin (min. 3 harf) doğruluğu **TDK Sözlüğü** (`DictionaryService.cs`) ile In-Memory ortamda saniyeler içinde denetlenir.
* Sadece ana kelime değil, **kelime içinden çıkan alt kelimeler** (`ScoreCalculator.cs`) de oyuncuya ekstra puan ve "Combo!" kazandırır (Örn: "ADANA" içinden "DANA" ve "ANA" puanları).
* Patlayan harflerin yeri boş kalmaz. Tıpkı *Candy Crush* gibi üstteki harfler fizik kurallarına uygun olarak aşağı düşer (`GravityService.cs`) ve üstte boş kalan yerlere kurallara uygun yeni harfler basılır.

### 3. Özel Güçler ve Semboller
Uzun kelime bulduğunuzda o kelimenin son harfi yerine bir tetikleyici sembol bırakılır. Bu sembollere tıklandığında özel patlamalar gerçekleşir:
* **4 Harfli Kelime (`⇆`):** Tıklandığında tüm satırı yok eder.
* **5 Harfli Kelime (`✹`):** Tıklandığında kendi etrafındaki 3x3'lük komşu kareleri yok eden bomba patlar.
* **6 Harfli Kelime (`⇅`):** Tıklandığında tüm sütunu yok eder.
* **7+ Harfli Kelime (`✪`):** Tıklandığında kendi etrafındaki 5x5'lik (2 birim) devasa bir alanı patlatır.

### 4. Market ve Joker Sistemi
Oyuncular oyunda kazandıkları sanal altınları (User.TotalGold) Market üzerinden güçlendiriciler almak için harcayabilir:
* 🐟 **Balık (100 Altın):** Rastgele 3 harfi tahtadan siler.
* 🍭 **Lolipop (75 Altın):** Seçilen spesifik bir harfi yok eder.
* 🔄 **Serbest Değiştirme (125 Altın):** Seçilen 2 harfin yerini değiştirir.
* 🎡 **Tekerlek (200 Altın):** Seçilen harfin bulunduğu satırı ve sütunu '+' şeklinde temizler.
* 🔀 **Karıştırma (300 Altın):** Mevcut tahtadaki harflerin yerlerini rastgele değiştirir.
* 🎉 **Parti Güçlendirici (400 Altın):** Tahtadaki tüm harfleri yenisiyle değiştirir.

---

## 📁 Detaylı Proje ve Klasör Mimarisi

Aşağıdaki yapı, projenin tamamen modüler, temiz kod prensiplerine uygun (Separation of Concerns) şekilde nasıl kodlandığını gösterir:

### ⚙️ Backend (C# .NET Core)
* **`Controllers/`** 
  * `GameController.cs`: Oyunun ana REST API noktası (Oyun başlatma, Hamle yapma, Joker kullanımı).
  * `UserController.cs`: Kullanıcı girişi ve kayıt işlemleri.
  * `LeaderboardController.cs`: Liderlik tablosu işlemleri.
* **`Services/`** (Oyun Motorunun Kalbi)
  * `DictionaryService.cs`: TDK sözlüğünü bellekte (Trie/Hash) barındırır ve saniyeler içinde doğrulama yapar.
  * `GravityService.cs`: Patlatılan koordinatları matristen siler ve yerçekimi mantığını uygular.
  * `GridGeneratorService.cs`: Zorluk seviyesine (6x6 vb.) göre frekans bazlı harf yerleştirme.
  * `GridScannerService.cs`: Oyun tıkandı mı diye komşuluk araması yapar (DFS).
  * `ScoreCalculator.cs`: Harf ağırlıkları ve Komboyu hesaplar.
* **`Entities/` & `Repositories/`**
  * Kullanıcı ve Skor tablolarının veritabanı yansımaları (Entity Framework Core).

### 📱 Frontend (React Native - Expo)
* **`screens/`**
  * `LoginScreen.js`: Oyuncu girişi veya kayıt ekranı.
  * `HomeScreen.js`: Ana menü (Başla, Liderlik, Market, Profil).
  * `GridSelectionScreen.js` / `MoveSelectionScreen.js`: Oyun zorluğunu ve hamle haklarını seçme ekranı.
  * `GameScreen.js`: En karmaşık ekran; matrisin (oyun tahtasının) çizimi, kaydırma/seçme animasyonları ve joker kullanımını barındırır.
  * `MarketScreen.js`: Altın ile yetenek/joker satın alınan mağaza ekranı.
  * `ScoreScreen.js`: Liderlik tablolarının sıralandığı ekran.
* **`api/`**
  * `api.js`: Axios aracılığıyla Backend `GameController` ile iletişim sağlayan yapı.

---

## 💻 Kurulum ve Çalıştırma

Projeyi yerel bilgisayarınızda çalıştırmak için:

### 1. Backend API Çalıştırma
Backend'in oyun motoru sürekli aktif olmalıdır:
1. `Backend` klasöründeyken terminalde `dotnet run` yazın veya projeyi Visual Studio'da açıp F5 ile (Kestrel) çalıştırın.
2. API varsayılan olarak `http://localhost:5000` veya Swagger arayüzü üzerinde çalışacaktır.

### 2. Frontend Mobil Uygulamasını Çalıştırma
1. Terminalden `MobileApp` klasörüne girin:
   ```bash
   cd MobileApp
   ```
2. Eksik npm paketlerini yükleyin:
   ```bash
   npm install
   ```
3. Expo sunucusunu ayağa kaldırın:
   ```bash
   npx expo start
   ```
4. Terminalde çıkan QR kodu telefonunuzdaki **Expo Go** uygulaması ile okutarak oyuna giriş yapın.

> ⚠️ **Fiziksel Cihaz İçin Ağ Ayarı:** Telefonunuzdan API'ye istek gidebilmesi için `MobileApp/api/api.js` içerisindeki `BASE_URL` adresini (Örn: `http://192.168.1.50:5000/api`) olarak yerel bilgisayarınızın IP adresine çekmeyi unutmayın.
