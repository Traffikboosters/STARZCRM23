import { 
  users, contacts, events, files, automations, scrapingJobs, companies, chatMessages, chatConversations,
  callLogs, campaigns, leadAllocations,
  type User, type InsertUser, type Contact, type InsertContact,
  type Event, type InsertEvent, type File, type InsertFile,
  type Automation, type InsertAutomation, type ScrapingJob, type InsertScrapingJob,
  type Company, type InsertCompany, type ChatMessage, type InsertChatMessage,
  type ChatConversation, type InsertChatConversation, type CallLog, type InsertCallLog,
  type Campaign, type InsertCampaign, type LeadAllocation, type InsertLeadAllocation
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  
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

    // Initialize with default admin user and company
    this.initializeDefaults();
  }

  private initializeDefaults() {
    const defaultCompany: Company = {
      id: this.currentCompanyId++,
      name: "Enterprise Scheduler Pro",
      logo: null,
      primaryColor: "#0078D4",
      secondaryColor: "#106EBE",
      domain: "example.com",
      createdAt: new Date(),
    };
    this.companies.set(defaultCompany.id, defaultCompany);

    const adminUser: User = {
      id: this.currentUserId++,
      username: "admin",
      password: "admin123", // In production, this would be hashed
      email: "admin@example.com",
      role: "admin",
      firstName: "John",
      lastName: "Doe",
      avatar: null,
      isActive: true,
      createdAt: new Date(),
    };
    this.users.set(adminUser.id, adminUser);
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
      ...insertUser,
      id: this.currentUserId++,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
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
      ...insertCompany,
      id: this.currentCompanyId++,
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
      ...insertContact,
      id: this.currentContactId++,
      createdAt: new Date(),
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
      ...insertEvent,
      id: this.currentEventId++,
      createdAt: new Date(),
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
      ...insertFile,
      id: this.currentFileId++,
      createdAt: new Date(),
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
      ...insertAutomation,
      id: this.currentAutomationId++,
      createdAt: new Date(),
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

  async createScrapingJob(insertJob: InsertScrapingJob & { createdBy: number }): Promise<ScrapingJob> {
    const job: ScrapingJob = {
      ...insertJob,
      id: this.currentScrapingJobId++,
      createdAt: new Date(),
      lastRun: null,
      results: null,
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
      ...insertMessage,
      id: this.currentChatMessageId++,
      createdAt: new Date(),
      readAt: null,
      attachments: insertMessage.attachments || null,
      contactId: insertMessage.contactId || null,
      senderId: insertMessage.senderId || null,
    };
    this.chatMessages.set(message.id, message);
    
    // Update conversation's last message time
    const conversation = await this.getConversation(message.contactId!);
    if (conversation) {
      await this.updateConversation(conversation.id, { lastMessageAt: message.createdAt });
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
      ...insertConversation,
      id: this.currentConversationId++,
      createdAt: new Date(),
      lastMessageAt: null,
      assignedTo: insertConversation.assignedTo || null,
      notes: insertConversation.notes || null,
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
      ...insertCallLog,
      id: this.currentCallLogId++,
      createdAt: new Date(),
      endedAt: insertCallLog.endedAt || null,
      recordingUrl: insertCallLog.recordingUrl || null,
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
      ...insertCampaign,
      id: this.currentCampaignId++,
      createdAt: new Date(),
      assignedTo: insertCampaign.assignedTo || null,
      budget: insertCampaign.budget || null,
      actualSpend: insertCampaign.actualSpend || null,
      targetAudience: insertCampaign.targetAudience || null,
      channels: insertCampaign.channels || null,
      metrics: insertCampaign.metrics || null,
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
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getLeadAllocation(id: number): Promise<LeadAllocation | undefined> {
    return this.leadAllocations.get(id);
  }

  async getLeadAllocationsByContact(contactId: number): Promise<LeadAllocation[]> {
    return Array.from(this.leadAllocations.values())
      .filter(allocation => allocation.contactId === contactId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getLeadAllocationsByAssignee(assignedTo: number): Promise<LeadAllocation[]> {
    return Array.from(this.leadAllocations.values())
      .filter(allocation => allocation.assignedTo === assignedTo)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getLeadAllocationsByCampaign(campaignId: number): Promise<LeadAllocation[]> {
    return Array.from(this.leadAllocations.values())
      .filter(allocation => allocation.campaignId === campaignId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createLeadAllocation(insertAllocation: InsertLeadAllocation): Promise<LeadAllocation> {
    const allocation: LeadAllocation = {
      ...insertAllocation,
      id: this.currentLeadAllocationId++,
      createdAt: new Date(),
      notes: insertAllocation.notes || null,
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
}

export const storage = new MemStorage();
