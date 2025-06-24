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
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  logo: text("logo"),
  primaryColor: text("primary_color").default("#0078D4"),
  secondaryColor: text("secondary_color").default("#106EBE"),
  domain: text("domain"),
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
  company: text("company"),
  position: text("position"),
  avatar: text("avatar"),
  tags: text("tags").array(),
  notes: text("notes"),
  leadStatus: text("lead_status").default("new"), // new, contacted, qualified, proposal, negotiation, closed_won, closed_lost
  leadSource: text("lead_source"), // yelp, google_maps, google_ads, facebook, instagram, tiktok, linkedin, youtube, twitter, website, referral, cold_call, email, event, chat_widget
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: integer("created_by").references(() => users.id),
  updatedBy: integer("updated_by").references(() => users.id),
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

export const jobPostings = pgTable("job_postings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  department: text("department").notNull(), // sales, marketing, development, operations, hr, finance
  location: text("location").notNull(), // remote, on-site, hybrid
  employmentType: text("employment_type").notNull(), // full-time, part-time, contract, internship
  experience: text("experience").notNull(), // entry, mid, senior, executive
  salary: text("salary"), // salary range
  description: text("description").notNull(),
  requirements: text("requirements").array(),
  responsibilities: text("responsibilities").array(),
  benefits: text("benefits").array(),
  skills: text("skills").array(),
  status: text("status").default("active"), // active, paused, closed, draft
  publishedAt: timestamp("published_at"),
  deadline: timestamp("deadline"),
  hiringManager: integer("hiring_manager").references(() => users.id),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const jobApplications = pgTable("job_applications", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => jobPostings.id).notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  resumeUrl: text("resume_url"),
  coverLetter: text("cover_letter"),
  linkedinUrl: text("linkedin_url"),
  portfolioUrl: text("portfolio_url"),
  expectedSalary: text("expected_salary"),
  startDate: text("start_date"),
  status: text("status").default("submitted"), // submitted, screening, interview, offer, hired, rejected
  stage: text("stage").default("application"), // application, phone_screen, interview_1, interview_2, final, offer
  notes: text("notes"),
  rating: integer("rating"), // 1-5 stars
  interviewDate: timestamp("interview_date"),
  interviewType: text("interview_type"), // phone, video, in-person
  interviewFeedback: text("interview_feedback"),
  rejectionReason: text("rejection_reason"),
  source: text("source").default("website"), // website, linkedin, referral, job_board
  assignedTo: integer("assigned_to").references(() => users.id),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const interviews = pgTable("interviews", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").references(() => jobApplications.id).notNull(),
  type: text("type").notNull(), // phone, video, in-person, panel
  scheduledAt: timestamp("scheduled_at").notNull(),
  duration: integer("duration").default(60), // minutes
  interviewers: text("interviewers").array(), // user IDs
  location: text("location"), // for in-person interviews
  meetingLink: text("meeting_link"), // for video interviews
  agenda: text("agenda"),
  feedback: text("feedback"),
  rating: integer("rating"), // 1-5 stars
  recommendation: text("recommendation"), // hire, no_hire, maybe
  status: text("status").default("scheduled"), // scheduled, completed, cancelled, rescheduled
  notes: text("notes"),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
export const insertJobPostingSchema = createInsertSchema(jobPostings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertJobApplicationSchema = createInsertSchema(jobApplications).omit({
  id: true,
  submittedAt: true,
  updatedAt: true,
});

export const insertInterviewSchema = createInsertSchema(interviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

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

// Types for HR module
export type JobPosting = typeof jobPostings.$inferSelect;
export type InsertJobPosting = z.infer<typeof insertJobPostingSchema>;
export type JobApplication = typeof jobApplications.$inferSelect;
export type InsertJobApplication = z.infer<typeof insertJobApplicationSchema>;
export type Interview = typeof interviews.$inferSelect;
export type InsertInterview = z.infer<typeof insertInterviewSchema>;
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

export const insertWorkOrderSchema = createInsertSchema(workOrders).omit({
  id: true,
  createdAt: true,
  sentAt: true,
  signedAt: true,
  signatureUrl: true,
  documentUrl: true,
  approveRequestId: true,
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
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

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Contact = typeof contacts.$inferSelect;
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
export type DocumentTemplate = typeof documentTemplates.$inferSelect;
export type InsertDocumentTemplate = z.infer<typeof insertDocumentTemplateSchema>;
export type SigningRequest = typeof signingRequests.$inferSelect;
export type InsertSigningRequest = z.infer<typeof insertSigningRequestSchema>;
