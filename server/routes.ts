import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { z } from "zod";
import { eq, desc, and, gte, lte, sql, asc } from "drizzle-orm";
import { 
  insertUserSchema, 
  insertContactSchema, 
  insertEventSchema, 
  insertFileSchema,
  insertAutomationSchema,
  insertScrapingJobSchema,
  insertCallLogSchema,
  insertWorkOrderSchema,
  type User,
  type Contact,
  type Event,
  type File,
  type CallLog,
  type WorkOrder
} from "../shared/schema";
import { storage } from "./storage";
import { mightyCallNativeAPI } from "./mightycall-native";
import { mightyCallSimplified } from "./mightycall-simplified";

function logAuditEvent(action: string, entityType: string, entityId: number, userId: number = 1, oldValues?: any, newValues?: any, description?: string) {
  console.log(`[AUDIT] ${new Date().toISOString()} - User ${userId} performed ${action} on ${entityType} ${entityId}${description ? ': ' + description : ''}`);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // MightyCall Native API status endpoint
  app.get("/api/mightycall/status", async (req, res) => {
    try {
      const status = await mightyCallNativeAPI.getAccountStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({
        connected: false,
        error: `Status check failed: ${(error as Error).message}`
      });
    }
  });

  // MightyCall Native API call initiation endpoint
  app.post("/api/mightycall/call", async (req, res) => {
    try {
      const { phoneNumber, contactName, extension, userId = 1 } = req.body;
      
      if (!phoneNumber) {
        return res.status(400).json({
          success: false,
          message: "Phone number is required"
        });
      }

      const callResponse = await mightyCallSimplified.generateCallString({
        phoneNumber,
        contactName,
        userId
      });

      console.log(`MightyCall Native API: ${phoneNumber} - ${callResponse.success ? 'Success' : 'Failed'}`);
      res.json(callResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: `Native API call failed: ${(error as Error).message}`
      });
    }
  });

  // MightyCall Native API connection test endpoint
  app.post("/api/mightycall/test-connection", async (req, res) => {
    try {
      const status = await mightyCallSimplified.getConnectionStatus();
      res.json({
        success: true,
        status: "Connected",
        message: "MightyCall Simplified integration active",
        accountStatus: status
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: `Native API connection test failed: ${(error as Error).message}`
      });
    }
  });

  // Contacts API
  app.get("/api/contacts", async (req, res) => {
    try {
      const contacts = await storage.getAllContacts();
      res.json(contacts);
    } catch (error) {
      console.error('Get contacts error:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/contacts/:id", async (req, res) => {
    try {
      const contact = await storage.getContact(parseInt(req.params.id));
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }
      res.json(contact);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/contacts", async (req, res) => {
    try {
      const validation = insertContactSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error });
      }
      const contact = await storage.createContact(validation.data);
      logAuditEvent("CREATE", "Contact", contact.id, 1, null, validation.data);
      res.json(contact);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.patch("/api/contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const oldContact = await storage.getContact(id);
      const contact = await storage.updateContact(id, req.body);
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }
      logAuditEvent("UPDATE", "Contact", id, 1, oldContact, req.body);
      res.json(contact);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.delete("/api/contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteContact(id);
      if (!deleted) {
        return res.status(404).json({ error: "Contact not found" });
      }
      logAuditEvent("DELETE", "Contact", id, 1);
      res.json({ success: true });
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

  const httpServer = createServer(app);
  return httpServer;
}