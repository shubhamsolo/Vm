import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const routeData = [
  { route_id: "R001", vesselType: "Container", fuelType: "HFO", year: 2024, ghg_intensity: 91.0, fuelConsumption: 5000, distance: 12000, totalEmissions: 4500, is_baseline: true }, // Set R001 as baseline
  { route_id: "R002", vesselType: "BulkCarrier", fuelType: "LNG", year: 2024, ghg_intensity: 88.0, fuelConsumption: 4800, distance: 11500, totalEmissions: 4200, is_baseline: false },
  { route_id: "R003", vesselType: "Tanker", fuelType: "MGO", year: 2024, ghg_intensity: 93.5, fuelConsumption: 5100, distance: 12500, totalEmissions: 4700, is_baseline: false },
  { route_id: "R004", vesselType: "RoRo", fuelType: "HFO", year: 2025, ghg_intensity: 89.2, fuelConsumption: 4900, distance: 11800, totalEmissions: 4300, is_baseline: false },
  { route_id: "R005", vesselType: "Container", fuelType: "LNG", year: 2025, ghg_intensity: 90.5, fuelConsumption: 4950, distance: 11900, totalEmissions: 4400, is_baseline: false },
];

async function main() {
  console.log(`Start seeding ...`);
  await prisma.routes.deleteMany(); // Clear table for fresh seed

  for (const r of routeData) {
    const route = await prisma.routes.create({
      data: r,
    });
    console.log(`Created route with id: ${route.id}`);
  }
  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });