import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', { withCredentials: true });

export default function Inbox({ currentUser }) {
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState({});
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Join user room for notifications
  useEffect(() => {
    if (!currentUser) return;
    socket.emit('joinRoom', currentUser._id);
  }, [currentUser]);

  // Fetch all conversations for the owner (with last message)
  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    fetch(`/api/chat/user-with-last-message/${currentUser._id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch chats');
        return res.json();
      })
      .then(async (chats) => {
        setConversations(chats);
        // Fetch user info for each chat (buyer and owner) in parallel, limit to 10 at a time
        const userIds = Array.from(new Set(chats.map(c => c.buyerId === currentUser._id ? c.ownerId : c.buyerId)));
        const userInfo = {};
        const batchSize = 10;
        for (let i = 0; i < userIds.length; i += batchSize) {
          const batch = userIds.slice(i, i + batchSize);
          const results = await Promise.all(batch.map(async id => {
            const res = await fetch(`/api/user/${id}`);
            if (res.ok) return [id, await res.json()];
            return [id, null];
          }));
          results.forEach(([id, data]) => { if (data) userInfo[id] = data; });
        }
        setUsers(userInfo);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [currentUser]);

  // Listen for new messages and update conversations/messages
  useEffect(() => {
    const handleReceiveMessage = (msg) => {
      setConversations(prev => {
        let found = false;
        const updated = prev.map(conv => {
          if (conv._id === msg.roomId) {
            found = true;
            return {
              ...conv,
              lastMessage: msg,
            };
          }
          return conv;
        });
        if (!found) {
          fetch(`/api/chat/user-with-last-message/${currentUser._id}`)
            .then(res => res.json())
            .then(setConversations);
          return prev;
        }
        const idx = updated.findIndex(c => c._id === msg.roomId);
        if (idx > -1) {
          const [conv] = updated.splice(idx, 1);
          return [conv, ...updated];
        }
        return updated;
      });
      if (activeChat && msg.roomId === activeChat._id && msg.senderId !== currentUser._id) {
        setMessages(prev => {
          if (prev.length === 0 || prev[prev.length - 1].timestamp !== msg.timestamp || prev[prev.length - 1].text !== msg.text) {
            return [...prev, msg];
          }
          return prev;
        });
      }
    };
    socket.on('receiveMessage', handleReceiveMessage);
    return () => socket.off('receiveMessage', handleReceiveMessage);
  }, [currentUser, activeChat]);

  // Open a chat and fetch its messages from Message collection, join the chat room
  const openChat = (chat) => {
    setActiveChat(chat);
    socket.emit('joinRoom', chat._id); // Join the chat room for real-time updates
    fetch(`/api/chat/messages-table/${chat._id}`)
      .then(res => res.json())
      .then(setMessages);
  };

  // Send a message in the active chat
  const sendMessage = () => {
    if (!input.trim() || !activeChat) return;
    const msg = {
      sender: currentUser.username,
      text: input,
      timestamp: new Date().toISOString(),
      senderId: currentUser._id,
      roomId: activeChat._id,
    };
    socket.emit('sendMessage', { roomId: activeChat._id, message: msg });
    setMessages((prev) => {
      if (prev.length === 0 || prev[prev.length - 1].timestamp !== msg.timestamp || prev[prev.length - 1].text !== msg.text) {
        return [...prev, msg];
      }
      return prev;
    });
    setInput('');
  };

  return (
    <div className="flex bg-white border rounded mt-4 max-w-3xl mx-auto h-[400px] shadow-lg">
      {/* Conversation List */}
      <div className="w-1/3 border-r overflow-y-auto">
        <h2 className="text-lg font-bold p-2 border-b">Inbox</h2>
        {loading && <div className="p-2 text-blue-600">Loading...</div>}
        {error && <div className="p-2 text-red-600">{error}</div>}
        {!loading && !error && conversations.length === 0 && <div className="p-2">No messages yet.</div>}
        {conversations.map((conv, idx) => {
          const otherId = conv.buyerId === currentUser._id ? conv.ownerId : conv.buyerId;
          const user = users[otherId] || {};
          return (
            <div key={conv._id} className={`flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-100 ${activeChat && activeChat._id === conv._id ? 'bg-gray-200' : ''}`} onClick={() => openChat(conv)}>
              <img src={user.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} alt="avatar" className="w-10 h-10 rounded-full" />
              <div>
                <div className="font-semibold">{user.username || 'User'}</div>
                <div className="text-xs text-gray-500 truncate max-w-[120px]">{conv.lastMessage?.text || 'No messages yet.'}</div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            <div className="flex items-center gap-2 border-b p-2">
              <img src={users[(activeChat.buyerId === currentUser._id ? activeChat.ownerId : activeChat.buyerId)]?.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} alt="avatar" className="w-8 h-8 rounded-full" />
              <span className="font-semibold">{users[(activeChat.buyerId === currentUser._id ? activeChat.ownerId : activeChat.buyerId)]?.username || 'User'}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 bg-gray-50">
              {messages.map((msg, i) => (
                <div key={i} className={msg.senderId === currentUser._id ? 'text-right' : 'text-left'}>
                  <span className="inline-block bg-gray-200 rounded px-2 py-1 m-1">
                    <b>{msg.sender}:</b> {msg.text}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex border-t p-2">
              <input
                className="flex-1 border rounded px-2 py-1"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
              />
              <button onClick={sendMessage} className="ml-2 bg-blue-600 text-white px-3 py-1 rounded">Send</button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">Select a conversation</div>
        )}
      </div>
    </div>
  );
}
