import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertUserSchema, insertContactSchema, insertEventSchema, insertFileSchema, insertAutomationSchema, insertScrapingJobSchema, insertChatMessageSchema, insertChatConversationSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket for real-time features
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        // Broadcast to all connected clients
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
        });
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  // Auth middleware (simplified for demo)
  const requireAuth = (req: any, res: any, next: any) => {
    // In production, validate JWT token
    req.userId = 1; // Default to admin user
    next();
  };

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // In production, generate JWT token
      res.json({ user: { ...user, password: undefined }, token: "mock-jwt-token" });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(400).json({ message: "Registration failed" });
    }
  });

  // Users routes
  app.get("/api/users/me", requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Companies routes
  app.get("/api/companies", async (req, res) => {
    try {
      const companies = await storage.getAllCompanies();
      res.json(companies);
    } catch (error) {
      res.status(500).json({ message: "Failed to get companies" });
    }
  });

  // Contacts routes
  app.get("/api/contacts", requireAuth, async (req, res) => {
    try {
      const contacts = await storage.getAllContacts();
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ message: "Failed to get contacts" });
    }
  });

  app.post("/api/contacts", requireAuth, async (req: any, res) => {
    try {
      const contactData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact({ ...contactData, createdBy: req.userId });
      res.json(contact);
    } catch (error) {
      res.status(400).json({ message: "Failed to create contact" });
    }
  });

  app.put("/api/contacts/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertContactSchema.partial().parse(req.body);
      const contact = await storage.updateContact(id, updates);
      
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      
      res.json(contact);
    } catch (error) {
      res.status(400).json({ message: "Failed to update contact" });
    }
  });

  app.delete("/api/contacts/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteContact(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Contact not found" });
      }
      
      res.json({ message: "Contact deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete contact" });
    }
  });

  app.get("/api/contacts/search", requireAuth, async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query required" });
      }
      
      const contacts = await storage.searchContacts(query);
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ message: "Search failed" });
    }
  });

  // Events routes
  app.get("/api/events", requireAuth, async (req, res) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to get events" });
    }
  });

  app.post("/api/events", requireAuth, async (req: any, res) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent({ ...eventData, createdBy: req.userId });
      res.json(event);
    } catch (error) {
      res.status(400).json({ message: "Failed to create event" });
    }
  });

  app.put("/api/events/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertEventSchema.partial().parse(req.body);
      const event = await storage.updateEvent(id, updates);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(event);
    } catch (error) {
      res.status(400).json({ message: "Failed to update event" });
    }
  });

  app.delete("/api/events/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteEvent(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json({ message: "Event deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // Files routes
  app.get("/api/files", requireAuth, async (req, res) => {
    try {
      const files = await storage.getAllFiles();
      res.json(files);
    } catch (error) {
      res.status(500).json({ message: "Failed to get files" });
    }
  });

  app.post("/api/files", requireAuth, async (req: any, res) => {
    try {
      const fileData = insertFileSchema.parse(req.body);
      const file = await storage.createFile({ ...fileData, uploadedBy: req.userId });
      res.json(file);
    } catch (error) {
      res.status(400).json({ message: "Failed to create file" });
    }
  });

  // Automations routes
  app.get("/api/automations", requireAuth, async (req, res) => {
    try {
      const automations = await storage.getAllAutomations();
      res.json(automations);
    } catch (error) {
      res.status(500).json({ message: "Failed to get automations" });
    }
  });

  app.post("/api/automations", requireAuth, async (req: any, res) => {
    try {
      const automationData = insertAutomationSchema.parse(req.body);
      const automation = await storage.createAutomation({ ...automationData, createdBy: req.userId });
      res.json(automation);
    } catch (error) {
      res.status(400).json({ message: "Failed to create automation" });
    }
  });

  // Scraping jobs routes
  app.get("/api/scraping-jobs", requireAuth, async (req, res) => {
    try {
      const jobs = await storage.getAllScrapingJobs();
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to get scraping jobs" });
    }
  });

  app.post("/api/scraping-jobs", requireAuth, async (req: any, res) => {
    try {
      const jobData = insertScrapingJobSchema.parse(req.body);
      const job = await storage.createScrapingJob({ ...jobData, createdBy: req.userId });
      res.json(job);
    } catch (error) {
      res.status(400).json({ message: "Failed to create scraping job" });
    }
  });

  // Chat Messages
  app.get("/api/chat/messages/:contactId", requireAuth, async (req, res) => {
    try {
      const contactId = parseInt(req.params.contactId);
      const messages = await storage.getChatMessages(contactId);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/chat/messages", requireAuth, async (req: any, res) => {
    try {
      const validatedData = insertChatMessageSchema.parse(req.body);
      const message = await storage.createChatMessage(validatedData);
      
      // Broadcast message to WebSocket clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'chat_message',
            data: message
          }));
        }
      });
      
      res.status(201).json(message);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/chat/messages/:id/read", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const message = await storage.markMessageAsRead(id);
      
      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }
      
      res.json(message);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Chat Conversations
  app.get("/api/chat/conversations", requireAuth, async (req, res) => {
    try {
      const conversations = await storage.getAllConversations();
      res.json(conversations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/chat/conversations/:contactId", requireAuth, async (req, res) => {
    try {
      const contactId = parseInt(req.params.contactId);
      const conversation = await storage.getConversation(contactId);
      
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      
      res.json(conversation);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/chat/conversations", requireAuth, async (req: any, res) => {
    try {
      const validatedData = insertChatConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(validatedData);
      res.status(201).json(conversation);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/chat/conversations/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertChatConversationSchema.partial().parse(req.body);
      const conversation = await storage.updateConversation(id, validatedData);
      
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      
      res.json(conversation);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Lead capture endpoint for website widget
  app.post("/api/leads", async (req, res) => {
    try {
      const { name, email, company, phone, message, source, url } = req.body;
      
      // Create lead as a contact in the CRM
      const leadContact = await storage.createContact({
        firstName: name.split(' ')[0] || name,
        lastName: name.split(' ').slice(1).join(' ') || '',
        email: email,
        phone: phone || null,
        company: company || null,
        position: null,
        leadStatus: "new",
        notes: `Website lead from ${url || 'unknown page'}\n\nMessage: ${message || 'No message provided'}`,
        tags: ["website-lead", "traffik-boosters"],
        createdBy: 1 // System user
      });

      // Create initial conversation
      const conversation = await storage.createConversation({
        contactId: leadContact.id,
        status: "active",
        priority: "normal",
        notes: `Lead from website: ${url || 'unknown page'}`
      });

      // Send welcome message
      if (message) {
        await storage.createChatMessage({
          contactId: leadContact.id,
          senderId: null,
          message: message,
          type: "text",
          isFromContact: true
        });
      }

      // Broadcast new lead notification to all connected CRM users
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'new_lead',
            data: leadContact,
            source: source || 'website',
            timestamp: new Date().toISOString()
          }));
        }
      });

      res.status(201).json({ 
        success: true, 
        leadId: leadContact.id,
        message: "Lead captured successfully" 
      });
    } catch (error: any) {
      console.error("Lead capture error:", error);
      res.status(500).json({ error: "Failed to capture lead" });
    }
  });

  // Campaign management routes
  app.get("/api/campaigns", async (req, res) => {
    try {
      const campaigns = []; // Mock empty campaigns for now
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      res.status(500).json({ error: "Failed to fetch campaigns" });
    }
  });

  app.post("/api/campaigns", async (req, res) => {
    try {
      const campaignData = req.body;
      // Mock campaign creation
      const campaign = {
        id: Date.now(),
        ...campaignData,
        createdBy: 1,
        status: campaignData.status || "draft",
        createdAt: new Date(),
        spent: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        leads: 0
      };
      res.status(201).json(campaign);
    } catch (error) {
      console.error("Error creating campaign:", error);
      res.status(500).json({ error: "Failed to create campaign" });
    }
  });

  app.patch("/api/campaigns/:id", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      const updates = req.body;
      
      // Mock campaign update
      const updatedCampaign = {
        id: campaignId,
        ...updates,
        updatedAt: new Date()
      };
      
      res.json(updatedCampaign);
    } catch (error) {
      console.error("Error updating campaign:", error);
      res.status(500).json({ error: "Failed to update campaign" });
    }
  });

  // Lead allocation routes
  app.get("/api/lead-allocations", async (req, res) => {
    try {
      const allocations = []; // Mock empty allocations for now
      res.json(allocations);
    } catch (error) {
      console.error("Error fetching lead allocations:", error);
      res.status(500).json({ error: "Failed to fetch lead allocations" });
    }
  });

  app.post("/api/lead-allocations", async (req, res) => {
    try {
      const allocationData = req.body;
      // Mock allocation creation
      const allocation = {
        id: Date.now(),
        ...allocationData,
        assignedAt: new Date(),
        status: allocationData.status || "assigned"
      };
      res.status(201).json(allocation);
    } catch (error) {
      console.error("Error creating lead allocation:", error);
      res.status(500).json({ error: "Failed to create lead allocation" });
    }
  });

  // Users route for team member selection
  app.get("/api/users", async (req, res) => {
    try {
      const users = [
        { id: 1, firstName: "Admin", lastName: "User", role: "admin", email: "admin@example.com" },
        { id: 2, firstName: "John", lastName: "Manager", role: "manager", email: "john@example.com" },
        { id: 3, firstName: "Sarah", lastName: "Sales", role: "sales_rep", email: "sarah@example.com" },
        { id: 4, firstName: "Mike", lastName: "Agent", role: "sales_rep", email: "mike@example.com" }
      ];
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  return httpServer;
}
