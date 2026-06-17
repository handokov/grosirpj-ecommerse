import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

// ─── Zone Definitions ────────────────────────────────────────────────
const zones = [
  {
    code: 'JABODETABEK',
    name: 'Jabodetabek',
    provinces: 'DKI Jakarta',
    order: 1,
  },
  {
    code: 'JAWA_BARAT',
    name: 'Jawa Barat',
    provinces: 'Jawa Barat',
    order: 2,
  },
  {
    code: 'JAWA_TENGAH',
    name: 'Jawa Tengah & DIY',
    provinces: 'Jawa Tengah, DI Yogyakarta',
    order: 3,
  },
  {
    code: 'JAWA_TIMUR',
    name: 'Jawa Timur',
    provinces: 'Jawa Timur',
    order: 4,
  },
  {
    code: 'SUMATERA',
    name: 'Sumatera',
    provinces: 'Aceh, Sumatera Utara, Sumatera Barat, Riau, Kepulauan Riau, Jambi, Sumatera Selatan, Bangka Belitung, Bengkulu, Lampung',
    order: 5,
  },
  {
    code: 'BALI_NTB',
    name: 'Bali & NTB',
    provinces: 'Bali, Nusa Tenggara Barat',
    order: 6,
  },
  {
    code: 'KALIMANTAN',
    name: 'Kalimantan',
    provinces: 'Kalimantan Barat, Kalimantan Tengah, Kalimantan Selatan, Kalimantan Timur, Kalimantan Utara',
    order: 7,
  },
  {
    code: 'SULAWESI',
    name: 'Sulawesi',
    provinces: 'Sulawesi Utara, Gorontalo, Sulawesi Tengah, Sulawesi Barat, Sulawesi Selatan, Sulawesi Tenggara',
    order: 8,
  },
  {
    code: 'TIMUR',
    name: 'Indonesia Timur',
    provinces: 'Nusa Tenggara Timur, Maluku, Maluku Utara, Papua, Papua Barat',
    order: 9,
  },
];

// ─── Rate Definitions (zoneCode → rates[]) ───────────────────────────
// Each rate: { courier, service, serviceLabel, firstKg, nextKg, etd, order }

