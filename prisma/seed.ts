import { prisma } from 'src/lib/prisma';

async function main() {
  console.log('Seeding database...');

  // remove old data from db, so the data will not be stacked if we run multiple times
  // remove from anak paling bawah booking -> seet -> event/user
  await prisma.booking.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  console.log('Database bersih');

  // bikin dummy user buat testing
  const user = await prisma.user.create({
    data: {
      email: 'tester@example.com',
      name: 'Si Paling War',
      password: 'hashed_password_palsu',
    },
  });

  console.log(`User sudah dibuat ${user.email} (ID: ${user.id})`);

  // bikin event
  const event = await prisma.event.create({
    data: {
      name: 'Sheila On 7: Tunggu Aku di Depok',
      date: new Date('2025-11-15T20:00:00Z'),
      location: 'Cilodong, Depok',
    },
  });

  console.log(`Event sudah dibuat ${event.name} (ID: ${event.id})`);

  // generate 50 kursi (A1- A50)
  const seatsData = Array.from({ length: 50 }, (_, index) => ({
    seatNumber: `A${index + 1}`,
    price: 1500000,
    eventId: event.id,
  }));

  // pake createMany biar cepet (satu query insert batch)
  await prisma.seat.createMany({
    data: seatsData,
  });

  console.log(
    `Berhasil generate ${seatsData.length} kursi untuk event ${event.name}`,
  );

  console.log('Seeding selesai');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
