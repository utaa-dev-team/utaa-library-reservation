import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;

const prismaClientSingleton = () => {
  // 1. PostgreSQL bağlantı havuzunu oluştur
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  
  // 2. Prisma Adaptörünü havuza bağla
  const adapter = new PrismaPg(pool);
  
  // 3. Prisma Client'ı adaptör ile başlat
  return new PrismaClient({
    adapter,
    log: ['query', 'error', 'warn'],
  });
};

// Global instance kontrolü (Development ortamında çoklu bağlantıyı önlemek için)
export const prisma = globalForPrisma.prisma || prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}