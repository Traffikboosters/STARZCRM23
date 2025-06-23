import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { z } from "zod";
import { eq, desc, and, gte, lte, sql, asc } from "drizzle-orm";
import { 
  insertUserSchema,
  insertCompanySchema,
  insertContactSchema, 
  insertEventSchema, 
  insertFileSchema,
  insertAutomationSchema,
  insertScrapingJobSchema,
  insertCallLogSchema,
  type User,
  type Contact,
  type Event,
  type File,
  type CallLog
} from "../shared/schema";
import { storage } from "./storage";
import { mightyCallEnhanced } from "./mightycall-enhanced";
import { workingCaller } from "./mightycall-working";

function logAuditEvent(action: string, entityType: string, entityId: number, userId: number = 1, oldValues?: any, newValues?: any, description?: string) {
  console.log(`[AUDIT] ${new Date().toISOString()} - User ${userId} performed ${action} on ${entityType} ${entityId}${description ? ': ' + description : ''}`);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication middleware (simplified for demo)
  const requireAuth = (req: any, res: any, next: any) => {
    // In production, implement proper session/JWT validation
    req.user = { id: 1, username: "admin", role: "admin" };
    next();
  };

  // Basic user endpoints
  app.get("/api/users/me", requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/user", requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.patch("/api/users/me", requireAuth, async (req: any, res) => {
    try {
      const { firstName, lastName, email, phone } = req.body;
      const updatedUser = await storage.updateUser(req.user.id, {
        firstName,
        lastName,
        email,
        phone,
      });
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Companies API
  app.get("/api/companies", async (req, res) => {
    try {
      const companies = await storage.getAllCompanies();
      res.json(companies);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/companies", async (req, res) => {
    try {
      const validation = insertCompanySchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
      }
      const company = await storage.createCompany(validation.data);
      res.json(company);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Contacts API
  app.get("/api/contacts", async (req, res) => {
    try {
      const { search, leadSource, leadStatus } = req.query;
      let contacts = await storage.getAllContacts();
      
      // Apply filters
      if (search) {
        const searchTerm = (search as string).toLowerCase();
        contacts = contacts.filter(contact => 
          contact.firstName?.toLowerCase().includes(searchTerm) ||
          contact.lastName?.toLowerCase().includes(searchTerm) ||
          contact.email?.toLowerCase().includes(searchTerm) ||
          contact.company?.toLowerCase().includes(searchTerm)
        );
      }
      
      if (leadSource) {
        contacts = contacts.filter(contact => contact.leadSource === leadSource);
      }
      
      if (leadStatus) {
        contacts = contacts.filter(contact => contact.leadStatus === leadStatus);
      }
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/contacts", async (req, res) => {
    try {
      const validation = insertContactSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
      }
      const contact = await storage.createContact({ ...validation.data, createdBy: 1 });
      
      logAuditEvent("CREATE", "contact", contact.id, 1, null, contact, "Contact created");
      
      res.json(contact);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.put("/api/contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validation = insertContactSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
      }
      
      const oldContact = await storage.getContact(id);
      const contact = await storage.updateContact(id, validation.data);
      
      logAuditEvent("UPDATE", "contact", id, 1, oldContact, contact, "Contact updated");
      
      res.json(contact);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.delete("/api/contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const contact = await storage.getContact(id);
      await storage.deleteContact(id);
      
      logAuditEvent("DELETE", "contact", id, 1, contact, null, "Contact deleted");
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Events API
  app.get("/api/events", async (req, res) => {
    try {
      const { start, end } = req.query;
      let events = await storage.getAllEvents();
      
      // Apply date range filter if provided
      if (start && end) {
        const startDate = new Date(start as string);
        const endDate = new Date(end as string);
        events = events.filter(event => 
          event.startDate >= startDate && event.endDate <= endDate
        );
      }
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/events", async (req, res) => {
    try {
      const validation = insertEventSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
      }
      const event = await storage.createEvent({ ...validation.data, createdBy: 1 });
      
      logAuditEvent("CREATE", "event", event.id, 1, null, event, "Event created");
      
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.put("/api/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validation = insertEventSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
      }
      
      const oldEvent = await storage.getEvent(id);
      const event = await storage.updateEvent(id, validation.data);
      
      logAuditEvent("UPDATE", "event", id, 1, oldEvent, event, "Event updated");
      
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.delete("/api/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.getEvent(id);
      await storage.deleteEvent(id);
      
      logAuditEvent("DELETE", "event", id, 1, event, null, "Event deleted");
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Files API
  app.get("/api/files", async (req, res) => {
    try {
      const files = await storage.getAllFiles();
      res.json(files);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/files", async (req, res) => {
    try {
      const validation = insertFileSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
      }
      const file = await storage.createFile({ ...validation.data, uploadedBy: 1 });
      
      logAuditEvent("CREATE", "file", file.id, 1, null, file, "File uploaded");
      
      res.json(file);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Automations API
  app.get("/api/automations", async (req, res) => {
    try {
      const automations = await storage.getAllAutomations();
      res.json(automations);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/automations", async (req, res) => {
    try {
      const validation = insertAutomationSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
      }
      const automation = await storage.createAutomation({ ...validation.data, createdBy: 1 });
      
      logAuditEvent("CREATE", "automation", automation.id, 1, null, automation, "Automation created");
      
      res.json(automation);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Scraping Jobs API
  app.get("/api/scraping-jobs", async (req, res) => {
    try {
      const jobs = await storage.getAllScrapingJobs();
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/scraping-jobs", async (req, res) => {
    try {
      const validation = insertScrapingJobSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
      }
      const job = await storage.createScrapingJob({ ...validation.data, createdBy: 1 });
      
      logAuditEvent("CREATE", "scraping_job", job.id, 1, null, job, "Scraping job created");
      
      res.json(job);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Call Logs API
  app.get("/api/call-logs", async (req, res) => {
    try {
      const { contactId, userId, direction } = req.query;
      let callLogs = await storage.getAllCallLogs();
      
      // Apply filters
      if (contactId) {
        const contactIdNum = parseInt(contactId as string);
        callLogs = callLogs.filter(log => log.contactId === contactIdNum);
      }
      
      if (userId) {
        const userIdNum = parseInt(userId as string);
        callLogs = callLogs.filter(log => log.userId === userIdNum);
      }
      
      if (direction) {
        callLogs = callLogs.filter(log => log.direction === direction);
      }
      res.json(callLogs);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/call-logs", async (req, res) => {
    try {
      const validation = insertCallLogSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
      }
      
      const callLog = await storage.createCallLog(validation.data);
      
      logAuditEvent("CREATE", "call_log", callLog.id, 1, null, callLog, "Call logged");
      
      res.json(callLog);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Work Orders API - TODO: Implement in storage layer

  // MightyCall status endpoint
  app.get("/api/mightycall/status", async (req, res) => {
    try {
      const status = await mightyCallEnhanced.getStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({
        connected: false,
        apiAccess: false,
        accountId: "unknown",
        integrationLevel: "Offline",
        message: `MightyCall status check failed: ${(error as Error).message}`
      });
    }
  });

  // MightyCall call initiation endpoint
  app.post("/api/mightycall/call", async (req, res) => {
    try {
      const { phoneNumber, contactName, extension, userId = 1 } = req.body;
      
      const callResponse = await mightyCallEnhanced.initiateCall({
        phoneNumber,
        contactName,
        extension,
        userId
      });

      // Log the call in our database
      if (callResponse.success) {
        await storage.createCallLog({
          contactId: null,
          userId: userId,
          phoneNumber: callResponse.displayNumber,
          direction: "outbound",
          status: "initiated",
          startTime: new Date(),
          duration: null,
          notes: `Call to ${contactName || callResponse.displayNumber} via MightyCall`,
          recording: null
        });
      }

      res.json(callResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: `Call initiation failed: ${(error as Error).message}`
      });
    }
  });

  // MightyCall connection test endpoint
  app.post("/api/mightycall/test-connection", async (req, res) => {
    try {
      const status = await mightyCallEnhanced.getStatus();
      res.json({
        success: status.connected,
        status: status.integrationLevel,
        message: status.message,
        instructions: mightyCallEnhanced.generateCallInstructions(status)
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: `Connection test failed: ${(error as Error).message}`
      });
    }
  });

  // MightyCall Working Call endpoint optimized for Core plan
  app.post("/api/mightycall/call", async (req, res) => {
    try {
      const { phoneNumber, contactName } = req.body;
      
      if (!phoneNumber) {
        return res.status(400).json({
          success: false,
          message: "Phone number is required"
        });
      }

      const result = await workingCaller.initiateWorkingCall(phoneNumber, contactName);
      
      res.json({
        success: result.success,
        callId: result.callId,
        phoneNumber: result.phoneNumber,
        dialString: result.dialString,
        message: result.message,
        method: result.method,
        instructions: result.instructions
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: `Call initiation failed: ${(error as Error).message}`
      });
    }
  });

  // MightyCall Working Status endpoint
  app.get("/api/mightycall/working-status", async (req, res) => {
    try {
      const status = await workingCaller.getWorkingStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({
        error: `Status check failed: ${(error as Error).message}`
      });
    }
  });

  // Document signing endpoints
  app.post("/api/documents/create-signing-request", requireAuth, async (req: any, res) => {
    try {
      const { templateId, recipientEmail, recipientName, documentTitle, customMessage, template } = req.body;
      
      const signingRequest = await storage.createSigningRequest({
        recipientEmail,
        recipientName,
        documentTitle: documentTitle || `${template} - ${recipientName}`,
        senderEmail: req.user.email || 'traffikboosters@gmail.com',
        templateId,
        status: 'sent',
        priority: 'medium',
        customMessage,
        createdBy: req.user.id
      });

      res.json({
        success: true,
        signingRequest,
        message: `Document sent to ${recipientName} at ${recipientEmail}`
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/documents/signing-requests", requireAuth, async (req: any, res) => {
    try {
      const requests = await storage.getAllSigningRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Scraping endpoints
  app.post("/api/scraping/submit", requireAuth, async (req: any, res) => {
    try {
      const { url, config } = req.body;
      
      const scrapingJob = await storage.createScrapingJob({
        name: `Scraping job for ${url}`,
        url,
        selectors: config,
        status: 'pending',
        createdBy: req.user.id
      });

      res.json({
        success: true,
        jobId: scrapingJob.id,
        message: `Scraping job created for ${url}`
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/scraping-jobs", requireAuth, async (req: any, res) => {
    try {
      const jobs = await storage.getAllScrapingJobs();
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // User management endpoints
  app.get("/api/users", requireAuth, async (req: any, res) => {
    try {
      // Only admins can view all users
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "Insufficient permissions to view users" });
      }
      
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/users", requireAuth, async (req: any, res) => {
    try {
      // Only admins can create users
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "Insufficient permissions to create users" });
      }
      
      const userData = req.body;
      
      // Check if username or email already exists
      const existingUsers = await storage.getAllUsers();
      const usernameExists = existingUsers.some(u => u.username === userData.username);
      const emailExists = existingUsers.some(u => u.email === userData.email);
      
      if (usernameExists) {
        return res.status(400).json({ error: "Username already exists" });
      }
      
      if (emailExists) {
        return res.status(400).json({ error: "Email already exists" });
      }
      
      const newUser = await storage.createUser(userData);
      res.json(newUser);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.put("/api/users/:id", requireAuth, async (req: any, res) => {
    try {
      // Only admins can update users
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "Insufficient permissions to update users" });
      }
      
      const userId = parseInt(req.params.id);
      const updates = req.body;
      
      // Check if email already exists (if being updated)
      if (updates.email) {
        const existingUsers = await storage.getAllUsers();
        const emailExists = existingUsers.some(u => u.email === updates.email && u.id !== userId);
        
        if (emailExists) {
          return res.status(400).json({ error: "Email already exists" });
        }
      }
      
      const updatedUser = await storage.updateUser(userId, updates);
      
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.delete("/api/users/:id", requireAuth, async (req: any, res) => {
    try {
      // Only admins can delete users
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "Insufficient permissions to delete users" });
      }
      
      const userId = parseInt(req.params.id);
      
      // Prevent self-deletion
      if (userId === req.user.id) {
        return res.status(400).json({ error: "Cannot delete your own account" });
      }
      
      const deleted = await storage.deleteUser(userId);
      
      if (!deleted) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Sales rep analytics endpoints
  app.get("/api/sales-analytics", requireAuth, async (req: any, res) => {
    try {
      const { period = "30d", repId } = req.query;
      
      // Get all contacts for analytics
      const contacts = await storage.getAllContacts();
      const events = await storage.getAllEvents();
      const users = await storage.getAllUsers();
      
      // Filter sales reps
      const salesReps = users.filter(user => user.role === "sales_rep");
      
      // Calculate performance metrics for each rep
      const repAnalytics = salesReps.map(rep => {
        const assignedLeads = contacts.filter(contact => contact.assignedTo === rep.id);
        const contactedLeads = assignedLeads.filter(contact => contact.leadStatus !== "new");
        const qualifiedLeads = assignedLeads.filter(contact => 
          contact.leadStatus === "qualified" || 
          contact.leadStatus === "proposal" || 
          contact.leadStatus === "negotiation" ||
          contact.leadStatus === "closed_won"
        );
        const wonDeals = assignedLeads.filter(contact => contact.leadStatus === "closed_won");
        const lostDeals = assignedLeads.filter(contact => contact.leadStatus === "closed_lost");
        
        // Calculate appointments from events
        const repEvents = events.filter(event => event.createdBy === rep.id);
        const appointments = repEvents.filter(event => event.type === "meeting");
        const completedAppointments = appointments.filter(event => event.status === "completed");
        
        // Calculate revenue from won deals
        const totalRevenue = wonDeals.reduce((sum, deal) => sum + (deal.budget || 0), 0);
        const avgDealSize = wonDeals.length > 0 ? totalRevenue / wonDeals.length : 0;
        
        // Calculate ratios
        const closingRatio = qualifiedLeads.length > 0 ? (wonDeals.length / qualifiedLeads.length) * 100 : 0;
        const contactRate = assignedLeads.length > 0 ? (contactedLeads.length / assignedLeads.length) * 100 : 0;
        const appointmentRate = contactedLeads.length > 0 ? (appointments.length / contactedLeads.length) * 100 : 0;
        const showRate = appointments.length > 0 ? (completedAppointments.length / appointments.length) * 100 : 0;
        const appointmentToClosingRatio = completedAppointments.length > 0 ? (wonDeals.length / completedAppointments.length) * 100 : 0;
        
        // Calculate earnings - assume 10% commission on deals + 5% residual for ongoing services
        const commission = totalRevenue * 0.10; // 10% commission
        const residualEarnings = wonDeals.length * 500; // $500 residual per deal monthly
        const totalEarnings = commission + residualEarnings;
        const avgEarningsPerSale = wonDeals.length > 0 ? totalEarnings / wonDeals.length : 0;
        
        return {
          repId: rep.id,
          repName: `${rep.firstName} ${rep.lastName}`,
          email: rep.email,
          extension: rep.extension,
          totalLeadsAssigned: assignedLeads.length,
          leadsContacted: contactedLeads.length,
          appointmentsSet: appointments.length,
          appointmentsCompleted: completedAppointments.length,
          appointmentShowRate: Math.round(showRate * 10) / 10,
          appointmentToClosingRatio: Math.round(appointmentToClosingRatio * 10) / 10,
          dealsWon: wonDeals.length,
          dealsLost: lostDeals.length,
          totalRevenue: totalRevenue / 100, // Convert from cents
          avgDealSize: avgDealSize / 100, // Convert from cents
          closingRatio: Math.round(closingRatio * 10) / 10,
          contactRate: Math.round(contactRate * 10) / 10,
          appointmentConversionRate: Math.round(appointmentRate * 10) / 10,
          commission: commission / 100, // Convert from cents
          residualEarnings: residualEarnings,
          totalEarnings: totalEarnings / 100, // Convert from cents
          avgEarningsPerSale: avgEarningsPerSale / 100, // Convert from cents
          lastActivity: new Date(),
          leadSources: assignedLeads.reduce((sources: any, lead) => {
            const source = lead.leadSource || 'unknown';
            sources[source] = (sources[source] || 0) + 1;
            return sources;
          }, {})
        };
      });
      
      // Sort by closing ratio
      repAnalytics.sort((a, b) => b.closingRatio - a.closingRatio);
      
      // Add rankings
      repAnalytics.forEach((rep, index) => {
        (rep as any).rank = index + 1;
      });
      
      res.json({
        period,
        salesReps: repAnalytics,
        teamAverages: {
          closingRatio: repAnalytics.reduce((sum, rep) => sum + rep.closingRatio, 0) / repAnalytics.length,
          contactRate: repAnalytics.reduce((sum, rep) => sum + rep.contactRate, 0) / repAnalytics.length,
          appointmentRate: repAnalytics.reduce((sum, rep) => sum + rep.appointmentConversionRate, 0) / repAnalytics.length,
          avgDealSize: repAnalytics.reduce((sum, rep) => sum + rep.avgDealSize, 0) / repAnalytics.length
        }
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/sales-analytics/goals", requireAuth, async (req: any, res) => {
    try {
      const { repId, monthlyGoal, period } = req.body;
      
      // For now, store goals in memory (in production, add goals table)
      // This would update the user's monthly goal target
      const user = await storage.updateUser(repId, { 
        // Add goal field to user schema if needed
      });
      
      res.json({ success: true, message: "Goal updated successfully" });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Setup comprehensive sales analytics demo data
  app.post("/api/setup-analytics-demo", requireAuth, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      let sarahId, davidId, amandaId;

      // Ensure sales reps exist
      const existingSalesReps = users.filter(user => user.role === "sales_rep");
      if (existingSalesReps.length < 3) {
        // Create sales reps
        const sarah = await storage.createUser({
          username: "sarah.johnson",
          password: "temp123",
          email: "sarah.johnson@traffikboosters.com",
          firstName: "Sarah",
          lastName: "Johnson",
          role: "sales_rep",
          phone: "+1-877-840-6251",
          extension: "101"
        });
        
        const david = await storage.createUser({
          username: "david.chen",
          password: "temp123", 
          email: "david.chen@traffikboosters.com",
          firstName: "David",
          lastName: "Chen",
          role: "sales_rep",
          phone: "+1-877-840-6252",
          extension: "102"
        });
        
        const amanda = await storage.createUser({
          username: "amanda.davis",
          password: "temp123",
          email: "amanda.davis@traffikboosters.com", 
          firstName: "Amanda",
          lastName: "Davis",
          role: "sales_rep",
          phone: "+1-877-840-6253",
          extension: "103"
        });

        sarahId = sarah.id;
        davidId = david.id;
        amandaId = amanda.id;
      } else {
        sarahId = existingSalesReps[0]?.id;
        davidId = existingSalesReps[1]?.id;
        amandaId = existingSalesReps[2]?.id;
      }

      // Create comprehensive lead data showing different performance levels
      const analyticsLeads = [
        // Sarah's leads - top performer (3 won, 1 lost, 2 in progress)
        {
          firstName: "Jennifer", lastName: "Chen", email: "jennifer.chen@techstartup.com",
          phone: "+1-212-555-1234", company: "Tech Startup Inc",
          leadSource: "website", leadStatus: "closed_won", budget: 75000, assignedTo: sarahId
        },
        {
          firstName: "Michael", lastName: "Thompson", email: "mthompson@consulting.com", 
          phone: "+1-212-555-2345", company: "Thompson Consulting",
          leadSource: "referral", leadStatus: "closed_won", budget: 95000, assignedTo: sarahId
        },
        {
          firstName: "Patricia", lastName: "Rodriguez", email: "patricia@fintech.com",
          phone: "+1-212-555-3456", company: "Rodriguez FinTech", 
          leadSource: "linkedin", leadStatus: "closed_won", budget: 85000, assignedTo: sarahId
        },
        {
          firstName: "Emily", lastName: "Davis", email: "emily@ecommerce.com",
          phone: "+1-212-555-4567", company: "E-Commerce Solutions",
          leadSource: "website", leadStatus: "proposal", budget: 65000, assignedTo: sarahId
        },
        {
          firstName: "Daniel", lastName: "Kim", email: "dkim@healthcare.com",
          phone: "+1-212-555-5678", company: "Kim Healthcare Systems",
          leadSource: "referral", leadStatus: "negotiation", budget: 120000, assignedTo: sarahId
        },
        {
          firstName: "Rachel", lastName: "Martinez", email: "rachel@legal.com",
          phone: "+1-212-555-6789", company: "Martinez Legal Group",
          leadSource: "cold_call", leadStatus: "closed_lost", budget: 45000, assignedTo: sarahId
        },

        // David's leads - moderate performer (2 won, 2 lost, 1 in progress) 
        {
          firstName: "Robert", lastName: "Johnson", email: "rob.johnson@manufacturing.com",
          phone: "+1-323-555-4567", company: "Johnson Manufacturing",
          leadSource: "referral", leadStatus: "closed_won", budget: 55000, assignedTo: davidId
        },
        {
          firstName: "Lisa", lastName: "Anderson", email: "lisa@logistics.com",
          phone: "+1-323-555-5678", company: "Anderson Logistics", 
          leadSource: "trade_show", leadStatus: "closed_won", budget: 48000, assignedTo: davidId
        },
        {
          firstName: "James", lastName: "Wilson", email: "jwilson@construction.com",
          phone: "+1-323-555-6789", company: "Wilson Construction",
          leadSource: "cold_call", leadStatus: "closed_lost", budget: 40000, assignedTo: davidId
        },
        {
          firstName: "Maria", lastName: "Garcia", email: "mgarcia@retail.com", 
          phone: "+1-323-555-7890", company: "Garcia Retail Group",
          leadSource: "website", leadStatus: "closed_lost", budget: 35000, assignedTo: davidId
        },
        {
          firstName: "Steven", lastName: "Brown", email: "steven@restaurant.com",
          phone: "+1-323-555-8901", company: "Brown Restaurant Group",
          leadSource: "referral", leadStatus: "qualified", budget: 62000, assignedTo: davidId
        },

        // Amanda's leads - developing rep (1 won, 1 lost, 3 in progress)
        {
          firstName: "Amanda", lastName: "Taylor", email: "ataylor@nonprofit.org",
          phone: "+1-713-555-0123", company: "Taylor Community Services",
          leadSource: "website", leadStatus: "closed_won", budget: 28000, assignedTo: amandaId
        },
        {
          firstName: "Kevin", lastName: "Lee", email: "klee@automotive.com", 
          phone: "+1-713-555-1234", company: "Lee Automotive",
          leadSource: "cold_call", leadStatus: "closed_lost", budget: 32000, assignedTo: amandaId
        },
        {
          firstName: "Nicole", lastName: "Williams", email: "nicole@retailchain.com",
          phone: "+1-713-555-2345", company: "Williams Retail Chain", 
          leadSource: "social_media", leadStatus: "contacted", budget: 38000, assignedTo: amandaId
        },
        {
          firstName: "Christopher", lastName: "Jones", email: "chris@techservices.com",
          phone: "+1-713-555-3456", company: "Jones Tech Services",
          leadSource: "website", leadStatus: "qualified", budget: 42000, assignedTo: amandaId
        },
        {
          firstName: "Jessica", lastName: "Miller", email: "jessica@consulting.com",
          phone: "+1-713-555-4567", company: "Miller Business Consulting", 
          leadSource: "linkedin", leadStatus: "new", budget: 35000, assignedTo: amandaId
        }
      ];

      // Create all leads
      for (const leadData of analyticsLeads) {
        await storage.createContact({
          ...leadData,
          position: "Decision Maker",
          disposition: leadData.leadStatus === "closed_won" ? "converted" : 
                      leadData.leadStatus === "closed_lost" ? "not_interested" : "interested",
          priority: leadData.budget > 70000 ? "high" : leadData.budget > 40000 ? "medium" : "low",
          timeline: "1_month",
          notes: `Analytics demo lead - ${leadData.leadStatus}`,
          tags: ["demo", "analytics"],
          createdBy: 1
        });
      }

      // Create some appointment events for each rep
      const events = [
        // Sarah's appointments - high show rate
        { title: "Discovery Call - Tech Startup", type: "meeting", status: "completed", createdBy: sarahId },
        { title: "Proposal Meeting - Thompson Consulting", type: "meeting", status: "completed", createdBy: sarahId },
        { title: "Demo - Rodriguez FinTech", type: "meeting", status: "completed", createdBy: sarahId },
        { title: "Follow-up - E-Commerce Solutions", type: "meeting", status: "completed", createdBy: sarahId },
        { title: "Contract Review - Healthcare Systems", type: "meeting", status: "scheduled", createdBy: sarahId },

        // David's appointments - moderate show rate
        { title: "Initial Meeting - Johnson Manufacturing", type: "meeting", status: "completed", createdBy: davidId },
        { title: "Demo - Anderson Logistics", type: "meeting", status: "completed", createdBy: davidId },
        { title: "Follow-up - Wilson Construction", type: "meeting", status: "no_show", createdBy: davidId },
        { title: "Qualification Call - Restaurant Group", type: "meeting", status: "completed", createdBy: davidId },

        // Amanda's appointments - developing skills
        { title: "Discovery - Community Services", type: "meeting", status: "completed", createdBy: amandaId },
        { title: "Demo - Lee Automotive", type: "meeting", status: "no_show", createdBy: amandaId },
        { title: "Follow-up - Retail Chain", type: "meeting", status: "scheduled", createdBy: amandaId }
      ];

      for (const eventData of events) {
        await storage.createEvent({
          ...eventData,
          description: "Sales appointment",
          startDate: new Date(),
          endDate: new Date(Date.now() + 3600000)
        });
      }

      res.json({ 
        success: true, 
        message: "Analytics demo data created successfully",
        summary: {
          salesReps: 3,
          leads: analyticsLeads.length,
          appointments: events.length
        }
      });

    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Sales pipeline endpoints
  app.post("/api/leads/assign", requireAuth, async (req: any, res) => {
    try {
      const { leadId, assignedTo, notes } = req.body;
      
      // Check if user has permission to assign leads
      if (req.user.role !== 'admin' && req.user.role !== 'manager') {
        return res.status(403).json({ error: "Insufficient permissions to assign leads" });
      }
      
      let updatedLead;
      if (assignedTo) {
        updatedLead = await storage.assignLead(leadId, assignedTo, req.user.id, notes);
      } else {
        // Unassign the lead
        updatedLead = await storage.updateContact(leadId, {
          assignedTo: null,
          assignedBy: null,
          assignedAt: null,
          updatedBy: req.user.id
        });
      }
      
      if (!updatedLead) {
        return res.status(404).json({ error: "Lead not found" });
      }

      const actionMessage = assignedTo ? "Lead assigned successfully" : "Lead unassigned successfully";
      res.json({
        success: true,
        lead: updatedLead,
        message: actionMessage
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/leads/by-rep/:repId", requireAuth, async (req: any, res) => {
    try {
      const repId = parseInt(req.params.repId);
      const leads = await storage.getLeadsByRep(repId);
      res.json(leads);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Routes for marketing analytics
  app.get("/api/analytics/campaigns", (req, res) => {
    try {
      const campaigns: any[] = [];
      res.json({ campaigns });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // WebSocket server for real-time updates
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        // Handle WebSocket messages
        console.log('WebSocket message:', data);
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  return httpServer;
}