import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed Users
  const users = await prisma.user.createMany({
    data: [
      { name: 'Alice', email: 'alice@example.com', password: 'password123' },
      { name: 'Bob', email: 'bob@example.com', password: 'password456' },
    ],
  });

  // Seed Districts
  const districts = await prisma.district.createMany({
    data: [
      { name: 'Central District', region: 'Central' },
      { name: 'Northern District', region: 'North' },
    ],
  });

  // Seed Institutions
  const institutions = await prisma.institution.createMany({
    data: [
      { name: 'Health Ministry' },
      { name: 'Education Ministry' },
    ],
  });

  // Seed Positions
  const positions = await prisma.position.createMany({
    data: [
      { name: 'Manager' },
      { name: 'Supervisor' },
    ],
  });

  // Seed Nominees
  const nominees = await prisma.nominee.createMany({
    data: [
      { name: 'John Doe', positionId: 1, institutionId: 1, districtId: 1 },
      { name: 'Jane Smith', positionId: 2, institutionId: 2, districtId: 2 },
    ],
  });

  // Seed Rating Categories
  const ratingCategories = await prisma.ratingCategory.createMany({
    data: [
      {
        keyword: 'performance',
        name: 'Performance',
        icon: '🏅',
        description: 'Measures overall performance',
        weight: 5,
        examples: ['Timeliness', 'Quality of work'],
      },
      {
        keyword: 'integrity',
        name: 'Integrity',
        icon: '🔒',
        description: 'Measures adherence to moral principles',
        weight: 4,
        examples: ['Honesty', 'Ethical behavior'],
      },
    ],
  });

  // Seed Nominee Ratings
  const nomineeRatings = await prisma.nomineeRating.createMany({
    data: [
      {
        userId: 1,
        nomineeId: 1,
        ratingCategoryId: 1,
        score: 85,
        severity: 'Moderate',
        evidence: 'Met project deadlines on time.',
      },
      {
        userId: 2,
        nomineeId: 2,
        ratingCategoryId: 2,
        score: 90,
        severity: 'Critical',
        evidence: 'Exemplified strong ethical leadership.',
      },
    ],
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
