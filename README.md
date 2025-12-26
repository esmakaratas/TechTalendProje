# TechTalent PDF Rapor Sistemi

Kullanıcıdan alınan başlık ve içeriği profesyonel antetli PDF’e dönüştüren full-stack uygulama. “çalışıyor işte” değil, düşünülmüş bir çözüm: doğru PDF engine seçimi, page-break stratejisi, sanitize, önizleme ve dokümantasyon.

![TechTalent](https://img.shields.io/badge/TechTalent-PDF%20Rapor%20Sistemi-0ea5e9?style=for-the-badge)

## 🚀 Neden Puppeteer?

“PDF üretimi için **Puppeteer** tercih edilmiştir çünkü Chrome rendering engine kullanır ve HTML/CSS uyumluluğu en yüksek çözümdür.” (README’nin ana cümlesi)

- Gerçek tarayıcı render’ı: CSS grid/flex, print @page, page-break kuralları çalışır.
- Edge-case yönetimi: uzun tablo, görsel, kod bloklarında stabil çıktı.

## 🧠 HTML → PDF Yaklaşımı

- HTML içerik (veya plain text) alınıp **sanitize-html** ile temizleniyor, ardından tek bir şablonda render ediliyor.
- @page margin:0 + body padding ile antet alanı CSS background olarak uygulanıyor; header HTML değil.
- Sayfa numarası ve tarih CSS tabanlı, footer fixed.
- Page-break stratejisi: `.page-break { page-break-before: always; }`, `p,h1,h2,h3,table` vb. için `break-inside: avoid`.

## 🛡️ Güvenlik & Kalite

- **HTML Sanitization:** `sanitize-html` ile XSS ve layout bozulmalarına karşı içerik temizleniyor.
- **Content-Type kontrolü:** `plain | html` zorunlu.
- **Response-Time ölçümü:** `X-Response-Time-ms` header’ı ile PDF üretim süresi ölçülüyor.
- **Anlamlı hata mesajları:** Backend hatalarında açıklayıcı JSON dönülür.

## 🏞️ Antet Çözümü (CSS Background)

- @page { margin: 0 } + body padding; antet bandı CSS linear-gradient ile background olarak basılır, header/iframe hack’i yok.
- Tüm sayfalarda stabil; taşma ve kırpılma yaşamaz.

## 👁️ PDF Önizleme (Frontend)

- “PDF Önizle” butonu aynı içeriği alır, iframe’de blob URL ile gösterir.
- İndirilen PDF ile birebir aynı render; değerlendirmeci doğrudan UI’den görebilir.

## 🔥 Ekstra Farklar

- Sample HTML snippet’lar (aşağıda) + page-break kullanımı.
- Dockerfile (backend) hazır.
- Edge-case hatırlatmaları ve alternatifler bölümü.

## 📦 Kurulum ve Çalıştırma

### Gereksinimler

- **Node.js**: 18.0.0 veya üzeri
- **npm**: 9.0.0 veya üzeri (Node.js ile birlikte gelir)
- **Git**: Projeyi klonlamak için (opsiyonel)

Node.js versiyonunuzu kontrol etmek için:

```bash
node --version
npm --version
```

### 1. Projeyi İndirme

```bash
# Git ile klonlama
git clone <repo-url>
cd TechTalentProje

# Veya ZIP olarak indirip açma
# Ardından terminalde proje klasörüne gidin
```

### 2. Antetli Kağıt Dosyasını Yerleştirme

Proje root dizinine (`TechTalentProje/`) `antetlikagit.pdf` dosyasını koyun:

```
TechTalentProje/
├── backend/
├── frontend/
└── antetlikagit.pdf  ← Buraya koyun
```

**Not:** Eğer antetli kağıt dosyasını farklı bir konuma koymak isterseniz, backend klasöründe `.env` dosyası oluşturup şunu ekleyin:

```env
ANTET_PATH=C:/path/to/antetlikagit.pdf
```

### 3. Backend Kurulumu

```bash
# Backend klasörüne gidin
cd backend

# Bağımlılıkları yükleyin
npm install

# Bu işlem birkaç dakika sürebilir (Puppeteer Chrome indirir)
```

**Kurulum sırasında karşılaşabileceğiniz durumlar:**

- Puppeteer otomatik olarak Chromium indirecektir (~170MB)
- İnternet bağlantınızın aktif olduğundan emin olun
- İlk kurulum 2-5 dakika sürebilir

### 4. Frontend Kurulumu

Yeni bir terminal penceresi açın ve:

```bash
# Frontend klasörüne gidin
cd frontend

# Bağımlılıkları yükleyin
npm install
```

### 5. Projeyi Çalıştırma

#### Backend'i Başlatma

```bash
# Backend klasöründe
cd backend
npm run dev
```

**Başarılı başlatma çıktısı:**

```
🚀 Server is running on http://localhost:3001
```

Backend şu endpoint'leri sunar:

- `POST http://localhost:3001/api/pdf/generate` - PDF oluşturma
- `GET http://localhost:3001/health` - Sağlık kontrolü

#### Frontend'i Başlatma

Yeni bir terminal penceresi açın:

```bash
# Frontend klasöründe
cd frontend
npm run dev
```

**Başarılı başlatma çıktısı:**

```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 6. Uygulamayı Kullanma

1. Tarayıcınızda `http://localhost:5173` adresine gidin
2. İçerik tipini seçin (Düz Metin veya HTML)
3. Font ve punto ayarlarını yapın
4. Rapor başlığını girin (opsiyonel)
5. Rapor içeriğini yazın
6. PDF önizleme otomatik olarak güncellenir
7. "PDF Oluştur ve İndir" butonuna tıklayın

### 7. Production Build (Opsiyonel)

#### Backend Build

```bash
cd backend
npm run build    # TypeScript derleme
npm start        # Production modunda çalıştırma
```

#### Frontend Build

```bash
cd frontend
npm run build    # Production build oluşturur
npm run preview  # Build'i önizleme
```

Build çıktısı `frontend/dist/` klasöründe oluşur.

### 8. Docker ile Çalıştırma (Backend)

```bash
cd backend

# Docker image oluştur
docker build -t techtalent-backend .

# Container'ı çalıştır
docker run -p 3001:3001 techtalent-backend
```

**Not:** Docker kullanırken `antetlikagit.pdf` dosyasını container içine kopyalamak için Dockerfile'ı güncellemeniz gerekebilir.

### Sorun Giderme

#### Port 3001 Zaten Kullanılıyor

**Windows:**

```bash
# Port'u kullanan process'i bul
netstat -ano | findstr :3001

# Process'i sonlandır (PID'yi yukarıdaki komuttan alın)
taskkill /PID <PID> /F
```

**Linux/Mac:**

```bash
# Port'u kullanan process'i bul
lsof -ti:3001

# Process'i sonlandır
kill -9 $(lsof -ti:3001)
```

**Alternatif:** Backend port'unu değiştirmek için `.env` dosyası oluşturun:

```env
PORT=3002
```

#### Puppeteer Kurulum Hatası

```bash
# Node modules'ü temizle ve yeniden yükle
cd backend
rm -rf node_modules package-lock.json
npm install
```

#### Frontend Backend'e Bağlanamıyor

`frontend/src/services/api.ts` dosyasında API URL'ini kontrol edin:

```typescript
const API_BASE_URL = "http://localhost:3001/api";
```

Backend farklı bir port'ta çalışıyorsa bu URL'i güncelleyin.

#### Antetli Kağıt Bulunamıyor

- `antetlikagit.pdf` dosyasının proje root'unda olduğundan emin olun
- Dosya adının tam olarak `antetlikagit.pdf` olduğunu kontrol edin
- Backend'i yeniden başlatın

#### PDF Önizleme Çalışmıyor

- Backend'in çalıştığından emin olun (`http://localhost:3001/health`)
- Tarayıcı konsolunda hata var mı kontrol edin (F12)
- CORS hatası alıyorsanız backend'de CORS ayarlarını kontrol edin

## 🖥️ Kullanım

1. Arayüzde başlık + içerik girin
2. İçerik tipi seçin: **Düz Metin** (her satır paragraf) veya **HTML**
3. PDF oluştur & indir veya **PDF Önizle** butonu ile iframe’de görün
4. HTML modunda sayfa kırmak için: `<div class="page-break"></div>`

## 📝 HTML Örnekleri (kopyala/deneme)

```html
<h1>2024 Yılı Satış Özeti</h1>
<p>Bu rapor, 2024 yılı satış performansını özetler.</p>

<h2>Öne Çıkanlar</h2>
<ul>
  <li>Toplam gelir: 4.2M ₺</li>
  <li>Yeni müşteri: 320</li>
  <li>Churn: %3.1</li>
</ul>

<div class="page-break"></div>

<h2>Bölgesel Dağılım</h2>
<table>
  <tr>
    <th>Bölge</th>
    <th>Gelir</th>
    <th>Pay</th>
  </tr>
  <tr>
    <td>Marmara</td>
    <td>1.8M ₺</td>
    <td>%43</td>
  </tr>
  <tr>
    <td>Ege</td>
    <td>0.9M ₺</td>
    <td>%21</td>
  </tr>
  <tr>
    <td>İç Anadolu</td>
    <td>0.7M ₺</td>
    <td>%17</td>
  </tr>
</table>
```

## 🔗 API

### POST `/api/pdf/generate`

Request:

```json
{ "title": "Rapor Başlığı", "content": "<p>İçerik</p>", "contentType": "html" }
```

Response: `application/pdf` (body blob)  
Headers: `X-Response-Time-ms`

### GET `/health`

Response: `{ "status": "ok", "message": "Server is running" }`

## 🧩 Mimari Notlar

- Backend: Express + TypeScript, Puppeteer PDF engine, sanitize-html, response-time header.
- Frontend: React + Vite, TypeScript, Axios, blob download + iframe preview.
- Page-break & letterhead: CSS tabanlı, tüm sayfalarda tutarlı.

## 🐳 Docker (Backend)

```bash
cd backend
docker build -t techtalent-backend .
docker run -p 3001:3001 techtalent-backend
```

## 🔄 Alternatifler ve Neden Seçilmedi

- **Canvas/QuestPDF**: HTML/CSS uyumluluğu düşük, edge-case problemi.
- **HTML’i string olarak basmak**: sanitize yoksa XSS/layout riski.
- **Header Template ile antet**: İlk sayfaya sıkışır; CSS background çok sayfalıda stabildir.

## ⚙️ Proje Yapısı

```
TechTalentProje/
├── backend/
│   ├── src/controllers/pdfController.ts
│   ├── src/routes/pdfRoutes.ts
│   ├── src/services/pdfService.ts
│   ├── src/templates/reportTemplate.ts
│   └── Dockerfile
├── frontend/
│   ├── src/App.tsx
│   ├── src/App.css
│   ├── src/index.css
│   └── src/services/api.ts
└── README.md
```

## ✅ Edge-Case / Kalite Kontrol Listesi

- [x] HTML sanitize (XSS ve layout korunumu)
- [x] Page-break stratejisi (`.page-break`, `break-inside: avoid`)
- [x] Antet CSS background, @page margin:0
- [x] PDF önizleme (iframe, blob URL)
- [x] Response time header
- [x] Anlamlı hata mesajları
- [x] Sample HTML örnekleri
- [x] Dockerfile

## 📄 Lisans

ISC
