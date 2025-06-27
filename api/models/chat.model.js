// Simple chat model for buyer-owner chat
import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
  {
    listingId: { type: String, required: true },
    buyerId: { type: String, required: true },
    ownerId: { type: String, required: true },
    messages: [
      {
        senderId: { type: String, required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
