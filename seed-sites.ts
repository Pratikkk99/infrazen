// Seed script to add sample sites to the database
// Run with: npx tsx seed-sites.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting to seed sites...');

    try {
        // Get the first organization
        const org = await prisma.organizations.findFirst();

        if (!org) {
            console.error('❌ No organization found. Please create an organization first.');
            return;
        }

        console.log(`✅ Found organization: ${org.org_name} (ID: ${org.org_id})`);

        // Check if sites already exist
        const existingSites = await prisma.org_sites.findMany({
            where: { org_id: org.org_id }
        });

        if (existingSites.length > 0) {
            console.log(`⚠️  Organization already has ${existingSites.length} sites.`);
            console.log('Do you want to add more sites anyway? (This will add 8 new sites)');
        }

        // Sample sites data
        const sitesToCreate = [
            {
                site_name: 'Tower A - Main Building',
                site_type: 'RESIDENTIAL_BUILDING' as any,
                address_line1: 'Koregaon Park Main Road',
                city: 'Pune',
                state: 'Maharashtra',
                pincode: '411001',
                area_sqft: 25000,
                floor_count: 15
            },
            {
                site_name: 'Manufacturing Unit 1',
                site_type: 'INDUSTRIAL_PLANT' as any,
                address_line1: 'MIDC Chakan Phase 2',
                city: 'Pune',
                state: 'Maharashtra',
                pincode: '410501',
                area_sqft: 50000,
                floor_count: 3
            },
            {
                site_name: 'Warehouse Complex',
                site_type: 'WAREHOUSE' as any,
                address_line1: 'Talegaon Industrial Area',
                city: 'Pune',
                state: 'Maharashtra',
                pincode: '410507',
                area_sqft: 35000,
                floor_count: 2
            },
            {
                site_name: 'Commercial Plaza',
                site_type: 'OFFICE_BUILDING' as any,
                address_line1: 'Baner Road',
                city: 'Pune',
                state: 'Maharashtra',
                pincode: '411045',
                area_sqft: 18000,
                floor_count: 8
            },
            {
                site_name: 'Blue Ridge Apartments',
                site_type: 'RESIDENTIAL_BUILDING' as any,
                address_line1: 'Hinjewadi Phase 1',
                city: 'Pune',
                state: 'Maharashtra',
                pincode: '411057',
                area_sqft: 45000,
                floor_count: 22
            },
            {
                site_name: 'Sterling Towers - Block A',
                site_type: 'RESIDENTIAL_BUILDING' as any,
                address_line1: 'Kalyani Nagar',
                city: 'Pune',
                state: 'Maharashtra',
                pincode: '411006',
                area_sqft: 30000,
                floor_count: 18
            },
            {
                site_name: 'Tech Park Building B',
                site_type: 'OFFICE_BUILDING' as any,
                address_line1: 'Viman Nagar IT Hub',
                city: 'Pune',
                state: 'Maharashtra',
                pincode: '411014',
                area_sqft: 22000,
                floor_count: 10
            },
            {
                site_name: 'Retail Hub Phoenix',
                site_type: 'RETAIL_STORE' as any,
                address_line1: 'FC Road',
                city: 'Pune',
                state: 'Maharashtra',
                pincode: '411004',
                area_sqft: 15000,
                floor_count: 4
            }
        ];

        // Create sites
        let created = 0;
        for (const siteData of sitesToCreate) {
            try {
                const site = await prisma.org_sites.create({
                    data: {
                        org_id: org.org_id,
                        ...siteData,
                        last_update_user: 1
                    }
                });
                console.log(`  ✅ Created: ${site.site_name}`);
                created++;
            } catch (error) {
                console.error(`  ❌ Failed to create ${siteData.site_name}:`, error);
            }
        }

        console.log(`\n🎉 Successfully created ${created} out of ${sitesToCreate.length} sites!`);

        // Display all sites for this org
        const allSites = await prisma.org_sites.findMany({
            where: { org_id: org.org_id },
            orderBy: { site_name: 'asc' }
        });

        console.log(`\n📋 Total sites for "${org.org_name}": ${allSites.length}`);
        allSites.forEach((site, idx) => {
            console.log(`  ${idx + 1}. ${site.site_name} (${site.site_type}) - ${site.city}`);
        });

    } catch (error) {
        console.error('❌ Error seeding sites:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main()
    .then(() => {
        console.log('\n✅ Seed script completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Failed to run seed script:', error);
        process.exit(1);
    });
