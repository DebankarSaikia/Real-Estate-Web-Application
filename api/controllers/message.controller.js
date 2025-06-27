import Message from '../models/message.model.js';

// Get all messages for a chat
export const getMessagesByChatId = async (req, res) => {
  try {
    const { chatId } = req.params;
    let messages = await Message.find({ chatId }).sort({ createdAt: 1 });
    // If no messages, create a welcome message
    if (!messages || messages.length === 0) {
      const welcomeMsg = await Message.create({
        chatId,
        senderId: 'system',
        text: 'Welcome to the chat! Start your conversation.',
      });
      messages = [welcomeMsg];
    }
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages', details: err.message });
  }
};

// Store a new message
export const createMessage = async (req, res) => {
  try {
    const { chatId, senderId, text } = req.body;
    if (!chatId || !senderId || !text) {
      return res.status(400).json({ error: 'chatId, senderId, and text are required' });
    }
    const message = await Message.create({ chatId, senderId, text });
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create message', details: err.message });
  }
};
