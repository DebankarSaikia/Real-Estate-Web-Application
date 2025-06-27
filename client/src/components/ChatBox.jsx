import { useEffect, useRef, useState } from "react";
import socket from "../socket";

export default function ChatBox({ chatId, currentUser, landlord, onClose, listingId, ownerId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!chatId) return;
    // 1. Join the room for real-time updates
    socket.emit("joinRoom", chatId);

    // 2. Fetch all old messages for this chat, with error handling
    fetch(`/api/message/${chatId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch messages');
        return res.json();
      })
      .then(setMessages)
      .catch(err => {
        setMessages([]); // fallback to empty array
        // Optionally, show a toast or error message to the user
        console.error('Error fetching messages:', err);
      });

    // 3. Listen for new real-time messages
    const handleReceiveMessage = (msg) => {
      if (msg.roomId === chatId && msg.senderId !== currentUser._id) {
        setMessages((prev) => {
          if (prev.length === 0 || prev[prev.length - 1].timestamp !== msg.timestamp || prev[prev.length - 1].text !== msg.text) {
            return [...prev, msg];
          }
          return prev;
        });
      }
    };
    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.emit("leaveRoom", chatId);
    };
  }, [chatId, currentUser._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (input.trim()) {
      const msg = {
        sender: currentUser.username,
        text: input,
        timestamp: new Date().toISOString(),
        senderId: currentUser._id,
        roomId: chatId,
        ownerId: ownerId,
        buyerId: currentUser._id,
        listingId: listingId,
      };
      console.log('Socket connected:', socket.connected);
      console.log('Sending message to backend:', msg);
      socket.emit("sendMessage", { roomId: chatId, message: msg });
      setMessages((prev) => {
        if (prev.length === 0 || prev[prev.length - 1].timestamp !== msg.timestamp || prev[prev.length - 1].text !== msg.text) {
          return [...prev, msg];
        }
        return prev;
      });
      setInput("");
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border rounded-lg shadow-lg w-80 z-50 flex flex-col">
      <div className="p-2 border-b flex justify-between items-center">
        <span>Chat with {landlord?.username || "Owner"}</span>
        <button onClick={onClose} className="text-red-500">✖</button>
      </div>
      <div className="flex-1 overflow-y-auto p-2" style={{ maxHeight: 300 }}>
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.sender === currentUser.username ? "text-right" : "text-left"}>
            <div className="inline-block bg-gray-200 rounded px-2 py-1 m-1">
              <b>{msg.sender}:</b> {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex p-2 border-t">
        <input
          className="flex-1 border rounded px-2 py-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} className="ml-2 bg-blue-600 text-white px-3 py-1 rounded">
          Send
        </button>
      </div>
    </div>
  );
}
