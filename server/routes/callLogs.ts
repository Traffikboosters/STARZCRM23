import { Router } from 'express';
import { db } from '../db.js';
import { callLogs } from '@shared/schema';
import { eq, and, gte, lte, ilike, desc, sql } from 'drizzle-orm';

const router = Router();

router.get('/', async (req, res) => {
  const { userId, contact, startDate, endDate } = req.query;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  try {
    // Build base query conditions
    const conditions = [eq(callLogs.userId, parseInt(userId as string))];

    // Add contact filter - search in notes field for contact name
    if (contact) {
      conditions.push(ilike(callLogs.notes, `%${contact}%`));
    }

    // Add date range filters
    if (startDate) {
      conditions.push(gte(callLogs.startTime, new Date(startDate as string)));
    }
    if (endDate) {
      conditions.push(lte(callLogs.startTime, new Date(endDate as string)));
    }

    // Execute query with all conditions
    const logs = await db.select().from(callLogs)
      .where(and(...conditions))
      .orderBy(desc(callLogs.startTime));
    
    res.json(logs);
  } catch (err) {
    console.error('Error fetching filtered call logs:', err);
    res.status(500).json({ error: 'Error fetching filtered call logs' });
  }
});

router.post('/', async (req, res) => {
  const { contact, number, timestamp, outcome, userId, contactId, contactName, phoneNumber, duration, notes } = req.body;

  if (!contact || !number || !timestamp || !outcome || !userId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const callTimestamp = new Date(timestamp);
    const callLogData = {
      contactId: contactId ? parseInt(contactId) : null,
      userId: parseInt(userId),
      direction: 'outbound', // PowerDials calls are outbound
      status: 'answered', // Default status for completed calls
      phoneNumber: phoneNumber || number,
      startTime: callTimestamp,
      endTime: duration ? new Date(callTimestamp.getTime() + duration * 1000) : null,
      duration: duration || null,
      talkTime: duration || null,
      notes: notes || `Call with ${contact}`,
      outcome: outcome || 'completed',
      dialTimestamp: callTimestamp,
      callHour: callTimestamp.getHours(),
      callDate: callTimestamp.toISOString().split('T')[0],
      dialResult: outcome === 'completed' ? 'connected' : 'no_answer'
    };

    const [newCallLog] = await db.insert(callLogs).values(callLogData).returning();
    
    // Broadcast to WebSocket clients
    const io = req.app.get('io');
    if (io) {
      io.emit('call_log_created', newCallLog);
    }
    
    res.status(200).json(newCallLog);
  } catch (err) {
    console.error('Error saving call log:', err);
    res.status(500).json({ error: 'Error saving call log' });
  }
});

export default router;