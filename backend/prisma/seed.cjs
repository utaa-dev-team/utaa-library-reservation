require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seed başlatılıyor...')

  // Eski odaları sil
  await prisma.room.deleteMany()
  console.log('🧹 Eski odalar silindi')
  
  // Yeni odaları ekle
  const rooms = await prisma.room.createMany({
    data: [
      { roomNumber: 'R101', name: 'Atatürk', capacity: 7, isActive: true },
      { roomNumber: 'R102', name: 'Gökçen', capacity: 7, isActive: true },
      { roomNumber: 'R103', name: 'Uçantürk', capacity: 7, isActive: true },
      { roomNumber: 'R104', name: 'İstikbal', capacity: 7, isActive: true },
    ],
  })

  console.log(`✅ ${rooms.count} oda eklendi!`)

  // Kontrol
  const allRooms = await prisma.room.findMany()
  console.log('\n📋 Eklenen Odalar:')
  allRooms.forEach(room => {
    console.log(`   ${room.roomNumber}: ${room.name} (Kapasite: ${room.capacity})`)
  })

  // ─── Aktif Sözleşme ───
  await prisma.agreement.deleteMany()
  console.log('\n🧹 Eski sözleşmeler silindi')

  const agreement = await prisma.agreement.create({
    data: {
      title: 'Kullanım Kuralları',
      version: 'v1.0',
      isActive: true,
      content: `1. Maksimum Rezervasyon Süresi
Çalışma odaları günde en fazla 3 saat süreyle rezerve edilebilir. Süre uzatmaları müsaitlik durumuna bağlıdır ve süre dolmadan 15 dakika önce danışmadan talep edilmelidir. Aynı grubun farklı isimlerle ardışık rezervasyon yapması yasaktır.

2. Geç Kalma / Gelmeme (No-Show)
Başlangıç saatinden itibaren 15 dakika içinde odaya giriş yapılmazsa rezervasyon otomatik olarak iptal edilir ve oda diğer öğrencilerin kullanımına açılır. Tekrarlanan gelmeme durumları (dönem içinde 3 kezden fazla), rezervasyon ayrıcalıklarının 30 güne kadar askıya alınmasına neden olabilir.

3. Sessizlik ve Kullanım Kuralları
Kullanıcılar akademik çalışmaya uygun sessiz bir ortam sağlamalıdır. Yüksek sesli konuşmalar, kulaklıksız müzik veya rahatsız edici davranışlara izin verilmez. Temizliği korumak için (kapalı şişedeki su hariç) yiyecek ve içecek tüketimi kesinlikle yasaktır.

4. Ekipman Sorumluluğu
Kullanıcılar rezervasyon süresince kütüphane mülküne, mobilyalara veya teknik ekipmanlara verilen her türlü hasardan sorumludur. Kütüphane ekipmanlarının fişini çekmeyiniz. Lütfen odaya girdiğinizde mevcut sorunları derhal bildirin.

5. Grup Çalışması
Çalışma odaları grup çalışması (en az 2 kişi) için tasarlanmıştır. Her oda en fazla 7 kişi kapasitesine sahiptir. Bireysel çalışan öğrenciler genel okuma salonlarını kullanmalıdır.

6. Günlük Rezervasyon Limiti
Her öğrenci günde yalnızca 1 (bir) adet rezervasyon yapabilir. Aynı gün içinde ikinci bir rezervasyon talebi sistem tarafından reddedilecektir.`,
    },
  })

  console.log(`✅ Sözleşme eklendi: "${agreement.title}" (${agreement.version})`)

  // ─── Rezervasyon Kuralları ───
  const rules = [
    { ruleName: 'MIN_PARTICIPANTS', ruleType: 'INTEGER', ruleValue: { value: 2 } },
    { ruleName: 'MAX_PARTICIPANTS', ruleType: 'INTEGER', ruleValue: { value: 7 } },
    { ruleName: 'MAX_DURATION_HOURS', ruleType: 'INTEGER', ruleValue: { value: 3 } },
    { ruleName: 'MAX_ADVANCE_DAYS', ruleType: 'INTEGER', ruleValue: { value: 3 } },
    { ruleName: 'DAILY_RELEASE_HOUR', ruleType: 'INTEGER', ruleValue: { value: 8 } },
  ]

  for (const rule of rules) {
    await prisma.reservationRule.upsert({
      where: { ruleName: rule.ruleName },
      update: { ruleValue: rule.ruleValue, ruleType: rule.ruleType, isActive: true },
      create: { ruleName: rule.ruleName, ruleType: rule.ruleType, ruleValue: rule.ruleValue, isActive: true },
    })
  }

  console.log(`\n✅ ${rules.length} rezervasyon kuralı eklendi/güncellendi!`)

  const allRules = await prisma.reservationRule.findMany({ where: { isActive: true } })
  console.log('\n📋 Aktif Kurallar:')
  allRules.forEach(r => {
    console.log(`   ${r.ruleName}: ${JSON.stringify(r.ruleValue)}`)
  })
}

main()
  .catch((e) => {
    console.error('❌ Hata:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
