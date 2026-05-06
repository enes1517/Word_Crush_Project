# 🗺️ Word Crush Mobil Oyunu: Kapsamlı Proje Yol Haritası

PDF içeriğini başarıyla okudum. Bu proje yalnızca sıradan bir API işi değil; arkasında sağlam bir **kelime arama, kombo, yerçekimi ve grid (matris) algoritması** barındırıyor. Projeyi kendin yazmak istediğin için sana mimariyi, yazman gereken servisleri ve algoritmik adımları son derece detaylı şekilde çıkarıyorum.

Mevcut **CQRS** ve **Onion Architecture** temelini koruman projenin temizliği açısından çok doğru. Şimdi oyunun kurallarına uygun backend mimarisine bakalım:

---

## 🏗️ 1. Mimari ve Veritabanı Düzeni
Veritabanını basit tutmalısın çünkü oyun mantığı tamamen backend belleği (RAM) üzerinde çalışacak.
* **`User` Tablosu:** Kullanıcı adı ve `TotalGold` (Altın) tutulmalı. Oyun test süreci olduğu için kayıt olana başlangıçta örneğin `10.000` altın vermelisin.
* **`GameScore` Tablosu:** Oynanan seviye (6x6, 8x8, 10x10), Hamle Sayısı, Süre, En Uzun Kelime, Bulunan Kelime Sayısı, Toplam Puan ve Tarih. *Tüm "Skor Tablosu" işlemlerini buradan çekeceksin.*

---

## 🧠 2. Backend'e Yazılması Gereken "Oyun Logiği" Algoritmaları
En çok vaktini alacak ve puan getirisi en yüksek olan kısım burası. `Services` katmanına bir `GameLogic` klasörü açıp şu sınıfları yazmalısın:

1. **`DictionaryService` (Sözlük Servisi):**
   * Oyun başlarken bir defaya mahsus text dosyasından binlerce Türkçe kelimeyi belleğe okumalısın.
   * *İpucu:* Veritabanı kullanma, bellekte (Singleton) bir `HashSet<string>` veya daha hızlı arama için **Trie Ağacı (Prefix Tree)** kullan. Minimum 3 harf kuralını uygulama aşamasında burada kontrol etmelisin.

2. **`GridManager` (Harf Tablosu Üreticisi):**
   * *Zorluklar:* 6x6 (25 Hamle), 8x8 (20 Hamle), 10x10 (15 Hamle).
   * *Frekanslı Harf Üretimi:* Harfler rastgele üretilirse oyuncu kelime bulamaz. A, E, İ, L, R, N harfleri bol üretilmeli; K, M, T, S orta; J, V, F gibi harfler çok az üretilmelidir.
   * *Kelime Garantisi (Deadlock Taraması):* Tahtada kesinlikle seçilebilir en az 1 kelime (8 farklı yöne komşuluk kuralı ile) bulunduğunu garanti etmelisin. Yoksa tahtayı yeniden karıştırmalısın.

3. **`ScoreAndComboCalculator` (Puan ve Kombo Sistemi):**
   * Harf bazlı puanlama yapılmalı (Örn: J=10, F=7, A=1). Puanlar toplanmalı.
   * **Combo Modülü:** Seçilen ana kelimenin içinden alt kelimeler çıkarılmalı. (Örn: "ADANA" içinden "DANA", "ANA", "ADA" bulunursa `4x Combo` uygulanmalı ve alt kelimelerin de puanı toplam puana eklenmeli).

4. **`GravityService` (Yerçekimi ve Patlatma):**
   * Seçilen doğru harfler yok olmalı (0 veya null yapılmalı) ve üzerlerindeki harfler tıpkı Candy Crush'taki gibi aşağı düşmeli. Doğan boşluklara yeniden frekans kurallı harfler üretilmeli.

5. **`SpecialPowerManager` (Özel Güçler):**
   * Puan alan kelime: 
     * 4 Harf ise son harf dönüştürülür: Satır Temizleme (⇆)
     * 5 Harf ise: Alan (Bomba) Patlatma (✹)
     * 6 Harf ise: Sütun Temizleme (⇅)
     * 7+ Harf ise: Mega Patlatma (✪ - 2 Birim yarıçap patlar)

