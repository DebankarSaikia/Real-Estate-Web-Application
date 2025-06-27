import { FaComments } from 'react-icons/fa';

export default function FloatingChatButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg flex items-center justify-center"
      title="Chat with Owner"
      style={{ width: 60, height: 60 }}
    >
      <FaComments size={28} />
    </button>
  );
}
