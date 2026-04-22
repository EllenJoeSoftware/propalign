import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const properties = [
    {
      title: "Modern Apartment in Sandton",
      description: "A luxury 2-bedroom apartment with a view of the skyline.",
      price: 15000,
      location: "Sandton",
      propertyType: "Apartment",
      bedrooms: 2,
      bathrooms: 2,
      lat: -26.1076,
      lng: 28.0567,
      features: JSON.stringify(["Security", "Gym", "Pool"]),
      imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
    },
    {
      title: "Cozy Garden Cottage in Melville",
      description: "Quiet garden cottage perfect for students or young professionals.",
      price: 6500,
      location: "Melville",
      propertyType: "Cottage",
      bedrooms: 1,
      bathrooms: 1,
      lat: -26.1751,
      lng: 28.0055,
      features: JSON.stringify(["Garden", "Quiet", "Safe"]),
      imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
    },
    {
      title: "Family Home in Rosebank",
      description: "Spacious 4-bedroom house with a large backyard and electric fence.",
      price: 25000,
      location: "Rosebank",
      propertyType: "House",
      bedrooms: 4,
      bathrooms: 3,
      lat: -26.1455,
      lng: 28.0433,
      features: JSON.stringify(["Security", "Garden", "Garage"]),
      imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    },
    {
      title: "Studio in Cape Town CBD",
      description: "Compact studio near all transport routes and nightlife.",
      price: 12000,
      location: "Cape Town",
      propertyType: "Studio",
      bedrooms: 1,
      bathrooms: 1,
      lat: -33.9249,
      lng: 18.4241,
      features: JSON.stringify(["Nightlife", "Central", "Transport"]),
      imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
    }
  ];

  console.log("Seeding properties...");
  for (const p of properties) {
    await prisma.property.create({
      data: p
    });
  }
  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
