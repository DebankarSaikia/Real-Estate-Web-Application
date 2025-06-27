import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import socket from '../socket';

export default function GlobalChatNotifier({ onOpenChat }) {
  const currentUser = useSelector(state => state.user.currentUser);
  const [newMessage, setNewMessage] = useState(null);

  useEffect(() => {
    if (!currentUser?._id) return;
    const handleReceiveMessage = (msg) => {
      // Only notify if not the sender
      if (msg.senderId !== currentUser._id) {
        setNewMessage(msg);
      }
    };
    socket.on('receiveMessage', handleReceiveMessage);
    return () => socket.off('receiveMessage', handleReceiveMessage);
  }, [currentUser?._id]);

  if (!newMessage) return null;

  return (
    <div className="fixed bottom-24 right-4 bg-blue-600 text-white px-4 py-2 rounded shadow-lg z-50 cursor-pointer animate-bounce"
      onClick={() => {
        onOpenChat && onOpenChat(newMessage);
        setNewMessage(null);
      }}
    >
      New message from {newMessage.sender || 'User'}: {newMessage.text}
    </div>
  );
}
