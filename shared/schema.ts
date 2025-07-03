import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("viewer"), // admin, manager, sales_rep, viewer
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"), // employee's direct phone number for click-to-call
  mobilePhone: text("mobile_phone"), // employee's mobile number
  extension: text("extension"), // office extension if applicable
  avatar: text("avatar"),
  workEmail: text("work_email"), // employee's @traffikboosters.com email address
  commissionRate: text("commission_rate").default("10.0"), // commission percentage as decimal string (10.0 = 10%)
  baseCommissionRate: text("base_commission_rate").default("10.0"), // base rate before bonuses
  bonusCommissionRate: text("bonus_commission_rate").default("0.0"), // additional bonus percentage
  commissionTier: text("commission_tier").default("standard"), // standard, bronze, silver, gold, platinum
  compensationType: text("compensation_type").default("commission"), // commission, salary
  baseSalary: integer("base_salary"), // annual salary in dollars for salary employees
  department: text("department").default("sales"), // sales, hr, marketing, operations
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userInvitations = pgTable("user_invitations", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  invitationToken: text("invitation_token").notNull().unique(),
  role: text("role").notNull().default("viewer"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  department: text("department").default("sales"),
  compensationType: text("compensation_type").default("commission"),
  commissionRate: text("commission_rate").default("10.0"),
  baseSalary: integer("base_salary"),
  invitedBy: integer("invited_by").references(() => users.id).notNull(),
  status: text("status").default("pending"), // pending, accepted, expired
  expiresAt: timestamp("expires_at").notNull(),
  acceptedAt: timestamp("accepted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  sessionId: text("session_id").notNull().unique(),
  loginTime: timestamp("login_time").defaultNow().notNull(),
  lastActivity: timestamp("last_activity").defaultNow().notNull(),
  logoutTime: timestamp("logout_time"),
  isActive: boolean("is_active").notNull().default(true),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  platform: text("platform"), // web, mobile, tablet
  location: text("location"), // city, state from IP
  duration: integer("duration"), // session duration in minutes
  activityCount: integer("activity_count").default(0), // number of actions taken
  pagesVisited: json("pages_visited").$type<string[]>().default([]), // array of page routes visited
  featuresUsed: json("features_used").$type<string[]>().default([]), // array of features/actions used
  leadsInteracted: json("leads_interacted").$type<number[]>().default([]), // contact IDs interacted with
  callsMade: integer("calls_made").default(0), // number of calls made during session
  emailsSent: integer("emails_sent").default(0), // number of emails sent during session
  appointmentsScheduled: integer("appointments_scheduled").default(0), // appointments booked during session
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userActivity = pgTable("user_activity", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  sessionId: text("session_id").references(() => userSessions.sessionId),
  activityType: text("activity_type").notNull(), // login, logout, page_view, contact_view, call_made, email_sent, etc.
  activityDetails: json("activity_details").$type<any>().default({}), // specific details about the activity
  targetId: integer("target_id"), // ID of contact, event, etc. being acted upon
  targetType: text("target_type"), // contact, event, campaign, etc.
  page: text("page"), // current page/route
  feature: text("feature"), // specific feature being used
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  logo: text("logo"),
  primaryColor: text("primary_color").default("#0078D4"),
  secondaryColor: text("secondary_color").default("#106EBE"),
  domain: text("domain"),
  website: text("website"),
  facebookUrl: text("facebook_url"),
  linkedinUrl: text("linkedin_url"),
  twitterUrl: text("twitter_url"),
  instagramUrl: text("instagram_url"),
  youtubeUrl: text("youtube_url"),
  tiktokUrl: text("tiktok_url"),
  timezone: text("timezone").default("America/New_York"),
  businessHoursStart: text("business_hours_start").default("09:00"),
  businessHoursEnd: text("business_hours_end").default("18:00"),
  businessDays: text("business_days").array().default(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]),
  restrictedTimeZones: text("restricted_time_zones").array().default([]),
  allowedRegions: text("allowed_regions").array().default(["US", "CA"]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  website: text("website"),
  company: text("company"),
  position: text("position"),
  avatar: text("avatar"),
  tags: text("tags").array(),
  notes: text("notes"),
  leadStatus: text("lead_status").default("new"), // new, contacted, qualified, proposal, negotiation, closed_won, closed_lost, sold
  leadSource: text("lead_source"), // yelp, google_maps, google_ads, facebook, instagram, tiktok, linkedin, youtube, twitter, website, referral, cold_call, email, event, chat_widget
  isDemo: boolean("is_demo").default(false), // true for demo/sample data, false for real customer inquiries
  disposition: text("disposition"), // interested, not_interested, callback, do_not_call, wrong_number, busy
  priority: text("priority").default("medium"), // low, medium, high, urgent
  budget: integer("budget"), // in cents
  timeline: text("timeline"), // immediate, 1_month, 3_months, 6_months, 1_year, unknown
  assignedTo: integer("assigned_to").references(() => users.id), // sales rep assigned to this lead
  assignedBy: integer("assigned_by").references(() => users.id), // manager who assigned the lead
  assignedAt: timestamp("assigned_at"),
  pipelineStage: text("pipeline_stage").default("prospect"), // prospect, qualified, demo, proposal, negotiation, closed_won, closed_lost
  dealValue: integer("deal_value"), // expected deal value in cents
  lastContactedAt: timestamp("last_contacted_at"),
  nextFollowUpAt: timestamp("next_follow_up_at"),
  // AI Lead Scoring fields
  aiScore: integer("ai_score").default(0), // AI-calculated score 0-100
  scoreFactors: json("score_factors"), // detailed scoring breakdown
  industryScore: integer("industry_score").default(0), // industry-specific scoring
  companySize: text("company_size"), // startup, small, medium, large, enterprise
  urgencyLevel: text("urgency_level").default("low"), // low, medium, high, critical
  engagementScore: integer("engagement_score").default(0), // based on interactions
  qualificationScore: integer("qualification_score").default(0), // BANT qualification score
  lastScoreUpdate: timestamp("last_score_update"),
  // Service Interest fields
  servicesInterested: text("services_interested").array(), // array of services prospect is interested in
  primaryServiceNeed: text("primary_service_need"), // main service they're seeking
  serviceDescription: text("service_description"), // detailed description of their service needs
  currentProvider: text("current_provider"), // who they currently use for services
  serviceUrgency: text("service_urgency").default("medium"), // low, medium, high, urgent
  serviceBudget: integer("service_budget"), // budget specifically for services in cents
  serviceTimeline: text("service_timeline"), // when they need service delivered
  importedAt: timestamp("imported_at").defaultNow().notNull(), // exact time when lead was imported into Starz
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: integer("created_by").references(() => users.id),
  updatedBy: integer("updated_by").references(() => users.id),
});

export const userOnboarding = pgTable("user_onboarding", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  isCompleted: boolean("is_completed").default(false).notNull(),
  currentStep: integer("current_step").default(0).notNull(),
  completedSteps: text("completed_steps").array().default([]).notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  skipped: boolean("skipped").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const contactNotes = pgTable("contact_notes", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").references(() => contacts.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // call, meeting, email, text, other
  subject: text("subject"),
  content: text("content").notNull(),
  disposition: text("disposition"), // outcome of this interaction
  nextAction: text("next_action"), // what to do next
  followUpDate: timestamp("follow_up_date"),
  duration: integer("duration"), // in minutes for calls/meetings
  isPrivate: boolean("is_private").default(false),
  attachments: text("attachments").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const leadIntakes = pgTable("lead_intakes", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").references(() => contacts.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  qualification: text("qualification").notNull(), // qualified, unqualified, needs_nurturing
  budget: integer("budget"), // in cents
  authority: text("authority"), // decision_maker, influencer, end_user, unknown
  need: text("need").notNull(), // urgency and specific needs
  timeline: text("timeline"), // when they need solution
  currentSolution: text("current_solution"),
  competitors: text("competitors").array(),
  objections: text("objections").array(),
  interests: text("interests").array(),
  painPoints: text("pain_points").array(),
  score: integer("score"), // lead score 1-100
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  type: text("type").notNull().default("meeting"), // meeting, call, task, reminder
  status: text("status").notNull().default("scheduled"), // scheduled, in_progress, completed, cancelled
  isVideoCall: boolean("is_video_call").default(false),
  videoCallLink: text("video_call_link"),
  attendees: text("attendees").array(),
  attachments: text("attachments").array(),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  originalName: text("original_name").notNull(),
  type: text("type").notNull(),
  size: integer("size").notNull(),
  path: text("path").notNull(),
  folder: text("folder").default("root"),
  tags: text("tags").array(),
  uploadedBy: integer("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const automations = pgTable("automations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  trigger: json("trigger"), // webhook, schedule, file_upload, etc.
  actions: json("actions"), // send_email, create_task, update_contact, etc.
  isActive: boolean("is_active").default(true),
  lastRun: timestamp("last_run"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const scrapingJobs = pgTable("scraping_jobs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  selectors: json("selectors"), // CSS selectors for data extraction
  schedule: text("schedule"), // cron expression
  status: text("status").default("pending"), // pending, running, completed, failed
  lastRun: timestamp("last_run"),
  results: json("results"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const extractionHistory = pgTable("extraction_history", {
  id: serial("id").primaryKey(),
  platform: text("platform").notNull(), // google_maps, bark_com, yelp, etc.
  industry: text("industry"),
  location: text("location"),
  searchTerms: text("search_terms").array(),
  leadsExtracted: integer("leads_extracted").default(0),
  contactsCreated: integer("contacts_created").default(0),
  totalResults: integer("total_results").default(0),
  apiKeyStatus: text("api_key_status"), // valid, invalid, missing
  success: boolean("success").default(false),
  errorMessage: text("error_message"),
  extractionConfig: json("extraction_config"), // Store full config used
  extractedBy: integer("extracted_by").references(() => users.id),
  extractionTime: timestamp("extraction_time").defaultNow().notNull(),
  processingDuration: integer("processing_duration"), // in milliseconds
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").references(() => contacts.id),
  senderId: integer("sender_id").references(() => users.id),
  message: text("message").notNull(),
  type: text("type").default("text"), // text, image, file, system
  isFromContact: boolean("is_from_contact").default(false),
  attachments: text("attachments").array(),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const chatConversations = pgTable("chat_conversations", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").references(() => contacts.id).notNull(),
  assignedTo: integer("assigned_to").references(() => users.id),
  status: text("status").default("active"), // active, closed, pending
  priority: text("priority").default("normal"), // low, normal, high, urgent
  lastMessageAt: timestamp("last_message_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  action: text("action").notNull(), // create, update, delete, view, call, email, note
  entityType: text("entity_type").notNull(), // contact, note, lead_intake, campaign, call_log, etc.
  entityId: integer("entity_id").notNull(),
  oldValues: json("old_values"),
  newValues: json("new_values"),
  description: text("description"), // human-readable description of the action
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  employeeId: text("employee_id").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  department: text("department").notNull(),
  position: text("position").notNull(),
  manager: integer("manager"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  employment_type: text("employment_type").notNull(), // full-time, part-time, contract
  salary: integer("salary"), // annual salary in cents
  status: text("status").default("active"), // active, inactive, terminated
  address: text("address"),
  emergencyContact: text("emergency_contact"),
  emergencyPhone: text("emergency_phone"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas for HR module
export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Pricing and Profitability Tables
export const servicePackages = pgTable("service_packages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // 'digital_marketing', 'seo', 'ppc', 'web_design', 'social_media', 'consulting'
  basePrice: text("base_price").notNull(),
  setupFee: text("setup_fee").default('0.00'),
  monthlyRecurring: text("monthly_recurring").default('0.00'),
  deliveryTimeframe: text("delivery_timeframe").notNull(), // '1-2 weeks', '30 days', 'ongoing'
  features: text("features").array().notNull(), // array of feature descriptions
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const costStructure = pgTable("cost_structure", {
  id: serial("id").primaryKey(),
  servicePackageId: integer("service_package_id").notNull(),
  costType: text("cost_type").notNull(), // 'labor', 'tools', 'advertising', 'overhead', 'third_party'
  costName: text("cost_name").notNull(),
  fixedCost: text("fixed_cost").default('0.00'),
  variableCostPercentage: text("variable_cost_percentage").default('0.00'),
  monthlyRecurringCost: text("monthly_recurring_cost").default('0.00'),
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const profitabilityAnalysis = pgTable("profitability_analysis", {
  id: serial("id").primaryKey(),
  servicePackageId: integer("service_package_id").notNull(),
  clientSize: text("client_size").notNull(), // 'small_business', 'medium_business', 'enterprise'
  industry: text("industry"),
  averageContractValue: text("average_contract_value").notNull(),
  totalCosts: text("total_costs").notNull(),
  grossProfit: text("gross_profit").notNull(),
  profitMargin: text("profit_margin").notNull(),
  closingProbability: text("closing_probability").notNull(), // 0-100%
  expectedValue: text("expected_value").notNull(),
  timeToClose: integer("time_to_close"), // days
  customerLifetimeValue: text("customer_lifetime_value"),
  churnRate: text("churn_rate"), // monthly churn %
  analysisDate: timestamp("analysis_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const pricingProposals = pgTable("pricing_proposals", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").notNull(),
  servicePackageId: integer("service_package_id").notNull(),
  customPrice: text("custom_price"),
  discount: text("discount").default('0.00'),
  finalPrice: text("final_price").notNull(),
  proposalStatus: text("proposal_status").notNull().default('draft'), // 'draft', 'sent', 'viewed', 'accepted', 'rejected', 'negotiating'
  validUntil: timestamp("valid_until"),
  customTerms: text("custom_terms"),
  notes: text("notes"),
  sentAt: timestamp("sent_at"),
  acceptedAt: timestamp("accepted_at"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Insert schemas for pricing
export const insertServicePackageSchema = createInsertSchema(servicePackages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCostStructureSchema = createInsertSchema(costStructure).omit({
  id: true,
  createdAt: true,
});

export const insertProfitabilityAnalysisSchema = createInsertSchema(profitabilityAnalysis).omit({
  id: true,
  createdAt: true,
});

export const insertPricingProposalSchema = createInsertSchema(pricingProposals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Lead Enrichment with Social Media Insights
export const leadEnrichment = pgTable("lead_enrichment", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").references(() => contacts.id).notNull(),
  // Social Media Profiles
  linkedinUrl: text("linkedin_url"),
  linkedinFollowers: integer("linkedin_followers"),
  linkedinConnections: integer("linkedin_connections"),
  linkedinJobTitle: text("linkedin_job_title"),
  linkedinCompany: text("linkedin_company"),
  linkedinBio: text("linkedin_bio"),
  linkedinLocation: text("linkedin_location"),
  linkedinIndustry: text("linkedin_industry"),
  
  facebookUrl: text("facebook_url"),
  facebookLikes: integer("facebook_likes"),
  facebookFollowers: integer("facebook_followers"),
  facebookCheckins: integer("facebook_checkins"),
  facebookRating: text("facebook_rating"),
  
  twitterUrl: text("twitter_url"),
  twitterHandle: text("twitter_handle"),
  twitterFollowers: integer("twitter_followers"),
  twitterFollowing: integer("twitter_following"),
  twitterTweets: integer("twitter_tweets"),
  twitterVerified: boolean("twitter_verified").default(false),
  
  instagramUrl: text("instagram_url"),
  instagramFollowers: integer("instagram_followers"),
  instagramFollowing: integer("instagram_following"),
  instagramPosts: integer("instagram_posts"),
  instagramEngagementRate: text("instagram_engagement_rate"),
  
  youtubeUrl: text("youtube_url"),
  youtubeSubscribers: integer("youtube_subscribers"),
  youtubeViews: integer("youtube_views"),
  youtubeVideos: integer("youtube_videos"),
  
  tiktokUrl: text("tiktok_url"),
  tiktokFollowers: integer("tiktok_followers"),
  tiktokLikes: integer("tiktok_likes"),
  tiktokVideos: integer("tiktok_videos"),
  
  // Company Information
  companyWebsite: text("company_website"),
  companySize: text("company_size"), // 1-10, 11-50, 51-200, 201-500, 501-1000, 1000+
  companyRevenue: text("company_revenue"), // estimated annual revenue
  companyIndustry: text("company_industry"),
  companyFounded: text("company_founded"),
  companyLocation: text("company_location"),
  companyDescription: text("company_description"),
  
  // Professional Information
  jobTitle: text("job_title"),
  seniority: text("seniority"), // entry, mid, senior, director, vp, c_level
  department: text("department"), // marketing, sales, it, operations, hr, finance
  yearsExperience: integer("years_experience"),
  previousCompanies: text("previous_companies").array(),
  skills: text("skills").array(),
  certifications: text("certifications").array(),
  
  // Engagement & Activity
  recentActivity: json("recent_activity"), // array of recent social media posts/activity
  engagementScore: integer("engagement_score").default(0), // 0-100 based on social media activity
  influencerScore: integer("influencer_score").default(0), // 0-100 based on follower count and engagement
  socialMediaActivity: text("social_media_activity").default("low"), // low, medium, high, very_high
  lastActivityDate: timestamp("last_activity_date"),
  
  // Technology Stack
  technologies: text("technologies").array(), // software/tools they use
  techStack: json("tech_stack"), // detailed technology information
  
  // Contact Preferences
  preferredContactMethod: text("preferred_contact_method"), // email, phone, linkedin, social
  bestContactTime: text("best_contact_time"), // morning, afternoon, evening
  timezone: text("timezone"),
  
  // Enrichment Metadata
  enrichmentStatus: text("enrichment_status").default("pending"), // pending, completed, failed, partial
  dataSource: text("data_source"), // linkedin, apollo, clearbit, hunter, manual
  confidence: integer("confidence").default(0), // 0-100 confidence in data accuracy
  lastEnriched: timestamp("last_enriched").defaultNow().notNull(),
  enrichedBy: integer("enriched_by").references(() => users.id),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const enrichmentHistory = pgTable("enrichment_history", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").references(() => contacts.id).notNull(),
  enrichmentType: text("enrichment_type").notNull(), // social_media, company_info, professional_info
  dataProvider: text("data_provider"), // linkedin, apollo, clearbit, hunter
  fieldsUpdated: text("fields_updated").array(),
  oldData: json("old_data"),
  newData: json("new_data"),
  confidence: integer("confidence"),
  processingTime: integer("processing_time"), // milliseconds
  success: boolean("success").default(true),
  errorMessage: text("error_message"),
  enrichedBy: integer("enriched_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas for lead enrichment
export const insertLeadEnrichmentSchema = createInsertSchema(leadEnrichment).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEnrichmentHistorySchema = createInsertSchema(enrichmentHistory).omit({
  id: true,
  createdAt: true,
});

export type LeadEnrichment = typeof leadEnrichment.$inferSelect;
export type InsertLeadEnrichment = z.infer<typeof insertLeadEnrichmentSchema>;
export type EnrichmentHistory = typeof enrichmentHistory.$inferSelect;
export type InsertEnrichmentHistory = z.infer<typeof insertEnrichmentHistorySchema>;

// Insert schema for user onboarding
export const insertUserOnboardingSchema = createInsertSchema(userOnboarding).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type UserOnboarding = typeof userOnboarding.$inferSelect;
export type InsertUserOnboarding = z.infer<typeof insertUserOnboardingSchema>;

// Types for HR module
export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;

// Types for pricing
export type ServicePackage = typeof servicePackages.$inferSelect;
export type InsertServicePackage = z.infer<typeof insertServicePackageSchema>;
export type CostStructure = typeof costStructure.$inferSelect;
export type InsertCostStructure = z.infer<typeof insertCostStructureSchema>;
export type ProfitabilityAnalysis = typeof profitabilityAnalysis.$inferSelect;
export type InsertProfitabilityAnalysis = z.infer<typeof insertProfitabilityAnalysisSchema>;
export type PricingProposal = typeof pricingProposals.$inferSelect;
export type InsertPricingProposal = z.infer<typeof insertPricingProposalSchema>;

// Technical Projects for SEO & Web Development
export const technicalProjects = pgTable("technical_projects", {
  id: serial("id").primaryKey(),
  clientName: text("client_name").notNull(),
  projectTitle: text("project_title").notNull(),
  projectType: text("project_type").notNull(), // SEO, Web Development, Both
  status: text("status").notNull().default("Not Started"), // Not Started, In Progress, Review, Completed
  priority: text("priority").notNull().default("Medium"), // Low, Medium, High, Urgent
  assignedTo: integer("assigned_to").references(() => users.id).notNull(),
  description: text("description"),
  budget: integer("budget"), // project budget in dollars
  estimatedHours: integer("estimated_hours"),
  actualHours: integer("actual_hours").default(0),
  startDate: timestamp("start_date"),
  dueDate: timestamp("due_date"),
  completedDate: timestamp("completed_date"),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Technical Tasks within projects
export const technicalTasks = pgTable("technical_tasks", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => technicalProjects.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // SEO, Development, Design, Content, Analysis
  status: text("status").notNull().default("Pending"), // Pending, In Progress, Completed, Blocked
  priority: text("priority").notNull().default("Medium"), // Low, Medium, High, Urgent
  assignedTo: integer("assigned_to").references(() => users.id).notNull(),
  estimatedHours: integer("estimated_hours"),
  actualHours: integer("actual_hours").default(0),
  hourlyRate: integer("hourly_rate"), // rate in dollars
  startDate: timestamp("start_date"),
  dueDate: timestamp("due_date"),
  completedDate: timestamp("completed_date"),
  notes: text("notes"),
  tags: json("tags"), // array of tag strings
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Time tracking entries for tasks
export const timeEntries = pgTable("time_entries", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => technicalTasks.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  date: timestamp("date").notNull(),
  hours: integer("hours").notNull(), // hours worked (in minutes for precision)
  description: text("description"),
  billable: boolean("billable").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas for technical projects
export const insertTechnicalProjectSchema = createInsertSchema(technicalProjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTechnicalTaskSchema = createInsertSchema(technicalTasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTimeEntrySchema = createInsertSchema(timeEntries).omit({
  id: true,
  createdAt: true,
});

// Types for technical projects
export type TechnicalProject = typeof technicalProjects.$inferSelect;
export type InsertTechnicalProject = z.infer<typeof insertTechnicalProjectSchema>;
export type TechnicalTask = typeof technicalTasks.$inferSelect;
export type InsertTechnicalTask = z.infer<typeof insertTechnicalTaskSchema>;
export type TimeEntry = typeof timeEntries.$inferSelect;
export type InsertTimeEntry = z.infer<typeof insertTimeEntrySchema>;

export const callLogs = pgTable("call_logs", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").references(() => contacts.id),
  userId: integer("user_id").references(() => users.id).notNull(),
  direction: text("direction").notNull(), // inbound, outbound
  status: text("status").notNull(), // ringing, answered, missed, voicemail, busy, failed
  phoneNumber: text("phone_number").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // in seconds
  talkTime: integer("talk_time"), // actual talk time in seconds
  recording: text("recording"), // URL to call recording
  notes: text("notes"),
  outcome: text("outcome"), // connected, no_answer, busy, voicemail, sale, follow_up
  followUpDate: timestamp("follow_up_date"),
  dialTimestamp: timestamp("dial_timestamp").notNull(), // Exact moment dial was initiated
  callHour: integer("call_hour").notNull(), // Hour of day (0-23)
  callDate: text("call_date").notNull(), // Date of call for daily tracking (YYYY-MM-DD)
  dialResult: text("dial_result").notNull(), // connected, no_answer, busy, voicemail, failed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Daily dial tracking for KPI metrics
export const dailyDialStats = pgTable("daily_dial_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  dialDate: text("dial_date").notNull(),
  hour: integer("hour").notNull(), // Hour of day (0-23)
  totalDials: integer("total_dials").default(0).notNull(),
  connectedCalls: integer("connected_calls").default(0).notNull(),
  voicemails: integer("voicemails").default(0).notNull(),
  noAnswers: integer("no_answers").default(0).notNull(),
  busySignals: integer("busy_signals").default(0).notNull(),
  failedDials: integer("failed_dials").default(0).notNull(),
  totalTalkTime: integer("total_talk_time").default(0).notNull(), // in seconds
  connectRate: integer("connect_rate").default(0).notNull(), // percentage (0-100)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // email, sms, social, direct_mail, phone
  status: text("status").default("draft"), // draft, active, paused, completed, cancelled
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  targetAudience: text("target_audience"),
  budget: integer("budget"), // in cents
  spent: integer("spent").default(0), // in cents
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  conversions: integer("conversions").default(0),
  leads: integer("leads").default(0),
  tags: text("tags").array(),
  createdBy: integer("created_by").references(() => users.id),
  assignedTo: integer("assigned_to").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Voice tone analysis for sales calls
export const callRecordings = pgTable("call_recordings", {
  id: serial("id").primaryKey(),
  callLogId: integer("call_log_id").references(() => callLogs.id),
  salesRepId: integer("sales_rep_id").references(() => users.id).notNull(),
  contactId: integer("contact_id").references(() => contacts.id),
  customerName: text("customer_name").notNull(),
  industry: text("industry").notNull(), // industry category for targeted analysis
  callType: text("call_type").notNull(), // discovery, demo, closing, follow-up, objection, consultation
  callDuration: integer("call_duration").notNull(), // in minutes
  callDate: timestamp("call_date").notNull(),
  callOutcome: text("call_outcome").notNull(), // appointment_set, follow_up_scheduled, not_interested, callback_requested, deal_closed, objection_received
  recordingUrl: text("recording_url"), // URL to call recording file
  fileSize: integer("file_size"), // file size in bytes
  transcript: text("transcript"), // Full call transcript
  transcriptionStatus: text("transcription_status").default("pending"), // pending, completed, failed
  analysisStatus: text("analysis_status").default("pending"), // pending, completed, failed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const voiceToneAnalysis = pgTable("voice_tone_analysis", {
  id: serial("id").primaryKey(),
  callRecordingId: integer("call_recording_id").references(() => callRecordings.id).notNull(),
  salesRepId: integer("sales_rep_id").references(() => users.id).notNull(),
  overallTone: text("overall_tone").notNull(), // professional, friendly, aggressive, passive, confident, uncertain
  sentimentScore: text("sentiment_score").notNull(), // -1 to 1 scale as text
  communicationStyle: text("communication_style").notNull(), // consultative, direct, relationship-building, solution-focused, pressure-based
  emotionalIntelligence: integer("emotional_intelligence").notNull(), // 0-100 scale
  speakingPace: text("speaking_pace").notNull(), // too_fast, optimal, too_slow
  wordCount: integer("word_count").notNull(),
  fillerWords: integer("filler_words").notNull(),
  interruptionCount: integer("interruption_count").notNull(),
  // Voice tone metrics (0-100 scale)
  confidenceScore: integer("confidence_score").notNull(),
  enthusiasmScore: integer("enthusiasm_score").notNull(),
  professionalismScore: integer("professionalism_score").notNull(),
  empathyScore: integer("empathy_score").notNull(),
  urgencyScore: integer("urgency_score").notNull(),
  clarityScore: integer("clarity_score").notNull(),
  persuasivenessScore: integer("persuasiveness_score").notNull(),
  friendlinessScore: integer("friendliness_score").notNull(),
  // Analysis metadata
  analysisTimestamp: timestamp("analysis_timestamp").defaultNow().notNull(),
  processingTime: integer("processing_time"), // in seconds
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const callInsights = pgTable("call_insights", {
  id: serial("id").primaryKey(),
  voiceToneAnalysisId: integer("voice_tone_analysis_id").references(() => voiceToneAnalysis.id).notNull(),
  salesRepId: integer("sales_rep_id").references(() => users.id).notNull(),
  performanceScore: integer("performance_score").notNull(), // 0-100 overall performance score
  improvementAreas: text("improvement_areas").array().notNull(), // array of improvement suggestions
  strengths: text("strengths").array().notNull(), // array of identified strengths
  nextCallStrategy: text("next_call_strategy").array().notNull(), // strategic recommendations
  coachingTips: text("coaching_tips").array().notNull(), // actionable coaching advice
  recommendations: text("recommendations").array().notNull(), // general recommendations
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const keyCallMoments = pgTable("key_call_moments", {
  id: serial("id").primaryKey(),
  voiceToneAnalysisId: integer("voice_tone_analysis_id").references(() => voiceToneAnalysis.id).notNull(),
  timestamp: text("timestamp").notNull(), // MM:SS format
  moment: text("moment").notNull(), // description of key moment
  impact: text("impact").notNull(), // positive, negative, neutral
  suggestion: text("suggestion"), // optional improvement suggestion
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const callParticipants = pgTable("call_participants", {
  id: serial("id").primaryKey(),
  callRecordingId: integer("call_recording_id").references(() => callRecordings.id).notNull(),
  role: text("role").notNull(), // sales_rep, prospect, customer
  name: text("name").notNull(),
  speakingTime: integer("speaking_time").notNull(), // in seconds
  wordCount: integer("word_count").notNull(),
  dominanceRatio: text("dominance_ratio").notNull(), // percentage of conversation as text
  engagementLevel: integer("engagement_level"), // 0-100 for prospects/customers
  objectionCount: integer("objection_count").default(0),
  positiveResponses: integer("positive_responses").default(0),
  questionsAsked: integer("questions_asked").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const voiceTrendAnalysis = pgTable("voice_trend_analysis", {
  id: serial("id").primaryKey(),
  salesRepId: integer("sales_rep_id").references(() => users.id).notNull(),
  timeframe: text("timeframe").notNull(), // week, month, quarter
  analysisDate: timestamp("analysis_date").notNull(),
  totalCallsAnalyzed: integer("total_calls_analyzed").notNull(),
  // Trend indicators
  confidenceTrend: text("confidence_trend").notNull(), // improving, declining, stable
  persuasivenessTrend: text("persuasiveness_trend").notNull(),
  empathyTrend: text("empathy_trend").notNull(),
  overallPerformanceTrend: text("overall_performance_trend").notNull(),
  // Average metrics
  avgConfidence: integer("avg_confidence").notNull(),
  avgEnthusiasm: integer("avg_enthusiasm").notNull(),
  avgProfessionalism: integer("avg_professionalism").notNull(),
  avgEmpathy: integer("avg_empathy").notNull(),
  avgPersuasiveness: integer("avg_persuasiveness").notNull(),
  avgClarity: integer("avg_clarity").notNull(),
  avgFriendliness: integer("avg_friendliness").notNull(),
  // Performance insights
  consistencyScore: integer("consistency_score").notNull(), // 0-100
  topStrengths: text("top_strengths").array().notNull(),
  persistentWeaknesses: text("persistent_weaknesses").array().notNull(),
  developmentPlan: text("development_plan").array().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const leadAllocations = pgTable("lead_allocations", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").references(() => contacts.id).notNull(),
  assignedTo: integer("assigned_to").references(() => users.id).notNull(),
  assignedBy: integer("assigned_by").references(() => users.id).notNull(),
  campaignId: integer("campaign_id").references(() => campaigns.id),
  priority: text("priority").default("medium"), // low, medium, high, urgent
  status: text("status").default("assigned"), // assigned, contacted, qualified, converted, rejected
  notes: text("notes"),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
});



export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").references(() => contacts.id).notNull(),
  amount: integer("amount").notNull(), // in cents
  currency: text("currency").default("usd"),
  status: text("status").default("pending"), // pending, paid, overdue, cancelled
  description: text("description").notNull(),
  dueDate: timestamp("due_date").notNull(),
  paidAt: timestamp("paid_at"),
  stripeInvoiceId: text("stripe_invoice_id"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").references(() => contacts.id).notNull(),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  stripeCustomerId: text("stripe_customer_id"),
  planName: text("plan_name").notNull(),
  amount: integer("amount").notNull(), // in cents
  currency: text("currency").default("usd"),
  interval: text("interval").notNull(), // monthly, quarterly, yearly
  status: text("status").default("active"), // active, cancelled, past_due, incomplete
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  trialEnd: timestamp("trial_end"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const paymentMethods = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").references(() => contacts.id).notNull(),
  stripePaymentMethodId: text("stripe_payment_method_id").unique(),
  type: text("type").notNull(), // card, bank_account, etc
  brand: text("brand"), // visa, mastercard, etc
  last4: text("last4"),
  expMonth: integer("exp_month"),
  expYear: integer("exp_year"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Emoji-based mood tracking for sales performance
export const moodEntries = pgTable("mood_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  moodEmoji: text("mood_emoji").notNull(), // 😊, 😐, 😟, 😎, 💪, 🔥, 😴, 😤
  moodLabel: text("mood_label").notNull(), // "Great", "Good", "Okay", "Stressed", "Motivated", etc.
  moodScore: integer("mood_score").notNull(), // 1-10 numeric scale
  energyLevel: integer("energy_level").notNull(), // 1-10 scale
  motivationLevel: integer("motivation_level").notNull(), // 1-10 scale
  stressLevel: integer("stress_level").notNull(), // 1-10 scale
  confidenceLevel: integer("confidence_level").notNull(), // 1-10 scale
  notes: text("notes"), // optional mood notes/context
  tags: text("tags").array(), // ["morning_slump", "post_sale_high", "rejection_blues", etc.]
  entryDate: timestamp("entry_date").defaultNow().notNull(),
  shift: text("shift").notNull(), // "morning", "afternoon", "evening"
  entryType: text("entry_type").notNull().default("daily"), // "daily", "pre_call", "post_call", "weekly"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const teamMoodSummaries = pgTable("team_mood_summaries", {
  id: serial("id").primaryKey(),
  summaryDate: timestamp("summary_date").notNull(),
  averageMoodScore: text("average_mood_score").notNull(), // decimal as text
  averageEnergyLevel: text("average_energy_level").notNull(), // decimal as text
  averageMotivationLevel: text("average_motivation_level").notNull(), // decimal as text
  averageStressLevel: text("average_stress_level").notNull(), // decimal as text
  averageConfidenceLevel: text("average_confidence_level").notNull(), // decimal as text
  topMoodEmoji: text("top_mood_emoji").notNull(), // most frequent emoji
  totalEntries: integer("total_entries").notNull(),
  activeUsers: integer("active_users").notNull(),
  moodDistribution: json("mood_distribution"), // {emoji: count} pairs
  trendDirection: text("trend_direction"), // "improving", "declining", "stable"
  alertLevel: text("alert_level").default("normal"), // "normal", "attention", "concern"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const moodPerformanceCorrelations = pgTable("mood_performance_correlations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  moodEntryId: integer("mood_entry_id").references(() => moodEntries.id).notNull(),
  callsAttempted: integer("calls_attempted").default(0),
  callsConnected: integer("calls_connected").default(0),
  appointmentsSet: integer("appointments_set").default(0),
  salesMade: integer("sales_made").default(0),
  revenueGenerated: integer("revenue_generated").default(0), // in cents
  callConnectRate: text("call_connect_rate"), // percentage as text
  appointmentRate: text("appointment_rate"), // percentage as text
  salesClosingRate: text("sales_closing_rate"), // percentage as text
  performanceScore: integer("performance_score"), // 1-100 calculated score
  correlationDate: timestamp("correlation_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Employee Time Clock Tables
export const timeClockEntries = pgTable("time_clock_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  clockInTime: timestamp("clock_in_time").notNull(),
  clockOutTime: timestamp("clock_out_time"),
  breakStartTime: timestamp("break_start_time"),
  breakEndTime: timestamp("break_end_time"),
  totalHours: text("total_hours"), // calculated hours as decimal string
  totalBreakMinutes: integer("total_break_minutes").default(0),
  shiftType: text("shift_type").notNull().default("regular"), // regular, overtime, holiday
  department: text("department").notNull(),
  location: text("location").default("office"), // office, remote, field
  ipAddress: text("ip_address"), // for security tracking
  clockInDevice: text("clock_in_device"), // web, mobile, kiosk
  clockOutDevice: text("clock_out_device"),
  notes: text("notes"), // employee notes about the shift
  managerNotes: text("manager_notes"), // supervisor notes
  status: text("status").default("active"), // active, completed, pending_approval
  isApproved: boolean("is_approved").default(false),
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const timeClockSchedules = pgTable("time_clock_schedules", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0=Sunday, 1=Monday, etc.
  startTime: text("start_time").notNull(), // "09:00"
  endTime: text("end_time").notNull(), // "17:00"
  isWorkDay: boolean("is_work_day").default(true),
  department: text("department").notNull(),
  shiftName: text("shift_name"), // "Morning Shift", "Evening Shift", etc.
  expectedHours: text("expected_hours").notNull(), // "8.0"
  breakDuration: integer("break_duration").default(30), // minutes
  isActive: boolean("is_active").default(true),
  effectiveDate: timestamp("effective_date").notNull(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const timeOffRequests = pgTable("time_off_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  requestType: text("request_type").notNull(), // vacation, sick, personal, bereavement
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  totalDays: text("total_days").notNull(), // decimal as string
  reason: text("reason"),
  status: text("status").default("pending"), // pending, approved, denied, cancelled
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
  isEmergency: boolean("is_emergency").default(false),
  attachments: text("attachments").array(), // file URLs
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workOrders = pgTable("work_orders", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  contactId: integer("contact_id").references(() => contacts.id),
  contactName: text("contact_name").notNull(),
  status: text("status").notNull().default("draft"), // draft, sent, signed, completed, cancelled
  amount: integer("amount").notNull(),
  terms: text("terms"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: integer("created_by").references(() => users.id),
  sentAt: timestamp("sent_at"),
  signedAt: timestamp("signed_at"),
  signatureUrl: text("signature_url"),
  documentUrl: text("document_url"),
  dueDate: timestamp("due_date"),
  approveRequestId: text("approve_request_id"),
});

export const marketingStrategies = pgTable("marketing_strategies", {
  id: serial("id").primaryKey(),
  strategyName: text("strategy_name").notNull(),
  targetAudience: text("target_audience").notNull(),
  budget: integer("budget").notNull(), // monthly budget in dollars
  duration: text("duration").notNull(), // campaign duration in days
  channels: text("channels").array().notNull(), // marketing channels used
  objectives: text("objectives").array().notNull(), // campaign objectives
  expectedROI: integer("expected_roi").notNull(), // expected ROI percentage
  costPerLead: text("cost_per_lead").notNull(), // cost per lead as decimal string
  estimatedLeads: integer("estimated_leads").notNull(), // expected number of leads
  status: text("status").notNull().default("draft"), // draft, active, completed, paused
  actualROI: integer("actual_roi"), // actual ROI achieved
  actualLeads: integer("actual_leads"), // actual leads generated
  actualCostPerLead: text("actual_cost_per_lead"), // actual cost per lead
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: integer("created_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const documentTemplates = pgTable("document_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  content: text("content").notNull(),
  variables: text("variables").array(),
  category: text("category").notNull().default("work_order"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: integer("created_by").references(() => users.id),
  isPublic: boolean("is_public").default(false),
  companyId: integer("company_id").references(() => companies.id),
});

export const signingRequests = pgTable("signing_requests", {
  id: serial("id").primaryKey(),
  documentTitle: text("document_title").notNull(),
  templateId: integer("template_id").references(() => documentTemplates.id),
  recipientName: text("recipient_name").notNull(),
  recipientEmail: text("recipient_email").notNull(),
  senderEmail: text("sender_email").notNull(),
  customMessage: text("custom_message"),
  status: text("status", { 
    enum: ["draft", "sent", "viewed", "signed", "completed", "expired", "cancelled"] 
  }).default("draft"),
  priority: text("priority", { enum: ["low", "medium", "high", "urgent"] }).default("medium"),
  approveOmeId: text("approveme_id"),
  signingUrl: text("signing_url"),
  documentUrl: text("document_url"),
  sentAt: timestamp("sent_at"),
  viewedAt: timestamp("viewed_at"),
  signedAt: timestamp("signed_at"),
  completedAt: timestamp("completed_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
  contactId: integer("contact_id").references(() => contacts.id),
});

export const insertDocumentTemplateSchema = createInsertSchema(documentTemplates).omit({
  id: true,
  createdAt: true,
});

export const insertSigningRequestSchema = createInsertSchema(signingRequests).omit({
  id: true,
  createdAt: true,
  sentAt: true,
  viewedAt: true,
  signedAt: true,
  completedAt: true,
  approveOmeId: true,
  signingUrl: true,
  documentUrl: true,
});

export const insertContactNoteSchema = createInsertSchema(contactNotes).omit({
  id: true,
  createdAt: true,
});

export const insertLeadIntakeSchema = createInsertSchema(leadIntakes).omit({
  id: true,
  createdAt: true,
});

export const insertCallLogSchema = createInsertSchema(callLogs).omit({
  id: true,
  createdAt: true,
});

export const insertDailyDialStatsSchema = createInsertSchema(dailyDialStats).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  createdAt: true,
  createdBy: true,
  spent: true,
  impressions: true,
  clicks: true,
  conversions: true,
  leads: true,
});

export const insertLeadAllocationSchema = createInsertSchema(leadAllocations).omit({
  id: true,
  assignedAt: true,
  completedAt: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  paidAt: true,
  stripeInvoiceId: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  stripeSubscriptionId: true,
  stripeCustomerId: true,
  currentPeriodStart: true,
  currentPeriodEnd: true,
});

export const insertPaymentMethodSchema = createInsertSchema(paymentMethods).omit({
  id: true,
  createdAt: true,
  stripePaymentMethodId: true,
});

// Voice tone analysis insert schemas
export const insertCallRecordingSchema = createInsertSchema(callRecordings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVoiceToneAnalysisSchema = createInsertSchema(voiceToneAnalysis).omit({
  id: true,
  analysisTimestamp: true,
  createdAt: true,
});

export const insertCallInsightsSchema = createInsertSchema(callInsights).omit({
  id: true,
  createdAt: true,
});

export const insertKeyCallMomentsSchema = createInsertSchema(keyCallMoments).omit({
  id: true,
  createdAt: true,
});

export const insertCallParticipantsSchema = createInsertSchema(callParticipants).omit({
  id: true,
  createdAt: true,
});

export const insertVoiceTrendAnalysisSchema = createInsertSchema(voiceTrendAnalysis).omit({
  id: true,
  createdAt: true,
});

// Mood tracking insert schemas and types
export const insertMoodEntrySchema = createInsertSchema(moodEntries).omit({
  id: true,
  entryDate: true,
  createdAt: true,
});

export const insertTeamMoodSummarySchema = createInsertSchema(teamMoodSummaries).omit({
  id: true,
  createdAt: true,
});

export const insertMoodPerformanceCorrelationSchema = createInsertSchema(moodPerformanceCorrelations).omit({
  id: true,
  createdAt: true,
});

export const insertWorkOrderSchema = createInsertSchema(workOrders).omit({
  id: true,
  createdAt: true,
  sentAt: true,
  signedAt: true,
  signatureUrl: true,
  documentUrl: true,
  approveRequestId: true,
});

export const insertMarketingStrategySchema = createInsertSchema(marketingStrategies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  actualROI: true,
  actualLeads: true,
  actualCostPerLead: true,
});

// Cancellation Metrics Tables for Customer Churn Tracking (3+ months)
export const cancellationMetrics = pgTable("cancellation_metrics", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").references(() => contacts.id).notNull(),
  subscriptionId: integer("subscription_id").references(() => subscriptions.id),
  serviceStartDate: timestamp("service_start_date").notNull(),
  cancellationDate: timestamp("cancellation_date").notNull(),
  serviceDuration: integer("service_duration").notNull(), // in days
  serviceDurationMonths: text("service_duration_months").notNull(), // decimal months (e.g., "3.5")
  cancellationReason: text("cancellation_reason").notNull(), // primary reason
  secondaryReasons: text("secondary_reasons").array(), // additional reasons
  cancellationType: text("cancellation_type").notNull(), // voluntary, involuntary, non_payment, competition
  wasRetentionAttempted: boolean("was_retention_attempted").default(false),
  retentionOfferMade: text("retention_offer_made"), // discount, free month, upgrade, etc.
  retentionResponse: text("retention_response"), // accepted, declined, no_response
  finalMonthlyValue: integer("final_monthly_value").notNull(), // in cents
  totalLifetimeValue: integer("total_lifetime_value").notNull(), // in cents
  refundAmount: integer("refund_amount").default(0), // in cents
  customerSatisfactionScore: integer("customer_satisfaction_score"), // 1-10 scale
  likelyToRecommend: integer("likely_to_recommend"), // 1-10 NPS scale
  competitorMentioned: text("competitor_mentioned"),
  priceComplaint: boolean("price_complaint").default(false),
  serviceComplaint: boolean("service_complaint").default(false),
  supportComplaint: boolean("support_complaint").default(false),
  resultsSatisfaction: text("results_satisfaction"), // very_satisfied, satisfied, neutral, dissatisfied, very_dissatisfied
  communicationRating: integer("communication_rating"), // 1-10 scale
  responseTimeRating: integer("response_time_rating"), // 1-10 scale
  projectDeliveryRating: integer("project_delivery_rating"), // 1-10 scale
  exitSurveyCompleted: boolean("exit_survey_completed").default(false),
  exitSurveyResponses: json("exit_survey_responses"), // structured survey data
  followUpScheduled: boolean("follow_up_scheduled").default(false),
  followUpDate: timestamp("follow_up_date"),
  reactivationProbability: text("reactivation_probability"), // high, medium, low, none
  industryCategory: text("industry_category").notNull(),
  businessSize: text("business_size"), // small, medium, large, enterprise
  servicesUsed: text("services_used").array().notNull(), // SEO, PPC, web_design, etc.
  accountManagerId: integer("account_manager_id").references(() => users.id),
  lastContactAttempt: timestamp("last_contact_attempt"),
  cancellationProcessedBy: integer("cancellation_processed_by").references(() => users.id).notNull(),
  internalNotes: text("internal_notes"),
  isWinback: boolean("is_winback").default(false), // if customer later returned
  winbackDate: timestamp("winback_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const retentionAttempts = pgTable("retention_attempts", {
  id: serial("id").primaryKey(),
  cancellationMetricId: integer("cancellation_metric_id").references(() => cancellationMetrics.id).notNull(),
  contactId: integer("contact_id").references(() => contacts.id).notNull(),
  attemptDate: timestamp("attempt_date").defaultNow().notNull(),
  attemptType: text("attempt_type").notNull(), // call, email, meeting, text
  attemptedBy: integer("attempted_by").references(() => users.id).notNull(),
  offerMade: text("offer_made"), // specific retention offer
  offerValue: integer("offer_value"), // monetary value in cents
  customerResponse: text("customer_response").notNull(), // interested, declined, considering, no_response
  followUpRequired: boolean("follow_up_required").default(false),
  followUpDate: timestamp("follow_up_date"),
  notes: text("notes"),
  duration: integer("duration"), // call/meeting duration in minutes
  outcome: text("outcome").notNull(), // retained, lost, pending, escalated
  escalatedTo: integer("escalated_to").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cancellationTrends = pgTable("cancellation_trends", {
  id: serial("id").primaryKey(),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  totalCancellations: integer("total_cancellations").notNull(),
  totalActiveCustomers: integer("total_active_customers").notNull(),
  churnRate: text("churn_rate").notNull(), // percentage as decimal string
  averageServiceDuration: text("average_service_duration").notNull(), // in months
  totalLostRevenue: integer("total_lost_revenue").notNull(), // in cents
  averageLTV: integer("average_ltv").notNull(), // average lifetime value in cents
  topCancellationReason: text("top_cancellation_reason").notNull(),
  retentionSuccessRate: text("retention_success_rate"), // percentage
  industryBreakdown: json("industry_breakdown"), // {industry: count} pairs
  serviceBreakdown: json("service_breakdown"), // {service: count} pairs
  monthlyComparison: json("monthly_comparison"), // month-over-month data
  seasonalTrends: json("seasonal_trends"), // quarterly patterns
  competitorLosses: json("competitor_losses"), // {competitor: count} pairs
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertExtractionHistorySchema = createInsertSchema(extractionHistory).omit({
  id: true,
  extractionTime: true,
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertUserInvitationSchema = createInsertSchema(userInvitations).omit({
  id: true,
  createdAt: true,
  acceptedAt: true,
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
  createdBy: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  createdBy: true,
});

export const insertFileSchema = createInsertSchema(files).omit({
  id: true,
  createdAt: true,
  uploadedBy: true,
});

export const insertAutomationSchema = createInsertSchema(automations).omit({
  id: true,
  createdAt: true,
  createdBy: true,
  lastRun: true,
});

export const insertScrapingJobSchema = createInsertSchema(scrapingJobs).omit({
  id: true,
  createdAt: true,
  createdBy: true,
  lastRun: true,
  results: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
  readAt: true,
});

export const insertChatConversationSchema = createInsertSchema(chatConversations).omit({
  id: true,
  createdAt: true,
  lastMessageAt: true,
});

export const insertUserSessionSchema = createInsertSchema(userSessions).omit({
  id: true,
  createdAt: true,
  loginTime: true,
  lastActivity: true,
});

export const insertUserActivitySchema = createInsertSchema(userActivity).omit({
  id: true,
  timestamp: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UserInvitation = typeof userInvitations.$inferSelect;
export type InsertUserInvitation = z.infer<typeof insertUserInvitationSchema>;
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Contact = typeof contacts.$inferSelect & {
  assignedUser?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    mobilePhone: string | null;
    extension: string | null;
  } | null;
};
export type InsertContact = z.infer<typeof insertContactSchema>;
export type ContactNote = typeof contactNotes.$inferSelect;
export type InsertContactNote = z.infer<typeof insertContactNoteSchema>;
export type LeadIntake = typeof leadIntakes.$inferSelect;
export type InsertLeadIntake = z.infer<typeof insertLeadIntakeSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type File = typeof files.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;
export type Automation = typeof automations.$inferSelect;
export type InsertAutomation = z.infer<typeof insertAutomationSchema>;
export type ScrapingJob = typeof scrapingJobs.$inferSelect;
export type InsertScrapingJob = z.infer<typeof insertScrapingJobSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatConversation = typeof chatConversations.$inferSelect;
export type InsertChatConversation = z.infer<typeof insertChatConversationSchema>;
export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type UserActivity = typeof userActivity.$inferSelect;
export type InsertUserActivity = z.infer<typeof insertUserActivitySchema>;

export type CallLog = typeof callLogs.$inferSelect;
export type InsertCallLog = z.infer<typeof insertCallLogSchema>;
export type DailyDialStats = typeof dailyDialStats.$inferSelect;
export type InsertDailyDialStats = z.infer<typeof insertDailyDialStatsSchema>;

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;

export type LeadAllocation = typeof leadAllocations.$inferSelect;
export type InsertLeadAllocation = z.infer<typeof insertLeadAllocationSchema>;

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;

export type WorkOrder = typeof workOrders.$inferSelect;
export type InsertWorkOrder = z.infer<typeof insertWorkOrderSchema>;
export type MarketingStrategy = typeof marketingStrategies.$inferSelect;
export type InsertMarketingStrategy = z.infer<typeof insertMarketingStrategySchema>;
export type DocumentTemplate = typeof documentTemplates.$inferSelect;
export type InsertDocumentTemplate = z.infer<typeof insertDocumentTemplateSchema>;
export type SigningRequest = typeof signingRequests.$inferSelect;
export type InsertSigningRequest = z.infer<typeof insertSigningRequestSchema>;

// Voice tone analysis types
export type CallRecording = typeof callRecordings.$inferSelect;
export type InsertCallRecording = z.infer<typeof insertCallRecordingSchema>;
export type VoiceToneAnalysis = typeof voiceToneAnalysis.$inferSelect;
export type InsertVoiceToneAnalysis = z.infer<typeof insertVoiceToneAnalysisSchema>;
export type CallInsights = typeof callInsights.$inferSelect;
export type InsertCallInsights = z.infer<typeof insertCallInsightsSchema>;
export type KeyCallMoments = typeof keyCallMoments.$inferSelect;
export type InsertKeyCallMoments = z.infer<typeof insertKeyCallMomentsSchema>;
export type CallParticipants = typeof callParticipants.$inferSelect;
export type InsertCallParticipants = z.infer<typeof insertCallParticipantsSchema>;
export type VoiceTrendAnalysis = typeof voiceTrendAnalysis.$inferSelect;
export type InsertVoiceTrendAnalysis = z.infer<typeof insertVoiceTrendAnalysisSchema>;

// Mood tracking types
export type MoodEntry = typeof moodEntries.$inferSelect;
export type InsertMoodEntry = z.infer<typeof insertMoodEntrySchema>;
export type TeamMoodSummary = typeof teamMoodSummaries.$inferSelect;
export type InsertTeamMoodSummary = z.infer<typeof insertTeamMoodSummarySchema>;
export type MoodPerformanceCorrelation = typeof moodPerformanceCorrelations.$inferSelect;
export type InsertMoodPerformanceCorrelation = z.infer<typeof insertMoodPerformanceCorrelationSchema>;

export const customerTestimonials = pgTable("customer_testimonials", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  companyName: text("company_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  rating: integer("rating").notNull(), // 1-5 star rating
  testimonialText: text("testimonial_text").notNull(),
  serviceCategory: text("service_category").notNull(), // SEO, Web Development, PPC, etc.
  resultMetric: text("result_metric"), // "300% lead increase", "$50K revenue", etc.
  isApproved: boolean("is_approved").default(false),
  isPublic: boolean("is_public").default(false),
  isFeatured: boolean("is_featured").default(false),
  videoUrl: text("video_url"),
  photoUrl: text("photo_url"),
  businessLocation: text("business_location"),
  businessType: text("business_type"), // HVAC, Plumbing, Restaurant, etc.
  projectDuration: text("project_duration"), // "3 months", "6 months", etc.
  submittedBy: integer("submitted_by").references(() => users.id),
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCustomerTestimonialSchema = createInsertSchema(customerTestimonials).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  approvedAt: true,
});

export type CustomerTestimonial = typeof customerTestimonials.$inferSelect;
export type InsertCustomerTestimonial = z.infer<typeof insertCustomerTestimonialSchema>;

// Time Clock insert schemas
export const insertTimeClockEntrySchema = createInsertSchema(timeClockEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  approvedAt: true,
});

export const insertTimeClockScheduleSchema = createInsertSchema(timeClockSchedules).omit({
  id: true,
  createdAt: true,
});

export const insertTimeOffRequestSchema = createInsertSchema(timeOffRequests).omit({
  id: true,
  createdAt: true,
  requestedAt: true,
  reviewedAt: true,
});

// Time Clock types
export type TimeClockEntry = typeof timeClockEntries.$inferSelect;
export type InsertTimeClockEntry = z.infer<typeof insertTimeClockEntrySchema>;
export type TimeClockSchedule = typeof timeClockSchedules.$inferSelect;
export type InsertTimeClockSchedule = z.infer<typeof insertTimeClockScheduleSchema>;
export type TimeOffRequest = typeof timeOffRequests.$inferSelect;
export type InsertTimeOffRequest = z.infer<typeof insertTimeOffRequestSchema>;

// WhatsApp Messages Table
export const whatsappMessages = pgTable("whatsapp_messages", {
  id: serial("id").primaryKey(),
  messageSid: text("message_sid").unique(),
  contactId: integer("contact_id").references(() => contacts.id),
  fromNumber: text("from_number").notNull(),
  toNumber: text("to_number").notNull(),
  messageBody: text("message_body").notNull(),
  direction: text("direction").notNull(), // 'inbound' or 'outbound'
  status: text("status").default('sent'), // 'sent', 'delivered', 'read', 'failed'
  messageType: text("message_type").default('text'), // 'text', 'media', 'template'
  mediaUrl: text("media_url"),
  templateName: text("template_name"),
  sentBy: integer("sent_by").references(() => users.id),
  readAt: timestamp("read_at"),
  deliveredAt: timestamp("delivered_at"),
  errorMessage: text("error_message"),
  campaignId: integer("campaign_id").references(() => campaigns.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// WhatsApp Conversations Table
export const whatsappConversations = pgTable("whatsapp_conversations", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").references(() => contacts.id).notNull(),
  phoneNumber: text("phone_number").notNull(),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  messageCount: integer("message_count").default(0),
  status: text("status").default('active'), // 'active', 'closed', 'archived'
  assignedTo: integer("assigned_to").references(() => users.id),
  tags: text("tags").array(),
  notes: text("notes"),
  isRead: boolean("is_read").default(false),
  priority: text("priority").default('normal'), // 'low', 'normal', 'high', 'urgent'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// WhatsApp insert schemas
export const insertWhatsappMessageSchema = createInsertSchema(whatsappMessages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWhatsappConversationSchema = createInsertSchema(whatsappConversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// WhatsApp types
export type WhatsappMessage = typeof whatsappMessages.$inferSelect;
export type InsertWhatsappMessage = z.infer<typeof insertWhatsappMessageSchema>;
export type WhatsappConversation = typeof whatsappConversations.$inferSelect;
export type InsertWhatsappConversation = z.infer<typeof insertWhatsappConversationSchema>;

export type ExtractionHistory = typeof extractionHistory.$inferSelect;
export type InsertExtractionHistory = z.infer<typeof insertExtractionHistorySchema>;

// Technical Proposals System
export const technicalProposals = pgTable("technical_proposals", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").references(() => contacts.id).notNull(),
  assignedSalesRep: integer("assigned_sales_rep").references(() => users.id).notNull(),
  assignedTechnician: integer("assigned_technician").references(() => users.id),
  requestedBy: integer("requested_by").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  serviceType: text("service_type").notNull(), // seo, web_development, ppc, content_marketing, social_media, etc.
  serviceScope: text("service_scope").array(), // detailed scope items
  clientRequirements: text("client_requirements"),
  budgetRange: text("budget_range"),
  timeline: text("timeline"), // expected delivery timeline
  priority: text("priority").default("medium"), // low, medium, high, urgent
  status: text("status").default("pending"), // pending, in_progress, completed, delivered, rejected
  proposalContent: text("proposal_content"), // comprehensive proposal from technician
  technicalSpecifications: json("technical_specifications"), // detailed tech specs
  deliverables: text("deliverables").array(), // list of deliverables
  estimatedHours: integer("estimated_hours"),
  proposedPrice: integer("proposed_price"), // price in cents
  revisionRequests: text("revision_requests"),
  revisionCount: integer("revision_count").default(0),
  clientFeedback: text("client_feedback"),
  internalNotes: text("internal_notes"),
  attachments: text("attachments").array(), // file URLs or paths
  submittedAt: timestamp("submitted_at"),
  acceptedAt: timestamp("accepted_at"),
  completedAt: timestamp("completed_at"),
  deliveredAt: timestamp("delivered_at"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Proposal Revisions for tracking changes
export const proposalRevisions = pgTable("proposal_revisions", {
  id: serial("id").primaryKey(),
  proposalId: integer("proposal_id").references(() => technicalProposals.id).notNull(),
  revisionNumber: integer("revision_number").notNull(),
  revisedBy: integer("revised_by").references(() => users.id).notNull(),
  revisionType: text("revision_type").notNull(), // content, pricing, timeline, scope
  previousContent: text("previous_content"),
  newContent: text("new_content"),
  revisionNotes: text("revision_notes"),
  requestedBy: integer("requested_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Proposal Communication between sales rep and technician
export const proposalCommunication = pgTable("proposal_communication", {
  id: serial("id").primaryKey(),
  proposalId: integer("proposal_id").references(() => technicalProposals.id).notNull(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  recipientId: integer("recipient_id").references(() => users.id).notNull(),
  messageType: text("message_type").default("note"), // note, question, update, approval_request
  subject: text("subject"),
  message: text("message").notNull(),
  priority: text("priority").default("normal"), // low, normal, high, urgent
  isRead: boolean("is_read").default(false),
  attachments: text("attachments").array(),
  requiresResponse: boolean("requires_response").default(false),
  responseDeadline: timestamp("response_deadline"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Proposal Templates for common services
export const proposalTemplates = pgTable("proposal_templates", {
  id: serial("id").primaryKey(),
  templateName: text("template_name").notNull(),
  serviceType: text("service_type").notNull(),
  templateContent: text("template_content").notNull(),
  defaultSpecs: json("default_specs"),
  estimatedHours: integer("estimated_hours"),
  basePrice: integer("base_price"), // base price in cents
  deliverables: text("deliverables").array(),
  isActive: boolean("is_active").default(true),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas for technical proposals
export const insertTechnicalProposalSchema = createInsertSchema(technicalProposals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProposalRevisionSchema = createInsertSchema(proposalRevisions).omit({
  id: true,
  createdAt: true,
});

export const insertProposalCommunicationSchema = createInsertSchema(proposalCommunication).omit({
  id: true,
  createdAt: true,
});

export const insertProposalTemplateSchema = createInsertSchema(proposalTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types for technical proposals
export type TechnicalProposal = typeof technicalProposals.$inferSelect;
export type InsertTechnicalProposal = z.infer<typeof insertTechnicalProposalSchema>;
export type ProposalRevision = typeof proposalRevisions.$inferSelect;
export type InsertProposalRevision = z.infer<typeof insertProposalRevisionSchema>;
export type ProposalCommunication = typeof proposalCommunication.$inferSelect;
export type InsertProposalCommunication = z.infer<typeof insertProposalCommunicationSchema>;
export type ProposalTemplate = typeof proposalTemplates.$inferSelect;
export type InsertProposalTemplate = z.infer<typeof insertProposalTemplateSchema>;

// Email Accounts
export const emailAccounts = pgTable('email_accounts', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id').notNull().references(() => users.id),
  emailAddress: text('email_address').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  department: text('department').notNull(),
  status: text('status').default('active'), // active, suspended, pending
  storageUsed: integer('storage_used').default(0), // in MB
  storageLimit: integer('storage_limit').default(5000), // in MB
  forwardingEnabled: boolean('forwarding_enabled').default(false),
  autoReplyEnabled: boolean('auto_reply_enabled').default(false),
  lastLogin: timestamp('last_login'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Email Templates
export const emailTemplates = pgTable('email_templates', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  type: text('type').notNull(), // welcome, credentials, policy, suspension
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Insert schemas for email management
export const insertEmailAccountSchema = createInsertSchema(emailAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Insert schemas for cancellation metrics
export const insertCancellationMetricSchema = createInsertSchema(cancellationMetrics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRetentionAttemptSchema = createInsertSchema(retentionAttempts).omit({
  id: true,
  attemptDate: true,
  createdAt: true,
});

export const insertCancellationTrendSchema = createInsertSchema(cancellationTrends).omit({
  id: true,
  createdAt: true,
});

// Types for cancellation metrics
export type CancellationMetric = typeof cancellationMetrics.$inferSelect;
export type InsertCancellationMetric = z.infer<typeof insertCancellationMetricSchema>;
export type RetentionAttempt = typeof retentionAttempts.$inferSelect;
export type InsertRetentionAttempt = z.infer<typeof insertRetentionAttemptSchema>;
export type CancellationTrend = typeof cancellationTrends.$inferSelect;
export type InsertCancellationTrend = z.infer<typeof insertCancellationTrendSchema>;

// Types for email management
export type EmailAccount = typeof emailAccounts.$inferSelect;
export type InsertEmailAccount = z.infer<typeof insertEmailAccountSchema>;
export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;

// Career management and job posting system
export const jobPostings = pgTable("job_postings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  department: text("department").notNull(), // Sales, Marketing, HR, Operations, Technical, Customer Service
  location: text("location").notNull(), // Remote, On-site, Hybrid
  employmentType: text("employment_type").notNull(), // Full-time, Part-time, Contract, Internship
  experienceLevel: text("experience_level").notNull(), // Entry, Mid, Senior, Executive
  description: text("description").notNull(),
  requirements: text("requirements").array().notNull(), // Array of requirement strings
  responsibilities: text("responsibilities").array().notNull(), // Array of responsibility strings
  benefits: text("benefits").array().notNull(), // Array of benefit strings
  salaryRangeMin: integer("salary_range_min"), // Annual salary in dollars
  salaryRangeMax: integer("salary_range_max"), // Annual salary in dollars
  compensationType: text("compensation_type").notNull(), // Salary, Commission, Hourly, Contract
  commissionRate: text("commission_rate"), // For commission-based roles
  skillsRequired: text("skills_required").array().notNull(), // Array of required skills
  skillsPreferred: text("skills_preferred").array().notNull(), // Array of preferred skills
  applicationDeadline: timestamp("application_deadline"),
  status: text("status").default("active"), // active, paused, closed, draft
  isRemote: boolean("is_remote").default(false),
  isUrgentHiring: boolean("is_urgent_hiring").default(false),
  publishedToWebsite: boolean("published_to_website").default(false),
  websiteUrl: text("website_url"), // URL where job is posted on website
  applicationUrl: text("application_url"), // External application URL if different
  createdBy: integer("created_by").references(() => users.id).notNull(),
  updatedBy: integer("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const jobApplications = pgTable("job_applications", {
  id: serial("id").primaryKey(),
  jobPostingId: integer("job_posting_id").references(() => jobPostings.id).notNull(),
  applicantName: text("applicant_name").notNull(),
  applicantEmail: text("applicant_email").notNull(),
  applicantPhone: text("applicant_phone"),
  resumeUrl: text("resume_url"), // URL to uploaded resume
  coverLetter: text("cover_letter"),
  linkedinProfile: text("linkedin_profile"),
  portfolioUrl: text("portfolio_url"),
  yearsExperience: integer("years_experience"),
  currentCompany: text("current_company"),
  currentPosition: text("current_position"),
  salaryExpectation: integer("salary_expectation"),
  availableStartDate: timestamp("available_start_date"),
  referralSource: text("referral_source"), // How they heard about the position
  additionalNotes: text("additional_notes"),
  status: text("status").default("received"), // received, screening, interviewing, offer_extended, hired, rejected
  applicationScore: integer("application_score"), // 1-100 scoring based on qualifications
  interviewScheduled: timestamp("interview_scheduled"),
  interviewNotes: text("interview_notes"),
  rejectionReason: text("rejection_reason"),
  hiringManagerId: integer("hiring_manager_id").references(() => users.id),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const interviewSchedules = pgTable("interview_schedules", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").references(() => jobApplications.id).notNull(),
  interviewType: text("interview_type").notNull(), // phone_screening, video_call, in_person, panel
  scheduledDate: timestamp("scheduled_date").notNull(),
  duration: integer("duration").default(60), // Duration in minutes
  interviewerId: integer("interviewer_id").references(() => users.id).notNull(),
  meetingLink: text("meeting_link"), // For video interviews
  meetingLocation: text("meeting_location"), // For in-person interviews
  agenda: text("agenda"),
  status: text("status").default("scheduled"), // scheduled, completed, cancelled, rescheduled
  feedback: text("feedback"),
  rating: integer("rating"), // 1-5 star rating
  recommendForNext: boolean("recommend_for_next").default(false),
  notes: text("notes"),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const careerSettings = pgTable("career_settings", {
  id: serial("id").primaryKey(),
  websiteIntegrationEnabled: boolean("website_integration_enabled").default(false),
  websiteUrl: text("website_url"), // Base URL for job posting integration
  wordpressUsername: text("wordpress_username"), // For WordPress API integration
  wordpressPassword: text("wordpress_password"), // For WordPress API integration
  applicationEmailNotifications: boolean("application_email_notifications").default(true),
  autoPublishToWebsite: boolean("auto_publish_to_website").default(false),
  requireCoverLetter: boolean("require_cover_letter").default(false),
  allowAnonymousApplications: boolean("allow_anonymous_applications").default(true),
  applicationRetentionDays: integer("application_retention_days").default(365),
  interviewReminderHours: integer("interview_reminder_hours").default(24),
  careerPageTitle: text("career_page_title").default("Join Our Team"),
  careerPageDescription: text("career_page_description").default("Explore exciting career opportunities"),
  companyBenefitsOverview: text("company_benefits_overview").array().default([]),
  hiringProcessSteps: text("hiring_process_steps").array().default([]),
  updatedBy: integer("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas for career management
export const insertJobPostingSchema = createInsertSchema(jobPostings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertJobApplicationSchema = createInsertSchema(jobApplications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInterviewScheduleSchema = createInsertSchema(interviewSchedules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCareerSettingsSchema = createInsertSchema(careerSettings).omit({
  id: true,
  updatedAt: true,
});

// Types for career management
export type JobPosting = typeof jobPostings.$inferSelect;
export type InsertJobPosting = z.infer<typeof insertJobPostingSchema>;
export type JobApplication = typeof jobApplications.$inferSelect;
export type InsertJobApplication = z.infer<typeof insertJobApplicationSchema>;
export type InterviewSchedule = typeof interviewSchedules.$inferSelect;
export type InsertInterviewSchedule = z.infer<typeof insertInterviewScheduleSchema>;
export type CareerSettings = typeof careerSettings.$inferSelect;
export type InsertCareerSettings = z.infer<typeof insertCareerSettingsSchema>;

// Gamification System Tables
export const userPoints = pgTable("user_points", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  totalPoints: integer("total_points").default(0).notNull(),
  currentLevel: integer("current_level").default(1).notNull(),
  pointsToNextLevel: integer("points_to_next_level").default(100).notNull(),
  dailyStreak: integer("daily_streak").default(0).notNull(),
  weeklyStreak: integer("weekly_streak").default(0).notNull(),
  monthlyStreak: integer("monthly_streak").default(0).notNull(),
  lastActivityDate: timestamp("last_activity_date"),
  lifetimeEarnings: integer("lifetime_earnings").default(0).notNull(), // total points ever earned
  currentRank: text("current_rank").default("Bronze"), // Bronze, Silver, Gold, Platinum, Diamond
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const pointActivities = pgTable("point_activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  activityType: text("activity_type").notNull(), // lead_contacted, deal_closed, call_made, appointment_scheduled, etc.
  pointsEarned: integer("points_earned").notNull(),
  description: text("description").notNull(),
  relatedEntityType: text("related_entity_type"), // contact, deal, call, appointment
  relatedEntityId: integer("related_entity_id"),
  multiplier: integer("multiplier").default(1), // for bonus events
  source: text("source").default("platform"), // platform, bonus, achievement
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // sales, engagement, consistency, milestone
  icon: text("icon").notNull(),
  pointReward: integer("point_reward").default(0).notNull(),
  badgeColor: text("badge_color").default("blue"), // blue, green, orange, red, purple, gold
  rarity: text("rarity").default("common"), // common, rare, epic, legendary
  requirements: json("requirements"), // flexible JSON for different requirement types
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  achievementId: integer("achievement_id").references(() => achievements.id).notNull(),
  progress: integer("progress").default(0).notNull(),
  maxProgress: integer("max_progress").notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
  pointsEarned: integer("points_earned").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dailyChallenges = pgTable("daily_challenges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  challengeType: text("challenge_type").notNull(), // calls, appointments, deals, logins
  targetValue: integer("target_value").notNull(),
  pointReward: integer("point_reward").notNull(),
  bonusMultiplier: integer("bonus_multiplier").default(1),
  icon: text("icon").default("target"),
  difficulty: text("difficulty").default("medium"), // easy, medium, hard, expert
  isActive: boolean("is_active").default(true).notNull(),
  validDate: timestamp("valid_date").notNull(), // date this challenge is valid for
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userChallenges = pgTable("user_challenges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  challengeId: integer("challenge_id").references(() => dailyChallenges.id).notNull(),
  progress: integer("progress").default(0).notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
  pointsEarned: integer("points_earned").default(0).notNull(),
  challengeDate: timestamp("challenge_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leaderboards = pgTable("leaderboards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  leaderboardType: text("leaderboard_type").notNull(), // daily, weekly, monthly, all_time
  category: text("category").notNull(), // points, deals, calls, revenue
  score: integer("score").notNull(),
  rank: integer("rank").notNull(),
  period: text("period").notNull(), // 2025-01-01, 2025-W01, 2025-01, all_time
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const pointMultipliers = pgTable("point_multipliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  multiplier: integer("multiplier").notNull(), // 2x, 3x, etc.
  activityTypes: text("activity_types").array(), // which activities get the multiplier
  isActive: boolean("is_active").default(true).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const badgeCategories = pgTable("badge_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  color: text("color").default("blue").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  badgeName: text("badge_name").notNull(),
  badgeDescription: text("badge_description").notNull(),
  badgeIcon: text("badge_icon").notNull(),
  badgeColor: text("badge_color").default("blue").notNull(),
  rarity: text("rarity").default("common").notNull(),
  pointsEarned: integer("points_earned").default(0).notNull(),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
});

export const engagementMetrics = pgTable("engagement_metrics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  metricDate: timestamp("metric_date").notNull(),
  loginCount: integer("login_count").default(0).notNull(),
  timeSpent: integer("time_spent").default(0).notNull(), // minutes
  actionsPerformed: integer("actions_performed").default(0).notNull(),
  pointsEarned: integer("points_earned").default(0).notNull(),
  challengesCompleted: integer("challenges_completed").default(0).notNull(),
  achievementsUnlocked: integer("achievements_unlocked").default(0).notNull(),
  streakMaintained: boolean("streak_maintained").default(false).notNull(),
  engagementScore: integer("engagement_score").default(0).notNull(), // calculated score 0-100
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas for gamification
export const insertUserPointsSchema = createInsertSchema(userPoints).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPointActivitySchema = createInsertSchema(pointActivities).omit({
  id: true,
  createdAt: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  createdAt: true,
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  createdAt: true,
});

export const insertDailyChallengeSchema = createInsertSchema(dailyChallenges).omit({
  id: true,
  createdAt: true,
});

export const insertUserChallengeSchema = createInsertSchema(userChallenges).omit({
  id: true,
  createdAt: true,
});

export const insertLeaderboardSchema = createInsertSchema(leaderboards).omit({
  id: true,
});

export const insertUserBadgeSchema = createInsertSchema(userBadges).omit({
  id: true,
});

export const insertEngagementMetricSchema = createInsertSchema(engagementMetrics).omit({
  id: true,
  createdAt: true,
});

// Types for gamification system
export type UserPoints = typeof userPoints.$inferSelect;
export type InsertUserPoints = z.infer<typeof insertUserPointsSchema>;
export type PointActivity = typeof pointActivities.$inferSelect;
export type InsertPointActivity = z.infer<typeof insertPointActivitySchema>;
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type DailyChallenge = typeof dailyChallenges.$inferSelect;
export type InsertDailyChallenge = z.infer<typeof insertDailyChallengeSchema>;
export type UserChallenge = typeof userChallenges.$inferSelect;
export type InsertUserChallenge = z.infer<typeof insertUserChallengeSchema>;
export type Leaderboard = typeof leaderboards.$inferSelect;
export type InsertLeaderboard = z.infer<typeof insertLeaderboardSchema>;
export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;
export type EngagementMetric = typeof engagementMetrics.$inferSelect;
export type InsertEngagementMetric = z.infer<typeof insertEngagementMetricSchema>;
