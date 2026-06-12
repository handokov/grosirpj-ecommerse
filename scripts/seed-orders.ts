import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Get some products for order items
  const products = await prisma.product.findMany({ take: 5 });
  
  if (products.length === 0) {
    console.log('No products found. Run main seed first.');
    return;
  }

  // Create sample orders
  const orders = [
    {
      orderNumber: 'GPJ-000001',
      customerName: 'Bu Sari',
      customerPhone: '081234567890',
      customerEmail: 'busari@email.com',
      customerAddr: 'Jl. Merdeka No. 10, Jakarta Selatan',
      status: 'completed',
      paymentMethod: 'transfer',
      paymentStatus: 'paid',
      totalAmount: 900000,
      note: 'Tolong packing yang rapi ya',
    },
    {
      orderNumber: 'GPJ-000002',
      customerName: 'Pak Ahmad',
      customerPhone: '082345678901',
      customerAddr: 'Jl. Sudirman No. 25, Bandung',
      status: 'shipped',
      paymentMethod: 'transfer',
      paymentStatus: 'paid',
      totalAmount: 1500000,
    },
    {
      orderNumber: 'GPJ-000003',
      customerName: 'Ibu Dewi',
      customerPhone: '083456789012',
      customerAddr: 'Jl. Gatot Subroto No. 5, Surabaya',
      status: 'confirmed',
      paymentMethod: 'cod',
      paymentStatus: 'unpaid',
      totalAmount: 750000,
    },
    {
      orderNumber: 'GPJ-000004',
      customerName: 'Toko Anak Cilik',
      customerPhone: '084567890123',
      customerEmail: 'toko@anakcilik.com',
      customerAddr: 'Jl. Pahlawan No. 30, Semarang',
      status: 'pending',
      paymentMethod: 'whatsapp',
      paymentStatus: 'unpaid',
      totalAmount: 2400000,
      note: 'Orderan banyak, mohon diskon ongkir',
    },
    {
      orderNumber: 'GPJ-000005',
      customerName: 'Bu Rina',
      customerPhone: '085678901234',
      customerAddr: 'Jl. Ahmad Yani No. 15, Yogyakarta',
      status: 'processing',
      paymentMethod: 'transfer',
      paymentStatus: 'paid',
      totalAmount: 600000,
    },
    {
      orderNumber: 'GPJ-000006',
      customerName: 'Pak Joko',
      customerPhone: '086789012345',
      customerAddr: 'Jl. Diponegoro No. 20, Malang',
      status: 'cancelled',
      paymentMethod: 'cod',
      paymentStatus: 'unpaid',
      totalAmount: 450000,
    },
  ];

  for (const order of orders) {
    const item1 = products[Math.floor(Math.random() * products.length)];
    const item2 = products[Math.floor(Math.random() * products.length)];
    const qty1 = Math.floor(Math.random() * 12) + 1;
    const qty2 = Math.floor(Math.random() * 12) + 1;

    await prisma.order.create({
      data: {
        ...order,
        items: {
          create: [
            { productId: item1.id, quantity: qty1, price: item1.wholesalePrice },
            { productId: item2.id, quantity: qty2, price: item2.wholesalePrice },
          ],
        },
      },
    });
  }

  console.log('✅ Sample orders created successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
