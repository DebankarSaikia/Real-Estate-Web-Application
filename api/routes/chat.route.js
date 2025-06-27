import express from 'express';
import { getOrCreateChat, sendMessage, getMessages, getUserChats, getChatMessagesStatus, getMessagesFromTable, getUserChatsWithLastMessage } from '../controllers/chat.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/get-or-create', verifyToken, getOrCreateChat);
router.post('/send', verifyToken, sendMessage);
router.get('/messages/:chatId', verifyToken, getMessages);
router.get('/user/:userId', verifyToken, getUserChats);
router.get('/messages-status/:chatId', verifyToken, getChatMessagesStatus);
router.get('/messages-table/:chatId', verifyToken, getMessagesFromTable);
router.get('/user-with-last-message/:userId', verifyToken, getUserChatsWithLastMessage);

export default router;
