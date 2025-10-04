import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(){
  const users = await prisma.user.findMany({ select: { id: true, email: true, name: true, roles: true, activeRole: true, isActive: true } });
  console.log(JSON.stringify(users, null, 2));
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
