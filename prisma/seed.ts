// prisma/seed.ts
import { PrismaClient, UserRole, BoothStatus } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // Clean existing data
    await prisma.$transaction([
        prisma.booking.deleteMany(),
        prisma.booth.deleteMany(),
        prisma.boothType.deleteMany(),
        prisma.user.deleteMany(),
        prisma.company.deleteMany(),
    ]);

    // Create Booth Types (based on your presentation tiers)
    const boothTypes = await Promise.all([
        prisma.boothType.create({
            data: {
                name: 'Tier 1',
                size: '9x3',
                price: 5000000,
                features: {
                    tvScreens: {
                        count: 2,
                        size: 55
                    },
                    furniture: {
                        counterTables: 4,
                        counterChairs: 4,
                        singleSofas: 2,
                        doubleSofa: 1,
                        coffeeTables: 1
                    },
                    extras: {
                        floorPlatform: true,
                        electricity: true,
                        branding: true,
                        fan: true,
                        flowerPots: 2
                    }
                }
            }
        }),
        prisma.boothType.create({
            data: {
                name: 'Tier 2',
                size: '6x3',
                price: 3500000,
                features: {
                    tvScreens: {
                        count: 1,
                        size: 55
                    },
                    furniture: {
                        counterTables: 1,
                        counterChairs: 2,
                        singleSofas: 2,
                        doubleSofa: 1,
                        coffeeTables: 1
                    },
                    extras: {
                        floorPlatform: true,
                        electricity: true,
                        branding: true
                    }
                }
            }
        }),
        prisma.boothType.create({
            data: {
                name: 'Tier 3',
                size: '3x3',
                price: 3000000,
                features: {
                    tvScreens: {
                        count: 1,
                        size: 50
                    },
                    furniture: {
                        counterTables: 1,
                        counterChairs: 2
                    },
                    extras: {
                        floorPlatform: true,
                        electricity: true,
                        branding: true
                    }
                }
            }
        }),
        prisma.boothType.create({
            data: {
                name: 'Tier 4 Pod',
                size: '3x1.5',
                price: 1000000,
                features: {
                    tvScreens: {
                        count: 1,
                        size: 50
                    },
                    furniture: {
                        counterTables: 1,
                        counterChairs: 1
                    },
                    extras: {
                        branding: true,
                        electricity: true
                    }
                }
            }
        })
    ]);

    // Create sample companies
    const companies = await Promise.all([
        prisma.company.create({
            data: {
                name: 'John Deere Tanzania',
                registrationNumber: 'JD123456',
                email: 'contact@deere.co.tz',
                phone: '+255123456789',
                address: 'Dar es Salaam, Tanzania',
                verified: true
            }
        }),
        prisma.company.create({
            data: {
                name: 'Agrosol Limited',
                registrationNumber: 'AG789012',
                email: 'info@agrosol.co.tz',
                phone: '+255987654321',
                address: 'Arusha, Tanzania',
                verified: true
            }
        }),
        prisma.company.create({
            data: {
                name: 'Tanzania Fertilizer Company',
                registrationNumber: 'TFC345678',
                email: 'contact@tfctz.com',
                phone: '+255765432198',
                address: 'Moshi, Tanzania',
                verified: true
            }
        })
    ]);

    // Create users
    const hashedPassword = await hash('Password123', 12);

    const users = await Promise.all([
        prisma.user.create({
            data: {
                email: 'admin@nanenane.co.tz',
                password: hashedPassword,
                role: UserRole.ADMIN,
                companyId: companies[0].id,
                firstName: 'Admin',
                lastName: 'User'
            }
        }),
        ...companies.map(company =>
            prisma.user.create({
                data: {
                    email: `exhibitor@${company.name.toLowerCase().replace(/\s+/g, '-')}.co.tz`,
                    password: hashedPassword,
                    role: UserRole.EXHIBITOR,
                    companyId: company.id,
                    firstName: 'Exhibitor',
                    lastName: company.name
                }
            })
        )
    ]);

    // Create booths
    const booths = [];
    let boothNumber = 1;

    // Create booths for each type
    for (const type of boothTypes) {
        const numberOfBooths = type.name === 'Tier 4 Pod' ? 8 : 4;

        for (let i = 0; i < numberOfBooths; i++) {
            booths.push(
                await prisma.booth.create({
                    data: {
                        boothNumber: `B${String(boothNumber++).padStart(3, '0')}`,
                        typeId: type.id,
                        locationX: i * 3,
                        locationY: boothTypes.indexOf(type) * 3,
                        status: i === 0 ? BoothStatus.BOOKED : BoothStatus.AVAILABLE
                    }
                })
            );
        }
    }

    // Create some bookings
    await Promise.all([
        prisma.booking.create({
            data: {
                boothId: booths[0].id,
                companyId: companies[0].id,
                paymentStatus: 'paid'
            }
        }),
        prisma.booking.create({
            data: {
                boothId: booths[4].id,
                companyId: companies[1].id,
                paymentStatus: 'pending'
            }
        })
    ]);

    console.log(`Seed data created successfully`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });