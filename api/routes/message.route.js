import express from 'express';
import { getMessagesByChatId, createMessage } from '../controllers/message.controller.js';

const router = express.Router();

// Get all messages for a chat (old + new)
router.get('/:chatId', getMessagesByChatId);

// Store a new message (for fallback, not used by socket.io)
router.post('/', createMessage);

export default router;
