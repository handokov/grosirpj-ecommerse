import { createClient } from '@libsql/client'

// Use environment variables instead of hardcoded credentials
const tursoUrl = process.env.TURSO_DATABASE_URL || process.env.LIBSQL_URL
const tursoToken = process.env.TURSO_AUTH_TOKEN || process.env.LIBSQL_AUTH_TOKEN

if (!tursoUrl || !tursoToken) {
  console.error('❌ Error: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN environment variables are required')
  console.error('Set them in your .env file or pass them as environment variables')
  process.exit(1)
}

const turso = createClient({
  url: tursoUrl,
  authToken: tursoToken,
})

async function pushSchema() {
  console.log('Pushing schema to Turso database...')

  // Check existing tables
  const tables = await turso.execute("SELECT name FROM sqlite_master WHERE type='table'")
  console.log('Existing tables:', tables.rows.map(r => r.name))

  // Create Category table
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS Category (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      icon TEXT,
      image TEXT,
      "order" INTEGER NOT NULL DEFAULT 0,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)
  console.log('✅ Category table created')

  // Create Product table
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS Product (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      wholesalePrice REAL NOT NULL,
      minOrder INTEGER NOT NULL DEFAULT 1,
      stock INTEGER NOT NULL,
      images TEXT NOT NULL,
      categoryId TEXT NOT NULL,
      rating REAL NOT NULL DEFAULT 0,
      reviewCount INTEGER NOT NULL DEFAULT 0,
      sold INTEGER NOT NULL DEFAULT 0,
      featured BOOLEAN NOT NULL DEFAULT false,
      tags TEXT,
      weight TEXT,
      sizes TEXT,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (categoryId) REFERENCES Category(id)
    )
  `)
  console.log('✅ Product table created')

  // Create CartItem table
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS CartItem (
      id TEXT PRIMARY KEY NOT NULL,
      productId TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      size TEXT,
      sessionId TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (productId) REFERENCES Product(id)
    )
  `)
  console.log('✅ CartItem table created')

  // Create User table
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS User (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      isActive BOOLEAN NOT NULL DEFAULT true,
      lastLoginAt DATETIME,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)
  console.log('✅ User table created')

  // Create Order table
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS "Order" (
      id TEXT PRIMARY KEY NOT NULL,
      orderNumber TEXT NOT NULL UNIQUE,
      customerName TEXT NOT NULL,
      customerPhone TEXT NOT NULL,
      customerEmail TEXT,
      customerAddr TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      paymentMethod TEXT NOT NULL DEFAULT 'whatsapp',
      paymentStatus TEXT NOT NULL DEFAULT 'unpaid',
      totalAmount REAL NOT NULL,
      shippingCost REAL NOT NULL DEFAULT 0,
      courier TEXT,
      courierService TEXT,
      destinationCity TEXT,
      note TEXT,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)
  console.log('✅ Order table created')

  // Create OrderItem table
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS OrderItem (
      id TEXT PRIMARY KEY NOT NULL,
      orderId TEXT NOT NULL,
      productId TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      size TEXT,
      price REAL NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (orderId) REFERENCES "Order"(id),
      FOREIGN KEY (productId) REFERENCES Product(id)
    )
  `)
  console.log('✅ OrderItem table created')

  // Create _prisma_migrations table (Prisma needs this)
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS _prisma_migrations (
      id TEXT PRIMARY KEY NOT NULL,
      checksum TEXT NOT NULL,
      finished_at DATETIME,
      migration_name TEXT NOT NULL,
      logs TEXT,
      rolled_back_at DATETIME,
      started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      applied_steps_count INTEGER NOT NULL DEFAULT 0
    )
  `)
  console.log('✅ _prisma_migrations table created')

  // Create Banner table
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS Banner (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      image TEXT NOT NULL,
      link TEXT,
      "order" INTEGER NOT NULL DEFAULT 0,
      active BOOLEAN NOT NULL DEFAULT true,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)
  console.log('✅ Banner table created')

  // Add new columns to Order table if they don't exist
  try {
    const orderColumns = await turso.execute("PRAGMA table_info('Order')")
    const orderColumnNames = orderColumns.rows.map(r => r.name as string)

    if (!orderColumnNames.includes('courier')) {
      await turso.execute('ALTER TABLE "Order" ADD COLUMN courier TEXT')
      console.log('✅ Added courier column to Order table')
    }
    if (!orderColumnNames.includes('courierService')) {
      await turso.execute('ALTER TABLE "Order" ADD COLUMN courierService TEXT')
      console.log('✅ Added courierService column to Order table')
    }
    if (!orderColumnNames.includes('destinationCity')) {
      await turso.execute('ALTER TABLE "Order" ADD COLUMN destinationCity TEXT')
      console.log('✅ Added destinationCity column to Order table')
    }
  } catch (e) {
    console.log('⚠️ Column migration warning:', e)
  }

  // Add new columns to Product table if they don't exist (supplier info)
  try {
    const productColumns = await turso.execute("PRAGMA table_info('Product')")
    const productColumnNames = productColumns.rows.map(r => r.name as string)

    if (!productColumnNames.includes('supplierName')) {
      await turso.execute('ALTER TABLE Product ADD COLUMN supplierName TEXT')
      console.log('✅ Added supplierName column to Product table')
    }
    if (!productColumnNames.includes('supplierLink')) {
      await turso.execute('ALTER TABLE Product ADD COLUMN supplierLink TEXT')
      console.log('✅ Added supplierLink column to Product table')
    }
    if (!productColumnNames.includes('supplierPhone')) {
      await turso.execute('ALTER TABLE Product ADD COLUMN supplierPhone TEXT')
      console.log('✅ Added supplierPhone column to Product table')
    }
    if (!productColumnNames.includes('deletedAt')) {
      await turso.execute('ALTER TABLE Product ADD COLUMN deletedAt DATETIME')
      console.log('✅ Added deletedAt column to Product table')
    }
  } catch (e) {
    console.log('⚠️ Product column migration warning:', e)
  }

  // Check if admin user exists
  const adminUser = await turso.execute("SELECT id FROM User WHERE email = 'admin@grosirpj.com'")
  
  if (adminUser.rows.length === 0) {
    // Insert admin user - password should be set via env var or manually after deployment
    const adminPassword = process.env.ADMIN_PASSWORD
    if (!adminPassword) {
      console.log('⚠️ Skipping admin user creation: ADMIN_PASSWORD env var not set')
      console.log('   To create admin user, set ADMIN_PASSWORD env var and re-run this script')
    } else {
      // Dynamic import of bcryptjs for hashing
      const { hashSync } = await import('bcryptjs')
      const hashedPassword = hashSync(adminPassword, 10)
      
      const cuid = () => {
        const c = 'abcdefghijklmnopqrstuvwxyz0123456789'
        let id = 'c'
        for (let i = 0; i < 24; i++) {
          id += c[Math.floor(Math.random() * c.length)]
        }
        return id
      }

      await turso.execute({
        sql: `INSERT INTO User (id, name, email, password, role, isActive) VALUES (?, ?, ?, ?, ?, ?)`,
        args: [cuid(), 'Admin GrosirPJ', 'admin@grosirpj.com', hashedPassword, 'admin', 1]
      })
      console.log('✅ Admin user created (email: admin@grosirpj.com)')
    }
  } else {
    console.log('ℹ️ Admin user already exists')
  }

  // Create ShippingZone table
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS "ShippingZone" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "code" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "provinces" TEXT NOT NULL,
      "order" INTEGER NOT NULL DEFAULT 0,
      "active" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)
  try {
    await turso.execute('CREATE UNIQUE INDEX IF NOT EXISTS "ShippingZone_code_key" ON "ShippingZone"("code")')
  } catch { /* may already exist */ }
  try {
    await turso.execute('CREATE INDEX IF NOT EXISTS "ShippingZone_active_idx" ON "ShippingZone"("active")')
  } catch { /* ignore */ }
  try {
    await turso.execute('CREATE INDEX IF NOT EXISTS "ShippingZone_order_idx" ON "ShippingZone"("order")')
  } catch { /* ignore */ }
  console.log('✅ ShippingZone table created')

  // Create ShippingRate table
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS "ShippingRate" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "zoneId" TEXT NOT NULL,
      "courier" TEXT NOT NULL,
      "service" TEXT NOT NULL,
      "serviceLabel" TEXT NOT NULL,
      "firstKg" INTEGER NOT NULL,
      "nextKg" INTEGER NOT NULL,
      "etd" TEXT NOT NULL DEFAULT '-',
      "active" BOOLEAN NOT NULL DEFAULT true,
      "order" INTEGER NOT NULL DEFAULT 0,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("zoneId") REFERENCES "ShippingZone"("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `)
  try {
    await turso.execute('CREATE UNIQUE INDEX IF NOT EXISTS "ShippingRate_zoneId_courier_service_key" ON "ShippingRate"("zoneId", "courier", "service")')
  } catch { /* may already exist */ }
  try {
    await turso.execute('CREATE INDEX IF NOT EXISTS "ShippingRate_zoneId_idx" ON "ShippingRate"("zoneId")')
  } catch { /* ignore */ }
  try {
    await turso.execute('CREATE INDEX IF NOT EXISTS "ShippingRate_active_idx" ON "ShippingRate"("active")')
  } catch { /* ignore */ }
  try {
    await turso.execute('CREATE INDEX IF NOT EXISTS "ShippingRate_courier_idx" ON "ShippingRate"("courier")')
  } catch { /* ignore */ }
  console.log('✅ ShippingRate table created')

  // Add new columns to Order table (paymentProof, paymentNotes, paidAt, deletedAt)
  try {
    const orderColumns2 = await turso.execute("PRAGMA table_info('Order')")
    const orderColumnNames2 = orderColumns2.rows.map(r => r.name as string)
    if (!orderColumnNames2.includes('paymentProof')) {
      await turso.execute('ALTER TABLE "Order" ADD COLUMN paymentProof TEXT')
      console.log('✅ Added paymentProof column to Order table')
    }
    if (!orderColumnNames2.includes('paymentNotes')) {
      await turso.execute('ALTER TABLE "Order" ADD COLUMN paymentNotes TEXT')
      console.log('✅ Added paymentNotes column to Order table')
    }
    if (!orderColumnNames2.includes('paidAt')) {
      await turso.execute('ALTER TABLE "Order" ADD COLUMN paidAt DATETIME')
      console.log('✅ Added paidAt column to Order table')
    }
    if (!orderColumnNames2.includes('deletedAt')) {
      await turso.execute('ALTER TABLE "Order" ADD COLUMN deletedAt DATETIME')
      console.log('✅ Added deletedAt column to Order table')
    }
    if (!orderColumnNames2.includes('note')) {
      await turso.execute('ALTER TABLE "Order" ADD COLUMN note TEXT')
      console.log('✅ Added note column to Order table')
    }
  } catch (e) {
    console.log('⚠️ Order column migration warning:', e)
  }

  // Add productName and productImage columns to OrderItem if missing
  try {
    const oiColumns = await turso.execute("PRAGMA table_info('OrderItem')")
    const oiColumnNames = oiColumns.rows.map(r => r.name as string)
    if (!oiColumnNames.includes('productName')) {
      await turso.execute('ALTER TABLE "OrderItem" ADD COLUMN productName TEXT')
      console.log('✅ Added productName column to OrderItem table')
    }
    if (!oiColumnNames.includes('productImage')) {
      await turso.execute('ALTER TABLE "OrderItem" ADD COLUMN productImage TEXT')
      console.log('✅ Added productImage column to OrderItem table')
    }
  } catch (e) {
    console.log('⚠️ OrderItem column migration warning:', e)
  }

  // Verify all tables
  const finalTables = await turso.execute("SELECT name FROM sqlite_master WHERE type='table'")
  console.log('\n📋 All tables in Turso:', finalTables.rows.map(r => r.name))

  console.log('\n🎉 Schema push complete!')
  await turso.close()
}

pushSchema().catch(err => {
  console.error('❌ Error:', err)
  process.exit(1)
})
