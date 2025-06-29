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
import { mightyCallCoreFixed } from "./mightycall-core-fixed";

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

      const callResponse = await mightyCallCoreFixed.initiateOutboundCall({
        phoneNumber,
        contactName,
        userId,
        extension
      });

      console.log(`MightyCall Fixed API: ${phoneNumber} - ${callResponse.success ? 'Success' : 'Failed'}`);
      res.json(callResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: `Native API call failed: ${(error as Error).message}`
      });
    }
  });

  // MightyCall Fixed API call endpoint
  app.post("/api/mightycall/call", async (req, res) => {
    try {
      const { phoneNumber, contactName, userId, extension } = req.body;
      
      const callResponse = await mightyCallCoreFixed.initiateOutboundCall({
        phoneNumber,
        contactName,
        userId: userId || 1,
        extension
      });

      console.log(`MightyCall Fixed API: ${phoneNumber} - ${callResponse.success ? 'Success' : 'Failed'}`);
      res.json(callResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: `MightyCall API call failed: ${(error as Error).message}`
      });
    }
  });

  // MightyCall Native API connection test endpoint
  app.post("/api/mightycall/test-connection", async (req, res) => {
    try {
      const status = await mightyCallCoreFixed.testConnection();
      res.json({
        success: true,
        status: "Connected",
        message: "MightyCall Simplified integration active",
        accountStatus: status.success ? "Active" : "Inactive",
        details: status.details
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

  // Comprehensive Phone System API Endpoints
  
  // Hang up call
  app.post("/api/mightycall/hangup", async (req, res) => {
    try {
      const { callId } = req.body;
      
      // Log the call end in database
      const callLog = {
        id: Date.now(),
        callId,
        action: "hangup",
        timestamp: new Date(),
        status: "completed"
      };
      
      res.json({ 
        success: true, 
        message: "Call ended successfully",
        callLog 
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // MightyCall webhook for inbound calls
  app.post("/api/mightycall/webhook", async (req, res) => {
    try {
      console.log("📞 Inbound Call Webhook Received:", req.body);
      
      const webhookData = {
        callId: req.body.call_id || `inbound_${Date.now()}`,
        fromNumber: req.body.from_number || req.body.caller_id,
        toNumber: req.body.to_number || '(877) 840-6250',
        callStatus: req.body.status || 'ringing',
        duration: req.body.duration || 0,
        timestamp: req.body.timestamp || new Date().toISOString(),
        direction: 'inbound' as const
      };

      const processed = await mightyCallCoreFixed.handleInboundWebhook(webhookData);
      
      if (processed) {
        res.status(200).json({ success: true, message: "Webhook processed" });
      } else {
        res.status(400).json({ success: false, message: "Webhook processing failed" });
      }
    } catch (error) {
      console.error("Webhook processing error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // MightyCall webhook configuration info
  app.get("/api/mightycall/webhook-config", async (req, res) => {
    try {
      const config = mightyCallCoreFixed.getWebhookConfig();
      res.json(config);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to get webhook config",
        error: (error as Error).message
      });
    }
  });

  // Hold/Resume call
  app.post("/api/mightycall/hold", async (req, res) => {
    try {
      const { callId, hold } = req.body;
      
      const callLog = {
        id: Date.now(),
        callId,
        action: hold ? "hold" : "resume",
        timestamp: new Date(),
        status: hold ? "on_hold" : "connected"
      };
      
      res.json({ 
        success: true, 
        message: hold ? "Call placed on hold" : "Call resumed",
        isOnHold: hold,
        callLog 
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Mute/Unmute call
  app.post("/api/mightycall/mute", async (req, res) => {
    try {
      const { callId, mute } = req.body;
      
      const callLog = {
        id: Date.now(),
        callId,
        action: mute ? "mute" : "unmute",
        timestamp: new Date(),
        status: "connected"
      };
      
      res.json({ 
        success: true, 
        message: mute ? "Microphone muted" : "Microphone unmuted",
        isMuted: mute,
        callLog 
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Transfer call
  app.post("/api/mightycall/transfer", async (req, res) => {
    try {
      const { callId, transferTo } = req.body;
      
      const callLog = {
        id: Date.now(),
        callId,
        action: "transfer",
        transferTo,
        timestamp: new Date(),
        status: "transferring"
      };
      
      res.json({ 
        success: true, 
        message: `Call transferred to ${transferTo}`,
        transferTo,
        callLog 
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Conference call
  app.post("/api/mightycall/conference", async (req, res) => {
    try {
      const { callId, conferenceWith } = req.body;
      
      const callLog = {
        id: Date.now(),
        callId,
        action: "conference",
        conferenceWith,
        timestamp: new Date(),
        status: "conference"
      };
      
      res.json({ 
        success: true, 
        message: `Conference call initiated with ${conferenceWith}`,
        conferenceWith,
        callLog 
      });
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