const ratesByZone: Record<string, Array<{
  courier: string;
  service: string;
  serviceLabel: string;
  firstKg: number;
  nextKg: number;
  etd: string;
  order: number;
}>> = {
  JABODETABEK: [
    { courier: 'jne', service: 'REG', serviceLabel: 'JNE REGULER', firstKg: 18000, nextKg: 3000, etd: '1-2 hari', order: 1 },
    { courier: 'jne', service: 'YES', serviceLabel: 'JNE YES', firstKg: 28000, nextKg: 5000, etd: '1 hari', order: 2 },
    { courier: 'jnt', service: 'EZ', serviceLabel: 'J&T EZ', firstKg: 15000, nextKg: 3000, etd: '1-2 hari', order: 3 },
    { courier: 'sicepat', service: 'REG', serviceLabel: 'SiCepat REG', firstKg: 16000, nextKg: 2500, etd: '1-2 hari', order: 4 },
    { courier: 'pos', service: 'KILAT', serviceLabel: 'POS Kilat Khusus', firstKg: 17000, nextKg: 3000, etd: '2-3 hari', order: 5 },
  ],
  JAWA_BARAT: [
    { courier: 'jne', service: 'REG', serviceLabel: 'JNE REGULER', firstKg: 22000, nextKg: 4000, etd: '1-2 hari', order: 1 },
    { courier: 'jne', service: 'YES', serviceLabel: 'JNE YES', firstKg: 35000, nextKg: 6000, etd: '1 hari', order: 2 },
    { courier: 'jnt', service: 'EZ', serviceLabel: 'J&T EZ', firstKg: 20000, nextKg: 4000, etd: '1-2 hari', order: 3 },
    { courier: 'sicepat', service: 'REG', serviceLabel: 'SiCepat REG', firstKg: 20000, nextKg: 3500, etd: '1-2 hari', order: 4 },
    { courier: 'pos', service: 'KILAT', serviceLabel: 'POS Kilat Khusus', firstKg: 20000, nextKg: 3500, etd: '2-3 hari', order: 5 },
  ],
  JAWA_TENGAH: [
    { courier: 'jne', service: 'REG', serviceLabel: 'JNE REGULER', firstKg: 25000, nextKg: 5000, etd: '2-3 hari', order: 1 },
    { courier: 'jne', service: 'YES', serviceLabel: 'JNE YES', firstKg: 38000, nextKg: 7000, etd: '1-2 hari', order: 2 },
    { courier: 'jnt', service: 'EZ', serviceLabel: 'J&T EZ', firstKg: 22000, nextKg: 5000, etd: '2-3 hari', order: 3 },
    { courier: 'sicepat', service: 'REG', serviceLabel: 'SiCepat REG', firstKg: 22000, nextKg: 4000, etd: '2-3 hari', order: 4 },
    { courier: 'pos', service: 'KILAT', serviceLabel: 'POS Kilat Khusus', firstKg: 22000, nextKg: 4000, etd: '3-4 hari', order: 5 },
  ],
  JAWA_TIMUR: [
    { courier: 'jne', service: 'REG', serviceLabel: 'JNE REGULER', firstKg: 28000, nextKg: 6000, etd: '2-3 hari', order: 1 },
    { courier: 'jne', service: 'YES', serviceLabel: 'JNE YES', firstKg: 42000, nextKg: 8000, etd: '1-2 hari', order: 2 },
    { courier: 'jnt', service: 'EZ', serviceLabel: 'J&T EZ', firstKg: 25000, nextKg: 6000, etd: '2-3 hari', order: 3 },
    { courier: 'sicepat', service: 'REG', serviceLabel: 'SiCepat REG', firstKg: 25000, nextKg: 5000, etd: '2-3 hari', order: 4 },
    { courier: 'pos', service: 'KILAT', serviceLabel: 'POS Kilat Khusus', firstKg: 25000, nextKg: 5000, etd: '3-4 hari', order: 5 },
  ],
  SUMATERA: [
    { courier: 'jne', service: 'REG', serviceLabel: 'JNE REGULER', firstKg: 35000, nextKg: 8000, etd: '3-5 hari', order: 1 },
    { courier: 'jne', service: 'YES', serviceLabel: 'JNE YES', firstKg: 55000, nextKg: 10000, etd: '2-3 hari', order: 2 },
    { courier: 'jnt', service: 'EZ', serviceLabel: 'J&T EZ', firstKg: 30000, nextKg: 7000, etd: '3-5 hari', order: 3 },
    { courier: 'sicepat', service: 'REG', serviceLabel: 'SiCepat REG', firstKg: 30000, nextKg: 6000, etd: '3-5 hari', order: 4 },
    { courier: 'pos', service: 'KILAT', serviceLabel: 'POS Kilat Khusus', firstKg: 30000, nextKg: 6000, etd: '4-6 hari', order: 5 },
  ],
  BALI_NTB: [
    { courier: 'jne', service: 'REG', serviceLabel: 'JNE REGULER', firstKg: 32000, nextKg: 7000, etd: '3-4 hari', order: 1 },
    { courier: 'jne', service: 'YES', serviceLabel: 'JNE YES', firstKg: 50000, nextKg: 9000, etd: '2-3 hari', order: 2 },
    { courier: 'jnt', service: 'EZ', serviceLabel: 'J&T EZ', firstKg: 28000, nextKg: 6000, etd: '3-4 hari', order: 3 },
    { courier: 'sicepat', service: 'REG', serviceLabel: 'SiCepat REG', firstKg: 28000, nextKg: 5000, etd: '3-4 hari', order: 4 },
    { courier: 'pos', service: 'KILAT', serviceLabel: 'POS Kilat Khusus', firstKg: 28000, nextKg: 5000, etd: '4-5 hari', order: 5 },
  ],
  KALIMANTAN: [
    { courier: 'jne', service: 'REG', serviceLabel: 'JNE REGULER', firstKg: 45000, nextKg: 10000, etd: '4-6 hari', order: 1 },
    { courier: 'jne', service: 'YES', serviceLabel: 'JNE YES', firstKg: 65000, nextKg: 12000, etd: '2-4 hari', order: 2 },
    { courier: 'jnt', service: 'EZ', serviceLabel: 'J&T EZ', firstKg: 38000, nextKg: 9000, etd: '4-6 hari', order: 3 },
    { courier: 'sicepat', service: 'REG', serviceLabel: 'SiCepat REG', firstKg: 38000, nextKg: 8000, etd: '4-6 hari', order: 4 },
    { courier: 'pos', service: 'KILAT', serviceLabel: 'POS Kilat Khusus', firstKg: 35000, nextKg: 8000, etd: '5-7 hari', order: 5 },
  ],
  SULAWESI: [
    { courier: 'jne', service: 'REG', serviceLabel: 'JNE REGULER', firstKg: 50000, nextKg: 11000, etd: '4-6 hari', order: 1 },
    { courier: 'jne', service: 'YES', serviceLabel: 'JNE YES', firstKg: 70000, nextKg: 13000, etd: '2-4 hari', order: 2 },
    { courier: 'jnt', service: 'EZ', serviceLabel: 'J&T EZ', firstKg: 42000, nextKg: 10000, etd: '4-6 hari', order: 3 },
    { courier: 'sicepat', service: 'REG', serviceLabel: 'SiCepat REG', firstKg: 42000, nextKg: 9000, etd: '4-6 hari', order: 4 },
    { courier: 'pos', service: 'KILAT', serviceLabel: 'POS Kilat Khusus', firstKg: 38000, nextKg: 9000, etd: '5-7 hari', order: 5 },
  ],
  TIMUR: [
    { courier: 'jne', service: 'REG', serviceLabel: 'JNE REGULER', firstKg: 60000, nextKg: 15000, etd: '5-10 hari', order: 1 },
    { courier: 'jne', service: 'YES', serviceLabel: 'JNE YES', firstKg: 85000, nextKg: 18000, etd: '3-5 hari', order: 2 },
    { courier: 'jnt', service: 'EZ', serviceLabel: 'J&T EZ', firstKg: 50000, nextKg: 13000, etd: '5-10 hari', order: 3 },
    { courier: 'sicepat', service: 'REG', serviceLabel: 'SiCepat REG', firstKg: 50000, nextKg: 12000, etd: '5-10 hari', order: 4 },
    { courier: 'pos', service: 'KILAT', serviceLabel: 'POS Kilat Khusus', firstKg: 45000, nextKg: 12000, etd: '7-14 hari', order: 5 },
  ],
};

