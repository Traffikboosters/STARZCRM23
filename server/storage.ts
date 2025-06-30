import { db } from "./db";
import { 
  users, companies, contacts, events, files, automations, scrapingJobs, 
  chatMessages, chatConversations, callLogs, campaigns, leadAllocations,
  documentTemplates, signingRequests, userInvitations, userSessions,
  contactNotes, leadIntakes, leadEnrichments, enrichmentHistory, extractionHistory,
  technicalProjects, technicalTasks, timeEntries, callRecordings, voiceToneAnalysis,
  callInsights, keyCallMoments, callParticipants, voiceTrendAnalysis,
  servicePackages, costStructures, profitabilityAnalysis
} from "../shared/schema";
import type { 
  User, Company, Contact, Event, File, Automation, ScrapingJob,
  ChatMessage, ChatConversation, CallLog, Campaign, LeadAllocation,
  DocumentTemplate, SigningRequest, UserInvitation,
  ContactNote, LeadIntake, LeadEnrichment, EnrichmentHistory, ExtractionHistory,
  TechnicalProject, TechnicalTask, TimeEntry, CallRecording, VoiceToneAnalysis,
  CallInsight, KeyCallMoment, CallParticipant, VoiceTrendAnalysis,
  InsertUser, InsertCompany, InsertContact, InsertEvent, InsertFile, InsertAutomation, InsertScrapingJob,
  InsertChatMessage, InsertChatConversation, InsertCallLog, InsertCampaign, InsertLeadAllocation,
  InsertDocumentTemplate, InsertSigningRequest, InsertUserInvitation,
  InsertContactNote, InsertLeadIntake, InsertLeadEnrichment, InsertEnrichmentHistory, InsertExtractionHistory,
  InsertTechnicalProject, InsertTechnicalTask, InsertTimeEntry, InsertCallRecording, InsertVoiceToneAnalysis,
  InsertCallInsight, InsertKeyCallMoment, InsertCallParticipant, InsertVoiceTrendAnalysis
} from "../shared/schema";
import { eq, like, or, and, gte, lte, desc } from "drizzle-orm";

