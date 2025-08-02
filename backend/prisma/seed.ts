import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create default plans
  await prisma.plan.upsert({
    where: { id: 'starter' },
    update: {},
    create: {
      id: 'starter',
      name: 'Starter',
      price: 29,
      interval: 'month',
      description: 'Perfect for small teams',
      features: JSON.stringify(['Basic workflow protection', 'Email support', '5 workflows']),
    },
  });

  await prisma.plan.upsert({
    where: { id: 'professional' },
    update: {},
    create: {
      id: 'professional',
      name: 'Professional',
      price: 99,
      interval: 'month',
      description: 'Ideal for growing businesses',
      features: JSON.stringify(['Advanced workflow protection', 'Priority support', 'Unlimited workflows', 'Version history']),
    },
  });

  await prisma.plan.upsert({
    where: { id: 'enterprise' },
    update: {},
    create: {
      id: 'enterprise',
      name: 'Enterprise',
      price: 299,
      interval: 'month',
      description: 'For large organizations',
      features: JSON.stringify(['Enterprise workflow protection', '24/7 support', 'Unlimited workflows', 'Advanced analytics', 'Custom integrations']),
    },
  });

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 