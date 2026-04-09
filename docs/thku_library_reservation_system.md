# Context: THK University Library Reservation System

## 📌 1. Proje Özeti (Project Overview)

Bu proje, Türk Hava Kurumu (THK) Üniversitesi öğrencileri ve personeli için geliştirilmiş kapsamlı bir **Kütüphane Çalışma Odası Rezervasyon Sistemi**dir.
Kullanıcıların Microsoft Azure AD hesaplarıyla (okul e-postaları) güvenli giriş yapabildiği, aktif rezervasyonlarını yönetebildiği, check-in yapabildiği ve kural/ceza sistemiyle desteklenen modern bir web uygulamasıdır.

## 🛠 2. Teknoloji Yığını (Tech Stack)

Proje modern, ölçeklenebilir ve Full-Stack bir JavaScript/TypeScript mimarisi üzerine inşa edilmiştir.

- **Frontend:** React.js / Next.js (App/Pages Router entegre yapı)
- **UI Framework:** Material-UI (MUI v5)
- **Styling:** Özel `theme.js` yapılandırması (Hardcoded CSS veya Tailwind yerine MUI Theme Provider kullanılır).
- **Backend / API:** Next.js API Routes (`/api/...`)
- **Veritabanı:** PostgreSQL
- **ORM:** Prisma v5.22 (Standart Binary Engine kullanılmaktadır. Driver Adapters kullanılmaz).
- **Authentication:** `next-auth` (Sadece `azure-ad` OAuth provider aktiftir, şifreli giriş yoktur).

## 🧠 3. Temel İş Mantığı ve Akışlar (Core Workflows)

### A. Kimlik Doğrulama ve Yönlendirme (Auth Flow)

1. **Login:** Kullanıcı sistemi açtığında `Login.jsx` ekranıyla karşılaşır. "Microsoft ile Giriş Yap" butonu `next-auth` üzerinden Azure AD'yi tetikler.
2. **Kural Onayı (Middleware):** Sisteme ilk kez giren (veya kurallar güncellendiğinde) kullanıcılar, Dashboard'a erişmeden önce zorunlu olarak `RulesAcceptance.jsx` sayfasına yönlendirilir.
3. **Dashboard:** Kuralları onaylayan kullanıcı ana `Dashboard.jsx` ekranına ulaşır.

### B. Rezervasyon ve Ceza Sistemi (Business Logic)

- **Check-in:** Kullanıcılar rezerve ettikleri odaya gittiklerinde sistem üzerinden (veya QR kod ile) "Check-in" yapmalıdır.
- **Ceza Puanı (Penalty):** Check-in yapmayan (No-Show) veya geç iptal eden kullanıcılara sistem otomatik olarak ceza puanı işler (`PenaltyHistory`). Belirli bir puanı aşan kullanıcılar sistemden geçici olarak banlanır (`isBanned`, `banUntil`).
- **Roller (Roles):** Sistemde `STUDENT`, `ADMIN`, `LIBRARIAN` ve `SUPER_ADMIN` rolleri bulunur.

## 🗄 4. Veritabanı Mimarisi (Prisma Schema Summary)

Sistemdeki ana veri modelleri şunlardır:

- **`User`:** Kullanıcı bilgileri, rolü, ceza puanları, ban durumu ve NextAuth ilişkileri.
- **`Room`:** Kütüphanedeki odalar (Örn: R101, Kapasite: 7, Aktiflik durumu).
- **`Reservation`:** Kullanıcı ile Oda arasındaki ilişki. Tarih, saat, katılımcı sayısı ve durum (`PENDING`, `CONFIRMED`, `CHECKED_IN`, vb.) tutulur.
- **`PenaltyHistory`:** Kullanıcıların aldığı cezaların loglandığı tablo.
- **`Announcement`:** Dashboard'da gösterilen sistem duyuruları.
- **`SystemSetting` & `ReservationRule`:** Sistemin dinamik ayarlarının ve rezervasyon limitlerinin tutulduğu tablolar.
- Diğer Tablolar: `AuditLog`, `DashboardStats`, `EmailQueue`, vb.

_(Not: Prisma Client başlatılırken ekstra bir pool/adapter kullanılmaz, doğrudan standart `new PrismaClient()` çağrılır.)_

## 🎨 5. Tasarım ve Geliştirme Kuralları (Cursor & AI Guidelines)

Cursor veya herhangi bir AI asistanı bu projede kod yazarken **AŞAĞIDAKİ KURALLARA KESİNLİKLE UYMALIDIR:**

1. **MUI İlkeleri (Strict MUI):** - Yeni bir bileşen oluşturulurken `div`, `span` veya standart CSS class'ları yerine MUI'nin `Box`, `Typography`, `Grid`, `Stack`, `Paper` bileşenleri kullanılacaktır.
   - `sx` prop'u üzerinden styling yapılacaktır.
2. **Tema Entegrasyonu (Theme-First):**
   - Renkler kesinlikle hardcoded yazılamaz (Örn: `#137fec` YASAK).
   - Bunun yerine `theme.palette.primary.main`, `theme.palette.background.default`, `theme.palette.text.secondary` gibi theme objesinden beslenilmelidir.
3. **Responsive Grid:**
   - Ekran tasarımları Mobile-First ancak Tablet (Landscape) ve Masaüstü uyumlu olmalıdır.
   - Sayfa düzenleri `<Grid container spacing={3}>` ile kurulmalı, kolonlar `xs={12} md={8}` (Sol içerik) ve `xs={12} md={4}` (Sağ Sidebar) mantığıyla oturtulmalıdır.
4. **Veri Yönetimi (No Mock Data in Prod):**
   - UI tasarlanırken mock (sahte) veri kullanılabilir, ancak nihai kodda veriler her zaman `api.get()` veya `api.post()` ile backend'den çekilecek şekilde `useEffect` ve `useState` mimarisine uygun yazılmalıdır.
5. **Güvenlik (Session):**
   - Kullanıcı yetkisi gerektiren her sayfanın en üstünde `useSession()` kontrolü (`status === "loading"` ve `status === "unauthenticated"`) mutlaka bulunmalıdır.
