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
  timeClockEntries, timeClockSchedules, timeOffRequests,
  emailAccounts, emailTemplates, cancellationMetrics, retentionAttempts, cancellationTrends,
  marketingStrategies, jobPostings, jobApplications, interviewSchedules, careerSettings,
  userPoints, pointActivities, achievements, userAchievements, dailyChallenges, userChallenges,
  leaderboards, pointMultipliers, badgeCategories, userBadges, engagementMetrics,
  paymentTransactions
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
  EmailAccount, EmailTemplate, CancellationMetric, RetentionAttempt, CancellationTrend,
  MarketingStrategy, JobPosting, JobApplication, InterviewSchedule, CareerSettings,
  InsertUser, InsertCompany, InsertContact, InsertEvent, InsertFile, InsertAutomation, InsertScrapingJob,
  InsertChatMessage, InsertChatConversation, InsertCallLog, InsertCampaign, InsertLeadAllocation,
  InsertDocumentTemplate, InsertSigningRequest, InsertUserInvitation,
  InsertContactNote, InsertLeadIntake, InsertLeadEnrichment, InsertEnrichmentHistory, InsertExtractionHistory,
  InsertTechnicalProject, InsertTechnicalTask, InsertTimeEntry, InsertTechnicalProposal, InsertCallRecording, InsertVoiceToneAnalysis,
  InsertCallInsights, InsertKeyCallMoments, InsertCallParticipants, InsertVoiceTrendAnalysis,
  InsertMoodEntry, InsertTeamMoodSummary, InsertMoodPerformanceCorrelation,
  InsertTimeClockEntry, InsertTimeClockSchedule, InsertTimeOffRequest,
  InsertEmailAccount, InsertEmailTemplate, InsertCancellationMetric, InsertRetentionAttempt, InsertCancellationTrend,
  InsertMarketingStrategy, InsertJobPosting, InsertJobApplication, InsertInterviewSchedule, InsertCareerSettings
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
  getContactsPaginated(limit?: number, offset?: number): Promise<Contact[]>;
  getContact(id: number): Promise<Contact | undefined>;
  createContact(contact: InsertContact & { createdBy: number }): Promise<Contact>;
  updateContact(id: number, updates: Partial<InsertContact>): Promise<Contact | undefined>;
  deleteContact(id: number): Promise<boolean>;
  searchContacts(query: string): Promise<Contact[]>;
  getLeadsByRep(repId: number): Promise<Contact[]>;
  updateContactDisposition(id: number, disposition: string, userId: number): Promise<Contact | undefined>;
  getRecentContacts(): Promise<Contact[]>;
  getContactsEligibleForRedistribution(): Promise<Contact[]>;
  redistributeContact(contactId: number, newRepId: number, redistributedBy: number): Promise<Contact | undefined>;
  
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
  
  // Email Account Management
  getAllEmailAccounts(): Promise<EmailAccount[]>;
  getEmailAccountById(id: number): Promise<EmailAccount | undefined>;
  getEmailAccountsByEmployee(employeeId: number): Promise<EmailAccount[]>;
  createEmailAccount(account: InsertEmailAccount): Promise<EmailAccount>;
  updateEmailAccount(id: number, updates: Partial<InsertEmailAccount>): Promise<EmailAccount | undefined>;
  deleteEmailAccount(id: number): Promise<boolean>;
  updateEmailAccountStatus(id: number, status: string): Promise<EmailAccount | undefined>;
  
  // Email Templates
  getAllEmailTemplates(): Promise<EmailTemplate[]>;
  getEmailTemplateById(id: number): Promise<EmailTemplate | undefined>;
  createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate>;
  updateEmailTemplate(id: number, updates: Partial<InsertEmailTemplate>): Promise<EmailTemplate | undefined>;
  deleteEmailTemplate(id: number): Promise<boolean>;
  
  // Employee helpers
  getEmployeesWithoutEmail(): Promise<User[]>;
  
  // Cancellation Metrics
  getAllCancellationMetrics(): Promise<CancellationMetric[]>;
  getCancellationMetricById(id: number): Promise<CancellationMetric | undefined>;
  getCancellationMetricsByContact(contactId: number): Promise<CancellationMetric[]>;
  createCancellationMetric(metric: InsertCancellationMetric): Promise<CancellationMetric>;
  updateCancellationMetric(id: number, updates: Partial<InsertCancellationMetric>): Promise<CancellationMetric | undefined>;
  deleteCancellationMetric(id: number): Promise<boolean>;
  getCancellationMetricsByDateRange(startDate: Date, endDate: Date): Promise<CancellationMetric[]>;
  getCancellationMetricsByServiceDuration(minMonths: number): Promise<CancellationMetric[]>;
  getCancellationsByIndustry(industry: string): Promise<CancellationMetric[]>;
  
  // Retention Attempts
  getAllRetentionAttempts(): Promise<RetentionAttempt[]>;
  getRetentionAttemptById(id: number): Promise<RetentionAttempt | undefined>;
  getRetentionAttemptsByMetric(cancellationMetricId: number): Promise<RetentionAttempt[]>;
  getRetentionAttemptsByContact(contactId: number): Promise<RetentionAttempt[]>;
  createRetentionAttempt(attempt: InsertRetentionAttempt): Promise<RetentionAttempt>;
  updateRetentionAttempt(id: number, updates: Partial<InsertRetentionAttempt>): Promise<RetentionAttempt | undefined>;
  deleteRetentionAttempt(id: number): Promise<boolean>;
  
  // Cancellation Trends
  getAllCancellationTrends(): Promise<CancellationTrend[]>;
  getCancellationTrendById(id: number): Promise<CancellationTrend | undefined>;
  getLatestCancellationTrend(): Promise<CancellationTrend | undefined>;
  createCancellationTrend(trend: InsertCancellationTrend): Promise<CancellationTrend>;
  updateCancellationTrend(id: number, updates: Partial<InsertCancellationTrend>): Promise<CancellationTrend | undefined>;
  deleteCancellationTrend(id: number): Promise<boolean>;
  getCancellationTrendsByPeriod(startDate: Date, endDate: Date): Promise<CancellationTrend[]>;
  
  // Marketing Strategies
  getAllMarketingStrategies(): Promise<MarketingStrategy[]>;
  getMarketingStrategyById(id: number): Promise<MarketingStrategy | undefined>;
  createMarketingStrategy(strategy: InsertMarketingStrategy): Promise<MarketingStrategy>;
  updateMarketingStrategy(id: number, updates: Partial<InsertMarketingStrategy>): Promise<MarketingStrategy | undefined>;
  deleteMarketingStrategy(id: number): Promise<boolean>;
  getMarketingStrategiesByStatus(status: string): Promise<MarketingStrategy[]>;

  // Career Management
  getJobPostings(): Promise<JobPosting[]>;
  getJobPosting(id: number): Promise<JobPosting | undefined>;
  createJobPosting(jobPosting: InsertJobPosting): Promise<JobPosting>;
  updateJobPosting(id: number, updates: Partial<InsertJobPosting>): Promise<JobPosting | undefined>;
  deleteJobPosting(id: number): Promise<boolean>;
  getJobPostingsByDepartment(department: string): Promise<JobPosting[]>;
  getJobPostingsByStatus(status: string): Promise<JobPosting[]>;
  
  getJobApplications(): Promise<JobApplication[]>;
  getJobApplication(id: number): Promise<JobApplication | undefined>;
  getJobApplicationsByJobId(jobId: number): Promise<JobApplication[]>;
  getJobApplicationsByStatus(status: string): Promise<JobApplication[]>;
  createJobApplication(application: InsertJobApplication): Promise<JobApplication>;
  updateJobApplication(id: number, updates: Partial<InsertJobApplication>): Promise<JobApplication | undefined>;
  deleteJobApplication(id: number): Promise<boolean>;
  
  getInterviewSchedules(): Promise<InterviewSchedule[]>;
  getInterviewSchedule(id: number): Promise<InterviewSchedule | undefined>;
  getInterviewSchedulesByApplicationId(applicationId: number): Promise<InterviewSchedule[]>;
  createInterviewSchedule(schedule: InsertInterviewSchedule): Promise<InterviewSchedule>;
  updateInterviewSchedule(id: number, updates: Partial<InsertInterviewSchedule>): Promise<InterviewSchedule | undefined>;
  deleteInterviewSchedule(id: number): Promise<boolean>;
  
  getCareerSettings(): Promise<CareerSettings | undefined>;
  updateCareerSettings(settings: InsertCareerSettings): Promise<CareerSettings>;

  // Gamification System
  getUserPoints(userId: number): Promise<any>;
  createUserPoints(points: any): Promise<any>;
  updateUserPoints(userId: number, updates: any): Promise<any>;
  awardPoints(userId: number, activityType: string, points: number, description: string): Promise<any>;
  getPointActivities(userId: number): Promise<any[]>;
  createPointActivity(activity: any): Promise<any>;
  
  // Achievements
  getAchievements(): Promise<any[]>;
  createAchievement(achievement: any): Promise<any>;
  getUserAchievements(userId: number): Promise<any[]>;
  awardAchievement(userId: number, achievementId: number): Promise<any>;
  checkAchievementProgress(userId: number, achievementId: number): Promise<void>;
  
  // Daily Challenges
  getDailyChallenges(date: Date): Promise<any[]>;
  createDailyChallenge(challenge: any): Promise<any>;
  getUserChallenges(userId: number, date: Date): Promise<any[]>;
  updateChallengeProgress(userId: number, challengeId: number, progress: number): Promise<any>;
  
  // Leaderboards
  getLeaderboard(type: string, category: string, period: string): Promise<any[]>;
  updateLeaderboard(userId: number, type: string, category: string, score: number, period: string): Promise<any>;
  
  // Badges and Engagement
  getUserBadges(userId: number): Promise<any[]>;
  awardBadge(userId: number, badge: any): Promise<any>;
  getEngagementMetrics(userId: number, date: Date): Promise<any>;
  updateEngagementMetrics(userId: number, metrics: any): Promise<any>;
  
  // Payment Processing
  getAllPaymentTransactions(): Promise<any[]>;
  getPaymentTransaction(id: number): Promise<any | undefined>;
  getPaymentTransactionByStripeId(stripePaymentIntentId: string): Promise<any | undefined>;
  createPaymentTransaction(transaction: any): Promise<any>;
  updatePaymentTransaction(id: number, updates: any): Promise<any | undefined>;
  getPaymentAnalytics(): Promise<any>;
  getServicePackages(): Promise<any[]>;
  getServicePackage(id: string): Promise<any | undefined>;
  createServicePackage(servicePackage: any): Promise<any>;
  updateServicePackage(id: string, updates: any): Promise<any | undefined>;
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
    
    // Optimized query with descending order for recent contacts first
    const contactResults = await db.select().from(contacts).orderBy(desc(contacts.createdAt));
    
    const queryTime = Date.now() - startTime;
    if (queryTime > 500) {
      console.log(`⚠️ Slow query detected: getAllContacts took ${queryTime}ms`);
    }
    
    return contactResults;
  }

  // Add paginated version for better performance
  async getContactsPaginated(limit: number = 50, offset: number = 0): Promise<Contact[]> {
    const startTime = Date.now();
    
    const contactResults = await db.select()
      .from(contacts)
      .orderBy(desc(contacts.createdAt))
      .limit(limit)
      .offset(offset);
    
    const queryTime = Date.now() - startTime;
    if (queryTime > 200) {
      console.log(`⚠️ Paginated query took ${queryTime}ms for ${limit} records`);
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

  async updateContactDisposition(id: number, disposition: string, userId: number): Promise<Contact | undefined> {
    const now = new Date();
    const redistributionDate = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000); // 10 days from now
    
    // Sold leads go to Sold Lead Cards Files, all others go to recent contacts folder
    const updateData: any = {
      disposition,
      dispositionDate: now,
      updatedAt: now,
      updatedBy: userId
    };

    if (disposition === 'sold') {
      // Sold leads: route to Sold Lead Cards Files system
      updateData.leadStatus = 'sold';
      updateData.isRecentContact = false;
      updateData.redistributionEligibleAt = null; // Sold leads are not redistributed
    } else {
      // All other dispositions: route to recent contacts folder for 10-day redistribution cycle
      updateData.isRecentContact = true;
      updateData.redistributionEligibleAt = redistributionDate;
    }
    
    const [contact] = await db
      .update(contacts)
      .set(updateData)
      .where(eq(contacts.id, id))
      .returning();
    return contact || undefined;
  }

  async getRecentContacts(): Promise<Contact[]> {
    return await db.select()
      .from(contacts)
      .where(eq(contacts.isRecentContact, true))
      .orderBy(desc(contacts.dispositionDate));
  }

  async getContactsEligibleForRedistribution(): Promise<Contact[]> {
    const now = new Date();
    return await db.select()
      .from(contacts)
      .where(
        and(
          eq(contacts.isRecentContact, true),
          lte(contacts.redistributionEligibleAt, now)
        )
      )
      .orderBy(desc(contacts.redistributionEligibleAt));
  }

  async redistributeContact(contactId: number, newRepId: number, redistributedBy: number): Promise<Contact | undefined> {
    const now = new Date();
    const nextRedistributionDate = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000); // Another 10 days
    
    const [contact] = await db
      .update(contacts)
      .set({
        assignedTo: newRepId,
        assignedBy: redistributedBy,
        assignedAt: now,
        redistributionEligibleAt: nextRedistributionDate,
        isRecentContact: false, // Reset recent contact status for new rep
        updatedAt: now,
        updatedBy: redistributedBy
      })
      .where(eq(contacts.id, contactId))
      .returning();
    return contact || undefined;
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

  // Email Account Management
  async getAllEmailAccounts(): Promise<EmailAccount[]> {
    return await db
      .select()
      .from(emailAccounts)
      .orderBy(desc(emailAccounts.createdAt));
  }

  async getEmailAccountById(id: number): Promise<EmailAccount | undefined> {
    const [emailAccount] = await db
      .select()
      .from(emailAccounts)
      .where(eq(emailAccounts.id, id));
    return emailAccount || undefined;
  }

  async getEmailAccountsByEmployee(employeeId: number): Promise<EmailAccount[]> {
    return await db
      .select()
      .from(emailAccounts)
      .where(eq(emailAccounts.employeeId, employeeId));
  }

  async createEmailAccount(account: InsertEmailAccount): Promise<EmailAccount> {
    const [emailAccount] = await db
      .insert(emailAccounts)
      .values(account)
      .returning();
    return emailAccount;
  }

  async updateEmailAccount(id: number, updates: Partial<InsertEmailAccount>): Promise<EmailAccount | undefined> {
    const [emailAccount] = await db
      .update(emailAccounts)
      .set(updates)
      .where(eq(emailAccounts.id, id))
      .returning();
    return emailAccount || undefined;
  }

  async deleteEmailAccount(id: number): Promise<boolean> {
    const result = await db
      .delete(emailAccounts)
      .where(eq(emailAccounts.id, id));
    return (result.rowCount || 0) > 0;
  }

  async updateEmailAccountStatus(id: number, status: string): Promise<EmailAccount | undefined> {
    const [emailAccount] = await db
      .update(emailAccounts)
      .set({ status })
      .where(eq(emailAccounts.id, id))
      .returning();
    return emailAccount || undefined;
  }

  // Email Templates
  async getAllEmailTemplates(): Promise<EmailTemplate[]> {
    return await db
      .select()
      .from(emailTemplates)
      .orderBy(emailTemplates.name);
  }

  async getEmailTemplateById(id: number): Promise<EmailTemplate | undefined> {
    const [template] = await db
      .select()
      .from(emailTemplates)
      .where(eq(emailTemplates.id, id));
    return template || undefined;
  }

  async createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate> {
    const [emailTemplate] = await db
      .insert(emailTemplates)
      .values(template)
      .returning();
    return emailTemplate;
  }

  async updateEmailTemplate(id: number, updates: Partial<InsertEmailTemplate>): Promise<EmailTemplate | undefined> {
    const [template] = await db
      .update(emailTemplates)
      .set(updates)
      .where(eq(emailTemplates.id, id))
      .returning();
    return template || undefined;
  }

  async deleteEmailTemplate(id: number): Promise<boolean> {
    const result = await db
      .delete(emailTemplates)
      .where(eq(emailTemplates.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Employee helpers
  async getEmployeesWithoutEmail(): Promise<User[]> {
    // Get all users who already have email accounts
    const usersWithEmail = await db
      .select({ employeeId: emailAccounts.employeeId })
      .from(emailAccounts);
    
    const userIdsWithEmail = usersWithEmail.map(u => u.employeeId);
    
    // Get all users
    const allUsers = await db
      .select()
      .from(users);
    
    // Filter out users who already have email accounts
    if (userIdsWithEmail.length === 0) {
      // No email accounts exist, return all users
      return allUsers;
    }
    
    // Return users who don't have email accounts
    return allUsers.filter(user => !userIdsWithEmail.includes(user.id));
  }

  // Cancellation Metrics
  async getAllCancellationMetrics(): Promise<CancellationMetric[]> {
    return await db.select().from(cancellationMetrics).orderBy(desc(cancellationMetrics.cancellationDate));
  }

  async getCancellationMetricById(id: number): Promise<CancellationMetric | undefined> {
    const [metric] = await db.select().from(cancellationMetrics).where(eq(cancellationMetrics.id, id));
    return metric || undefined;
  }

  async getCancellationMetricsByContact(contactId: number): Promise<CancellationMetric[]> {
    return await db.select().from(cancellationMetrics).where(eq(cancellationMetrics.contactId, contactId));
  }

  async createCancellationMetric(metric: InsertCancellationMetric): Promise<CancellationMetric> {
    const [newMetric] = await db.insert(cancellationMetrics).values(metric).returning();
    return newMetric;
  }

  async updateCancellationMetric(id: number, updates: Partial<InsertCancellationMetric>): Promise<CancellationMetric | undefined> {
    const [updatedMetric] = await db
      .update(cancellationMetrics)
      .set(updates)
      .where(eq(cancellationMetrics.id, id))
      .returning();
    return updatedMetric || undefined;
  }

  async deleteCancellationMetric(id: number): Promise<boolean> {
    const result = await db.delete(cancellationMetrics).where(eq(cancellationMetrics.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getCancellationMetricsByDateRange(startDate: Date, endDate: Date): Promise<CancellationMetric[]> {
    return await db
      .select()
      .from(cancellationMetrics)
      .where(and(
        gte(cancellationMetrics.cancellationDate, startDate),
        lte(cancellationMetrics.cancellationDate, endDate)
      ))
      .orderBy(desc(cancellationMetrics.cancellationDate));
  }

  async getCancellationMetricsByServiceDuration(minMonths: number): Promise<CancellationMetric[]> {
    return await db
      .select()
      .from(cancellationMetrics)
      .where(gte(cancellationMetrics.serviceDuration, minMonths * 30)) // convert months to days
      .orderBy(desc(cancellationMetrics.serviceDuration));
  }

  async getCancellationsByIndustry(industry: string): Promise<CancellationMetric[]> {
    return await db
      .select()
      .from(cancellationMetrics)
      .where(eq(cancellationMetrics.industryCategory, industry));
  }

  // Retention Attempts
  async getAllRetentionAttempts(): Promise<RetentionAttempt[]> {
    return await db.select().from(retentionAttempts).orderBy(desc(retentionAttempts.attemptDate));
  }

  async getRetentionAttemptById(id: number): Promise<RetentionAttempt | undefined> {
    const [attempt] = await db.select().from(retentionAttempts).where(eq(retentionAttempts.id, id));
    return attempt || undefined;
  }

  async getRetentionAttemptsByMetric(cancellationMetricId: number): Promise<RetentionAttempt[]> {
    return await db
      .select()
      .from(retentionAttempts)
      .where(eq(retentionAttempts.cancellationMetricId, cancellationMetricId));
  }

  async getRetentionAttemptsByContact(contactId: number): Promise<RetentionAttempt[]> {
    return await db
      .select()
      .from(retentionAttempts)
      .where(eq(retentionAttempts.contactId, contactId));
  }

  async createRetentionAttempt(attempt: InsertRetentionAttempt): Promise<RetentionAttempt> {
    const [newAttempt] = await db.insert(retentionAttempts).values(attempt).returning();
    return newAttempt;
  }

  async updateRetentionAttempt(id: number, updates: Partial<InsertRetentionAttempt>): Promise<RetentionAttempt | undefined> {
    const [updatedAttempt] = await db
      .update(retentionAttempts)
      .set(updates)
      .where(eq(retentionAttempts.id, id))
      .returning();
    return updatedAttempt || undefined;
  }

  async deleteRetentionAttempt(id: number): Promise<boolean> {
    const result = await db.delete(retentionAttempts).where(eq(retentionAttempts.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Cancellation Trends
  async getAllCancellationTrends(): Promise<CancellationTrend[]> {
    return await db.select().from(cancellationTrends).orderBy(desc(cancellationTrends.periodEnd));
  }

  async getCancellationTrendById(id: number): Promise<CancellationTrend | undefined> {
    const [trend] = await db.select().from(cancellationTrends).where(eq(cancellationTrends.id, id));
    return trend || undefined;
  }

  async getLatestCancellationTrend(): Promise<CancellationTrend | undefined> {
    const [latestTrend] = await db
      .select()
      .from(cancellationTrends)
      .orderBy(desc(cancellationTrends.periodEnd))
      .limit(1);
    return latestTrend || undefined;
  }

  async createCancellationTrend(trend: InsertCancellationTrend): Promise<CancellationTrend> {
    const [newTrend] = await db.insert(cancellationTrends).values(trend).returning();
    return newTrend;
  }

  async updateCancellationTrend(id: number, updates: Partial<InsertCancellationTrend>): Promise<CancellationTrend | undefined> {
    const [updatedTrend] = await db
      .update(cancellationTrends)
      .set(updates)
      .where(eq(cancellationTrends.id, id))
      .returning();
    return updatedTrend || undefined;
  }

  async deleteCancellationTrend(id: number): Promise<boolean> {
    const result = await db.delete(cancellationTrends).where(eq(cancellationTrends.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getCancellationTrendsByPeriod(startDate: Date, endDate: Date): Promise<CancellationTrend[]> {
    return await db
      .select()
      .from(cancellationTrends)
      .where(and(
        gte(cancellationTrends.periodStart, startDate),
        lte(cancellationTrends.periodEnd, endDate)
      ))
      .orderBy(desc(cancellationTrends.periodEnd));
  }

  // Marketing Strategies
  async getAllMarketingStrategies(): Promise<MarketingStrategy[]> {
    return await db.select().from(marketingStrategies).orderBy(desc(marketingStrategies.createdAt));
  }

  async getMarketingStrategyById(id: number): Promise<MarketingStrategy | undefined> {
    const [strategy] = await db.select().from(marketingStrategies).where(eq(marketingStrategies.id, id));
    return strategy || undefined;
  }

  async createMarketingStrategy(strategy: InsertMarketingStrategy): Promise<MarketingStrategy> {
    const [newStrategy] = await db.insert(marketingStrategies).values(strategy).returning();
    return newStrategy;
  }

  async updateMarketingStrategy(id: number, updates: Partial<InsertMarketingStrategy>): Promise<MarketingStrategy | undefined> {
    const [updatedStrategy] = await db
      .update(marketingStrategies)
      .set(updates)
      .where(eq(marketingStrategies.id, id))
      .returning();
    return updatedStrategy || undefined;
  }

  async deleteMarketingStrategy(id: number): Promise<boolean> {
    const result = await db.delete(marketingStrategies).where(eq(marketingStrategies.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getMarketingStrategiesByStatus(status: string): Promise<MarketingStrategy[]> {
    return await db
      .select()
      .from(marketingStrategies)
      .where(eq(marketingStrategies.status, status))
      .orderBy(desc(marketingStrategies.createdAt));
  }

  // Career Management Implementation
  async getJobPostings(): Promise<JobPosting[]> {
    return await db
      .select()
      .from(jobPostings)
      .orderBy(desc(jobPostings.createdAt));
  }

  async getJobPosting(id: number): Promise<JobPosting | undefined> {
    const [jobPosting] = await db
      .select()
      .from(jobPostings)
      .where(eq(jobPostings.id, id));
    return jobPosting || undefined;
  }

  async createJobPosting(jobPosting: InsertJobPosting): Promise<JobPosting> {
    const [newJobPosting] = await db
      .insert(jobPostings)
      .values({ ...jobPosting, updatedAt: new Date() })
      .returning();
    return newJobPosting;
  }

  async updateJobPosting(id: number, updates: Partial<InsertJobPosting>): Promise<JobPosting | undefined> {
    const [updatedJobPosting] = await db
      .update(jobPostings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(jobPostings.id, id))
      .returning();
    return updatedJobPosting || undefined;
  }

  async deleteJobPosting(id: number): Promise<boolean> {
    const result = await db.delete(jobPostings).where(eq(jobPostings.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getJobPostingsByDepartment(department: string): Promise<JobPosting[]> {
    return await db
      .select()
      .from(jobPostings)
      .where(eq(jobPostings.department, department))
      .orderBy(desc(jobPostings.createdAt));
  }

  async getJobPostingsByStatus(status: string): Promise<JobPosting[]> {
    return await db
      .select()
      .from(jobPostings)
      .where(eq(jobPostings.status, status))
      .orderBy(desc(jobPostings.createdAt));
  }

  async getJobApplications(): Promise<JobApplication[]> {
    return await db
      .select()
      .from(jobApplications)
      .orderBy(desc(jobApplications.createdAt));
  }

  async getJobApplication(id: number): Promise<JobApplication | undefined> {
    const [application] = await db
      .select()
      .from(jobApplications)
      .where(eq(jobApplications.id, id));
    return application || undefined;
  }

  async getJobApplicationsByJobId(jobId: number): Promise<JobApplication[]> {
    return await db
      .select()
      .from(jobApplications)
      .where(eq(jobApplications.jobPostingId, jobId))
      .orderBy(desc(jobApplications.createdAt));
  }

  async getJobApplicationsByStatus(status: string): Promise<JobApplication[]> {
    return await db
      .select()
      .from(jobApplications)
      .where(eq(jobApplications.status, status))
      .orderBy(desc(jobApplications.createdAt));
  }

  async createJobApplication(application: InsertJobApplication): Promise<JobApplication> {
    const [newApplication] = await db
      .insert(jobApplications)
      .values({ ...application, updatedAt: new Date() })
      .returning();
    return newApplication;
  }

  async updateJobApplication(id: number, updates: Partial<InsertJobApplication>): Promise<JobApplication | undefined> {
    const [updatedApplication] = await db
      .update(jobApplications)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(jobApplications.id, id))
      .returning();
    return updatedApplication || undefined;
  }

  async deleteJobApplication(id: number): Promise<boolean> {
    const result = await db.delete(jobApplications).where(eq(jobApplications.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getInterviewSchedules(): Promise<InterviewSchedule[]> {
    return await db
      .select()
      .from(interviewSchedules)
      .orderBy(desc(interviewSchedules.scheduledDate));
  }

  async getInterviewSchedule(id: number): Promise<InterviewSchedule | undefined> {
    const [schedule] = await db
      .select()
      .from(interviewSchedules)
      .where(eq(interviewSchedules.id, id));
    return schedule || undefined;
  }

  async getInterviewSchedulesByApplicationId(applicationId: number): Promise<InterviewSchedule[]> {
    return await db
      .select()
      .from(interviewSchedules)
      .where(eq(interviewSchedules.applicationId, applicationId))
      .orderBy(desc(interviewSchedules.scheduledDate));
  }

  async createInterviewSchedule(schedule: InsertInterviewSchedule): Promise<InterviewSchedule> {
    const [newSchedule] = await db
      .insert(interviewSchedules)
      .values({ ...schedule, updatedAt: new Date() })
      .returning();
    return newSchedule;
  }

  async updateInterviewSchedule(id: number, updates: Partial<InsertInterviewSchedule>): Promise<InterviewSchedule | undefined> {
    const [updatedSchedule] = await db
      .update(interviewSchedules)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(interviewSchedules.id, id))
      .returning();
    return updatedSchedule || undefined;
  }

  async deleteInterviewSchedule(id: number): Promise<boolean> {
    const result = await db.delete(interviewSchedules).where(eq(interviewSchedules.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getCareerSettings(): Promise<CareerSettings | undefined> {
    const [settings] = await db
      .select()
      .from(careerSettings)
      .limit(1);
    return settings || undefined;
  }

  async updateCareerSettings(settings: InsertCareerSettings): Promise<CareerSettings> {
    // Check if settings exist, if not create them
    const existingSettings = await this.getCareerSettings();
    
    if (existingSettings) {
      const [updatedSettings] = await db
        .update(careerSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(careerSettings.id, existingSettings.id))
        .returning();
      return updatedSettings;
    } else {
      const [newSettings] = await db
        .insert(careerSettings)
        .values({ ...settings, updatedAt: new Date() })
        .returning();
      return newSettings;
    }
  }

  // Gamification System Implementation
  async getUserPoints(userId: number): Promise<any> {
    const results = await db.select().from(userPoints).where(eq(userPoints.userId, userId));
    if (results.length > 0) {
      return results[0];
    }
    
    // Create initial user points if doesn't exist
    const [newUserPoints] = await db.insert(userPoints).values({
      userId,
      totalPoints: 0,
      currentLevel: 1,
      pointsToNextLevel: 100,
      dailyStreak: 0,
      weeklyStreak: 0,
      monthlyStreak: 0,
      lifetimeEarnings: 0,
      currentRank: "Bronze"
    }).returning();
    
    return newUserPoints;
  }

  async createUserPoints(points: any): Promise<any> {
    const [created] = await db.insert(userPoints).values(points).returning();
    return created;
  }

  async updateUserPoints(userId: number, updates: any): Promise<any> {
    const [updated] = await db.update(userPoints)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userPoints.userId, userId))
      .returning();
    return updated;
  }

  async awardPoints(userId: number, activityType: string, points: number, description: string): Promise<any> {
    // Create point activity record
    const [activity] = await db.insert(pointActivities).values({
      userId,
      activityType,
      pointsEarned: points,
      description,
      source: "platform"
    }).returning();

    // Update user points
    const userPointsData = await this.getUserPoints(userId);
    const newTotalPoints = userPointsData.totalPoints + points;
    const newLifetimeEarnings = userPointsData.lifetimeEarnings + points;
    
    // Calculate level progression
    let newLevel = userPointsData.currentLevel;
    let pointsToNextLevel = userPointsData.pointsToNextLevel - points;
    
    if (pointsToNextLevel <= 0) {
      newLevel += 1;
      pointsToNextLevel = newLevel * 150; // Next level requires more points
    }

    // Determine rank based on total points
    let newRank = "Bronze";
    if (newTotalPoints >= 10000) newRank = "Diamond";
    else if (newTotalPoints >= 5000) newRank = "Platinum";
    else if (newTotalPoints >= 2500) newRank = "Gold";
    else if (newTotalPoints >= 1000) newRank = "Silver";

    await this.updateUserPoints(userId, {
      totalPoints: newTotalPoints,
      currentLevel: newLevel,
      pointsToNextLevel,
      lifetimeEarnings: newLifetimeEarnings,
      currentRank: newRank,
      lastActivityDate: new Date()
    });

    return activity;
  }

  async getPointActivities(userId: number): Promise<any[]> {
    return db.select().from(pointActivities)
      .where(eq(pointActivities.userId, userId))
      .orderBy(desc(pointActivities.createdAt))
      .limit(50);
  }

  async createPointActivity(activity: any): Promise<any> {
    const [created] = await db.insert(pointActivities).values(activity).returning();
    return created;
  }

  // Achievements
  async getAchievements(): Promise<any[]> {
    return db.select().from(achievements).where(eq(achievements.isActive, true));
  }

  async createAchievement(achievement: any): Promise<any> {
    const [created] = await db.insert(achievements).values(achievement).returning();
    return created;
  }

  async getUserAchievements(userId: number): Promise<any[]> {
    return db.select({
      userAchievement: userAchievements,
      achievement: achievements
    })
    .from(userAchievements)
    .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
    .where(eq(userAchievements.userId, userId));
  }

  async awardAchievement(userId: number, achievementId: number): Promise<any> {
    const achievement = await db.select().from(achievements).where(eq(achievements.id, achievementId)).limit(1);
    if (achievement.length === 0) return null;

    const [userAchievement] = await db.insert(userAchievements).values({
      userId,
      achievementId,
      progress: achievement[0].requirements?.target || 1,
      maxProgress: achievement[0].requirements?.target || 1,
      isCompleted: true,
      completedAt: new Date(),
      pointsEarned: achievement[0].pointReward
    }).returning();

    // Award points for achievement
    if (achievement[0].pointReward > 0) {
      await this.awardPoints(userId, 'achievement_unlocked', achievement[0].pointReward, `Achievement: ${achievement[0].name}`);
    }

    return userAchievement;
  }

  async checkAchievementProgress(userId: number, achievementId: number): Promise<void> {
    // Implementation for checking and updating achievement progress
  }



  // Daily Challenges
  async getDailyChallenges(date: Date): Promise<any[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return db.select().from(dailyChallenges)
      .where(
        and(
          eq(dailyChallenges.isActive, true),
          gte(dailyChallenges.validDate, startOfDay),
          lte(dailyChallenges.validDate, endOfDay)
        )
      );
  }

  async createDailyChallenge(challenge: any): Promise<any> {
    const [created] = await db.insert(dailyChallenges).values(challenge).returning();
    return created;
  }

  async getUserChallenges(userId: number, date: Date): Promise<any[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return db.select({
      userChallenge: userChallenges,
      challenge: dailyChallenges
    })
    .from(userChallenges)
    .innerJoin(dailyChallenges, eq(userChallenges.challengeId, dailyChallenges.id))
    .where(
      and(
        eq(userChallenges.userId, userId),
        gte(userChallenges.challengeDate, startOfDay),
        lte(userChallenges.challengeDate, endOfDay)
      )
    );
  }

  async updateChallengeProgress(userId: number, challengeId: number, progress: number): Promise<any> {
    const challenge = await db.select().from(dailyChallenges).where(eq(dailyChallenges.id, challengeId)).limit(1);
    const targetValue = challenge[0]?.targetValue || 1;
    
    const [updated] = await db.update(userChallenges)
      .set({ 
        progress,
        isCompleted: progress >= targetValue,
        completedAt: progress >= targetValue ? new Date() : null
      })
      .where(
        and(
          eq(userChallenges.userId, userId),
          eq(userChallenges.challengeId, challengeId)
        )
      )
      .returning();
    
    return updated;
  }

  // Leaderboards
  async getLeaderboard(type: string, category: string, period: string): Promise<any[]> {
    return db.select({
      leaderboard: leaderboards,
      user: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        avatar: users.avatar
      }
    })
    .from(leaderboards)
    .innerJoin(users, eq(leaderboards.userId, users.id))
    .where(
      and(
        eq(leaderboards.leaderboardType, type),
        eq(leaderboards.category, category),
        eq(leaderboards.period, period)
      )
    )
    .orderBy(leaderboards.rank);
  }

  async updateLeaderboard(userId: number, type: string, category: string, score: number, period: string): Promise<any> {
    const existing = await db.select().from(leaderboards)
      .where(
        and(
          eq(leaderboards.userId, userId),
          eq(leaderboards.leaderboardType, type),
          eq(leaderboards.category, category),
          eq(leaderboards.period, period)
        )
      );

    if (existing.length > 0) {
      const [updated] = await db.update(leaderboards)
        .set({ score, lastUpdated: new Date() })
        .where(eq(leaderboards.id, existing[0].id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(leaderboards).values({
        userId,
        leaderboardType: type,
        category,
        score,
        rank: 1, // Will be recalculated
        period,
        lastUpdated: new Date()
      }).returning();
      return created;
    }
  }

  // Badges and Engagement
  async getUserBadges(userId: number): Promise<any[]> {
    return db.select().from(userBadges)
      .where(eq(userBadges.userId, userId))
      .orderBy(userBadges.displayOrder, desc(userBadges.earnedAt));
  }

  async awardBadge(userId: number, badge: any): Promise<any> {
    const [created] = await db.insert(userBadges).values({
      userId,
      ...badge,
      earnedAt: new Date()
    }).returning();
    
    // Award points for badge if specified
    if (badge.pointsEarned > 0) {
      await this.awardPoints(userId, 'badge_earned', badge.pointsEarned, `Badge Earned: ${badge.badgeName}`);
    }
    
    return created;
  }

  async getEngagementMetrics(userId: number, date: Date): Promise<any> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const results = await db.select().from(engagementMetrics)
      .where(
        and(
          eq(engagementMetrics.userId, userId),
          gte(engagementMetrics.metricDate, startOfDay),
          lte(engagementMetrics.metricDate, endOfDay)
        )
      );

    return results.length > 0 ? results[0] : null;
  }

  async updateEngagementMetrics(userId: number, metrics: any): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await this.getEngagementMetrics(userId, today);

    if (existing) {
      const [updated] = await db.update(engagementMetrics)
        .set(metrics)
        .where(eq(engagementMetrics.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(engagementMetrics).values({
        userId,
        metricDate: today,
        ...metrics
      }).returning();
      return created;
    }
  }

  // Payment Processing Implementation
  async getAllPaymentTransactions(): Promise<any[]> {
    return db.select().from(paymentTransactions).orderBy(paymentTransactions.createdAt);
  }

  async getPaymentTransaction(id: number): Promise<any | undefined> {
    const [transaction] = await db.select().from(paymentTransactions).where(eq(paymentTransactions.id, id));
    return transaction || undefined;
  }

  async getPaymentTransactionByStripeId(stripePaymentIntentId: string): Promise<any | undefined> {
    const [transaction] = await db.select().from(paymentTransactions)
      .where(eq(paymentTransactions.stripePaymentIntentId, stripePaymentIntentId));
    return transaction || undefined;
  }

  async createPaymentTransaction(transaction: any): Promise<any> {
    const [created] = await db.insert(paymentTransactions).values(transaction).returning();
    return created;
  }

  async updatePaymentTransaction(id: number, updates: any): Promise<any | undefined> {
    const [updated] = await db.update(paymentTransactions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(paymentTransactions.id, id))
      .returning();
    return updated || undefined;
  }

  async getPaymentAnalytics(): Promise<any> {
    const transactions = await this.getAllPaymentTransactions();
    const successfulTransactions = transactions.filter(t => t.status === 'succeeded');
    
    const totalRevenue = successfulTransactions.reduce((sum, t) => sum + t.amount, 0) / 100; // Convert from cents
    const averageOrder = successfulTransactions.length > 0 ? totalRevenue / successfulTransactions.length : 0;
    const successRate = transactions.length > 0 ? (successfulTransactions.length / transactions.length) * 100 : 0;
    
    // Get unique customers
    const uniqueCustomers = new Set(successfulTransactions.map(t => t.customerEmail));
    
    return {
      totalRevenue,
      successfulPayments: successfulTransactions.length,
      successRate: Math.round(successRate),
      activeCustomers: uniqueCustomers.size,
      averageOrder,
      revenueGrowth: 15, // Mock data for growth percentage
      customerGrowth: 8,
      orderTrend: 12
    };
  }

  async getServicePackages(): Promise<any[]> {
    return db.select().from(servicePackages).where(eq(servicePackages.isActive, true));
  }

  async getServicePackage(id: string): Promise<any | undefined> {
    const [servicePackage] = await db.select().from(servicePackages)
      .where(eq(servicePackages.id, parseInt(id)));
    return servicePackage || undefined;
  }

  async createServicePackage(servicePackage: any): Promise<any> {
    const [created] = await db.insert(servicePackages).values(servicePackage).returning();
    return created;
  }

  async updateServicePackage(id: string, updates: any): Promise<any | undefined> {
    const [updated] = await db.update(servicePackages)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(servicePackages.id, parseInt(id)))
      .returning();
    return updated || undefined;
  }
}

export const storage = new DatabaseStorage();