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

      // Create sample sales representatives
      const salesReps = [
        {
          username: "sarah.johnson",
          password: "password123",
          email: "sarah.johnson@traffikboosters.com",
          role: "sales_rep",
          firstName: "Sarah",
          lastName: "Johnson",
          phone: "(877) 840-6250",
          mobilePhone: "(312) 555-0147",
          extension: "102",
          avatar: null,
          commissionRate: "12.0",
          baseCommissionRate: "10.0",
          bonusCommissionRate: "2.0",
          commissionTier: "bronze",
          isActive: true
        },
        {
          username: "david.chen",
          password: "password123",
          email: "david.chen@traffikboosters.com",
          role: "sales_rep",
          firstName: "David",
          lastName: "Chen",
          phone: "(877) 840-6250",
          mobilePhone: "(415) 555-0182",
          extension: "103",
          avatar: null,
          commissionRate: "15.0",
          baseCommissionRate: "10.0",
          bonusCommissionRate: "5.0",
          commissionTier: "silver",
          isActive: true
        },
        {
          username: "amanda.davis",
          password: "password123",
          email: "amanda.davis@traffikboosters.com",
          role: "sales_rep",
          firstName: "Amanda",
          lastName: "Davis",
          phone: "(877) 840-6250",
          mobilePhone: "(713) 555-0129",
          extension: "104",
          avatar: null,
          commissionRate: "18.0",
          baseCommissionRate: "10.0",
          bonusCommissionRate: "8.0",
          commissionTier: "gold",
          isActive: true
        }
      ];

      for (const rep of salesReps) {
        await db.insert(users).values(rep);
      }

      // Create sample contacts
      const sampleContacts = [
        {
          firstName: "Maria",
          lastName: "Rodriguez",
          email: "maria.rodriguez@techstartup.com",
          phone: "(323) 555-0164",
          company: "Tech Startup Inc",
          position: "Marketing Director",
          leadStatus: "qualified",
          leadSource: "google_ads",
          priority: "high",
          assignedTo: 2, // Sarah Johnson
          pipelineStage: "demo",
          dealValue: 750000, // $7,500 in cents
          createdBy: 1,
          updatedBy: 1
        },
        {
          firstName: "James",
          lastName: "Wilson",
          email: "james@localrestaurant.com",
          phone: "(404) 555-0173",
          company: "Local Restaurant Group",
          position: "Owner",
          leadStatus: "new",
          leadSource: "yelp",
          priority: "medium",
          assignedTo: 3, // David Chen
          pipelineStage: "prospect",
          dealValue: 350000, // $3,500 in cents
          createdBy: 1,
          updatedBy: 1
        },
        {
          firstName: "Sarah",
          lastName: "Chen",
          email: "sarah@ecommercebiz.com",
          phone: "(206) 555-0198",
          company: "E-commerce Solutions",
          position: "CEO",
          leadStatus: "contacted",
          leadSource: "linkedin",
          priority: "high",
          assignedTo: 4, // Amanda Davis
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