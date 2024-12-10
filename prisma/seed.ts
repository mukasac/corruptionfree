import { PrismaClient, UserRole, InstitutionType, InstitutionStatus, NomineeStatus } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function clearExistingData() {
    console.log('Clearing existing data...');
    try {
        await prisma.nomineeRating.deleteMany({});
        await prisma.institutionRating.deleteMany({});
        await prisma.comment.deleteMany({});
        await prisma.institutionComment.deleteMany({});
        await prisma.nominee.deleteMany({});
        await prisma.ratingCategory.deleteMany({});
        await prisma.institutionRatingCategory.deleteMany({});
        await prisma.institution.deleteMany({});
        await prisma.position.deleteMany({});
        await prisma.district.deleteMany({});
        await prisma.department.deleteMany({});
        await prisma.impactArea.deleteMany({});
        await prisma.user.deleteMany({});
        console.log('Existing data cleared successfully');
    } catch (error) {
        console.error('Error clearing existing data:', error);
        throw error;
    }
}

async function main() {
    try {
        console.log("Starting production seed...");

        await clearExistingData();

        // Create base admin user
        const hashedPassword = await bcryptjs.hash('adminPassword123', 12);
        const adminUser = await prisma.user.create({
            data: {
                name: "System Admin",
                email: "admin@corrupt.watch",
                password: hashedPassword,
                role: UserRole.ADMIN,
                isActive: true
            }
        });
        console.log('Created admin user:', adminUser.email);

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
        console.log('Creating nominee rating categories...');
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
            },
            {
                keyword: "lack-of-transparency",
                name: "Lack of Transparency",
                icon: "🕶️",
                description: "Deliberate concealment of information",
                weight: 3,
                examples: [
                    "Hidden decision making",
                    "Unclear processes",
                    "Information withholding"
                ],
                minimumEvidence: true,
                isActive: true
            },
            {
                keyword: "abuse-of-power",
                name: "Abuse of Power",
                icon: "👊",
                description: "Misusing authority for personal gain",
                weight: 5,
                examples: [
                    "Intimidation",
                    "Resource misuse",
                    "Authority abuse"
                ],
                minimumEvidence: true,
                isActive: true
            },
            {
                keyword: "cronyism",
                name: "Cronyism",
                icon: "🤝",
                description: "Favoring friends and associates",
                weight: 4,
                examples: [
                    "Biased appointments",
                    "Favoring associates",
                    "Unfair advantages"
                ],
                minimumEvidence: true,
                isActive: true
            },
            {
                keyword: "inconsistent-wealth",
                name: "Inconsistent Wealth",
                icon: "💎",
                description: "Unexplained accumulation of wealth",
                weight: 4,
                examples: [
                    "Unexplained assets",
                    "Luxury purchases",
                    "Hidden wealth"
                ],
                minimumEvidence: true,
                isActive: true
            },
            {
                keyword: "neglect-of-duty",
                name: "Neglect of Duty",
                icon: "🚫",
                description: "Failure to perform official duties",
                weight: 3,
                examples: [
                    "Chronic absenteeism",
                    "Task negligence",
                    "Responsibility avoidance"
                ],
                minimumEvidence: true,
                isActive: true
            }
        ];
        // Institution Rating Categories
        console.log('Creating institution rating categories...');
        const institutionCategories = [
            {
                keyword: "prevalence-of-bribery",
                name: "Prevalence of Bribery",
                icon: "💰",
                description: "Systematic occurrence of bribery",
                weight: 5,
                examples: [
                    "Widespread bribe collection",
                    "Systematic corruption",
                    "Regular illegal payments"
                ],
                minimumEvidence: true,
                isActive: true
            },
            {
                keyword: "extent-of-embezzlement",
                name: "Extent of Embezzlement",
                icon: "🏦",
                description: "Scale of funds misappropriation",
                weight: 5,
                examples: [
                    "Systemic fund diversion",
                    "Resource misappropriation",
                    "Financial misconduct"
                ],
                minimumEvidence: true,
                isActive: true
            },
            {
                keyword: "incidence-of-nepotism",
                name: "Incidence of Nepotism",
                icon: "👥",
                description: "Systematic favoritism of relatives",
                weight: 4,
                examples: [
                    "Family-based hiring",
                    "Relative favoritism",
                    "Nepotistic practices"
                ],
                minimumEvidence: true,
                isActive: true
            },
            {
                keyword: "frequency-of-fraud",
                name: "Frequency of Fraud",
                icon: "🎭",
                description: "Occurrence of fraudulent activities",
                weight: 5,
                examples: [
                    "Document falsification",
                    "False claims",
                    "Procurement manipulation"
                ],
                minimumEvidence: true,
                isActive: true
            },
            {
                keyword: "level-of-conflict",
                name: "Level of Conflict of Interest",
                icon: "⚖️",
                description: "Extent of conflicts of interest",
                weight: 4,
                examples: [
                    "Business conflicts",
                    "Personal interests",
                    "Decision bias"
                ],
                minimumEvidence: true,
                isActive: true
            },
            {
                keyword: "transparency-level",
                name: "Transparency of Operations",
                icon: "👁️",
                description: "Level of operational transparency",
                weight: 4,
                examples: [
                    "Information access",
                    "Process clarity",
                    "Decision transparency"
                ],
                minimumEvidence: true,
                isActive: true
            },
            {
                keyword: "abuse-of-authority",
                name: "Abuse of Authority",
                icon: "👊",
                description: "Institutional misuse of power",
                weight: 5,
                examples: [
                    "Power misuse",
                    "Authority abuse",
                    "Resource misappropriation"
                ],
                minimumEvidence: true,
                isActive: true
            },
            {
                keyword: "degree-of-cronyism",
                name: "Degree of Cronyism",
                icon: "🤝",
                description: "Extent of favoritism practices",
                weight: 4,
                examples: [
                    "Friend favoritism",
                    "Biased appointments",
                    "Unfair advantages"
                ],
                minimumEvidence: true,
                isActive: true
            },
            {
                keyword: "unexplained-wealth-officials",
                name: "Unexplained Wealth among Officials",
                icon: "💎",
                description: "Officials' unexplained wealth",
                weight: 4,
                examples: [
                    "Suspicious assets",
                    "Unexplained riches",
                    "Wealth discrepancies"
                ],
                minimumEvidence: true,
                isActive: true
            },
            {
                keyword: "corruption-responsiveness",
                name: "Responsiveness to Corruption",
                icon: "⚡",
                description: "Response to corruption reports",
                weight: 3,
                examples: [
                    "Report handling",
                    "Investigation speed",
                    "Action effectiveness"
                ],
                minimumEvidence: true,
                isActive: true
            }
        ];
        // Create nominee rating categories with relationships
        console.log('Creating nominee rating categories with relationships...');
        for (const category of nomineeCategories) {
            try {
                const created = await prisma.ratingCategory.create({
                    data: {
                        ...category,
                        departments: {
                            connect: departments.slice(0, 4).map(d => ({ id: d.id }))
                        },
                        impactAreas: {
                            connect: impactAreas.slice(0, 4).map(ia => ({ id: ia.id }))
                        }
                    }
                });
                console.log('Created nominee rating category:', created.name);
            } catch (error) {
                console.error(`Failed to create nominee rating category ${category.name}:`, error);
            }
        }

        // Create institution rating categories with relationships
        console.log('Creating institution rating categories with relationships...');
        for (const category of institutionCategories) {
            try {
                const created = await prisma.institutionRatingCategory.create({
                    data: {
                        ...category,
                        departments: {
                            connect: departments.slice(0, 4).map(d => ({ id: d.id }))
                        },
                        impactAreas: {
                            connect: impactAreas.slice(0, 4).map(ia => ({ id: ia.id }))
                        }
                    }
                });
                console.log('Created institution rating category:', created.name);
            } catch (error) {
                console.error(`Failed to create institution rating category ${category.name}:`, error);
            }
        }

        // Essential Districts
        console.log('Creating districts...');
        const districts = await Promise.all([
            { 
                name: "Kampala", 
                region: "Central", 
                description: "Capital city district",
                population: 1650000
            },
            { 
                name: "Wakiso", 
                region: "Central", 
                description: "Metropolitan district",
                population: 2000000
            },
            { 
                name: "Gulu", 
                region: "Northern", 
                description: "Northern regional hub",
                population: 400000
            },
            { 
                name: "Mbarara", 
                region: "Western", 
                description: "Western regional center",
                population: 500000
            },
            { 
                name: "Jinja", 
                region: "Eastern", 
                description: "Eastern industrial hub",
                population: 300000
            }
        ].map(async district => {
            const created = await prisma.district.create({ data: district });
            console.log('Created district:', created.name);
            return created;
        }));

        // Essential Positions
        console.log('Creating positions...');
        const positions = await Promise.all([
            { 
                name: "Director", 
                description: "Executive leadership position", 
                level: "Senior"
            },
            { 
                name: "Manager", 
                description: "Departmental management", 
                level: "Middle"
            },
            { 
                name: "Officer", 
                description: "Operational position", 
                level: "Junior"
            },
            { 
                name: "Coordinator", 
                description: "Program coordination", 
                level: "Middle"
            },
            { 
                name: "Supervisor", 
                description: "Team supervision", 
                level: "Middle"
            }
        ].map(async position => {
            const created = await prisma.position.create({ data: position });
            console.log('Created position:', created.name);
            return created;
        }));

        // Essential Institutions
        console.log('Creating institutions...');
        const institutions = await Promise.all([
            { 
                name: "Ministry of Finance",
                type: InstitutionType.GOVERNMENT,
                description: "Financial management institution",
                website: "https://finance.go.ug",
                status: InstitutionStatus.ACTIVE,
                totalRatings: 0,
                averageRating: null
            },
            { 
                name: "Ministry of Health",
                type: InstitutionType.GOVERNMENT,
                description: "Healthcare administration",
                website: "https://health.go.ug",
                status: InstitutionStatus.ACTIVE,
                totalRatings: 0,
                averageRating: null
            },
            { 
                name: "Ministry of Education",
                type: InstitutionType.GOVERNMENT,
                description: "Education administration",
                website: "https://education.go.ug",
                status: InstitutionStatus.ACTIVE,
                totalRatings: 0,
                averageRating: null
            },
            { 
                name: "Uganda Revenue Authority",
                type: InstitutionType.AGENCY,
                description: "Revenue collection agency",
                website: "https://ura.go.ug",
                status: InstitutionStatus.ACTIVE,
                totalRatings: 0,
                averageRating: null
            },
            { 
                name: "National Planning Authority",
                type: InstitutionType.AGENCY,
                description: "Development planning",
                website: "https://npa.go.ug",
                status: InstitutionStatus.ACTIVE,
                totalRatings: 0,
                averageRating: null
            }
        ].map(async institution => {
            const created = await prisma.institution.create({ data: institution });
            console.log('Created institution:', created.name);
            return created;
        }));

        console.log("Production seed completed successfully");
    } catch (error) {
        console.error("Error in production seed:", error);
        throw error;
    }
}

main()
    .catch((e) => {
        console.error("Error in seed execution:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        console.log('Database connection closed');
    });