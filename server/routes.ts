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
      const validation = insertCompanySchema.omit({ id: true }).safeParse(req.body);
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
      const validation = insertContactSchema.omit({ id: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
      }
      const contact = await storage.createContact(validation.data);
      
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
      const validation = insertEventSchema.omit({ id: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
      }
      const event = await storage.createEvent(validation.data);
      
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
      const validation = insertFileSchema.omit({ id: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
      }
      const file = await storage.createFile(validation.data);
      
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
      const validation = insertAutomationSchema.omit({ id: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
      }
      const automation = await storage.createAutomation(validation.data);
      
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
      const validation = insertScrapingJobSchema.omit({ id: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
      }
      const job = await storage.createScrapingJob(validation.data);
      
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
      const validation = insertCallLogSchema.omit({ id: true }).safeParse(req.body);
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