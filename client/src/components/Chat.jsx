import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

export default function Chat({ listingId, ownerId }) {
  const { currentUser } = useSelector((state) => state.user);
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    async function fetchChat() {
      const res = await fetch('/api/chat/get-or-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, buyerId: currentUser._id }),
        credentials: 'include',
      });
      const data = await res.json();
      setChat(data);
      setMessages(data.messages || []);
    }
    if (listingId && currentUser) fetchChat();
  }, [listingId, currentUser]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const res = await fetch('/api/chat/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId: chat._id, senderId: currentUser._id, text: input }),
      credentials: 'include',
    });
    const data = await res.json();
    setMessages(data.messages);
    setInput('');
  };

  return (
    <div className='border rounded p-4 bg-white max-w-md mx-auto'>
      <div className='h-64 overflow-y-auto mb-2 bg-gray-50 p-2 rounded'>
        {messages.map((msg, i) => (
          <div key={i} className={`mb-1 ${msg.senderId === currentUser._id ? 'text-right' : 'text-left'}`}> 
            <span className='inline-block px-2 py-1 rounded bg-slate-200'>{msg.text}</span>
            <span className='text-xs text-gray-400 ml-2'>{new Date(msg.createdAt).toLocaleString()}</span>
          </div>
        ))}
      </div>
      <div className='flex gap-2'>
        <input
          className='flex-1 border rounded p-2'
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder='Type a message...'
        />
        <button className='bg-slate-700 text-white px-4 py-2 rounded' onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
