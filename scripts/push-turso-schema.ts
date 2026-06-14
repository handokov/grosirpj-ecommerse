import { createClient } from '@libsql/client'

const turso = createClient({
  url: 'libsql://grosirpj-ecommerse-handokov.aws-ap-northeast-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODEyNDU0NTAsImlkIjoiMDE5ZWJhN2QtNWIwMS03ODAzLThiMmQtNTk5NzZkYWM5Njg0IiwicmlkIjoiNzliZTc0ZjgtMTJlNS00OWMwLTllZGMtNDAzYWU4NmQ1OWZmIn0.DEo1_5Q4GcsrxZL3kTAuCQcY3G4LpwXiCmA53bHJSuDaOijPUdNPZanVfua8Pz6Zxxrt6cdJomeXlOcerKkMDA',
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

  // Check if admin user exists
  const adminUser = await turso.execute("SELECT id FROM User WHERE email = 'admin@grosirpj.com'")
  
  if (adminUser.rows.length === 0) {
    // Insert admin user with pre-hashed password
    // Password: admin123 -> bcrypt hash
    const hashedPassword = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy' // admin123
    
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
    console.log('✅ Admin user created (email: admin@grosirpj.com, password: admin123)')
  } else {
    console.log('ℹ️ Admin user already exists')
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