// ─── Seed Function ───────────────────────────────────────────────────
async function seed() {
  console.log('🚀 Seeding shipping zones & rates for GrosirPJ...\n');

  // Step 1: Delete existing data (rates first due to FK constraint)
  console.log('🗑️  Cleaning existing data...');
  const deletedRates = await db.shippingRate.deleteMany();
  console.log(`   Deleted ${deletedRates.count} shipping rates`);
  const deletedZones = await db.shippingZone.deleteMany();
  console.log(`   Deleted ${deletedZones.count} shipping zones\n`);

  // Step 2: Create zones
  console.log('📦 Creating shipping zones...');
  const createdZones: Record<string, string> = {}; // code → id

  for (const zone of zones) {
    const created = await db.shippingZone.create({
      data: {
        code: zone.code,
        name: zone.name,
        provinces: zone.provinces,
        order: zone.order,
        active: true,
      },
    });
    createdZones[zone.code] = created.id;
    console.log(`   ✓ Zone ${zone.order}: ${zone.name} (${zone.code}) — ${zone.provinces}`);
  }
  console.log(`   Total zones created: ${zones.length}\n`);

  // Step 3: Create rates
  console.log('📮 Creating shipping rates...');
  let totalRates = 0;

  for (const zone of zones) {
    const zoneId = createdZones[zone.code];
    const rates = ratesByZone[zone.code];

    if (!rates || !zoneId) continue;

    for (const rate of rates) {
      await db.shippingRate.create({
        data: {
          zoneId,
          courier: rate.courier,
          service: rate.service,
          serviceLabel: rate.serviceLabel,
          firstKg: rate.firstKg,
          nextKg: rate.nextKg,
          etd: rate.etd,
          active: true,
          order: rate.order,
        },
      });
      totalRates++;
    }

    console.log(`   ✓ ${zone.name}: ${rates.length} rates`);
  }
  console.log(`   Total rates created: ${totalRates}\n`);

  // Step 4: Summary
  console.log('═══════════════════════════════════════════════════════');
  console.log('  SEED SUMMARY — GrosirPJ Shipping Zones & Rates');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  Zones  : ${zones.length}`);
  console.log(`  Rates  : ${totalRates} (${zones.length} zones × 5 couriers)`);
  console.log(`  Couriers: JNE REG, JNE YES, J&T EZ, SiCepat REG, POS Kilat`);
  console.log(`  Origin  : Jakarta`);
  console.log('───────────────────────────────────────────────────────');

  for (const zone of zones) {
    const rates = ratesByZone[zone.code];
    const priceRange = rates
      ? `Rp ${Math.min(...rates.map(r => r.firstKg)).toLocaleString('id-ID')} – Rp ${Math.max(...rates.map(r => r.firstKg)).toLocaleString('id-ID')}`
      : '-';
    console.log(`  Zone ${zone.order} | ${zone.name.padEnd(20)} | ${priceRange}`);
  }

  console.log('═══════════════════════════════════════════════════════');
  console.log('✅ Seeding complete!\n');
}

seed()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
