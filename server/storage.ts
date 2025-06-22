import { 
  users, contacts, events, files, automations, scrapingJobs, companies,
  type User, type InsertUser, type Contact, type InsertContact,
  type Event, type InsertEvent, type File, type InsertFile,
  type Automation, type InsertAutomation, type ScrapingJob, type InsertScrapingJob,
  type Company, type InsertCompany
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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private companies: Map<number, Company>;
  private contacts: Map<number, Contact>;
  private events: Map<number, Event>;
  private files: Map<number, File>;
  private automations: Map<number, Automation>;
  private scrapingJobs: Map<number, ScrapingJob>;
  private currentUserId: number;
  private currentCompanyId: number;
  private currentContactId: number;
  private currentEventId: number;
  private currentFileId: number;
  private currentAutomationId: number;
  private currentScrapingJobId: number;

  constructor() {
    this.users = new Map();
    this.companies = new Map();
    this.contacts = new Map();
    this.events = new Map();
    this.files = new Map();
    this.automations = new Map();
    this.scrapingJobs = new Map();
    this.currentUserId = 1;
    this.currentCompanyId = 1;
    this.currentContactId = 1;
    this.currentEventId = 1;
    this.currentFileId = 1;
    this.currentAutomationId = 1;
    this.currentScrapingJobId = 1;

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
}

export const storage = new MemStorage();
