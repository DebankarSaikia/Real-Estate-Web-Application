import Chat from '../models/chat.model.js';
import User from '../models/user.model.js';
import Listing from '../models/listing.model.js';
import Message from '../models/message.model.js';
import { errorHandler } from '../utils/error.js';
import { decrypt } from '../utils/chatCrypto.js';

// Get or create chat between buyer and owner for a listing
export const getOrCreateChat = async (req, res, next) => {
  const { listingId, buyerId } = req.body;
  try {
    const listing = await Listing.findById(listingId);
    if (!listing) return next(errorHandler(404, 'Listing not found'));
    const ownerId = listing.userRef;
    let chat = await Chat.findOne({ listingId, buyerId, ownerId });
    if (!chat) {
      chat = await Chat.create({ listingId, buyerId, ownerId, messages: [] });
    }
    res.status(200).json(chat);
  } catch (error) {
    next(error);
  }
};

// Send a message in a chat
export const sendMessage = async (req, res, next) => {
  const { chatId, senderId, text } = req.body;
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) return next(errorHandler(404, 'Chat not found'));
    chat.messages.push({ senderId, text });
    await chat.save();
    res.status(200).json(chat);
  } catch (error) {
    next(error);
  }
};

// Get all messages for a chat
export const getMessages = async (req, res, next) => {
  const { chatId } = req.params;
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) return next(errorHandler(404, 'Chat not found'));
    // Decrypt all messages
    const decryptedMessages = chat.messages.map(m => ({
      ...m.toObject(),
      text: decrypt(m.text)
    }));
    res.status(200).json(decryptedMessages);
  } catch (error) {
    next(error);
  }
};

// Get all messages for a chat from Message collection
export const getMessagesFromTable = async (req, res, next) => {
  const { chatId } = req.params;
  try {
    const messages = await Message.find({ chatId }).sort({ createdAt: 1 });
    const decryptedMessages = messages.map(m => ({
      ...m.toObject(),
      text: decrypt(m.text)
    }));
    res.status(200).json(decryptedMessages);
  } catch (error) {
    next(error);
  }
};

// Get all chats for a user
export const getUserChats = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const chats = await Chat.find({ $or: [ { buyerId: userId }, { ownerId: userId } ] });
    // Decrypt last message for preview
    const decryptedChats = chats.map(chat => {
      const chatObj = chat.toObject();
      if (chatObj.messages && chatObj.messages.length > 0) {
        chatObj.messages = chatObj.messages.map(m => ({ ...m, text: decrypt(m.text) }));
      }
      return chatObj;
    });
    res.status(200).json(decryptedChats);
  } catch (error) {
    next(error);
  }
};

// Get previous messages and check if any exist
export const getChatMessagesStatus = async (req, res, next) => {
  const { chatId } = req.params;
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ hasMessages: false, messages: [] });
    const messages = chat.messages.map(m => ({
      ...m.toObject(),
      text: require('../utils/chatCrypto.js').decrypt(m.text)
    }));
    res.status(200).json({ hasMessages: messages.length > 0, messages });
  } catch (error) {
    next(error);
  }
};

// Get last message for each chat for a user (for inbox preview)
export const getUserChatsWithLastMessage = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const chats = await Chat.find({ $or: [ { buyerId: userId }, { ownerId: userId } ] });
    const result = await Promise.all(chats.map(async chat => {
      const lastMsg = await Message.findOne({ chatId: chat._id }).sort({ createdAt: -1 });
      return {
        ...chat.toObject(),
        lastMessage: lastMsg ? { ...lastMsg.toObject(), text: require('../utils/chatCrypto.js').decrypt(lastMsg.text) } : null
      };
    }));
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
