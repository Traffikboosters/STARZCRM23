import { db } from "./db";
import { users, companies, contacts } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function initializeDatabase() {
  try {
    // Check if admin user already exists
    const existingAdmin = await db.select().from(users).where(eq(users.username, "admin"));
    
    if (existingAdmin.length === 0) {
      // Create default company
      const [defaultCompany] = await db.insert(companies).values({
        name: "Traffik Boosters",
        logo: null,
        primaryColor: "#e45c2b",
        secondaryColor: "#f28b56",
        domain: "traffikboosters.com",
        timezone: "America/New_York",
        businessHoursStart: "09:00",
        businessHoursEnd: "18:00",
        businessDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        restrictedTimeZones: [],
        allowedRegions: ["US", "CA"]
      }).returning();

      // Create default admin user
      const [adminUser] = await db.insert(users).values({
        username: "admin",
        password: "admin123",
        email: "michael.thompson@traffikboosters.com",
        role: "admin",
        firstName: "Michael",
        lastName: "Thompson",
        phone: "(877) 840-6250",
        mobilePhone: "(877) 840-6250",
        extension: "101",
        avatar: null,
        commissionRate: "10.0",
        baseCommissionRate: "10.0",
        bonusCommissionRate: "0.0",
        commissionTier: "standard",
        isActive: true
      }).returning();

      // Note: No automatic employee creation - users will add employees manually

      // Create sample contacts
      const sampleContacts = [
        {
          firstName: "Maria",
          lastName: "Rodriguez",
          email: "maria.rodriguez@techstartup.com",
          phone: "(323) 892-0164",
          company: "Tech Startup Inc",
          position: "Marketing Director",
          leadStatus: "qualified",
          leadSource: "google_ads",
          priority: "high",
          assignedTo: 1, // Michael Thompson (admin)
          pipelineStage: "demo",
          dealValue: 750000, // $7,500 in cents
          createdBy: 1,
          updatedBy: 1
        },
        {
          firstName: "James",
          lastName: "Wilson",
          email: "james@localrestaurant.com",
          phone: "(404) 892-0173",
          company: "Local Restaurant Group",
          position: "Owner",
          leadStatus: "new",
          leadSource: "yelp",
          priority: "medium",
          assignedTo: 1, // Michael Thompson (admin)
          pipelineStage: "prospect",
          dealValue: 350000, // $3,500 in cents
          createdBy: 1,
          updatedBy: 1
        },
        {
          firstName: "Sarah",
          lastName: "Chen",
          email: "sarah@ecommercebiz.com",
          phone: "(206) 892-0198",
          company: "E-commerce Solutions",
          position: "CEO",
          leadStatus: "contacted",
          leadSource: "linkedin",
          priority: "high",
          assignedTo: 1, // Michael Thompson (admin)
          pipelineStage: "proposal",
          dealValue: 1200000, // $12,000 in cents
          createdBy: 1,
          updatedBy: 1
        }
      ];

      for (const contact of sampleContacts) {
        await db.insert(contacts).values(contact);
      }

      console.log("Database initialized with default data");
    } else {
      console.log("Database already initialized");
    }
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}