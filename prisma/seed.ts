// prisma/seed.ts
import { PrismaClient, UserRole, InstitutionType, InstitutionStatus, NomineeStatus, RatingStatus, CommentStatus } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function clearExistingData() {
    console.log('Clearing existing data...');
    try {
        // Delete in correct order based on dependencies
        const tables = [
            'nomineeRating',
            'institutionRating',
            'comment',
            'institutionComment',
            'nominee',
            'ratingCategory',
            'institutionRatingCategory',
            'institution',
            'position',
            'district',
            'department',
            'impactArea',
            'user'
        ] as const;

        for (const table of tables) {
            try {
                // @ts-expect-error Dynamically accessing prisma client tables
                await prisma[table].deleteMany({});
                console.log(`Cleared ${table} table`);
            } catch {
                // Log error without using the error variable
                console.log(`Table ${table} might not exist yet, continuing...`);
            }
        }

        console.log('Existing data cleared successfully');
    } catch (error) {
        console.error('Error clearing existing data:', error instanceof Error ? error.message : String(error));
        console.log('Continuing with seed despite clear errors...');
    }
}

async function main() {
    try {
        console.log("Starting production seed...");

        await clearExistingData();

        // Create test users with different roles
        console.log('Creating test users...');
        const hashedPassword = await bcryptjs.hash('Password123!', 12);
        const users = await Promise.all([
            // Admin user
            prisma.user.create({
                data: {
                    name: "System Admin",
                    email: "admin@corrupt.watch",
                    password: hashedPassword,
                    role: UserRole.ADMIN,
                    isActive: true
                }
            }),
            // Moderator
            prisma.user.create({
                data: {
                    name: "Content Moderator",
                    email: "moderator@corrupt.watch",
                    password: hashedPassword,
                    role: UserRole.MODERATOR,
                    isActive: true
                }
            }),
            // Regular test user
            prisma.user.create({
                data: {
                    name: "Test User",
                    email: "user@corrupt.watch",
                    password: hashedPassword,
                    role: UserRole.USER,
                    isActive: true
                }
            })
        ]);
        console.log('Created test users');

        // Essential Impact Areas
        console.log('Creating impact areas...');
        const impactAreas = await Promise.all([
            { name: "Public Finance", description: "Impact on public funds and financial management", severity: 5 },
            { name: "Service Delivery", description: "Impact on public service delivery", severity: 4 },
            { name: "Governance", description: "Impact on institutional governance", severity: 5 },
            { name: "Social Impact", description: "Impact on society and communities", severity: 4 },
            { name: "Public Trust", description: "Impact on public confidence", severity: 3 },
            { name: "Economic Development", description: "Impact on economic growth and development", severity: 4 },
            { name: "Infrastructure", description: "Impact on public infrastructure", severity: 4 },
            { name: "Healthcare", description: "Impact on public health services", severity: 5 },
            { name: "Education", description: "Impact on educational services", severity: 5 },
            { name: "Environmental", description: "Impact on environmental protection", severity: 4 }
        ].map(async (area) => {
            const created = await prisma.impactArea.create({ data: area });
            console.log('Created impact area:', created.name);
            return created;
        }));

        // Essential Departments
        console.log('Creating departments...');
        const departments = await Promise.all([
            { name: "Finance", description: "Financial management and oversight" },
            { name: "Procurement", description: "Procurement and supply chain" },
            { name: "Administration", description: "Administrative management" },
            { name: "Operations", description: "Operational activities" },
            { name: "Human Resources", description: "Personnel management" },
            { name: "Legal", description: "Legal affairs and compliance" },
            { name: "Audit", description: "Internal audit and control" },
            { name: "Planning", description: "Strategic planning and development" },
            { name: "Public Relations", description: "Communication and public affairs" },
            { name: "Technical Services", description: "Technical operations and support" }
        ].map(async (dept) => {
            const created = await prisma.department.create({ data: dept });
            console.log('Created department:', created.name);
            return created;
        }));

        // Nominee Rating Categories
        console.log('Creating rating categories...');
        const nomineeCategories = [
            {
                keyword: "bribery",
                name: "Bribery",
                icon: "💰",
                description: "Taking or soliciting bribes for services or favors",
                weight: 5,
                examples: [
                    "Demanding payment for services",
                    "Accepting kickbacks from contractors",
                    "Soliciting bribes for permits"
                ],
                minimumEvidence: true,
                isActive: true
            },
            {
                keyword: "embezzlement",
                name: "Embezzlement",
                icon: "🏦",
                description: "Theft or misappropriation of public funds",
                weight: 5,
                examples: [
                    "Diverting public funds",
                    "Unauthorized use of resources",
                    "Financial misappropriation"
                ],
                minimumEvidence: true,
                isActive: true
            },
            {
                keyword: "nepotism",
                name: "Nepotism",
                icon: "👥",
                description: "Favoring relatives in appointments and contracts",
                weight: 4,
                examples: [
                    "Hiring family members",
                    "Promoting relatives unfairly",
                    "Awarding contracts to family"
                ],
                minimumEvidence: true,
                isActive: true
            },
            {
                keyword: "fraud",
                name: "Fraud",
                icon: "🎭",
                description: "Deliberate deception for personal gain",
                weight: 5,
                examples: [
                    "Falsifying documents",
                    "Making false claims",
                    "Procurement fraud"
                ],
                minimumEvidence: true,
                isActive: true
            },
            {
                keyword: "conflict-of-interest",
                name: "Conflict of Interest",
                icon: "⚖️",
                description: "Using position for personal benefit",
                weight: 4,
                examples: [
                    "Hidden business interests",
                    "Personal benefit from decisions",
                    "Undisclosed relationships"
                ],
                minimumEvidence: true,
                isActive: true
            }
        ];

        // Institution Rating Categories
        const institutionCategories = [
            {
                keyword: "systemic-corruption",
                name: "Systemic Corruption",
                icon: "🏢",
                description: "Widespread corruption within the institution",
                weight: 5,
                examples: [
                    "Institutionalized bribery",
                    "Systematic fund misuse",
                    "Corrupt organizational culture"
                ],
                minimumEvidence: true,
                isActive: true
            },
            {
                keyword: "procurement-irregularities",
                name: "Procurement Irregularities",
                icon: "📋",
                description: "Issues in procurement processes",
                weight: 4,
                examples: [
                    "Inflated contracts",
                    "Biased vendor selection",
                    "Procurement manipulation"
                ],
                minimumEvidence: true,
                isActive: true
            },
            {
                keyword: "mismanagement",
                name: "Mismanagement",
                icon: "❌",
                description: "Poor management of resources and operations",
                weight: 4,
                examples: [
                    "Resource wastage",
                    "Poor oversight",
                    "Ineffective controls"
                ],
                minimumEvidence: true,
                isActive: true
            }
        ];

        // Create rating categories with relationships
        console.log('Creating rating categories with relationships...');
        for (const category of nomineeCategories) {
            try {
                const created = await prisma.ratingCategory.create({
                    data: {
                        ...category,
                        departments: {
                            connect: departments.slice(0, 3).map(d => ({ id: d.id }))
                        },
                        impactAreas: {
                            connect: impactAreas.slice(0, 3).map(ia => ({ id: ia.id }))
                        }
                    }
                });
                console.log('Created nominee rating category:', created.name);
            } catch (error) {
                console.error(`Failed to create nominee rating category ${category.name}:`, error);
            }
        }

        for (const category of institutionCategories) {
            try {
                const created = await prisma.institutionRatingCategory.create({
                    data: {
                        ...category,
                        departments: {
                            connect: departments.slice(0, 3).map(d => ({ id: d.id }))
                        },
                        impactAreas: {
                            connect: impactAreas.slice(0, 3).map(ia => ({ id: ia.id }))
                        }
                    }
                });
                console.log('Created institution rating category:', created.name);
            } catch (error) {
                console.error(`Failed to create institution rating category ${category.name}:`, error);
            }
        }

        // Create Districts
        console.log('Creating districts...');
        const districts = await Promise.all([
            { 
                name: "Nairobi", 
                region: "Central", 
                description: "Capital city region",
                population: 4397073
            },
            { 
                name: "Mombasa", 
                region: "Coast", 
                description: "Coastal region hub",
                population: 1208333
            },
            { 
                name: "Kisumu", 
                region: "Western", 
                description: "Lake region center",
                population: 968909
            }
        ].map(async (district) => {
            const created = await prisma.district.create({ data: district });
            console.log('Created district:', created.name);
            return created;
        }));

        // Create Positions
        console.log('Creating positions...');
        const positions = await Promise.all([
            { 
                name: "Director General", 
                description: "Top executive position", 
                level: "Executive"
            },
            { 
                name: "Department Head", 
                description: "Senior management position", 
                level: "Senior"
            },
            { 
                name: "Regional Manager", 
                description: "Regional leadership role", 
                level: "Middle"
            }
        ].map(async (position) => {
            const created = await prisma.position.create({ data: position });
            console.log('Created position:', created.name);
            return created;
        }));

        // Create Institutions
        console.log('Creating institutions...');
        const institutions = await Promise.all([
            {
                name: "Ministry of Finance",
                type: InstitutionType.GOVERNMENT,
                description: "National financial management",
                website: "https://treasury.go.ke",
                status: InstitutionStatus.ACTIVE
            },
            {
                name: "Ministry of Health",
                type: InstitutionType.GOVERNMENT,
                description: "National health administration",
                website: "https://health.go.ke",
                status: InstitutionStatus.ACTIVE
            },
            {
                name: "Ministry of Education",
                type: InstitutionType.GOVERNMENT,
                description: "National education management",
                website: "https://education.go.ke",
                status: InstitutionStatus.ACTIVE
            }
        ].map(async (institution) => {
            const created = await prisma.institution.create({ data: institution });
            console.log('Created institution:', created.name);
            return created;
        }));

    // Create Nominees
console.log('Creating nominees...');
const nominees = await Promise.all([
    {
        name: "John Doe",
        title: "Director of Finance",
        biography: "20 years in public service",
        positionId: positions[0].id,
        institutionId: institutions[0].id,
        districtId: districts[0].id,
        status: NomineeStatus.VERIFIED,
        evidence: "Multiple audit reports",
        documents: ["audit2023.pdf"],
        totalRatings: 0,
        averageRating: 0
    },
    {
        name: "Jane Smith",
        title: "Head of Procurement",
        biography: "15 years in procurement",
        positionId: positions[1].id,
        institutionId: institutions[1].id,
        districtId: districts[1].id,
        status: NomineeStatus.PENDING,
        evidence: "Procurement irregularities",
        documents: ["report2023.pdf"],
        totalRatings: 0,
        averageRating: 0
    }
].map(async (nominee) => {
    const created = await prisma.nominee.create({ data: nominee });
    console.log('Created nominee:', created.name);
    return created;
}));

// Create ratings and comments
console.log('Creating ratings and comments...');
for (const nominee of nominees) {
    // Create nominee rating
    await prisma.nomineeRating.create({
        data: {
            userId: users[2].id,
            nomineeId: nominee.id,
            ratingCategoryId: 1,
            score: 4.5,
            severity: 3,
            evidence: "Sample evidence text",
            documents: ["evidence1.pdf"],
            status: RatingStatus.VERIFIED
        }
    });

    // Create comment
    await prisma.comment.create({
        data: {
            userId: users[2].id,
            nomineeId: nominee.id,
            content: "Sample comment about corruption allegations",
            status: CommentStatus.APPROVED
        }
    });
}

// Create institution ratings and comments
for (const institution of institutions) {
    await prisma.institutionRating.create({
        data: {
            userId: users[2].id,
            institutionId: institution.id,
            ratingCategoryId: 1,
            score: 3.5,
            severity: 4,
            evidence: "Sample institutional evidence",
            documents: ["inst_evidence1.pdf"],
            status: RatingStatus.VERIFIED
        }
    });

    await prisma.institutionComment.create({
        data: {
            userId: users[2].id,
            institutionId: institution.id,
            content: "Comment about institutional corruption",
            status: CommentStatus.APPROVED
        }
    });
}

console.log("Seed completed successfully");
} catch (error) {
    console.error("Error in seed execution:", error);
    throw error;
} finally {
    await prisma.$disconnect();
    console.log('Database connection closed');
}
}

// Execute main function
main()
    .catch((e) => {
        console.error("Error in seed execution:", e);
        process.exit(1);
    });