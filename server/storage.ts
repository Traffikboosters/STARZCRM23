import { 
  users, contacts, events, files, automations, scrapingJobs, companies, chatMessages, chatConversations,
  callLogs, campaigns, leadAllocations, documentTemplates, signingRequests, servicePackages, costStructure, profitabilityAnalysis,
  type User, type InsertUser, type Contact, type InsertContact,
  type Event, type InsertEvent, type File, type InsertFile,
  type Automation, type InsertAutomation, type ScrapingJob, type InsertScrapingJob,
  type Company, type InsertCompany, type ChatMessage, type InsertChatMessage,
  type ChatConversation, type InsertChatConversation, type CallLog, type InsertCallLog,
  type Campaign, type InsertCampaign, type LeadAllocation, type InsertLeadAllocation,
  type DocumentTemplate, type InsertDocumentTemplate, type SigningRequest, type InsertSigningRequest,
  type ServicePackage, type InsertServicePackage, type CostStructure, type InsertCostStructure,
  type ProfitabilityAnalysis, type InsertProfitabilityAnalysis
} from "@shared/schema";
import { db } from "./db";
import { eq, like, and, between } from "drizzle-orm";

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
  
  // Events
  getAllEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  getEventsByDateRange(startDate: Date, endDate: Date): Promise<Event[]>;
  createEvent(event: InsertEvent & { createdBy: number }): Promise<Event>;
  updateEvent(id: number, updates: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  
  // Files
  getAllFiles(): Promise<File[]>;
  getFile(id: number): Promise<File | undefined>;
  getFilesByFolder(folder: string): Promise<File[]>;
  createFile(file: InsertFile & { uploadedBy: number }): Promise<File>;
  updateFile(id: number, updates: Partial<InsertFile>): Promise<File | undefined>;
  deleteFile(id: number): Promise<boolean>;
  
  // Automations
  getAllAutomations(): Promise<Automation[]>;
  getAutomation(id: number): Promise<Automation | undefined>;
  createAutomation(automation: InsertAutomation & { createdBy: number }): Promise<Automation>;
  updateAutomation(id: number, updates: Partial<InsertAutomation>): Promise<Automation | undefined>;
  deleteAutomation(id: number): Promise<boolean>;
  
  // Scraping Jobs
  getAllScrapingJobs(): Promise<ScrapingJob[]>;
  getScrapingJob(id: number): Promise<ScrapingJob | undefined>;
  createScrapingJob(job: InsertScrapingJob & { createdBy: number }): Promise<ScrapingJob>;
  updateScrapingJob(id: number, updates: Partial<InsertScrapingJob>): Promise<ScrapingJob | undefined>;
  deleteScrapingJob(id: number): Promise<boolean>;
  
  // Chat Messages
  getChatMessages(contactId: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  markMessageAsRead(messageId: number): Promise<ChatMessage | undefined>;
  
  // Chat Conversations
  getAllConversations(): Promise<ChatConversation[]>;
  getConversation(contactId: number): Promise<ChatConversation | undefined>;
  createConversation(conversation: InsertChatConversation): Promise<ChatConversation>;
  updateConversation(id: number, updates: Partial<InsertChatConversation>): Promise<ChatConversation | undefined>;
  
  // Call Logs
  getAllCallLogs(): Promise<CallLog[]>;
  getCallLog(id: number): Promise<CallLog | undefined>;
  getCallLogsByContact(contactId: number): Promise<CallLog[]>;
  getCallLogsByUser(userId: number): Promise<CallLog[]>;
  createCallLog(callLog: InsertCallLog): Promise<CallLog>;
  updateCallLog(id: number, updates: Partial<InsertCallLog>): Promise<CallLog | undefined>;
  deleteCallLog(id: number): Promise<boolean>;
  
  // Campaigns
  getAllCampaigns(): Promise<Campaign[]>;
  getCampaign(id: number): Promise<Campaign | undefined>;
  getCampaignsByCreator(createdBy: number): Promise<Campaign[]>;
  getCampaignsByAssignee(assignedTo: number): Promise<Campaign[]>;
  createCampaign(campaign: InsertCampaign & { createdBy: number }): Promise<Campaign>;
  updateCampaign(id: number, updates: Partial<InsertCampaign>): Promise<Campaign | undefined>;
  deleteCampaign(id: number): Promise<boolean>;
  
  // Lead Allocations
  getAllLeadAllocations(): Promise<LeadAllocation[]>;
  getLeadAllocation(id: number): Promise<LeadAllocation | undefined>;
  getLeadAllocationsByContact(contactId: number): Promise<LeadAllocation[]>;
  getLeadAllocationsByAssignee(assignedTo: number): Promise<LeadAllocation[]>;
  getLeadAllocationsByCampaign(campaignId: number): Promise<LeadAllocation[]>;
  createLeadAllocation(allocation: InsertLeadAllocation): Promise<LeadAllocation>;
  updateLeadAllocation(id: number, updates: Partial<InsertLeadAllocation>): Promise<LeadAllocation | undefined>;
  deleteLeadAllocation(id: number): Promise<boolean>;
  
  // Document Templates
  getAllDocumentTemplates(): Promise<DocumentTemplate[]>;
  getDocumentTemplate(id: number): Promise<DocumentTemplate | undefined>;
  createDocumentTemplate(template: InsertDocumentTemplate & { createdBy: number }): Promise<DocumentTemplate>;
  updateDocumentTemplate(id: number, updates: Partial<InsertDocumentTemplate>): Promise<DocumentTemplate | undefined>;
  deleteDocumentTemplate(id: number): Promise<boolean>;
  
  // Signing Requests
  getAllSigningRequests(): Promise<SigningRequest[]>;
  getSigningRequest(id: number): Promise<SigningRequest | undefined>;
  getSigningRequestsByUser(userId: number): Promise<SigningRequest[]>;
  createSigningRequest(request: InsertSigningRequest & { createdBy: number }): Promise<SigningRequest>;
  updateSigningRequest(id: number, updates: Partial<InsertSigningRequest>): Promise<SigningRequest | undefined>;
  deleteSigningRequest(id: number): Promise<boolean>;
  
  // Service Packages
  getServicePackages(): Promise<ServicePackage[]>;
  getServicePackage(id: number): Promise<ServicePackage | undefined>;
  createServicePackage(servicePackage: InsertServicePackage): Promise<ServicePackage>;
  updateServicePackage(id: number, updates: Partial<InsertServicePackage>): Promise<ServicePackage | undefined>;
  deleteServicePackage(id: number): Promise<boolean>;
  
  // Cost Structures
  getCostStructureByPackage(packageId: number): Promise<CostStructure[]>;
  createCostStructure(costStructure: InsertCostStructure): Promise<CostStructure>;
  updateCostStructure(id: number, updates: Partial<InsertCostStructure>): Promise<CostStructure | undefined>;
  deleteCostStructure(id: number): Promise<boolean>;
  
  // Profitability Analyses
  getProfitabilityAnalyses(): Promise<ProfitabilityAnalysis[]>;
  createProfitabilityAnalysis(analysis: InsertProfitabilityAnalysis): Promise<ProfitabilityAnalysis>;
  updateProfitabilityAnalysis(id: number, updates: Partial<InsertProfitabilityAnalysis>): Promise<ProfitabilityAnalysis | undefined>;
  deleteProfitabilityAnalysis(id: number): Promise<boolean>;

  // Additional methods needed by routes
  getLeadsByRep(repId: number): Promise<Contact[]>;
  getPricingProposals(): Promise<any[]>;
  createPricingProposal(proposal: any): Promise<any>;
}

export class DatabaseStorage implements IStorage {
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
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async updateUserPhone(id: number, phone: string, mobilePhone?: string, extension?: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ phone, mobilePhone, extension })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount ?? 0) > 0;
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
    const [company] = await db
      .update(companies)
      .set(updates)
      .where(eq(companies.id, id))
      .returning();
    return company || undefined;
  }

  // Contacts
  async getAllContacts(): Promise<Contact[]> {
    const result = await db
      .select({
        id: contacts.id,
        firstName: contacts.firstName,
        lastName: contacts.lastName,
        email: contacts.email,
        phone: contacts.phone,
        company: contacts.company,
        position: contacts.position,
        avatar: contacts.avatar,
        tags: contacts.tags,
        notes: contacts.notes,
        leadStatus: contacts.leadStatus,
        leadSource: contacts.leadSource,
        disposition: contacts.disposition,
        priority: contacts.priority,
        budget: contacts.budget,
        timeline: contacts.timeline,
        assignedTo: contacts.assignedTo,
        assignedBy: contacts.assignedBy,
        assignedAt: contacts.assignedAt,
        pipelineStage: contacts.pipelineStage,
        dealValue: contacts.dealValue,
        lastContactedAt: contacts.lastContactedAt,
        nextFollowUpAt: contacts.nextFollowUpAt,
        createdAt: contacts.createdAt,
        updatedAt: contacts.updatedAt,
        createdBy: contacts.createdBy,
        updatedBy: contacts.updatedBy,
        assignedUser: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          phone: users.phone,
          mobilePhone: users.mobilePhone,
          extension: users.extension
        }
      })
      .from(contacts)
      .leftJoin(users, eq(contacts.assignedTo, users.id));
    
    return result.map(row => ({
      ...row,
      assignedUser: (row.assignedUser && row.assignedUser.id) ? row.assignedUser : null
    })) as any;
  }

  async getContact(id: number): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
    return contact || undefined;
  }

  async createContact(contact: InsertContact & { createdBy: number }): Promise<Contact> {
    const [newContact] = await db
      .insert(contacts)
      .values(contact)
      .returning();
    return newContact;
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
    return await db.select().from(contacts).where(
      like(contacts.firstName, `%${query}%`)
    );
  }

  // Events
  async getAllEvents(): Promise<Event[]> {
    return await db.select().from(events);
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event || undefined;
  }

  async getEventsByDateRange(startDate: Date, endDate: Date): Promise<Event[]> {
    return await db.select().from(events).where(
      and(
        between(events.startDate, startDate, endDate)
      )
    );
  }

  async createEvent(event: InsertEvent & { createdBy: number }): Promise<Event> {
    const [newEvent] = await db
      .insert(events)
      .values(event)
      .returning();
    return newEvent;
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

  // Files
  async getAllFiles(): Promise<File[]> {
    return await db.select().from(files);
  }

  async getFile(id: number): Promise<File | undefined> {
    const [file] = await db.select().from(files).where(eq(files.id, id));
    return file || undefined;
  }

  async getFilesByFolder(folder: string): Promise<File[]> {
    return await db.select().from(files).where(eq(files.folder, folder));
  }

  async createFile(file: InsertFile & { uploadedBy: number }): Promise<File> {
    const [newFile] = await db
      .insert(files)
      .values(file)
      .returning();
    return newFile;
  }

  async updateFile(id: number, updates: Partial<InsertFile>): Promise<File | undefined> {
    const [file] = await db
      .update(files)
      .set(updates)
      .where(eq(files.id, id))
      .returning();
    return file || undefined;
  }

  async deleteFile(id: number): Promise<boolean> {
    const result = await db.delete(files).where(eq(files.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Placeholder implementations for other methods - these would need full implementation
  async getAllAutomations(): Promise<Automation[]> {
    return await db.select().from(automations);
  }

  async getAutomation(id: number): Promise<Automation | undefined> {
    const [automation] = await db.select().from(automations).where(eq(automations.id, id));
    return automation || undefined;
  }

  async createAutomation(automation: InsertAutomation & { createdBy: number }): Promise<Automation> {
    const [newAutomation] = await db
      .insert(automations)
      .values(automation)
      .returning();
    return newAutomation;
  }

  async updateAutomation(id: number, updates: Partial<InsertAutomation>): Promise<Automation | undefined> {
    const [automation] = await db
      .update(automations)
      .set(updates)
      .where(eq(automations.id, id))
      .returning();
    return automation || undefined;
  }

  async deleteAutomation(id: number): Promise<boolean> {
    const result = await db.delete(automations).where(eq(automations.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getAllScrapingJobs(): Promise<ScrapingJob[]> {
    return await db.select().from(scrapingJobs);
  }

  async getScrapingJob(id: number): Promise<ScrapingJob | undefined> {
    const [job] = await db.select().from(scrapingJobs).where(eq(scrapingJobs.id, id));
    return job || undefined;
  }

  async createScrapingJob(job: InsertScrapingJob & { createdBy: number }): Promise<ScrapingJob> {
    const [newJob] = await db
      .insert(scrapingJobs)
      .values(job)
      .returning();
    return newJob;
  }

  async updateScrapingJob(id: number, updates: Partial<InsertScrapingJob>): Promise<ScrapingJob | undefined> {
    const [job] = await db
      .update(scrapingJobs)
      .set(updates)
      .where(eq(scrapingJobs.id, id))
      .returning();
    return job || undefined;
  }

  async deleteScrapingJob(id: number): Promise<boolean> {
    const result = await db.delete(scrapingJobs).where(eq(scrapingJobs.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Chat functionality
  async getAllChatMessages(): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages);
  }

  async getChatMessage(id: number): Promise<ChatMessage | undefined> {
    const [message] = await db.select().from(chatMessages).where(eq(chatMessages.id, id));
    return message || undefined;
  }

  async getChatMessages(contactId: number): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages).where(eq(chatMessages.contactId, contactId));
  }

  async getChatMessagesByContact(contactId: number): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages).where(eq(chatMessages.contactId, contactId));
  }

  async markMessageAsRead(messageId: number): Promise<ChatMessage | undefined> {
    const [message] = await db
      .update(chatMessages)
      .set({ readAt: new Date() })
      .where(eq(chatMessages.id, messageId))
      .returning();
    return message || undefined;
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db
      .insert(chatMessages)
      .values(message)
      .returning();
    return newMessage;
  }

  async updateChatMessage(id: number, updates: Partial<InsertChatMessage>): Promise<ChatMessage | undefined> {
    const [message] = await db
      .update(chatMessages)
      .set(updates)
      .where(eq(chatMessages.id, id))
      .returning();
    return message || undefined;
  }

  async deleteChatMessage(id: number): Promise<boolean> {
    const result = await db.delete(chatMessages).where(eq(chatMessages.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getAllChatConversations(): Promise<ChatConversation[]> {
    return await db.select().from(chatConversations);
  }

  async getAllConversations(): Promise<ChatConversation[]> {
    return await db.select().from(chatConversations);
  }

  async getChatConversation(id: number): Promise<ChatConversation | undefined> {
    const [conversation] = await db.select().from(chatConversations).where(eq(chatConversations.id, id));
    return conversation || undefined;
  }

  async getConversation(contactId: number): Promise<ChatConversation | undefined> {
    const [conversation] = await db.select().from(chatConversations).where(eq(chatConversations.contactId, contactId));
    return conversation || undefined;
  }

  async createConversation(conversation: InsertChatConversation): Promise<ChatConversation> {
    const [newConversation] = await db
      .insert(chatConversations)
      .values(conversation)
      .returning();
    return newConversation;
  }

  async updateConversation(id: number, updates: Partial<InsertChatConversation>): Promise<ChatConversation | undefined> {
    const [conversation] = await db
      .update(chatConversations)
      .set(updates)
      .where(eq(chatConversations.id, id))
      .returning();
    return conversation || undefined;
  }

  async createChatConversation(conversation: InsertChatConversation): Promise<ChatConversation> {
    const [newConversation] = await db
      .insert(chatConversations)
      .values(conversation)
      .returning();
    return newConversation;
  }

  async updateChatConversation(id: number, updates: Partial<InsertChatConversation>): Promise<ChatConversation | undefined> {
    const [conversation] = await db
      .update(chatConversations)
      .set(updates)
      .where(eq(chatConversations.id, id))
      .returning();
    return conversation || undefined;
  }

  async deleteChatConversation(id: number): Promise<boolean> {
    const result = await db.delete(chatConversations).where(eq(chatConversations.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Call logs functionality stubs
  async getAllCallLogs(): Promise<CallLog[]> {
    return await db.select().from(callLogs);
  }

  async getCallLog(id: number): Promise<CallLog | undefined> {
    const [log] = await db.select().from(callLogs).where(eq(callLogs.id, id));
    return log || undefined;
  }

  async getCallLogsByContact(contactId: number): Promise<CallLog[]> {
    return await db.select().from(callLogs).where(eq(callLogs.contactId, contactId));
  }

  async getCallLogsByUser(userId: number): Promise<CallLog[]> {
    return await db.select().from(callLogs).where(eq(callLogs.userId, userId));
  }

  async createCallLog(log: InsertCallLog): Promise<CallLog> {
    const [newLog] = await db
      .insert(callLogs)
      .values(log)
      .returning();
    return newLog;
  }

  async updateCallLog(id: number, updates: Partial<InsertCallLog>): Promise<CallLog | undefined> {
    const [log] = await db
      .update(callLogs)
      .set(updates)
      .where(eq(callLogs.id, id))
      .returning();
    return log || undefined;
  }

  async deleteCallLog(id: number): Promise<boolean> {
    const result = await db.delete(callLogs).where(eq(callLogs.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Campaign functionality
  async getAllCampaigns(): Promise<Campaign[]> {
    return await db.select().from(campaigns);
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return campaign || undefined;
  }

  async getCampaignsByCreator(createdBy: number): Promise<Campaign[]> {
    return await db.select().from(campaigns).where(eq(campaigns.createdBy, createdBy));
  }

  async getCampaignsByAssignee(assignedTo: number): Promise<Campaign[]> {
    return await db.select().from(campaigns).where(eq(campaigns.assignedTo, assignedTo));
  }

  async createCampaign(campaign: InsertCampaign & { createdBy: number }): Promise<Campaign> {
    const [newCampaign] = await db
      .insert(campaigns)
      .values(campaign)
      .returning();
    return newCampaign;
  }

  async updateCampaign(id: number, updates: Partial<InsertCampaign>): Promise<Campaign | undefined> {
    const [campaign] = await db
      .update(campaigns)
      .set(updates)
      .where(eq(campaigns.id, id))
      .returning();
    return campaign || undefined;
  }

  async deleteCampaign(id: number): Promise<boolean> {
    const result = await db.delete(campaigns).where(eq(campaigns.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Lead allocation functionality stubs
  async getAllLeadAllocations(): Promise<LeadAllocation[]> {
    return await db.select().from(leadAllocations);
  }

  async getLeadAllocation(id: number): Promise<LeadAllocation | undefined> {
    const [allocation] = await db.select().from(leadAllocations).where(eq(leadAllocations.id, id));
    return allocation || undefined;
  }

  async getLeadAllocationsByContact(contactId: number): Promise<LeadAllocation[]> {
    return await db.select().from(leadAllocations).where(eq(leadAllocations.contactId, contactId));
  }

  async getLeadAllocationsByAssignee(assignedTo: number): Promise<LeadAllocation[]> {
    return await db.select().from(leadAllocations).where(eq(leadAllocations.assignedTo, assignedTo));
  }

  async getLeadAllocationsByCampaign(campaignId: number): Promise<LeadAllocation[]> {
    return await db.select().from(leadAllocations).where(eq(leadAllocations.campaignId, campaignId));
  }

  async createLeadAllocation(allocation: InsertLeadAllocation): Promise<LeadAllocation> {
    const [newAllocation] = await db
      .insert(leadAllocations)
      .values(allocation)
      .returning();
    return newAllocation;
  }

  async updateLeadAllocation(id: number, updates: Partial<InsertLeadAllocation>): Promise<LeadAllocation | undefined> {
    const [allocation] = await db
      .update(leadAllocations)
      .set(updates)
      .where(eq(leadAllocations.id, id))
      .returning();
    return allocation || undefined;
  }

  async deleteLeadAllocation(id: number): Promise<boolean> {
    const result = await db.delete(leadAllocations).where(eq(leadAllocations.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Document template functionality stubs
  async getAllDocumentTemplates(): Promise<DocumentTemplate[]> {
    return await db.select().from(documentTemplates);
  }

  async getDocumentTemplate(id: number): Promise<DocumentTemplate | undefined> {
    const [template] = await db.select().from(documentTemplates).where(eq(documentTemplates.id, id));
    return template || undefined;
  }

  async createDocumentTemplate(template: InsertDocumentTemplate & { createdBy: number }): Promise<DocumentTemplate> {
    const [newTemplate] = await db
      .insert(documentTemplates)
      .values(template)
      .returning();
    return newTemplate;
  }

  async updateDocumentTemplate(id: number, updates: Partial<InsertDocumentTemplate>): Promise<DocumentTemplate | undefined> {
    const [template] = await db
      .update(documentTemplates)
      .set(updates)
      .where(eq(documentTemplates.id, id))
      .returning();
    return template || undefined;
  }

  async deleteDocumentTemplate(id: number): Promise<boolean> {
    const result = await db.delete(documentTemplates).where(eq(documentTemplates.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Signing request functionality stubs
  async getAllSigningRequests(): Promise<SigningRequest[]> {
    return await db.select().from(signingRequests);
  }

  async getSigningRequest(id: number): Promise<SigningRequest | undefined> {
    const [request] = await db.select().from(signingRequests).where(eq(signingRequests.id, id));
    return request || undefined;
  }

  async getSigningRequestsByUser(userId: number): Promise<SigningRequest[]> {
    return await db.select().from(signingRequests).where(eq(signingRequests.createdBy, userId));
  }

  async createSigningRequest(request: InsertSigningRequest & { createdBy: number }): Promise<SigningRequest> {
    const [newRequest] = await db
      .insert(signingRequests)
      .values(request)
      .returning();
    return newRequest;
  }

  async updateSigningRequest(id: number, updates: Partial<InsertSigningRequest>): Promise<SigningRequest | undefined> {
    const [request] = await db
      .update(signingRequests)
      .set(updates)
      .where(eq(signingRequests.id, id))
      .returning();
    return request || undefined;
  }

  async deleteSigningRequest(id: number): Promise<boolean> {
    const result = await db.delete(signingRequests).where(eq(signingRequests.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private companies: Map<number, Company>;
  private contacts: Map<number, Contact>;
  private events: Map<number, Event>;
  private files: Map<number, File>;
  private automations: Map<number, Automation>;
  private scrapingJobs: Map<number, ScrapingJob>;
  private chatMessages: Map<number, ChatMessage>;
  private chatConversations: Map<number, ChatConversation>;
  private callLogs: Map<number, CallLog>;
  private campaigns: Map<number, Campaign>;
  private leadAllocations: Map<number, LeadAllocation>;
  private documentTemplates: Map<number, DocumentTemplate>;
  private signingRequests: Map<number, SigningRequest>;
  private servicePackages: any[] = [];
  private costStructures: any[] = [];
  private profitabilityAnalyses: any[] = [];
  private pricingProposals: any[] = [];
  private lastId: number = 1;
  private currentUserId: number;
  private currentCompanyId: number;
  private currentContactId: number;
  private currentEventId: number;
  private currentFileId: number;
  private currentAutomationId: number;
  private currentScrapingJobId: number;
  private currentChatMessageId: number;
  private currentConversationId: number;
  private currentCallLogId: number;
  private currentCampaignId: number;
  private currentLeadAllocationId: number;
  private currentDocumentTemplateId: number;
  private currentSigningRequestId: number;

  constructor() {
    this.users = new Map();
    this.companies = new Map();
    this.contacts = new Map();
    this.events = new Map();
    this.files = new Map();
    this.automations = new Map();
    this.scrapingJobs = new Map();
    this.chatMessages = new Map();
    this.chatConversations = new Map();
    this.callLogs = new Map();
    this.campaigns = new Map();
    this.leadAllocations = new Map();
    this.documentTemplates = new Map();
    this.signingRequests = new Map();
    this.currentUserId = 1;
    this.currentCompanyId = 1;
    this.currentContactId = 1;
    this.currentEventId = 1;
    this.currentFileId = 1;
    this.currentAutomationId = 1;
    this.currentScrapingJobId = 1;
    this.currentChatMessageId = 1;
    this.currentConversationId = 1;
    this.currentCallLogId = 1;
    this.currentCampaignId = 1;
    this.currentLeadAllocationId = 1;
    this.currentDocumentTemplateId = 1;
    this.currentSigningRequestId = 1;

    // Initialize with default admin user and company
    this.initializeDefaults();
  }

  private initializeDefaults() {
    const defaultCompany: Company = {
      id: this.currentCompanyId++,
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
      allowedRegions: ["US", "CA"],
      createdAt: new Date(),
    };
    this.companies.set(defaultCompany.id, defaultCompany);

    const adminUser: User = {
      id: this.currentUserId++,
      username: "admin",
      password: "admin123", // In production, this would be hashed
      email: "traffikboosters@gmail.com",
      role: "admin",
      firstName: "Michael",
      lastName: "Thompson",
      phone: "+1-877-840-6250",
      mobilePhone: "+1-877-840-6250",
      extension: "100",
      avatar: null,
      commissionRate: "10.0",
      baseCommissionRate: "10.0",
      bonusCommissionRate: "0.0",
      commissionTier: "standard",
      isActive: true,
      createdAt: new Date(),
    };
    this.users.set(adminUser.id, adminUser);

    // No automatic sales rep creation - users will add employees manually

    // Initialize sample contacts with diverse lead sources
    this.initializeSampleContacts();
    
    // Initialize default document templates
    this.initializeDocumentTemplates();
  }

  private initializeSampleContacts() {
    const sampleContacts = [
      {
        firstName: "Maria",
        lastName: "Rodriguez",
        email: "maria@bellacuisine.com",
        phone: "+1-305-847-2156",
        company: "Bella Cuisine Restaurant",
        position: "Owner",
        leadStatus: "qualified",
        leadSource: "yelp",
        disposition: "interested",
        priority: "high",
        budget: 500000, // $5,000
        timeline: "1_month",
        notes: "Found us through Yelp review. Needs help with digital marketing for new restaurant location.",
        tags: ["restaurant", "high-value", "local-business"],
        createdBy: 1
      },
      {
        firstName: "David",
        lastName: "Chen",
        email: "david.chen@techstart.io",
        phone: "+1-212-934-7821",
        company: "TechStart Solutions",
        position: "CEO",
        leadStatus: "contacted",
        leadSource: "google_maps",
        disposition: "callback",
        priority: "urgent",
        budget: 1500000, // $15,000
        timeline: "immediate",
        notes: "Found our office on Google Maps. Looking for comprehensive digital marketing strategy.",
        tags: ["tech-startup", "enterprise", "b2b"],
        createdBy: 1
      },
      {
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah@boutiquestyle.com",
        phone: "+1-713-458-9207",
        company: "Boutique Style",
        position: "Marketing Manager",
        leadStatus: "new",
        leadSource: "instagram",
        disposition: "interested",
        priority: "medium",
        budget: 250000, // $2,500
        timeline: "3_months",
        notes: "Discovered us through Instagram ads. Fashion boutique looking to increase online presence.",
        tags: ["fashion", "e-commerce", "social-media"],
        createdBy: 1
      },
      {
        firstName: "Michael",
        lastName: "Thompson",
        email: "mike@fitnessplus.com",
        phone: "+1-404-729-3851",
        company: "Fitness Plus Gym",
        position: "General Manager",
        leadStatus: "proposal",
        leadSource: "tiktok",
        disposition: "interested",
        priority: "high",
        budget: 800000, // $8,000
        timeline: "1_month",
        notes: "Saw our TikTok content about gym marketing. Wants to attract younger demographic.",
        tags: ["fitness", "local-business", "gen-z-targeting"],
        createdBy: 1
      },
      {
        firstName: "Amanda",
        lastName: "Davis",
        email: "amanda@luxuryrealty.com",
        phone: "+1-206-592-1476",
        company: "Luxury Realty Group",
        position: "Lead Agent",
        leadStatus: "qualified",
        leadSource: "facebook",
        disposition: "interested",
        priority: "high",
        budget: 1200000, // $12,000
        timeline: "immediate",
        notes: "Connected through Facebook business network. High-end real estate agent needing lead generation.",
        tags: ["real-estate", "luxury", "lead-generation"],
        createdBy: 1
      },
      {
        firstName: "Robert",
        lastName: "Wilson",
        email: "robert@wilsonlaw.com",
        phone: "+1-312-647-8293",
        company: "Wilson Law Firm",
        position: "Partner",
        leadStatus: "contacted",
        leadSource: "linkedin",
        disposition: "callback",
        priority: "medium",
        budget: 600000, // $6,000
        timeline: "6_months",
        notes: "LinkedIn connection. Law firm looking to expand digital presence and attract corporate clients.",
        tags: ["legal", "professional-services", "b2b"],
        createdBy: 1
      },
      {
        firstName: "Jennifer",
        lastName: "Martinez",
        email: "jen@creativestudio.com",
        phone: "+1-718-394-5672",
        company: "Creative Studio",
        position: "Creative Director",
        leadStatus: "new",
        leadSource: "youtube",
        disposition: "interested",
        priority: "medium",
        budget: 350000, // $3,500
        timeline: "3_months",
        notes: "Found us through YouTube video about creative agency marketing. Design studio needing client acquisition.",
        tags: ["creative-agency", "design", "b2b"],
        createdBy: 1
      },
      {
        firstName: "Alex",
        lastName: "Brown",
        email: "alex@moderndental.com",
        phone: "+1-305-821-7394",
        company: "Modern Dental Practice",
        position: "Practice Manager",
        leadStatus: "qualified",
        leadSource: "google_ads",
        disposition: "interested",
        priority: "high",
        budget: 450000, // $4,500
        timeline: "1_month",
        notes: "Clicked on Google Ads campaign. Dental practice wanting to increase patient bookings.",
        tags: ["healthcare", "dental", "local-business"],
        createdBy: 1
      },
      {
        firstName: "Lisa",
        lastName: "Garcia",
        email: "lisa@homeservices.com",
        phone: "+1-602-485-1927",
        company: "Premium Home Services",
        position: "Owner",
        leadStatus: "contacted",
        leadSource: "referral",
        disposition: "interested",
        priority: "medium",
        budget: 300000, // $3,000
        timeline: "3_months",
        notes: "Referred by existing client. Home services company needing online visibility.",
        tags: ["home-services", "referral", "local-business"],
        createdBy: 1
      },
      {
        firstName: "Carlos",
        lastName: "Mendez",
        email: "carlos@autorepair.com",
        phone: "+1-480-923-6581",
        company: "Mendez Auto Repair",
        position: "Owner",
        leadStatus: "new",
        leadSource: "chat_widget",
        disposition: "interested",
        priority: "medium",
        budget: 200000, // $2,000
        timeline: "6_months",
        notes: "Contacted through website chat widget. Auto repair shop looking to compete with larger chains.",
        tags: ["automotive", "local-business", "small-business"],
        createdBy: 1
      },
      {
        firstName: "Nicole",
        lastName: "Taylor",
        email: "nicole@eventplanning.com",
        phone: "+1-415-762-3048",
        company: "Elegant Events",
        position: "Event Coordinator",
        leadStatus: "proposal",
        leadSource: "twitter",
        disposition: "interested",
        priority: "medium",
        budget: 400000, // $4,000
        timeline: "1_month",
        notes: "Engaged with our Twitter content about event marketing. Wedding and corporate event planning.",
        tags: ["events", "weddings", "b2b-b2c"],
        createdBy: 1
      },
      {
        firstName: "James",
        lastName: "Anderson",
        email: "james@constructioncorp.com",
        phone: "+1-214-857-4923",
        company: "Anderson Construction",
        position: "Project Manager",
        leadStatus: "qualified",
        leadSource: "website",
        disposition: "callback",
        priority: "high",
        budget: 1000000, // $10,000
        timeline: "immediate",
        notes: "Direct website inquiry. Large construction company needing B2B lead generation.",
        tags: ["construction", "b2b", "enterprise"],
        createdBy: 1
      }
    ];

    sampleContacts.forEach(contactData => {
      const contact: Contact = {
        ...contactData,
        id: this.currentContactId++,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
        avatar: null,
        lastContactedAt: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null,
        nextFollowUpAt: Math.random() > 0.3 ? new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000) : null,
        updatedAt: new Date(),
        updatedBy: null,
        assignedTo: Math.random() > 0.3 ? 1 : null, // Some leads assigned to admin user
        assignedBy: Math.random() > 0.3 ? 1 : null,
        assignedAt: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null,
        pipelineStage: ['prospect', 'qualified', 'demo', 'proposal', 'negotiation'][Math.floor(Math.random() * 5)],
        dealValue: contactData.budget ? contactData.budget + Math.floor(Math.random() * 50000) : null,
      };
      this.contacts.set(contact.id, contact);
    });
  }

  private initializeDocumentTemplates() {
    const defaultTemplates = [
      {
        name: "Service Agreement",
        content: `SERVICE AGREEMENT

This Service Agreement ("Agreement") is entered into on {{date}} between {{company_name}} ("Company") and {{client_name}} ("Client").

SERVICES:
Company agrees to provide the following services:
{{service_description}}

TERMS:
- Service Period: {{service_period}}
- Total Investment: {{amount}}
- Payment Terms: {{payment_terms}}

DELIVERABLES:
{{deliverables}}

By signing below, both parties agree to the terms outlined in this agreement.

Company Representative: ___________________ Date: ___________
{{company_name}}

Client Signature: ________________________ Date: ___________
{{client_name}}`,
        variables: ["date", "company_name", "client_name", "service_description", "service_period", "amount", "payment_terms", "deliverables"],
        category: "service_agreement",
        createdBy: 1,
        isPublic: true,
        companyId: 1
      },
      {
        name: "Development Contract",
        content: `WEBSITE DEVELOPMENT CONTRACT

This Development Contract is between {{company_name}} and {{client_name}} for website development services.

PROJECT SCOPE:
{{project_scope}}

TIMELINE:
- Project Start: {{start_date}}
- Estimated Completion: {{completion_date}}
- Total Investment: {{amount}}

DELIVERABLES:
- Custom website design
- Responsive development
- Content management system
- {{additional_features}}

PAYMENT SCHEDULE:
{{payment_schedule}}

TERMS & CONDITIONS:
{{terms_conditions}}

Signatures:
Company: ___________________ Date: ___________
Client: ____________________ Date: ___________`,
        variables: ["company_name", "client_name", "project_scope", "start_date", "completion_date", "amount", "additional_features", "payment_schedule", "terms_conditions"],
        category: "development",
        createdBy: 1,
        isPublic: true,
        companyId: 1
      },
      {
        name: "Non-Disclosure Agreement",
        content: `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("NDA") is entered into by {{company_name}} and {{client_name}}.

CONFIDENTIAL INFORMATION:
Both parties agree to protect confidential information including but not limited to:
- Business strategies and plans
- Technical specifications
- Client lists and data
- {{additional_confidential_items}}

TERM:
This agreement shall remain in effect for {{term_duration}}.

OBLIGATIONS:
- Information shall not be disclosed to third parties
- Information shall only be used for the intended business purpose
- Upon termination, all materials shall be returned

Signatures:
{{company_name}}: ___________________ Date: ___________
{{client_name}}: ____________________ Date: ___________`,
        variables: ["company_name", "client_name", "additional_confidential_items", "term_duration"],
        category: "nda",
        createdBy: 1,
        isPublic: true,
        companyId: 1
      },
      {
        name: "Proposal Template",
        content: `PROJECT PROPOSAL

Prepared for: {{client_name}}
Prepared by: {{company_name}}
Date: {{date}}

PROJECT OVERVIEW:
{{project_overview}}

OBJECTIVES:
{{objectives}}

STRATEGY:
{{strategy}}

DELIVERABLES:
{{deliverables}}

TIMELINE:
{{timeline}}

INVESTMENT:
Total Project Investment: {{amount}}
Payment Terms: {{payment_terms}}

NEXT STEPS:
{{next_steps}}

We look forward to working with you on this exciting project.

Authorized by:
{{company_name}} Representative: ___________________ Date: ___________

Client Approval:
{{client_name}} Representative: ____________________ Date: ___________`,
        variables: ["client_name", "company_name", "date", "project_overview", "objectives", "strategy", "deliverables", "timeline", "amount", "payment_terms", "next_steps"],
        category: "proposal",
        createdBy: 1,
        isPublic: true,
        companyId: 1
      }
    ];

    defaultTemplates.forEach(templateData => {
      const template: DocumentTemplate = {
        ...templateData,
        id: this.currentDocumentTemplateId++,
        createdAt: new Date()
      };
      this.documentTemplates.set(template.id, template);
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.currentUserId++,
      createdAt: new Date(),
      username: insertUser.username,
      password: insertUser.password,
      email: insertUser.email,
      firstName: insertUser.firstName,
      lastName: insertUser.lastName,
      role: insertUser.role ?? "viewer",
      phone: insertUser.phone ?? null,
      mobilePhone: insertUser.mobilePhone ?? null,
      extension: insertUser.extension ?? null,
      avatar: insertUser.avatar ?? null,
      isActive: insertUser.isActive ?? true,
    };
    this.users.set(user.id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserPhone(id: number, phone: string, mobilePhone?: string, extension?: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = { 
      ...user, 
      phone, 
      mobilePhone: mobilePhone || user.mobilePhone,
      extension: extension || user.extension
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    const [result] = await db.delete(users).where(eq(users.id, id)).returning();
    return !!result;
  }

  // Companies
  async getCompany(id: number): Promise<Company | undefined> {
    return this.companies.get(id);
  }

  async getAllCompanies(): Promise<Company[]> {
    return Array.from(this.companies.values());
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const company: Company = {
      id: this.currentCompanyId++,
      name: insertCompany.name,
      logo: insertCompany.logo ?? null,
      primaryColor: insertCompany.primaryColor ?? null,
      secondaryColor: insertCompany.secondaryColor ?? null,
      domain: insertCompany.domain ?? null,
      createdAt: new Date(),
    };
    this.companies.set(company.id, company);
    return company;
  }

  async updateCompany(id: number, updates: Partial<InsertCompany>): Promise<Company | undefined> {
    const company = this.companies.get(id);
    if (!company) return undefined;
    
    const updatedCompany: Company = { ...company, ...updates };
    this.companies.set(id, updatedCompany);
    return updatedCompany;
  }

  // Contacts
  async getAllContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values());
  }

  async getContact(id: number): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }

  async createContact(insertContact: InsertContact & { createdBy: number }): Promise<Contact> {
    const contact: Contact = {
      id: this.currentContactId++,
      createdAt: new Date(),
      updatedAt: new Date(),
      firstName: insertContact.firstName,
      lastName: insertContact.lastName,
      email: insertContact.email ?? null,
      phone: insertContact.phone ?? null,
      avatar: insertContact.avatar ?? null,
      company: insertContact.company ?? null,
      position: insertContact.position ?? null,
      leadSource: insertContact.leadSource ?? null,
      leadStatus: insertContact.leadStatus ?? null,
      disposition: insertContact.disposition ?? null,
      priority: insertContact.priority ?? "medium",
      budget: insertContact.budget ?? null,
      timeline: insertContact.timeline ?? null,
      notes: insertContact.notes ?? null,
      tags: insertContact.tags ?? null,
      lastContactedAt: insertContact.lastContactedAt ?? null,
      nextFollowUpAt: insertContact.nextFollowUpAt ?? null,
      assignedTo: insertContact.assignedTo ?? null,
      assignedBy: insertContact.assignedBy ?? null,
      assignedAt: insertContact.assignedAt ?? null,
      pipelineStage: insertContact.pipelineStage ?? "prospect",
      dealValue: insertContact.dealValue ?? null,
      createdBy: insertContact.createdBy,
      updatedBy: null,
    };
    this.contacts.set(contact.id, contact);
    return contact;
  }

  async updateContact(id: number, updates: Partial<InsertContact>): Promise<Contact | undefined> {
    const contact = this.contacts.get(id);
    if (!contact) return undefined;
    
    const updatedContact: Contact = { ...contact, ...updates };
    this.contacts.set(id, updatedContact);
    return updatedContact;
  }

  async deleteContact(id: number): Promise<boolean> {
    return this.contacts.delete(id);
  }

  async assignLead(leadId: number, assignedTo: number, assignedBy: number, notes?: string): Promise<Contact | undefined> {
    const contact = this.contacts.get(leadId);
    if (!contact) return undefined;
    
    const updatedContact: Contact = {
      ...contact,
      assignedTo,
      assignedBy,
      assignedAt: new Date(),
      updatedAt: new Date(),
      updatedBy: assignedBy
    };
    
    this.contacts.set(leadId, updatedContact);
    return updatedContact;
  }

  async getLeadsByRep(repId: number): Promise<Contact[]> {
    const contacts = Array.from(this.contacts.values());
    return contacts.filter(contact => contact.assignedTo === repId);
  }

  async searchContacts(query: string): Promise<Contact[]> {
    const contacts = Array.from(this.contacts.values());
    const lowercaseQuery = query.toLowerCase();
    return contacts.filter(contact => 
      contact.firstName.toLowerCase().includes(lowercaseQuery) ||
      contact.lastName.toLowerCase().includes(lowercaseQuery) ||
      contact.email?.toLowerCase().includes(lowercaseQuery) ||
      contact.company?.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Events
  async getAllEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }

  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async getEventsByDateRange(startDate: Date, endDate: Date): Promise<Event[]> {
    const events = Array.from(this.events.values());
    return events.filter(event => 
      event.startDate >= startDate && event.startDate <= endDate
    );
  }

  async createEvent(insertEvent: InsertEvent & { createdBy: number }): Promise<Event> {
    const event: Event = {
      id: this.currentEventId++,
      createdAt: new Date(),
      type: insertEvent.type ?? "meeting",
      status: insertEvent.status ?? "scheduled",
      createdBy: insertEvent.createdBy,
      title: insertEvent.title,
      description: insertEvent.description ?? null,
      startDate: insertEvent.startDate,
      endDate: insertEvent.endDate,
      isVideoCall: insertEvent.isVideoCall ?? null,
      videoCallLink: insertEvent.videoCallLink ?? null,
      attendees: insertEvent.attendees ?? null,
      attachments: insertEvent.attachments ?? null,
    };
    this.events.set(event.id, event);
    return event;
  }

  async updateEvent(id: number, updates: Partial<InsertEvent>): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (!event) return undefined;
    
    const updatedEvent: Event = { ...event, ...updates };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteEvent(id: number): Promise<boolean> {
    return this.events.delete(id);
  }

  // Files
  async getAllFiles(): Promise<File[]> {
    return Array.from(this.files.values());
  }

  async getFile(id: number): Promise<File | undefined> {
    return this.files.get(id);
  }

  async getFilesByFolder(folder: string): Promise<File[]> {
    const files = Array.from(this.files.values());
    return files.filter(file => file.folder === folder);
  }

  async createFile(insertFile: InsertFile & { uploadedBy: number }): Promise<File> {
    const file: File = {
      id: this.currentFileId++,
      name: insertFile.name,
      createdAt: new Date(),
      path: insertFile.path,
      type: insertFile.type,
      tags: insertFile.tags ?? null,
      size: insertFile.size,
      originalName: insertFile.originalName,
      folder: insertFile.folder ?? null,
      uploadedBy: insertFile.uploadedBy,
    };
    this.files.set(file.id, file);
    return file;
  }

  async updateFile(id: number, updates: Partial<InsertFile>): Promise<File | undefined> {
    const file = this.files.get(id);
    if (!file) return undefined;
    
    const updatedFile: File = { ...file, ...updates };
    this.files.set(id, updatedFile);
    return updatedFile;
  }

  async deleteFile(id: number): Promise<boolean> {
    return this.files.delete(id);
  }

  // Automations
  async getAllAutomations(): Promise<Automation[]> {
    return Array.from(this.automations.values());
  }

  async getAutomation(id: number): Promise<Automation | undefined> {
    return this.automations.get(id);
  }

  async createAutomation(insertAutomation: InsertAutomation & { createdBy: number }): Promise<Automation> {
    const automation: Automation = {
      id: this.currentAutomationId++,
      name: insertAutomation.name,
      isActive: insertAutomation.isActive ?? null,
      createdAt: new Date(),
      createdBy: insertAutomation.createdBy,
      description: insertAutomation.description ?? null,
      trigger: insertAutomation.trigger,
      actions: insertAutomation.actions,
      lastRun: null,
    };
    this.automations.set(automation.id, automation);
    return automation;
  }

  async updateAutomation(id: number, updates: Partial<InsertAutomation>): Promise<Automation | undefined> {
    const automation = this.automations.get(id);
    if (!automation) return undefined;
    
    const updatedAutomation: Automation = { ...automation, ...updates };
    this.automations.set(id, updatedAutomation);
    return updatedAutomation;
  }

  async deleteAutomation(id: number): Promise<boolean> {
    return this.automations.delete(id);
  }

  // Scraping Jobs
  async getAllScrapingJobs(): Promise<ScrapingJob[]> {
    return Array.from(this.scrapingJobs.values());
  }

  async getScrapingJob(id: number): Promise<ScrapingJob | undefined> {
    return this.scrapingJobs.get(id);
  }

  async createScrapingJob(insertJob: InsertScrapingJob & { createdBy: number; lastRun?: Date | null; results?: any }): Promise<ScrapingJob> {
    const job: ScrapingJob = {
      id: this.currentScrapingJobId++,
      name: insertJob.name,
      createdAt: new Date(),
      status: insertJob.status ?? "pending",
      createdBy: insertJob.createdBy,
      lastRun: insertJob.lastRun ?? null,
      url: insertJob.url,
      selectors: insertJob.selectors,
      schedule: insertJob.schedule ?? null,
      results: insertJob.results ?? null,
    };
    this.scrapingJobs.set(job.id, job);
    return job;
  }

  async updateScrapingJob(id: number, updates: Partial<InsertScrapingJob>): Promise<ScrapingJob | undefined> {
    const job = this.scrapingJobs.get(id);
    if (!job) return undefined;
    
    const updatedJob: ScrapingJob = { ...job, ...updates };
    this.scrapingJobs.set(id, updatedJob);
    return updatedJob;
  }

  async deleteScrapingJob(id: number): Promise<boolean> {
    return this.scrapingJobs.delete(id);
  }

  // Chat Messages
  async getChatMessages(contactId: number): Promise<ChatMessage[]> {
    const messages = Array.from(this.chatMessages.values());
    return messages.filter(message => message.contactId === contactId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const message: ChatMessage = {
      id: this.currentChatMessageId++,
      createdAt: new Date(),
      message: insertMessage.message,
      type: insertMessage.type ?? null,
      updatedAt: new Date(),
      attachments: insertMessage.attachments ?? null,
      contactId: insertMessage.contactId ?? null,
      senderId: insertMessage.senderId ?? null,
      isFromContact: insertMessage.isFromContact ?? null,
      readAt: null,
    };
    this.chatMessages.set(message.id, message);
    
    // Update conversation's last message time
    const conversation = await this.getConversation(message.contactId!);
    if (conversation) {
      await this.updateConversation(conversation.id, { updatedAt: message.createdAt });
    }
    
    return message;
  }

  async markMessageAsRead(messageId: number): Promise<ChatMessage | undefined> {
    const message = this.chatMessages.get(messageId);
    if (!message) return undefined;
    
    const updatedMessage: ChatMessage = { ...message, readAt: new Date() };
    this.chatMessages.set(messageId, updatedMessage);
    return updatedMessage;
  }

  // Chat Conversations
  async getAllConversations(): Promise<ChatConversation[]> {
    return Array.from(this.chatConversations.values())
      .sort((a, b) => {
        const aTime = a.lastMessageAt || a.createdAt;
        const bTime = b.lastMessageAt || b.createdAt;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });
  }

  async getConversation(contactId: number): Promise<ChatConversation | undefined> {
    return Array.from(this.chatConversations.values())
      .find(conv => conv.contactId === contactId);
  }

  async createConversation(insertConversation: InsertChatConversation): Promise<ChatConversation> {
    const conversation: ChatConversation = {
      id: this.currentConversationId++,
      createdAt: new Date(),
      status: insertConversation.status ?? null,
      notes: insertConversation.notes ?? null,
      priority: insertConversation.priority ?? null,
      updatedAt: new Date(),
      contactId: insertConversation.contactId,
      assignedTo: insertConversation.assignedTo ?? null,
      lastMessageAt: null,
    };
    this.chatConversations.set(conversation.id, conversation);
    return conversation;
  }

  async updateConversation(id: number, updates: Partial<InsertChatConversation>): Promise<ChatConversation | undefined> {
    const conversation = this.chatConversations.get(id);
    if (!conversation) return undefined;
    
    const updatedConversation: ChatConversation = { ...conversation, ...updates };
    this.chatConversations.set(id, updatedConversation);
    return updatedConversation;
  }

  // Call Log methods
  async getAllCallLogs(): Promise<CallLog[]> {
    return Array.from(this.callLogs.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getCallLog(id: number): Promise<CallLog | undefined> {
    return this.callLogs.get(id);
  }

  async getCallLogsByContact(contactId: number): Promise<CallLog[]> {
    return Array.from(this.callLogs.values())
      .filter(log => log.contactId === contactId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getCallLogsByUser(userId: number): Promise<CallLog[]> {
    return Array.from(this.callLogs.values())
      .filter(log => log.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createCallLog(insertCallLog: InsertCallLog): Promise<CallLog> {
    const callLog: CallLog = {
      id: this.currentCallLogId++,
      createdAt: new Date(),
      status: insertCallLog.status,
      notes: insertCallLog.notes ?? null,
      contactId: insertCallLog.contactId ?? null,
      userId: insertCallLog.userId,
      direction: insertCallLog.direction,
      phoneNumber: insertCallLog.phoneNumber,
      startTime: insertCallLog.startTime,
      endTime: insertCallLog.endTime ?? null,
      duration: insertCallLog.duration ?? null,
      recording: insertCallLog.recording ?? null,
      talkTime: insertCallLog.talkTime ?? null,
      outcome: insertCallLog.outcome ?? null,
      followUpDate: insertCallLog.followUpDate ?? null,
    };
    this.callLogs.set(callLog.id, callLog);
    return callLog;
  }

  async updateCallLog(id: number, updates: Partial<InsertCallLog>): Promise<CallLog | undefined> {
    const callLog = this.callLogs.get(id);
    if (!callLog) return undefined;
    
    const updatedCallLog: CallLog = { ...callLog, ...updates };
    this.callLogs.set(id, updatedCallLog);
    return updatedCallLog;
  }

  async deleteCallLog(id: number): Promise<boolean> {
    return this.callLogs.delete(id);
  }

  // Campaign methods
  async getAllCampaigns(): Promise<Campaign[]> {
    return Array.from(this.campaigns.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }

  async getCampaignsByCreator(createdBy: number): Promise<Campaign[]> {
    return Array.from(this.campaigns.values())
      .filter(campaign => campaign.createdBy === createdBy)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getCampaignsByAssignee(assignedTo: number): Promise<Campaign[]> {
    return Array.from(this.campaigns.values())
      .filter(campaign => campaign.assignedTo === assignedTo)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createCampaign(insertCampaign: InsertCampaign & { createdBy: number }): Promise<Campaign> {
    const campaign: Campaign = {
      id: this.currentCampaignId++,
      name: insertCampaign.name,
      createdAt: new Date(),
      type: insertCampaign.type,
      status: insertCampaign.status ?? null,
      tags: insertCampaign.tags ?? null,
      budget: insertCampaign.budget ?? null,
      createdBy: insertCampaign.createdBy,
      description: insertCampaign.description ?? null,
      startDate: insertCampaign.startDate ?? null,
      endDate: insertCampaign.endDate ?? null,
      assignedTo: insertCampaign.assignedTo ?? null,
      targetAudience: insertCampaign.targetAudience ?? null,
      spent: null,
      impressions: null,
      clicks: null,
      conversions: null,
      leads: null,
    };
    this.campaigns.set(campaign.id, campaign);
    return campaign;
  }

  async updateCampaign(id: number, updates: Partial<InsertCampaign>): Promise<Campaign | undefined> {
    const campaign = this.campaigns.get(id);
    if (!campaign) return undefined;
    
    const updatedCampaign: Campaign = { ...campaign, ...updates };
    this.campaigns.set(id, updatedCampaign);
    return updatedCampaign;
  }

  async deleteCampaign(id: number): Promise<boolean> {
    return this.campaigns.delete(id);
  }

  // Lead Allocation methods
  async getAllLeadAllocations(): Promise<LeadAllocation[]> {
    return Array.from(this.leadAllocations.values())
      .sort((a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime());
  }

  async getLeadAllocation(id: number): Promise<LeadAllocation | undefined> {
    return this.leadAllocations.get(id);
  }

  async getLeadAllocationsByContact(contactId: number): Promise<LeadAllocation[]> {
    return Array.from(this.leadAllocations.values())
      .filter(allocation => allocation.contactId === contactId)
      .sort((a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime());
  }

  async getLeadAllocationsByAssignee(assignedTo: number): Promise<LeadAllocation[]> {
    return Array.from(this.leadAllocations.values())
      .filter(allocation => allocation.assignedTo === assignedTo)
      .sort((a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime());
  }

  async getLeadAllocationsByCampaign(campaignId: number): Promise<LeadAllocation[]> {
    return Array.from(this.leadAllocations.values())
      .filter(allocation => allocation.campaignId === campaignId)
      .sort((a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime());
  }

  async createLeadAllocation(insertAllocation: InsertLeadAllocation): Promise<LeadAllocation> {
    const allocation: LeadAllocation = {
      id: this.currentLeadAllocationId++,
      status: insertAllocation.status ?? null,
      notes: insertAllocation.notes ?? null,
      priority: insertAllocation.priority ?? null,
      contactId: insertAllocation.contactId,
      assignedTo: insertAllocation.assignedTo,
      assignedBy: insertAllocation.assignedBy,
      campaignId: insertAllocation.campaignId ?? null,
      assignedAt: new Date(),
      dueDate: insertAllocation.dueDate ?? null,
      completedAt: null,
    };
    this.leadAllocations.set(allocation.id, allocation);
    return allocation;
  }

  async updateLeadAllocation(id: number, updates: Partial<InsertLeadAllocation>): Promise<LeadAllocation | undefined> {
    const allocation = this.leadAllocations.get(id);
    if (!allocation) return undefined;
    
    const updatedAllocation: LeadAllocation = { ...allocation, ...updates };
    this.leadAllocations.set(id, updatedAllocation);
    return updatedAllocation;
  }

  async deleteLeadAllocation(id: number): Promise<boolean> {
    return this.leadAllocations.delete(id);
  }

  // Document Templates
  async getAllDocumentTemplates(): Promise<DocumentTemplate[]> {
    return Array.from(this.documentTemplates.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getDocumentTemplate(id: number): Promise<DocumentTemplate | undefined> {
    return this.documentTemplates.get(id);
  }

  async createDocumentTemplate(insertTemplate: InsertDocumentTemplate & { createdBy: number }): Promise<DocumentTemplate> {
    const template: DocumentTemplate = {
      id: this.currentDocumentTemplateId++,
      name: insertTemplate.name,
      createdAt: new Date(),
      createdBy: insertTemplate.createdBy,
      content: insertTemplate.content,
      variables: insertTemplate.variables ?? null,
      category: insertTemplate.category ?? "general",
      isPublic: insertTemplate.isPublic ?? null,
      companyId: insertTemplate.companyId ?? null,
    };
    this.documentTemplates.set(template.id, template);
    return template;
  }

  async updateDocumentTemplate(id: number, updates: Partial<InsertDocumentTemplate>): Promise<DocumentTemplate | undefined> {
    const template = this.documentTemplates.get(id);
    if (!template) return undefined;
    
    const updatedTemplate: DocumentTemplate = { ...template, ...updates };
    this.documentTemplates.set(id, updatedTemplate);
    return updatedTemplate;
  }

  async deleteDocumentTemplate(id: number): Promise<boolean> {
    return this.documentTemplates.delete(id);
  }

  // Signing Requests
  async getAllSigningRequests(): Promise<SigningRequest[]> {
    return Array.from(this.signingRequests.values())
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getSigningRequest(id: number): Promise<SigningRequest | undefined> {
    return this.signingRequests.get(id);
  }

  async getSigningRequestsByUser(userId: number): Promise<SigningRequest[]> {
    return Array.from(this.signingRequests.values())
      .filter(request => request.createdBy === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createSigningRequest(insertRequest: InsertSigningRequest & { createdBy: number }): Promise<SigningRequest> {
    const request: SigningRequest = {
      id: this.currentSigningRequestId++,
      createdAt: new Date(),
      documentTitle: insertRequest.documentTitle,
      recipientName: insertRequest.recipientName,
      recipientEmail: insertRequest.recipientEmail,
      senderEmail: insertRequest.senderEmail,
      status: insertRequest.status ?? "draft",
      priority: insertRequest.priority ?? "medium",
      customMessage: insertRequest.customMessage ?? null,
      expiresAt: insertRequest.expiresAt ?? null,
      contactId: insertRequest.contactId ?? null,
      templateId: insertRequest.templateId ?? null,
      createdBy: insertRequest.createdBy,
      completedAt: null,
      approveOmeId: null,
      signingUrl: null,
      documentUrl: null,
      sentAt: null,
      viewedAt: null,
      signedAt: null,
    };
    this.signingRequests.set(request.id, request);
    return request;
  }

  async updateSigningRequest(id: number, updates: Partial<InsertSigningRequest>): Promise<SigningRequest | undefined> {
    const request = this.signingRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest: SigningRequest = { ...request, ...updates };
    this.signingRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  async deleteSigningRequest(id: number): Promise<boolean> {
    return this.signingRequests.delete(id);
  }

  // Service Packages
  async getServicePackages(): Promise<ServicePackage[]> {
    return await db.select().from(servicePackages).where(eq(servicePackages.isActive, true));
  }

  async getServicePackage(id: number): Promise<ServicePackage | undefined> {
    const [servicePackage] = await db.select().from(servicePackages).where(eq(servicePackages.id, id));
    return servicePackage || undefined;
  }

  async createServicePackage(insertServicePackage: InsertServicePackage): Promise<ServicePackage> {
    const [servicePackage] = await db
      .insert(servicePackages)
      .values(insertServicePackage)
      .returning();
    return servicePackage;
  }

  async updateServicePackage(id: number, updates: Partial<InsertServicePackage>): Promise<ServicePackage | undefined> {
    const [servicePackage] = await db
      .update(servicePackages)
      .set(updates)
      .where(eq(servicePackages.id, id))
      .returning();
    return servicePackage || undefined;
  }

  async deleteServicePackage(id: number): Promise<boolean> {
    const result = await db
      .update(servicePackages)
      .set({ isActive: false })
      .where(eq(servicePackages.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Cost Structures
  async getCostStructureByPackage(packageId: number): Promise<CostStructure[]> {
    return await db.select().from(costStructure).where(eq(costStructure.servicePackageId, packageId));
  }

  async createCostStructure(insertCostStructure: InsertCostStructure): Promise<CostStructure> {
    const [cost] = await db
      .insert(costStructure)
      .values(insertCostStructure)
      .returning();
    return cost;
  }

  async updateCostStructure(id: number, updates: Partial<InsertCostStructure>): Promise<CostStructure | undefined> {
    const [cost] = await db
      .update(costStructure)
      .set(updates)
      .where(eq(costStructure.id, id))
      .returning();
    return cost || undefined;
  }

  async deleteCostStructure(id: number): Promise<boolean> {
    const result = await db.delete(costStructure).where(eq(costStructure.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Profitability Analyses
  async getProfitabilityAnalyses(): Promise<ProfitabilityAnalysis[]> {
    return await db.select().from(profitabilityAnalysis);
  }

  async createProfitabilityAnalysis(insertAnalysis: InsertProfitabilityAnalysis): Promise<ProfitabilityAnalysis> {
    const [analysis] = await db
      .insert(profitabilityAnalysis)
      .values(insertAnalysis)
      .returning();
    return analysis;
  }

  async updateProfitabilityAnalysis(id: number, updates: Partial<InsertProfitabilityAnalysis>): Promise<ProfitabilityAnalysis | undefined> {
    const [analysis] = await db
      .update(profitabilityAnalysis)
      .set(updates)
      .where(eq(profitabilityAnalysis.id, id))
      .returning();
    return analysis || undefined;
  }

  async deleteProfitabilityAnalysis(id: number): Promise<boolean> {
    const result = await db.delete(profitabilityAnalysis).where(eq(profitabilityAnalysis.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Additional methods needed by routes
  async getLeadsByRep(repId: number): Promise<Contact[]> {
    return await db.select().from(contacts).where(eq(contacts.assignedTo, repId));
  }

  async getPricingProposals(): Promise<any[]> {
    // For now return empty array - would need proper pricing proposal table
    return [];
  }

  async createPricingProposal(proposal: any): Promise<any> {
    // For now return the proposal with an ID - would need proper pricing proposal table
    return { id: Date.now(), ...proposal, createdAt: new Date() };
  }
}

export const storage = new DatabaseStorage();
