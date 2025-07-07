const express = require('express');
const router = express.Router();

// Import the storage instance from the parent directory
const { storage } = require('../storage');

// Get all call logs
router.get('/', async (req, res) => {
  try {
    const callLogs = await storage.getCallLogs();
    res.json(callLogs);
  } catch (error) {
    console.error('Error fetching call logs:', error);
    res.status(500).json({ error: 'Failed to fetch call logs' });
  }
});

// Create a new call log
router.post('/', async (req, res) => {
  try {
    const callLog = await storage.createCallLog(req.body);
    res.status(201).json(callLog);
  } catch (error) {
    console.error('Error creating call log:', error);
    res.status(500).json({ error: 'Failed to create call log' });
  }
});

// Get call logs for a specific contact
router.get('/contact/:contactId', async (req, res) => {
  try {
    const contactId = parseInt(req.params.contactId);
    const callLogs = await storage.getCallLogsByContact(contactId);
    res.json(callLogs);
  } catch (error) {
    console.error('Error fetching call logs for contact:', error);
    res.status(500).json({ error: 'Failed to fetch call logs for contact' });
  }
});

// Get call logs for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const callLogs = await storage.getCallLogsByUser(userId);
    res.json(callLogs);
  } catch (error) {
    console.error('Error fetching call logs for user:', error);
    res.status(500).json({ error: 'Failed to fetch call logs for user' });
  }
});

// Delete a call log
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const success = await storage.deleteCallLog(id);
    if (success) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Call log not found' });
    }
  } catch (error) {
    console.error('Error deleting call log:', error);
    res.status(500).json({ error: 'Failed to delete call log' });
  }
});

module.exports = router;