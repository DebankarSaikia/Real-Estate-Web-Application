import http from 'http';
import { Server } from 'socket.io';
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import listingRouter from './routes/listing.route.js';
import chatRouter from './routes/chat.route.js';
import messageRouter from './routes/message.route.js';
import cookieParser from 'cookie-parser';
import path from 'path';
import Chat from './models/chat.model.js';
import Message from './models/message.model.js';
import { encrypt, decrypt } from './utils/chatCrypto.js';
dotenv.config();
console.log("MongoDB URI:", process.env.MONGO);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Connect to MongoDB before starting server
mongoose.connect(process.env.MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected to DB:', mongoose.connection.name);
    server.listen(3000, () => {
      console.log('Server is running on port 3000!');
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
  });

  socket.on('sendMessage', async ({ roomId, message }) => {
    try {
      console.log('sendMessage called:', { roomId, message });
      // Encrypt the message text
      const encryptedText = encrypt(message.text);
      // Try to find chat by _id
      let chat = await Chat.findById(roomId);
      if (chat) {
        console.log('Chat found by _id:', chat._id);
      } else {
        console.log('Chat not found by _id, trying fallback by ownerId, buyerId, listingId');
      }
      // Fallback: try to find by ownerId, buyerId, listingId if not found
      if (!chat && message.ownerId && message.buyerId && message.listingId) {
        chat = await Chat.findOne({ ownerId: message.ownerId, buyerId: message.buyerId, listingId: message.listingId });
        if (chat) {
          console.log('Chat found by fallback:', chat._id);
        } else {
          // If still not found, create the chat document
          chat = await Chat.create({
            ownerId: message.ownerId,
            buyerId: message.buyerId,
            listingId: message.listingId,
            messages: []
          });
          console.log('Chat created by fallback:', chat._id);
        }
      }
      if (chat) {
        // Save message in Message collection
        try {
          console.log('Attempting to store message:', { chatId: chat._id, senderId: message.senderId, text: encryptedText });
          await Message.create({
            chatId: chat._id,
            senderId: message.senderId,
            text: encryptedText,
          });
          console.log('Message stored in DB for chat:', chat._id);
        } catch (msgErr) {
          console.error('Error storing message in DB:', msgErr);
          if (msgErr.errors) {
            console.error('Validation errors:', msgErr.errors);
          }
        }
      } else {
        console.warn('No chat found or created for message:', message);
      }
      // Prepare message for clients (decrypt for delivery)
      const msgToSend = { ...message, text: message.text };
      // Emit to the chat room as before
      io.to(roomId).emit('receiveMessage', msgToSend);
      // Also emit to both buyer and owner user IDs for inbox updates
      if (message && message.senderId && roomId) { // FIXED: was message.roomId
        const ids = roomId.split('_');
        if (ids.length === 2) {
          io.to(ids[0]).emit('receiveMessage', msgToSend); // owner
          io.to(ids[1]).emit('receiveMessage', msgToSend); // buyer
        }
      }
    } catch (err) {
      console.error('Error saving/encrypting message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.use(express.json());
app.use(cookieParser());

// Register API routes BEFORE any static file serving
app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/listing', listingRouter);
app.use('/api/chat', chatRouter);
app.use('/api/message', messageRouter);

// (Optional) Only serve static files in production
// Uncomment below if you want to serve frontend from backend in production
// import fs from 'fs';
// if (process.env.NODE_ENV === 'production') {
//   const clientBuildPath = path.join(__dirname, '../client/dist');
//   app.use(express.static(clientBuildPath));
//   app.get('*', (req, res) => {
//     res.sendFile(path.join(clientBuildPath, 'index.html'));
//   });
// }