// Complete interface implementation
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  updateUserPhone(id: number, phone: string, mobilePhone?: string, extension?: string): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // User Invitations
  createUserInvitation(invitation: InsertUserInvitation): Promise<UserInvitation>;
  getUserInvitationByToken(token: string): Promise<UserInvitation | undefined>;
  updateUserInvitationStatus(token: string, status: string, acceptedAt?: Date): Promise<UserInvitation | undefined>;
  getAllUserInvitations(): Promise<UserInvitation[]>;
  
  // Companies
  getCompany(id: number): Promise<Company | undefined>;
  getAllCompanies(): Promise<Company[]>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, updates: Partial<InsertCompany>): Promise<Company | undefined>;
  
  // Contacts
  getAllContacts(): Promise<Contact[]>;
  getContact(id: number): Promise<Contact | undefined>;
  createContact(contact: InsertContact & { createdBy: number }): Promise<Contact>;
  updateContact(id: number, updates: Partial<InsertContact>): Promise<Contact | undefined>;
  deleteContact(id: number): Promise<boolean>;
  searchContacts(query: string): Promise<Contact[]>;
  getLeadsByRep(repId: number): Promise<Contact[]>;
  
  // Events
  getAllEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, updates: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  getEventsByDateRange(startDate: Date, endDate: Date): Promise<Event[]>;
  
  // Basic stub methods for all other entities
  getAllFiles(): Promise<any[]>;
  getFile(id: number): Promise<any>;
  createFile(file: any): Promise<any>;
  updateFile(id: number, updates: any): Promise<any>;
  deleteFile(id: number): Promise<boolean>;
  
  getAllAutomations(): Promise<any[]>;
  getAutomation(id: number): Promise<any>;
  createAutomation(automation: any): Promise<any>;
  updateAutomation(id: number, updates: any): Promise<any>;
  deleteAutomation(id: number): Promise<boolean>;
  
  getAllScrapingJobs(): Promise<any[]>;
  getScrapingJob(id: number): Promise<any>;
  createScrapingJob(job: any): Promise<any>;
  updateScrapingJob(id: number, updates: any): Promise<any>;
  deleteScrapingJob(id: number): Promise<boolean>;
  
  // Pricing and proposals
  getPricingProposals(): Promise<any[]>;
  createPricingProposal(proposal: any): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user || undefined;
  }
  
  async updateUserPhone(id: number, phone: string, mobilePhone?: string, extension?: string): Promise<User | undefined> {
    const [user] = await db.update(users).set({ phone, mobilePhone, extension }).where(eq(users.id, id)).returning();
    return user || undefined;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // User invitations
  async createUserInvitation(invitation: InsertUserInvitation): Promise<UserInvitation> {
    const [created] = await db
      .insert(userInvitations)
      .values(invitation)
      .returning();
    return created;
  }

  async getUserInvitationByToken(token: string): Promise<UserInvitation | undefined> {
    const [invitation] = await db
      .select()
      .from(userInvitations)
      .where(eq(userInvitations.invitationToken, token));
    return invitation || undefined;
  }

  async updateUserInvitationStatus(token: string, status: string, acceptedAt?: Date): Promise<UserInvitation | undefined> {
    const [invitation] = await db.update(userInvitations)
      .set({ status, acceptedAt })
      .where(eq(userInvitations.invitationToken, token))
      .returning();
    return invitation || undefined;
  }
  
  async getAllUserInvitations(): Promise<UserInvitation[]> {
    return await db.select().from(userInvitations);
  }

  // Companies
  async getCompany(id: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company || undefined;
  }

  async getAllCompanies(): Promise<Company[]> {
    return await db.select().from(companies);
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const [company] = await db
      .insert(companies)
      .values(insertCompany)
      .returning();
    return company;
  }

  async updateCompany(id: number, updates: Partial<InsertCompany>): Promise<Company | undefined> {
    const [company] = await db.update(companies).set(updates).where(eq(companies.id, id)).returning();
    return company || undefined;
  }

  // Contacts
  async getAllContacts(): Promise<Contact[]> {
    return await db.select().from(contacts);
  }

  async getContact(id: number): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
    return contact || undefined;
  }

  async createContact(insertContact: InsertContact & { createdBy: number }): Promise<Contact> {
    const [contact] = await db
      .insert(contacts)
      .values(insertContact)
      .returning();
    return contact;
  }

  async updateContact(id: number, updates: Partial<InsertContact>): Promise<Contact | undefined> {
    const [contact] = await db
      .update(contacts)
      .set(updates)
      .where(eq(contacts.id, id))
      .returning();
    return contact || undefined;
  }

  async deleteContact(id: number): Promise<boolean> {
    const result = await db.delete(contacts).where(eq(contacts.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async searchContacts(query: string): Promise<Contact[]> {
    return await db.select().from(contacts)
      .where(or(
        like(contacts.firstName, `%${query}%`),
        like(contacts.lastName, `%${query}%`),
        like(contacts.email, `%${query}%`),
        like(contacts.company, `%${query}%`)
      ));
  }

  async getLeadsByRep(repId: number): Promise<Contact[]> {
    return await db.select().from(contacts).where(eq(contacts.assignedTo, repId));
  }

  // Events
  async getAllEvents(): Promise<Event[]> {
    return await db.select().from(events);
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event || undefined;
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const [event] = await db
      .insert(events)
      .values(insertEvent)
      .returning();
    return event;
  }

  async updateEvent(id: number, updates: Partial<InsertEvent>): Promise<Event | undefined> {
    const [event] = await db
      .update(events)
      .set(updates)
      .where(eq(events.id, id))
      .returning();
    return event || undefined;
  }

  async deleteEvent(id: number): Promise<boolean> {
    const result = await db.delete(events).where(eq(events.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getEventsByDateRange(startDate: Date, endDate: Date): Promise<Event[]> {
    return await db.select().from(events)
      .where(and(
        gte(events.startTime, startDate),
        lte(events.startTime, endDate)
      ));
  }

  // Stub implementations for other entities
  async getAllFiles(): Promise<any[]> { return []; }
  async getFile(id: number): Promise<any> { return null; }
  async createFile(file: any): Promise<any> { return { id: Date.now(), ...file }; }
  async updateFile(id: number, updates: any): Promise<any> { return null; }
  async deleteFile(id: number): Promise<boolean> { return false; }
  
  async getAllAutomations(): Promise<any[]> { return []; }
  async getAutomation(id: number): Promise<any> { return null; }
  async createAutomation(automation: any): Promise<any> { return { id: Date.now(), ...automation }; }
  async updateAutomation(id: number, updates: any): Promise<any> { return null; }
  async deleteAutomation(id: number): Promise<boolean> { return false; }
  
  async getAllScrapingJobs(): Promise<any[]> { return []; }
  async getScrapingJob(id: number): Promise<any> { return null; }
  async createScrapingJob(job: any): Promise<any> { return { id: Date.now(), ...job }; }
  async updateScrapingJob(id: number, updates: any): Promise<any> { return null; }
  async deleteScrapingJob(id: number): Promise<boolean> { return false; }
  
  async getPricingProposals(): Promise<any[]> { return []; }
  async createPricingProposal(proposal: any): Promise<any> { return { id: Date.now(), ...proposal, createdAt: new Date() }; }
}

export const storage = new DatabaseStorage();