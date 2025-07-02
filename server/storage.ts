import { db } from "./db";
import { eq, and, or, like, gte, lte, desc } from "drizzle-orm";
import { 
  users, companies, contacts, events, files, automations, scrapingJobs, 
  chatMessages, chatConversations, callLogs, campaigns, leadAllocations,
  documentTemplates, signingRequests, userInvitations, userSessions,
  contactNotes, leadIntakes, leadEnrichment, enrichmentHistory, extractionHistory,
  technicalProjects, technicalTasks, timeEntries, technicalProposals, callRecordings, voiceToneAnalysis,
  callInsights, keyCallMoments, callParticipants, voiceTrendAnalysis,
  servicePackages, costStructure, profitabilityAnalysis,
  moodEntries, teamMoodSummaries, moodPerformanceCorrelations,
  timeClockEntries, timeClockSchedules, timeOffRequests
} from "../shared/schema";
import type { 
  User, Company, Contact, Event, File, Automation, ScrapingJob,
  ChatMessage, ChatConversation, CallLog, Campaign, LeadAllocation,
  DocumentTemplate, SigningRequest, UserInvitation,
  ContactNote, LeadIntake, LeadEnrichment, EnrichmentHistory, ExtractionHistory,
  TechnicalProject, TechnicalTask, TimeEntry, TechnicalProposal, CallRecording, VoiceToneAnalysis,
  CallInsights, KeyCallMoments, CallParticipants, VoiceTrendAnalysis,
  MoodEntry, TeamMoodSummary, MoodPerformanceCorrelation,
  TimeClockEntry, TimeClockSchedule, TimeOffRequest,
  InsertUser, InsertCompany, InsertContact, InsertEvent, InsertFile, InsertAutomation, InsertScrapingJob,
  InsertChatMessage, InsertChatConversation, InsertCallLog, InsertCampaign, InsertLeadAllocation,
  InsertDocumentTemplate, InsertSigningRequest, InsertUserInvitation,
  InsertContactNote, InsertLeadIntake, InsertLeadEnrichment, InsertEnrichmentHistory, InsertExtractionHistory,
  InsertTechnicalProject, InsertTechnicalTask, InsertTimeEntry, InsertTechnicalProposal, InsertCallRecording, InsertVoiceToneAnalysis,
  InsertCallInsights, InsertKeyCallMoments, InsertCallParticipants, InsertVoiceTrendAnalysis,
  InsertMoodEntry, InsertTeamMoodSummary, InsertMoodPerformanceCorrelation,
  InsertTimeClockEntry, InsertTimeClockSchedule, InsertTimeOffRequest
} from "../shared/schema";

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
  
  // Mood tracking
  createMoodEntry(entry: InsertMoodEntry): Promise<MoodEntry>;
  getMoodEntriesByUser(userId: number, limit?: number): Promise<MoodEntry[]>;
  getMoodEntriesByDateRange(startDate: Date, endDate: Date): Promise<MoodEntry[]>;
  getTeamMoodSummary(date: Date): Promise<TeamMoodSummary | undefined>;
  createTeamMoodSummary(summary: InsertTeamMoodSummary): Promise<TeamMoodSummary>;
  createMoodPerformanceCorrelation(correlation: InsertMoodPerformanceCorrelation): Promise<MoodPerformanceCorrelation>;
  getMoodPerformanceCorrelations(userId: number): Promise<MoodPerformanceCorrelation[]>;
  getAverageMoodByUser(userId: number, days: number): Promise<number>;
  getTeamMoodTrends(days: number): Promise<TeamMoodSummary[]>;
  
  // Technical Proposals
  createTechnicalProposal(proposal: InsertTechnicalProposal): Promise<TechnicalProposal>;
  getTechnicalProposals(): Promise<TechnicalProposal[]>;
  getTechnicalProposalById(id: number): Promise<TechnicalProposal | undefined>;
  updateTechnicalProposal(id: number, updates: Partial<InsertTechnicalProposal>): Promise<TechnicalProposal | undefined>;
  getTechnicalProposalsByContact(contactId: number): Promise<TechnicalProposal[]>;
  getTechnicalProposalsByTechnician(technicianId: number): Promise<TechnicalProposal[]>;
  
  // Extraction History
  createExtractionHistory(history: InsertExtractionHistory): Promise<ExtractionHistory>;
  getExtractionHistory(): Promise<ExtractionHistory[]>;
  
  // Time Clock
  createTimeClockEntry(entry: InsertTimeClockEntry): Promise<TimeClockEntry>;
  updateTimeClockEntry(id: number, updates: Partial<InsertTimeClockEntry>): Promise<TimeClockEntry | undefined>;
  getTimeClockEntry(id: number): Promise<TimeClockEntry | undefined>;
  getActiveTimeClockEntry(userId: number): Promise<TimeClockEntry | undefined>;
  getTimeClockEntriesForUser(userId: number, startDate?: Date, endDate?: Date): Promise<TimeClockEntry[]>;
  getAllTimeClockEntries(startDate?: Date, endDate?: Date): Promise<TimeClockEntry[]>;
  
  // Time Clock Schedules
  createTimeClockSchedule(schedule: InsertTimeClockSchedule): Promise<TimeClockSchedule>;
  updateTimeClockSchedule(id: number, updates: Partial<InsertTimeClockSchedule>): Promise<TimeClockSchedule | undefined>;
  getTimeClockSchedulesForUser(userId: number): Promise<TimeClockSchedule[]>;
  getAllTimeClockSchedules(): Promise<TimeClockSchedule[]>;
  
  // Time Off Requests
  createTimeOffRequest(request: InsertTimeOffRequest): Promise<TimeOffRequest>;
  updateTimeOffRequest(id: number, updates: Partial<InsertTimeOffRequest>): Promise<TimeOffRequest | undefined>;
  getTimeOffRequest(id: number): Promise<TimeOffRequest | undefined>;
  getTimeOffRequestsForUser(userId: number): Promise<TimeOffRequest[]>;
  getAllTimeOffRequests(): Promise<TimeOffRequest[]>;
  getPendingTimeOffRequests(): Promise<TimeOffRequest[]>;
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

  // Contacts - Optimized for performance
  async getAllContacts(): Promise<Contact[]> {
    // Add performance monitoring
    const startTime = Date.now();
    
    const contactResults = await db.select().from(contacts).orderBy(contacts.createdAt);
    
    const queryTime = Date.now() - startTime;
    if (queryTime > 500) {
      console.log(`⚠️ Slow query detected: getAllContacts took ${queryTime}ms`);
    }
    
    return contactResults;
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
        gte(events.startDate, startDate),
        lte(events.startDate, endDate)
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
  
  // Mood tracking implementation
  async createMoodEntry(entry: InsertMoodEntry): Promise<MoodEntry> {
    const [moodEntry] = await db
      .insert(moodEntries)
      .values(entry)
      .returning();
    return moodEntry;
  }

  async getMoodEntriesByUser(userId: number, limit = 30): Promise<MoodEntry[]> {
    return await db
      .select()
      .from(moodEntries)
      .where(eq(moodEntries.userId, userId))
      .orderBy(desc(moodEntries.entryDate))
      .limit(limit);
  }

  async getMoodEntriesByDateRange(startDate: Date, endDate: Date): Promise<MoodEntry[]> {
    return await db
      .select()
      .from(moodEntries)
      .where(and(
        gte(moodEntries.entryDate, startDate),
        lte(moodEntries.entryDate, endDate)
      ))
      .orderBy(desc(moodEntries.entryDate));
  }

  async getTeamMoodSummary(date: Date): Promise<TeamMoodSummary | undefined> {
    const [summary] = await db
      .select()
      .from(teamMoodSummaries)
      .where(eq(teamMoodSummaries.summaryDate, date));
    return summary || undefined;
  }

  async createTeamMoodSummary(summary: InsertTeamMoodSummary): Promise<TeamMoodSummary> {
    const [teamSummary] = await db
      .insert(teamMoodSummaries)
      .values(summary)
      .returning();
    return teamSummary;
  }

  async createMoodPerformanceCorrelation(correlation: InsertMoodPerformanceCorrelation): Promise<MoodPerformanceCorrelation> {
    const [moodCorrelation] = await db
      .insert(moodPerformanceCorrelations)
      .values(correlation)
      .returning();
    return moodCorrelation;
  }

  async getMoodPerformanceCorrelations(userId: number): Promise<MoodPerformanceCorrelation[]> {
    return await db
      .select()
      .from(moodPerformanceCorrelations)
      .where(eq(moodPerformanceCorrelations.userId, userId))
      .orderBy(desc(moodPerformanceCorrelations.correlationDate));
  }

  async getAverageMoodByUser(userId: number, days: number): Promise<number> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const entries = await this.getMoodEntriesByDateRange(startDate, new Date());
    const userEntries = entries.filter(entry => entry.userId === userId);
    
    if (userEntries.length === 0) return 5; // Default neutral mood
    
    const total = userEntries.reduce((sum, entry) => sum + entry.moodScore, 0);
    return Math.round((total / userEntries.length) * 10) / 10; // Round to 1 decimal
  }

  async getTeamMoodTrends(days: number): Promise<TeamMoodSummary[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return await db
      .select()
      .from(teamMoodSummaries)
      .where(gte(teamMoodSummaries.summaryDate, startDate))
      .orderBy(desc(teamMoodSummaries.summaryDate));
  }

  // Technical Proposals
  async createTechnicalProposal(proposal: InsertTechnicalProposal): Promise<TechnicalProposal> {
    const [newProposal] = await db
      .insert(technicalProposals)
      .values(proposal)
      .returning();
    return newProposal;
  }

  async getTechnicalProposals(): Promise<TechnicalProposal[]> {
    return await db.select().from(technicalProposals).orderBy(desc(technicalProposals.createdAt));
  }

  async getTechnicalProposalById(id: number): Promise<TechnicalProposal | undefined> {
    const [proposal] = await db
      .select()
      .from(technicalProposals)
      .where(eq(technicalProposals.id, id));
    return proposal || undefined;
  }

  async updateTechnicalProposal(id: number, updates: Partial<InsertTechnicalProposal>): Promise<TechnicalProposal | undefined> {
    const [proposal] = await db
      .update(technicalProposals)
      .set(updates)
      .where(eq(technicalProposals.id, id))
      .returning();
    return proposal || undefined;
  }

  async getTechnicalProposalsByContact(contactId: number): Promise<TechnicalProposal[]> {
    return await db
      .select()
      .from(technicalProposals)
      .where(eq(technicalProposals.contactId, contactId))
      .orderBy(desc(technicalProposals.createdAt));
  }

  async getTechnicalProposalsByTechnician(technicianId: number): Promise<TechnicalProposal[]> {
    return await db
      .select()
      .from(technicalProposals)
      .where(eq(technicalProposals.assignedTechnician, technicianId))
      .orderBy(desc(technicalProposals.createdAt));
  }

  // Extraction History
  async createExtractionHistory(history: InsertExtractionHistory): Promise<ExtractionHistory> {
    const [result] = await db.insert(extractionHistory).values(history).returning();
    return result;
  }

  async getExtractionHistory(): Promise<ExtractionHistory[]> {
    return await db
      .select()
      .from(extractionHistory)
      .orderBy(desc(extractionHistory.extractionTime));
  }

  // Time Clock Entries
  async createTimeClockEntry(entry: InsertTimeClockEntry): Promise<TimeClockEntry> {
    const [timeClockEntry] = await db
      .insert(timeClockEntries)
      .values(entry)
      .returning();
    return timeClockEntry;
  }

  async updateTimeClockEntry(id: number, updates: Partial<InsertTimeClockEntry>): Promise<TimeClockEntry | undefined> {
    const [timeClockEntry] = await db
      .update(timeClockEntries)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(timeClockEntries.id, id))
      .returning();
    return timeClockEntry || undefined;
  }

  async getTimeClockEntry(id: number): Promise<TimeClockEntry | undefined> {
    const [entry] = await db
      .select()
      .from(timeClockEntries)
      .where(eq(timeClockEntries.id, id));
    return entry || undefined;
  }

  async getActiveTimeClockEntry(userId: number): Promise<TimeClockEntry | undefined> {
    const [entry] = await db
      .select()
      .from(timeClockEntries)
      .where(and(
        eq(timeClockEntries.userId, userId),
        eq(timeClockEntries.status, 'active')
      ));
    return entry || undefined;
  }

  async getTimeClockEntriesForUser(userId: number, startDate?: Date, endDate?: Date): Promise<TimeClockEntry[]> {
    if (startDate && endDate) {
      return await db
        .select()
        .from(timeClockEntries)
        .where(and(
          eq(timeClockEntries.userId, userId),
          gte(timeClockEntries.clockInTime, startDate),
          lte(timeClockEntries.clockInTime, endDate)
        ))
        .orderBy(desc(timeClockEntries.clockInTime));
    }

    return await db
      .select()
      .from(timeClockEntries)
      .where(eq(timeClockEntries.userId, userId))
      .orderBy(desc(timeClockEntries.clockInTime));
  }

  async getAllTimeClockEntries(startDate?: Date, endDate?: Date): Promise<TimeClockEntry[]> {
    if (startDate && endDate) {
      return await db
        .select()
        .from(timeClockEntries)
        .where(and(
          gte(timeClockEntries.clockInTime, startDate),
          lte(timeClockEntries.clockInTime, endDate)
        ))
        .orderBy(desc(timeClockEntries.clockInTime));
    }

    return await db
      .select()
      .from(timeClockEntries)
      .orderBy(desc(timeClockEntries.clockInTime));
  }

  // Time Clock Schedules
  async createTimeClockSchedule(schedule: InsertTimeClockSchedule): Promise<TimeClockSchedule> {
    const [timeClockSchedule] = await db
      .insert(timeClockSchedules)
      .values(schedule)
      .returning();
    return timeClockSchedule;
  }

  async updateTimeClockSchedule(id: number, updates: Partial<InsertTimeClockSchedule>): Promise<TimeClockSchedule | undefined> {
    const [schedule] = await db
      .update(timeClockSchedules)
      .set(updates)
      .where(eq(timeClockSchedules.id, id))
      .returning();
    return schedule || undefined;
  }

  async getTimeClockSchedulesForUser(userId: number): Promise<TimeClockSchedule[]> {
    return await db
      .select()
      .from(timeClockSchedules)
      .where(and(
        eq(timeClockSchedules.userId, userId),
        eq(timeClockSchedules.isActive, true)
      ));
  }

  async getAllTimeClockSchedules(): Promise<TimeClockSchedule[]> {
    return await db
      .select()
      .from(timeClockSchedules)
      .where(eq(timeClockSchedules.isActive, true))
      .orderBy(timeClockSchedules.userId, timeClockSchedules.dayOfWeek);
  }

  // Time Off Requests
  async createTimeOffRequest(request: InsertTimeOffRequest): Promise<TimeOffRequest> {
    const [timeOffRequest] = await db
      .insert(timeOffRequests)
      .values(request)
      .returning();
    return timeOffRequest;
  }

  async updateTimeOffRequest(id: number, updates: Partial<InsertTimeOffRequest>): Promise<TimeOffRequest | undefined> {
    const [request] = await db
      .update(timeOffRequests)
      .set(updates)
      .where(eq(timeOffRequests.id, id))
      .returning();
    return request || undefined;
  }

  async getTimeOffRequest(id: number): Promise<TimeOffRequest | undefined> {
    const [request] = await db
      .select()
      .from(timeOffRequests)
      .where(eq(timeOffRequests.id, id));
    return request || undefined;
  }

  async getTimeOffRequestsForUser(userId: number): Promise<TimeOffRequest[]> {
    return await db
      .select()
      .from(timeOffRequests)
      .where(eq(timeOffRequests.userId, userId))
      .orderBy(desc(timeOffRequests.requestedAt));
  }

  async getAllTimeOffRequests(): Promise<TimeOffRequest[]> {
    return await db
      .select()
      .from(timeOffRequests)
      .orderBy(desc(timeOffRequests.requestedAt));
  }

  async getPendingTimeOffRequests(): Promise<TimeOffRequest[]> {
    return await db
      .select()
      .from(timeOffRequests)
      .where(eq(timeOffRequests.status, 'pending'))
      .orderBy(desc(timeOffRequests.requestedAt));
  }
}

export const storage = new DatabaseStorage();