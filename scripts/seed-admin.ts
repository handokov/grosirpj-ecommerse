import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await hash('admin123', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@grosirpj.com' },
    update: {},
    create: {
      name: 'Admin GrosirPJ',
      email: 'admin@grosirpj.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
    },
  });

  console.log('✅ Admin user created:', admin.email);
  console.log('📧 Email: admin@grosirpj.com');
  console.log('🔑 Password: admin123');

  const staffPassword = await hash('staff123', 12);
  const staff = await prisma.user.upsert({
    where: { email: 'staff@grosirpj.com' },
    update: {},
    create: {
      name: 'Staff GrosirPJ',
      email: 'staff@grosirpj.com',
      password: staffPassword,
      role: 'staff',
      isActive: true,
    },
  });

  console.log('✅ Staff user created:', staff.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
