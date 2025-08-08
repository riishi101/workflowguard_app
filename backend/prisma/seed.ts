import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create trial plan
  await prisma.plan.upsert({
    where: { id: 'trial' },
    update: {},
    create: {
      id: 'trial',
      name: 'Trial',
      price: 0,
      interval: 'month',
      description: '21-day free trial for HubSpot App Marketplace users',
      features: JSON.stringify([
        'Basic workflow protection',
        'Email support',
        '5 workflows',
        'Version history',
        'Manual backups',
        'Basic rollback',
        '21-day trial period',
        'Audit trails'
      ]),
    },
  });

  // Create default plans
  await prisma.plan.upsert({
    where: { id: 'starter' },
    update: {},
    create: {
      id: 'starter',
      name: 'Starter',
      price: 19,
      interval: 'month',
      description: 'Perfect for small teams',
      features: JSON.stringify([
        'Basic workflow protection',
        'Email support',
        '5 workflows',
        'Version history',
        'Manual backups',
        'Basic rollback'
      ]),
    },
  });

  await prisma.plan.upsert({
    where: { id: 'professional' },
    update: {},
    create: {
      id: 'professional',
      name: 'Professional',
      price: 49,
      interval: 'month',
      description: 'Ideal for growing businesses',
      features: JSON.stringify([
        'Advanced workflow protection',
        'Priority support',
        '25 workflows',
        'Complete version history',
        'Automated backups',
        'Change notifications',
        'Advanced rollback',
        'Side-by-side comparisons',
        'Compliance reporting',
        'Audit trails'
      ]),
    },
  });

  await prisma.plan.upsert({
    where: { id: 'enterprise' },
    update: {},
    create: {
      id: 'enterprise',
      name: 'Enterprise',
      price: 99,
      interval: 'month',
      description: 'For large organizations',
      features: JSON.stringify([
        'Enterprise workflow protection',
        '24/7 support',
        'Unlimited workflows',
        'Advanced analytics',
        'Custom integrations',
        'Automated backups',
        'Real-time change notifications',
        'Approval workflows',
        'Advanced compliance reporting',
        'Complete audit trails',
        'Team collaboration features',
        'Custom retention policies',
        'Advanced security features',
        'API access',
        'White-label options'
      ]),
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