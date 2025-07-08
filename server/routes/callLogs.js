
import express from 'express';

const callLogsRouter = express.Router();

callLogsRouter.get('/', (req, res) => {
  res.json({ message: 'Call logs route is working!' });
});

export default callLogsRouter;
