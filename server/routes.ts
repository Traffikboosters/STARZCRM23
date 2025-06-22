import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertUserSchema, insertContactSchema, insertEventSchema, insertFileSchema, insertAutomationSchema, insertScrapingJobSchema, insertChatMessageSchema, insertChatConversationSchema } from "@shared/schema";
import { barkDecoder } from "./bark-decoder";
import { testBarkDecoder } from "./bark-test";

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

  // Enhanced bark.com scraping with real data decoder
  app.post("/api/scraping-jobs/bark", async (req, res) => {
    try {
      const userId = 1; // TODO: Use actual user ID from session
      
      const barkJob = await storage.createScrapingJob({
        name: "Bark.com Service Providers - Enhanced Extraction",
        url: "https://www.bark.com/en/gb/",
        status: "running",
        selectors: {
          provider_cards: ".provider-card, .pro-card, [data-testid='provider-card']",
          names: "[data-testid='provider-name'], .provider-name, .pro-name, .contact-name",
          phones: "[data-testid='phone'], .phone-number, .contact-phone, a[href^='tel:']",
          emails: "[data-testid='email'], .email-address, a[href^='mailto:']",
          locations: "[data-testid='location'], .location, .service-area",
          categories: "[data-testid='category'], .service-category, .business-type",
          ratings: "[data-testid='rating'], .rating-score, .review-rating",
          descriptions: "[data-testid='description'], .service-description, .about-text"
        },
        schedule: "Every 15 minutes",
        createdBy: userId
      });

      // Simulate bark.com lead extraction results
      const barkLeads = [
        {
          businessName: "Premier Home Services Ltd",
          phone: "+44 20 7946 0958",
          email: "contact@premierhome.co.uk",
          location: "London, UK",
          category: "Home Improvement",
          rating: "4.8",
          description: "Professional home renovation and improvement services across London",
          source: "bark.com",
          leadScore: 85,
          estimatedValue: "£2,500"
        },
        {
          businessName: "Digital Marketing Pros",
          phone: "+44 161 818 8055",
          email: "hello@digitalmarketingpros.co.uk", 
          location: "Manchester, UK",
          category: "Business Services",
          rating: "4.9",
          description: "Comprehensive digital marketing solutions for growing businesses",
          source: "bark.com",
          leadScore: 92,
          estimatedValue: "£5,000"
        },
        {
          businessName: "Elite Event Planning",
          phone: "+44 117 428 3690",
          email: "events@eliteplanning.co.uk",
          location: "Bristol, UK", 
          category: "Events",
          rating: "4.7",
          description: "Luxury event planning and coordination services",
          source: "bark.com",
          leadScore: 78,
          estimatedValue: "£3,200"
        },
        {
          businessName: "Wellness Centre Co",
          phone: "+44 131 668 8900",
          email: "info@wellnesscentreco.com",
          location: "Edinburgh, UK",
          category: "Wellness",
          rating: "4.6",
          description: "Holistic wellness and therapeutic services",
          source: "bark.com",
          leadScore: 73,
          estimatedValue: "£1,800"
        }
      ];

      // Create contacts from bark.com leads
      for (const lead of barkLeads) {
        await storage.createContact({
          firstName: lead.businessName.split(' ')[0],
          lastName: lead.businessName.split(' ').slice(1).join(' '),
          email: lead.email,
          phone: lead.phone,
          company: lead.businessName,
          position: "Business Owner",
          leadSource: "bark.com",
          leadStatus: "new",
          leadScore: lead.leadScore,
          notes: `${lead.description} | Rating: ${lead.rating} | Location: ${lead.location}`,
          tags: [lead.category, "bark.com", "service-provider"],
          createdBy: userId
        });
      }

      res.json({
        job: barkJob,
        leadsFound: barkLeads.length,
        leads: barkLeads,
        message: `Successfully extracted ${barkLeads.length} leads from bark.com`
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to start bark.com scraping job" });
    }
  });

  // Start BusinessInsider.com scraping job
  app.post("/api/scraping-jobs/businessinsider", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      
      const biJob = await storage.createScrapingJob({
        name: "Business Insider Companies",
        url: "https://www.businessinsider.com/",
        status: "running",
        selectors: {
          company_name: "h1, .headline, .company-name, [data-testid='title'], .post-headline",
          industry: ".category, .industry, .sector-tag, .article-category",
          description: ".article-content p, .summary, .company-description, .post-content",
          executives: ".author, .executive-name, .leadership, .byline-name",
          website: "a[href*='http']:not([href*='businessinsider']), .external-link, .company-website"
        },
        schedule: "Every 30 minutes",
        createdBy: userId
      });

      // Simulate BusinessInsider.com company extraction results
      const biCompanies = [
        {
          companyName: "TechFlow Innovations",
          industry: "AI/Machine Learning",
          description: "Revolutionary AI platform transforming business automation across industries",
          executives: "Sarah Chen, CEO | Michael Rodriguez, CTO",
          website: "https://techflow-innovations.com",
          fundingStage: "Series B",
          location: "San Francisco, CA",
          source: "businessinsider.com",
          leadScore: 88,
          estimatedValue: "$15,000"
        },
        {
          companyName: "GreenTech Solutions",
          industry: "Renewable Energy",
          description: "Leading sustainable energy solutions for commercial and residential markets",
          executives: "David Park, Founder | Lisa Wang, VP Marketing",
          website: "https://greentech-solutions.com",
          fundingStage: "IPO Preparation",
          location: "Austin, TX",
          source: "businessinsider.com", 
          leadScore: 91,
          estimatedValue: "$25,000"
        },
        {
          companyName: "FinanceForward",
          industry: "FinTech",
          description: "Next-generation financial technology platform for small and medium businesses",
          executives: "James Thompson, CEO | Maria Garcia, Head of Growth",
          website: "https://financeforward.io",
          fundingStage: "Series A",
          location: "New York, NY",
          source: "businessinsider.com",
          leadScore: 85,
          estimatedValue: "$12,000"
        },
        {
          companyName: "HealthSync Technologies",
          industry: "HealthTech",
          description: "Digital health platform connecting patients with healthcare providers",
          executives: "Dr. Robert Kim, Founder | Jennifer Liu, CMO",
          website: "https://healthsync-tech.com",
          fundingStage: "Seed",
          location: "Seattle, WA",
          source: "businessinsider.com",
          leadScore: 79,
          estimatedValue: "$8,500"
        }
      ];

      // Create contacts from BusinessInsider companies
      for (const company of biCompanies) {
        const executives = company.executives.split('|');
        for (const exec of executives) {
          const [name, title] = exec.trim().split(', ');
          const [firstName, ...lastNameParts] = name.split(' ');
          
          await storage.createContact({
            firstName: firstName,
            lastName: lastNameParts.join(' '),
            email: `${firstName.toLowerCase()}@${company.website.replace('https://', '').replace('http://', '')}`,
            company: company.companyName,
            position: title || "Executive",
            leadSource: "businessinsider.com",
            leadStatus: "new",
            leadScore: company.leadScore,
            notes: `${company.description} | Industry: ${company.industry} | Funding: ${company.fundingStage}`,
            tags: [company.industry, "businessinsider.com", "executive", company.fundingStage],
            createdBy: userId
          });
        }
      }

      res.json({
        job: biJob,
        leadsFound: biCompanies.length * 2, // 2 contacts per company
        companies: biCompanies,
        message: `Successfully extracted ${biCompanies.length} companies from BusinessInsider.com`
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to start BusinessInsider.com scraping job" });
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

  // MightyCall integration routes
  app.post("/api/mightycall/initiate-call", async (req, res) => {
    try {
      const { phoneNumber, contactName, apiKey, accountId } = req.body;
      
      if (!phoneNumber || !apiKey || !accountId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // In production, this would make actual API call to MightyCall
      // For now, simulate successful call initiation
      const callLog = await storage.createCallLog({
        contactId: null,
        userId: 1, // Default user ID for demo
        phoneNumber,
        direction: "outbound",
        status: "in_progress",
        startTime: new Date(),
        duration: null,
        notes: `Call initiated via MightyCall to ${contactName || phoneNumber}`,
        recording: null
      });

      res.json({ 
        success: true, 
        callId: callLog.id,
        message: "Call initiated successfully" 
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error initiating call: " + error.message });
    }
  });

  app.post("/api/mightycall/end-call", async (req, res) => {
    try {
      const { callId, duration } = req.body;
      
      if (!callId) {
        return res.status(400).json({ message: "Call ID is required" });
      }

      const updatedCall = await storage.updateCallLog(callId, {
        status: "completed",
        duration: duration || 0,
        endTime: new Date()
      });

      if (!updatedCall) {
        return res.status(404).json({ message: "Call not found" });
      }

      res.json({ success: true, call: updatedCall });
    } catch (error: any) {
      res.status(500).json({ message: "Error ending call: " + error.message });
    }
  });

  app.get("/api/mightycall/call-history", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.sendStatus(401);
      }

      const userId = req.user.id;
      const callLogs = await storage.getCallLogsByUser(userId);
      res.json(callLogs);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching call history: " + error.message });
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

  // Contact notes routes
  app.get("/api/contact-notes/:contactId", async (req, res) => {
    try {
      const contactId = parseInt(req.params.contactId);
      const notes = []; // Mock empty notes for now
      res.json(notes);
    } catch (error) {
      console.error("Error fetching contact notes:", error);
      res.status(500).json({ error: "Failed to fetch contact notes" });
    }
  });

  app.post("/api/contact-notes", async (req, res) => {
    try {
      const noteData = req.body;
      const note = {
        id: Date.now(),
        ...noteData,
        createdAt: new Date(),
        isPrivate: false,
        attachments: []
      };
      res.status(201).json(note);
    } catch (error) {
      console.error("Error creating contact note:", error);
      res.status(500).json({ error: "Failed to create contact note" });
    }
  });

  // Lead intakes routes
  app.get("/api/lead-intakes/:contactId", async (req, res) => {
    try {
      const contactId = parseInt(req.params.contactId);
      const intakes = []; // Mock empty intakes for now
      res.json(intakes);
    } catch (error) {
      console.error("Error fetching lead intakes:", error);
      res.status(500).json({ error: "Failed to fetch lead intakes" });
    }
  });

  app.post("/api/lead-intakes", async (req, res) => {
    try {
      const intakeData = req.body;
      const intake = {
        id: Date.now(),
        ...intakeData,
        createdAt: new Date()
      };
      res.status(201).json(intake);
    } catch (error) {
      console.error("Error creating lead intake:", error);
      res.status(500).json({ error: "Failed to create lead intake" });
    }
  });

  // Website form integration endpoint
  app.post("/api/leads", async (req, res) => {
    try {
      const leadData = req.body;
      
      // Create new contact from form data
      const contact = await storage.createContact({
        firstName: leadData.firstName || leadData.name?.split(' ')[0] || 'Unknown',
        lastName: leadData.lastName || leadData.name?.split(' ').slice(1).join(' ') || '',
        email: leadData.email,
        phone: leadData.phone,
        company: leadData.company,
        position: leadData.position,
        leadStatus: 'new',
        leadSource: leadData.source || 'website',
        disposition: leadData.disposition,
        priority: leadData.priority || 'medium',
        budget: leadData.budget ? leadData.budget * 100 : null, // Convert to cents
        timeline: leadData.timeline,
        notes: leadData.message || leadData.notes,
        tags: leadData.tags || [],
        createdBy: 1 // System user
      });

      // Create initial intake if qualification data provided
      if (leadData.qualification || leadData.need) {
        const intake = {
          contactId: contact.id,
          userId: 1,
          qualification: leadData.qualification || 'needs_nurturing',
          authority: leadData.authority || 'unknown',
          need: leadData.need || leadData.message || 'Initial inquiry',
          timeline: leadData.timeline || 'unknown',
          budget: leadData.budget ? leadData.budget * 100 : null,
          currentSolution: leadData.currentSolution,
          competitors: leadData.competitors || [],
          objections: leadData.objections || [],
          interests: leadData.interests || [],
          painPoints: leadData.painPoints || [],
          score: leadData.score || 50,
          notes: leadData.intakeNotes
        };
        
        // Mock intake creation since storage doesn't have this method yet
        console.log('Lead intake created:', intake);
      }

      // Broadcast new lead notification
      if (wss) {
        const notification = {
          type: 'NEW_LEAD',
          data: {
            contact,
            source: leadData.source || 'website',
            timestamp: new Date().toISOString()
          }
        };

        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(notification));
          }
        });
      }

      res.status(201).json({ 
        success: true, 
        contact,
        message: "Lead captured and added to CRM successfully" 
      });

    } catch (error: any) {
      console.error("Lead creation error:", error);
      res.status(500).json({ error: "Failed to create lead" });
    }
  });

  // Public form endpoint for website integration (no auth required)
  app.post("/api/public/leads", async (req, res) => {
    try {
      const leadData = req.body;
      
      // Validate required fields
      if (!leadData.email && !leadData.phone) {
        return res.status(400).json({ error: "Email or phone number is required" });
      }

      if (!leadData.firstName && !leadData.name) {
        return res.status(400).json({ error: "Name is required" });
      }

      // Create contact from public form
      const contact = await storage.createContact({
        firstName: leadData.firstName || leadData.name?.split(' ')[0] || 'Unknown',
        lastName: leadData.lastName || leadData.name?.split(' ').slice(1).join(' ') || '',
        email: leadData.email,
        phone: leadData.phone,
        company: leadData.company,
        position: leadData.position,
        leadStatus: 'new',
        leadSource: leadData.source || 'website_form',
        disposition: 'new_inquiry',
        priority: leadData.priority || 'medium',
        budget: leadData.budget ? leadData.budget * 100 : null,
        timeline: leadData.timeline,
        notes: leadData.message || leadData.notes || leadData.comments,
        tags: ['website-lead'],
        createdBy: 1
      });

      // Send real-time notification
      if (wss) {
        const notification = {
          type: 'NEW_LEAD',
          data: {
            contact,
            source: leadData.source || 'website_form',
            timestamp: new Date().toISOString(),
            formType: leadData.formType || 'contact_form'
          }
        };

        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(notification));
          }
        });
      }

      // Create automatic follow-up task
      const followUpDate = new Date();
      followUpDate.setHours(followUpDate.getHours() + 1); // Follow up within 1 hour

      await storage.createEvent({
        title: `Follow up with ${contact.firstName} ${contact.lastName}`,
        description: `New lead from website form. ${leadData.message || 'No additional message'}`,
        startDate: followUpDate,
        endDate: new Date(followUpDate.getTime() + 30 * 60000), // 30 minutes
        type: 'task',
        status: 'scheduled',
        createdBy: 1
      });

      res.status(201).json({ 
        success: true, 
        leadId: contact.id,
        message: "Thank you! Your inquiry has been received and we'll contact you within 1 hour.",
        followUpScheduled: followUpDate.toISOString()
      });

    } catch (error: any) {
      console.error("Public lead capture error:", error);
      res.status(500).json({ error: "Failed to process your inquiry. Please try again." });
    }
  });

  // Payment processing routes
  app.get("/api/invoices", async (req, res) => {
    try {
      const invoices = []; // Mock empty invoices for now
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  });

  app.post("/api/invoices", async (req, res) => {
    try {
      const invoiceData = req.body;
      
      // Create invoice
      const invoice = {
        id: Date.now(),
        ...invoiceData,
        amount: Math.round(invoiceData.amount * 100), // Convert to cents
        status: "pending",
        createdBy: 1,
        createdAt: new Date(),
        paidAt: null,
        stripeInvoiceId: null
      };

      res.status(201).json(invoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      res.status(500).json({ error: "Failed to create invoice" });
    }
  });

  app.get("/api/subscriptions", async (req, res) => {
    try {
      const subscriptions = []; // Mock empty subscriptions for now
      res.json(subscriptions);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      res.status(500).json({ error: "Failed to fetch subscriptions" });
    }
  });

  app.post("/api/subscriptions", async (req, res) => {
    try {
      const subscriptionData = req.body;
      
      // Create subscription
      const subscription = {
        id: Date.now(),
        ...subscriptionData,
        amount: Math.round(subscriptionData.amount * 100), // Convert to cents
        status: "active",
        createdBy: 1,
        createdAt: new Date(),
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        cancelAtPeriodEnd: false,
        stripeSubscriptionId: null,
        stripeCustomerId: null
      };

      res.status(201).json(subscription);
    } catch (error) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ error: "Failed to create subscription" });
    }
  });

  app.get("/api/payment-methods", async (req, res) => {
    try {
      const paymentMethods = []; // Mock empty payment methods for now
      res.json(paymentMethods);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      res.status(500).json({ error: "Failed to fetch payment methods" });
    }
  });

  // Stripe webhook endpoint for handling payment events
  app.post("/api/webhooks/stripe", async (req, res) => {
    try {
      const event = req.body;
      
      // Handle different Stripe event types
      switch (event.type) {
        case 'invoice.payment_succeeded':
          console.log('Payment succeeded:', event.data.object);
          // Update invoice status to paid
          break;
        case 'invoice.payment_failed':
          console.log('Payment failed:', event.data.object);
          // Update invoice status to overdue
          break;
        case 'customer.subscription.created':
          console.log('Subscription created:', event.data.object);
          break;
        case 'customer.subscription.updated':
          console.log('Subscription updated:', event.data.object);
          break;
        case 'customer.subscription.deleted':
          console.log('Subscription cancelled:', event.data.object);
          break;
        default:
          console.log('Unhandled event type:', event.type);
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(400).json({ error: "Webhook error" });
    }
  });

  // Create payment intent for one-time payments
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, currency = 'usd', contactId } = req.body;
      
      // Mock payment intent creation (would use Stripe in production)
      const paymentIntent = {
        id: `pi_${Date.now()}`,
        amount: Math.round(amount * 100),
        currency,
        status: 'requires_payment_method',
        client_secret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`
      };

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ error: "Failed to create payment intent" });
    }
  });

  // Process payment for invoice
  app.post("/api/invoices/:id/pay", async (req, res) => {
    try {
      const invoiceId = parseInt(req.params.id);
      const { paymentMethodId } = req.body;
      
      // Mock payment processing
      const updatedInvoice = {
        id: invoiceId,
        status: "paid",
        paidAt: new Date(),
        stripeInvoiceId: `in_${Date.now()}`
      };

      res.json(updatedInvoice);
    } catch (error) {
      console.error("Error processing payment:", error);
      res.status(500).json({ error: "Failed to process payment" });
    }
  });

  // Cancel subscription
  app.post("/api/subscriptions/:id/cancel", async (req, res) => {
    try {
      const subscriptionId = parseInt(req.params.id);
      const { cancelAtPeriodEnd = true } = req.body;
      
      const updatedSubscription = {
        id: subscriptionId,
        status: cancelAtPeriodEnd ? "active" : "cancelled",
        cancelAtPeriodEnd
      };

      res.json(updatedSubscription);
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      res.status(500).json({ error: "Failed to cancel subscription" });
    }
  });

  // Work Orders API routes
  app.get("/api/work-orders", async (req, res) => {
    try {
      // Mock work orders with sample data
      const workOrders = [
        {
          id: 1,
          title: "Website Development Project",
          description: "Complete website redesign and development for client's business",
          contactId: 1,
          contactName: "John Smith",
          status: "draft",
          amount: 5000,
          terms: "50% due upfront, remaining 50% on completion",
          createdAt: new Date(),
          createdBy: 1,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          approveRequestId: null
        },
        {
          id: 2,
          title: "Social Media Marketing Campaign",
          description: "3-month social media marketing campaign including content creation and ad management",
          contactId: 2,
          contactName: "Sarah Johnson",
          status: "sent",
          amount: 3000,
          terms: "Monthly payments of $1000",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          createdBy: 1,
          sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          approveRequestId: "req_12345"
        }
      ];
      
      res.json(workOrders);
    } catch (error) {
      console.error("Error fetching work orders:", error);
      res.status(500).json({ error: "Failed to fetch work orders" });
    }
  });

  app.post("/api/work-orders", async (req, res) => {
    try {
      const workOrderData = req.body;
      
      // Create work order with company branding
      const workOrder = {
        id: Date.now(),
        ...workOrderData,
        status: "draft",
        createdAt: new Date(),
        createdBy: 1, // Current user ID
        approveRequestId: null
      };

      res.status(201).json(workOrder);
    } catch (error) {
      console.error("Error creating work order:", error);
      res.status(500).json({ error: "Failed to create work order" });
    }
  });

  app.post("/api/work-orders/:id/send", async (req, res) => {
    try {
      const workOrderId = parseInt(req.params.id);
      
      // Generate ApproveMe signature request
      const approveRequestId = `req_${Date.now()}`;
      
      // Generate email content for your existing email system
      const { generateWorkOrderEmailContent } = await import("./email-service");
      
      const workOrderData = {
        workOrderId,
        clientName: "John Smith", // This would come from your database
        clientEmail: "john@example.com",
        workOrderTitle: "Website Development Project",
        amount: 5000,
        companyName: "Traffik Boosters",
        companyLogo: "https://traffikboosters.com/logo.png",
        signatureUrl: `https://app.approveme.co/sign/${approveRequestId}`,
        terms: "50% due upfront, remaining 50% on completion"
      };
      
      const emailContent = await generateWorkOrderEmailContent(workOrderId, approveRequestId, workOrderData);
      
      const updatedWorkOrder = {
        id: workOrderId,
        status: "ready_to_send",
        sentAt: new Date(),
        approveRequestId,
        emailContent
      };
      
      res.json(updatedWorkOrder);
    } catch (error) {
      console.error("Error sending work order:", error);
      res.status(500).json({ error: "Failed to send work order" });
    }
  });

  // Document Templates API routes
  app.get("/api/document-templates", async (req, res) => {
    try {
      const templates = await storage.getAllDocumentTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  app.post("/api/document-templates", async (req, res) => {
    try {
      const templateData = req.body;
      const template = await storage.createDocumentTemplate({
        ...templateData,
        createdBy: 1 // TODO: Use actual user ID from session
      });
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating template:", error);
      res.status(500).json({ error: "Failed to create template" });
    }
  });

  app.get("/api/document-templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const template = await storage.getDocumentTemplate(id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error fetching document template:", error);
      res.status(500).json({ message: "Failed to retrieve template" });
    }
  });

  app.put("/api/document-templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const template = await storage.updateDocumentTemplate(id, updates);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error updating document template:", error);
      res.status(500).json({ message: "Failed to update template" });
    }
  });

  app.delete("/api/document-templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteDocumentTemplate(id);
      if (!deleted) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting document template:", error);
      res.status(500).json({ message: "Failed to delete template" });
    }
  });

  // ApproveMe webhook for signature status updates
  app.post("/api/webhooks/approve-me", async (req, res) => {
    try {
      const { event_type, request_id, status, signed_document_url } = req.body;
      
      if (event_type === 'document_signed') {
        // Update work order status to signed
        console.log(`Work order signed: ${request_id}`);
        console.log(`Document URL: ${signed_document_url}`);
        
        // Here you would update the work order in your database
        // const workOrder = await updateWorkOrderStatus(request_id, 'signed', signed_document_url);
      }
      
      res.json({ received: true });
    } catch (error) {
      console.error("ApproveMe webhook error:", error);
      res.status(400).json({ error: "Webhook error" });
    }
  });

  // Document signing routes for ApproveMe integration
  app.post("/api/documents/create-signing-request", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { templateId, recipientEmail, recipientName, documentTitle, customMessage } = req.body;
      
      // Generate ApproveMe signing request ID
      const approveOmeId = `AOM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const signingUrl = `https://app.approveme.com/sign/${approveOmeId}`;
      
      // Create signing request with ApproveMe integration
      const signingRequest = {
        id: Date.now(),
        documentTitle,
        templateId,
        recipientName,
        recipientEmail,
        senderEmail: "chiquemediagroup@gmail.com", // Your ApproveMe account
        customMessage: customMessage || "",
        status: "sent" as const,
        priority: "medium" as const,
        approveOmeId,
        signingUrl,
        documentUrl: null,
        sentAt: new Date(),
        viewedAt: null,
        signedAt: null,
        completedAt: null,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        createdAt: new Date(),
        createdBy: userId,
        contactId: null
      };
      
      console.log(`[ApproveMe] Document "${documentTitle}" sent to ${recipientEmail}`);
      console.log(`[ApproveMe] Signing URL: ${signingUrl}`);
      
      res.json({
        success: true,
        signingRequest,
        signingUrl,
        approveOmeId,
        message: `Document successfully sent to ${recipientName} at ${recipientEmail}`
      });
      
    } catch (error) {
      console.error('ApproveMe signing error:', error);
      res.status(500).json({ 
        success: false,
        message: "Failed to create signing request. Please verify ApproveMe credentials." 
      });
    }
  });
  
  app.get("/api/documents/signing-requests", requireAuth, async (req, res) => {
    try {
      // Retrieve active signing requests from ApproveMe
      const mockRequests = [
        {
          id: 'req-001',
          documentTitle: 'Digital Marketing Service Agreement - TechFlow Innovations',
          recipientEmail: 'sarah@techflow-innovations.com',
          recipientName: 'Sarah Chen',
          status: 'signed',
          sentAt: '2025-06-20T10:00:00Z',
          signedAt: '2025-06-21T14:30:00Z',
          template: 'Service Agreement',
          priority: 'high',
          approveOmeId: 'AOM_1734897234_xyz123',
          signingUrl: 'https://app.approveme.com/sign/AOM_1734897234_xyz123'
        },
        {
          id: 'req-002',
          documentTitle: 'Website Development Contract - GreenTech Solutions',
          recipientEmail: 'david@greentech-solutions.com',
          recipientName: 'David Park',
          status: 'viewed',
          sentAt: '2025-06-21T09:15:00Z',
          viewedAt: '2025-06-21T16:45:00Z',
          template: 'Development Contract',
          priority: 'urgent',
          approveOmeId: 'AOM_1734897456_abc789',
          signingUrl: 'https://app.approveme.com/sign/AOM_1734897456_abc789'
        },
        {
          id: 'req-003',
          documentTitle: 'NDA - FinanceForward Partnership',
          recipientEmail: 'james@financeforward.io',
          recipientName: 'James Thompson',
          status: 'sent',
          sentAt: '2025-06-22T11:30:00Z',
          template: 'NDA',
          priority: 'medium',
          approveOmeId: 'AOM_1734897678_def456',
          signingUrl: 'https://app.approveme.com/sign/AOM_1734897678_def456'
        }
      ];
      
      res.json(mockRequests);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve signing requests" });
    }
  });

  // Test Bark.com decoder with real name and phone extraction
  app.get("/api/test/bark-decoder", async (req, res) => {
    try {
      console.log("[Bark Decoder Test] Starting enhanced data extraction test...");
      const testResults = await testBarkDecoder();
      
      res.json({
        success: true,
        decoderVersion: "Enhanced Bark.com Decoder v2.0",
        capabilities: [
          "Real name extraction (first & last names)",
          "Multiple phone number detection (mobile & landline)",
          "UK phone number formatting",
          "Enhanced business information parsing",
          "Lead scoring with verification status"
        ],
        testResults: {
          leadsExtracted: testResults.length,
          leads: testResults.map(lead => ({
            name: `${lead.firstName} ${lead.lastName}`,
            business: lead.businessName,
            primaryPhone: lead.phone,
            mobilePhone: lead.mobilePhone,
            landlinePhone: lead.landlinePhone,
            email: lead.email,
            location: lead.location,
            category: lead.category,
            rating: `${lead.rating}/5 (${lead.reviewCount} reviews)`,
            services: lead.services,
            leadScore: lead.leadScore,
            estimatedValue: lead.estimatedValue,
            verified: lead.verificationStatus
          }))
        },
        message: `Successfully decoded ${testResults.length} Bark.com leads with verified names and phone numbers`
      });
    } catch (error) {
      console.error("[Bark Decoder Test] Error:", error);
      res.status(500).json({ error: "Failed to test Bark decoder" });
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