6. **`MarketManager` (Joker Sistemi):**
   * Balık (100 Altın - Rastgele harf silme)
   * Tekerlek (200 Altın - Satır & Sütun silme)
   * Lolipop (75 Altın - Tek harf silme)
   * Serbest Değiştirme (125 Altın - 2 Komşuyu yer değiştirme)
   * Karıştırma (300 Altın) ve Parti Güçlendirici (400 Altın).
   * *Mekanizma:* Oyuncu React Native'den altın karşılığı Joker isteği atar, backend API'si altını düşer, yetiyorsa algoritmayı tahtaya uygulayıp yeni tahtayı geri döndürür.

---

## 🛜 3. API Katmanı ve React Native Bağlantısı (Controllers)

Controller (Endpoint) tarafını oyun için olabildiğince statik ve anlık dönecek şekilde ayarlamalısın:

* `[HttpPost("api/game/start")]`
  * Frontend, kullanıcının seçtiği zorluğu (Örn: 8x8) yollar.
  * Backend, `GridManager`'dan garantili harf dizilimini ve oyun id'sini üretir JSON olarak döner.
* `[HttpPost("api/game/make-move")]`
  * Frontend, seçilen harflerin `(x, y)` koordinat listesini yollar. (Harflerin stringini yollamak yerine koordinat yollamak hileyi önler).
  * Backend bu koordinatlardaki harfleri birleştirir. `DictionaryService` ile kontrol eder.
  * Eğer kelime doğruysa `ScoreAndComboCalculator` devreye girer. Ardından `GravityService` kalan harfleri günceller, eğer özel güç hak edildiyse harf simgesini (⇆) değiştirir.
  * Kalan hamle sayısını 1 düşürür, kazanılan puanı ve **Grid'in yeni halini** frontend'e döner.
* `[HttpPost("api/game/use-joker")]`
  * Seçilen joker id'si ve hedef koordinat yollanır, backend altını eksiltip işlemi yapar, yeni grid'i döner.
* `[HttpPost("api/game/end")]`
  * Hamle 0'a ulaştığında ya da "Çıkış" yapıldığında toplanan skoru kaydeder.

---

## 👣 4. Geliştirme Sıran Nasıl Olmalı? (C# Backend)

Karmaşayı önlemek için süreci aşamalandırmalısın. Kendin yapacağın için şu adımları izlemeni şiddetle tavsiye ederim:

1. **Aşama: TDK Sözlüğünün Entegrasyonu** 
   * İnternetten güncel bir TDK veritabanı (.txt dosyası) bul ve bunu backend ayağa kalkarken belleğe alacak bir Singleton Service yaz. (Sadece 3 harf ve üzeri kelimeleri belleğe al).
2. **Aşama: Matris (Grid) Üretimi ve Düşme Mantığı** 
   * Frekans tablosunu kur. 2 boyutlu arrayler (`char[,]`) veya Grid modellemeleri tasarla. Patlayan harfin üstündekilerin dökülmesini konsol uygulamasında bir test et.
3. **Aşama: 8 Yönlü Kelime Kontrol ve Kombo**
   * Frontend'in sana yolladığı liste sırasındaki indekslerin birbirine gerçekten komşu olup olmadığını (Sağ, Sol, Üst, Alt ve Çaprazlar) doğrulayan sınıfını yaz. Ardından girilen kelimeden alt kelimeler çıkaran sistemi kur.
4. **Aşama: Deadlock Engelleyici**
   * Izgara üzerinde hiç kelime kalmama ihtimaline karşı her "make-move" hamlesi sonrasında Izgarada kelime arayan DFS (Depth-First Search) fonksiyonunu yaz. 
5. **Aşama: Jokerler ve Özel Patlatıcılar**
   * Marketten alınan jokerlerin (Tekerlek, Lolipop vb.) ve kelime uzunluğuna bağlı patlatıcıların (Satır silici, Mega patlatıcı vs) satır/sütun temizleme algoritmalarını yaz.
6. **Aşama: Web API ve Veritabanı**
   * Yapmış olduğun tüm bu algoritmaları CQRS mimarine, yazdığın Repositories kütüphanene bağla ve EndPointlere (Controller) taşı. En son olarak React Native tarafından Fetch/Axios ile çağrılmaya hazır hâle getir.

Harika bir staj/proje deneyimi olacak. Adım adım ilerledikçe; örneğin *"TDK sözlüğünü Trie ağacıyla nasıl kurarım?"* veya *"Komşu (8 Yönlü) koordinat doğrulama algoritmasını nasıl yazarım?"* dediğin her aşamada sana kod düzeyinde yardımcı olmak için buradayım!
